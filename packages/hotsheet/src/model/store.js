/**
 * RowStore holds the row objects in their saved order and applies operations to them. Rows are the caller's
 * own objects, so keys that aren't columns and the original value types survive untouched.
 *
 * Operations name rows by object, not position, so undo stays correct after rows are inserted, removed
 * or moved:
 *   { type: 'set', row, key, from, to }
 *   { type: 'insert', index, rows }
 *   { type: 'remove', index, rows }
 *   { type: 'reorder', rows }          the same rows in a new order; `from` holds the previous order
 */
export class RowStore {
    constructor(rows = []) {
        this.rows = rows;
        this.schemaKeys = rows.length ? Object.keys(rows[0]) : [];
    }

    get length() {
        return this.rows.length;
    }

    at(index) {
        return this.rows[index];
    }

    indexOf(row) {
        return this.rows.indexOf(row);
    }

    /**
     * get reads a value, missing keys read as null.
     */
    get(row, key) {
        const value = row[key];
        return value === undefined ? null : value;
    }

    /**
     * createRow makes a new row with the first loaded row's keys set to null.
     */
    createRow() {
        const row = {};
        for (const key of this.schemaKeys) {
            row[key] = null;
        }
        return row;
    }

    /**
     * apply performs an operation and returns it with what's needed to invert it.
     */
    apply(op) {
        switch (op.type) {
            case 'set': {
                const from = this.get(op.row, op.key);

                // Setting nothing over nothing leaves the row alone, so no key appears that wasn't there
                if (!(from === null && (op.to === null || op.to === undefined))) {
                    op.row[op.key] = op.to;
                }

                return { ...op, from };
            }

            case 'insert':
                this.rows.splice(op.index, 0, ...op.rows);
                return op;

            case 'remove': {
                const removed = this.rows.splice(op.index, op.rows.length);
                return { ...op, rows: removed };
            }

            case 'reorder': {
                const from = this.rows.slice();
                this.rows.splice(0, this.rows.length, ...op.rows);
                return { ...op, from };
            }

            default:
                throw new Error(`Unknown operation "${op.type}"`);
        }
    }

    /**
     * invert returns the operations that undo an applied operation.
     */
    invert(op) {
        switch (op.type) {
            case 'set':
                return [{ type: 'set', row: op.row, key: op.key, to: op.from }];

            case 'insert':
                return [{ type: 'remove', index: op.index, rows: op.rows }];

            case 'remove':
                return [{ type: 'insert', index: op.index, rows: op.rows }];

            case 'reorder':
                return [{ type: 'reorder', rows: op.from }];

            default:
                throw new Error(`Unknown operation "${op.type}"`);
        }
    }
}
