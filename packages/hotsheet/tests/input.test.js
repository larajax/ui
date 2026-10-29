import { describe, test, expect, afterEach, beforeAll, afterAll } from 'bun:test';
import { Sheet } from '../src/index.js';
import { installPopoverStandIn } from './popover.js';

/*
 * Keys and pointer drags as the browser delivers them. Escape is consumed only when it cancels something,
 * so a dialog holding the grid still gets its cancel request.
 */

const COLUMNS = [
    { key: 'sku', title: 'SKU', type: 'text' },
    { key: 'qty', title: 'Qty', type: 'numeric', width: 120 },
    { key: 'city', title: 'City', type: 'dropdown', options: [{ key: 'syd', label: 'Sydney' }, { key: 'akl', label: 'Auckland' }] }
];

const sheets = [];

function makeSheet(options = {}) {
    const element = document.createElement('div');
    document.body.append(element);

    const rows = [{ sku: 'A-1', qty: 1, city: 'syd' }, { sku: 'B-2', qty: 2, city: 'akl' }, { sku: 'C-3', qty: 3 }];
    const sheet = new Sheet(element, { columns: COLUMNS, rows, ...options });
    sheets.push(sheet);
    return sheet;
}

function press(target, key) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
}

function mouse(target, type, init = {}) {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, ...init });
    target.dispatchEvent(event);
    return event;
}

let removePopoverStandIn;

beforeAll(() => {
    removePopoverStandIn = installPopoverStandIn();
});

afterAll(() => {
    removePopoverStandIn();
});

afterEach(() => {
    sheets.splice(0).forEach((sheet) => sheet.destroy());
    document.body.replaceChildren();
});

describe('escape', () => {
    test('passes through when nothing is open, so a dialog can close', () => {
        const sheet = makeSheet();

        sheet.select(1, 1);

        expect(press(sheet.editor.textarea, 'Escape').defaultPrevented).toBe(false);
        expect(sheet.getSelection().anchor).toEqual({ row: 1, col: 1 });
    });

    test('cancels an open editor first, then passes through', () => {
        const sheet = makeSheet();

        sheet.select(0, 0);
        sheet.openEditor('full');
        sheet.editor.textarea.value = 'Changed';

        expect(press(sheet.editor.textarea, 'Escape').defaultPrevented).toBe(true);
        expect(sheet.isEditing()).toBe(false);
        expect(sheet.getValue(0, 0)).toBe('A-1');

        expect(press(sheet.editor.textarea, 'Escape').defaultPrevented).toBe(false);
    });

    test('closes an open option list with its editor, then passes through', async () => {
        const sheet = makeSheet();

        sheet.select(0, 2);
        sheet.openEditor('full');
        await sheet.updateOptions();
        expect(sheet.optionList.isOpen()).toBe(true);

        expect(press(sheet.editor.textarea, 'Escape').defaultPrevented).toBe(true);
        expect(sheet.optionList.isOpen()).toBe(false);
        expect(sheet.getValue(0, 2)).toBe('syd');

        expect(press(sheet.editor.textarea, 'Escape').defaultPrevented).toBe(false);
    });

    test('closes an open context menu, then passes through', () => {
        const sheet = makeSheet({ contextMenu: () => [{ label: 'Remove row', action: () => {} }] });

        sheet.select(0, 0);
        expect(sheet.openContextMenu(10, 10)).toBe(true);

        expect(press(sheet.menu.el, 'Escape').defaultPrevented).toBe(true);
        expect(sheet.menu.isOpen()).toBe(false);

        expect(press(sheet.editor.textarea, 'Escape').defaultPrevented).toBe(false);
    });

    test('cancels a fill in progress, writing nothing, then passes through', () => {
        const sheet = makeSheet();

        sheet.select(0, 1);
        mouse(sheet.elements.fillHandle, 'mousedown');
        mouse(sheet.getCellElement(2, 1), 'mouseover');

        expect(press(sheet.editor.textarea, 'Escape').defaultPrevented).toBe(true);
        expect(sheet.elements.fillArea.hidden).toBe(true);

        mouse(document, 'mouseup');
        expect(sheet.getValues().map((row) => row[1])).toEqual([1, 2, 3]);

        expect(press(sheet.editor.textarea, 'Escape').defaultPrevented).toBe(false);
    });

    test('ends a selection drag with the cells reached so far', () => {
        const sheet = makeSheet();
        const selections = [];
        sheet.on('select', (event) => selections.push(event.selection));

        mouse(sheet.getCellElement(0, 0), 'mousedown');
        mouse(sheet.getCellElement(1, 1), 'mouseover');

        expect(press(document.body, 'Escape').defaultPrevented).toBe(true);
        mouse(sheet.getCellElement(2, 2), 'mouseover');
        mouse(document, 'mouseup');

        expect(sheet.getSelection()).toEqual({ anchor: { row: 0, col: 0 }, focus: { row: 1, col: 1 } });
        expect(selections).toHaveLength(1);
    });

    test('cancels a column resize wherever focus is, putting the width back', () => {
        const sheet = makeSheet();
        const resizer = (col) => sheet.getHeaderElement(col).querySelector('.hotsheet-resizer');

        mouse(resizer(0), 'mousedown', { clientX: 100 });
        mouse(document, 'mousemove', { clientX: 180 });
        expect(sheet.getColumns()[0].width).toBe(80);

        expect(press(document.body, 'Escape').defaultPrevented).toBe(true);
        expect(sheet.getColumns()[0].width).toBe(null);
        expect(sheet.element.classList.contains('is-resizing')).toBe(false);

        mouse(resizer(1), 'mousedown', { clientX: 100 });
        mouse(document, 'mousemove', { clientX: 200 });
        press(document.body, 'Escape');
        expect(sheet.getColumns()[1].width).toBe(120);
    });

    test('leaves Escape alone outside a drag when the grid has no focus', () => {
        makeSheet();

        expect(press(document.body, 'Escape').defaultPrevented).toBe(false);
    });
});
