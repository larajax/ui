import { afterEach, describe, expect, mock, test } from 'bun:test';
import { fakeSortableModule, sortables, resetFakeSortable } from './support/fake-sortable.js';

mock.module('../resources/assets/vendor/sortablejs/sortable.esm.js', () => fakeSortableModule);

const {
    isTouchEnabled,
    registerListStructureWidget
} = await import('../resources/assets/widgets/liststructure/liststructure.js');

// Mirrors the dataset value parsing of the real control base
function parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value !== '' && !isNaN(Number(value))) return Number(value);
    return value;
}

function makeFakeJax() {
    const controls = new Map();

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

        listen(eventName, handler, options) {
            this.element.addEventListener(eventName, this.proxy(handler), options);
        }
    }

    return {
        controls,
        ControlBase,
        requests: [],
        response: null,
        registerControl(id, control) {
            controls.set(id, control);
        },
        request(element, handler, options) {
            this.requests.push({ element, handler, data: options.data });
            return this.response || Promise.resolve({});
        }
    };
}

// Each row spec is [id, level] or an object with id, level, collapsed, childCount and className
function makeList(rowSpecs, attributes = {}) {
    const attrs = Object.assign({
        'data-reorder-handler': 'onReorder',
        'data-toggle-handler': 'onToggleTreeNode',
        'data-use-reorder': '1',
        'data-use-tree': '1',
        'data-drag-row': '1',
        'data-include-sort-orders': '',
        'data-indent-size': '18'
    }, attributes);

    const specs = rowSpecs.map((spec) => Array.isArray(spec) ? { id: spec[0], level: spec[1] } : spec);

    const rows = specs.map((spec, index) => {
        const next = specs[index + 1];
        const hasRenderedChildren = !!next && next.level > spec.level;
        const childCount = spec.childCount !== undefined ? spec.childCount : (hasRenderedChildren ? 1 : 0);
        const expanded = spec.collapsed ? 'false' : (hasRenderedChildren ? 'true' : 'false');

        return `
            <tr class="${spec.className || ''}" data-tree-id="${spec.id}" data-tree-level="${spec.level}" data-tree-expanded="${expanded}" data-tree-children="${childCount}">
                <td class="list-reorder nolink"><span class="list-reorder-handle"></span></td>
                <td class="list-cell-tree" style="padding-left:${spec.level * 18 + 15}px"><a href="/users/${spec.id}">Row ${spec.id}</a></td>
                <td class="list-cell-name-email">row${spec.id}@example.com</td>
            </tr>
        `;
    }).join('');

    const attrHtml = Object.entries(attrs).map(([name, value]) => `${name}="${value}"`).join(' ');

    document.body.innerHTML = `
        <div class="control-list" data-control="liststructurewidget" ${attrHtml}>
            <div class="list-content">
                <table class="table data"><tbody>${rows}</tbody></table>
            </div>
        </div>
    `;

    return document.querySelector('[data-control="liststructurewidget"]');
}

let mounted = [];
let originalMatchMedia = window.matchMedia;

// Waits for the lazily imported SortableJS to bind
function flush() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

async function mount(element, jax = makeFakeJax()) {
    registerListStructureWidget(jax);
    const Control = jax.controls.get('liststructurewidget');
    const control = new Control(element);
    control.init();
    control.connect();
    mounted.push(control);
    await flush();
    return { control, jax, sortable: control.sortable };
}

function row(id) {
    return document.querySelector(`tr[data-tree-id="${id}"]`);
}

function rowOrder() {
    return [...document.querySelector('tbody').children].map((el) => el.dataset.treeId);
}

// Starts a drag of a row the way Sortable's onStart reports a native dragstart
function dragStart(sortable, id, pageX = 10) {
    sortable.options.onStart({
        item: row(id),
        clone: row(id).cloneNode(true),
        originalEvent: { type: 'dragstart', pageX, clientX: pageX, clientY: 10 }
    });
}

