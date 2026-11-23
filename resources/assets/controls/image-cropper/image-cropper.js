/*
 * Image cropper control
 *
 * Picks the part of an image to keep, in one of two modes.
 *
 * In frame mode, the default, a frame the shape of a target size stays put and the image moves
 * beneath it, eg: a banner at 1674x696. The image is dragged to move it and zoomed with the mouse
 * wheel or the + and - keys, and the arrow keys move it too.
 *
 * In select mode the whole image shows and a selection is moved and resized over it by its handles,
 * or drawn again by dragging outside it. The selection is any shape, or one shape when an aspect
 * ratio or a target size is set. The arrow keys move it a pixel of the image, ten with Shift.
 *
 * The part kept is saved at its own size, up to the target size, so an image is never made larger
 * than it is.
 *
 * JavaScript API:
 *
 *     import { ImageCropper, cropImageFile } from './controls/image-cropper/image-cropper.js';
 *
 *     const cropper = new ImageCropper(element, { width: 1674, height: 696 });
 *     cropper.setImage(image);
 *     cropper.getSelection();    // { x, y, width, height } in the image's own pixels
 *     cropper.getOutputSize();   // { width, height } the part is saved at
 *     cropper.toFile(file);      // a promise of the cropped file
 *
 *     const selector = new ImageCropper(element, { mode: 'select', aspectRatio: 16 / 9 });
 *     selector.setOptions({ aspectRatio: null });
 *
 *     // Crops a picked file in a popup, unless it is the shape already
 *     const cropped = await cropImageFile(file, { width: 1674, height: 696, template });
 *
 * Events, dispatched on the element with detail { cropper, selection, output }:
 * - image-cropper:change - the part kept has moved or changed size
 *
 * Popup template hooks, see cropInPopup:
 * - data-cropper-stage - the element the cropper is drawn in, data-label names it for screen readers
 * - data-cropper-zoom - a range input from 0 to 100, Bootstrap's form-range-input shows its fill
 * - data-cropper-output - shows the size the part is saved at
 * - data-cropper-small - shown while the part is small enough to look blurry
 * - data-cropper-animated - shown for an image that loses its animation
 * - data-cropper-apply - the button that crops
 */
'use strict';

import { Popup } from '../popup/popup.js';

// Types a canvas saves, with the extension a file takes when its type changes
const CANVAS_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
};

// Shapes this close are the same, a small image is a pixel out from rounding
const SHAPE_TOLERANCE = 0.01;

// Tallest the frame is drawn, when the stylesheet sets no max-height
const FRAME_MAX_HEIGHT = 360;

// The handles of a selection, by the sides they move
const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

// Smallest a selection is drawn, and how far a drag goes before it draws one, in screen pixels
const SELECTION_MIN_SIZE = 12;
const DRAW_THRESHOLD = 4;

export class ImageCropper
{
    static DEFAULTS = {
        mode: 'frame',
        width: null,
        height: null,
        aspectRatio: null,
        maxZoom: 4,
        label: null
    };

    constructor(element, options) {
        this.element = element;
        this.options = Object.assign({}, ImageCropper.DEFAULTS, options);
        this.isSelect = this.options.mode === 'select';
        this.image = null;
        this.drag = null;

        // The frame's size, and the image's scale and position within it
        this.view = { width: 0, height: 0, scale: 1, minScale: 1, x: 0, y: 0 };

        // In select mode, the part picked in the image's own pixels
        this.selection = null;

        this.build();
        this.bindEvents();
    }

    dispose() {
        this.listeners.abort();

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        this.element.classList.remove('image-cropper', 'is-select');
        this.element.replaceChildren();

        this.resizeObserver = null;
        this.listeners = null;
        this.selectionBox = null;
        this.shade = null;
        this.preview = null;
        this.frame = null;
        this.area = null;
        this.image = null;
        this.element = null;
    }

    build() {
        this.area = document.createElement('div');
        this.area.className = 'image-cropper-area';

        this.frame = document.createElement('div');
        this.frame.className = 'image-cropper-frame';
        this.frame.tabIndex = 0;

        if (this.options.label) {
            this.frame.setAttribute('aria-label', this.options.label);
        }

        this.preview = document.createElement('img');
        this.preview.alt = '';
        this.preview.draggable = false;
        this.frame.appendChild(this.preview);

        if (this.isSelect) {
            this.shade = document.createElement('div');
            this.shade.className = 'image-cropper-shade';

            this.selectionBox = document.createElement('div');
            this.selectionBox.className = 'image-cropper-selection';

            HANDLES.forEach((name) => {
                const handle = document.createElement('span');
                handle.className = 'image-cropper-handle';
                handle.dataset.handle = name;
                this.selectionBox.appendChild(handle);
            });

            this.frame.append(this.shade, this.selectionBox);
        }

        this.area.appendChild(this.frame);

        this.element.classList.add('image-cropper');
        this.element.classList.toggle('is-select', this.isSelect);
        this.element.replaceChildren(this.area);
    }

