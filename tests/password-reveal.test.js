import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { registerPasswordReveal } from '../resources/assets/controls/password-reveal/password-reveal.js';

function makeFakeJax() {
    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = {
                iconShow: element.dataset.iconShow,
                iconHide: element.dataset.iconHide
            };
        }

        // Supports listen(event, handler) and listen(event, target, handler)
        listen(eventName, targetOrHandler, handler) {
            if (typeof targetOrHandler === 'function') {
                this.element.addEventListener(eventName, targetOrHandler.bind(this));
            }
            else {
                targetOrHandler.addEventListener(eventName, handler.bind(this));
            }
        }
    }

    return {
        controls: new Map(),
        ControlBase,
        registerControl(id, control) {
            this.controls.set(id, control);
        }
    };
}

let jax;

beforeAll(() => {
    jax = makeFakeJax();
    registerPasswordReveal(jax);
});

afterEach(() => {
    document.body.innerHTML = '';
});

// Renders a revealable password field as the form widget does: the input and the show button inside an adorned label
function connectField({ controls = 'password', value = 'secret' } = {}) {
    document.body.innerHTML = `
        <form>
            <label class="form-control form-adorn">
                <input type="password" name="password" id="password" value="${value}" class="form-ghost" />
                <button
                    type="button"
                    class="btn-icon"
                    aria-label="Show password"
                    aria-pressed="false"
                    ${controls ? `aria-controls="${controls}"` : ''}
                    data-control="password-reveal"
                    data-icon-show="ph ph-eye"
                    data-icon-hide="ph ph-eye-slash"
                ><i class="ph ph-eye" aria-hidden="true" data-reveal-icon></i></button>
            </label>
        </form>
    `;

    const button = document.querySelector('[data-control="password-reveal"]');
    const control = new (jax.controls.get('password-reveal'))(button);
    control.init();
    control.connect();

    return {
        control,
        button,
        form: document.querySelector('form'),
        input: document.getElementById('password'),
        icon: button.querySelector('[data-reveal-icon]')
    };
}

describe('password reveal toggle', () => {
    test('a click shows the value, presses the button and swaps to the hide icon', () => {
        const { button, input, icon } = connectField();

        button.click();

        expect(input.type).toBe('text');
        expect(button.getAttribute('aria-pressed')).toBe('true');
        expect([...icon.classList]).toEqual(['ph', 'ph-eye-slash']);
    });

    test('a second click hides the value again and restores the show icon', () => {
        const { button, input, icon } = connectField();

        button.click();
        button.click();

        expect(input.type).toBe('password');
        expect(button.getAttribute('aria-pressed')).toBe('false');
        expect([...icon.classList]).toEqual(['ph', 'ph-eye']);
    });

    test('the label stays the same while the pressed state changes', () => {
        const { button } = connectField();

        button.click();

        expect(button.getAttribute('aria-label')).toBe('Show password');
    });

    test('without aria-controls it uses the input in its adorned field', () => {
        const { button, input } = connectField({ controls: '' });

        button.click();

        expect(input.type).toBe('text');
    });

    test('submitting the form hides a shown value', () => {
        const { button, form, input } = connectField();

        button.click();
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        expect(input.type).toBe('password');
        expect(button.getAttribute('aria-pressed')).toBe('false');
    });

    test('show, hide and isShown drive the toggle from script', () => {
        const { control, input } = connectField();

        control.show();
        expect(control.isShown()).toBe(true);
        expect(input.type).toBe('text');

        control.hide();
        expect(control.isShown()).toBe(false);
        expect(input.type).toBe('password');
    });
});

describe('password reveal focus', () => {
    test('a mouse press and release keep focus and the caret in the input while it is being typed in', () => {
        const { button, input } = connectField();
        input.focus();

        for (const type of ['mousedown', 'mouseup']) {
            const event = new MouseEvent(type, { bubbles: true, cancelable: true });
            button.dispatchEvent(event);

            expect(event.defaultPrevented).toBe(true);
        }
    });

    test('a mouse press focuses the button as usual when the input is not focused', () => {
        const { button } = connectField();

        const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        button.dispatchEvent(press);

        expect(press.defaultPrevented).toBe(false);
    });

    test('the caret stays where it was when the value shows', () => {
        const { button, input } = connectField({ value: 'secret' });
        input.focus();
        input.setSelectionRange(2, 4);

        button.click();

        expect(document.activeElement).toBe(input);
        expect(input.selectionStart).toBe(2);
        expect(input.selectionEnd).toBe(4);
    });
});
