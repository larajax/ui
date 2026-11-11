/*
 * Number input control
 *
 * Keeps a text input to a number: other characters are dropped as they are typed, the arrow keys step the
 * value and the range applies when the input loses focus. With a display format, the input shows the number
 * with group separators and fixed decimals, while the hidden input after it holds the plain number that posts.
 *
 * Data attributes:
 * - data-control="number-input" - enables the control on a text input, or on an element that only shows a number
 * - data-min / data-max - the range the value is held to when the input loses focus
 * - data-step - what the arrow keys add or take away, default 1
 * - data-number-format - JSON display format with locale, decimals (fixed decimal places) and grouping
 * - data-number-value - marks the hidden input after the text input, or holds the number an element only shows
 *
 * JavaScript API:
 * jax.fetchControl(input, 'number-input').getValue()
 * jax.fetchControl(input, 'number-input').setValue('1250000.5')
 */
'use strict';

export function registerNumberInput(jax) {
    jax.registerControl('number-input', class extends jax.ControlBase {
        init() {
            this.format = resolveFormat(this.element.dataset.numberFormat);
            this.min = this.element.dataset.min;
            this.max = this.element.dataset.max;
            this.step = Number(this.element.dataset.step) || 1;
            this.allowsNegative = !isNumeric(this.min) || Number(this.min) < 0;
        }

        connect() {
            if (!this.element.matches('input')) {
                this.element.textContent = displayPlain(this.element.dataset.numberValue || '', this.format);
                return;
            }

            const next = this.element.nextElementSibling;
            this.valueInput = this.format.isFormatted && next && next.matches('input[type=hidden][data-number-value]')
                ? next
                : this.element;

            // Reformat with the browser's locale separators
            if (this.valueInput !== this.element && document.activeElement !== this.element) {
                this.element.value = displayPlain(this.valueInput.value, this.format);
            }

            this.committedValue = this.getValue();

            this.listen('keydown', this.onKeydown);
            this.listen('input', this.onInput);
            this.listen('change', this.onChange);
            this.listen('blur', this.onBlur);
            this.listen('trigger:disable', this.onTriggerDisable);
        }

        disconnect() {
            this.valueInput = null;
        }

        getValue() {
            return this.valueInput === this.element ? this.readShown() : this.valueInput.value;
        }

        // Shows and posts a value, firing change.
        setValue(value) {
            this.show(normalizePlain(String(value ?? '')));
            this.commit(true);
        }

        onKeydown(ev) {
            if (this.element.readOnly || this.element.disabled) {
                return;
            }

            if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
                ev.preventDefault();
                this.stepBy(ev.key === 'ArrowUp' ? 1 : -1);
                return;
            }

            const group = this.format.grouping ? this.format.group : '';
            const { selectionStart: start, selectionEnd: end, value } = this.element;
            if (!group || start !== end) {
                return;
            }

            // Deleting a separator deletes the digit beyond it
            if (ev.key === 'Backspace' && start > 1 && value[start - 1] === group) {
                ev.preventDefault();
                this.reformat(value.slice(0, start - 2) + value.slice(start - 1), start - 2);
            }
            else if (ev.key === 'Delete' && value[start] === group) {
                ev.preventDefault();
                this.reformat(value.slice(0, start + 1) + value.slice(start + 2), start + 1);
            }
        }

        onInput(ev) {
            if (ev.isComposing) {
                return;
            }

            this.reformat(this.element.value, this.element.selectionStart ?? this.element.value.length);
        }

        // Settles on commit, only a hidden value input needs a change event.
        onChange(ev) {
            if (ev.target === this.element) {
                this.settle(this.readShown());
                this.commit(this.valueInput !== this.element);
            }
        }

        // Settles on blur, announcing arrow key changes.
        onBlur() {
            if (this.isEdited) {
                this.settle(this.getValue());
                this.commit(true);
            }
        }

        onTriggerDisable() {
            if (this.valueInput !== this.element) {
                this.valueInput.disabled = this.element.disabled;
            }
        }

        // Reformats typed text, keeping the caret by its digit.
        reformat(text, caret) {
            const parsed = parse(text, this.format, this.allowsNegative);
            const { display, positions } = render(parsed, this.format);
            const keptBefore = parsed.kept.filter((index) => index < caret).length;

            this.element.value = display;

            if (document.activeElement === this.element) {
                const position = keptBefore === 0
                    ? (positions.length ? positions[0] : 0)
                    : positions[keptBefore - 1] + 1;

                this.element.setSelectionRange(position, position);
            }

            this.writeValue(toPlain(parsed));
            this.isEdited = true;
        }

        // The plain number in the shown text.
        readShown() {
            return toPlain(parse(this.element.value, this.format, this.allowsNegative));
        }

        // Applies range and decimals once editing ends.
        settle(value) {
            value = normalizePlain(value);

            if (value !== '') {
                if (isNumeric(this.min) && Number(value) < Number(this.min)) {
                    value = normalizePlain(this.min);
                }
                else if (isNumeric(this.max) && Number(value) > Number(this.max)) {
                    value = normalizePlain(this.max);
                }

                value = withDecimals(value, this.format.decimals);
            }

            this.show(value);
            this.isEdited = false;
        }

        stepBy(direction) {
            const value = this.getValue() || '0';
            const precision = Math.max(decimalsOf(value), decimalsOf(String(this.step)));
            let next = (Number(value) + direction * this.step).toFixed(precision);

            if (isNumeric(this.min) && Number(next) < Number(this.min)) {
                next = normalizePlain(this.min);
            }
            else if (isNumeric(this.max) && Number(next) > Number(this.max)) {
                next = normalizePlain(this.max);
            }

            this.show(withDecimals(normalizePlain(next), this.format.decimals));
            this.isEdited = true;
        }

        // Shows a plain number and writes the posted value.
        show(value) {
            this.element.value = this.valueInput === this.element ? value : displayPlain(value, this.format);
            this.writeValue(value);
        }

        writeValue(value) {
            if (this.valueInput !== this.element) {
                this.valueInput.value = value;
            }
        }

        // Records a changed value, firing change when asked.
        commit(announce) {
            const value = this.getValue();
            if (value === this.committedValue) {
                return;
            }

            this.committedValue = value;

            if (announce) {
                this.valueInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    });
}

// Reads the display format with the locale's separators
function resolveFormat(json) {
    let options = json;

    if (typeof options === 'string') {
        try {
            options = JSON.parse(options);
        }
        catch (e) {
            options = null;
        }
    }

    if (!options || typeof options !== 'object') {
        return { isFormatted: false, decimal: '.', group: '', groupSize: 0, secondaryGroupSize: 0, decimals: null, grouping: false };
    }

    return Object.assign(
        { isFormatted: true },
        localeSymbols(options.locale),
        {
            decimals: Number.isInteger(options.decimals) ? options.decimals : null,
            grouping: options.grouping !== false
        }
    );
}

function localeSymbols(locale) {
    let parts;

    try {
        parts = new Intl.NumberFormat(locale || undefined).formatToParts(1234567.5);
    }
    catch (e) {
        parts = new Intl.NumberFormat('en').formatToParts(1234567.5);
    }

    const integers = parts.filter((part) => part.type === 'integer').map((part) => part.value.length);
    const group = parts.find((part) => part.type === 'group');
    const decimal = parts.find((part) => part.type === 'decimal');
    const groupSize = integers.length > 1 ? integers[integers.length - 1] : 0;

    return {
        decimal: decimal ? decimal.value : '.',
        group: group ? group.value : '',
        groupSize: groupSize,
        secondaryGroupSize: integers.length > 2 ? integers[integers.length - 2] : groupSize
    };
}

// Parses text into sign and digits, tracking kept characters
function parse(text, format, allowsNegative) {
    const parsed = { sign: '', integer: [], fraction: null, kept: [] };
    let decimalIndex = -1, signIndex = -1;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char >= '0' && char <= '9') {
            if (parsed.fraction === null) {
                parsed.integer.push(i);
            }
            else if (format.decimals === null || parsed.fraction.length < format.decimals) {
                parsed.fraction.push(i);
            }
        }
        else if (parsed.fraction === null && format.decimals !== 0 && isDecimalChar(char, format)) {
            parsed.fraction = [];
            decimalIndex = i;
        }
        else if (allowsNegative && !parsed.sign && !parsed.integer.length && parsed.fraction === null && (char === '-' || char === '−')) {
            parsed.sign = '-';
            signIndex = i;
        }
    }

    // Leading zeros go, apart from the last one before the decimal point
    let leadingZeros = 0;
    while (leadingZeros < parsed.integer.length - 1 && text[parsed.integer[leadingZeros]] === '0') {
        leadingZeros++;
    }
    parsed.integer = parsed.integer.slice(leadingZeros);

    parsed.kept = [signIndex, ...parsed.integer, decimalIndex, ...(parsed.fraction || [])].filter((index) => index >= 0);
    parsed.integer = parsed.integer.map((index) => text[index]).join('');
    parsed.fraction = parsed.fraction === null ? null : parsed.fraction.map((index) => text[index]).join('');

    return parsed;
}

