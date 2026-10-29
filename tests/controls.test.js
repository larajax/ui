import { afterEach, describe, expect, test } from 'bun:test';
import { Popover } from '../resources/assets/controls/popover/popover.js';
import { registerRowlink } from '../resources/assets/controls/rowlink/rowlink-control.js';
import { registerCustomSelect } from '../resources/assets/controls/custom-select/custom-select-control.js';
import { createRepeaterFormWidgetBase } from '../resources/assets/formwidgets/repeater/repeater.js';

// Reads data attributes like a browser's dataset, since happy-dom skips empty values when enumerating
function readDataAttributes(element) {
    const config = {};

    for (const attr of element.attributes) {
        if (attr.name.startsWith('data-')) {
            const key = attr.name.slice(5).replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
            config[key] = attr.value;
        }
    }

    return config;
}

function makeFakeJax() {
    const controls = new Map();

    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = readDataAttributes(element);
        }

        listen(eventName, targetOrHandler, handler) {
            if (targetOrHandler instanceof Element) {
                targetOrHandler.addEventListener(eventName, handler.bind(this));
            }
            else {
                this.element.addEventListener(eventName, targetOrHandler.bind(this));
            }
        }
    }

    return {
        controls,
        ControlBase,
        visits: [],
        registerControl(id, control) {
            controls.set(id, control);
        },
        visit(href) {
            this.visits.push(href);
        },
    };
}

afterEach(() => {
    Popover.hideActive();
    document.body.innerHTML = '';
});

describe('popover container', () => {
    test('mounts inside an enclosing dialog so it shares its top layer and stays interactive', () => {
        document.body.innerHTML = '<dialog open><button id="trigger">Open</button></dialog>';
        const trigger = document.getElementById('trigger');

        const popover = new Popover(trigger, { content: '<p>Hi</p>' });
        popover.show();

        expect(popover.element.parentElement).toBe(document.querySelector('dialog'));
    });

    test('mounts on the body outside a dialog', () => {
        document.body.innerHTML = '<div class="toolbar"><button id="trigger">Open</button></div>';

        const popover = new Popover(document.getElementById('trigger'), { content: '<p>Hi</p>' });
        popover.show();

        expect(popover.element.parentElement).toBe(document.body);
    });

    test('uses an explicit container when one is given', () => {
        document.body.innerHTML = '<dialog open><button id="trigger">Open</button></dialog><div id="holder"></div>';
        const holder = document.getElementById('holder');

        const popover = new Popover(document.getElementById('trigger'), { content: '<p>Hi</p>', container: holder });
        popover.show();

        expect(popover.element.parentElement).toBe(holder);
    });
});

describe('custom select dropdown', () => {
    function makeControl(html) {
        const jax = makeFakeJax();
        registerCustomSelect(jax);

        document.body.innerHTML = html;

        return new (jax.controls.get('custom-select'))(document.querySelector('select'));
    }

    function selectOptionsFor(html) {
        return makeControl(html).buildSelectOptions();
    }

    test('the dropdown joins an enclosing dialog', () => {
        const options = selectOptionsFor('<dialog open><select><option>One</option></select></dialog>');

        expect(options.dropdownParent[0]).toBe(document.querySelector('dialog'));
    });

    test('outside a dialog Select2 keeps its body default', () => {
        const options = selectOptionsFor('<select><option>One</option></select>');

        expect(options.dropdownParent).toBeUndefined();
    });

    test('small and large selects give the dropdown a matching size class', () => {
        expect(selectOptionsFor('<select class="form-control form-control-sm"><option>One</option></select>').dropdownCssClass).toContain('select-dropdown-sm');
        expect(selectOptionsFor('<select class="form-control form-control-lg"><option>One</option></select>').dropdownCssClass).toContain('select-dropdown-lg');
        expect(selectOptionsFor('<select class="form-control"><option>One</option></select>').dropdownCssClass.trim()).toBe('');
    });

    test('the dropdown stays on its field inside a scrolled dialog', () => {
        const control = makeControl('<dialog style="position: fixed"><select><option>One</option><option>Two</option></select></dialog>');
        const dialog = document.querySelector('dialog');
        dialog.showModal();
        dialog.scrollTop = 120;

        control.init();
        control.bindCustomSelect();
        control.$el.select2('open');

        const container = control.$el.data('select2').dropdown.$dropdownContainer[0];

        try {
            expect(container.parentElement).toBe(dialog);
            expect(container.style.top).toBe('120px');
        }
        finally {
            control.$el.select2('destroy');
        }
    });

    test('a dropdown on the body is left to Select2', () => {
        const control = makeControl('<select><option>One</option><option>Two</option></select>');

        control.init();
        control.bindCustomSelect();

        try {
            expect(Object.hasOwn(control.$el.data('select2').dropdown, '_positionDropdown')).toBe(false);
        }
        finally {
            control.$el.select2('destroy');
        }
    });
});

describe('rowlink', () => {
    test('skips rows that carry the exclude class themselves', () => {
        const jax = makeFakeJax();
        registerRowlink(jax);

        document.body.innerHTML = `
            <table data-control="rowlink">
                <tbody>
                    <tr id="linked"><td><a href="/users/1">One</a></td></tr>
                    <tr id="excluded" class="nolink"><td><a href="/users/2">Two</a></td></tr>
                </tbody>
            </table>
        `;

        const control = new (jax.controls.get('rowlink'))(document.querySelector('table'));
        control.init?.();
        control.connect();

        expect(document.getElementById('linked').getAttribute('tabindex')).toBe('0');
        expect(document.getElementById('excluded').hasAttribute('tabindex')).toBe(false);
        expect(document.getElementById('excluded').classList.contains('rowlink')).toBe(false);
    });

    test('a click inside a nested exclude element of a linked cell does not follow the row link', () => {
        const jax = makeFakeJax();
        registerRowlink(jax);

        // Mirrors the tree toggle, a nolink anchor inside a nolink wrapper inside the linked cell
        document.body.innerHTML = `
            <table data-control="rowlink">
                <tbody>
                    <tr>
                        <td>
                            <div class="nolink">
                                <a href="javascript:;" class="tree-toggle nolink"><span id="toggle-icon"></span></a>
                            </div>
                            <a href="/categories/1/edit">Guides</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        const control = new (jax.controls.get('rowlink'))(document.querySelector('table'));
        control.init?.();
        control.connect();

        document.getElementById('toggle-icon').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(jax.visits).toEqual([]);

        document.querySelector('td').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(jax.visits).toEqual(['/categories/1/edit']);
    });
});

describe('repeater defaults', () => {
    function makeRepeater(attributes) {
        const jax = makeFakeJax();
        const RepeaterBase = createRepeaterFormWidgetBase(jax);

        document.body.innerHTML = `<div class="field-repeater" ${attributes}></div>`;
        const control = new RepeaterBase(document.querySelector('.field-repeater'));
        control.init();

        return control;
    }

    test('an empty boolean attribute stays falsy, as PHP renders false', () => {
        const control = makeRepeater('data-items-expanded="" data-use-reorder="" data-use-duplicate=""');

        expect(control.config.itemsExpanded).toBeFalsy();
        expect(control.config.useReorder).toBeFalsy();
        expect(control.config.useDuplicate).toBeFalsy();
    });

    test('a missing attribute takes the default', () => {
        const control = makeRepeater('data-use-reorder="1"');

        expect(control.config.itemsExpanded).toBe(true);
        expect(control.config.useDuplicate).toBe(true);
        expect(control.config.removeHandler).toBe('onRemoveItem');
    });
});