    bindEvents() {
        this.listeners = new AbortController();

        const signal = this.listeners.signal;

        const listen = (eventName, handler, options) => {
            this.frame.addEventListener(eventName, handler, Object.assign({ signal }, options));
        };

        listen('pointerdown', (ev) => this.onPointerDown(ev));
        listen('pointermove', (ev) => this.onPointerMove(ev));
        listen('pointerup', () => this.onPointerUp());
        listen('pointercancel', () => this.onPointerUp());
        listen('keydown', (ev) => this.onKeydown(ev));

        if (!this.isSelect) {
            listen('wheel', (ev) => this.onWheel(ev), { passive: false });
        }

        // The frame follows the room it is given, such as a popup in a smaller window
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => {
                if (this.area.clientWidth !== this.areaWidth) {
                    this.layout();
                }
            });

            this.resizeObserver.observe(this.area);
        }

        window.addEventListener('resize', () => this.layout(), { signal });
    }

    /**
     * setImage shows a loaded image: fitted across the frame, or whole
     * with a selection as large as its shape allows.
     */
    setImage(image) {
        this.image = image;
        this.preview.src = image.src;
        this.view.width = 0;
        this.selection = null;
        this.layout();
    }

    /**
     * setOptions changes the target size or the aspect ratio, and fits the part kept to it.
     */
    setOptions(options) {
        Object.assign(this.options, options);

        if (!this.image || !this.view.width) {
            return;
        }

        if (this.isSelect) {
            this.selection = this.fitSelection(this.selection);
            this.render();
        }
        else {
            this.view.width = 0;
            this.layout();
        }
    }

    /**
     * getAspectRatio returns the shape of the part kept as width over height, a
     * target size's when there is one, or null for any shape.
     */
    getAspectRatio() {
        const { width, height, aspectRatio } = this.options;

        return width && height ? width / height : (aspectRatio || null);
    }

    /**
     * layout sizes the frame to the room it has. The part in view stays in view.
     */
    layout() {
        this.areaWidth = this.area.clientWidth;

        if (!this.image || !this.areaWidth) {
            return;
        }

        const maxHeight = parseFloat(getComputedStyle(this.frame).maxHeight) || FRAME_MAX_HEIGHT;

        if (this.isSelect) {
            this.layoutSelect(maxHeight);
        }
        else if (this.getAspectRatio()) {
            this.layoutFrame(maxHeight);
        }
    }

    // The frame is the shape, as wide as fits, and a new image covers it from its middle
    layoutFrame(maxHeight) {
        const view = this.view,
            ratio = this.getAspectRatio(),
            zoom = view.width ? view.scale / view.minScale : 1,
            middle = view.width
                ? { x: (view.width / 2 - view.x) / view.scale, y: (view.height / 2 - view.y) / view.scale }
                : { x: this.image.naturalWidth / 2, y: this.image.naturalHeight / 2 };

        view.width = Math.min(this.areaWidth, maxHeight * ratio);
        view.height = view.width / ratio;
        view.minScale = Math.max(view.width / this.image.naturalWidth, view.height / this.image.naturalHeight);
        view.scale = view.minScale * zoom;
        view.x = view.width / 2 - middle.x * view.scale;
        view.y = view.height / 2 - middle.y * view.scale;

        this.frame.style.width = view.width + 'px';
        this.frame.style.height = view.height + 'px';

        this.render();
    }

    // The frame is the whole image, as large as fits and no larger than it is
    layoutSelect(maxHeight) {
        const view = this.view,
            bounds = this.getBounds();

        view.scale = Math.min(1, this.areaWidth / bounds.width, maxHeight / bounds.height);
        view.width = bounds.width * view.scale;
        view.height = bounds.height * view.scale;

        this.frame.style.width = view.width + 'px';
        this.frame.style.height = view.height + 'px';

        if (!this.selection) {
            this.selection = this.fitSelection(null);
        }

        this.render();
    }

    // Draws the part kept where it is, and announces it
    render() {
        const view = this.view;

        if (this.isSelect) {
            const box = scaleRect(this.selection, view.scale);

            this.selectionBox.style.left = box.x + 'px';
            this.selectionBox.style.top = box.y + 'px';
            this.selectionBox.style.width = box.width + 'px';
            this.selectionBox.style.height = box.height + 'px';

            // The shade covers the image with a hole where the selection is
            this.shade.style.clipPath = `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, `
                + `${box.x}px ${box.y}px, ${box.x + box.width}px ${box.y}px, ${box.x + box.width}px ${box.y + box.height}px, `
                + `${box.x}px ${box.y + box.height}px, ${box.x}px ${box.y}px)`;
        }
        else {
            const imageWidth = this.image.naturalWidth * view.scale,
                imageHeight = this.image.naturalHeight * view.scale;

            // The image always covers the frame
            view.x = Math.min(0, Math.max(view.width - imageWidth, view.x));
            view.y = Math.min(0, Math.max(view.height - imageHeight, view.y));

            this.preview.style.width = imageWidth + 'px';
            this.preview.style.height = imageHeight + 'px';
            this.preview.style.transform = `translate(${view.x}px, ${view.y}px)`;
        }

        this.element.dispatchEvent(new CustomEvent('image-cropper:change', {
            bubbles: true,
            detail: { cropper: this, selection: this.getSelection(), output: this.getOutputSize() }
        }));
    }

    /**
     * zoomTo scales the image in frame mode, keeping the point of the
     * frame at the origin in place, the middle by default.
     */
    zoomTo(scale, originX = this.view.width / 2, originY = this.view.height / 2) {
        const view = this.view;

        if (this.isSelect || !this.image || !view.width) {
            return;
        }

        scale = Math.min(view.minScale * this.options.maxZoom, Math.max(view.minScale, scale));

        view.x = originX - (originX - view.x) * scale / view.scale;
        view.y = originY - (originY - view.y) * scale / view.scale;
        view.scale = scale;

        this.render();
    }

    /**
     * moveBy moves the image in frame mode by a distance in screen pixels, and
     * the selection in select mode by a distance in the image's pixels.
     */
    moveBy(x, y) {
        if (!this.image || !this.view.width) {
            return;
        }

        if (this.isSelect) {
            this.selection = clampRect(
                Object.assign({}, this.selection, { x: this.selection.x + x, y: this.selection.y + y }),
                this.getBounds()
            );
        }
        else {
            this.view.x += x;
            this.view.y += y;
        }

        this.render();
    }

    /**
     * getZoom returns the zoom from 0, the whole image across the frame, to 100.
     */
    getZoom() {
        return Math.round((this.view.scale / this.view.minScale - 1) / (this.options.maxZoom - 1) * 100);
    }

    setZoom(value) {
        this.zoomTo(this.view.minScale * (1 + (this.options.maxZoom - 1) * value / 100));
    }

    /**
     * getSelection returns the part kept, in the image's own pixels.
     */
    getSelection() {
        const view = this.view;

        if (this.isSelect) {
            return Object.assign({}, this.selection);
        }

        return {
            x: (0 - view.x) / view.scale,
            y: (0 - view.y) / view.scale,
            width: view.width / view.scale,
            height: view.height / view.scale
        };
    }

    /**
     * setSelection picks a part in select mode, moved inside the image and fitted to the shape.
     */
    setSelection(selection) {
        if (!this.isSelect || !this.image || !this.view.width) {
            return;
        }

        this.selection = this.fitSelection(selection);
        this.render();
    }

    /**
     * getOutputSize returns the size the part is saved at: its own, up to the target size.
     */
    getOutputSize() {
        const { width, height } = this.options,
            selection = this.getSelection();

        if (!width || !height) {
            return {
                width: Math.max(1, Math.round(selection.width)),
                height: Math.max(1, Math.round(selection.height))
            };
        }

        const outputWidth = Math.max(1, Math.min(width, Math.round(selection.width)));

        return {
            width: outputWidth,
            height: Math.max(1, Math.round(outputWidth * height / width))
        };
    }

    /**
     * toFile draws the part kept as a file named after the given one.
     */
    toFile(file) {
        const output = this.getOutputSize();

        return drawImageFile(this.image, file, output.width, output.height, this.getSelection());
    }

    focus() {
        this.frame.focus();
    }

    // The image's size, which a selection stays inside
    getBounds() {
        return { width: this.image.naturalWidth, height: this.image.naturalHeight };
    }

    // A selection inside the image in the shape set, by default the largest there is
    fitSelection(selection) {
        const bounds = this.getBounds(),
            ratio = this.getAspectRatio();

        if (!selection) {
            return largestRect(bounds, ratio);
        }

        if (!ratio) {
            return clampRect(selection, bounds);
        }

        // As wide as it was, where the image is tall enough for the shape
        const fitted = largestRect({ width: Math.min(selection.width, bounds.width), height: bounds.height }, ratio);

        return clampRect({
            x: selection.x + (selection.width - fitted.width) / 2,
            y: selection.y + (selection.height - fitted.height) / 2,
            width: fitted.width,
            height: fitted.height
        }, bounds);
    }

    // Where the pointer is on the image, in the image's own pixels
    getPointerPoint(ev) {
        const rect = this.frame.getBoundingClientRect(),
            bounds = this.getBounds();

        return {
            x: Math.min(bounds.width, Math.max(0, (ev.clientX - rect.left) / this.view.scale)),
            y: Math.min(bounds.height, Math.max(0, (ev.clientY - rect.top) / this.view.scale))
        };
    }

    onPointerDown(ev) {
        if (ev.button !== 0 || !this.image || !this.view.width) {
            return;
        }

        if (this.isSelect) {
            this.drag = this.makeSelectionDrag(ev);
        }
        else {
            this.drag = { x: ev.clientX - this.view.x, y: ev.clientY - this.view.y };
        }

        this.frame.setPointerCapture(ev.pointerId);
        this.frame.classList.add('is-dragging');
    }

    // A handle resizes from the corner or side opposite it, the selection itself
    // moves, and a drag that starts outside draws a new one
    makeSelectionDrag(ev) {
        const selection = this.selection,
            point = this.getPointerPoint(ev),
            handle = ev.target.closest('.image-cropper-handle');

        if (handle && handle.dataset.handle.length === 2) {
            const [vertical, horizontal] = handle.dataset.handle;

            return {
                type: 'corner',
                anchor: {
                    x: horizontal === 'w' ? selection.x + selection.width : selection.x,
                    y: vertical === 'n' ? selection.y + selection.height : selection.y
                }
            };
        }

        if (handle) {
            return { type: 'side', side: handle.dataset.handle, start: Object.assign({}, selection) };
        }

        if (ev.target.closest('.image-cropper-selection')) {
            return { type: 'move', point, start: Object.assign({}, selection) };
        }

        return { type: 'draw', anchor: point, origin: { x: ev.clientX, y: ev.clientY } };
    }

    onPointerMove(ev) {
        const drag = this.drag;

        if (!drag) {
            return;
        }

        if (!this.isSelect) {
            this.view.x = ev.clientX - drag.x;
            this.view.y = ev.clientY - drag.y;
            this.render();
            return;
        }

        const point = this.getPointerPoint(ev),
            bounds = this.getBounds(),
            ratio = this.getAspectRatio(),
            minSize = Math.max(1, SELECTION_MIN_SIZE / this.view.scale);

        // A click outside the selection leaves it alone
        if (drag.type === 'draw') {
            if (Math.hypot(ev.clientX - drag.origin.x, ev.clientY - drag.origin.y) < DRAW_THRESHOLD) {
                return;
            }

            drag.type = 'corner';
        }

        if (drag.type === 'move') {
            this.selection = clampRect(Object.assign({}, drag.start, {
                x: drag.start.x + point.x - drag.point.x,
                y: drag.start.y + point.y - drag.point.y
            }), bounds);
        }
        else if (drag.type === 'corner') {
            this.selection = cornerRect(drag.anchor, point, ratio, bounds, minSize);
        }
        else {
            this.selection = sideRect(drag.start, drag.side, point, ratio, bounds, minSize);
        }

        this.render();
    }

    onPointerUp() {
        this.drag = null;
        this.frame.classList.remove('is-dragging');
    }

    // The wheel zooms on the point under the pointer
    onWheel(ev) {
        ev.preventDefault();

        const rect = this.frame.getBoundingClientRect();

        this.zoomTo(this.view.scale * (ev.deltaY < 0 ? 1.1 : 1 / 1.1), ev.clientX - rect.left, ev.clientY - rect.top);
    }

    onKeydown(ev) {
        const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] },
            step = this.isSelect ? (ev.shiftKey ? 10 : 1) : 10;

        if (moves[ev.key]) {
            this.moveBy(moves[ev.key][0] * step, moves[ev.key][1] * step);
        }
        else if (this.isSelect) {
            return;
        }
        else if (ev.key === '+' || ev.key === '=') {
            this.zoomTo(this.view.scale * 1.1);
        }
        else if (ev.key === '-') {
            this.zoomTo(this.view.scale / 1.1);
        }
        else {
            return;
        }

        ev.preventDefault();
    }
}

