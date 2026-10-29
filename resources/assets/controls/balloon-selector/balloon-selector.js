/*
 * Balloon selector control
 *
 * Picks one value from a row of options and stores it in the hidden input inside the element.
 *
 * Data attributes:
 * - data-control="balloon-selector" - enables the control on an element
 * - data-selector-allow-empty - clicking the active option clears the value
 *
 * Trigger API events:
 * - trigger:empty - clears the value
 * - trigger:fill - selects the value in event.detail.fillValue
 * - trigger:disable - disables the hidden input when event.detail.status is true
 */
'use strict';

export function registerBalloonSelector(jax) {
    jax.registerControl('balloon-selector', class extends jax.ControlBase {
        init() {
            this.allowEmpty = this.element.hasAttribute('data-selector-allow-empty');
        }

        connect() {
            this.input = this.element.querySelector('input[type=hidden]');

            this.listen('click', this.onClick);
            this.listen('keydown', this.onKeydown);
            this.listen('trigger:empty', this.onTriggerEmpty);
            this.listen('trigger:fill', this.onTriggerFill);
            this.listen('trigger:disable', this.onTriggerDisable);
        }

        disconnect() {
            this.input = null;
        }

        onClick(ev) {
            const option = ev.target.closest('li[data-value]');
            if (option && this.element.contains(option)) {
                this.pick(option);
            }
        }

        // Enter and space pick the focused option, like a click
        onKeydown(ev) {
            if (ev.key !== 'Enter' && ev.key !== ' ') {
                return;
            }

            const option = ev.target.closest('li[data-value]');
            if (option && this.element.contains(option)) {
                ev.preventDefault();
                this.pick(option);
            }
        }

        onTriggerEmpty() {
            this.setValue('');
        }

        onTriggerFill(ev) {
            this.setValue(ev.detail && ev.detail.fillValue !== undefined ? ev.detail.fillValue : '');
        }

        onTriggerDisable(ev) {
            this.input.disabled = !!(ev.detail && ev.detail.status);
        }

        pick(option) {
            if (this.isDisabled()) {
                return;
            }

            if (this.allowEmpty && option.classList.contains('active')) {
                this.setValue('');
                return;
            }

            this.setValue(option.dataset.value);
        }

        // Marks the matching option active and notifies dependent fields and triggers when the value changes
        setValue(value) {
            value = value === null || value === undefined ? '' : String(value);

            this.element.querySelectorAll('li[data-value]').forEach((option) => {
                const isActive = value !== '' && option.dataset.value === value;
                option.classList.toggle('active', isActive);
                option.setAttribute('aria-checked', isActive ? 'true' : 'false');
            });

            if (this.input.value === value) {
                return;
            }

            this.input.value = value;
            this.input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        isDisabled() {
            return this.element.classList.contains('control-disabled') || this.input.disabled;
        }
    });
}
