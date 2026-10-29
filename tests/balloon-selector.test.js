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
function mountSelector({ value = '', allowEmpty = false, disabled = false } = {}) {
    document.body.innerHTML = `
        <form>
            <div class="control-balloon-selector ${disabled ? 'control-disabled' : ''}" data-control="balloon-selector" ${allowEmpty ? 'data-selector-allow-empty' : ''}>
                <ul role="radiogroup">
                    <li data-value="draft" role="radio" tabindex="0" class="${value === 'draft' ? 'active' : ''}">Draft</li>
                    <li data-value="active" role="radio" tabindex="0" class="${value === 'active' ? 'active' : ''}">Active</li>
                </ul>
                <input type="hidden" name="status" value="${value}" />
            </div>
        </form>
    `;

    jax.connectAll();

    const element = document.querySelector('[data-control="balloon-selector"]');
    const input = element.querySelector('input');
    const changes = [];
    input.addEventListener('change', () => changes.push(input.value));

    return { element, input, changes, option: (value) => element.querySelector(`li[data-value="${value}"]`) };
}

describe('balloon selector', () => {
    test('clicking an option stores its value, marks it active and announces the change', () => {
        const { input, changes, option } = mountSelector({ value: 'draft' });

        option('active').click();

        expect(input.value).toBe('active');
        expect(option('active').classList.contains('active')).toBe(true);
        expect(option('active').getAttribute('aria-checked')).toBe('true');
        expect(option('draft').classList.contains('active')).toBe(false);
        expect(changes).toEqual(['active']);
    });

    test('clicking the active option keeps it unless empty values are allowed', () => {
        const kept = mountSelector({ value: 'draft' });
        kept.option('draft').click();

        expect(kept.input.value).toBe('draft');
        expect(kept.changes).toEqual([]);

        jax.disconnectAll();

        const cleared = mountSelector({ value: 'draft', allowEmpty: true });
        cleared.option('draft').click();

        expect(cleared.input.value).toBe('');
        expect(cleared.option('draft').classList.contains('active')).toBe(false);
        expect(cleared.changes).toEqual(['']);
    });

    test('enter and space pick the focused option', () => {
        const { input, option } = mountSelector({ value: 'draft' });

        option('active').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(input.value).toBe('active');

        option('draft').dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
        expect(input.value).toBe('draft');
    });

    test('a disabled selector ignores clicks', () => {
        const { input, changes, option } = mountSelector({ value: 'draft', disabled: true });

        option('active').click();

        expect(input.value).toBe('draft');
        expect(changes).toEqual([]);
    });

    test('the trigger API can empty, fill and disable the selector', () => {
        const { element, input, option } = mountSelector({ value: 'draft' });

        element.dispatchEvent(new CustomEvent('trigger:fill', { detail: { fillValue: 'active' } }));
        expect(input.value).toBe('active');
        expect(option('active').classList.contains('active')).toBe(true);

        element.dispatchEvent(new CustomEvent('trigger:empty'));
        expect(input.value).toBe('');
        expect(element.querySelector('li.active')).toBeNull();

        element.dispatchEvent(new CustomEvent('trigger:disable', { detail: { status: true } }));
        expect(input.disabled).toBe(true);
    });
});
