import { NodeSelection } from '@tiptap/pm/state';
import { closeHistory } from '@tiptap/pm/history';
import { h } from './dom.js';
import { selectedNode, selectedNodeElement } from '../commands/helpers.js';

const MIN_WIDTH = 16;

const CORNERS = ['nw', 'ne', 'sw', 'se'];

/**
 * ImageResizer drags corner handles to set an image's width.
 */
export class ImageResizer {
    constructor(richArea) {
        this.richArea = richArea;
        this.image = null;
        this.drag = null;

        this.element = h('div', { className: 'rich-editor-resizer', 'aria-hidden': 'true', hidden: true },
            CORNERS.map((corner) => h('span', { className: 'rich-editor-resizer-handle is-' + corner, 'data-corner': corner }))
        );

        this.position = this.position.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onPointerCancel = this.onPointerCancel.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);

        this.element.addEventListener('mousedown', (event) => event.preventDefault());
        this.element.addEventListener('pointerdown', this.onPointerDown);
        this.element.addEventListener('pointermove', this.onPointerMove);
        this.element.addEventListener('pointerup', this.onPointerUp);
        this.element.addEventListener('pointercancel', this.onPointerCancel);
        this.element.addEventListener('lostpointercapture', this.onPointerUp);

        this.observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(this.position) : null;

        richArea.bodyElement.appendChild(this.element);
    }

    /**
     * update shows the handles while an image is selected and editable.
     */
    update() {
        if (this.drag) {
            return;
        }

        const re = this.richArea;
        const enabled = re.options.imageResize && re.editor.isEditable && !re.sourceView.isActive() && re.hasFocus();
        const image = enabled && selectedNode(re.editor, ['image']) ? selectedNodeElement(re.editor) : null;

        this.setImage(image);
        this.position();
    }

    /**
     * setImage switches the tracked image and its layout listeners.
     */
    setImage(image) {
        if (image === this.image) {
            return;
        }

        if (this.observer) {
            this.observer.disconnect();
        }

        if (!this.image && image) {
            window.addEventListener('resize', this.position);
            window.addEventListener('scroll', this.position, true);
        }
        else if (this.image && !image) {
            window.removeEventListener('resize', this.position);
            window.removeEventListener('scroll', this.position, true);
        }

        this.image = image;

        if (image && this.observer) {
            this.observer.observe(image);
            this.observer.observe(this.richArea.editor.view.dom);
        }
    }

    /**
     * position places the handles on the image, relative to the body.
     */
    position() {
        const image = this.image;
        const rect = image && image.isConnected ? image.getBoundingClientRect() : null;

        if (!rect || !rect.width || !rect.height) {
            this.element.hidden = true;
            return;
        }

        const body = this.richArea.bodyElement;
        const bodyRect = body.getBoundingClientRect();

        this.element.style.left = (rect.left - bodyRect.left - body.clientLeft + body.scrollLeft) + 'px';
        this.element.style.top = (rect.top - bodyRect.top - body.clientTop + body.scrollTop) + 'px';
        this.element.style.width = rect.width + 'px';
        this.element.style.height = rect.height + 'px';
        this.element.hidden = false;
    }

    isResizing() {
        return !!this.drag;
    }

    onPointerDown(event) {
        const re = this.richArea;
        const corner = event.target.dataset ? event.target.dataset.corner : null;
        const image = this.image;

        if (!corner || !image || this.drag || event.button !== 0) {
            return;
        }

        if (!selectedNode(re.editor, ['image']) || selectedNodeElement(re.editor) !== image) {
            return;
        }

        try {
            event.target.setPointerCapture(event.pointerId);
        }
        catch (error) {
            return;
        }

        const { selection } = re.editor.state;
        const startWidth = parseFloat(getComputedStyle(image).width);

        this.drag = {
            corner,
            image,
            handle: event.target,
            pointerId: event.pointerId,
            startX: event.clientX,
            startWidth,
            width: startWidth,
            rate: this.measureGrowth(image, corner, startWidth),
            position: selection.from,
            node: selection.node,
            style: image.getAttribute('style')
        };

        document.addEventListener('keydown', this.onKeyDown, true);
        document.documentElement.classList.add('rich-editor-resizing', corner === 'nw' || corner === 'se' ? 'is-resizing-nwse' : 'is-resizing-nesw');
        re.bubbles.hide();
    }

    onPointerMove(event) {
        const drag = this.drag;
        if (!drag || event.pointerId !== drag.pointerId) {
            return;
        }

        const delta = (event.clientX - drag.startX) * (drag.corner.endsWith('w') ? -1 : 1);

        drag.image.style.width = Math.max(MIN_WIDTH, drag.startWidth + delta / drag.rate) + 'px';
        drag.image.style.height = 'auto';

        // Store the shown width, capped by max width.
        drag.width = parseFloat(getComputedStyle(drag.image).width);

        this.position();
    }

    onPointerUp(event) {
        if (this.drag && event.pointerId === this.drag.pointerId) {
            this.finish(true);
        }
    }

    onPointerCancel(event) {
        if (this.drag && event.pointerId === this.drag.pointerId) {
            this.finish(false);
        }
    }

    onKeyDown(event) {
        if (event.key !== 'Escape') {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.finish(false);
    }

    /**
     * measureGrowth finds how far the edge moves per pixel of width.
     */
    measureGrowth(image, corner, width) {
        const probe = Math.min(10, width - 1);
        if (probe < 1) {
            return 1;
        }

        const style = image.getAttribute('style');
        const before = image.getBoundingClientRect();

        image.style.width = (width - probe) + 'px';
        image.style.height = 'auto';

        const after = image.getBoundingClientRect();
        this.restoreStyle(image, style);

        const moved = corner.endsWith('e') ? before.right - after.right : after.left - before.left;
        const rate = moved / probe;

        return rate >= 0.25 && rate <= 1.01 ? rate : 1;
    }

    restoreStyle(image, style) {
        if (style === null) {
            image.removeAttribute('style');
        }
        else {
            image.setAttribute('style', style);
        }
    }

    /**
     * finish ends a drag, saving the width or restoring the image.
     */
    finish(save) {
        const drag = this.drag;
        this.drag = null;

        if (drag.handle.hasPointerCapture(drag.pointerId)) {
            drag.handle.releasePointerCapture(drag.pointerId);
        }

        document.removeEventListener('keydown', this.onKeyDown, true);
        document.documentElement.classList.remove('rich-editor-resizing', 'is-resizing-nwse', 'is-resizing-nesw');

        this.restoreStyle(drag.image, drag.style);

        const width = Math.round(drag.width);
        if (save && width !== Math.round(drag.startWidth)) {
            this.saveWidth(drag, width);
        }

        // Saving replaced the image, so reposition now.
        this.update();
        this.richArea.refreshUi();
    }

    /**
     * saveWidth saves the width as a style, unless the document changed.
     */
    saveWidth(drag, width) {
        const { state, view } = this.richArea.editor;
        const node = state.doc.nodeAt(drag.position);

        if (node !== drag.node) {
            return;
        }

        const tr = state.tr.setNodeMarkup(drag.position, undefined, { ...node.attrs, width: width + 'px', height: null });
        tr.setSelection(NodeSelection.create(tr.doc, drag.position));
        view.dispatch(closeHistory(tr));
    }

    destroy() {
        if (this.drag) {
            this.finish(false);
        }

        this.setImage(null);
        this.element.remove();
    }
}