// Decimal symbol, or a point or comma that is not the group
function isDecimalChar(char, format) {
    return char === format.decimal || ((char === '.' || char === ',') && char !== format.group);
}

// Builds the shown text and the position of each kept character in it
function render(parsed, format) {
    const positions = [];
    let display = '';

    if (parsed.sign) {
        positions.push(display.length);
        display += '-';
    }

    if (!parsed.integer && parsed.fraction !== null) {
        display += '0';
    }

    const length = parsed.integer.length;
    for (let i = 0; i < length; i++) {
        if (i > 0 && format.grouping && format.group && isGroupBoundary(length - i, format)) {
            display += format.group;
        }

        positions.push(display.length);
        display += parsed.integer[i];
    }

    if (parsed.fraction !== null) {
        positions.push(display.length);
        display += format.decimal;

        for (const digit of parsed.fraction) {
            positions.push(display.length);
            display += digit;
        }
    }

    return { display, positions };
}

function isGroupBoundary(digitsAfter, format) {
    const size = format.groupSize;
    const secondary = format.secondaryGroupSize || size;

    return size > 0 && (digitsAfter === size || (digitsAfter > size && (digitsAfter - size) % secondary === 0));
}

// The plain number a parse holds, empty while it has no digits
function toPlain(parsed) {
    if (!parsed.integer && !parsed.fraction) {
        return '';
    }

    return parsed.sign + (parsed.integer || '0') + (parsed.fraction ? '.' + parsed.fraction : '');
}

