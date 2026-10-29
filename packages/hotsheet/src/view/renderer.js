import { cellType } from '../cells/types.js';
import { WINDOW_MARGIN } from './window.js';

/**
 * Builds the grid's DOM. Every row is a CSS grid sharing one column template, so columns line up without
 * measuring: explicit widths stay fixed, other columns share the space left over (at least MIN_FLEX_WIDTH
 * each), and when the minimums don't fit the table scrolls sideways. Headers stay in view with sticky
 * positioning instead of cloned tables.
 */

export const MIN_FLEX_WIDTH = 60;
export const MIN_COLUMN_WIDTH = 30;
export const ROW_HEADER_WIDTH = 50;

function element(tag, className, attributes = {}) {
    const el = document.createElement(tag);
    if (className) {
        el.className = className;
    }
    for (const [name, value] of Object.entries(attributes)) {
        el.setAttribute(name, value);
    }
    return el;
}

/**
 * columnTemplate returns the grid-template-columns value and the narrowest the table may get.
 */
export function columnTemplate(columns, rowHeaders) {
    const flexCount = columns.filter((column) => !column.width).length;
    let minWidth = rowHeaders ? ROW_HEADER_WIDTH : 0;

    const tracks = columns.map((column, index) => {
        if (column.width) {
            // A width is pixels, or a percentage of the table such as '15%'
            const isPercent = typeof column.width === 'string' && column.width.endsWith('%');
            const width = isPercent ? column.width : `${column.width}px`;
            minWidth += isPercent ? 0 : column.width;

            // With no flexible columns, the last one takes up any space left over
            const isLast = index === columns.length - 1;
            return flexCount === 0 && isLast ? `minmax(${width}, 1fr)` : width;
        }

        minWidth += MIN_FLEX_WIDTH;
        return `minmax(${MIN_FLEX_WIDTH}px, 1fr)`;
    });

    if (rowHeaders) {
        tracks.unshift(`${ROW_HEADER_WIDTH}px`);
    }

    return { template: tracks.join(' '), minWidth };
}

/**
 * buildSkeleton creates the scroller, table, header row, body and editor slots inside the root.
 */
export function buildSkeleton(root) {
    root.classList.add('hotsheet');

    const scroller = element('div', 'hotsheet-scroller');
    const table = element('div', 'hotsheet-table', { role: 'grid' });
    const head = element('div', 'hotsheet-row hotsheet-head', { role: 'row', 'aria-rowindex': '1' });
    const body = element('div', 'hotsheet-body', { role: 'rowgroup' });
    const fillArea = element('div', 'hotsheet-fill-area', { 'aria-hidden': 'true', hidden: '' });
    const fillHandle = element('div', 'hotsheet-fill-handle', { 'aria-hidden': 'true', hidden: '' });

    table.append(head, body, fillArea, fillHandle);
    scroller.append(table);
    root.replaceChildren(scroller);

    return { scroller, table, head, body, fillArea, fillHandle };
}

export function renderHead(sheet) {
    const { head } = sheet.elements;
    const cells = [];

    if (sheet.options.rowHeaders) {
        cells.push(element('div', 'hotsheet-corner', { role: 'columnheader' }));
    }

    const sort = sheet.sortState;

    sheet.viewColumns.forEach((column, index) => {
        const cell = element('div', 'hotsheet-header', {
            role: 'columnheader',
            'data-col': index,
            'aria-colindex': index + 1 + (sheet.options.rowHeaders ? 1 : 0)
        });
        const label = element('span', 'hotsheet-header-label');
        label.textContent = column.title;
        cell.append(label);

        if (sheet.options.sorting) {
            label.classList.add('is-sortable');
            const order = sort && sort.key === column.key ? sort.order : null;
            cell.setAttribute('aria-sort', order === 'asc' ? 'ascending' : (order === 'desc' ? 'descending' : 'none'));
            if (order) {
                label.classList.add(`is-sorted-${order}`);
            }
        }

        if (sheet.options.columnResize) {
            cell.append(element('span', 'hotsheet-resizer', { 'aria-hidden': 'true' }));
        }

        markFrozen(sheet, cell, index);
        cells.push(cell);
    });

    head.replaceChildren(...cells);
}

/**
 * markFrozen makes a cell in a frozen column stick at its column's left offset.
 */
function markFrozen(sheet, cell, colIndex) {
    if (colIndex < sheet.frozenCount) {
        cell.classList.add('is-frozen');
        cell.classList.toggle('is-last-frozen', colIndex === sheet.frozenCount - 1);
        cell.style.left = `var(--hotsheet-frozen-${colIndex})`;
    }
}

/**
 * renderBody draws the rows in view, or a given window of rows, with spacers keeping the place of the others;
 * `reuse` keeps already drawn rows, for redraws that only follow scrolling.
 */
