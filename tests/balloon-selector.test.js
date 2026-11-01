import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { registerBalloonSelector } from '../resources/assets/controls/balloon-selector/balloon-selector.js';
import { makeFakeJax } from './support/fake-control-jax.js';

let jax;

beforeAll(() => {
    jax = makeFakeJax();
    registerBalloonSelector(jax);
});

afterEach(() => {
    jax.disconnectAll();
    document.body.innerHTML = '';
});

// Renders a selector the way the form's balloon-selector field partial does
function mountSelector({ value = '', allowEmpty = false, readOnly = false, disabled = false } = {}) {
    const option = (optionValue, label) => `
        <label class="btn-check btn-outline theme-primary">
            <input type="radio" name="status" value="${optionValue}" autocomplete="off" ${value === optionValue ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
            ${label}
        </label>
    `;

    document.body.innerHTML = `
        <form>
            <div data-control="balloon-selector" ${allowEmpty ? 'data-selector-allow-empty' : ''}>
                <input type="hidden" name="status" value="" ${disabled ? 'disabled' : ''} />
                <div class="btn-group" role="radiogroup" aria-label="Status" ${readOnly ? 'aria-readonly="true"' : ''}>
                    ${option('draft', 'Draft')}
                    ${option('active', 'Active')}
                </div>
            </div>
        </form>
    `;

    jax.connectAll();

    const element = document.querySelector('[data-control="balloon-selector"]');
    const changes = [];
    element.addEventListener('change', (ev) => changes.push(`${ev.target.type}:${ev.target.value}`));

    return {
        element,
        changes,
        control: jax.fetchControl(element, 'balloon-selector'),
        radio: (optionValue) => element.querySelector(`input[value="${optionValue}"]`),
        posted: () => new FormData(document.querySelector('form')).getAll('status')
    };
}

function pressSpace(target) {
    const down = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    target.dispatchEvent(down);
    target.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));

    return down;
}

describe('balloon selector', () => {
    test('the checked option posts after the empty hidden input, so it wins', () => {
        const { posted, control } = mountSelector({ value: 'draft' });

        expect(posted()).toEqual(['', 'draft']);
        expect(control.getValue()).toBe('draft');
    });

    test('with no option checked only the empty value posts', () => {
        const { posted, control } = mountSelector();

        expect(posted()).toEqual(['']);
        expect(control.getValue()).toBe('');
    });

    test('clicking the checked option keeps it unless empty values are allowed', () => {
        const kept = mountSelector({ value: 'draft' });
        kept.radio('draft').click();

        expect(kept.control.getValue()).toBe('draft');
        expect(kept.changes).toEqual([]);

        jax.disconnectAll();

        const cleared = mountSelector({ value: 'draft', allowEmpty: true });
        cleared.radio('draft').click();

        expect(cleared.radio('draft').checked).toBe(false);
        expect(cleared.posted()).toEqual(['']);
        expect(cleared.changes).toEqual(['hidden:']);
    });

    test('after clearing, clicking the option checks it again', () => {
        const { radio, control } = mountSelector({ value: 'draft', allowEmpty: true });

        radio('draft').click();
        radio('draft').click();

        expect(control.getValue()).toBe('draft');
    });

    test('space on the checked option clears it when empty values are allowed', () => {
        const { radio, posted, changes } = mountSelector({ value: 'draft', allowEmpty: true });

        const down = pressSpace(radio('draft'));

        expect(down.defaultPrevented).toBe(true);
        expect(posted()).toEqual(['']);
        expect(changes).toEqual(['hidden:']);
    });

    test('a click that follows the space key does not check the cleared option again', () => {
        const { radio, control } = mountSelector({ value: 'draft', allowEmpty: true });

        radio('draft').dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
        const click = new MouseEvent('click', { bubbles: true, cancelable: true });
        radio('draft').dispatchEvent(click);

        expect(click.defaultPrevented).toBe(true);
        expect(control.getValue()).toBe('');
    });

    test('space leaves the checked option alone unless empty values are allowed', () => {
        const { radio, control } = mountSelector({ value: 'draft' });

        const down = pressSpace(radio('draft'));

        expect(down.defaultPrevented).toBe(false);
        expect(control.getValue()).toBe('draft');
    });

    // A cancelled click is how a browser keeps the previous radio checked, after a press or an arrow key alike
    test('a read-only selector cancels a click on any option', () => {
        const { radio } = mountSelector({ value: 'draft', allowEmpty: true, readOnly: true });

        for (const optionValue of ['active', 'draft']) {
            const click = new MouseEvent('click', { bubbles: true, cancelable: true });
            radio(optionValue).dispatchEvent(click);

            expect(click.defaultPrevented).toBe(true);
        }
    });

    test('space does not clear a read-only selector', () => {
        const { radio, control } = mountSelector({ value: 'draft', allowEmpty: true, readOnly: true });

        pressSpace(radio('draft'));

        expect(control.getValue()).toBe('draft');
    });

    test('the trigger API can fill, empty and disable the selector', () => {
        const { element, radio, posted, changes } = mountSelector({ value: 'draft' });

        element.dispatchEvent(new CustomEvent('trigger:fill', { detail: { fillValue: 'active' } }));
        expect(radio('active').checked).toBe(true);
        expect(radio('draft').checked).toBe(false);

        element.dispatchEvent(new CustomEvent('trigger:empty'));
        expect(posted()).toEqual(['']);
        expect(changes).toEqual(['radio:active', 'hidden:']);

        element.dispatchEvent(new CustomEvent('trigger:disable', { detail: { status: true } }));
        expect([...element.querySelectorAll('input')].every((input) => input.disabled)).toBe(true);
        expect(posted()).toEqual([]);
    });

    test('a fill with the current value announces no change', () => {
        const { element, changes } = mountSelector({ value: 'draft' });

        element.dispatchEvent(new CustomEvent('trigger:fill', { detail: { fillValue: 'draft' } }));

        expect(changes).toEqual([]);
    });
});
