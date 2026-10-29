/**
 * parseNumericText reads text entered in a numeric cell. The decimal separator tells grouped thousands
 * (`1,234` or `1.234.567`) apart from decimals; a single separator that isn't a thousands group is read as
 * a decimal either way, so `3,5` and `3.5` are both 3.5. With a comma decimal a lone `.` group is still a
 * decimal point, since stored numbers show as `2.125`. Returns null when the text isn't a number.
 */
export function parseNumericText(value, decimalSeparator = '.') {
    const decimal = decimalSeparator === ',' ? ',' : '.';
    const group = decimal === ',' ? '.' : ',';
    const grouped = decimal === ','
        ? /^[+-]?\d{1,3}(?:(?:\.\d{3}){2,}(?:,\d+)?|(?:\.\d{3})+,\d+)$/
        : /^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/;
    const plain = /^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)(?:e[+-]?\d+)?$/i;
    let text = String(value).trim().replace(/^([+-])\s+/, '$1');

    if (grouped.test(text)) {
        text = text.split(group).join('').replace(decimal, '.');
    }
    else if (plain.test(text)) {
        text = text.replace(',', '.');
    }
    else {
        return null;
    }

    const number = parseFloat(text);

    return isFinite(number) ? number : null;
}

/**
 * isNumericValue checks a stored value is a number or numeric text, for the numeric validator.
 */
export function isNumericValue(value) {
    if (typeof value === 'number') {
        return isFinite(value);
    }

    return typeof value === 'string' && /^\s*[+-]?\s*\d+(?:\.\d+)?(?:e[+-]?\d+)?\s*$/i.test(value);
}

/**
 * isEmptyValue checks for the values a cleared cell can hold.
 */
export function isEmptyValue(value) {
    return value === null || value === undefined || value === '';
}
