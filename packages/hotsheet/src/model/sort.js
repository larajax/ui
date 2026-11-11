import { isEmptyValue, isNumericValue } from '../values/numeric.js';

/**
 * sortRows orders rows by a column's values, empty values last.
 */
export function sortRows(rows, column, order, getValue) {
    const numbers = [];
    const texts = [];
    const empty = [];
    const isNumeric = column.type === 'numeric';

    for (const row of rows) {
        const value = getValue(row);
        (isEmptyValue(value) ? empty : (isNumeric && isNumericValue(value) ? numbers : texts)).push(row);
    }

    const direction = order === 'desc' ? -1 : 1;

    numbers.sort((a, b) => (Number(getValue(a)) - Number(getValue(b))) * direction);
    texts.sort((a, b) => compareText(getValue(a), getValue(b)) * direction);

    return numbers.concat(texts, empty);
}

function compareText(a, b) {
    const x = String(a).toLowerCase();
    const y = String(b).toLowerCase();

    return x < y ? -1 : (x > y ? 1 : 0);
}