// Shows a plain number with the format's separators and decimals
function displayPlain(value, format) {
    const match = /^(-?)(\d*)(?:\.(\d*))?$/.exec(value);
    if (!match || (!match[2] && !match[3])) {
        return value;
    }

    const plain = withDecimals(normalizePlain(value), format.decimals);
    const [integer, fraction = null] = plain.replace('-', '').split('.');
    const parsed = { sign: plain.startsWith('-') ? '-' : '', integer, fraction };

    return render(parsed, format).display;
}

// Strips leading zeros, a lone point and sign on zero
function normalizePlain(value) {
    const match = /^(-?)(\d*)(?:\.(\d*))?$/.exec(value.trim());
    if (!match || (!match[2] && !match[3])) {
        return '';
    }

    const integer = match[2].replace(/^0+(?=\d)/, '') || '0';
    const fraction = match[3] || '';
    const sign = /[1-9]/.test(integer + fraction) ? match[1] : '';

    return sign + integer + (fraction ? '.' + fraction : '');
}

// Pads or rounds to a number of decimals
function withDecimals(value, decimals) {
    if (decimals === null || value === '') {
        return value;
    }

    const sign = value.startsWith('-') ? '-' : '';
    let [integer, fraction = ''] = value.replace('-', '').split('.');

    if (fraction.length <= decimals) {
        fraction = fraction.padEnd(decimals, '0');
    }
    else {
        const roundsUp = fraction[decimals] >= '5';
        let digits = (integer || '0') + fraction.slice(0, decimals);

        if (roundsUp) {
            digits = increment(digits);
        }

        integer = decimals === 0 ? digits : digits.slice(0, -decimals);
        fraction = decimals === 0 ? '' : digits.slice(-decimals);
    }

    return normalizePlain(sign + integer + (fraction ? '.' + fraction : ''));
}

function increment(digits) {
    const chars = digits.split('');

    for (let i = chars.length - 1; i >= 0; i--) {
        if (chars[i] !== '9') {
            chars[i] = String(Number(chars[i]) + 1);
            return chars.join('');
        }

        chars[i] = '0';
    }

    return '1' + chars.join('');
}

function decimalsOf(value) {
    const point = value.indexOf('.');

    return point === -1 ? 0 : value.length - point - 1;
}

function isNumeric(value) {
    return value !== undefined && value !== null && value !== '' && !isNaN(Number(value));
}
