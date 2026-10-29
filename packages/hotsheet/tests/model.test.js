import { describe, test, expect } from 'bun:test';
import { RowStore } from '../src/model/store.js';
import { History, invertTransaction } from '../src/model/history.js';

function makeStore() {
    return new RowStore([
        { name: 'Apple', qty: '12', note: 'kept' },
        { name: 'Banana', qty: 5 },
        { name: 'Cherry', qty: 0 }
    ]);
}

function names(store) {
    return store.rows.map((row) => row.name);
}

/**
 * run applies a transaction and records it, the way the sheet does
 */
function run(store, history, ops) {
    history.record(ops.map((op) => store.apply(op)));
}

function undo(store, history) {
    history.pushUndone(invertTransaction(store, history.popDone()).map((op) => store.apply(op)));
}

function redo(store, history) {
    history.pushDone(invertTransaction(store, history.popUndone()).map((op) => store.apply(op)));
}

describe('RowStore', () => {
    test('reads missing keys as null and new rows take the first row keys', () => {
        const store = makeStore();

        expect(store.get(store.at(1), 'note')).toBe(null);
        expect(store.createRow()).toEqual({ name: null, qty: null, note: null });
        expect(new RowStore([{}]).createRow()).toEqual({});
    });

    test('does not add a key when setting nothing over nothing', () => {
        const store = makeStore();
        const row = store.at(1);

        store.apply({ type: 'set', row, key: 'note', to: null });
        expect('note' in row).toBe(false);

        store.apply({ type: 'set', row, key: 'qty', to: null });
        expect(row.qty).toBe(null);
    });

    test('reorders rows and keeps the previous order', () => {
        const store = makeStore();
        const [apple, banana, cherry] = store.rows;
        const applied = store.apply({ type: 'reorder', rows: [banana, cherry, apple] });

        expect(names(store)).toEqual(['Banana', 'Cherry', 'Apple']);
        expect(applied.from).toEqual([apple, banana, cherry]);
    });
});

describe('History with RowStore', () => {
    test('undoes and redoes a cell change, writing null for a key that was missing', () => {
        const store = makeStore();
        const history = new History();
        const row = store.at(1);

        run(store, history, [{ type: 'set', row, key: 'note', to: 'new' }]);
        undo(store, history);
        expect(row).toEqual({ name: 'Banana', qty: 5, note: null });

        redo(store, history);
        expect(row.note).toBe('new');
    });

    test('restores a removed row object exactly', () => {
        const store = makeStore();
        const history = new History();
        const apple = store.at(0);

        run(store, history, [{ type: 'remove', index: 0, rows: [apple] }]);
        expect(names(store)).toEqual(['Banana', 'Cherry']);

        undo(store, history);
        expect(store.at(0)).toBe(apple);
        expect(apple).toEqual({ name: 'Apple', qty: '12', note: 'kept' });
    });

    test('undoes rows added and filled in one transaction in one step', () => {
        const store = makeStore();
        const history = new History();
        const added = store.createRow();

        run(store, history, [
            { type: 'insert', index: 3, rows: [added] },
            { type: 'set', row: added, key: 'name', to: 'Date' },
            { type: 'set', row: store.at(0), key: 'name', to: 'Apricot' }
        ]);
        undo(store, history);

        expect(names(store)).toEqual(['Apple', 'Banana', 'Cherry']);
    });

    test('undoes a reorder back to the previous order', () => {
        const store = makeStore();
        const history = new History();
        store.apply({ type: 'insert', index: 3, rows: [{ name: 'Date' }] });
        const [apple, banana, cherry, date] = store.rows;

        run(store, history, [{ type: 'reorder', rows: [banana, apple, cherry, date] }]);
        expect(names(store)).toEqual(['Banana', 'Apple', 'Cherry', 'Date']);

        undo(store, history);
        expect(names(store)).toEqual(['Apple', 'Banana', 'Cherry', 'Date']);

        redo(store, history);
        expect(names(store)).toEqual(['Banana', 'Apple', 'Cherry', 'Date']);
    });

    test('drops the redo entries when a new change is recorded', () => {
        const store = makeStore();
        const history = new History();

        run(store, history, [{ type: 'set', row: store.at(0), key: 'name', to: 'A' }]);
        undo(store, history);
        run(store, history, [{ type: 'set', row: store.at(0), key: 'name', to: 'B' }]);

        expect(history.canRedo()).toBe(false);
        expect(history.canUndo()).toBe(true);
    });
});
