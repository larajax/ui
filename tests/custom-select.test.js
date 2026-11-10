import { afterEach, describe, expect, test } from 'bun:test';
import { DEFAULT_LANG, normalizeResults, optionMark, registerCustomSelect } from '../resources/assets/controls/custom-select/custom-select-control.js';
import { getLanguages } from '../resources/assets/lang.js';

const REGISTRIES = ['LarajaxUiLanguages', 'RichAreaLanguages', 'HotsheetLanguages'];

function makeFakeJax() {
    const controls = new Map();

    class ControlBase {
        constructor(element) {
            this.element = element;
            this.proxied = new Map();
        }

        proxy(method) {
            if (!this.proxied.has(method)) {
                this.proxied.set(method, method.bind(this));
            }
            return this.proxied.get(method);
        }
    }

    return {
        controls,
        ControlBase,
        requests: [],
        registerControl(id, control) {
            controls.set(id, control);
        }
    };
}

let started = [];

// Connects the control on the first select, or the one matching the selector, and returns it
function connect(html, selector = 'select', jax = makeFakeJax()) {
    registerCustomSelect(jax);
    document.body.innerHTML = html;

    const control = new (jax.controls.get('custom-select'))(document.querySelector(selector));
    control.connect();
    started.push(control);

    return control;
}

const escape = (text) => String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[char]);

afterEach(() => {
    started.forEach((control) => control.disconnect());
    started = [];
    document.body.innerHTML = '';
    document.documentElement.lang = '';
    REGISTRIES.forEach((registry) => delete globalThis[registry]);
});