/**
 * cropImageFile returns the file to upload for a target size: the file as it is when
 * the image is the shape already and no larger, a copy scaled down when it is the shape
 * and larger, or the part picked in a crop popup. Resolves with null when the popup is
 * closed, and rejects for a file the browser cannot read as an image.
 *
 * Options: width and height of the target size, template for the popup's markup and
 * titleSuffix to add to its title, eg: 2/3.
 */
export async function cropImageFile(file, options) {
    const { width, height } = options,
        image = await loadImageFile(file);

    if (!image.naturalWidth || !image.naturalHeight) {
        return file;
    }

    const ratio = width / height,
        isShape = Math.abs(image.naturalWidth / image.naturalHeight - ratio) / ratio <= SHAPE_TOLERANCE,
        fits = image.naturalWidth <= width && image.naturalHeight <= height,
        isAnimated = file.type === 'image/gif';

    // An image the shape already has nothing to crop. One small enough to look blurry still
    // shows the popup, for its warning, and so does an animation too large to keep, since
    // scaling it down loses the animation.
    if (isShape && image.naturalWidth >= width / 2 && (fits || !isAnimated)) {
        return fits ? file : drawImageFile(image, file, width, height);
    }

    if (!options.template) {
        return file;
    }

    return cropInPopup(image, file, options);
}