// Moves the dragged row next to a target the way Sortable does, unless onMove rejects it
function dragOver(sortable, id, targetId, willInsertAfter) {
    const item = row(id),
        target = row(targetId);

    if (sortable.options.onMove({ related: target, willInsertAfter }) === false) {
        return false;
    }

    if (willInsertAfter) {
        target.after(item);
    }
    else {
        target.before(item);
    }

    sortable.options.onChange({ item });

    return true;
}

// Fires the native drag event that carries the pointer position
function dragX(control, pageX, clientY = 10) {
    control.element.querySelector('tbody').dispatchEvent(Object.assign(
        new Event('drag', { bubbles: true }),
        { pageX, clientX: pageX, clientY }
    ));
}

function drop(sortable, id) {
    sortable.options.onEnd({ item: row(id) });
}

afterEach(() => {
    mounted.forEach((control) => control.disconnect());
    mounted = [];
    resetFakeSortable();
    window.matchMedia = originalMatchMedia;
    document.body.innerHTML = '';
});

describe('sortable binding', () => {
    test('binds Sortable to the table body with the drag options', async () => {
        const { sortable } = await mount(makeList([[1, 0], [2, 0]]));

        expect(sortable.element).toBe(document.querySelector('tbody'));
        expect(sortable.options).toMatchObject({
            filter: '.no-sort',
            animation: 150,
            forceAutoScrollFallback: true,
            scrollSensitivity: 60,
            scrollSpeed: 20
        });
        expect(sortable.options.handle).toBeUndefined();
    });

    test('rows drag from the handle only when row dragging is off', async () => {
        const { sortable } = await mount(makeList([[1, 0]], { 'data-drag-row': '' }));

        expect(sortable.options.handle).toBe('.list-reorder-handle');
    });

    test('touch devices only drag from the handle', async () => {
        window.matchMedia = (query) => ({ matches: query === '(pointer: coarse)' });
        const { control, sortable } = await mount(makeList([[1, 0], [2, 0]]));

        expect(control.config.dragRow).toBe(false);
        expect(sortable.options.handle).toBe('.list-reorder-handle');
    });

    test('the native drag image is a hidden copy of the row, removed on drop', async () => {
        const { sortable } = await mount(makeList([[1, 0], [2, 0]]));
        let dragImage = null;

        sortable.options.setData({ setDragImage: (el, x, y) => (dragImage = { el, x, y }) }, row(1));

        const ghost = document.querySelector('body > .list-hidden-drag-ghost');
        expect(ghost).not.toBe(null);
        expect(ghost.dataset.treeId).toBe('1');
        expect(dragImage).toEqual({ el: ghost, x: 0, y: 0 });

        dragStart(sortable, 1);
        drop(sortable, 1);

        expect(document.querySelector('.list-hidden-drag-ghost')).toBe(null);
    });

    test('a list without reorder never loads Sortable', async () => {
        const { control } = await mount(makeList([[1, 0]], { 'data-use-reorder': '' }));

        expect(control.sortable).toBeUndefined();
        expect(sortables).toEqual([]);
    });

    test('disconnecting destroys the Sortable and any drag image', async () => {
        const { control, sortable } = await mount(makeList([[1, 0]]));

        sortable.options.setData({ setDragImage() {} }, row(1));
        control.disconnect();
        mounted = [];

        expect(sortable.destroyed).toBe(true);
        expect(document.querySelector('.list-hidden-drag-ghost')).toBe(null);
    });

    test('a list removed before Sortable loads binds nothing', async () => {
        const jax = makeFakeJax();
        registerListStructureWidget(jax);
        const control = new (jax.controls.get('liststructurewidget'))(makeList([[1, 0]]));
        control.init();
        control.connect();
        control.disconnect();
        await flush();

        expect(control.sortable).toBeUndefined();
        expect(sortables).toEqual([]);
    });
});

