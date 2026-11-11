import { Emitter } from './emitter.js';
import { RowStore } from './model/store.js';
import { History, invertTransaction } from './model/history.js';
import { cellType, textOf, toggledCheckboxValue } from './cells/types.js';
import { isEmptyValue } from './values/numeric.js';
import { parseTsv, stringifyTsv } from './values/tsv.js';
import { moveCell, extendCell, rangeOf } from './view/navigation.js';
import { sortRows } from './model/sort.js';
import { buildSkeleton, renderHead, renderBody, applyLayout, ROW_HEADER_WIDTH, MIN_COLUMN_WIDTH } from './view/renderer.js';
import { CellEditor } from './view/editor.js';
import { OptionList } from './view/options.js';
import { NativePicker } from './view/picker.js';
import { ContextMenu } from './view/menu.js';
import { rowOffsets, windowFor, covers, WINDOW_MARGIN, WINDOW_EDGE } from './view/window.js';
import { makeOptions } from './options.js';
import { makeTranslator } from './lang.js';
import { bindInput } from './view/input.js';

/**
 * normalizeColumn fills in column defaults. Option columns (`dropdown`, `autocomplete`) take `options` as
 * [{ key, label }] or a function ({ query, row, rowData }) returning them (or a promise of them); `filter`
 * narrows the list to labels containing the typed text, `strict` flags values that aren't an option, and
 * `knownOptions` ([{ key, label }]) labels saved keys of a function's column before its options load.
 */
function normalizeColumn(column) {
    const normalized = {
        type: 'text',
        title: column.key,
        width: null,
        readOnly: false,
        wrap: false,
        checkedValue: true,
        uncheckedValue: false,
        validator: null,
        allowEmpty: true,
        options: null,
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        correctFormat: true,
        ...column
    };

    normalized.filter = column.filter ?? normalized.type === 'autocomplete';
    normalized.strict = column.strict ?? normalized.type === 'dropdown';

    // Labels by key text; keys kept so numeric keys stay numbers
    normalized.labels = new Map();
    normalized.keys = new Map();
    if (Array.isArray(normalized.options)) {
        learnOptions(normalized, normalized.options);
    }

    if (Array.isArray(normalized.knownOptions)) {
        learnOptions(normalized, normalized.knownOptions);
    }

    return normalized;
}

function learnOptions(column, items) {
    for (const item of items) {
        column.labels.set(String(item.key), item.label);
        column.keys.set(String(item.key), item.key);
    }
}

/**
 * Sheet is an editable grid over an array of row objects.
 *
 * Coordinates are visual: `row` indexes the rows as shown and `col` the columns as shown. Every edit goes
 * through a transaction, which is validated, recorded for undo, rendered and announced in one place.
 *
 * Events, listened to with `on(name, listener)`, which returns a function that stops listening:
 *   beforeChange      { changes: [{ row, rowData, key, value, cancel }], source }  values may be changed or cancelled
 *   change            { changes: [{ row, rowData, key, from, to }], ops, source }
 *   beforeInsertRows  { rows, index, source }  new row objects, which listeners may fill with defaults
 *   select            { selection }            after a selection settles
 *   deselect
 *   sort              { sort }
 *   columnResize      { col, key, width }
 */
export class Sheet extends Emitter {
    constructor(element, options = {}) {
        super();

        this.element = element;
        this.options = makeOptions(options);
        this.lang = makeTranslator(this.options.lang, this.options.language || document.documentElement.lang);
        this.columns = this.options.columns.map((column) => normalizeColumn({ checkboxClass: this.options.checkboxClass, ...column }));
        this.store = new RowStore(this.options.rows);
        this.history = new History();
        this.invalid = new WeakMap();
        this.selection = null;
        this.painted = [];

        // Row window: drawn rows, their elements, wrapped row heights
        this.rowWindow = { first: 0, last: -1 };
        this.rowEls = [];
        this.rowHeights = new WeakMap();

        this.elements = buildSkeleton(element);
        this.editor = new CellEditor(this.elements.table);
        this.optionList = new OptionList(element, (item) => this.commitEditor(item.key));
        this.picker = new NativePicker(this.elements.table, (text) => this.commitEditor(text));
        this.menu = new ContextMenu(element);
        this.optionsRequest = 0;
        this.optionsShown = 0;

        // View state: column order, frozen columns, sort and search
        this.columnOrder = this.columns.slice();
        this.frozenCount = 0;
        this.sortState = null;
        this.sortedRows = null;
        this.searchQuery = '';

        this.fillMinRows();
        this.refreshView();
        applyLayout(this);
        this.render();

        this.unbindInput = bindInput(this);
    }

    //
    // Reading
    //

    getRowCount() {
        return this.viewRows.length;
    }

    getColumnCount() {
        return this.viewColumns.length;
    }

    getColumns() {
        return this.viewColumns.slice();
    }

    /**
     * getRows returns the row objects in their saved order.
     */
    getRows() {
        return this.store.rows.slice();
    }

    getRowData(row) {
        return this.viewRows[row];
    }

    getValue(row, col) {
        const rowData = this.viewRows[row];
        const column = this.viewColumns[col];

        return rowData && column ? this.store.get(rowData, column.key) : null;
    }

    getValues() {
        return this.viewRows.map((rowData) => this.viewColumns.map((column) => this.store.get(rowData, column.key)));
    }

    columnIndex(key) {
        return this.viewColumns.findIndex((column) => column.key === key);
    }

