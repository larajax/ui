/*
 * Password Reveal
 *
 * Data attributes:
 * - data-control="password-reveal" - enables the plugin on a toggle button
 * - aria-controls - id of the password input, otherwise the input in the button's adorned field
 * - data-icon-show / data-icon-hide - icon classes shown while the value is hidden and while it shows
 *
 * JavaScript API:
 * jax.fetchControl(button, 'password-reveal').show()
 * jax.fetchControl(button, 'password-reveal').hide()
 */
'use strict';

export function registerPasswordReveal(jax) {
    jax.registerControl('password-reveal', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({
                iconShow: '',
                iconHide: ''
            }, this.config);
        }

        connect() {
            this.input = this.findInput();
            this.icon = this.element.querySelector('[data-reveal-icon]');

            this.listen('mousedown', this.keepInputFocus);
            this.listen('mouseup', this.keepInputFocus);
            this.listen('click', this.toggle);

            if (this.input && this.input.form) {
                this.listen('submit', this.input.form, this.hide);
            }
        }

        disconnect() {
            this.input = null;
            this.icon = null;
        }

        findInput() {
            const id = this.element.getAttribute('aria-controls');
            const input = id ? document.getElementById(id) : null;
            if (input) {
                return input;
            }

            const field = this.element.closest('.form-adorn');
            return field ? field.querySelector('input') : null;
        }

        // Keeps focus and caret in the input.
        keepInputFocus(ev) {
            if (this.input && document.activeElement === this.input) {
                ev.preventDefault();
            }
        }

        toggle() {
            if (!this.input) {
                return;
            }

            if (this.isShown()) {
                this.hide();
            }
            else {
                this.show();
            }
        }

        isShown() {
            return !!this.input && this.input.type === 'text';
        }

        show() {
            this.setShown(true);
        }

        hide() {
            this.setShown(false);
        }

        // Switches type, restoring the caret it can move.
        setShown(isShown) {
            if (!this.input) {
                return;
            }

            const hasFocus = document.activeElement === this.input;
            const { selectionStart, selectionEnd } = this.input;

            this.input.type = isShown ? 'text' : 'password';

            if (hasFocus && selectionStart !== null) {
                this.input.setSelectionRange(selectionStart, selectionEnd);
            }

            this.element.setAttribute('aria-pressed', isShown ? 'true' : 'false');
            this.swapIcon(isShown);
        }

        swapIcon(isShown) {
            if (!this.icon) {
                return;
            }

            const toClasses = (value) => String(value || '').split(/\s+/).filter(Boolean);
            this.icon.classList.remove(...toClasses(isShown ? this.config.iconShow : this.config.iconHide));
            this.icon.classList.add(...toClasses(isShown ? this.config.iconHide : this.config.iconShow));
        }
    });
}
