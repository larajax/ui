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

const itemMenuTemplate = `<script type="text/template" data-item-menu-template>
    <a data-repeater-duplicate class="menu-item" role="menuitem" href="javascript:;">Duplicate</a>
    <hr class="menu-divider">
    <a data-repeater-expand class="menu-item" role="menuitem" href="javascript:;">Expand</a>
    <a data-repeater-collapse class="menu-item" role="menuitem" href="javascript:;">Collapse</a>
    <a data-repeater-move-up class="menu-item" role="menuitem" href="javascript:;">Move Up</a>
    <a data-repeater-move-down class="menu-item" role="menuitem" href="javascript:;">Move Down</a>
    <hr class="menu-divider">
    <a data-repeater-remove class="menu-item" role="menuitem" href="javascript:;">Remove</a>
</script>`;

const itemMenuItems = `<ul class="field-repeater-items">
    <li class="field-repeater-item" data-repeater-index="0">
        <div class="repeater-header">
            <div class="repeater-item-dropdown">
                <a href="javascript:;" class="repeater-item-menu" data-bs-toggle="menu" data-bs-placement="bottom-end"></a>
                <div class="menu control-dropdown" role="menu"></div>
            </div>
        </div>
    </li>
    <li class="field-repeater-item" data-repeater-index="1"></li>
</ul>`;

const itemMenuMarkup = `<div class="field-repeater">
    ${itemMenuTemplate}
    ${itemMenuItems}
</div>`;

const builderItemMenuMarkup = `<div class="field-repeater">
    <div class="field-repeater-builder">
        <ul class="field-repeater-groups"></ul>
    </div>
    ${itemMenuTemplate}
    <script type="text/template" data-group-template>
        <li class="field-repeater-group">
            <div class="group-controls" data-group-controls></div>
            <span class="group-image" data-group-image><i></i></span>
            <span class="group-title" data-group-title></span>
            <span class="group-description" data-group-description></span>
        </li>
    </script>
    ${itemMenuItems}
</div>`;

// openItemMenu dispatches the event Bootstrap's menu fires on the toggle before it opens.
function openItemMenu(element) {
    const toggle = element.querySelector('[data-bs-toggle="menu"]');
    toggle.dispatchEvent(new Event('show.bs.menu', { bubbles: true, cancelable: true }));

    return toggle.nextElementSibling;
}

describe('repeater item menu', () => {
    test('opening an item menu fills it from the template as flat menu items', () => {
        const { control, element } = connect('repeateraccordion', itemMenuMarkup);
        control.canRemove = false;

        const menu = openItemMenu(element);

        expect(menu.querySelectorAll(':scope > .menu-item').length).toBe(6);
        expect(menu.querySelectorAll(':scope > .menu-divider').length).toBe(2);
        expect(menu.querySelector('[data-repeater-remove]').classList.contains('disabled')).toBe(true);
        expect(menu.querySelector('[data-repeater-duplicate]').classList.contains('disabled')).toBe(false);
        expect(menu.querySelector('[data-repeater-move-up]').style.display).toBe('none');
        expect(menu.querySelector('[data-repeater-move-down]').style.display).toBe('');
        expect(menu.querySelector('[data-repeater-expand]').style.display).toBe('none');
        expect(menu.querySelector('[data-repeater-collapse]').style.display).toBe('');
    });

    test('the builder hides the expand and collapse items', () => {
        const { element } = connect('repeaterbuilder', builderItemMenuMarkup);

        const menu = openItemMenu(element);

        expect(menu.querySelector('[data-repeater-expand]').style.display).toBe('none');
        expect(menu.querySelector('[data-repeater-collapse]').style.display).toBe('none');
    });

    test('a busy toolbar disables every item in the menu', () => {
        const { control, element } = connect('repeateraccordion', itemMenuMarkup);
        control.toolbarBusy = true;

        const menu = openItemMenu(element);
        const items = Array.from(menu.querySelectorAll('.menu-item'));

        expect(items.length).toBe(6);
        expect(items.every((item) => item.classList.contains('disabled'))).toBe(true);
    });

    test('a disabled remove item sends no request while an enabled one does', () => {
        const { control, element } = connect('repeateraccordion', itemMenuMarkup);
        const handlers = [];
        jax.request = (el, handler) => handlers.push(handler);

        control.canRemove = false;
        openItemMenu(element).querySelector('[data-repeater-remove]').click();
        expect(handlers).toEqual([]);

        control.canRemove = true;
        openItemMenu(element).querySelector('[data-repeater-remove]').click();
        expect(handlers).toEqual(['onRemoveItem']);

        delete jax.request;
    });
});
