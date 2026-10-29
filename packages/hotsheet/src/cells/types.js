import { parseNumericText, isNumericValue, isEmptyValue } from '../values/numeric.js';
import { correctDate, correctTime, isInFormat } from '../values/dates.js';

/**
 * Cell types decide how a value is shown, how typed or pasted text becomes a value, and how a value is
 * validated. Types without an entry here are shown and edited as text.
 *
 * Type properties:
 *   render(cell, value, column)        fills the cell element
 *   parse(value, column, options)      turns entered text into the stored value
 *   validate(value, column)            checks a non-empty value
 *   editorValue(text, column)          the value an open editor holds, when it differs from its text
 *   editText(value, column)            the text an editor starts with
 *   editsAsText                        false when the type has no text editor (checkbox)
 *   hasOptions                         shows an option list while editing
 *   picker                             'date' or 'time' for a native picker while editing
 */

function textOf(value) {
    return value === null || value === undefined ? '' : String(value);
}

function sameText(a, b) {
    return textOf(a).toLowerCase() === textOf(b).toLowerCase();
}

/**
 * checkboxBoolean reads booleans, 1 and 0, and their text forms.
 */
function checkboxBoolean(value) {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value === 1 ? true : (value === 0 ? false : null);
    }

    if (typeof value === 'string') {
        const text = value.trim().toLowerCase();
        if (text === '1' || text === 'true') {
            return true;
        }
        if (text === '0' || text === 'false') {
            return false;
        }
    }

    return null;
}

/**
 * checkboxState returns checked, unchecked, empty (shown unchecked) or bad for a checkbox value.
 */
export function checkboxState(value, column) {
    const bool = checkboxBoolean(value);

    if (value === column.checkedValue || sameText(value, column.checkedValue) || bool === true) {
        return 'checked';
    }

    if (value === column.uncheckedValue || sameText(value, column.uncheckedValue) || bool === false) {
        return 'unchecked';
    }

    return isEmptyValue(value) ? 'empty' : 'bad';
}

/**
 * toggledCheckboxValue returns the value after a toggle, or undefined for a value that isn't a checkbox value.
 */
export function toggledCheckboxValue(value, column) {
    const state = checkboxState(value, column);

    if (state === 'checked') {
        return column.uncheckedValue;
    }

    return state === 'bad' ? undefined : column.checkedValue;
}

/**
 * optionLabel returns the label shown for an option key, or the value itself when its label isn't known.
 */
export function optionLabel(column, value) {
    if (isEmptyValue(value)) {
        return '';
    }

    const label = column.labels.get(String(value));
    return label !== undefined ? label : String(value);
}

/**
 * optionKey returns the key of the option whose label (or key) matches entered text, or the text itself.
 */
export function optionKey(column, text) {
    const wanted = String(text).toLowerCase();

    for (const [key, label] of column.labels) {
        if (String(label).toLowerCase() === wanted) {
            return column.keys.get(key);
        }
    }

    return column.keys.has(String(text)) ? column.keys.get(String(text)) : text;
}

function renderText(cell, value) {
    cell.textContent = textOf(value);
}

function renderCheckbox(cell, value, column) {
    const state = checkboxState(value, column);
    const input = document.createElement('input');

    input.type = 'checkbox';
    input.tabIndex = -1;
    input.className = column.checkboxClass ? `hotsheet-checkbox ${column.checkboxClass}` : 'hotsheet-checkbox';
    input.checked = state === 'checked';
    input.disabled = column.readOnly;
    input.setAttribute('aria-label', column.title);

    if (state === 'bad') {
        input.hidden = true;
        cell.classList.add('is-bad-value');
    }

    cell.replaceChildren(input);
}

const optionType = {
    className: 'has-options',
    hasOptions: true,
    render: (cell, value, column) => {
        cell.textContent = optionLabel(column, value);
    },
    parse: (value, column) => (typeof value === 'string' && value !== '' ? optionKey(column, value) : value),
    validate: (value, column) => !column.strict || !column.labels.size || column.labels.has(String(value)),
    editorValue: (text, column) => (text === '' ? text : optionKey(column, text)),
    editText: (value, column) => optionLabel(column, value)
};

export const CELL_TYPES = {
    text: {
        render: renderText,
        parse: (value) => value
    },

    numeric: {
        className: 'is-numeric',
        render: renderText,
        parse: (value, column, options) => {
            if (typeof value !== 'string') {
                return value;
            }
            const number = parseNumericText(value, options.decimalSeparator);
            return number === null ? value : number;
        },
        validate: isNumericValue
    },

    checkbox: {
        className: 'is-checkbox',
        render: renderCheckbox,
        parse: (value) => value,
        editsAsText: false
    },

    dropdown: optionType,

    autocomplete: optionType,

    date: {
        className: 'has-picker',
        picker: 'date',
        render: renderText,
        parse: (value, column) => {
            if (typeof value !== 'string' || value === '' || !column.correctFormat) {
                return value;
            }
            const corrected = correctDate(value, column.dateFormat);
            return corrected === null ? value : corrected;
        },
        validate: (value, column) => isInFormat(value, column.dateFormat, correctDate)
    },

    time: {
        className: 'has-picker is-time',
        picker: 'time',
        render: renderText,
        parse: (value, column) => {
            if (typeof value !== 'string' || value === '' || !column.correctFormat) {
                return value;
            }
            const corrected = correctTime(value, column.timeFormat);
            return corrected === null ? value : corrected;
        },
        validate: (value, column) => isInFormat(value, column.timeFormat, correctTime)
    }
};

export function cellType(column) {
    return CELL_TYPES[column.type] || CELL_TYPES.text;
}

/**
 * registerCellType adds a column type, or replaces one, using the type properties described above.
 */
export function registerCellType(name, definition) {
    CELL_TYPES[name] = { render: renderText, parse: (value) => value, ...definition };
}

export { textOf };
