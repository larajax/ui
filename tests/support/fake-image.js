/*
 * Stands in for the image handling happy-dom leaves out: decoding a picked file, laying an
 * element out and saving a canvas. Set the fields of the returned state to say what the
 * next image is like, and call restore() when done.
 */
export function fakeImages() {
    const originals = {
        Image: globalThis.Image,
        getContext: HTMLCanvasElement.prototype.getContext,
        toBlob: HTMLCanvasElement.prototype.toBlob,
        clientWidth: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
    };

    const state = {
        // The size the next picked file decodes to, or false for a file that is not an image
        size: [800, 600],
        // The width every element lays out at
        width: 600,
        // The type the canvas saves instead of the one asked for, as a browser does for a type it cannot write
        savedType: null,
        // Each draw as { size: [width, height], part: [x, y, width, height] }
        draws: [],
        reset() {
            state.size = [800, 600];
            state.width = 600;
            state.savedType = null;
            state.draws = [];
        },
        restore() {
            globalThis.Image = originals.Image;
            HTMLCanvasElement.prototype.getContext = originals.getContext;
            HTMLCanvasElement.prototype.toBlob = originals.toBlob;

            if (originals.clientWidth) {
                Object.defineProperty(HTMLElement.prototype, 'clientWidth', originals.clientWidth);
            }
            else {
                delete HTMLElement.prototype.clientWidth;
            }
        }
    };

    globalThis.Image = class {
        set src(value) {
            this.address = value;

            queueMicrotask(() => {
                if (state.size) {
                    [this.naturalWidth, this.naturalHeight] = state.size;
                    this.onload();
                }
                else {
                    this.onerror();
                }
            });
        }

        get src() {
            return this.address;
        }
    };

    HTMLCanvasElement.prototype.getContext = function() {
        return {
            drawImage: (image, x, y, width, height) => {
                state.draws.push({ size: [this.width, this.height], part: [x, y, width, height] });
            }
        };
    };

    HTMLCanvasElement.prototype.toBlob = function(callback, type) {
        callback(new Blob(['saved'], { type: state.savedType || type }));
    };

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        get() {
            return state.width;
        }
    });

    return state;
}

// A picked file of a type, by its name
export function imageFile(name, type = 'image/jpeg') {
    return new File(['picked'], name, { type });
}
