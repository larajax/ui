/*
 * Balloon selector control
 *
 * Picks one value from a group of radio buttons, where a hidden empty input before them posts an empty value
 * when no option is checked.
 *
 * Data attributes:
 * - data-control="balloon-selector" - enables the control on the element around the hidden input and radio group
 * - data-selector-allow-empty - clicking the checked option, or pressing Space on it, clears the value
 * - aria-readonly="true" on the radio group - the checked option cannot be changed, while its value still posts
 *
 * Trigger API events:
 * - trigger:empty - clears the value
 * - trigger:fill - checks the option matching event.detail.fillValue
 * - trigger:disable - disables the inputs when event.detail.status is true
 *
 * JavaScript API:
 * jax.fetchControl(element, 'balloon-selector').getValue()
 * jax.fetchControl(element, 'balloon-selector').setValue('active')
 */
'use strict';

export function registerBalloonSelector(jax) {
    jax.registerControl('balloon-selector', class extends jax.ControlBase {
        init() {
            this.allowEmpty = this.element.hasAttribute('data-selector-allow-empty');
        }

        connect() {
            this.lastValue = this.getValue();

            this.listen('click', this.onClick);
            this.listen('keydown', this.onKeydown);
            this.listen('keyup', this.onKeyup);
            this.listen('change', this.onChange);
            this.listen('trigger:empty', this.onTriggerEmpty);
            this.listen('trigger:fill', this.onTriggerFill);
            this.listen('trigger:disable', this.onTriggerDisable);
        }

        // Cancels a pick on a read-only selector, and clears the value when the checked option is clicked and empty values are allowed.
        onClick(ev) {
            const radio = ev.target.closest('input[type=radio]');
            if (!radio || !this.element.contains(radio)) {
                return;
            }

            if (this.isReadOnly() || radio === this.clearedByKey) {
                ev.preventDefault();
                return;
            }

            // A click on the checked option fires no change event, so it still matches the last value
            if (this.allowEmpty && radio.value === this.lastValue) {
                this.setValue('');
            }
        }

        // Space on the checked option clears it when empty values are allowed, since browsers fire no click for it.
        onKeydown(ev) {
            if (ev.key !== ' ' || !this.allowEmpty || this.isReadOnly()) {
                return;
            }

            const radio = ev.target.closest('input[type=radio]');
            if (!radio || !radio.checked || !this.element.contains(radio)) {
                return;
            }

            ev.preventDefault();
            this.setValue('');
            this.clearedByKey = radio;
        }

        // A browser that still turns the key release into a click is stopped from checking the option again.
        onKeyup(ev) {
            if (ev.key === ' ' && this.clearedByKey) {
                setTimeout(() => {
                    this.clearedByKey = null;
                });
            }
        }

        onChange() {
            this.lastValue = this.getValue();
        }

        onTriggerEmpty() {
            this.setValue('');
        }

        onTriggerFill(ev) {
            this.setValue(ev.detail && ev.detail.fillValue !== undefined ? ev.detail.fillValue : '');
        }

        onTriggerDisable(ev) {
            const isDisabled = !!(ev.detail && ev.detail.status);

            this.element.querySelectorAll('input').forEach((input) => {
                input.disabled = isDisabled;
            });
        }

        getValue() {
            const checked = this.radios().find((radio) => radio.checked);

            return checked ? checked.value : '';
        }

        // Checks the matching option, or none for an empty value, and notifies dependent fields and triggers of the change.
        setValue(value) {
            value = value === null || value === undefined ? '' : String(value);

            if (value === this.getValue()) {
                return;
            }

            let changed = this.element.querySelector('input[type=hidden]');

            this.radios().forEach((radio) => {
                radio.checked = value !== '' && radio.value === value;

                if (radio.checked) {
                    changed = radio;
                }
            });

            this.lastValue = this.getValue();

            if (changed) {
                changed.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        radios() {
            return [...this.element.querySelectorAll('input[type=radio]')];
        }

        isReadOnly() {
            return !!this.element.querySelector('[role=radiogroup][aria-readonly="true"]');
        }
    });
}
