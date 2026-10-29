import { afterEach, describe, expect, test } from 'bun:test';
import {
    getAutoScrollDirection,
    isTouchEnabled,
    registerListStructureWidget
} from '../resources/assets/widgets/liststructure/liststructure.js';

const ROW_HEIGHT = 30;

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

            for (const attr of element.attributes) {
                if (attr.name.startsWith('data-')) {
                    const key = attr.name.slice(5).replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
                    this.config[key] = parseValue(attr.value);
                }
            }
        }

        listen(eventName, handler, options) {
            this.element.addEventListener(eventName, handler.bind(this), options);
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
        <div id="scroller">
            <div class="control-list" data-control="liststructurewidget" ${attrHtml}>
                <div class="list-content">
                    <table class="table data"><tbody>${rows}</tbody></table>
                </div>
            </div>
        </div>
    `;

    const tbody = document.querySelector('tbody');

    // Visible rows stack top to bottom, so rects follow the live DOM order
    for (const row of tbody.children) {
        row.getBoundingClientRect = () => {
            const visible = [...tbody.children].filter((el) => el.style.display !== 'none');
            const top = visible.indexOf(row) * ROW_HEIGHT;
            return { top, bottom: top + ROW_HEIGHT, height: ROW_HEIGHT, left: 0, right: 600, width: 600 };
        };
    }

    return document.querySelector('[data-control="liststructurewidget"]');
}

let mounted = [];
let originalMatchMedia = window.matchMedia;

function mount(element, jax = makeFakeJax()) {
    registerListStructureWidget(jax);
    const Control = jax.controls.get('liststructurewidget');
    const control = new Control(element);
    control.init();
    control.connect();
    mounted.push(control);
    return { control, jax };
}

function row(id) {
    return document.querySelector(`tr[data-tree-id="${id}"]`);
}

function rowOrder() {
    return [...document.querySelector('tbody').children].map((el) => el.dataset.treeId);
}

function pointer(target, x, y) {
    return {
        button: 0,
        isPrimary: true,
        target,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y,
        preventDefault() {}
    };
}

// Presses a row's handle at (x, y), visits each [x, y] point, then releases
function dragHandle(control, id, start, ...points) {
    control.onPointerDown(pointer(row(id).querySelector('.list-reorder-handle'), start[0], start[1]));
    points.forEach(([x, y]) => control.onPointerMove(pointer(window, x, y)));
    control.onPointerUp();
}

afterEach(() => {
    mounted.forEach((control) => control.disconnect());
    mounted = [];
    window.matchMedia = originalMatchMedia;
    document.body.innerHTML = '';
});

describe('tree structure', () => {
    test('collects a row\'s descendants in reverse order', () => {
        const { control } = mount(makeList([[1, 0], [2, 1], [3, 2], [4, 0]]));

        expect(control.getChildren(row(1)).map((el) => el.dataset.treeId)).toEqual(['3', '2']);
        expect(control.getChildren(row(2)).map((el) => el.dataset.treeId)).toEqual(['3']);
        expect(control.getChildren(row(4))).toEqual([]);
    });

    test('drag start hides the subtree and records its depth', () => {
        const { control } = mount(makeList([[1, 0], [2, 1], [3, 2], [4, 0]]));

        control.onPointerDown(pointer(row(1).querySelector('.list-reorder-handle'), 10, 15));
        control.onPointerMove(pointer(window, 10, 22));

        expect(control.dragging).toBe(true);
        expect(control.lastChildDiff).toBe(2);
        expect(row(2).style.display).toBe('none');
        expect(row(3).style.display).toBe('none');
        expect(row(1).classList.contains('sortable-chosen')).toBe(true);
        expect(document.querySelector('tbody').classList.contains('tree-drag-mode')).toBe(true);
    });

    test('a press below the drag threshold does not start a drag', () => {
        const { control, jax } = mount(makeList([[1, 0], [2, 0]]));

        dragHandle(control, 1, [10, 15], [12, 17]);

        expect(control.dragging).toBe(false);
        expect(jax.requests).toEqual([]);
    });
});

describe('indent boundaries', () => {
    test('the next row sets the minimum and the previous row allows one level deeper', () => {
        const { control } = mount(makeList([[1, 0], [2, 1], [3, 2], [4, 0], [5, 0]]));
        control.lastChildDiff = 0;

        expect(control.getIndentBoundaries(row(2), row(3))).toEqual({ min: 2, max: 2 });
        expect(control.getIndentBoundaries(row(4), row(5))).toEqual({ min: 0, max: 1 });
        expect(control.getIndentBoundaries(null, row(1))).toEqual({ min: 0, max: 0 });
    });

    test('a collapsed parent cannot take new children', () => {
        const { control } = mount(makeList([{ id: 1, level: 0, collapsed: true, childCount: 3 }, [4, 0]]));
        control.lastChildDiff = 0;

        expect(control.getIndentBoundaries(row(1), row(4))).toEqual({ min: 0, max: 0 });
    });

    test('max depth counts the dragged subtree', () => {
        const { control } = mount(makeList([[1, 0], [2, 1], [3, 0]], { 'data-max-depth': '3' }));
        control.lastChildDiff = 1;

        expect(control.getIndentBoundaries(row(2), null)).toEqual({ min: 0, max: 1 });
    });

    test('max check rejects a position whose next row is too deep for the subtree', () => {
        const { control } = mount(makeList([[1, 0], [2, 1], [3, 2]], { 'data-max-depth': '3' }));
        control.lastChildDiff = 1;

        expect(control.getIndentBoundaries(row(2), row(3), true)).toBe(false);
        expect(control.getIndentBoundaries(row(2), row(3))).toEqual({ min: 1, max: 1 });
    });

    test('max depth is optional and reflected as the deepest level index', () => {
        expect(mount(makeList([[1, 0]])).control.getMaxDepth()).toBe(null);
        expect(mount(makeList([[1, 0]], { 'data-max-depth': '' })).control.getMaxDepth()).toBe(null);
        expect(mount(makeList([[1, 0]], { 'data-max-depth': '3' })).control.getMaxDepth()).toBe(2);
    });
});

describe('drag reorder', () => {
    test('dragging down and right nests the row and posts the move', async () => {
        const { control, jax } = mount(makeList([[1, 0], [2, 0], [3, 0]]));

        control.onPointerDown(pointer(row(1).querySelector('.list-reorder-handle'), 10, 15));
        control.onPointerMove(pointer(window, 10, 50));

        expect(rowOrder()).toEqual(['2', '1', '3']);

        // Live indent preview while the pointer moves right
        control.onPointerMove(pointer(window, 30, 50));
        expect(row(1).querySelector('.list-cell-tree').style.paddingLeft).toBe('33px');

        control.onPointerUp();

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

    test('the indent preview is clamped to the neighbouring rows', () => {
        const { control } = mount(makeList([[1, 0], [2, 0], [3, 0]]));

        control.onPointerDown(pointer(row(1).querySelector('.list-reorder-handle'), 10, 15));
        control.onPointerMove(pointer(window, 10, 50));
        control.onPointerMove(pointer(window, 200, 50));

        expect(row(1).dataset.treeLevelProposed).toBe('1');

        control.onPointerMove(pointer(window, -200, 50));

        expect(row(1).dataset.treeLevelProposed).toBe('0');
        expect(row(1).querySelector('.list-cell-tree').style.paddingLeft).toBe('15px');
    });

    test('children follow the dragged row and keep their relative depth', () => {
        const { control, jax } = mount(makeList([[4, 0], [1, 0], [2, 1]]));

        dragHandle(control, 1, [10, 45], [30, 45]);

        expect(rowOrder()).toEqual(['4', '1', '2']);
        expect(row(1).dataset.treeLevel).toBe('1');
        expect(row(2).dataset.treeLevel).toBe('2');
        expect(row(2).style.display).toBe('');
        expect(row(2).querySelector('.list-cell-tree').style.paddingLeft).toBe('51px');
        expect(jax.requests[0].data).toEqual({ record_id: '1', parent_id: '4' });
    });

    test('children are reinserted after the row at its new position', () => {
        const { control, jax } = mount(makeList([[1, 0], [2, 1], [3, 0]], { 'data-include-sort-orders': '1' }));

        dragHandle(control, 1, [10, 15], [10, 55]);

        expect(rowOrder()).toEqual(['3', '1', '2']);
        expect(jax.requests[0].data).toEqual({
            record_id: '1',
            previous_id: '3',
            sort_orders: ['3', '1', '2']
        });
    });

    test('max depth stops a subtree from being nested past the limit', () => {
        const { control, jax } = mount(makeList([[4, 0], [1, 0], [2, 1]], { 'data-max-depth': '2' }));

        dragHandle(control, 1, [10, 45], [30, 45]);

        expect(row(1).dataset.treeLevel).toBe('0');
        expect(row(2).dataset.treeLevel).toBe('1');
        expect(jax.requests[0].data).toEqual({ record_id: '1', previous_id: '4' });
    });

    test('a leaf can still be nested when max depth allows it', () => {
        const { control, jax } = mount(makeList([[4, 0], [1, 0]], { 'data-max-depth': '2' }));

        dragHandle(control, 1, [10, 45], [30, 45]);

        expect(row(1).dataset.treeLevel).toBe('1');
        expect(jax.requests[0].data).toEqual({ record_id: '1', parent_id: '4' });
    });

    test('moves rejected by canInsertBefore leave the row in place', () => {
        const { control, jax } = mount(makeList([[1, 0], [2, 1], [3, 0], [4, 1]], { 'data-max-depth': '2' }));

        control.onPointerDown(pointer(row(3).querySelector('.list-reorder-handle'), 10, 75));

        // Between rows 1 and 2 the subtree of row 3 would sit too deep
        control.onPointerMove(pointer(window, 10, 35));
        expect(rowOrder()).toEqual(['1', '2', '3', '4']);
        expect(control.canInsertBefore(row(2))).toBe(false);
        expect(control.canInsertAfter(row(1))).toBe(false);

        // Above row 1 is a valid root position
        control.onPointerMove(pointer(window, 10, 10));
        expect(rowOrder()).toEqual(['3', '1', '2', '4']);

        control.onPointerUp();

        expect(rowOrder()).toEqual(['3', '4', '1', '2']);
        expect(jax.requests[0].data).toEqual({ record_id: '3', next_id: '1' });
    });

    test('rows inside a no-sort element never start a drag', () => {
        const { control, jax } = mount(makeList([[1, 0], { id: 2, level: 0, className: 'no-sort' }, [3, 0]]));

        dragHandle(control, 2, [10, 45], [10, 80]);

        expect(control.dragging).toBe(false);
        expect(rowOrder()).toEqual(['1', '2', '3']);
        expect(jax.requests).toEqual([]);
    });

    test('rows drag from any cell but not from links', () => {
        const { control, jax } = mount(makeList([[1, 0], [2, 0]]));

        control.onPointerDown(pointer(row(1).querySelector('a'), 10, 15));
        control.onPointerMove(pointer(window, 10, 50));
        control.onPointerUp();
        expect(jax.requests).toEqual([]);

        control.onPointerDown(pointer(row(1).querySelector('.list-cell-name-email'), 10, 15));
        control.onPointerMove(pointer(window, 10, 50));
        control.onPointerUp();
        expect(rowOrder()).toEqual(['2', '1']);
        expect(jax.requests).toHaveLength(1);
    });

    test('touch devices only drag from the handle', () => {
        window.matchMedia = (query) => ({ matches: query === '(pointer: coarse)' });
        const { control, jax } = mount(makeList([[1, 0], [2, 0]]));

        expect(control.config.dragRow).toBe(false);

        control.onPointerDown(pointer(row(1).querySelector('.list-cell-name-email'), 10, 15));
        control.onPointerMove(pointer(window, 10, 50));
        control.onPointerUp();
        expect(jax.requests).toEqual([]);

        dragHandle(control, 1, [10, 15], [10, 50]);
        expect(rowOrder()).toEqual(['2', '1']);
        expect(jax.requests).toHaveLength(1);
    });

    test('the flat variant never indents', () => {
        const { control, jax } = mount(makeList([[1, 0], [2, 0]], { 'data-use-tree': '', 'data-max-depth': '1' }));

        control.onPointerDown(pointer(row(1).querySelector('.list-reorder-handle'), 10, 15));
        control.onPointerMove(pointer(window, 10, 50));
        control.onPointerMove(pointer(window, 80, 50));

        expect(row(1).querySelector('.list-cell-tree').style.paddingLeft).toBe('0px');

        control.onPointerUp();

        expect(jax.requests[0].data).toEqual({ record_id: '1', previous_id: '2' });
    });

    test('the postback marker stays until the request settles, even on failure', async () => {
        const jax = makeFakeJax();
        let rejectRequest;
        jax.response = new Promise((resolve, reject) => {
            rejectRequest = reject;
        });

        const { control } = mount(makeList([[1, 0], [2, 0]]), jax);
        const tbody = document.querySelector('tbody');

        dragHandle(control, 1, [10, 15], [10, 50]);
        await Promise.resolve();
        expect(tbody.classList.contains('tree-drag-updated')).toBe(true);

        rejectRequest(new Error('Server error'));
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(tbody.classList.contains('tree-drag-updated')).toBe(false);
    });

    test('the click that ends a drag never reaches row listeners', async () => {
        const { control } = mount(makeList([[1, 0], [2, 0]]));
        let rowClicks = 0;
        row(1).addEventListener('click', () => rowClicks++);

        dragHandle(control, 1, [10, 15], [10, 50]);
        row(1).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(rowClicks).toBe(0);

        // Later clicks go through again
        await new Promise((resolve) => setTimeout(resolve, 0));
        row(1).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(rowClicks).toBe(1);
    });

    test('dispatched pointer events drive the drag', () => {
        const { jax } = mount(makeList([[1, 0], [2, 0], [3, 0]]));

        row(1).querySelector('.list-reorder-handle').dispatchEvent(
            new PointerEvent('pointerdown', { bubbles: true, button: 0, isPrimary: true, clientX: 10, clientY: 15 })
        );
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: 10, clientY: 80 }));
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: 10, clientY: 80 }));

        expect(rowOrder()).toEqual(['2', '3', '1']);
        expect(jax.requests[0].data).toEqual({ record_id: '1', previous_id: '3' });
    });

    test('a cancelled pointer ends the drag', () => {
        const { control, jax } = mount(makeList([[1, 0], [2, 0]]));

        row(1).querySelector('.list-reorder-handle').dispatchEvent(
            new PointerEvent('pointerdown', { bubbles: true, button: 0, isPrimary: true, clientX: 10, clientY: 15 })
        );
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: 10, clientY: 50 }));
        window.dispatchEvent(new PointerEvent('pointercancel', { clientX: 10, clientY: 50 }));

        expect(control.dragging).toBe(false);
        expect(jax.requests).toHaveLength(1);
    });
});

describe('auto scroll', () => {
    test('scrolls toward an edge only while there is room', () => {
        // Pointer near the bottom edge with content below
        expect(getAutoScrollDirection(190, 0, 200, 0, 200, 1000, 60)).toBe(1);

        // Pointer near the bottom edge at the end of the content
        expect(getAutoScrollDirection(190, 0, 200, 800, 200, 1000, 60)).toBe(0);

        // Pointer near the top edge after scrolling down
        expect(getAutoScrollDirection(10, 0, 200, 300, 200, 1000, 60)).toBe(-1);

        // Pointer near the top edge at the start of the content
        expect(getAutoScrollDirection(10, 0, 200, 0, 200, 1000, 60)).toBe(0);

        // Pointer in the middle
        expect(getAutoScrollDirection(100, 0, 200, 300, 200, 1000, 60)).toBe(0);
    });

    test('scrolls the nearest scroll container while dragging near its edge', () => {
        const element = makeList([[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]]);
        const scroller = document.getElementById('scroller');
        scroller.style.overflowY = 'auto';
        scroller.getBoundingClientRect = () => ({ top: 0, bottom: 120, left: 0, right: 600, height: 120, width: 600 });
        Object.defineProperty(scroller, 'clientHeight', { value: 120 });
        Object.defineProperty(scroller, 'scrollHeight', { value: 210 });
        Object.defineProperty(scroller, 'clientWidth', { value: 600 });
        Object.defineProperty(scroller, 'scrollWidth', { value: 600 });

        const { control } = mount(element);

        control.onPointerDown(pointer(row(1).querySelector('.list-reorder-handle'), 10, 15));
        control.onPointerMove(pointer(window, 10, 50));
        expect(control.autoScrollTimer).toBeFalsy();

        control.onPointerMove(pointer(window, 10, 110));
        expect(control.autoScrollTimer).toBeTruthy();

        control.onAutoScroll();
        expect(scroller.scrollTop).toBe(20);
        expect(scroller.scrollLeft).toBe(0);

        control.onPointerUp();
        expect(control.autoScrollTimer).toBe(null);
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
