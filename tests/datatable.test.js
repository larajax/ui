import { afterAll, afterEach, beforeAll, describe, expect, mock, test } from 'bun:test';
import { readFileSync } from 'fs';

// The grid source itself rather than a stand-in, so the control is tested against its real behavior
import * as Hotsheet from '../packages/hotsheet/src/index.js';
import { installPopoverStandIn } from '../packages/hotsheet/tests/popover.js';

mock.module('../resources/assets/vendor/hotsheet/hotsheet.js', () => Hotsheet);

const { registerDataTable } = await import('../resources/assets/formwidgets/datatable/datatable.js');
const { validateValue, hasRequiredRule, DEFAULT_MESSAGES } = await import('../resources/assets/formwidgets/datatable/datatable.validation.js');

function parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value !== '' && !isNaN(Number(value))) return Number(value);
    const first = value.charAt(0);
    if (first === '{' || first === '[') return JSON.parse(value);
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

        listen(name, target, handler) {
            if (typeof target === 'string') {
                this.element.addEventListener(name, (event) => {
                    if (event.target.closest && event.target.closest(target)) {
                        handler.call(this, event);
                    }
                });
                return;
            }

            target.addEventListener(name, handler.bind(this));
        }
    }

    return {
        controls: new Map(),
        requests: [],
        flashes: [],
        ControlBase,
        registerControl(id, control) {
            this.controls.set(id, control);
        },
        request(element, handler, options) {
            this.requests.push({ element, handler, options });
        },
        flashMsg(options) {
            this.flashes.push(options);
        }
    };
}

let jax;
let removePopoverStandIn;

beforeAll(() => {
    jax = makeFakeJax();
    registerDataTable(jax);
    removePopoverStandIn = installPopoverStandIn();
});

afterAll(() => {
    removePopoverStandIn();
});

afterEach(() => {
    document.body.innerHTML = '';
    jax.requests.length = 0;
    jax.flashes.length = 0;
});

const COLUMNS = [
    { data: 'country', title: 'Country', type: 'text' },
    { data: 'state', title: 'State', type: 'text' },
    { data: 'qty', title: 'Qty', type: 'numeric' }
];

// The toolbar search as the partial renders it, an input inside an adorned field
const SEARCH_TOOLBAR = `
    <div class="toolbar" data-table-toolbar>
        <div class="toolbar-search">
            <label class="form-control form-adorn">
                <span class="form-adorn-icon" aria-hidden="true"><i></i></span>
                <input type="text" class="form-ghost" aria-label="Search..." placeholder="Search..." data-table-search>
            </label>
        </div>
    </div>
`;

function field({ rows = [{ country: 'AU', state: 'NSW', qty: 1 }, { country: 'US', state: 'CA', qty: 2 }], value, columns = COLUMNS, ajaxColumns = [], dependencies = { state: 'country' }, attributes = '', toolbar = '' } = {}) {
    const saved = value !== undefined ? value : JSON.stringify(rows);

    return `
        <form data-request="onSave">
            <div class="field-datatable" data-control="datatable" data-alias="formLines"
                data-columns='${JSON.stringify(columns)}' data-hot-options='{"minRows":1}' data-ajax-columns='${JSON.stringify(ajaxColumns)}'
                data-column-dependencies='${JSON.stringify(dependencies)}' data-data-locker="#locker" data-adding="true" data-deleting="true"
                ${attributes}>
                ${toolbar}
                <div data-hot-container></div>
                <input type="hidden" id="locker" name="lines" value='${saved}'>
            </div>
        </form>
    `;
}

function connect(html) {
    document.body.innerHTML = html;
    const element = document.querySelector('[data-control="datatable"]');
    const control = new (jax.controls.get('datatable'))(element);
    control.init();
    control.connect();

    return { element, control, sheet: control.hot, locker: () => JSON.parse(document.querySelector('#locker').value) };
}

function sendRequest(handler) {
    const event = new CustomEvent('ajax:setup', { bubbles: true, cancelable: true, detail: { context: { handler } } });
    document.querySelector('form').dispatchEvent(event);
    return event;
}

