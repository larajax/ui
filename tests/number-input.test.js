import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { registerNumberInput } from '../resources/assets/controls/number-input/number-input.js';
import { makeFakeJax } from './support/fake-control-jax.js';

let jax;

beforeAll(() => {
    jax = makeFakeJax();
    registerNumberInput(jax);
});

afterEach(() => {
    jax.disconnectAll();
    document.body.innerHTML = '';
});

// Renders a number field the way the form's number partial does, with a hidden value input when it has a format
function mountNumber({ value = '', format = null, min = null, max = null, step = null } = {}) {
    const attributes = [
        min !== null ? `data-min="${min}"` : '',
        max !== null ? `data-max="${max}"` : '',
        step !== null ? `data-step="${step}"` : '',
        format ? `data-number-format='${JSON.stringify(format)}'` : ''
    ].join(' ');

    document.body.innerHTML = format
        ? `<form><input type="text" id="amount" data-control="number-input" ${attributes} /><input type="hidden" name="amount" value="${value}" data-number-value /></form>`
        : `<form><input type="text" name="amount" id="amount" value="${value}" data-control="number-input" ${attributes} /></form>`;

    jax.connectAll();

    const input = document.getElementById('amount');
    const valueInput = document.querySelector('[name=amount]');
    const changes = [];
    document.addEventListener('change', (ev) => changes.push(`${ev.target === input ? 'input' : 'hidden'}:${ev.target.value}`));

    return {
        input,
        changes,
        control: jax.fetchControl(input, 'number-input'),
        posted: () => valueInput.value
    };
}

// Types text at the caret, the way the browser leaves the input before its input event
function type(input, text) {
    input.focus();
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    input.value = input.value.slice(0, start) + text + input.value.slice(end);
    input.setSelectionRange(start + text.length, start + text.length);
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function placeCaret(input, position) {
    input.focus();
    input.setSelectionRange(position, position);
}

function press(input, key) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    input.dispatchEvent(event);

    return event;
}

function leave(input) {
    input.dispatchEvent(new Event('blur'));
}

