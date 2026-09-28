/*
 * Checkbox Control
 *
 * Adds indeterminate (tri-state) checkbox support.
 *
 * Indeterminate checkboxes cycle: unchecked → indeterminate → checked → unchecked
 * Usage: <div class="form-check is-indeterminate" data-control="checkbox">
 *
 * The state is kept in data-checked on the input: 0 = unchecked, 1 = indeterminate,
 * 2 = checked. It advances on click, before the native change event fires, so change
 * listeners can read the new state from data-checked.
 */
'use strict';

export function registerCheckbox(jax) {
    jax.registerControl('checkbox', class extends jax.ControlBase {
        connect() {
            this.$input = this.element.querySelector('input[type=checkbox]');

            if (this.$input) {
                this.setState(this.getState());
                this.listen('click', this.$input, this.onClickCycleState);
            }
        }

        disconnect() {
            this.$input = null;
        }

        // Falls back to the checked attribute when no data-checked is set.
        getState() {
            const checked = parseInt(this.$input.dataset.checked);

            if (isNaN(checked)) {
                return this.$input.checked ? 2 : 0;
            }

            return checked;
        }

        setState(checked) {
            this.$input.dataset.checked = checked;

            switch (checked) {
                // Indeterminate
                case 1:
                    this.$input.indeterminate = true;
                    this.$input.checked = false;
                    break;

                // Checked
                case 2:
                    this.$input.indeterminate = false;
                    this.$input.checked = true;
                    break;

                // Unchecked
                default:
                    this.$input.indeterminate = false;
                    this.$input.checked = false;
            }
        }

        // The browser has already toggled the input here, so the full state is reapplied.
        onClickCycleState() {
            this.setState((this.getState() + 1) % 3);
        }
    });

    // Auto-discover
    // ============================

    addEventListener('render', function() {
        document.querySelectorAll('.form-check.is-indeterminate:not([data-control~="checkbox"])').forEach(function(element) {
            element.dataset.control = ((element.dataset.control || '') + ' checkbox').trim();
        });
    });
}
