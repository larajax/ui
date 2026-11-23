import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { ImageCropper, cropImageFile } from '../resources/assets/controls/image-cropper/image-cropper.js';
import { registerPopup } from '../resources/assets/controls/popup/popup.js';
import { fakeImages, imageFile } from './support/fake-image.js';

let images;

const TEMPLATE = `
    <div class="image-cropper-popup" data-popup-size="large">
        <h4 class="dialog-title">Crop Image</h4>
        <div data-cropper-stage data-label="The part to keep"></div>
        <input type="range" min="0" max="100" value="0" data-cropper-zoom>
        <span data-cropper-output></span>
        <p data-cropper-small hidden>May look blurry.</p>
        <p data-cropper-animated hidden>Keeps the first frame.</p>
        <button type="button" data-cropper-apply>Crop</button>
        <button type="button" data-dismiss="popup">Cancel</button>
    </div>
`;

// A loaded image, as the browser hands one over
const picture = (width, height) => ({ naturalWidth: width, naturalHeight: height, src: 'data:image/png;base64,AAAA' });

function makeCropper(options, image = picture(2000, 1000)) {
    document.body.innerHTML = '<div id="stage"></div>';

    const element = document.querySelector('#stage'),
        cropper = new ImageCropper(element, options);

    cropper.setImage(image);

    return { element, cropper };
}

const popup = () => document.querySelector('dialog.control-popup');

// Waits for the picked file to be read and the popup to open
async function opened(promise) {
    for (let tries = 0; tries < 200 && !popup(); tries++) {
        await new Promise((resolve) => setTimeout(resolve, 5));
    }

    return { dialog: popup(), promise };
}

beforeAll(() => {
    images = fakeImages();

    registerPopup({
        registerControl() {},
        ControlBase: class {},
        Events: { dispatch() {} }
    });
});

afterAll(() => {
    images.restore();
});

afterEach(() => {
    document.body.innerHTML = '';
    images.reset();
});