describe('custom select field', () => {
    test('the dropdown joins an enclosing dialog, and the body outside one', () => {
        const inDialog = connect('<dialog open><select><option>One</option></select></dialog>');
        expect(inDialog.tomSelect.dropdown.parentElement).toBe(document.querySelector('dialog'));

        const onPage = connect('<select><option>One</option></select>');
        expect(onPage.tomSelect.dropdown.parentElement).toBe(document.body);
    });

    test('a single select is a form control with a caret and its search box sits in the dropdown', () => {
        const control = connect('<select class="form-control custom-select"><option>One</option><option>Two</option></select>');
        const ts = control.tomSelect;

        expect(ts.control.classList.contains('form-control')).toBe(true);
        expect(ts.control.classList.contains('form-control-caret')).toBe(true);
        expect(ts.wrapper.classList.contains('form-control')).toBe(false);
        expect(ts.dropdown.querySelector('.dropdown-input')).not.toBeNull();
    });

    test('select-no-search and a minimum results count leave the search box out', () => {
        expect(connect('<select class="select-no-search"><option>One</option></select>').tomSelect.settings.controlInput).toBeNull();
        expect(connect('<select data-minimum-results-for-search="Infinity"><option>One</option></select>').tomSelect.settings.controlInput).toBeNull();
        expect(connect('<select data-minimum-results-for-search="3"><option>One</option><option>Two</option></select>').tomSelect.settings.controlInput).toBeNull();
        expect(connect('<select data-minimum-results-for-search="2"><option>One</option><option>Two</option></select>').tomSelect.dropdown.querySelector('.dropdown-input')).not.toBeNull();
    });

    test('a placeholder hides the empty option and adds a clear button, while an empty option alone stays an option', () => {
        const withPlaceholder = connect('<select data-placeholder="Pick one"><option value="">Pick one</option><option value="1">One</option></select>');
        expect(withPlaceholder.tomSelect.settings.placeholder).toBe('Pick one');
        expect(withPlaceholder.tomSelect.options['']).toBeUndefined();
        expect(withPlaceholder.tomSelect.wrapper.classList.contains('plugin-clear_button')).toBe(true);

        const emptyOption = connect('<select><option value="">- Select -</option><option value="1">One</option></select>');
        expect(emptyOption.tomSelect.options[''].text).toBe('- Select -');
        expect(emptyOption.tomSelect.wrapper.classList.contains('plugin-clear_button')).toBe(false);
    });

    test('without a search box the field shows the placeholder itself', () => {
        const control = connect('<select class="select-no-search" data-placeholder="Pick one"><option value="">Pick one</option><option value="1">One</option></select>');

        expect(control.tomSelect.control.dataset.placeholder).toBe('Pick one');
    });

    test('small and large selects, or a small or large group around them, size the field and dropdown', () => {
        const small = connect('<select class="form-control form-control-sm"><option>One</option></select>').tomSelect;
        expect(small.control.classList.contains('form-control-sm')).toBe(true);
        expect(small.dropdown.classList.contains('select-dropdown-sm')).toBe(true);

        const large = connect('<div class="form-group form-group-lg"><select class="form-control"><option>One</option></select></div>').tomSelect;
        expect(large.control.classList.contains('form-control-lg')).toBe(true);
        expect(large.dropdown.classList.contains('select-dropdown-lg')).toBe(true);

        const plain = connect('<select class="form-control"><option>One</option></select>').tomSelect;
        expect(plain.dropdown.className).not.toContain('select-dropdown-');
    });

    test('options show their status dot, icon or image before the escaped text', () => {
        expect(optionMark({ status: 'red" onload="x' }, escape)).toBe('<span class="select-status status-indicator" style="background:red&quot; onload=&quot;x"></span>');
        expect(optionMark({ icon: 'ph ph-house' }, escape)).toBe('<i class="select-icon ph ph-house" aria-hidden="true"></i>');
        expect(optionMark({ image: '/a.png' }, escape)).toBe('<img class="select-image" src="/a.png" alt="">');
        expect(optionMark({ image: '/a.png' }, escape, true)).toBe('<img class="chip-img" src="/a.png" alt="">');
        expect(optionMark({}, escape)).toBe('');

        const control = connect('<select><option value="1" data-icon="ph ph-house">&lt;b&gt;Home</option></select>');
        const item = control.tomSelect.control.querySelector('.item');
        expect(item.querySelector('.select-icon').className).toContain('ph ph-house');
        expect(item.querySelector('.select-text').innerHTML).toBe('&lt;b&gt;Home');
    });

    test('a multiple select is a chip input whose tags are Bootstrap chips with a remove button', () => {
        const control = connect('<select multiple><option value="1" selected data-status="#f00">One</option><option value="2">Two</option></select>');
        const ts = control.tomSelect;
        const chip = ts.control.querySelector('.item');

        expect(ts.control.classList.contains('chip-input')).toBe(true);
        expect(ts.control_input.classList.contains('form-ghost')).toBe(true);
        expect(chip.classList.contains('chip')).toBe(true);
        expect(chip.querySelector('.chip-icon .status-indicator')).not.toBeNull();
        expect(chip.querySelector('.chip-dismiss').getAttribute('title')).toBe('Remove item');
    });

    test('picking an option already picked takes it out again, unless the picked ones are hidden', () => {
        const ts = connect('<select multiple><option value="1" selected>One</option><option value="2">Two</option></select>').tomSelect;
        ts.open();
        ts.onOptionSelect(new MouseEvent('click'), ts.getOption('1', true));

        expect(ts.items).toEqual([]);

        const hidden = connect('<select multiple class="select-hide-selected"><option value="1" selected>One</option></select>').tomSelect;
        expect(hidden.settings.hideSelected).toBe(true);
    });

    test('a full multiple select explains its limit in place of the dropdown, in the language\'s plural', () => {
        const control = connect('<select multiple data-maximum-selection-length="1"><option value="1" selected>One</option><option value="2">Two</option></select>');
        const ts = control.tomSelect;

        ts.open();

        expect(ts.isOpen).toBe(false);
        expect(ts.dropdown.querySelector('.select-notice').textContent).toBe('You can only select 1 item');

        getLanguages().ru = { customselect: { maximumSelected: { one: 'Не более :count элемента', few: 'Не более :count элементов (few)', many: 'many', other: 'other' } } };
        const russian = connect('<select multiple data-language="ru" data-maximum-selection-length="3"><option value="1" selected>1</option><option value="2" selected>2</option><option value="3" selected>3</option></select>');
        russian.tomSelect.open();

        expect(russian.tomSelect.dropdown.querySelector('.select-notice').textContent).toBe('Не более 3 элементов (few)');
    });

    test('token separators accept typed tags, turning text into a tag on each separator or a paste', () => {
        const ts = connect('<select multiple data-token-separators=",| "></select>').tomSelect;

        expect(ts.settings.create).toBe(true);
        expect(ts.settings.delimiter).toBe(',');
        expect('one two,three'.split(ts.settings.splitOn)).toEqual(['one', 'two', 'three']);

        ts.focus();
        ts.control_input.value = 'first';
        ts.control_input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));

        expect(ts.items).toEqual(['first']);
        expect(Array.from(document.querySelector('select').selectedOptions).map((option) => option.value)).toEqual(['first']);

        // Without separators, typed text only becomes a tag on Enter
        expect(connect('<select multiple data-tags></select>').tomSelect.settings.splitOn).toBeNull();
    });

    test('a tag input without a dropdown hides it and keeps typed text when the field loses focus', () => {
        const control = connect('<select multiple class="select-no-dropdown" data-token-separators=","></select>');

        expect(control.tomSelect.settings.createOnBlur).toBe(true);
        expect(control.tomSelect.dropdown.classList.contains('select-no-dropdown')).toBe(true);
    });

    test('the tag list options turn into sortable tags, a tag pattern and keeping typed text on blur', () => {
        const ts = connect('<select multiple data-tags data-sortable data-create-filter="^[a-z]+$" data-create-on-blur></select>').tomSelect;

        expect(ts.wrapper.classList.contains('plugin-drag_drop')).toBe(true);
        expect(ts.settings.createOnBlur).toBe(true);
        expect(ts.canCreate('lowercase')).toBe(true);
        expect(ts.canCreate('Has Caps')).toBe(false);
    });

    test('the other Tom Select features turn on from data attributes', () => {
        const ts = connect('<select multiple data-checkboxes data-dropdown-header="Pick tags" data-optgroup-columns data-duplicates data-select-on-tab data-close-on-select="false" data-search-fields="text,description"><option>One</option></select>').tomSelect;

        expect(ts.wrapper.classList.contains('plugin-checkbox_options')).toBe(true);
        expect(ts.dropdown.querySelector('.dropdown-header').textContent).toBe('Pick tags');
        expect(ts.dropdown.classList.contains('plugin-optgroup_columns')).toBe(true);
        expect(ts.settings.duplicates).toBe(true);
        expect(ts.settings.selectOnTab).toBe(true);
        expect(ts.settings.closeAfterSelect).toBe(false);
        expect(ts.settings.searchField.map((field) => field.field || field)).toEqual(['text', 'description']);
    });
});