    getRowElement(row) {
        return row >= this.rowWindow.first && row <= this.rowWindow.last ? this.rowEls[row - this.rowWindow.first] || null : null;
    }

    getCellElement(row, col) {
        const rowEl = this.getRowElement(row);
        return rowEl ? rowEl.children[col + (this.options.rowHeaders ? 1 : 0)] || null : null;
    }

    getHeaderElement(col) {
        return this.elements.head.children[col + (this.options.rowHeaders ? 1 : 0)] || null;
    }

    getRowHeaderElement(row) {
        const rowEl = this.getRowElement(row);
        return rowEl && this.options.rowHeaders ? rowEl.children[0] : null;
    }

    isInvalidRow(rowData, key) {
        return !!this.invalid.get(rowData)?.has(key);
    }

    /**
     * rowHasInvalid tells whether any cell of a row is flagged.
     */
    rowHasInvalid(rowData) {
        return !!this.invalid.get(rowData)?.size;
    }

    invalidMessageOf(rowData, key) {
        return this.invalid.get(rowData)?.get(key) || '';
    }

    isInvalid(row, col) {
        const column = this.viewColumns[col];
        return !!column && this.isInvalidRow(this.viewRows[row], column.key);
    }

    getInvalidMessage(row, col) {
        const column = this.viewColumns[col];
        return column ? this.invalidMessageOf(this.viewRows[row], column.key) : '';
    }

    /**
     * markInvalid flags a cell with a message and tints its row.
     */
    markInvalid(row, col, message = '') {
        const column = this.viewColumns[col];
        const rowData = this.viewRows[row];
        if (!column || !rowData) {
            return;
        }

        this.setInvalid(rowData, column.key, message);
        this.revealErrors = true;
        this.render();
    }

    setInvalid(rowData, key, message) {
        if (!this.invalid.has(rowData)) {
            this.invalid.set(rowData, new Map());
        }

        if (message === null) {
            this.invalid.get(rowData).delete(key);
        }
        else {
            this.invalid.get(rowData).set(key, message);
        }
    }

    isEditing() {
        return this.editor.isOpen();
    }

    /**
     * getEditorValue returns the editor's value, or a matched option key.
     */
    getEditorValue() {
        if (!this.editor.isOpen()) {
            return null;
        }

        const column = this.viewColumns[this.editor.cell.col];
        const text = this.editor.getValue();
        const type = cellType(column);

        return type.editorValue ? type.editorValue(text, column) : text;
    }

    isCellEditable(row, col) {
        const column = this.viewColumns[col];
        return !!column && !column.readOnly && !this.options.readOnly;
    }

    /**
     * canMoveRows tells whether dragging row headers moves rows.
     */
    canMoveRows() {
        return !!this.options.rowMove && !this.options.readOnly;
    }

    //
    // Editing data
    //

    /**
     * setCells sets values by row and column, as one undoable change.
     */
    setCells(cells, source = 'edit') {
        const changes = cells.map((cell) => {
            const column = cell.key !== undefined ? this.viewColumns[this.columnIndex(cell.key)] : this.viewColumns[cell.col];
            return { row: cell.row, rowData: this.viewRows[cell.row], column, value: cell.value };
        });

        return this.transact(this.changesToOps(changes, source), source);
    }

    /**
     * insertRows adds empty rows at a visual index.
     */
    insertRows(index, count = 1, source = 'insert') {
        const dataIndex = index >= this.viewRows.length ? this.store.length : this.store.indexOf(this.viewRows[index]);
        const rows = this.createRows(count, index, source);

        // When sorted, new rows go before the row shown at the index
        const sortedIndex = this.sortedRows && index < this.viewRows.length ? this.sortedRows.indexOf(this.viewRows[index]) : -1;
        if (sortedIndex !== -1) {
            this.sortedRows.splice(sortedIndex, 0, ...rows);
        }

        // A selection at or below the new rows moves down with its rows
        if (this.selection) {
            const shift = (cell) => (cell.row >= index ? { ...cell, row: cell.row + count } : cell);
            this.selection = { anchor: shift(this.selection.anchor), focus: shift(this.selection.focus) };
        }

        return this.transact([{ type: 'insert', index: dataIndex, rows }], source);
    }

    /**
     * createRows makes empty rows for beforeInsertRows to fill.
     */
    createRows(count, index, source) {
        const rows = Array.from({ length: count }, () => this.store.createRow());

        if (rows.length) {
            this.emit('beforeInsertRows', { rows, index, source });
        }

        return rows;
    }

    /**
     * moveRows moves rows to a gap, saving a sorted view's order.
     */
    moveRows(rows, gap, source = 'move') {
        const sorted = rows.slice().sort((a, b) => a - b);
        const moving = sorted.map((row) => this.viewRows[row]);
        const order = this.viewRows.filter((row) => !moving.includes(row));
        const target = gap - sorted.filter((row) => row < gap).length;

        order.splice(target, 0, ...moving);

        if (!this.sortedRows && order.every((row, i) => row === this.store.at(i))) {
            return [];
        }

        const wasSorted = !!this.sortedRows;
        this.sortState = null;
        this.sortedRows = null;

        const applied = this.transact([{ type: 'reorder', rows: order }], source);
        this.select(target, 0, target + moving.length - 1, this.getColumnCount() - 1);

        if (wasSorted) {
            this.emit('sort', { sort: this.getSort() });
        }

        return applied;
    }

    //
    // Sorting
    //

    getSort() {
        return this.sortState ? [{ column: this.sortState.key, order: this.sortState.order }] : [];
    }