describe('tree structure', () => {
    test('collects a row\'s descendants in reverse order', async () => {
        const { control } = await mount(makeList([[1, 0], [2, 1], [3, 2], [4, 0]]));

        expect(control.getChildren(row(1)).map((el) => el.dataset.treeId)).toEqual(['3', '2']);
        expect(control.getChildren(row(2)).map((el) => el.dataset.treeId)).toEqual(['3']);
        expect(control.getChildren(row(4))).toEqual([]);
    });

    test('drag start hides the subtree and records its depth', async () => {
        const { control, sortable } = await mount(makeList([[1, 0], [2, 1], [3, 2], [4, 0]]));

        dragStart(sortable, 1, 40);

        expect(control.dragging).toBe(true);
        expect(control.dragStartX).toBe(40);
        expect(control.lastChildDiff).toBe(2);
        expect(row(2).style.display).toBe('none');
        expect(row(3).style.display).toBe('none');
        expect(document.querySelector('tbody').classList.contains('tree-drag-mode')).toBe(true);
    });
});

describe('indent boundaries', () => {
    test('the next row sets the minimum and the previous row allows one level deeper', async () => {
        const { control } = await mount(makeList([[1, 0], [2, 1], [3, 2], [4, 0], [5, 0]]));
        control.lastChildDiff = 0;

        expect(control.getIndentBoundaries(row(2), row(3))).toEqual({ min: 2, max: 2 });
        expect(control.getIndentBoundaries(row(4), row(5))).toEqual({ min: 0, max: 1 });
        expect(control.getIndentBoundaries(null, row(1))).toEqual({ min: 0, max: 0 });
    });

    test('a collapsed parent cannot take new children', async () => {
        const { control } = await mount(makeList([{ id: 1, level: 0, collapsed: true, childCount: 3 }, [4, 0]]));
        control.lastChildDiff = 0;

        expect(control.getIndentBoundaries(row(1), row(4))).toEqual({ min: 0, max: 0 });
    });

    test('max depth counts the dragged subtree', async () => {
        const { control } = await mount(makeList([[1, 0], [2, 1], [3, 0]], { 'data-max-depth': '3' }));
        control.lastChildDiff = 1;

        expect(control.getIndentBoundaries(row(2), null)).toEqual({ min: 0, max: 1 });
    });

    test('max check rejects a position whose next row is too deep for the subtree', async () => {
        const { control } = await mount(makeList([[1, 0], [2, 1], [3, 2]], { 'data-max-depth': '3' }));
        control.lastChildDiff = 1;

        expect(control.getIndentBoundaries(row(2), row(3), true)).toBe(false);
        expect(control.getIndentBoundaries(row(2), row(3))).toEqual({ min: 1, max: 1 });
    });

    test('max depth is optional and reflected as the deepest level index', async () => {
        expect((await mount(makeList([[1, 0]]))).control.getMaxDepth()).toBe(null);
        expect((await mount(makeList([[1, 0]], { 'data-max-depth': '' }))).control.getMaxDepth()).toBe(null);
        expect((await mount(makeList([[1, 0]], { 'data-max-depth': '3' }))).control.getMaxDepth()).toBe(2);
    });
});