describe('custom select with a handler', () => {
    function fakeRequest(jax, response, fails = false) {
        jax.request = (element, handler, options) => {
            jax.requests.push({ element, handler, data: options.data });

            return {
                done(callback) {
                    if (!fails) {
                        callback(response);
                    }
                    return this;
                },
                fail(callback) {
                    if (fails) {
                        callback();
                    }
                    return this;
                }
            };
        };
    }

    test('results become options and groups, from a list or a map of values to labels', () => {
        const list = normalizeResults({ results: [{ text: 'Pages', children: [{ id: 'cms-page::home', text: 'Home', icon: 'ph ph-house' }] }, { id: 'url', text: 'URL', disabled: true }], pagination: { more: true } });

        expect(list.optgroups).toEqual([{ value: 'group-0', label: 'Pages', disabled: false }]);
        expect(list.options[0]).toEqual({ value: 'cms-page::home', text: 'Home', icon: 'ph ph-house', optgroup: 'group-0' });
        expect(list.options[1]).toEqual({ value: 'url', text: 'URL', disabled: true });
        expect(list.more).toBe(true);

        const map = normalizeResults({ result: { a: 'Apple', b: 'Banana' } });
        expect(map.options.map((option) => option.value)).toEqual(['a', 'b']);
        expect(map.more).toBe(false);
    });

    test('the search sends term and q, and the next page follows when the handler offers more', () => {
        const jax = makeFakeJax();
        fakeRequest(jax, { results: [{ id: '1', text: 'Home' }], pagination: { more: true } });
        const control = connect('<select data-handler="onSearch"></select>', 'select', jax);
        const loaded = [];

        control.loadOptions('onSearch', 'ho', (options) => loaded.push(options));
        control.loadOptions('onSearch', 'ho', () => {});

        expect(jax.requests[0]).toMatchObject({ handler: 'onSearch', data: { term: 'ho', q: 'ho', _type: 'query' } });
        expect(jax.requests[1].data).toEqual({ term: 'ho', q: 'ho', _type: 'query:append', page: 2 });
        expect(loaded[0][0]).toMatchObject({ value: '1', text: 'Home' });
    });

    test('the handler waits for the minimum input length, explaining how many more characters it needs', () => {
        const jax = makeFakeJax();
        fakeRequest(jax, { results: [] });
        const control = connect('<select data-handler="onSearch" data-minimum-input-length="3" data-ajax--delay="250"></select>', 'select', jax);
        const ts = control.tomSelect;

        expect(ts.settings.shouldLoad('ab')).toBe(false);
        expect(ts.settings.shouldLoad('abc')).toBe(true);
        expect(ts.settings.loadThrottle).toBe(250);
        expect(ts.render('not_loading', { input: 'a' }).textContent).toBe('Please enter 2 or more characters');
    });

    test('a failed request says the results could not be loaded', () => {
        const jax = makeFakeJax();
        fakeRequest(jax, null, true);
        const control = connect('<select data-handler="onSearch"></select>', 'select', jax);

        control.loadOptions('onSearch', 'x', () => {});

        expect(control.tomSelect.render('no_results', {}).textContent).toBe('The results could not be loaded.');
    });
});