describe('image cropper', () => {
    test('draws a frame the shape of the target size with the whole image across it', () => {
        const { element, cropper } = makeCropper({ width: 800, height: 800, label: 'The part to keep' });
        const frame = element.querySelector('.image-cropper-frame');

        expect(element.classList.contains('image-cropper')).toBe(true);
        expect(frame.getAttribute('aria-label')).toBe('The part to keep');
        expect(frame.tabIndex).toBe(0);
        expect([frame.style.width, frame.style.height]).toEqual(['360px', '360px']);
        expect(frame.querySelector('img').getAttribute('src')).toBe('data:image/png;base64,AAAA');

        // The middle of a 2000x1000 image, as tall as the image
        expect(cropper.getSelection()).toEqual({ x: 500, y: 0, width: 1000, height: 1000 });
        expect(cropper.getZoom()).toBe(0);
    });

    test('a wide shape takes the width it is given', () => {
        images.width = 500;
        const { element, cropper } = makeCropper({ width: 1000, height: 250 });
        const frame = element.querySelector('.image-cropper-frame');

        expect([frame.style.width, frame.style.height]).toEqual(['500px', '125px']);
        expect(cropper.getSelection()).toEqual({ x: 0, y: 250, width: 2000, height: 500 });
    });

    test('saves the part at its own size, up to the target size', () => {
        const { cropper } = makeCropper({ width: 800, height: 800 });

        // 1000 pixels of the image are in the frame, more than the target
        expect(cropper.getOutputSize()).toEqual({ width: 800, height: 800 });

        cropper.setZoom(100);

        // Zoomed in four times, 250 are
        expect(cropper.getSelection().width).toBeCloseTo(250);
        expect(cropper.getOutputSize()).toEqual({ width: 250, height: 250 });
    });

    test('the image always covers the frame', () => {
        const { cropper } = makeCropper({ width: 800, height: 800 });

        cropper.moveBy(5000, 5000);
        expect(cropper.getSelection()).toMatchObject({ x: 0, y: 0 });

        cropper.moveBy(-5000, -5000);
        expect(cropper.getSelection()).toMatchObject({ x: 1000, y: 0 });

        cropper.zoomTo(0.0001);
        expect(cropper.getZoom()).toBe(0);

        cropper.zoomTo(1000);
        expect(cropper.getZoom()).toBe(100);
    });

    test('zooming keeps the point at the origin in place', () => {
        const { cropper } = makeCropper({ width: 800, height: 800 });
        const before = cropper.getSelection();

        cropper.zoomTo(cropper.view.scale * 2, 0, 0);

        expect(cropper.getSelection()).toEqual({ x: before.x, y: before.y, width: 500, height: 500 });
    });

    test('the arrow keys move the image and plus and minus zoom it', () => {
        const { element, cropper } = makeCropper({ width: 800, height: 800 });
        const frame = element.querySelector('.image-cropper-frame');
        const press = (key) => {
            const ev = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
            frame.dispatchEvent(ev);
            return ev;
        };

        // 10 screen pixels to the right shows the image 10 / 0.36 pixels further left
        expect(press('ArrowRight').defaultPrevented).toBe(true);
        expect(cropper.getSelection().x).toBeCloseTo(500 - 10 / 0.36);

        press('+');
        expect(cropper.getSelection().width).toBeCloseTo(1000 / 1.1);

        press('-');
        expect(cropper.getSelection().width).toBeCloseTo(1000);

        expect(press('a').defaultPrevented).toBe(false);
    });

    test('dragging moves the image', () => {
        const { element, cropper } = makeCropper({ width: 800, height: 800 });
        const frame = element.querySelector('.image-cropper-frame');
        const pointer = (type, clientX) => frame.dispatchEvent(new MouseEvent(type, { clientX, clientY: 0, button: 0, bubbles: true }));

        frame.setPointerCapture = () => {};

        pointer('pointerdown', 100);
        expect(frame.classList.contains('is-dragging')).toBe(true);

        pointer('pointermove', 136);
        expect(cropper.getSelection().x).toBeCloseTo(400);

        pointer('pointerup', 136);
        pointer('pointermove', 300);
        expect(frame.classList.contains('is-dragging')).toBe(false);
        expect(cropper.getSelection().x).toBeCloseTo(400);
    });

    test('announces each change with the part and the size it saves at', () => {
        const { element, cropper } = makeCropper({ width: 800, height: 800 });
        const changes = [];
        element.addEventListener('image-cropper:change', (ev) => changes.push(ev.detail));

        cropper.setZoom(100);

        expect(changes.length).toBe(1);
        expect(changes[0].cropper).toBe(cropper);
        expect(changes[0].output).toEqual({ width: 250, height: 250 });
        expect(changes[0].selection.width).toBeCloseTo(250);
    });

    test('a new width keeps the part that was in view', () => {
        const { element, cropper } = makeCropper({ width: 800, height: 800 });

        cropper.setZoom(100);
        cropper.moveBy(-40, 0);
        const before = cropper.getSelection();

        images.width = 200;
        cropper.layout();

        const after = cropper.getSelection();
        expect(element.querySelector('.image-cropper-frame').style.width).toBe('200px');
        expect(after.x).toBeCloseTo(before.x);
        expect(after.y).toBeCloseTo(before.y);
        expect(after.width).toBeCloseTo(before.width);
    });

    test('draws the part in the frame as a file', async () => {
        const { cropper } = makeCropper({ width: 800, height: 800 });

        const file = await cropper.toFile(imageFile('photo.jpeg'));

        expect(images.draws).toEqual([{ size: [800, 800], part: [500, 0, 1000, 1000] }]);
        expect(file.name).toBe('photo.jpeg');
        expect(file.type).toBe('image/jpeg');
    });

    test('dispose removes the frame and stops listening', () => {
        const { element, cropper } = makeCropper({ width: 800, height: 800 });
        const frame = element.querySelector('.image-cropper-frame');
        const changes = [];
        element.addEventListener('image-cropper:change', () => changes.push(true));

        cropper.dispose();
        frame.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

        expect(element.children.length).toBe(0);
        expect(element.classList.contains('image-cropper')).toBe(false);
        expect(changes).toEqual([]);
    });
});