    /**
     * cycleSort moves a column through ascending, descending and unsorted.
     */
    cycleSort(col) {
        const column = this.viewColumns[col];
        const current = this.sortState && this.sortState.key === column.key ? this.sortState.order : null;
        const next = current === null ? 'asc' : (current === 'asc' ? 'desc' : null);

        this.sortBy(column.key, next);
    }

    /**
     * sortBy sorts the view by a column, or unsorts for a null order.
     */
    sortBy(key, order) {
        this.commitEditor();

        const column = this.columns.find((item) => item.key === key);

        if (!order || !column) {
            this.sortState = null;
            this.sortedRows = null;
        }
        else {
            this.sortState = { key, order };
            this.sortedRows = sortRows(this.store.rows, column, order, (row) => this.store.get(row, key));
        }

        this.refreshView();
        this.render();
        this.emit('sort', { sort: this.getSort() });
    }

    //
    // Searching
    //

    /**
     * search highlights matching cells and returns their positions.
     */
    search(query) {
        this.searchQuery = String(query || '');
        this.render();
        return this.getSearchHits();
    }

    isSearchHitRow(rowData, key) {
        const query = this.searchQuery.toLowerCase();
        if (!query) {
            return false;
        }

        const value = this.store.get(rowData, key);
        return !isEmptyValue(value) && String(value).toLowerCase().includes(query);
    }

    isSearchHit(row, col) {
        const column = this.viewColumns[col];
        return !!column && this.isSearchHitRow(this.viewRows[row], column.key);
    }

    getSearchHits() {
        const hits = [];
        for (let row = 0; row < this.getRowCount(); row++) {
            for (let col = 0; col < this.getColumnCount(); col++) {
                if (this.isSearchHit(row, col)) {
                    hits.push({ row, col });
                }
            }
        }
        return hits;
    }

    //
    // Columns
    //

    /**
     * resizeColumn sets a column's width in pixels, or null to share.
     */
    resizeColumn(col, width) {
        const column = this.viewColumns[col];
        if (!column) {
            return;
        }

        column.width = typeof width === 'number' ? Math.max(MIN_COLUMN_WIDTH, Math.round(width)) : (width || null);
        applyLayout(this);
        this.updateFrozenOffsets();
        this.emit('columnResize', { col, key: column.key, width: column.width });
    }

    /**
     * moveColumns moves columns to a gap, for viewing only.
     */
    moveColumns(cols, gap) {
        const sorted = cols.slice().sort((a, b) => a - b);
        const moving = sorted.map((col) => this.columnOrder[col]);
        const order = this.columnOrder.filter((column) => !moving.includes(column));
        const target = gap - sorted.filter((col) => col < gap).length;

        order.splice(target, 0, ...moving);
        this.setColumnOrder(order);
        this.select(0, target, this.getRowCount() - 1, target + moving.length - 1);
    }

    isColumnFrozen(col) {
        return col < this.frozenCount;
    }

    getFrozenCount() {
        return this.frozenCount;
    }

    /**
     * freezeColumn pins a column at the left, after the frozen columns.
     */
    freezeColumn(col) {
        if (col < this.frozenCount || !this.columnOrder[col]) {
            return;
        }

        const order = this.columnOrder.slice();
        const [column] = order.splice(col, 1);
        order.splice(this.frozenCount, 0, column);
        this.frozenCount++;
        this.setColumnOrder(order);
    }

    /**
     * unfreezeColumn unpins a column, placing it after the frozen ones.
     */
    unfreezeColumn(col) {
        if (col >= this.frozenCount) {
            return;
        }

        this.frozenCount--;
        const order = this.columnOrder.slice();
        const [column] = order.splice(col, 1);
        order.splice(this.frozenCount, 0, column);
        this.setColumnOrder(order);
    }

    setColumnOrder(order) {
        this.commitEditor();
        this.columnOrder = order;
        this.refreshView();
        applyLayout(this);
        this.render();
    }

    /**
     * frozenWidth returns the width row headers and frozen columns cover.
     */
    frozenWidth() {
        let width = this.options.rowHeaders ? ROW_HEADER_WIDTH : 0;

        for (let col = 0; col < this.frozenCount; col++) {
            width += this.getHeaderElement(col)?.offsetWidth || 0;
        }

        return width;
    }

    /**
     * updateFrozenOffsets measures frozen columns to stack their offsets.
     */
    updateFrozenOffsets() {
        let left = this.options.rowHeaders ? ROW_HEADER_WIDTH : 0;

        for (let col = 0; col < this.frozenCount; col++) {
            this.elements.table.style.setProperty(`--hotsheet-frozen-${col}`, `${left}px`);
            left += this.getHeaderElement(col)?.offsetWidth || 0;
        }
    }

    removeRows(index, count = 1, source = 'remove') {
        const removed = this.viewRows.slice(index, index + count);
        const ops = removed
            .map((rowData) => this.store.indexOf(rowData))
            .sort((a, b) => b - a)
            .map((dataIndex) => ({ type: 'remove', index: dataIndex, rows: [this.store.at(dataIndex)] }));

        // Top up to minRows in the same change
        const shortBy = this.options.minRows - (this.store.length - ops.length);
        if (shortBy > 0) {
            ops.push({
                type: 'insert',
                index: this.store.length - ops.length,
                rows: this.createRows(shortBy, this.viewRows.length - removed.length, source)
            });
        }

        return this.transact(ops, source);
    }