describe('datatable control', () => {
    test('mounts the grid with the saved rows and keeps them as they were', () => {
        const { sheet, locker } = connect(field());

        expect(sheet.getRowCount()).toBe(2);
        expect(locker()).toEqual([{ country: 'AU', state: 'NSW', qty: 1 }, { country: 'US', state: 'CA', qty: 2 }]);
    });

    test('reads a saved list keyed as an object instead of losing it', () => {
        const { sheet, locker } = connect(field({ value: '{"1":{"country":"AU"},"3":{"country":"US"}}' }));

        expect(sheet.getRowCount()).toBe(2);
        expect(locker()).toEqual([{ country: 'AU' }, { country: 'US' }]);
    });

    test('saves each change and fires change on the hidden input', () => {
        const { sheet, locker } = connect(field());
        let changes = 0;
        document.querySelector('#locker').addEventListener('change', () => changes++);

        sheet.setCells([{ row: 0, col: 0, value: 'NZ' }]);

        expect(changes).toBe(1);
        expect(locker()[0].country).toBe('NZ');
    });

    test('resets a dependent column within the same change, so one undo puts both back', () => {
        const { sheet, locker } = connect(field());

        sheet.setCells([{ row: 0, col: 0, value: 'NZ' }]);
        expect(locker()[0]).toMatchObject({ country: 'NZ', state: null });

        sheet.undo();
        expect(locker()[0]).toMatchObject({ country: 'AU', state: 'NSW' });
    });

    test('resets a dependent column when any column in its list changes', () => {
        const { sheet, locker } = connect(field({ dependencies: { state: ['country', 'qty'] } }));

        sheet.setCells([{ row: 1, col: 2, value: 5 }]);

        expect(locker()[1]).toMatchObject({ qty: 5, state: null });
    });

    test('keeps a dependent value set by the same change, as an import does', () => {
        const { sheet, locker } = connect(field());

        sheet.writeValues(0, 0, [['US', 'TX']], 'import');

        expect(locker()[0]).toMatchObject({ country: 'US', state: 'TX' });
    });

    test('takes a value still being typed when the form saves', () => {
        const { sheet, locker } = connect(field());

        sheet.select(0, 1);
        sheet.openEditor('full');
        sheet.editor.textarea.value = 'VIC';
        sendRequest('onSave');

        expect(sheet.isEditing()).toBe(false);
        expect(locker()[0].state).toBe('VIC');
    });

    test('leaves the editor open for its own requests, such as loading options', () => {
        const { sheet } = connect(field());

        sheet.select(0, 1);
        sheet.openEditor('full');
        sendRequest('formLines::onGetDropdownOptions');

        expect(sheet.isEditing()).toBe(true);
    });

    test('with requireValid, blocks a save on a cell its type flags and says why', () => {
        const { sheet } = connect(field({ attributes: 'data-require-valid="true"' }));

        sheet.setCells([{ row: 1, col: 2, value: 'many' }]);
        const save = sendRequest('onSave');

        expect(save.defaultPrevented).toBe(true);
        expect(jax.flashes[0]).toMatchObject({ message: 'The value is not valid.', type: 'error' });
        expect(sheet.getSelection().anchor).toEqual({ row: 1, col: 2 });
    });

    test('with requireValid, lets requests that do not save through', () => {
        const { sheet } = connect(field({ attributes: 'data-require-valid="true"' }));

        sheet.setCells([{ row: 1, col: 2, value: 'many' }]);

        expect(sendRequest('formLines::onExportCsv').defaultPrevented).toBe(false);
    });

    test('adds and deletes rows with Alt+A and Alt+D by the physical key, and keeps disallowed ones from the grid', () => {
        const { control, sheet } = connect(field());

        sheet.select(0, 0);
        expect(control.onShortcut({ altKey: true, code: 'KeyA', key: 'å' }, sheet)).toBe(true);
        expect(sheet.getRowCount()).toBe(3);

        expect(control.onShortcut({ altKey: true, code: 'KeyD', key: '∂' }, sheet)).toBe(true);
        expect(sheet.getRowCount()).toBe(2);

        control.config.adding = false;
        expect(control.onShortcut({ altKey: true, code: 'KeyA', key: 'a' }, sheet)).toBe(true);
        expect(sheet.getRowCount()).toBe(2);
    });

    test('labels its menu from data-lang', () => {
        const { control, sheet } = connect(field({ attributes: `data-lang='{"removeRow":"Zeile entfernen"}'` }));

        sheet.select(0, 0);
        const labels = control.buildContextMenu(sheet, { row: 0, col: 0 }).map((item) => item.label);

        expect(labels).toContain('Zeile entfernen');
        expect(labels).toContain('Undo');
    });

    test('fires datatable:new-row for rows a paste adds', () => {
        const { element, sheet } = connect(field());
        const added = [];
        element.addEventListener('datatable:new-row', (event) => added.push(event.detail.row));

        sheet.select(1, 0);
        sheet.paste('X\nY\nZ');

        expect(added).toHaveLength(2);
        expect(sheet.getRowCount()).toBe(4);
    });

    test('labels saved keys from the options loaded with the field, and opens the editor without a request', async () => {
        const columns = [{ data: 'country', title: 'Country', type: 'text' }, { data: 'city', title: 'City', type: 'dropdown', strict: true }];
        const preloaded = { city: [{ values: { country: 'US' }, options: { 'new-york': 'New York', chicago: 'Chicago' } }] };
        const { sheet } = connect(field({
            rows: [{ country: 'US', city: 'new-york' }, { country: 'US', city: 'chicago' }, { country: 'NZ', city: 'auckland' }],
            columns,
            ajaxColumns: ['city'],
            dependencies: { city: 'country' },
            attributes: `data-preloaded-options='${JSON.stringify(preloaded)}'`
        }));

        expect([0, 1, 2].map((row) => sheet.getCellElement(row, 1).textContent)).toEqual(['New York', 'Chicago', 'auckland']);

        sheet.select(1, 1);
        sheet.openEditor('full');
        expect(sheet.editor.getValue()).toBe('Chicago');
        await sheet.updateOptions();

        expect(jax.requests).toHaveLength(0);
        expect(sheet.optionList.items.map((item) => item.label)).toEqual(['New York', 'Chicago']);
    });

    test('still asks the model for rows whose dependency values were not loaded with the field', () => {
        const columns = [{ data: 'country', title: 'Country', type: 'text' }, { data: 'city', title: 'City', type: 'dropdown' }];
        const preloaded = { city: [{ values: { country: 'US' }, options: { 'new-york': 'New York' } }] };
        const { sheet } = connect(field({
            rows: [{ country: 'US', city: 'new-york' }, { country: 'NZ', city: null }],
            columns,
            ajaxColumns: ['city'],
            dependencies: { city: 'country' },
            attributes: `data-preloaded-options='${JSON.stringify(preloaded)}'`
        }));

        sheet.select(1, 1);
        sheet.openEditor('full');

        expect(jax.requests).toHaveLength(1);
        expect(jax.requests[0].handler).toBe('formLines::onGetDropdownOptions');
        expect(jax.requests[0].options.data).toEqual({ column: 'city', rowData: { country: 'NZ', city: null } });
    });

    test('in read-only mode edits nothing, offers no row actions and sends no requests', () => {
        const { control, sheet, locker } = connect(field({ attributes: 'data-read-only="true" data-require-valid="true"' }));

        expect(sheet.options.readOnly).toBe(true);

        sheet.select(0, 0);
        expect(sheet.openEditor('full')).toBe(false);
        expect(control.onShortcut({ altKey: true, code: 'KeyA', key: 'a' }, sheet)).toBe(true);
        expect(control.onShortcut({ altKey: true, code: 'KeyD', key: 'd' }, sheet)).toBe(true);
        expect(sheet.getRowCount()).toBe(2);
        expect(control.buildContextMenu(sheet, { row: 0, col: 0 })).toEqual([]);

        control.importCsv('country\nFR');
        expect(jax.requests).toHaveLength(0);

        sheet.setCells([{ row: 1, col: 2, value: 'many' }]);
        expect(sendRequest('onSave').defaultPrevented).toBe(false);
        expect(locker()[0]).toEqual({ country: 'AU', state: 'NSW', qty: 1 });
    });

    test('says why a save is blocked in the translated rule message', () => {
        const columns = COLUMNS.map((col) => (col.data === 'qty' ? { ...col, _validation: { integer: { max: { value: 10 } } } } : col));
        const { sheet } = connect(field({
            columns,
            attributes: `data-require-valid="true" data-lang='{"ruleMax":"Höchstens :max"}'`
        }));

        sheet.setCells([{ row: 0, col: 2, value: 50 }]);

        expect(sendRequest('onSave').defaultPrevented).toBe(true);
        expect(jax.flashes[0].message).toBe('Höchstens 10');
        expect(sheet.getInvalidMessage(0, 2)).toBe('Höchstens 10');
    });

    test('ignores an import answer that arrives after the field is gone', () => {
        const { control } = connect(field());

        control.importCsv('country\nFR');
        const { options } = jax.requests[0];
        control.disconnect();

        expect(() => options.success({ rows: [{ country: 'FR' }] })).not.toThrow();
    });

    test('searches the grid as text is typed into the adorned toolbar search', () => {
        const { element, sheet } = connect(field({ toolbar: SEARCH_TOOLBAR }));
        const search = element.querySelector('.form-adorn [data-table-search]');

        search.value = 'nsw';
        search.dispatchEvent(new Event('input', { bubbles: true }));
        expect(sheet.getSearchHits()).toEqual([{ row: 0, col: 1 }]);

        search.value = '';
        search.dispatchEvent(new Event('input', { bubbles: true }));
        expect(sheet.getSearchHits()).toEqual([]);
    });
});