/**
 * cropInPopup shows a loaded image in a crop popup built from a template, and
 * resolves with the cropped file, or null when the popup is closed without one.
 */
export function cropInPopup(image, file, options) {
    return new Promise((resolve) => {
        const popup = Popup.open({ content: options.template });

        // No dialog support, the file goes as it is
        if (!popup) {
            resolve(file);
            return;
        }

        const dialog = popup.container,
            trigger = popup.el,
            stage = dialog.querySelector('[data-cropper-stage]'),
            zoom = dialog.querySelector('[data-cropper-zoom]'),
            output = dialog.querySelector('[data-cropper-output]'),
            small = dialog.querySelector('[data-cropper-small]'),
            animated = dialog.querySelector('[data-cropper-animated]'),
            apply = dialog.querySelector('[data-cropper-apply]'),
            title = dialog.querySelector('.dialog-title');

        const cropper = new ImageCropper(stage, {
            width: options.width,
            height: options.height,
            label: stage.dataset.label
        });

        let result = null;

        if (title && options.titleSuffix) {
            title.textContent = `${title.textContent.trim()} (${options.titleSuffix})`;
        }

        if (animated) {
            animated.hidden = file.type !== 'image/gif';
        }

        stage.addEventListener('image-cropper:change', (ev) => {
            const size = ev.detail.output;

            // Bootstrap's range fills its track up to this share
            if (zoom) {
                zoom.value = cropper.getZoom();
                zoom.style.setProperty('--range-fill', zoom.value / 100);
            }

            if (output) {
                output.textContent = `${size.width} × ${size.height}px`;
            }

            // Under half the target size, the size it is likely shown at
            if (small) {
                small.hidden = size.width >= options.width / 2;
            }
        });

        if (zoom) {
            zoom.addEventListener('input', () => cropper.setZoom(zoom.value));
        }

        apply.addEventListener('click', () => {
            apply.disabled = true;

            // An image the canvas cannot save goes as it is
            cropper.toFile(file).catch(() => file).then((cropped) => {
                result = cropped;
                popup.hide();
            });
        });

        trigger.addEventListener('popup:shown', () => cropper.focus());

        trigger.addEventListener('popup:hidden', () => {
            cropper.dispose();
            resolve(result);
        });

        cropper.setImage(image);
    });
}

