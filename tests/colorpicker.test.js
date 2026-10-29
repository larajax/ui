import { afterEach, beforeAll, describe, expect, mock, test } from 'bun:test';

const calls = [];
const fakeColoris = Object.assign((options) => calls.push(['configure', options]), {
    init: () => {
        calls.push(['init']);

        // Outside the body so the picker survives the body resets between tests
        const picker = document.createElement('div');
        picker.id = 'clr-picker';
        picker.innerHTML = '<input id="clr-color-value"><button type="button" id="clr-close">Close</button>';
        document.documentElement.appendChild(picker);
    },
    setInstance: (selector, options) => calls.push(['setInstance', selector, options]),
    removeInstance: (selector) => calls.push(['removeInstance', selector]),
    close: (revert) => calls.push(['close', revert])
});

mock.module('../resources/assets/vendor/coloris/coloris.esm.js', () => ({ default: fakeColoris }));

const { registerColorPicker } = await import('../resources/assets/formwidgets/colorpicker/colorpicker.js');

function parseValue(value) {
    if (value === 'true') return true;
    if (value.charAt(0) === '[') return JSON.parse(value);
    return value;
}

function makeFakeJax() {
    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = {};

            for (const attr of element.attributes) {
                if (attr.name.startsWith('data-')) {
                    const key = attr.name.slice(5).replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
                    this.config[key] = parseValue(attr.value);
                }
            }
        }

        listen(eventName, handler) {
            this.element.addEventListener(eventName, handler.bind(this));
        }
    }

    return {
        controls: new Map(),
        ControlBase,
        registerControl(id, control) {
            this.controls.set(id, control);
        }
    };
}

let jax;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeAll(() => {
    jax = makeFakeJax();
    registerColorPicker(jax);
});

afterEach(() => {
    document.body.innerHTML = '';
    calls.length = 0;
});

async function connect(html) {
    document.body.innerHTML = html;
    const element = document.querySelector('[data-control="colorpicker"]');
    const control = new (jax.controls.get('colorpicker'))(element);
    control.init();
    control.connect();
    await flush();
    return { element, control };
}

const field = (attributes = '', input = 'data-colorpicker-input') => `
    <div class="field-colorpicker" data-control="colorpicker" data-swatches='["#1abc9c","#16a085"]' ${attributes}>
        <div class="clr-field"><button type="button"></button><input type="text" id="Form-color-input" value="#1abc9c" ${input}></div>
    </div>
`;

const instanceCalls = () => calls.filter(([name]) => name === 'setInstance');

describe('color picker', () => {
    test('the first field sets up Coloris and registers its swatches with it', async () => {
        await connect(field());

        expect(calls[0]).toEqual(['init']);
        expect(calls[1]).toEqual(['configure', {
            el: '[data-colorpicker-input]',
            wrap: false,
            format: 'hex',
            formatToggle: false,
            margin: 4
        }]);
        expect(instanceCalls()).toEqual([['setInstance', '#Form-color-input', {
            parent: 'body',
            themeMode: 'light',
            alpha: false,
            forceAlpha: false,
            swatches: ['#1abc9c', '#16a085'],
            swatchesOnly: false,
            clearButton: false
        }]]);
    });

    test('the shared picker is set up once for every field', async () => {
        await connect(field());
        await connect(field());

        // The first test already set Coloris up, so later fields only register themselves
        expect(calls.filter(([name]) => name === 'init')).toHaveLength(0);
        expect(instanceCalls()).toHaveLength(2);
    });

    test('alpha, clearing, swatches only, the popup and the dark theme carry into the options', async () => {
        await connect(`
            <dialog open data-bs-theme="dark">
                ${field('data-show-alpha="true" data-allow-empty="true" data-swatches-only="true"')}
            </dialog>
        `);

        const options = instanceCalls()[0][2];
        expect(options.alpha).toBe(true);
        expect(options.forceAlpha).toBe(true);
        expect(options.clearButton).toBe(true);
        expect(options.swatchesOnly).toBe(true);
        expect(options.parent).toBe(document.querySelector('dialog'));
        expect(options.themeMode).toBe('dark');
    });

    test('clicking the field refreshes its options for the current theme', async () => {
        const { element } = await connect(`<div id="theme">${field()}</div>`);

        document.getElementById('theme').setAttribute('data-bs-theme', 'dark');
        element.querySelector('input').click();

        expect(instanceCalls()).toHaveLength(2);
        expect(instanceCalls()[1][2].themeMode).toBe('dark');
    });

    test('disconnecting removes the field from the shared picker', async () => {
        const { control } = await connect(field());

        control.disconnect();

        expect(calls.at(-1)).toEqual(['removeInstance', '#Form-color-input']);
    });

    test('a locked field is left alone', async () => {
        await connect(field('', ''));

        expect(instanceCalls()).toHaveLength(0);
    });
});

describe('color picker keys', () => {
    test('Enter in the picker confirms without submitting the surrounding form', async () => {
        await connect(field());
        const reachedDocument = [];
        const onKey = (ev) => reachedDocument.push(ev.key);
        document.addEventListener('keydown', onKey);

        const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
        document.getElementById('clr-color-value').dispatchEvent(enter);
        document.removeEventListener('keydown', onKey);

        expect(enter.defaultPrevented).toBe(true);
        expect(reachedDocument).toEqual(['Enter']);
    });

    test('Escape in the picker reverts the color without reaching an enclosing popup', async () => {
        await connect(field());
        const reachedDocument = [];
        const onKey = (ev) => reachedDocument.push(ev.key);
        document.addEventListener('keydown', onKey);

        document.getElementById('clr-color-value').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        document.removeEventListener('keydown', onKey);

        expect(calls.at(-1)).toEqual(['close', true]);
        expect(reachedDocument).toEqual([]);
    });

    test('Enter on a picker button keeps its normal behavior', async () => {
        await connect(field());

        const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
        document.getElementById('clr-close').dispatchEvent(enter);

        expect(enter.defaultPrevented).toBe(false);
    });
});