describe('datatable validation rules', () => {
    test('checks required values, trimming spaces, with the rule message or the default', () => {
        expect(validateValue({ required: {} }, '  ')).toBe('The value should not be empty.');
        expect(validateValue({ required: { message: 'Enter a SKU' } }, null)).toBe('Enter a SKU');
        expect(validateValue({ required: {} }, 0)).toBe(null);
    });

    test('applies a rule with requiredWith only when the other column has a value', () => {
        const rules = { required: { requiredWith: 'slug', message: 'Email is needed with a slug' } };

        expect(validateValue(rules, '', { slug: '' })).toBe(null);
        expect(validateValue(rules, '', { slug: 'a-slug' })).toBe('Email is needed with a slug');
        expect(validateValue(rules, '', { slug: true })).toBe('Email is needed with a slug');
        expect(validateValue(rules, '', { slug: false })).toBe(null);
    });

    test('checks positive integers unless negatives are allowed, with min and max messages', () => {
        expect(validateValue({ integer: {} }, '-5')).toBe('The value should be a positive integer');
        expect(validateValue({ integer: { allowNegative: true } }, '-5')).toBe(null);
        expect(validateValue({ integer: {} }, '1.5')).toBe('The value should be a positive integer');
        expect(validateValue({ integer: { min: { value: 1, message: 'Order at least 1' } } }, '0')).toBe('Order at least 1');
        expect(validateValue({ integer: { max: { value: 100 } } }, '500')).toBe('The value should not be more than 100');
        expect(validateValue({ integer: {} }, 42)).toBe(null);
    });

    test('checks plain decimal numbers', () => {
        expect(validateValue({ float: {} }, '3.14')).toBe(null);
        expect(validateValue({ float: {} }, '1.')).toBe('The value should be a positive floating point number');
        expect(validateValue({ float: { allowNegative: true } }, '-2.5')).toBe(null);
        expect(validateValue({ float: { message: 'Price must be a number' } }, 'abc')).toBe('Price must be a number');
    });

    test('checks text length and patterns with modifiers', () => {
        expect(validateValue({ length: { min: { value: 3 } } }, 'ab')).toBe('The string should not be shorter than 3');
        expect(validateValue({ length: { max: { value: 6, message: 'Too long' } } }, 'abcdefgh')).toBe('Too long');
        expect(validateValue({ regex: { pattern: '^[a-z-]+$' } }, 'ABC')).toBe('Invalid value format.');
        expect(validateValue({ regex: { pattern: '^[a-z-]+$', modifiers: 'i' } }, 'ABC')).toBe(null);
    });

    test('skips empty values for every rule but required, and returns the first failing rule', () => {
        expect(validateValue({ integer: {}, length: { min: { value: 3 } } }, '')).toBe(null);
        expect(validateValue({ length: { min: { value: 3, message: 'Short' } }, integer: { message: 'Number' } }, 'ab')).toBe('Short');
    });

    test('takes translated default messages, filling in their placeholders', () => {
        const messages = { ruleRequired: 'Darf nicht leer sein.', ruleMaxLength: 'Höchstens :max Zeichen' };

        expect(validateValue({ required: {} }, '', {}, messages)).toBe('Darf nicht leer sein.');
        expect(validateValue({ length: { max: { value: 3 } } }, 'abcd', {}, messages)).toBe('Höchstens 3 Zeichen');
        expect(validateValue({ length: { min: { value: 3 } } }, 'ab', {}, messages)).toBe('The string should not be shorter than 3');
        expect(validateValue({ required: { message: 'Enter a SKU' } }, '', {}, messages)).toBe('Enter a SKU');
    });

    test('tells whether a column has a required rule', () => {
        expect(hasRequiredRule({ required: { requiredWith: 'x' } })).toBe(true);
        expect(hasRequiredRule({ integer: {} })).toBe(false);
        expect(hasRequiredRule(null)).toBe(false);
    });
});

