import { afterEach, describe, expect, test } from 'bun:test';
import { Popover } from '../resources/assets/controls/popover/popover.js';
import { registerRowlink } from '../resources/assets/controls/rowlink/rowlink-control.js';
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
    test('mounts inside an enclosing modal so it stacks above the backdrop', () => {
        document.body.innerHTML = '<div class="modal show"><button id="trigger">Open</button></div>';
        const trigger = document.getElementById('trigger');

        const popover = new Popover(trigger, { content: '<p>Hi</p>' });
        popover.show();

        expect(popover.element.parentElement).toBe(document.querySelector('.modal'));
    });

    test('mounts on the body outside a modal', () => {
        document.body.innerHTML = '<div class="toolbar"><button id="trigger">Open</button></div>';

        const popover = new Popover(document.getElementById('trigger'), { content: '<p>Hi</p>' });
        popover.show();

        expect(popover.element.parentElement).toBe(document.body);
    });

    test('uses an explicit container when one is given', () => {
        document.body.innerHTML = '<div class="modal show"><button id="trigger">Open</button></div><div id="holder"></div>';
        const holder = document.getElementById('holder');

        const popover = new Popover(document.getElementById('trigger'), { content: '<p>Hi</p>', container: holder });
        popover.show();

        expect(popover.element.parentElement).toBe(holder);
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
