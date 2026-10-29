import { afterEach, beforeAll, describe, expect, mock, test } from 'bun:test';
import {
    FakeMultiDrag,
    FakeSortable,
    fakeSortableModule,
    mountedPlugins,
    resetFakeSortable,
    selected,
    sortables
} from './support/fake-sortable.js';

mock.module('../resources/assets/vendor/sortablejs/sortable.esm.js', () => fakeSortableModule);

const { registerRepeaterAccordion } = await import('../resources/assets/formwidgets/repeater/repeater-accordion.js');
const { registerRepeaterBuilder } = await import('../resources/assets/formwidgets/repeater/repeater-builder.js');

function makeFakeJax() {
    const controls = new Map();

    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = {};
            this.proxied = new Map();
        }

        proxy(method) {
            if (!this.proxied.has(method)) {
                this.proxied.set(method, method.bind(this));
            }
            return this.proxied.get(method);
        }

        listen(eventName, handler, options) {
            this.element.addEventListener(eventName, this.proxy(handler), options);
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
    resetFakeSortable();
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

// Waits for the lazily imported SortableJS to bind
function flush() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

async function connectWith(id, markup, config = {}) {
    document.body.innerHTML = markup;

    const element = document.querySelector('.field-repeater'),
        control = new (jax.controls.get(id))(element);

    Object.assign(control.config, config);
    control.init();
    control.connect();
    await flush();

    return { control, element, sortable: control.sortable };
}

const sortItem = (index, title) => `<li class="field-repeater-item" data-repeater-index="${index}">
    <div class="repeater-header">
        <div class="repeater-item-title">${title}</div>
        <div class="repeater-item-checkbox"><input class="check" type="checkbox" name="checked[]"></div>
        <div class="repeater-item-reorder"><a href="javascript:;" class="repeater-item-handle"></a></div>
    </div>
    <div class="repeater-content"></div>
</li>`;

const accordionMarkup = (count = 3) => `<div class="field-repeater">
    <ul class="field-repeater-items">
        ${Array.from({ length: count }, (value, index) => sortItem(index, 'Item ' + index)).join('')}
    </ul>
</div>`;

const builderMarkup = (count = 3) => `<div class="field-repeater">
    <div class="field-repeater-builder">
        <ul class="field-repeater-groups"></ul>
    </div>
    <script type="text/template" data-group-template>
        <li class="field-repeater-group">
            <div class="group-controls" data-group-controls></div>
            <span class="group-image" data-group-image><i></i></span>
            <span class="group-title" data-group-title></span>
            <span class="group-description" data-group-description></span>
        </li>
    </script>
    <ul class="field-repeater-items">
        ${Array.from({ length: count }, (value, index) => sortItem(index, 'Item ' + index)).join('')}
    </ul>
</div>`;

function itemOrder(container) {
    return Array.from(container.children).map((el) => el.dataset.repeaterIndex);
}

function setChecked(item, checked) {
    const checkbox = item.querySelector('input[type=checkbox]');
    checkbox.checked = checked;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
}

function pressHandle(item) {
    item.querySelector('.repeater-item-handle').dispatchEvent(new Event('pointerdown', { bubbles: true }));
}

function countChanges(element) {
    const changes = [];
    document.addEventListener('change', (ev) => {
        if (ev.target === element) {
            changes.push(ev);
        }
    });
    return changes;
}

describe('repeater sorting', () => {
    test('the accordion sorts its items with the handle, animation and multi-drag options', async () => {
        const { element, sortable } = await connectWith('repeateraccordion', accordionMarkup());

        expect(sortable.element).toBe(element.querySelector(':scope > .field-repeater-items'));
        expect(sortable.options).toMatchObject({
            animation: 150,
            multiDrag: true,
            avoidImplicitDeselect: true,
            handle: '.repeater-item-handle',
            forceAutoScrollFallback: true,
            scrollSensitivity: 60,
            scrollSpeed: 20
        });

        // The MultiDrag plugin mounts once and brings the selection utils
        expect(mountedPlugins).toHaveLength(1);
        expect(mountedPlugins[0]).toBeInstanceOf(FakeMultiDrag);
        expect(typeof FakeSortable.utils.select).toBe('function');

        await connectWith('repeateraccordion', accordionMarkup());
        expect(mountedPlugins).toHaveLength(1);
    });

    test('the builder sorts its group sidebar', async () => {
        const { element, sortable } = await connectWith('repeaterbuilder', builderMarkup());

        expect(sortable.element).toBe(element.querySelector('.field-repeater-groups'));
        expect(itemOrder(sortable.element)).toEqual(['0', '1', '2']);
    });

    test('reorder off binds no Sortable', async () => {
        const { control } = await connectWith('repeateraccordion', accordionMarkup(), { useReorder: false });

        expect(control.sortable).toBeUndefined();
        expect(sortables).toEqual([]);
    });

    test('a repeater removed before Sortable loads binds nothing', async () => {
        document.body.innerHTML = accordionMarkup();

        const control = new (jax.controls.get('repeateraccordion'))(document.querySelector('.field-repeater'));
        control.init();
        control.connect();
        control.disconnect();
        await flush();

        expect(control.sortable).toBe(null);
        expect(sortables).toEqual([]);
    });

    test('disconnecting destroys the Sortable', async () => {
        const { control, sortable } = await connectWith('repeateraccordion', accordionMarkup());

        control.disconnect();

        expect(sortable.destroyed).toBe(true);
        expect(control.sortable).toBe(null);
    });

    test('a drop notifies the form with a bubbling change', async () => {
        const { element, sortable } = await connectWith('repeateraccordion', accordionMarkup());
        const items = element.querySelector('.field-repeater-items'),
            changes = countChanges(element);

        items.prepend(items.children[2]);
        sortable.options.onEnd({ item: items.children[0] });

        expect(itemOrder(items)).toEqual(['2', '0', '1']);
        expect(changes).toHaveLength(1);
    });

    test('a builder drop reorders the items to follow the sidebar', async () => {
        const { element, sortable } = await connectWith('repeaterbuilder', builderMarkup());
        const sidebar = element.querySelector('.field-repeater-groups'),
            items = element.querySelector(':scope > .field-repeater-items'),
            changes = countChanges(element);

        sidebar.prepend(sidebar.children[2]);
        sortable.options.onEnd({ item: sidebar.children[0] });

        expect(itemOrder(items)).toEqual(['2', '0', '1']);
        expect(sortable.options.disabled).toBe(false);
        expect(changes).toHaveLength(1);
    });

    test('move up and down reorder through the same end handling', async () => {
        const { control, element } = await connectWith('repeaterbuilder', builderMarkup());
        const sidebar = element.querySelector('.field-repeater-groups'),
            items = element.querySelector(':scope > .field-repeater-items'),
            changes = countChanges(element);

        control.clickMoveItemDown({}, sidebar.children[0].querySelector('.repeater-item-handle'));

        expect(itemOrder(sidebar)).toEqual(['1', '0', '2']);
        expect(itemOrder(items)).toEqual(['1', '0', '2']);

        control.clickMoveItemUp({}, sidebar.children[2].querySelector('.repeater-item-handle'));

        expect(itemOrder(items)).toEqual(['1', '2', '0']);
        expect(changes).toHaveLength(2);
    });

    test('checked items join the multi-drag selection and unchecked items leave it', async () => {
        const { element } = await connectWith('repeateraccordion', accordionMarkup());
        const [first, second] = element.querySelectorAll('.field-repeater-item');

        setChecked(first, true);
        setChecked(second, true);

        expect(selected).toEqual([first, second]);
        expect(first.classList.contains('is-checked')).toBe(true);

        setChecked(first, false);

        expect(selected).toEqual([second]);
        expect(first.classList.contains('is-checked')).toBe(false);
    });

    test('checked builder items select their group in the sidebar', async () => {
        const { element } = await connectWith('repeaterbuilder', builderMarkup());
        const group = element.querySelectorAll('.field-repeater-group')[1];

        setChecked(group, true);

        expect(selected).toEqual([group]);
    });

    test('pressing a handle makes the selection match the checked items', async () => {
        const { element } = await connectWith('repeateraccordion', accordionMarkup());
        const [first, second, third] = element.querySelectorAll('.field-repeater-item');

        setChecked(second, true);
        setChecked(third, true);

        // A handle click selects its unchecked item, and another repeater's selection drops these
        selected.length = 0;
        second.classList.remove('sortable-selected');
        third.classList.remove('sortable-selected');
        FakeSortable.utils.select(first);

        pressHandle(second);

        expect(selected).toEqual([second, third]);
        expect(first.classList.contains('sortable-selected')).toBe(false);
    });

    test('a multi-drag keeps the checked items together in the builder', async () => {
        const { element, sortable } = await connectWith('repeaterbuilder', builderMarkup(4));
        const sidebar = element.querySelector('.field-repeater-groups'),
            items = element.querySelector(':scope > .field-repeater-items'),
            groups = Array.from(sidebar.children);

        setChecked(groups[0], true);
        setChecked(groups[2], true);
        pressHandle(groups[0]);

        // Sortable drops the selected items together in their original order
        groups[3].after(groups[0], groups[2]);
        sortable.options.onEnd({ item: groups[0], items: [groups[0], groups[2]] });

        expect(selected).toEqual([groups[0], groups[2]]);
        expect(itemOrder(sidebar)).toEqual(['1', '3', '0', '2']);
        expect(itemOrder(items)).toEqual(['1', '3', '0', '2']);
    });

    test('a removed item leaves the selection first', async () => {
        const { control, element } = await connectWith('repeateraccordion', accordionMarkup());
        const first = element.querySelector('.field-repeater-item');

        setChecked(first, true);
        expect(selected).toEqual([first]);

        control.onRemoveItemSuccess([first]);

        expect(selected).toEqual([]);
        expect(first.isConnected).toBe(false);
        expect(control.itemCount).toBe(2);
    });

    test('nested repeaters never answer each other\'s handles or checkboxes', async () => {
        const { element } = await connectWith('repeateraccordion', `<div class="field-repeater outer">
            <ul class="field-repeater-items">
                <li class="field-repeater-item" data-repeater-index="0">
                    <div class="repeater-header">
                        <div class="repeater-item-checkbox"><input type="checkbox"></div>
                        <a href="javascript:;" class="repeater-item-handle"></a>
                    </div>
                    <div class="repeater-content">
                        <div class="field-repeater inner">
                            <ul class="field-repeater-items">${sortItem(0, 'Inner')}</ul>
                        </div>
                    </div>
                </li>
            </ul>
        </div>`);

        const outerItem = element.querySelector(':scope > .field-repeater-items > li'),
            innerItem = element.querySelector('.inner .field-repeater-item');

        setChecked(innerItem, true);
        expect(selected).toEqual([]);
        expect(innerItem.classList.contains('is-checked')).toBe(false);

        // A stale outer selection survives a press on the inner handle
        FakeSortable.utils.select(outerItem);
        pressHandle(innerItem);
        expect(selected).toEqual([outerItem]);

        pressHandle(outerItem);
        expect(selected).toEqual([]);
    });
});