describe('number input with a format', () => {
    test('shows the stored value with group separators and fixed decimals, leaving the posted value alone', () => {
        const { input, posted } = mountNumber({ value: '1250000.5', format: { locale: 'en', decimals: 2 } });

        expect(input.value).toBe('1,250,000.50');
        expect(posted()).toBe('1250000.5');
    });

    test('groups digits as they are typed and posts the plain number', () => {
        const { input, posted } = mountNumber({ format: { locale: 'en' } });

        type(input, '1250000');

        expect(input.value).toBe('1,250,000');
        expect(input.selectionStart).toBe(9);
        expect(posted()).toBe('1250000');
    });

    test('keeps the caret beside the same digit when a separator moves', () => {
        const { input } = mountNumber({ value: '1250000', format: { locale: 'en' } });

        placeCaret(input, 4);
        type(input, '3');

        expect(input.value).toBe('12,530,000');
        expect(input.selectionStart).toBe(5);
    });

    test('backspace after a separator deletes the digit before it', () => {
        const { input, posted } = mountNumber({ value: '1250000', format: { locale: 'en' } });

        placeCaret(input, 6);
        const event = press(input, 'Backspace');

        expect(event.defaultPrevented).toBe(true);
        expect(input.value).toBe('125,000');
        expect(input.selectionStart).toBe(3);
        expect(posted()).toBe('125000');
    });

    test('delete before a separator deletes the digit after it', () => {
        const { input } = mountNumber({ value: '1250000', format: { locale: 'en' } });

        placeCaret(input, 1);
        press(input, 'Delete');

        expect(input.value).toBe('150,000');
        expect(input.selectionStart).toBe(1);
    });

    test('drops other characters and stops at the fixed decimals', () => {
        const { input, posted } = mountNumber({ format: { locale: 'en', decimals: 2 } });

        type(input, '$12a,3.456');

        expect(input.value).toBe('123.45');
        expect(posted()).toBe('123.45');
    });

    test('leaving the input pads the decimals and announces the change from the hidden input once', () => {
        const { input, posted, changes } = mountNumber({ format: { locale: 'en', decimals: 2 } });

        type(input, '12.3');
        leave(input);
        leave(input);

        expect(input.value).toBe('12.30');
        expect(posted()).toBe('12.30');
        expect(changes).toEqual(['hidden:12.30']);
    });

    test('uses the separators and group sizes of the locale', () => {
        const german = mountNumber({ format: { locale: 'de-DE' } });
        type(german.input, '1234567,5');
        expect(german.input.value).toBe('1.234.567,5');
        expect(german.posted()).toBe('1234567.5');

        jax.disconnectAll();

        const indian = mountNumber({ format: { locale: 'en-IN' } });
        type(indian.input, '1234567');
        expect(indian.input.value).toBe('12,34,567');
    });

    test('grouping can be turned off while the decimals stay fixed', () => {
        const { input } = mountNumber({ value: '1250000', format: { locale: 'en', decimals: 2, grouping: false } });

        expect(input.value).toBe('1250000.00');
    });

    test('rounds a stored value with more decimals than the format shows', () => {
        const { input, posted } = mountNumber({ value: '999.995', format: { locale: 'en', decimals: 2 } });

        expect(input.value).toBe('1,000.00');
        expect(posted()).toBe('999.995');
    });

    test('a minus sign is kept unless the minimum is zero or more', () => {
        const signed = mountNumber({ format: { locale: 'en' } });
        type(signed.input, '-1234');
        expect(signed.input.value).toBe('-1,234');
        expect(signed.posted()).toBe('-1234');

        jax.disconnectAll();

        const unsigned = mountNumber({ format: { locale: 'en' }, min: 0 });
        type(unsigned.input, '-1234');
        expect(unsigned.input.value).toBe('1,234');
    });

    test('the trigger API can fill the input and disable the hidden input with it', () => {
        const { input, posted, changes } = mountNumber({ format: { locale: 'en', decimals: 2 } });

        input.value = '500';
        input.dispatchEvent(new Event('change', { bubbles: true }));

        expect(input.value).toBe('500.00');
        expect(posted()).toBe('500.00');
        expect(changes).toEqual(['hidden:500.00', 'input:500.00']);

        input.disabled = true;
        input.dispatchEvent(new CustomEvent('trigger:disable', { detail: { status: true } }));
        expect(document.querySelector('[name=amount]').disabled).toBe(true);
    });

    test('setValue shows and posts a plain number, and getValue reads it', () => {
        const { input, control, changes } = mountNumber({ format: { locale: 'en', decimals: 2 } });

        control.setValue('1500.5');

        expect(input.value).toBe('1,500.50');
        expect(control.getValue()).toBe('1500.5');
        expect(changes).toEqual(['hidden:1500.5']);
    });

    test('an element that only shows a number is formatted from its value', () => {
        document.body.innerHTML = `<span data-control="number-input" data-number-format='{"locale":"en","decimals":2}' data-number-value="1250000.5">1250000.5</span>`;
        jax.connectAll();

        expect(document.querySelector('span').textContent).toBe('1,250,000.50');
    });
});

describe('number input without a format', () => {
    test('keeps the plain number in the named input, reading a comma as the decimal point', () => {
        const { input } = mountNumber();

        type(input, '1x2,5');

        expect(input.value).toBe('12.5');
    });

    test('leaving the input holds the value to the range', () => {
        const { input } = mountNumber({ min: 0, max: 999 });

        type(input, '1500');
        leave(input);

        expect(input.value).toBe('999');
    });

    test('the arrow keys step the value within the range and leaving announces it', () => {
        const { input, changes } = mountNumber({ value: '0.10', min: 0, step: '0.05' });

        expect(press(input, 'ArrowUp').defaultPrevented).toBe(true);
        expect(input.value).toBe('0.15');

        press(input, 'ArrowDown');
        press(input, 'ArrowDown');
        press(input, 'ArrowDown');
        expect(input.value).toBe('0.00');

        leave(input);
        expect(changes).toEqual(['input:0.00']);
    });

    test('leaving an input that was not edited leaves a stored value alone', () => {
        const { input, posted, changes } = mountNumber({ value: '999.995', format: { locale: 'en', decimals: 2 } });

        input.focus();
        leave(input);

        expect(posted()).toBe('999.995');
        expect(changes).toEqual([]);
    });

    test('a change from typing is not announced a second time', () => {
        const { input, changes } = mountNumber();

        type(input, '42');
        input.dispatchEvent(new Event('change', { bubbles: true }));
        leave(input);

        expect(changes).toEqual(['input:42']);
    });

    test('a read-only input ignores the arrow keys', () => {
        const { input } = mountNumber({ value: '5' });
        input.readOnly = true;

        expect(press(input, 'ArrowUp').defaultPrevented).toBe(false);
        expect(input.value).toBe('5');
    });
});