/**
 * loadImageFile reads a file as an image. A data address is used since a
 * Content Security Policy often allows those for images and not blob addresses.
 */
export function loadImageFile(file) {
    return new Promise((resolve, reject) => {
        const failed = () => reject(new Error(`The file ${file.name} could not be read as an image.`)),
            reader = new FileReader();

        reader.onload = () => {
            const image = new Image();

            image.onload = () => resolve(image);
            image.onerror = failed;
            image.src = reader.result;
        };

        reader.onerror = failed;
        reader.readAsDataURL(file);
    });
}

/**
 * drawImageFile draws an image at a size as a file named after the given one, the whole
 * image or the part given as { x, y, width, height }. A JPEG, PNG or WebP keeps its type
 * where the browser can save it, and anything else becomes a PNG, for its transparency.
 */
export function drawImageFile(image, file, width, height, part = null) {
    const canvas = document.createElement('canvas'),
        type = CANVAS_TYPES[file.type] ? file.type : 'image/png';

    canvas.width = width;
    canvas.height = height;

    part = part || { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight };

    const context = canvas.getContext('2d');
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, part.x, part.y, part.width, part.height, 0, 0, width, height);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error(`The file ${file.name} could not be saved as an image.`));
                return;
            }

            // The browser saves a PNG in place of a type it cannot write
            const name = blob.type === file.type
                ? file.name
                : file.name.replace(/\.[^.]+$/, '') + (CANVAS_TYPES[blob.type] || '.png');

            resolve(new File([blob], name, { type: blob.type }));
        }, type, 0.9);
    });
}

