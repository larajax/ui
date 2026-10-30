import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { registerSearchInput } from '../resources/assets/controls/search-input/search-input-control.js';

function makeFakeJax() {
    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = {};
        }

        // Supports listen(event, handler) and listen(event, target, handler)
        listen(eventName, targetOrHandler, handler) {
            if (typeof targetOrHandler === 'function') {
                this.element.addEventListener(eventName, targetOrHandler.bind(this));
            }
            else {
                targetOrHandler.addEventListener(eventName, handler.bind(this));
            }
        }
    }

    return {
        controls: new Map(),
        requests: [],
        ControlBase,
        registerControl(id, control) {
            this.controls.set(id, control);
        },
        request(element) {
            this.requests.push(element);
        }
    };
}

let jax;

beforeAll(() => {
    jax = makeFakeJax();
    registerSearchInput(jax);
});

afterEach(() => {
    document.body.innerHTML = '';
    jax.requests.length = 0;
});

// Renders a search field as Ui::searchInput does: the icon, input and clear button inside an adorned label
function connectSearch({ value = '', request = '' } = {}) {
    document.body.innerHTML = `
        <form>
            <div data-control="search-input">
                <label class="form-control form-adorn">
                    <span class="form-adorn-icon" aria-hidden="true"><i></i></span>
                    <input type="text" name="q" value="${value}" class="form-ghost" aria-label="Search" ${request ? `data-request="${request}"` : ''} data-search-input />
                    <button class="clear-input-text" type="button" style="display:none" aria-label="Clear" data-search-clear><i></i></button>
                </label>
            </div>
        </form>
    `;

    const element = document.querySelector('[data-control="search-input"]');
    const control = new (jax.controls.get('search-input'))(element);
    control.init();
    control.connect();

    return {
        control,
        element,
        input: element.querySelector('[data-search-input]'),
        clear: element.querySelector('[data-search-clear]')
    };
}

function type(input, value) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('search input clear button', () => {
    test('shows while the input holds text, leaving its display to the stylesheet', () => {
        const { input, clear } = connectSearch();
        expect(clear.style.display).toBe('none');

        type(input, 'lamp');
        expect(clear.style.display).toBe('');

        type(input, '');
        expect(clear.style.display).toBe('none');
    });

    test('shows for a term the input starts with', () => {
        const { clear } = connectSearch({ value: 'lamp' });

        expect(clear.style.display).toBe('');
    });

    test('a click inside the adorned field empties the input, hides the button and gives the input focus', () => {
        const { input, clear } = connectSearch({ value: 'lamp' });
        clear.focus();

        clear.click();

        expect(input.value).toBe('');
        expect(clear.style.display).toBe('none');
        expect(document.activeElement).toBe(input);
        expect(jax.requests).toEqual([]);
    });

    test('a click resends the input request with the emptied term', () => {
        const { input, clear } = connectSearch({ value: 'lamp', request: 'onSearch' });

        clear.click();

        expect(jax.requests).toEqual([input]);
        expect(input.value).toBe('');
    });

    test('shows again when a request completes while the input holds text', () => {
        const { input, clear } = connectSearch();
        input.value = 'desk';

        document.querySelector('form').dispatchEvent(new Event('ajax:request-complete'));
        expect(clear.style.display).toBe('');
    });
});

describe('search input markup', () => {
    const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

    // Returns the markup of the adorned label in a partial
    const adornedLabel = (source) => source.slice(source.indexOf('<label'), source.indexOf('</label>') + 8);

    test('the search widget and Ui::searchInput put the icon, input and clear button inside an adorned label', () => {
        [
            '../src/Widgets/Search/partials/_search.php',
            '../resources/views/ui/input/search-input.php'
        ].forEach((path) => {
            const source = read(path);
            const label = adornedLabel(source);

            expect(source.match(/<label\b/g)).toHaveLength(1);
            expect(label).toContain('form-control form-adorn');
            expect(label).toContain('<span class="form-adorn-icon" aria-hidden="true">');
            expect(label).toContain("Ui::icon('search.icon')");
            expect(label).toContain('form-ghost');
            expect(label).toContain('data-search-input');
            expect(label).toContain('aria-label');
            expect(label).toMatch(/<button\s+class="clear-input-text"[^>]*aria-label="[^"]+"[^>]*data-search-clear/);
            expect(source).not.toContain('search-input-container');
            expect(source).not.toContain('storm-icon-pseudo');
        });
    });
});