    undo() {
        const ops = this.history.popDone();
        if (ops) {
            this.history.pushUndone(this.transact(invertTransaction(this.store, ops), 'undo', false));
        }
    }

    redo() {
        const ops = this.history.popUndone();
        if (ops) {
            this.history.pushDone(this.transact(invertTransaction(this.store, ops), 'redo', false));
        }
    }

    /**
     * changesToOps parses changes, runs beforeChange, returns set ops.
     */
    changesToOps(changes, source) {
        const prepared = changes
            .filter((change) => change.rowData && change.column)
            .map((change) => ({
                row: change.row,
                rowData: change.rowData,
                key: change.column.key,
                value: cellType(change.column).parse(change.value, change.column, this.options),
                cancel: false
            }));

        if (prepared.length) {
            this.emit('beforeChange', { changes: prepared, source });
        }

        return prepared
            .filter((change) => !change.cancel)
            .map((change) => ({ type: 'set', row: change.rowData, key: change.key, to: change.value }));
    }

    /**
     * transact applies operations as one change and announces it.
     */
    transact(ops, source, record = true) {
        if (!ops.length) {
            return [];
        }

        const applied = ops.map((op) => this.store.apply(op));

        // Spare rows join the change, so undo removes them too
        for (const op of this.spareRowOps(source)) {
            applied.push(this.store.apply(op));
        }

        for (const op of applied) {
            if (op.type === 'set') {
                this.validate(op.row, op.key);
            }
        }

        if (record && this.options.undo) {
            this.history.record(applied);
        }

        this.refreshView();
        this.render();

        const changes = applied
            .filter((op) => op.type === 'set')
            .map((op) => ({ row: this.viewRows.indexOf(op.row), rowData: op.row, key: op.key, from: op.from, to: op.to }));

        this.emit('change', { changes, ops: applied, source });

        return applied;
    }

    /**
     * validate checks a cell; validators return true, false or a message.
     */
    validate(rowData, key) {
        const column = this.columns.find((item) => item.key === key);
        if (!column) {
            return;
        }

        const value = this.store.get(rowData, key);
        const isValid = (result) => result === true || result === undefined || result === null;
        let result = true;

        if (isEmptyValue(value)) {
            result = column.allowEmpty ? true : (column.validator ? column.validator(value, column, rowData) : false);
        }
        else {
            const typeValidator = cellType(column).validate;
            result = typeValidator ? typeValidator(value, column, rowData) : true;

            if (isValid(result) && column.validator) {
                result = column.validator(value, column, rowData);
            }
        }

        const valid = isValid(result);
        this.setInvalid(rowData, key, valid ? null : (typeof result === 'string' ? result : ''));
    }

    fillMinRows() {
        while (this.store.length < this.options.minRows) {
            this.store.apply({ type: 'insert', index: this.store.length, rows: [this.store.createRow()] });
        }

        for (const op of this.spareRowOps('spare')) {
            this.store.apply(op);
        }
    }

    /**
     * spareRowOps returns an insert topping up the spare rows.
     */
    spareRowOps(source) {
        const wanted = this.options.spareRows;
        let empty = 0;

        while (empty < wanted && empty < this.store.length && this.isEmptyRow(this.store.at(this.store.length - 1 - empty))) {
            empty++;
        }

        const count = wanted - empty;
        if (count <= 0) {
            return [];
        }

        return [{ type: 'insert', index: this.store.length, rows: this.createRows(count, this.viewRows ? this.viewRows.length : this.store.length, source) }];
    }

    isEmptyRow(rowData) {
        return this.columns.every((column) => isEmptyValue(this.store.get(rowData, column.key)));
    }

    //
    // Replacing
    //

    /**
     * setRows replaces the rows, clearing undo, selection, sort and marks.
     */
    setRows(rows) {
        this.cancelEditor();
        this.options.rows = rows;
        this.store = new RowStore(rows);
        this.history = new History();
        this.invalid = new WeakMap();
        this.rowHeights = new WeakMap();
        this.sortState = null;
        this.sortedRows = null;
        this.selection = null;

        this.fillMinRows();
        this.refreshView();
        this.elements.scroller.scrollTop = 0;
        this.render();
    }

    /**
     * setReadOnly turns editing off or on, saving typed text first.
     */
    setReadOnly(readOnly) {
        this.commitEditor();
        this.options.readOnly = !!readOnly;
        applyLayout(this);
        this.render();
    }

    /**
     * setHeight sets the height option: pixels or 'auto'.
     */
    setHeight(height) {
        this.options.height = height;
        applyLayout(this);
        this.render();
    }

    //
    // Selection
    //

    getSelection() {
        if (!this.selection) {
            return null;
        }

        const { anchor, focus } = this.selection;
        return { anchor: { ...anchor }, focus: { ...focus } };
    }

    getActiveCell() {
        return this.selection ? { ...this.selection.anchor } : null;
    }

    /**
     * select makes `row, col` active, selecting through `row2, col2`.
     */
    select(row, col, row2 = row, col2 = col, { scroll = true, notify = true } = {}) {
        const rows = this.getRowCount();
        const cols = this.getColumnCount();

        if (!rows || !cols) {
            this.deselect();
            return;
        }

        if (!this.options.multiSelect) {
            row2 = row;
            col2 = col;
        }

        const fit = (value, count) => Math.min(Math.max(value, 0), count - 1);

        this.selection = {
            anchor: { row: fit(row, rows), col: fit(col, cols) },
            focus: { row: fit(row2, rows), col: fit(col2, cols) }
        };

        this.paintSelection();

        if (scroll) {
            this.scrollToCell(this.selection.focus);
        }

        if (notify) {
            this.emit('select', { selection: this.getSelection() });
        }
    }