describe('image cropper in select mode', () => {
    // A 1200x600 image in 600 pixels of room shows at half size
    function makeSelector(options = {}, image = picture(1200, 600)) {
        const made = makeCropper({ mode: 'select', ...options }, image);
        const frame = made.element.querySelector('.image-cropper-frame');

        frame.setPointerCapture = () => {};

        const pointer = (type, target, clientX, clientY) => {
            target.dispatchEvent(new MouseEvent(type, { clientX, clientY, button: 0, bubbles: true }));
        };

        // Presses on a target, moves through each point and lets go
        const drag = (target, from, ...points) => {
            pointer('pointerdown', target, ...from);
            points.forEach((point) => pointer('pointermove', frame, ...point));
            pointer('pointerup', frame, ...points[points.length - 1]);
        };

        const handle = (name) => frame.querySelector(`[data-handle="${name}"]`);

        return { ...made, frame, drag, handle, box: frame.querySelector('.image-cropper-selection') };
    }

    const rounded = (rect) => ({
        x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height)
    });

    test('shows the whole image with all of it selected', () => {
        const { element, cropper, frame, box } = makeSelector();

        expect(element.classList.contains('is-select')).toBe(true);
        expect([frame.style.width, frame.style.height]).toEqual(['600px', '300px']);
        expect(frame.querySelectorAll('.image-cropper-handle').length).toBe(8);
        expect(cropper.getSelection()).toEqual({ x: 0, y: 0, width: 1200, height: 600 });
        expect([box.style.left, box.style.top, box.style.width, box.style.height]).toEqual(['0px', '0px', '600px', '300px']);
        expect(cropper.getOutputSize()).toEqual({ width: 1200, height: 600 });
    });

    test('a small image is shown no larger than it is', () => {
        const { frame } = makeSelector({}, picture(200, 100));

        expect([frame.style.width, frame.style.height]).toEqual(['200px', '100px']);
    });

    test('a shape starts as the largest selection of it in the middle', () => {
        const { cropper } = makeSelector({ aspectRatio: 1 });

        expect(cropper.getSelection()).toEqual({ x: 300, y: 0, width: 600, height: 600 });
    });

    test('dragging the selection moves it, inside the image', () => {
        const { cropper, drag, box } = makeSelector({ aspectRatio: 1 });

        drag(box, [300, 100], [250, 100]);
        expect(cropper.getSelection()).toEqual({ x: 200, y: 0, width: 600, height: 600 });

        drag(box, [300, 100], [900, 400]);
        expect(cropper.getSelection()).toEqual({ x: 600, y: 0, width: 600, height: 600 });
    });

    test('a corner handle resizes from the corner opposite it', () => {
        const { cropper, drag, handle } = makeSelector();

        drag(handle('se'), [600, 300], [400, 200]);
        expect(cropper.getSelection()).toEqual({ x: 0, y: 0, width: 800, height: 400 });

        drag(handle('nw'), [0, 0], [100, 50]);
        expect(cropper.getSelection()).toEqual({ x: 200, y: 100, width: 600, height: 300 });

        // Past the corner opposite, it carries on the other way
        drag(handle('nw'), [100, 50], [500, 250]);
        expect(cropper.getSelection()).toEqual({ x: 800, y: 400, width: 200, height: 100 });
    });

    test('a side handle moves its side alone', () => {
        const { cropper, drag, handle } = makeSelector();

        drag(handle('e'), [600, 150], [300, 10]);
        expect(cropper.getSelection()).toEqual({ x: 0, y: 0, width: 600, height: 600 });

        drag(handle('n'), [150, 0], [400, 100]);
        expect(cropper.getSelection()).toEqual({ x: 0, y: 200, width: 600, height: 400 });

        drag(handle('w'), [0, 200], [50, 200]);
        drag(handle('s'), [200, 300], [200, 250]);
        expect(cropper.getSelection()).toEqual({ x: 100, y: 200, width: 500, height: 300 });
    });

    test('a shape is kept while resizing, as far as the image allows', () => {
        const { cropper, drag, handle } = makeSelector({ aspectRatio: 2 });

        // The whole 1200x600 image is the shape already
        drag(handle('se'), [600, 300], [300, 280]);
        expect(rounded(cropper.getSelection())).toEqual({ x: 0, y: 0, width: 1120, height: 560 });

        // A side handle keeps the middle where it was
        drag(handle('s'), [280, 280], [280, 100]);
        expect(rounded(cropper.getSelection())).toEqual({ x: 360, y: 0, width: 400, height: 200 });

        // And stops where the shape would leave the image
        drag(handle('s'), [280, 100], [280, 5000]);
        expect(rounded(cropper.getSelection())).toEqual({ x: 0, y: 0, width: 1120, height: 560 });
    });

    test('dragging outside the selection draws a new one, and a click there leaves it alone', () => {
        const { cropper, frame, drag, handle } = makeSelector();

        drag(handle('se'), [600, 300], [100, 100]);
        expect(cropper.getSelection()).toEqual({ x: 0, y: 0, width: 200, height: 200 });

        drag(frame, [300, 150], [301, 151]);
        expect(cropper.getSelection()).toEqual({ x: 0, y: 0, width: 200, height: 200 });

        drag(frame, [300, 150], [400, 250]);
        expect(cropper.getSelection()).toEqual({ x: 600, y: 300, width: 200, height: 200 });

        // Up and to the left too
        drag(frame, [300, 150], [200, 100]);
        expect(cropper.getSelection()).toEqual({ x: 400, y: 200, width: 200, height: 100 });
    });

    test('a selection is never smaller than can be caught', () => {
        const { cropper, drag, handle } = makeSelector();

        drag(handle('se'), [600, 300], [0, 0]);

        // 12 screen pixels at half size
        expect(cropper.getSelection()).toEqual({ x: 0, y: 0, width: 24, height: 24 });
    });

    test('the arrow keys move the selection a pixel, ten with Shift', () => {
        const { cropper, frame, drag, handle } = makeSelector();
        const press = (key, shiftKey = false) => frame.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }));

        drag(handle('se'), [600, 300], [300, 150]);

        press('ArrowRight');
        press('ArrowDown', true);
        expect(cropper.getSelection()).toEqual({ x: 1, y: 10, width: 600, height: 300 });

        press('ArrowLeft', true);
        expect(cropper.getSelection().x).toBe(0);
    });

    test('a new shape is fitted to the selection there was', () => {
        const { cropper, drag, handle } = makeSelector();

        drag(handle('se'), [600, 300], [400, 300]);
        drag(handle('nw'), [0, 0], [200, 0]);
        expect(cropper.getSelection()).toEqual({ x: 400, y: 0, width: 400, height: 600 });

        // As wide, about the same middle
        cropper.setOptions({ aspectRatio: 2 });
        expect(cropper.getSelection()).toEqual({ x: 400, y: 200, width: 400, height: 200 });

        // Too tall for the image at that width, so as tall as the image
        cropper.setOptions({ aspectRatio: 0.5 });
        expect(cropper.getSelection()).toEqual({ x: 450, y: 0, width: 300, height: 600 });

        cropper.setOptions({ aspectRatio: null });
        expect(cropper.getSelection()).toEqual({ x: 450, y: 0, width: 300, height: 600 });
    });

    test('a target size sets the shape and the largest size saved', () => {
        const { cropper, drag, handle } = makeSelector();

        cropper.setOptions({ width: 400, height: 400 });
        expect(cropper.getSelection()).toEqual({ x: 300, y: 0, width: 600, height: 600 });
        expect(cropper.getOutputSize()).toEqual({ width: 400, height: 400 });

        drag(handle('se'), [450, 300], [250, 100]);
        expect(cropper.getSelection()).toEqual({ x: 300, y: 0, width: 200, height: 200 });
        expect(cropper.getOutputSize()).toEqual({ width: 200, height: 200 });
    });

    test('setSelection picks a part, kept inside the image', () => {
        const { cropper, box } = makeSelector();

        cropper.setSelection({ x: 1000, y: 500, width: 400, height: 200 });

        expect(cropper.getSelection()).toEqual({ x: 800, y: 400, width: 400, height: 200 });
        expect([box.style.left, box.style.top, box.style.width, box.style.height]).toEqual(['400px', '200px', '200px', '100px']);
    });

    test('draws the selection as a file', async () => {
        const { cropper } = makeSelector();

        cropper.setSelection({ x: 100, y: 50, width: 400, height: 200 });
        await cropper.toFile(imageFile('photo.png', 'image/png'));

        expect(images.draws).toEqual([{ size: [400, 200], part: [100, 50, 400, 200] }]);
    });
});

