/**
 * Default sheet options.
 */
export const defaultOptions = {
    // [{ key, title, type, ... }], see normalizeColumn in sheet.js
    columns: [],
    // The row objects, edited in place
    rows: [],
    rowHeaders: false,
    // A height in pixels makes the grid scroll inside itself, 'auto' grows it with its rows
    height: 'auto',
    rowHeight: 30,
    // Arrow keys, Tab and Enter wrap to the next row or column at the edges
    wrapNavigation: true,
    decimalSeparator: '.',
    minRows: 0,
    undo: true,
    // Nothing can be edited, filled or moved, only selected, sorted, searched and copied
    readOnly: false,
    // false keeps selection, copy, paste and delete to one cell at a time
    multiSelect: true,
    // A square on the selection's corner drags its values into neighbouring cells (needs multiSelect)
    fillHandle: true,
    // Spaces around text typed into the editor are dropped; pasted text is kept as is
    trimWhitespace: true,
    // Tables with more rows than this draw only the rows in view
    windowThreshold: 200,
    // { title, description } shown in place of rows while there are none
    emptyState: null,
    // (sheet, cell) => [{ label, disabled, action }] for a right click or long press, or null for no menu
    contextMenu: null,
    // Dragging a selected row header moves the rows
    rowMove: false,
    // Clicking a header label cycles ascending, descending and unsorted; the saved order is unchanged
    sorting: false,
    // Dragging a header's right edge resizes the column
    columnResize: true,
    // Dragging a selected column header moves the column, for viewing only
    columnMove: false,
    // Alternate rows are tinted
    striped: false,
    // Extra class for checkbox inputs, such as a framework's form-check-input
    checkboxClass: null,
    // (event, sheet) => true when a key is handled before the grid's own keys, while not editing
    keyHandler: null,
    // Translated strings, see defaultLang in lang.js
    lang: {}
};

/**
 * makeOptions merges options over the defaults, leaving out undefined and null values, and copies the array
 * defaults so sheets never share them.
 */
export function makeOptions(options) {
    const result = {};

    Object.keys(defaultOptions).forEach((key) => {
        const value = defaultOptions[key];
        result[key] = Array.isArray(value) ? value.slice() : value;
    });

    Object.keys(options || {}).forEach((key) => {
        if (options[key] !== undefined && options[key] !== null) {
            result[key] = options[key];
        }
    });

    return result;
}
