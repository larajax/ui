import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { registerRepeaterAccordion } from '../resources/assets/formwidgets/repeater/repeater-accordion.js';
import { registerRepeaterBuilder } from '../resources/assets/formwidgets/repeater/repeater-builder.js';

function makeFakeJax() {
    const controls = new Map();

    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = {};
        }

        listen(eventName, handler) {
            this.element.addEventListener(eventName, handler.bind(this));
        }
    }

    return {
        controls,
        ControlBase,
        Events: {
            dispatch(eventName, { target = document, detail = {}, bubbles = true, cancelable = true } = {}) {
                const event = new CustomEvent(eventName, { detail, bubbles, cancelable });
                target.dispatchEvent(event);
                return event;
            }
        },
        registerControl(id, control) {
            controls.set(id, control);
        }
    };
}

let jax,
    counts,
    onRender,
    onResize;

beforeAll(() => {
    jax = makeFakeJax();
    registerRepeaterAccordion(jax);
    registerRepeaterBuilder(jax);
});

afterEach(() => {
    removeEventListener('render', onRender);
    removeEventListener('resize', onResize);
    document.body.innerHTML = '';
});

function countRelayouts() {
    counts = { render: 0, resize: 0 };
    onRender = () => counts.render++;
    onResize = () => counts.resize++;
    addEventListener('render', onRender);
    addEventListener('resize', onResize);
}

function connect(id, markup) {
    document.body.innerHTML = markup;

    const element = document.querySelector('.field-repeater'),
        control = new (jax.controls.get(id))(element);

    control.init();
    control.connect();

    return { control, element };
}

describe('repeater relayout', () => {
    test('expanding an accordion item dispatches the relayout signal', () => {
        const { element } = connect('repeateraccordion', `<div class="field-repeater">
            <ul class="field-repeater-items">
                <li class="field-repeater-item collapsed" data-repeater-index="0">
                    <div class="repeater-header"><h4 class="repeater-item-title">Item</h4></div>
                </li>
            </ul>
        </div>`);

        countRelayouts();
        element.querySelector('.repeater-item-title').click();

        expect(element.querySelector('.field-repeater-item').classList.contains('collapsed')).toBe(false);
        expect(counts.render).toBe(1);
        expect(counts.resize).toBe(1);
    });

    test('selecting a builder item dispatches the relayout signal', () => {
        const { element } = connect('repeaterbuilder', `<div class="field-repeater">
            <div class="field-repeater-builder">
                <ul class="field-repeater-groups">
                    <li class="field-repeater-group" data-repeater-index="0">First</li>
                    <li class="field-repeater-group" data-repeater-index="1">Second</li>
                </ul>
            </div>
            <ul class="field-repeater-items">
                <li class="field-repeater-item" data-repeater-index="0"></li>
                <li class="field-repeater-item" data-repeater-index="1"></li>
            </ul>
        </div>`);

        countRelayouts();
        element.querySelectorAll('.field-repeater-group')[1].click();

        expect(element.querySelector('.field-repeater-items > [data-repeater-index="1"]').classList.contains('is-selected')).toBe(true);
        expect(counts.render).toBe(1);
        expect(counts.resize).toBe(1);
    });
});