describe('cropping a picked file', () => {
    const options = { width: 800, height: 400, template: TEMPLATE };

    test('an image the shape already and no larger is left as it is', async () => {
        images.size = [600, 300];
        const file = imageFile('banner.png', 'image/png');

        expect(await cropImageFile(file, options)).toBe(file);
        expect(popup()).toBeNull();
        expect(images.draws).toEqual([]);
    });

    test('a shape within a hundredth counts as the same', async () => {
        images.size = [600, 302];
        const file = imageFile('banner.png', 'image/png');

        expect(await cropImageFile(file, options)).toBe(file);
    });

    test('an image the shape and larger is scaled down to the size', async () => {
        images.size = [1600, 800];
        const cropped = await cropImageFile(imageFile('banner.jpg'), options);

        expect(popup()).toBeNull();
        expect(images.draws).toEqual([{ size: [800, 400], part: [0, 0, 1600, 800] }]);
        expect(cropped.name).toBe('banner.jpg');
        expect(cropped.type).toBe('image/jpeg');
    });

    test('a type the canvas does not save becomes a PNG, with the extension to match', async () => {
        images.size = [1600, 800];

        const bitmap = await cropImageFile(imageFile('scan.bmp', 'image/bmp'), options);
        expect([bitmap.name, bitmap.type]).toEqual(['scan.png', 'image/png']);

        // A browser that cannot write WebP saves a PNG instead
        images.savedType = 'image/png';
        const webp = await cropImageFile(imageFile('photo.webp', 'image/webp'), options);
        expect([webp.name, webp.type]).toEqual(['photo.png', 'image/png']);
    });

    test('another shape opens the popup, and cropping resolves with the part in the frame', async () => {
        images.size = [1000, 1000];
        const { dialog, promise } = await opened(cropImageFile(imageFile('square.jpg'), { ...options, titleSuffix: '2/3' }));

        expect(dialog.classList.contains('size-large')).toBe(true);
        expect(dialog.querySelector('.dialog-title').textContent).toBe('Crop Image (2/3)');
        expect(dialog.querySelector('.image-cropper-frame').getAttribute('aria-label')).toBe('The part to keep');
        expect(dialog.querySelector('[data-cropper-output]').textContent).toBe('800 × 400px');
        expect(dialog.querySelector('[data-cropper-small]').hidden).toBe(true);
        expect(dialog.querySelector('[data-cropper-animated]').hidden).toBe(true);

        dialog.querySelector('[data-cropper-apply]').click();
        const cropped = await promise;

        expect(images.draws).toEqual([{ size: [800, 400], part: [0, 250, 1000, 500] }]);
        expect(cropped.name).toBe('square.jpg');
        expect(popup()).toBeNull();
    });

    test('the slider zooms, and a part under half the size warns that it may look blurry', async () => {
        images.size = [1000, 1000];
        const { dialog, promise } = await opened(cropImageFile(imageFile('square.jpg'), options));
        const zoom = dialog.querySelector('[data-cropper-zoom]');

        zoom.value = 100;
        zoom.dispatchEvent(new Event('input', { bubbles: true }));

        expect(dialog.querySelector('[data-cropper-output]').textContent).toBe('250 × 125px');
        expect(dialog.querySelector('[data-cropper-small]').hidden).toBe(false);

        // The wheel and keys move the slider with them
        dialog.querySelector('.image-cropper-frame').dispatchEvent(new KeyboardEvent('keydown', { key: '-', bubbles: true }));
        expect(Number(zoom.value)).toBeLessThan(100);

        dialog.querySelector('[data-dismiss="popup"]').click();
        await promise;
    });

    test('closing the popup resolves with nothing', async () => {
        images.size = [1000, 1000];
        const { dialog, promise } = await opened(cropImageFile(imageFile('square.jpg'), options));

        dialog.querySelector('[data-dismiss="popup"]').click();

        expect(await promise).toBeNull();
        expect(images.draws).toEqual([]);
        expect(popup()).toBeNull();
    });

    test('an image small enough to look blurry shows the popup for its warning', async () => {
        images.size = [300, 150];
        const { dialog, promise } = await opened(cropImageFile(imageFile('tiny.png', 'image/png'), options));

        expect(dialog.querySelector('[data-cropper-small]').hidden).toBe(false);
        expect(dialog.querySelector('[data-cropper-output]').textContent).toBe('300 × 150px');

        dialog.querySelector('[data-dismiss="popup"]').click();
        await promise;
    });

    test('an animation is left as it is when it fits, and says what cropping loses when it does not', async () => {
        const file = imageFile('spinner.gif', 'image/gif');

        images.size = [600, 300];
        expect(await cropImageFile(file, options)).toBe(file);

        images.size = [1600, 800];
        const { dialog, promise } = await opened(cropImageFile(file, options));

        expect(dialog.querySelector('[data-cropper-animated]').hidden).toBe(false);

        dialog.querySelector('[data-cropper-apply]').click();
        const cropped = await promise;

        expect([cropped.name, cropped.type]).toEqual(['spinner.png', 'image/png']);
    });

    test('without a template the file is left as it is', async () => {
        images.size = [1000, 1000];
        const file = imageFile('square.jpg');

        expect(await cropImageFile(file, { width: 800, height: 400 })).toBe(file);
    });

    test('a file the browser cannot read as an image is refused', async () => {
        images.size = false;

        expect(cropImageFile(imageFile('broken.jpg'), options)).rejects.toThrow('The file broken.jpg could not be read as an image.');
    });
});