describe('datatable form widget', () => {
    const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

    test('lists the same strings as the control, validation and grid defaults', () => {
        const php = read('../src/FormWidgets/DataTable.php');
        const phpBlock = php.slice(php.indexOf('$strings = ['), php.indexOf('];', php.indexOf('$strings = [')));
        const strings = {};
        for (const match of phpBlock.matchAll(/'(\w+)' => '((?:[^'\\]|\\.)*)'/g)) {
            strings[match[1]] = match[2].replace(/\\(.)/g, '$1');
        }

        const js = read('../resources/assets/formwidgets/datatable/datatable.js');
        const jsBlock = js.slice(js.indexOf('const DEFAULT_LANG = {'), js.indexOf('};', js.indexOf('const DEFAULT_LANG = {')));
        const defaults = {};
        for (const match of jsBlock.matchAll(/(\w+): '((?:[^'\\]|\\.)*)'/g)) {
            defaults[match[1]] = match[2].replace(/\\(.)/g, '$1');
        }

        expect(strings).toEqual({ ...defaults, ...DEFAULT_MESSAGES, ...Hotsheet.defaultLang });
    });

    test('renders toolbar icons that every icon pack defines', () => {
        const partial = read('../src/FormWidgets/DataTable/partials/_datatable.php');
        const used = Array.from(partial.matchAll(/Ui::icon\('(datatable\.\w+)'\)/g), (match) => match[1]);

        expect(used).toEqual(['datatable.add', 'datatable.delete', 'datatable.export', 'datatable.import']);

        ['Phosphor', 'Bootstrap', 'October'].forEach((pack) => {
            const source = read('../src/Classes/Icons/' + pack + 'IconPack.php');
            const keys = Array.from(source.matchAll(/'(datatable\.\w+)' => '[^']+'/g), (match) => match[1]);

            expect(keys).toEqual(used);
        });
    });

    test('renders the toolbar search as an input inside an adorned field with the search icon', () => {
        const partial = read('../src/FormWidgets/DataTable/partials/_datatable.php');
        const search = partial.slice(partial.indexOf('<div class="toolbar-search">'), partial.indexOf('</label>') + 8);

        expect(search).toContain('<label class="form-control form-adorn">');
        expect(search).toContain('<span class="form-adorn-icon" aria-hidden="true">');
        expect(search).toContain("Ui::icon('search.icon')");
        expect(search).toMatch(/<input type="text" class="form-ghost" aria-label="[^"]+" placeholder="[^"]+" data-table-search>/);
    });
});