//
// Selection geometry, in the image's own pixels
//

function scaleRect(rect, scale) {
    return { x: rect.x * scale, y: rect.y * scale, width: rect.width * scale, height: rect.height * scale };
}

// Moves a rectangle inside the bounds
function clampRect(rect, bounds) {
    return Object.assign({}, rect, {
        x: Math.min(Math.max(0, rect.x), bounds.width - rect.width),
        y: Math.min(Math.max(0, rect.y), bounds.height - rect.height)
    });
}

// The largest rectangle of a shape in the middle of the bounds
function largestRect(bounds, ratio) {
    let width = bounds.width,
        height = bounds.height;

    if (ratio && width / height > ratio) {
        width = height * ratio;
    }
    else if (ratio) {
        height = width / ratio;
    }

    return { x: (bounds.width - width) / 2, y: (bounds.height - height) / 2, width, height };
}

// The rectangle from a fixed corner to the pointer. In a shape, it follows
// whichever way the pointer has gone further, as far as the bounds allow.
function cornerRect(anchor, point, ratio, bounds, minSize) {
    const room = (towardsEnd, position, size) => towardsEnd ? size - position : position;

    let right = point.x >= anchor.x,
        down = point.y >= anchor.y;

    // With no room on the pointer's side, it grows on the other
    if (room(right, anchor.x, bounds.width) < minSize) {
        right = !right;
    }

    if (room(down, anchor.y, bounds.height) < minSize) {
        down = !down;
    }

    const maxWidth = room(right, anchor.x, bounds.width),
        maxHeight = room(down, anchor.y, bounds.height);

    let width = Math.min(maxWidth, Math.max(minSize, Math.abs(point.x - anchor.x))),
        height = Math.min(maxHeight, Math.max(minSize, Math.abs(point.y - anchor.y)));

    if (ratio) {
        width = Math.min(Math.max(width, height * ratio), maxWidth, maxHeight * ratio);
        height = width / ratio;
    }

    return {
        x: right ? anchor.x : anchor.x - width,
        y: down ? anchor.y : anchor.y - height,
        width,
        height
    };
}

// The rectangle with one side moved to the pointer, the side opposite staying
// put. In a shape, the other two sides move in or out evenly about the middle.
function sideRect(rect, side, point, ratio, bounds, minSize) {
    // The left and right sides are the top and bottom of the rectangle on its side
    if (side === 'e' || side === 'w') {
        return flipRect(sideRect(
            flipRect(rect),
            side === 'w' ? 'n' : 's',
            { x: point.y, y: point.x },
            ratio ? 1 / ratio : null,
            { width: bounds.height, height: bounds.width },
            minSize
        ));
    }

    const down = side === 's',
        anchor = down ? rect.y : rect.y + rect.height,
        maxHeight = down ? bounds.height - anchor : anchor;

    let height = Math.min(maxHeight, Math.max(minSize, down ? point.y - anchor : anchor - point.y)),
        width = rect.width,
        x = rect.x;

    if (ratio) {
        const middle = rect.x + rect.width / 2;

        width = Math.min(height * ratio, 2 * Math.min(middle, bounds.width - middle));
        height = width / ratio;
        x = middle - width / 2;
    }

    return { x, y: down ? anchor : anchor - height, width, height };
}

function flipRect(rect) {
    return { x: rect.y, y: rect.x, width: rect.height, height: rect.width };
}