describe('custom select behaviour', () => {
    test('focus() moves the keyboard focus to the field without opening it, and focusing the hidden select does too', () => {
        const control = connect('<select><option>One</option></select>');
        const ts = control.tomSelect;

        control.focus();
        expect(document.activeElement).toBe(ts.focus_node);
        expect(ts.isOpen).toBe(false);

        document.body.focus();
        control.element.focus();
        expect(document.activeElement).toBe(ts.focus_node);
    });

    test('a value set on the select from outside reaches the field, without a second change', () => {
        const control = connect('<select><option value="">- Select -</option><option value="1">One</option><option value="2">Two</option></select>');
        let changes = 0;
        control.element.addEventListener('change', () => changes++);

        control.element.value = '2';
        control.element.dispatchEvent(new Event('change'));

        expect(control.tomSelect.getValue()).toBe('2');
        expect(changes).toBe(1);
    });

    test('refresh() reads the select again without a change event', () => {
        const control = connect('<select><option value="1">One</option><option value="2">Two</option></select>');
        let changes = 0;
        control.element.addEventListener('change', () => changes++);

        control.element.value = '2';
        control.refresh();

        expect(control.tomSelect.getValue()).toBe('2');
        expect(changes).toBe(0);
    });

    test('the field follows the select\'s disabled state', async () => {
        const control = connect('<select><option>One</option></select>');

        control.element.disabled = true;
        await Promise.resolve();
        expect(control.tomSelect.isDisabled).toBe(true);

        control.element.disabled = false;
        await Promise.resolve();
        expect(control.tomSelect.isDisabled).toBe(false);
    });

    test('a picked option posts through the select and dispatches change', () => {
        const control = connect('<select name="color"><option value="">-</option><option value="red">Red</option></select>');
        let changes = 0;
        control.element.addEventListener('change', () => changes++);

        control.tomSelect.addItem('red');

        expect(new FormData(Object.assign(document.createElement('form'), { innerHTML: '' })).get('color')).toBeNull();
        expect(control.element.value).toBe('red');
        expect(changes).toBe(1);
    });

    test('sorted tags post in their new order', () => {
        const control = connect('<select multiple data-sortable><option value="a" selected>A</option><option value="b" selected>B</option></select>');

        control.tomSelect.setValue(['b', 'a']);

        expect(Array.from(control.element.selectedOptions).map((option) => option.value)).toEqual(['b', 'a']);
    });

    test('disconnecting leaves a copy of the field while the page swaps the markup', () => {
        const control = connect('<div id="holder"><select><option>One</option></select></div>');
        started = [];

        control.disconnect();

        expect(document.querySelector('#holder .ts-wrapper.is-placeholder')).not.toBeNull();
        expect(control.tomSelect).toBeNull();

        control.connect();
        expect(document.querySelectorAll('#holder .ts-wrapper').length).toBe(1);
        control.disconnect();
    });
});

describe('custom select messages', () => {
    test('come from the translation for the field or page language, English without one', () => {
        getLanguages().de = { customselect: { noResults: 'Keine Übereinstimmungen gefunden' } };

        document.documentElement.lang = 'de-AT';
        expect(connect('<select><option>One</option></select>').tomSelect.render('no_results', {}).textContent).toBe('Keine Übereinstimmungen gefunden');

        document.documentElement.lang = 'en';
        expect(connect('<select data-language="de"><option>One</option></select>').tomSelect.render('no_results', {}).textContent).toBe('Keine Übereinstimmungen gefunden');
        expect(connect('<select><option>One</option></select>').tomSelect.render('no_results', {}).textContent).toBe(DEFAULT_LANG.noResults);
    });

    test('a translation the page has not bundled loads before the field starts', async () => {
        const control = connect('<select data-language="nl"><option>One</option></select>');

        expect(control.tomSelect).toBeNull();

        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(control.tomSelect).not.toBeNull();
        expect(control.tomSelect.render('no_results', {}).textContent).toBe('Geen resultaten gevonden');
    });
});
