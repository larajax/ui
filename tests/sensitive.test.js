import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { registerSensitive } from '../resources/assets/formwidgets/sensitive/sensitive.js';

function parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
}

function makeFakeJax() {
    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = {};
            this.proxied = new Map();

            for (const attr of element.attributes) {
                if (attr.name.startsWith('data-')) {
                    const key = attr.name.slice(5).replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
                    this.config[key] = parseValue(attr.value);
                }
            }
        }

        proxy(method) {
            if (!this.proxied.has(method)) {
                this.proxied.set(method, method.bind(this));
            }
            return this.proxied.get(method);
        }

        // Supports the delegated listen(event, selector, handler)
        listen(eventName, selector, handler) {
            this.element.addEventListener(eventName, (ev) => {
                if (ev.target.closest(selector)) {
                    handler.call(this, ev);
                }
            });
        }
    }

    return {
        controls: new Map(),
        requests: [],
        ControlBase,
        registerControl(id, control) {
            this.controls.set(id, control);
        },
        request(element, handler, options) {
            this.requests.push({ element, handler, options });
        }
    };
}

let jax;

beforeAll(() => {
    jax = makeFakeJax();
    registerSensitive(jax);
});

afterEach(() => {
    document.body.innerHTML = '';
    jax.requests = [];
});

function connect(html) {
    document.body.innerHTML = html;
    const element = document.querySelector('[data-control="sensitive"]');
    const control = new (jax.controls.get('sensitive'))(element);
    control.init();
    control.connect();
    return { element, control };
}

const textField = `
    <div data-control="sensitive" data-sensitive-clean="true" data-reveal-handler="formSecret::onShowValue" data-hide-on-tab-change="true" data-icon-show="ph ph-eye" data-icon-hide="ph ph-eye-slash">
        <input type="password" name="secret" value="__hidden__" data-sensitive-input>
        <a href="javascript:;" data-sensitive-copy>Copy</a>
        <a href="javascript:;" data-sensitive-toggle><i class="ph ph-eye" data-sensitive-icon></i></a>
        <div class="loading-indicator oc-hide" data-sensitive-loader></div>
    </div>
`;

function revealWith(value) {
    jax.requests[0].options.success.call({}, { value });
}

describe('sensitive field', () => {
    test('revealing a stored value fetches it, then toggles back to hidden', () => {
        const { element } = connect(textField);
        const input = element.querySelector('input');
        const icon = element.querySelector('[data-sensitive-icon]');

        element.querySelector('[data-sensitive-toggle]').click();

        expect(jax.requests).toHaveLength(1);
        expect(jax.requests[0].handler).toBe('formSecret::onShowValue');
        expect(element.querySelector('[data-sensitive-loader]').classList.contains('oc-hide')).toBe(false);

        revealWith('s3cret');
        expect(input.value).toBe('s3cret');
        expect(input.getAttribute('type')).toBe('text');
        expect(icon.className).toBe('ph ph-eye-slash');
        expect(element.querySelector('[data-sensitive-loader]').classList.contains('oc-hide')).toBe(true);

        element.querySelector('[data-sensitive-toggle]').click();
        expect(jax.requests).toHaveLength(1);
        expect(input.getAttribute('type')).toBe('password');
        expect(icon.className).toBe('ph ph-eye');
    });

    test('typing over an unrevealed value starts from empty', () => {
        const { element } = connect(textField);
        const input = element.querySelector('input');

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

        expect(input.value).toBe('');

        element.querySelector('[data-sensitive-toggle]').click();
        expect(jax.requests).toHaveLength(0);
        expect(input.getAttribute('type')).toBe('text');
    });

    test('a revealed value is hidden again when the browser tab is hidden', () => {
        const { element } = connect(textField);
        const input = element.querySelector('input');
        element.querySelector('[data-sensitive-toggle]').click();
        revealWith('s3cret');

        Object.defineProperty(document, 'hidden', { value: true, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
        delete document.hidden;

        expect(input.getAttribute('type')).toBe('password');
    });

    test('copying reveals the value first and leaves it hidden afterwards', () => {
        const { element } = connect(textField);
        const input = element.querySelector('input');

        element.querySelector('[data-sensitive-copy]').click();
        revealWith('s3cret');

        expect(input.value).toBe('s3cret');
        expect(input.getAttribute('type')).toBe('password');
    });

    test('textarea mode swaps the masked facade for the real textarea', () => {
        const { element } = connect(`
            <div data-control="sensitive" data-sensitive-clean="true" data-display-mode="textarea" data-reveal-handler="formSecret::onShowValue" data-icon-show="ph ph-eye" data-icon-hide="ph ph-eye-slash">
                <textarea data-sensitive-facade>&bull;&bull;&bull;</textarea>
                <textarea name="secret" style="display: none" data-sensitive-input>__hidden__</textarea>
                <a href="javascript:;" data-sensitive-toggle><i class="ph ph-eye" data-sensitive-icon></i></a>
                <div class="loading-indicator oc-hide" data-sensitive-loader></div>
            </div>
        `);

        element.querySelector('[data-sensitive-toggle]').click();
        revealWith('line one');

        expect(element.querySelector('[data-sensitive-facade]').style.display).toBe('none');
        expect(element.querySelector('[data-sensitive-input]').style.display).toBe('');
        expect(element.querySelector('[data-sensitive-input]').value).toBe('line one');
    });
});