    selectAll() {
        if (!this.options.multiSelect) {
            return;
        }

        this.select(0, 0, this.getRowCount() - 1, this.getColumnCount() - 1, { scroll: false });
    }

    deselect() {
        if (!this.selection) {
            return;
        }

        this.selection = null;
        this.paintSelection();
        this.emit('deselect');
    }

    /**
     * moveActive moves the active cell by a step, wrapping at edges.
     */
    moveActive(rowStep, colStep) {
        if (!this.selection) {
            return;
        }

        const next = moveCell(this.selection.anchor, rowStep, colStep, this.getRowCount(), this.getColumnCount(), this.options.wrapNavigation);
        this.select(next.row, next.col);
    }

    /**
     * extendFocus moves the selection's far corner by a step.
     */
    extendFocus(rowStep, colStep) {
        if (!this.selection) {
            return;
        }

        const focus = extendCell(this.selection.focus, rowStep, colStep, this.getRowCount(), this.getColumnCount());
        const { anchor } = this.selection;
        this.select(anchor.row, anchor.col, focus.row, focus.col);
    }

    /**
     * scrollToCell brings a cell into view, drawing its rows if needed.
     */
    scrollToCell(cell) {
        if (!this.getRowElement(cell.row) && cell.row < this.viewRows.length) {
            this.renderRows({ first: cell.row - WINDOW_MARGIN, last: cell.row + WINDOW_MARGIN });
        }

        this.getCellElement(cell.row, cell.col)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    /**
     * countVisibleRows returns how many rows fit in view, for paging.
     */
    countVisibleRows() {
        const { scroller, head } = this.elements;
        const box = scroller.classList.contains('has-height')
            ? scroller.getBoundingClientRect()
            : { top: 0, bottom: window.innerHeight };
        const top = Math.max(box.top, head.getBoundingClientRect().bottom);

        return this.rowEls.filter((rowEl) => {
            const rect = rowEl.getBoundingClientRect();
            return rect.top >= top - 1 && rect.bottom <= box.bottom + 1;
        }).length;
    }

    //
    // Editor
    //

    canEditAsText(cell) {
        return !!cell && this.isCellEditable(cell.row, cell.col) && cellType(this.viewColumns[cell.col]).editsAsText !== false;
    }

    /**
     * openEditor edits the active cell, starting from its value.
     */
    openEditor(mode = 'full') {
        const cell = this.getActiveCell();
        if (!this.canEditAsText(cell)) {
            return false;
        }

        const column = this.viewColumns[cell.col];
        const value = this.getValue(cell.row, cell.col);
        const type = cellType(column);
        const text = type.editText ? type.editText(value, column) : textOf(value);

        this.scrollToCell(cell);
        this.editor.open(cell, this.getCellElement(cell.row, cell.col), text, mode);
        this.openEditorExtras();
        return true;
    }

    /**
     * beginTyping opens an empty editor so the pressed key lands in it.
     */
    beginTyping() {
        const cell = this.getActiveCell();
        if (!this.canEditAsText(cell)) {
            return false;
        }

        this.scrollToCell(cell);
        this.editor.openForTyping(cell, this.getCellElement(cell.row, cell.col));
        this.openEditorExtras();
        return true;
    }

    /**
     * openEditorExtras shows the cell type's option list or picker button.
     */
    openEditorExtras() {
        const { cell } = this.editor;
        const column = this.viewColumns[cell.col];
        const type = cellType(column);

        if (type.hasOptions) {
            this.updateOptions();
        }

        if (type.picker) {
            const format = type.picker === 'date' ? column.dateFormat : column.timeFormat;
            this.picker.attach(type.picker, format, this.getCellElement(cell.row, cell.col), this.lang(type.picker === 'date' ? 'chooseDate' : 'chooseTime'));
        }
    }

    /**
     * updateOptions loads the cell's options and shows matching ones.
     */
    async updateOptions() {
        const { cell } = this.editor;
        const column = cell && this.viewColumns[cell.col];
        if (!column || !cellType(column).hasOptions) {
            return;
        }

        const request = ++this.optionsRequest;
        const text = this.editor.getValue();
        const cellEl = this.getCellElement(cell.row, cell.col);

        // Function options may be loading from the server
        cellEl?.classList.toggle('is-loading', typeof column.options === 'function');
        const items = await this.loadOptions(column, cell.row, text);
        cellEl?.classList.remove('is-loading');

        // A newer request or a closed editor makes this answer stale
        if (request !== this.optionsRequest || !this.editor.isOpen()) {
            return;
        }

        learnOptions(column, items);
        cellEl?.classList.add('is-open');
        this.optionsShown = request;

        const query = text.toLowerCase();
        const shown = column.filter && query ? items.filter((item) => String(item.label).toLowerCase().includes(query)) : items;
        const exact = shown.findIndex((item) => String(item.label).toLowerCase() === query);
        const highlight = exact >= 0 ? exact : (!column.filter && query === '' && shown.length ? 0 : -1);

        // Anchored to the editor, which survives row redraws
        this.optionList.show(this.editor.textarea, shown, highlight);
        this.editor.describeOptions(this.optionList);
    }

    async loadOptions(column, row, query) {
        if (typeof column.options === 'function') {
            return (await column.options({ query, row, rowData: this.viewRows[row] })) || [];
        }

        return column.options || [];
    }

    moveOptionHighlight(step) {
        this.optionList.move(step);
        this.editor.describeOptions(this.optionList);
    }

    openPicker() {
        if (this.editor.isOpen() && this.picker.isAttached()) {
            this.picker.open(this.editor.getValue());
        }
    }

    /**
     * commitEditor saves and closes the editor, if the text changed.
     */
    commitEditor(value) {
        if (!this.editor.isOpen()) {
            return;
        }

        const { cell, originalText } = this.editor;
        let given = value !== undefined;

        if (!given) {
            // The highlight counts only on a list showing the latest options
            const listIsCurrent = this.optionList.isOpen() && this.optionsShown === this.optionsRequest;
            const highlighted = listIsCurrent ? this.optionList.highlighted() : null;
            given = !!highlighted;
            value = highlighted ? highlighted.key : this.editor.getValue();
        }

        if (!given && value === originalText) {
            this.cancelEditor();
            return;
        }

        if (this.options.trimWhitespace && typeof value === 'string') {
            value = value.trim();
        }

        this.closeEditor();
        this.setCells([{ row: cell.row, col: cell.col, value }], 'edit');
    }

    cancelEditor() {
        if (!this.editor.isOpen()) {
            return;
        }

        this.closeEditor();
        this.paintSelection();
    }

    closeEditor() {
        const { cell } = this.editor;
        const cellEl = cell && this.getCellElement(cell.row, cell.col);
        cellEl?.classList.remove('is-open', 'is-loading');

        this.optionsRequest++;
        this.optionList.hide();
        this.picker.detach();
        this.editor.close();
    }

    //
    // Checkboxes
    //

    /**
     * toggleCell flips one checkbox cell.
     */
    toggleCell(row, col) {
        const column = this.viewColumns[col];
        if (!column || column.type !== 'checkbox' || !this.isCellEditable(row, col)) {
            return;
        }

        const value = toggledCheckboxValue(this.getValue(row, col), column);
        this.setCells([{ row, col, value: value === undefined ? column.checkedValue : value }], 'edit');
    }

    /**
     * changeCheckboxes toggles or unchecks checkboxes, false if none.
     */
    changeCheckboxes(uncheck = false) {
        if (!this.selection) {
            return false;
        }

        const { top, bottom, left, right } = rangeOf(this.selection);
        if (this.viewColumns[left].type !== 'checkbox') {
            return false;
        }

        const cells = [];
        for (let row = top; row <= bottom; row++) {
            for (let col = left; col <= right; col++) {
                const column = this.viewColumns[col];
                if (column.type !== 'checkbox' || !this.isCellEditable(row, col)) {
                    continue;
                }

                const value = uncheck ? column.uncheckedValue : toggledCheckboxValue(this.getValue(row, col), column);
                if (value !== undefined) {
                    cells.push({ row, col, value });
                }
            }
        }

        this.setCells(cells, 'edit');
        return true;
    }

    //
    // Clipboard
    //

    copyText() {
        if (!this.selection) {
            return '';
        }

        const { top, bottom, left, right } = rangeOf(this.selection);
        const rows = [];

        for (let row = top; row <= bottom; row++) {
            const values = [];
            for (let col = left; col <= right; col++) {
                values.push(this.getValue(row, col));
            }
            rows.push(values);
        }

        return stringifyTsv(rows);
    }

    /**
     * clearSelection empties every editable selected cell.
     */
    clearSelection(source = 'edit') {
        if (!this.selection) {
            return;
        }

        const { top, bottom, left, right } = rangeOf(this.selection);
        const cells = [];

        for (let row = top; row <= bottom; row++) {
            for (let col = left; col <= right; col++) {
                if (this.isCellEditable(row, col)) {
                    cells.push({ row, col, value: '' });
                }
            }
        }

        this.setCells(cells, source);
    }

    /**
     * paste writes clipboard text at the selection, repeating to fill it.
     */
    paste(text) {
        if (!this.selection || text === '') {
            return;
        }

        const parsed = parseTsv(text);
        const input = this.options.multiSelect ? parsed : [[parsed[0][0]]];
        const { top, bottom, left, right } = rangeOf(this.selection);
        const endRow = Math.max(bottom, top + input.length - 1);
        const endCol = Math.min(Math.max(right, left + input[0].length - 1), this.getColumnCount() - 1);
        const values = [];

        for (let row = top; row <= endRow; row++) {
            const inputRow = input[(row - top) % input.length];
            const line = [];
            for (let col = left; col <= endCol; col++) {
                line.push(inputRow[(col - left) % inputRow.length]);
            }
            values.push(line);
        }

        this.writeValues(top, left, values, 'paste');
        this.select(top, left, Math.min(endRow, this.getRowCount() - 1), endCol);
    }

    /**
     * writeValues writes rows of values from a cell as one change.
     */
    writeValues(top, left, values, source = 'edit') {
        const rowCount = this.getRowCount();
        const colCount = this.getColumnCount();
        const isWritable = (row, colOffset) => left + colOffset < colCount && this.isCellEditable(row, left + colOffset);

        // Rows past the last one are added up to the last that gets a value
        let lastRow = rowCount - 1;
        values.forEach((line, offset) => {
            if (top + offset >= rowCount && line.some((value, colOffset) => isWritable(top + offset, colOffset))) {
                lastRow = top + offset;
            }
        });

        const newRows = this.createRows(lastRow - rowCount + 1, rowCount, source);
        const changes = [];

        values.forEach((line, offset) => {
            const row = top + offset;
            const rowData = row < rowCount ? this.viewRows[row] : newRows[row - rowCount];
            if (!rowData) {
                return;
            }

            line.forEach((value, colOffset) => {
                const col = left + colOffset;
                if (col < colCount && this.isCellEditable(row, col)) {
                    changes.push({ row, rowData, column: this.viewColumns[col], value });
                }
            });
        });

        const ops = newRows.length ? [{ type: 'insert', index: this.store.length, rows: newRows }] : [];
        return this.transact(ops.concat(this.changesToOps(changes, source)), source);
    }

    //
    // Fill handle
    //

    canFill() {
        return this.options.fillHandle && this.options.multiSelect && !this.options.readOnly && !!this.selection;
    }

    /**
     * fillArea returns the cells a fill to `row, col` covers, or null.
     */
    fillArea(row, col) {
        if (!this.selection) {
            return null;
        }

        const { top, bottom, left, right } = rangeOf(this.selection);

        if (row > bottom) {
            return { top: bottom + 1, bottom: row, left, right };
        }
        if (row < top) {
            return { top: row, bottom: top - 1, left, right };
        }
        if (col > right) {
            return { top, bottom, left: right + 1, right: col };
        }
        if (col < left) {
            return { top, bottom, left: col, right: left - 1 };
        }

        return null;
    }

    /**
     * fill repeats the selected values into an area as one change.
     */
    fill(area) {
        if (!this.canFill() || !area) {
            return;
        }

        const { top, bottom, left, right } = rangeOf(this.selection);
        const height = bottom - top + 1;
        const width = right - left + 1;
        const wrap = (offset, size) => ((offset % size) + size) % size;
        const values = [];

        for (let row = area.top; row <= area.bottom; row++) {
            const line = [];
            for (let col = area.left; col <= area.right; col++) {
                line.push(this.getValue(top + wrap(row - top, height), left + wrap(col - left, width)) ?? null);
            }
            values.push(line);
        }

        this.writeValues(area.top, area.left, values, 'fill');
        this.select(Math.min(top, area.top), Math.min(left, area.left), Math.max(bottom, area.bottom), Math.max(right, area.right));
    }

    /**
     * fillDown fills down as far as a neighbouring column has values.
     */
    fillDown() {
        if (!this.canFill()) {
            return false;
        }

        const { bottom, left, right } = rangeOf(this.selection);
        let last = null;

        for (let row = bottom + 1; row < this.getRowCount(); row++) {
            for (let col = left; col <= right; col++) {
                if (!isEmptyValue(this.getValue(row, col))) {
                    return false;
                }
            }

            if (!isEmptyValue(this.getValue(row, left - 1)) || !isEmptyValue(this.getValue(row, right + 1))) {
                last = row;
            }
        }

        if (last === null) {
            return false;
        }

        this.fill({ top: bottom + 1, bottom: last, left, right });
        return true;
    }

    /**
     * placeFillHandle centers the handle on the selection's corner.
     */
    placeFillHandle() {
        const handle = this.elements.fillHandle;
        const range = this.selection && rangeOf(this.selection);
        const cornerEl = this.canFill() && this.getCellElement(range.bottom, range.right);

        handle.hidden = !cornerEl;
        if (!cornerEl) {
            return;
        }

        const cell = cornerEl.getBoundingClientRect();
        const table = this.elements.table.getBoundingClientRect();
        const { borderRightWidth, borderBottomWidth } = getComputedStyle(cornerEl);
        const half = handle.offsetWidth / 2;
        handle.style.left = `${Math.min(cell.right - parseFloat(borderRightWidth) - table.left, table.width - half)}px`;
        handle.style.top = `${Math.min(cell.bottom - parseFloat(borderBottomWidth) - table.top, table.height - half)}px`;
    }

    /**
     * showFillArea outlines the selection and fill area, or hides it.
     */
    showFillArea(area) {
        const outline = this.elements.fillArea;
        const range = this.selection && rangeOf(this.selection);
        const topLeftEl = area && this.getCellElement(Math.min(range.top, area.top), Math.min(range.left, area.left));
        const bottomRightEl = area && this.getCellElement(Math.max(range.bottom, area.bottom), Math.max(range.right, area.right));

        outline.hidden = !topLeftEl || !bottomRightEl;
        if (outline.hidden) {
            return;
        }

        const start = topLeftEl.getBoundingClientRect();
        const end = bottomRightEl.getBoundingClientRect();
        const table = this.elements.table.getBoundingClientRect();
        const { borderRightWidth, borderBottomWidth } = getComputedStyle(bottomRightEl);
        Object.assign(outline.style, {
            left: `${start.left - table.left}px`,
            top: `${start.top - table.top}px`,
            width: `${end.right - parseFloat(borderRightWidth) - start.left}px`,
            height: `${end.bottom - parseFloat(borderBottomWidth) - start.top}px`
        });
    }

    //
    // Context menu
    //

    /**
     * openContextMenu shows the contextMenu option's menu at a position.
     */
    openContextMenu(x, y) {
        if (typeof this.options.contextMenu !== 'function' || !this.selection) {
            return false;
        }

        const items = this.options.contextMenu(this, this.getActiveCell());
        if (!items || !items.length) {
            return false;
        }

        this.commitEditor();
        this.menu.show(x, y, items, () => this.editor.focus());
        return true;
    }

    canUndo() {
        return this.history.canUndo();
    }

    canRedo() {
        return this.history.canRedo();
    }

    //
    // Rendering
    //

    /**
     * refreshView orders view rows: sorted first, then rows added since.
     */
    refreshView() {
        this.viewColumns = this.columnOrder.slice();

        if (this.sortedRows) {
            const present = new Set(this.store.rows);
            const sorted = this.sortedRows.filter((row) => present.has(row));
            const inSorted = new Set(sorted);
            this.viewRows = sorted.concat(this.store.rows.filter((row) => !inSorted.has(row)));
        }
        else {
            this.viewRows = this.store.rows.slice();
        }
    }

    //
    // Row window
    //

    isWindowed() {
        return this.viewRows.length > this.options.windowThreshold;
    }

    /**
     * neededRows returns the rows in view plus a margin, or every row.
     */
    neededRows(margin) {
        const count = this.viewRows.length;
        if (!this.isWindowed()) {
            return { first: 0, last: count - 1 };
        }

        const { scroller, body } = this.elements;
        const view = scroller.classList.contains('has-height') ? scroller.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
        const bodyTop = body.getBoundingClientRect().top;

        return windowFor(this.getRowOffsets(), view.top - bodyTop, view.bottom - bodyTop, margin);
    }

    /**
     * getRowOffsets returns each row's top, with wrapped rows measured.
     */
    getRowOffsets() {
        const rowHeight = this.rowHeightPx || this.options.rowHeight;
        return rowOffsets(this.viewRows.length, (row) => this.rowHeights.get(this.viewRows[row]) || rowHeight);
    }

    /**
     * updateWindow redraws once scrolling nears rows that aren't drawn.
     */
    updateWindow() {
        if (this.isWindowed() && !covers(this.rowWindow, this.neededRows(WINDOW_EDGE))) {
            this.renderRows();
        }
    }

    /**
     * renderRows redraws the body for the rows in view or a given window.
     */
    renderRows(range) {
        renderBody(this, range, true);
        this.measureRows();
        this.paintSelection();

        if (this.editor.isOpen()) {
            this.getCellElement(this.editor.cell.row, this.editor.cell.col)?.classList.add('is-open');
        }
    }

    /**
     * measureRows records wrapped row heights for placing far rows.
     */
    measureRows() {
        if (!this.isWindowed() || !this.viewColumns.some((column) => column.wrap)) {
            return;
        }

        this.rowEls.forEach((rowEl, index) => {
            this.rowHeights.set(this.viewRows[this.rowWindow.first + index], rowEl.offsetHeight);
        });
    }

    /**
     * rowGapAt returns the drawn row gap nearest a pointer height.
     */
    rowGapAt(clientY) {
        for (let index = 0; index < this.rowEls.length; index++) {
            const rect = this.rowEls[index].getBoundingClientRect();
            if (clientY < rect.top + rect.height / 2) {
                return this.rowWindow.first + index;
            }
        }

        return this.rowWindow.last + 1;
    }

    render() {
        renderHead(this);
        renderBody(this);
        this.measureRows();
        this.updateFrozenOffsets();
        this.elements.scroller.style.scrollPaddingTop = `${this.elements.head.offsetHeight}px`;
        this.elements.scroller.style.scrollPaddingLeft = `${this.frozenWidth()}px`;

        // Rows may have gone, so keep the selection inside the grid
        if (this.selection) {
            const { anchor, focus } = this.selection;
            this.select(anchor.row, anchor.col, focus.row, focus.col, { scroll: false, notify: false });
        }
        else {
            this.paintSelection();
        }
    }

    paintSelection() {
        // While something is selected the grid is the field being worked in
        this.element.classList.toggle('is-active', !!this.selection);

        for (const el of this.painted) {
            el.classList.remove('is-selected', 'is-active', 'is-highlighted');
            el.removeAttribute('aria-selected');
        }
        this.painted = [];
        this.placeFillHandle();

        if (!this.selection) {
            return;
        }

        const { top, bottom, left, right } = rangeOf(this.selection);
        const isRange = top !== bottom || left !== right;

        // Only drawn rows can be painted
        for (let row = Math.max(top, this.rowWindow.first); row <= Math.min(bottom, this.rowWindow.last); row++) {
            for (let col = left; col <= right; col++) {
                const cellEl = this.getCellElement(row, col);
                if (cellEl) {
                    cellEl.setAttribute('aria-selected', 'true');
                    if (isRange) {
                        cellEl.classList.add('is-selected');
                    }
                    this.painted.push(cellEl);
                }
            }

            const rowHeader = this.getRowHeaderElement(row);
            if (rowHeader) {
                rowHeader.classList.add('is-highlighted');
                this.painted.push(rowHeader);
            }
        }

        for (let col = left; col <= right; col++) {
            const header = this.getHeaderElement(col);
            if (header) {
                header.classList.add('is-highlighted');
                this.painted.push(header);
            }
        }

        const { anchor } = this.selection;
        const activeEl = this.getCellElement(anchor.row, anchor.col);
        if (activeEl) {
            activeEl.classList.add('is-active');
            this.editor.park(activeEl);
        }
    }

    destroy() {
        this.unbindInput();
        this.optionList.destroy();
        this.picker.destroy();
        this.menu.destroy();
        this.editor.destroy();
        this.clearListeners();
        this.element.replaceChildren();
        this.element.classList.remove('hotsheet', 'is-active', 'is-resizing', 'is-read-only');
    }
}
