import { describe, test, expect, afterEach, beforeAll, afterAll } from 'bun:test';
import { Sheet } from '../src/index.js';
import { installPopoverStandIn } from './popover.js';

/*
 * The Sheet API in a simulated DOM: editing, the clipboard, undo, filling, sorting and windowing, without a
 * browser. Layout isn't simulated, so these cover behavior and saved values, not positions.
 */

const COLUMNS = [
    { key: 'sku', title: 'SKU', type: 'text' },
    { key: 'qty', title: 'Qty', type: 'numeric' },
    { key: 'taxable', title: 'Taxable', type: 'checkbox', checkedValue: 1, uncheckedValue: 0 },
    { key: 'note', title: 'Note', type: 'text', readOnly: true }
];

const sheets = [];

function makeSheet(rows, options = {}) {
    const element = document.createElement('div');
    document.body.append(element);

    const sheet = new Sheet(element, { columns: COLUMNS, rows, ...options });
    sheets.push(sheet);
    return sheet;
}

function threeRows() {
    return [
        { sku: 'A-1', qty: 5, taxable: 1, note: 'first' },
        { sku: 'B-2', qty: '12', taxable: 0, note: 'second' },
        { sku: 'C-3', qty: 0, taxable: 1, note: 'third' }
    ];
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

describe('editing', () => {
    test('changes the caller\'s row objects in place, keeping other keys and untouched values', () => {
        const rows = [{ sku: 'A-1', qty: '12', taxable: true, extra: 'kept' }];
        const sheet = makeSheet(rows);

        sheet.setCells([{ row: 0, col: 0, value: 'B-2' }]);

        expect(sheet.getRows()[0]).toBe(rows[0]);
        expect(rows[0]).toEqual({ sku: 'B-2', qty: '12', taxable: true, extra: 'kept' });
    });

    test('reads numeric text with the decimal separator, flagging text that isn\'t a number', () => {
        const sheet = makeSheet(threeRows(), { decimalSeparator: ',' });

        sheet.setCells([{ row: 0, col: 1, value: '3,5' }, { row: 1, col: 1, value: 'many' }]);

        expect(sheet.getValue(0, 1)).toBe(3.5);
        expect(sheet.getValue(1, 1)).toBe('many');
        expect(sheet.isInvalid(1, 1)).toBe(true);
        expect(sheet.isInvalid(0, 1)).toBe(false);
    });

    test('trims spaces around text typed into the editor', () => {
        const sheet = makeSheet(threeRows());

        sheet.select(0, 0);
        sheet.openEditor('full');
        sheet.editor.textarea.value = '  Kiwi  ';
        sheet.commitEditor();

        expect(sheet.getValue(0, 0)).toBe('Kiwi');
    });

    test('announces each change with its source', () => {
        const sheet = makeSheet(threeRows());
        const events = [];
        sheet.on('change', (event) => events.push(event));

        sheet.setCells([{ row: 1, col: 0, value: 'Z-9' }], 'edit');

        expect(events).toHaveLength(1);
        expect(events[0].source).toBe('edit');
        expect(events[0].changes[0]).toMatchObject({ row: 1, key: 'sku', from: 'B-2', to: 'Z-9' });
    });

    test('shows a validator\'s message for an invalid cell', () => {
        const columns = [{ key: 'code', title: 'Code', type: 'text', validator: (value) => /^[a-z]+$/.test(value) || 'Lowercase letters only' }];
        const sheet = makeSheet([{ code: 'abc' }], { columns });

        sheet.setCells([{ row: 0, col: 0, value: 'ABC' }]);

        expect(sheet.isInvalid(0, 0)).toBe(true);
        expect(sheet.getInvalidMessage(0, 0)).toBe('Lowercase letters only');
    });

    test('toggles checkboxes between the column\'s checked and unchecked values', () => {
        const sheet = makeSheet(threeRows());

        sheet.toggleCell(0, 2);
        sheet.toggleCell(1, 2);

        expect(sheet.getValue(0, 2)).toBe(0);
        expect(sheet.getValue(1, 2)).toBe(1);
    });
});

describe('undo', () => {
    test('undoes and redoes one change as a single step', () => {
        const sheet = makeSheet(threeRows());

        sheet.setCells([{ row: 0, col: 0, value: 'X' }, { row: 1, col: 0, value: 'Y' }]);
        sheet.undo();
        expect(sheet.getValues().map((row) => row[0])).toEqual(['A-1', 'B-2', 'C-3']);

        sheet.redo();
        expect(sheet.getValues().map((row) => row[0])).toEqual(['X', 'Y', 'C-3']);
    });

    test('puts a removed row object back exactly', () => {
        const rows = threeRows();
        const removed = rows[1];
        const sheet = makeSheet(rows);

        sheet.removeRows(1);
        expect(sheet.getRowCount()).toBe(2);

        sheet.undo();
        expect(sheet.getRows()[1]).toBe(removed);
        expect(removed).toEqual({ sku: 'B-2', qty: '12', taxable: 0, note: 'second' });
    });
});

describe('rows', () => {
    test('lets listeners fill in new rows, and keeps the minimum row count', () => {
        const sheet = makeSheet(threeRows(), { minRows: 1 });
        sheet.on('beforeInsertRows', ({ rows }) => rows.forEach((row) => { row.qty = 1; }));

        sheet.insertRows(3);
        expect(sheet.getValue(3, 1)).toBe(1);

        sheet.removeRows(0, 4);
        expect(sheet.getRowCount()).toBe(1);
    });

    test('sorts the view without changing the saved order', () => {
        const sheet = makeSheet(threeRows());

        sheet.sortBy('sku', 'desc');

        expect(sheet.getValues().map((row) => row[0])).toEqual(['C-3', 'B-2', 'A-1']);
        expect(sheet.getRows().map((row) => row.sku)).toEqual(['A-1', 'B-2', 'C-3']);
    });
});

describe('clipboard', () => {
    test('pastes a block from the active cell, adding rows and dropping columns past the last', () => {
        const sheet = makeSheet([{ sku: 'A-1' }]);

        sheet.select(0, 2);
        sheet.paste('1\tx\tExtra\n0\ty\tMore\n1\tz\tAgain');

        expect(sheet.getRowCount()).toBe(3);
        expect(sheet.getValues().map((row) => row[2])).toEqual(['1', '0', '1']);
        expect(sheet.getRows().every((row) => !('4' in row) && !('extra' in row))).toBe(true);
    });

    test('copies the selection as tab separated text', () => {
        const sheet = makeSheet(threeRows());

        sheet.select(0, 0, 1, 1);

        expect(sheet.copyText()).toBe('A-1\t5\nB-2\t12');
    });
});

describe('one cell at a time', () => {
    test('keeps the selection on the active cell and ignores select all', () => {
        const sheet = makeSheet(threeRows(), { multiSelect: false });

        sheet.select(0, 0, 2, 1);
        expect(sheet.getSelection()).toEqual({ anchor: { row: 0, col: 0 }, focus: { row: 0, col: 0 } });

        sheet.select(1, 1);
        sheet.selectAll();
        expect(sheet.getSelection().focus).toEqual({ row: 1, col: 1 });
    });

    test('pastes only the first value of a block and adds no rows', () => {
        const sheet = makeSheet(threeRows(), { multiSelect: false });

        sheet.select(2, 0);
        sheet.paste('X-1\tA\nX-2\tB\nX-3\tC');

        expect(sheet.getRowCount()).toBe(3);
        expect(sheet.getValues()[2].slice(0, 2)).toEqual(['X-1', 0]);
    });

    test('has no fill handle', () => {
        const sheet = makeSheet(threeRows(), { multiSelect: false });

        sheet.select(0, 0);

        expect(sheet.canFill()).toBe(false);
        expect(sheet.elements.fillHandle.hidden).toBe(true);
    });
});

describe('fill handle', () => {
    test('repeats the selected values as a pattern and selects the filled cells', () => {
        const sheet = makeSheet([...threeRows(), { sku: 'D-4', qty: 30 }]);

        sheet.select(0, 1, 1, 1);
        sheet.fill(sheet.fillArea(3, 1));

        expect(sheet.getValues().map((row) => row[1])).toEqual([5, '12', 5, 12]);
        expect(sheet.getSelection()).toEqual({ anchor: { row: 0, col: 1 }, focus: { row: 3, col: 1 } });
    });

    test('fills upwards and sideways, skipping read only cells', () => {
        const sheet = makeSheet(threeRows());

        sheet.select(2, 0);
        sheet.fill(sheet.fillArea(0, 0));
        expect(sheet.getValues().map((row) => row[0])).toEqual(['C-3', 'C-3', 'C-3']);

        sheet.select(0, 2);
        sheet.fill(sheet.fillArea(0, 3));
        expect(sheet.getValue(0, 3)).toBe('first');
    });

    test('fills down as far as a neighbouring column has values, when the cells below are empty', () => {
        const sheet = makeSheet([{ sku: 'A-1', qty: 7 }, { sku: 'B-2', qty: '' }, { sku: 'C-3' }, { sku: '' }]);

        sheet.select(0, 1);
        expect(sheet.fillDown()).toBe(true);
        expect(sheet.getValues().map((row) => row[1])).toEqual([7, 7, 7, null]);
    });

    test('fills as one undo step', () => {
        const sheet = makeSheet(threeRows());

        sheet.select(0, 0);
        sheet.fill(sheet.fillArea(2, 0));
        sheet.undo();

        expect(sheet.getValues().map((row) => row[0])).toEqual(['A-1', 'B-2', 'C-3']);
    });
});

describe('read only', () => {
    test('opens no editor and writes nothing from typing, pasting or clearing', () => {
        const sheet = makeSheet(threeRows(), { readOnly: true });

        sheet.select(0, 0, 1, 1);
        expect(sheet.openEditor('full')).toBe(false);
        expect(sheet.beginTyping()).toBe(false);

        sheet.paste('X\t1\nY\t2\nZ\t3\nW\t4');
        sheet.clearSelection();

        expect(sheet.getRowCount()).toBe(3);
        expect(sheet.getValues().map((row) => row.slice(0, 2))).toEqual([['A-1', 5], ['B-2', '12'], ['C-3', 0]]);
        expect(sheet.canUndo()).toBe(false);
    });

    test('shows checkboxes disabled and leaves them as they are', () => {
        const sheet = makeSheet(threeRows(), { readOnly: true });

        sheet.toggleCell(0, 2);
        sheet.select(1, 2);
        sheet.changeCheckboxes();

        expect(sheet.getValues().map((row) => row[2])).toEqual([1, 0, 1]);
        expect(sheet.getCellElement(0, 2).querySelector('input').disabled).toBe(true);
        expect(sheet.elements.table.getAttribute('aria-readonly')).toBe('true');
        expect(sheet.element.classList.contains('is-read-only')).toBe(true);
    });

    test('has no fill handle and no movable rows', () => {
        const sheet = makeSheet(threeRows(), { readOnly: true, rowHeaders: true, rowMove: true });

        sheet.select(0, 0);

        expect(sheet.canFill()).toBe(false);
        expect(sheet.elements.fillHandle.hidden).toBe(true);
        expect(sheet.canMoveRows()).toBe(false);
        expect(sheet.getRowHeaderElement(0).classList.contains('is-movable')).toBe(false);
    });

    test('still sorts and searches the view', () => {
        const sheet = makeSheet(threeRows(), { readOnly: true });

        sheet.sortBy('sku', 'desc');

        expect(sheet.getValues().map((row) => row[0])).toEqual(['C-3', 'B-2', 'A-1']);
        expect(sheet.search('b-2')).toEqual([{ row: 1, col: 0 }]);
    });
});

describe('options from a function', () => {
    const cityColumn = (knownOptions) => [{
        key: 'city',
        title: 'City',
        type: 'dropdown',
        options: () => [{ key: 'akl', label: 'Auckland' }],
        knownOptions
    }];

    test('shows saved keys by their known labels before any options load', () => {
        const sheet = makeSheet([{ city: 'akl' }, { city: 'wlg' }], { columns: cityColumn([{ key: 'akl', label: 'Auckland' }]) });

        expect(sheet.getCellElement(0, 0).textContent).toBe('Auckland');
        expect(sheet.getCellElement(1, 0).textContent).toBe('wlg');

        sheet.select(0, 0);
        sheet.openEditor('full');
        expect(sheet.editor.getValue()).toBe('Auckland');
    });

    test('shows saved keys as they are without known labels', () => {
        const sheet = makeSheet([{ city: 'akl' }], { columns: cityColumn() });

        expect(sheet.getCellElement(0, 0).textContent).toBe('akl');
    });
});

describe('row windowing', () => {
    const manyRows = (count) => Array.from({ length: count }, (_, i) => ({ sku: `SKU-${i}`, qty: i }));

    test('draws every row of a small table', () => {
        const sheet = makeSheet(manyRows(150));

        expect(sheet.rowEls).toHaveLength(150);
        expect(sheet.getCellElement(149, 0).textContent).toBe('SKU-149');
    });

    test('draws only a window of a large table, and draws far rows when scrolling to them', () => {
        const sheet = makeSheet(manyRows(5000));

        expect(sheet.rowEls.length).toBeLessThan(100);
        expect(sheet.getCellElement(4000, 0)).toBeNull();

        sheet.scrollToCell({ row: 4000, col: 0 });
        expect(sheet.getCellElement(4000, 0).textContent).toBe('SKU-4000');
    });

    test('saves edits to rows that aren\'t drawn', () => {
        const sheet = makeSheet(manyRows(5000));

        sheet.setCells([{ row: 4999, col: 0, value: 'Last' }]);

        expect(sheet.getRows()[4999].sku).toBe('Last');
    });
});
