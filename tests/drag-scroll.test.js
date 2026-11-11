import { afterEach, describe, expect, test } from 'bun:test';
import DragScroll from '../resources/assets/controls/drag-scroll/drag-scroll.js';
import { registerDragScroll } from '../resources/assets/controls/drag-scroll/drag-scroll-control.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A row of items wider than its scroller, measured as a browser lays it out: the scroller's box and each
// item's box on the page, which move as the row scrolls
function makeRow(markup = '') {
    document.body.innerHTML = `<div id="wrap"><div id="row">${markup}<span id="a">A</span><span id="b">B</span></div></div>`;
    const row = document.getElementById('row');

    Object.defineProperties(row, {
        clientWidth: { configurable: true, value: 300 },
        offsetWidth: { configurable: true, value: 300 },
        scrollWidth: { configurable: true, value: 1000 }
    });

    row.getBoundingClientRect = () => ({ left: 50, top: 0, width: 300, height: 40 });

    // Item positions in the row's content, before it scrolls
    const place = (id, left, width) => {
        const item = document.getElementById(id);
        item.getBoundingClientRect = () => ({ left: 50 + left - row.scrollLeft, top: 0, width, height: 40 });
        return item;
    };

    return { row, place };
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('drag scroll', () => {
    test('goToElement measures an item from its box, whatever its offset parent', () => {
        const { row, place } = makeRow();
        const item = place('b', 600, 100);

        // An offset parent outside the row would report this, and scroll too far
        Object.defineProperty(item, 'offsetLeft', { configurable: true, value: 900 });

        const scroll = new DragScroll(row, {});
        scroll.goToElement(item, undefined, { duration: 0 });

        expect(row.scrollLeft).toBe(400);
        scroll.dispose();
    });

    test('goToElement with a duration of 0 scrolls back at once to an item before the view', () => {
        const { row, place } = makeRow();
        const item = place('a', 100, 80);
        row.scrollLeft = 500;

        let called = false;
        const scroll = new DragScroll(row, {});
        scroll.goToElement(item, () => { called = true; }, { duration: 0 });

        expect(row.scrollLeft).toBe(100);
        expect(called).toBe(true);
        scroll.dispose();
    });

    test('goToElement leaves the room the row keeps with scroll-padding, as for a fade at its edges', () => {
        const { row, place } = makeRow();
        row.style.setProperty('scroll-padding-left', '42px');
        row.style.setProperty('scroll-padding-right', '42px');

        const scroll = new DragScroll(row, {});

        scroll.goToElement(place('b', 600, 100), undefined, { duration: 0 });
        expect(row.scrollLeft).toBe(442);

        scroll.goToElement(place('a', 100, 80), undefined, { duration: 0 });
        expect(row.scrollLeft).toBe(58);
        scroll.dispose();
    });

    test('goToElement stops at the ends of the row where the padding would reach past them', () => {
        const { row, place } = makeRow();
        row.style.setProperty('scroll-padding-left', '42px');
        row.style.setProperty('scroll-padding-right', '42px');

        const scroll = new DragScroll(row, {});

        // The last item lands the row at its end, which has nothing more to fade
        scroll.goToElement(place('b', 900, 100), undefined, { duration: 0 });
        expect(row.scrollLeft).toBe(700);

        scroll.goToElement(place('a', 10, 70), undefined, { duration: 0 });
        expect(row.scrollLeft).toBe(0);
        scroll.dispose();
    });

    test('the wheel scrolls the row, and leaves zoom gestures to the browser', () => {
        const { row } = makeRow();
        const scroll = new DragScroll(row, {});

        // A pinch, which happy-dom's WheelEvent can't carry the modifier for
        const zoom = new WheelEvent('wheel', { deltaY: 100, cancelable: true });
        Object.defineProperty(zoom, 'ctrlKey', { value: true });
        row.dispatchEvent(zoom);
        expect(zoom.defaultPrevented).toBe(false);
        expect(row.scrollLeft).toBe(0);

        const wheel = new WheelEvent('wheel', { deltaY: 100, cancelable: true });
        row.dispatchEvent(wheel);
        expect(wheel.defaultPrevented).toBe(true);
        expect(row.scrollLeft).toBe(100);
        scroll.dispose();
    });

    test('a horizontal wheel scrolls the row the way it tilts', () => {
        const { row } = makeRow();
        const scroll = new DragScroll(row, {});

        const right = new WheelEvent('wheel', { deltaX: 100, cancelable: true });
        row.dispatchEvent(right);
        expect(right.defaultPrevented).toBe(true);
        expect(row.scrollLeft).toBe(100);

        const left = new WheelEvent('wheel', { deltaX: -40, cancelable: true });
        row.dispatchEvent(left);
        expect(row.scrollLeft).toBe(60);
        scroll.dispose();
    });

    test('a native scroll container takes the wheel along its direction, and the control turns the wheel across it', () => {
        const { row } = makeRow();
        row.style.overflowX = 'auto';
        const scroll = new DragScroll(row, {});

        // The browser scrolls the row for this one, so scrolling it here too would move it twice
        const tilt = new WheelEvent('wheel', { deltaX: 100, cancelable: true });
        row.dispatchEvent(tilt);
        expect(tilt.defaultPrevented).toBe(false);
        expect(row.scrollLeft).toBe(0);

        const wheel = new WheelEvent('wheel', { deltaY: 100, cancelable: true });
        row.dispatchEvent(wheel);
        expect(wheel.defaultPrevented).toBe(true);
        expect(row.scrollLeft).toBe(100);
        scroll.dispose();
    });

    test('a native scroll container without overscroll keeps the wheel at its edges', () => {
        const { row } = makeRow();
        row.style.overflowY = 'auto';
        Object.defineProperties(row, {
            clientHeight: { configurable: true, value: 200 },
            scrollHeight: { configurable: true, value: 600 }
        });

        const scroll = new DragScroll(row, { vertical: true, noOverScroll: true });

        const up = new WheelEvent('wheel', { deltaY: -100, cancelable: true });
        row.dispatchEvent(up);
        expect(up.defaultPrevented).toBe(true);

        const down = new WheelEvent('wheel', { deltaY: 100, cancelable: true });
        row.dispatchEvent(down);
        expect(down.defaultPrevented).toBe(false);
        expect(row.scrollTop).toBe(0);
        scroll.dispose();
    });

    test('a native scroll container leaves touch to the browser', () => {
        const { row } = makeRow();

        const hidden = new DragScroll(row, {});
        expect(hidden.isNativeTouch).toBe(false);
        hidden.dispose();

        row.style.overflowX = 'auto';
        const native = new DragScroll(row, {});
        expect(native.isNativeTouch).toBe(true);
        native.dispose();

        row.style.overflowX = 'hidden';
        row.style.overflowY = 'auto';
        const vertical = new DragScroll(row, { vertical: true });
        expect(vertical.isNativeTouch).toBe(true);
        vertical.dispose();
    });

    test('the end of the row does not count borders', () => {
        const { row } = makeRow();

        // A row with a border, its content two pixels wider than its inside
        Object.defineProperties(row, {
            clientWidth: { configurable: true, value: 300 },
            offsetWidth: { configurable: true, value: 302 },
            scrollWidth: { configurable: true, value: 302 }
        });

        const scroll = new DragScroll(row, {});
        expect(scroll.isEnd()).toBe(false);
        scroll.dispose();
    });

    test('the scroll classes follow changes in the size of the row and its content', async () => {
        const observed = [];
        let notify = null;
        const original = globalThis.ResizeObserver;

        globalThis.ResizeObserver = class {
            constructor(callback) {
                notify = callback;
            }
            observe(element) {
                observed.push(element);
            }
            disconnect() {
                observed.length = 0;
            }
        };

        try {
            const { row } = makeRow();
            const wrap = document.getElementById('wrap');
            Object.defineProperty(row, 'scrollWidth', { configurable: true, value: 300 });

            const scroll = new DragScroll(row, { scrollClassContainer: wrap });
            await sleep(50);
            expect(observed).toEqual([row, document.getElementById('a'), document.getElementById('b')]);
            expect(wrap.classList.contains('scroll-after')).toBe(false);

            // The content grows, as when a font loads, without the window changing
            Object.defineProperty(row, 'scrollWidth', { configurable: true, value: 800 });
            notify();
            await sleep(50);
            expect(wrap.classList.contains('scroll-after')).toBe(true);

            scroll.dispose();
            expect(observed).toEqual([]);
        }
        finally {
            globalThis.ResizeObserver = original;
        }
    });
});

describe('drag scroll control', () => {
    function makeFakeJax() {
        const controls = new Map();

        class ControlBase {
            constructor(element) {
                this.element = element;
                this.config = {};
                for (const [key, value] of Object.entries(element.dataset)) {
                    this.config[key] = value;
                }
            }
        }

        return {
            controls,
            ControlBase,
            registerControl(id, control) {
                controls.set(id, control);
            }
        };
    }

    test('scrollToActive brings the active item into view when the control connects', () => {
        const { row, place } = makeRow();
        const item = place('b', 600, 100);
        item.classList.add('active');
        row.dataset.scrollToActive = 'true';

        const jax = makeFakeJax();
        registerDragScroll(jax);
        const control = new (jax.controls.get('drag-scroll'))(row);
        control.init();
        control.connect();

        expect(row.scrollLeft).toBe(400);
        control.disconnect();
    });

    test('without scrollToActive the row stays at its start', () => {
        const { row, place } = makeRow();
        place('b', 600, 100).classList.add('active');

        const jax = makeFakeJax();
        registerDragScroll(jax);
        const control = new (jax.controls.get('drag-scroll'))(row);
        control.init();
        control.connect();

        expect(row.scrollLeft).toBe(0);
        control.disconnect();
    });
});
