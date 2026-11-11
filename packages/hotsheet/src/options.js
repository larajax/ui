/**
 * Default sheet options.
 */
export const defaultOptions = {
    // [{ key, title, type, ... }], see normalizeColumn in sheet.js
    columns: [],
    // The row objects, edited in place
    rows: [],
    rowHeaders: false,
    // Pixels scroll inside the grid, 'auto' grows with its rows
    height: 'auto',
    rowHeight: 34,
    // Arrow keys, Tab and Enter wrap at the edges
    wrapNavigation: true,
    decimalSeparator: '.',
    minRows: 0,
    // Empty rows kept at the end, so there is always a row to type into
    spareRows: 0,
    undo: true,
    // Allows only selecting, sorting, searching and copying
    readOnly: false,
    // false keeps selection, copy, paste and delete to one cell at a time
    multiSelect: true,
    // Drag the selection's corner to fill cells (needs multiSelect)
    fillHandle: true,
    // Trims typed text; pasted text is kept as is
    trimWhitespace: true,
    // Tables with more rows than this draw only the rows in view
    windowThreshold: 200,
    // { title, description } or true for "No data", shown with no rows
    emptyState: null,
    // (sheet, cell) => [{ label, disabled, action }], or null for none
    contextMenu: null,
    // Dragging a selected row header moves the rows
    rowMove: false,
    // Header click cycles sort order; the saved order is unchanged
    sorting: false,
    // Dragging a header's right edge resizes the column
    columnResize: true,
    // Dragging a selected column header moves the column, for viewing only
    columnMove: false,
    // Extra class for checkbox inputs, such as form-check-input
    checkboxClass: null,
    // (event, sheet) => true to handle a key first, when not editing
    keyHandler: null,
    // Translation from languages/, defaulting to the page's lang
    language: null,
    // Strings over the translation, see defaultLang in lang.js
    lang: {}
};

/**
 * makeOptions merges options over copied defaults, skipping nulls.
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