describe('drag reorder', () => {
    test('dragging down and right nests the row and posts the move', async () => {
        const { control, jax, sortable } = await mount(makeList([[1, 0], [2, 0], [3, 0]]));

        dragStart(sortable, 1, 10);
        expect(dragOver(sortable, 1, 2, true)).toBe(true);
        expect(rowOrder()).toEqual(['2', '1', '3']);

        // Live indent preview while the pointer moves right
        dragX(control, 30);
        expect(row(1).querySelector('.list-cell-tree').style.paddingLeft).toBe('33px');

        drop(sortable, 1);

        expect(row(1).dataset.treeLevel).toBe('1');
        expect(jax.requests).toHaveLength(1);
        expect(jax.requests[0].handler).toBe('onReorder');
        expect(jax.requests[0].data).toEqual({ record_id: '1', parent_id: '2' });

        const tbody = document.querySelector('tbody');
        expect(tbody.classList.contains('tree-drag-mode')).toBe(false);
        expect(tbody.classList.contains('tree-drag-updated')).toBe(true);

        await Promise.resolve();
        await Promise.resolve();
        expect(tbody.classList.contains('tree-drag-updated')).toBe(false);
    });

    test('the indent preview is clamped to the neighbouring rows', async () => {
        const { control, sortable } = await mount(makeList([[1, 0], [2, 0], [3, 0]]));

        dragStart(sortable, 1, 10);
        dragOver(sortable, 1, 2, true);
        dragX(control, 200);

        expect(row(1).dataset.treeLevelProposed).toBe('1');

        dragX(control, -200);

        expect(row(1).dataset.treeLevelProposed).toBe('0');
        expect(row(1).querySelector('.list-cell-tree').style.paddingLeft).toBe('15px');
    });

    test('drag events without a pointer position leave the indent alone', async () => {
        const { control, sortable } = await mount(makeList([[1, 0], [2, 0], [3, 0]]));

        dragStart(sortable, 1, 10);
        dragOver(sortable, 1, 2, true);
        dragX(control, 30);
        expect(row(1).dataset.treeLevelProposed).toBe('1');

        // Firefox drag events report zero coordinates
        dragX(control, 0, 0);
        expect(row(1).dataset.treeLevelProposed).toBe('1');
    });

    test('dragover in the table body still reaches the indent preview', async () => {
        const { control, sortable } = await mount(makeList([[1, 0], [2, 0], [3, 0]]));

        dragStart(sortable, 1, 10);
        dragOver(sortable, 1, 2, true);

        // Sortable stops dragover at the table body it is bound to
        const tbody = document.querySelector('tbody');
        tbody.addEventListener('dragover', (ev) => ev.stopPropagation());
        row(2).dispatchEvent(Object.assign(new Event('dragover', { bubbles: true }), { pageX: 30, clientX: 30, clientY: 40 }));

        expect(row(1).dataset.treeLevelProposed).toBe('1');
        expect(control.draggingX).toBe(30);
    });

    test('pointer movement outside a drag does nothing', async () => {
        const { control } = await mount(makeList([[1, 0], [2, 0]]));

        dragX(control, 30);

        expect(row(1).dataset.treeLevelProposed).toBeUndefined();
    });

    test('children follow the dragged row and keep their relative depth', async () => {
        const { control, jax, sortable } = await mount(makeList([[4, 0], [1, 0], [2, 1]]));

        dragStart(sortable, 1, 10);
        dragX(control, 30);
        drop(sortable, 1);

        expect(rowOrder()).toEqual(['4', '1', '2']);
        expect(row(1).dataset.treeLevel).toBe('1');
        expect(row(2).dataset.treeLevel).toBe('2');
        expect(row(2).style.display).toBe('');
        expect(row(2).querySelector('.list-cell-tree').style.paddingLeft).toBe('51px');
        expect(jax.requests[0].data).toEqual({ record_id: '1', parent_id: '4' });
    });

    test('children are reinserted after the row at its new position', async () => {
        const { jax, sortable } = await mount(makeList([[1, 0], [2, 1], [3, 0]], { 'data-include-sort-orders': '1' }));

        dragStart(sortable, 1, 10);
        dragOver(sortable, 1, 3, true);
        drop(sortable, 1);

        expect(rowOrder()).toEqual(['3', '1', '2']);
        expect(jax.requests[0].data).toEqual({
            record_id: '1',
            previous_id: '3',
            sort_orders: ['3', '1', '2']
        });
    });

    test('the hidden subtree is skipped when looking for neighbours', async () => {
        const { control, sortable } = await mount(makeList([[1, 0], [2, 1], [3, 0]]));

        dragStart(sortable, 1, 10);
        dragOver(sortable, 1, 3, true);

        // The hidden child of row 1 still sits before row 3
        expect(rowOrder()).toEqual(['2', '3', '1']);
        expect(control.getPrevRow(row(1))).toBe(row(3));
        expect(control.dragBoundary).toEqual({ min: 0, max: 1 });
    });

    test('max depth stops a subtree from being nested past the limit', async () => {
        const { control, jax, sortable } = await mount(makeList([[4, 0], [1, 0], [2, 1]], { 'data-max-depth': '2' }));

        dragStart(sortable, 1, 10);
        dragX(control, 30);
        drop(sortable, 1);

        expect(row(1).dataset.treeLevel).toBe('0');
        expect(row(2).dataset.treeLevel).toBe('1');
        expect(jax.requests[0].data).toEqual({ record_id: '1', previous_id: '4' });
    });

    test('a leaf can still be nested when max depth allows it', async () => {
        const { control, jax, sortable } = await mount(makeList([[4, 0], [1, 0]], { 'data-max-depth': '2' }));

        dragStart(sortable, 1, 10);
        dragX(control, 30);
        drop(sortable, 1);

        expect(row(1).dataset.treeLevel).toBe('1');
        expect(jax.requests[0].data).toEqual({ record_id: '1', parent_id: '4' });
    });

    test('moves rejected by canInsertBefore and canInsertAfter leave the row in place', async () => {
        const { control, jax, sortable } = await mount(makeList([[1, 0], [2, 1], [3, 0], [4, 1]], { 'data-max-depth': '2' }));

        dragStart(sortable, 3, 10);

        // Between rows 1 and 2 the subtree of row 3 would sit too deep
        expect(dragOver(sortable, 3, 2, false)).toBe(false);
        expect(dragOver(sortable, 3, 1, true)).toBe(false);
        expect(rowOrder()).toEqual(['1', '2', '3', '4']);

        // Above row 1 is a valid root position
        expect(dragOver(sortable, 3, 1, false)).toBe(true);
        expect(rowOrder()).toEqual(['3', '1', '2', '4']);

        drop(sortable, 3);

        expect(rowOrder()).toEqual(['3', '4', '1', '2']);
        expect(jax.requests[0].data).toEqual({ record_id: '3', next_id: '1' });
        expect(control.dragging).toBe(false);
    });

    test('the flat variant never indents', async () => {
        const { control, jax, sortable } = await mount(makeList([[1, 0], [2, 0]], { 'data-use-tree': '', 'data-max-depth': '1' }));

        dragStart(sortable, 1, 10);
        dragOver(sortable, 1, 2, true);
        dragX(control, 80);

        expect(row(1).querySelector('.list-cell-tree').style.paddingLeft).toBe('0px');

        drop(sortable, 1);

        expect(jax.requests[0].data).toEqual({ record_id: '1', previous_id: '2' });
    });

    test('the postback marker stays until the request settles, even on failure', async () => {
        const jax = makeFakeJax();
        let rejectRequest;
        jax.response = new Promise((resolve, reject) => {
            rejectRequest = reject;
        });

        const { sortable } = await mount(makeList([[1, 0], [2, 0]]), jax);
        const tbody = document.querySelector('tbody');

        dragStart(sortable, 1);
        dragOver(sortable, 1, 2, true);
        drop(sortable, 1);
        await Promise.resolve();
        expect(tbody.classList.contains('tree-drag-updated')).toBe(true);

        rejectRequest(new Error('Server error'));
        await flush();
        expect(tbody.classList.contains('tree-drag-updated')).toBe(false);
    });
});

describe('touch detection', () => {
    test('is true only for coarse pointers without a fine pointer', () => {
        window.matchMedia = (query) => ({ matches: query === '(pointer: coarse)' });
        expect(isTouchEnabled()).toBe(true);

        window.matchMedia = () => ({ matches: true });
        expect(isTouchEnabled()).toBe(false);

        window.matchMedia = originalMatchMedia;
        expect(isTouchEnabled()).toBe(false);
    });
});
