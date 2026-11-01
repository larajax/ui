import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { registerInputTrigger } from '../resources/assets/controls/input-trigger/input-trigger-control.js';
import { makeFakeJax } from './support/fake-control-jax.js';

let jax;

beforeAll(() => {
    jax = makeFakeJax();
    jax.Events = {
        on: (target, eventName, handler) => target.addEventListener(eventName, handler),
        off: (target, eventName, handler) => target.removeEventListener(eventName, handler),
        dispatch: (eventName, { target = document, detail = {} } = {}) => target.dispatchEvent(new CustomEvent(eventName, { bubbles: true, detail }))
    };
    registerInputTrigger(jax);
});

afterEach(() => {
    jax.disconnectAll();
    document.body.innerHTML = '';
});

// Renders a field shown only while the source field holds the given value, the way the form adds trigger attributes
function mountTrigger(sourceHtml, condition) {
    document.body.innerHTML = `
        <form>
            ${sourceHtml}
            <div id="target" data-control="input-trigger" data-trigger="[name=style]" data-trigger-action="show" data-trigger-condition="${condition}" data-trigger-closest-parent="form">
                Details
            </div>
        </form>
    `;

    jax.connectAll();

    return () => !document.getElementById('target').classList.contains('oc-hide');
}

// A balloon selector posts an empty hidden input followed by its radios
function balloonSource(checked) {
    const radio = (value) => `<input type="radio" name="style" value="${value}" ${checked === value ? 'checked' : ''} />`;

    return `<input type="hidden" name="style" value="" />${radio('simple')}${radio('detailed')}`;
}

describe('input trigger value condition', () => {
    test('reads the checked radio rather than the hidden input before it', () => {
        expect(mountTrigger(balloonSource('detailed'), 'value[detailed]')()).toBe(true);
    });

    test('a different checked radio does not match', () => {
        expect(mountTrigger(balloonSource('simple'), 'value[detailed]')()).toBe(false);
    });

    test('with no radio checked the hidden input gives the empty value', () => {
        expect(mountTrigger(balloonSource(null), 'value[]')()).toBe(true);
        jax.disconnectAll();
        expect(mountTrigger(balloonSource(null), 'value[detailed]')()).toBe(false);
    });

    test('a plain input is still read for its value', () => {
        expect(mountTrigger('<input type="text" name="style" value="detailed" />', 'value[detailed]')()).toBe(true);
    });

    test('an unchecked checkbox reads its hidden value and a checked one reads its own', () => {
        const checkbox = (checked) => `<input type="hidden" name="style" value="0" /><input type="checkbox" name="style" value="1" ${checked ? 'checked' : ''} />`;

        expect(mountTrigger(checkbox(false), 'value[0]')()).toBe(true);
        jax.disconnectAll();
        expect(mountTrigger(checkbox(true), 'value[1]')()).toBe(true);
    });
});