export function renderBody(sheet, range = sheet.neededRows(WINDOW_MARGIN), reuse = false) {
    const fragment = document.createDocumentFragment();
    const count = sheet.viewRows.length;
    const first = Math.max(0, range.first);
    const last = Math.min(count - 1, range.last);
    const rowEls = [];
    const offsets = sheet.isWindowed() ? sheet.getRowOffsets() : null;
    const drawn = reuse ? { first: sheet.rowWindow.first, rowEls: sheet.rowEls } : null;

    if (offsets) {
        fragment.append(renderSpacer(offsets[first]));
    }

    for (let rowIndex = first; rowIndex <= last; rowIndex++) {
        const rowEl = drawn?.rowEls[rowIndex - drawn.first] || renderRow(sheet, sheet.viewRows[rowIndex], rowIndex);
        rowEls.push(rowEl);
        fragment.append(rowEl);
    }

    if (offsets) {
        fragment.append(renderSpacer(offsets[count] - offsets[last + 1]));
    }

    if (!count && sheet.options.emptyState) {
        fragment.append(renderEmptyState(sheet.options.emptyState));
    }

    sheet.rowWindow = { first, last };
    sheet.rowEls = rowEls;
    sheet.elements.body.replaceChildren(fragment);
    sheet.elements.table.setAttribute('aria-rowcount', sheet.viewRows.length + 1);
    sheet.elements.table.setAttribute('aria-colcount', sheet.viewColumns.length + (sheet.options.rowHeaders ? 1 : 0));
}

/**
 * renderSpacer keeps the height of rows that aren't drawn.
 */
function renderSpacer(height) {
    const spacer = element('div', 'hotsheet-spacer', { 'aria-hidden': 'true' });
    spacer.style.height = `${height}px`;
    return spacer;
}

/**
 * renderEmptyState shows the empty message as a ghost row across every column.
 */
function renderEmptyState({ title, description }) {
    const rowEl = element('div', 'hotsheet-row hotsheet-empty is-last', { role: 'row' });
    const cell = element('div', 'hotsheet-empty-message', { role: 'gridcell' });

    if (title) {
        const titleEl = element('span', 'hotsheet-empty-title');
        titleEl.textContent = title;
        cell.append(titleEl);
    }

    if (description) {
        const descriptionEl = element('span', 'hotsheet-empty-description');
        descriptionEl.textContent = description;
        cell.append(descriptionEl);
    }

    rowEl.append(cell);
    return rowEl;
}

function renderRow(sheet, row, rowIndex) {
    const rowEl = element('div', 'hotsheet-row', { role: 'row', 'aria-rowindex': rowIndex + 2 });

    // Striping and the last row's edge go by row number, since a large table draws only some rows
    rowEl.classList.toggle('is-even', rowIndex % 2 === 1);
    rowEl.classList.toggle('is-last', rowIndex === sheet.viewRows.length - 1);

    // After a save found errors, rows with invalid cells stand out until fixed
    if (sheet.revealErrors && sheet.rowHasInvalid(row)) {
        rowEl.classList.add('has-invalid');
    }

    if (sheet.options.rowHeaders) {
        const header = element('div', 'hotsheet-row-header', { role: 'rowheader', 'data-row': rowIndex });
        header.textContent = rowIndex + 1;
        header.classList.toggle('is-movable', sheet.canMoveRows());
        rowEl.append(header);
    }

    sheet.viewColumns.forEach((column, colIndex) => {
        rowEl.append(renderCell(sheet, row, rowIndex, column, colIndex));
    });

    return rowEl;
}

export function renderCell(sheet, row, rowIndex, column, colIndex) {
    const type = cellType(column);
    const cell = element('div', 'hotsheet-cell', {
        role: 'gridcell',
        'data-row': rowIndex,
        'data-col': colIndex,
        'aria-colindex': colIndex + 1 + (sheet.options.rowHeaders ? 1 : 0)
    });

    if (type.className) {
        cell.classList.add(...type.className.split(' '));
    }
    cell.classList.add(column.wrap ? 'is-wrap' : 'is-ellipsis');

    if (column.readOnly) {
        cell.classList.add('is-read-only');
        cell.setAttribute('aria-readonly', 'true');
    }

    if (sheet.isInvalidRow(row, column.key)) {
        cell.classList.add('is-invalid');
        cell.setAttribute('aria-invalid', 'true');

        const message = sheet.invalidMessageOf(row, column.key);
        if (message) {
            cell.title = message;
        }
    }

    if (sheet.isSearchHitRow(row, column.key)) {
        cell.classList.add('is-search-hit');
    }

    markFrozen(sheet, cell, colIndex);

    type.render(cell, sheet.store.get(row, column.key), column, sheet);

    return cell;
}

/**
 * applyLayout sets the column template, table minimum width and height on the elements.
 */
export function applyLayout(sheet) {
    const { scroller, table } = sheet.elements;
    const { template, minWidth } = columnTemplate(sheet.viewColumns, sheet.options.rowHeaders);

    sheet.element.classList.toggle('is-striped', !!sheet.options.striped);
    sheet.element.classList.toggle('is-read-only', !!sheet.options.readOnly);
    table.setAttribute('aria-multiselectable', String(sheet.options.multiSelect));
    table.setAttribute('aria-readonly', String(!!sheet.options.readOnly));
    table.style.setProperty('--hotsheet-columns', template);
    table.style.setProperty('--hotsheet-min-width', `${minWidth}px`);
    table.style.setProperty('--hotsheet-row-height', `${sheet.options.rowHeight}px`);
    table.style.setProperty('--hotsheet-row-header-width', `${sheet.options.rowHeaders ? ROW_HEADER_WIDTH : 0}px`);

    if (typeof sheet.options.height === 'number') {
        scroller.style.height = `${sheet.options.height}px`;
        scroller.classList.add('has-height');
    }
    else {
        scroller.style.height = '';
        scroller.classList.remove('has-height');
    }
}
