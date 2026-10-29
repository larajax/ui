/**
 * History keeps applied transactions for undo and redo. A transaction is the list of operations one action
 * applied, so one undo reverses one action however many cells and rows it touched. Undo applies the inverse
 * of the last done transaction and keeps what that applied as the redo entry, and redo does the reverse.
 */
export class History {
    constructor(limit = 100) {
        this.limit = limit;
        this.done = [];
        this.undone = [];
    }

    /**
     * record keeps a new transaction, which ends any redo.
     */
    record(ops) {
        if (!ops.length) {
            return;
        }

        this.pushDone(ops);
        this.undone = [];
    }

    pushDone(ops) {
        this.done.push(ops);

        if (this.done.length > this.limit) {
            this.done.shift();
        }
    }

    pushUndone(ops) {
        this.undone.push(ops);
    }

    popDone() {
        return this.done.pop() || null;
    }

    popUndone() {
        return this.undone.pop() || null;
    }

    canUndo() {
        return this.done.length > 0;
    }

    canRedo() {
        return this.undone.length > 0;
    }

    clear() {
        this.done = [];
        this.undone = [];
    }
}

/**
 * invertTransaction returns the operations that reverse an applied transaction.
 */
export function invertTransaction(store, ops) {
    return ops.slice().reverse().flatMap((op) => store.invert(op));
}
