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
        lists: new Map(),
        ControlBase,
        registerControl(id, control) {
            this.controls.set(id, control);
        },
        request(element) {
            this.requests.push(element);
        },
        fetchControl(element, name) {
            return name === 'listwidget' ? this.lists.get(element) || null : null;
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
    jax.lists.clear();
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
        let inputEvents = 0;
        input.addEventListener('input', () => inputEvents++);

        clear.click();

        expect(jax.requests).toEqual([input]);
        expect(input.value).toBe('');
        expect(inputEvents).toBe(0);
    });

    test('without a request, a click tells input listeners the term is gone', () => {
        const { input, clear } = connectSearch({ value: 'lamp' });
        const heard = [];
        document.body.addEventListener('input', (ev) => heard.push(ev.target.value));

        clear.click();

        expect(heard).toEqual(['']);
    });

    test('shows again when a request completes while the input holds text', () => {
        const { input, clear } = connectSearch();
        input.value = 'desk';

        document.querySelector('form').dispatchEvent(new Event('ajax:request-complete'));
        expect(clear.style.display).toBe('');
    });
});

describe('linked list', () => {
    // Renders a list for the search to link to, with a stand-in control that records what the search asks of it
    function mountList() {
        document.getElementById('Lists').innerHTML = '<div class="control-list"></div>';

        const element = document.querySelector('#Lists > .control-list'),
            updates = [];

        jax.lists.set(element, { getAllChecked: () => false, setUpdating: (isUpdating) => updates.push(isUpdating) });

        return updates;
    }

    // Wraps the search in a toolbar linked to the list, as the toolbar widget renders it
    function connectLinkedSearch() {
        const search = connectSearch({ request: 'onSearch' });
        const toolbar = document.createElement('div');

        toolbar.dataset.listLinkage = 'Lists';
        document.body.prepend(toolbar);
        toolbar.append(document.querySelector('form'));
        document.body.insertAdjacentHTML('beforeend', '<div id="Lists"></div>');

        return search;
    }

    const fire = (input, name) => input.dispatchEvent(new CustomEvent(name, { bubbles: true }));

    test('a search marks the linked list as updating until its request ends', () => {
        const { input } = connectLinkedSearch();
        const updates = mountList();

        fire(input, 'ajax:promise');
        expect(updates).toEqual([true]);

        fire(input, 'ajax:always');
        expect(updates).toEqual([true, false]);
    });

    test('a newer search that aborts the last keeps the list updating until it ends', () => {
        const { input } = connectLinkedSearch();
        const updates = mountList();

        fire(input, 'ajax:promise');
        fire(input, 'ajax:promise');
        fire(input, 'ajax:always');

        expect(updates).toEqual([true, true, false]);
    });

    test('the list is looked up again when the request ends, since the search redraws it', () => {
        const { input } = connectLinkedSearch();
        const before = mountList();

        fire(input, 'ajax:promise');
        const after = mountList();
        fire(input, 'ajax:always');

        expect(before).toEqual([true]);
        expect(after).toEqual([false]);
    });

    test('a search outside a linked container leaves lists alone', () => {
        const { input } = connectSearch({ request: 'onSearch' });

        expect(() => {
            fire(input, 'ajax:promise');
            fire(input, 'ajax:always');
        }).not.toThrow();
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
