/*
 * ColorPicker plugin
 *
 * Opens the Coloris color picker for the field input, with the field's preset
 * colors as swatches.
 *
 * Data attributes:
 * - data-control="colorpicker" - enables the plugin on an element
 * - data-colorpicker-input - the text input holding the color value
 *
 * The field has the is-picker-open class while its picker is open.
 *
 * Config:
 * - swatches: [] - preset colors shown in the picker
 * - swatchesOnly: false - only the preset colors can be picked
 * - showAlpha: false - adds an opacity slider and stores 8 digit hex colors
 * - allowEmpty: false - adds a button that clears the color
 *
 * JavaScript API:
 * jax.fetchControl(element, 'colorpicker')
 */
'use strict';

// Coloris is a single picker shared by every field, loaded on first use
let colorisPromise = null;

// The field whose picker is open, since moving straight to another field opens it without a close
let openField = null;

export function registerColorPicker(jax) {
    jax.registerControl('colorpicker', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({
                swatches: [],
                swatchesOnly: false,
                showAlpha: false,
                allowEmpty: false
            }, this.config);
        }

        connect() {
            this.input = this.element.querySelector('[data-colorpicker-input]');
            if (!this.input) {
                return;
            }

            this.selector = '#' + CSS.escape(this.input.id);

            loadColoris().then((coloris) => {
                // The field may have left the page while Coloris loaded
                if (!this.input) {
                    return;
                }

                this.coloris = coloris;
                coloris.setInstance(this.selector, this.getInstanceOptions());
            });

            this.listen('click', this.onClickField);

            // Coloris moves the focus into the picker and fires these on the input without bubbling
            this.listen('open', this.input, this.onPickerOpen);
            this.listen('close', this.input, this.onPickerClose);
        }

        disconnect() {
            if (this.coloris) {
                this.coloris.removeInstance(this.selector);
            }

            this.onPickerClose();
            this.coloris = null;
            this.input = null;
        }

        // The field keeps its focus ring while its picker holds the focus
        onPickerOpen() {
            if (openField && openField !== this.element) {
                openField.classList.remove('is-picker-open');
            }

            openField = this.element;
            this.element.classList.add('is-picker-open');
        }

        onPickerClose() {
            if (openField === this.element) {
                openField = null;
            }

            this.element.classList.remove('is-picker-open');
        }

        // Refreshes the options before the picker opens, since the theme can change after connect
        onClickField(ev) {
            if (this.coloris && ev.target === this.input) {
                this.coloris.setInstance(this.selector, this.getInstanceOptions());
            }
        }

        getInstanceOptions() {
            const themeElement = this.element.closest('[data-bs-theme]'),
                swatches = Array.isArray(this.config.swatches) ? this.config.swatches : [];

            return {
                // Inside a dialog the picker joins it, since the page outside an open modal dialog is inert
                parent: this.element.closest('dialog') || 'body',
                themeMode: themeElement && themeElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light',
                alpha: !!this.config.showAlpha,
                forceAlpha: !!this.config.showAlpha,
                swatches: swatches,
                swatchesOnly: !!this.config.swatchesOnly && swatches.length > 0,
                clearButton: !!this.config.allowEmpty
            };
        }
    });

    function loadColoris() {
        if (!colorisPromise) {
            colorisPromise = import('../../vendor/coloris/coloris.esm.js').then(({ default: coloris }) => {
                coloris.init();
                coloris({
                    el: '[data-colorpicker-input]',
                    wrap: false,
                    format: 'hex',
                    formatToggle: false,
                    margin: 4
                });

                const picker = document.getElementById('clr-picker');
                if (picker) {
                    picker.addEventListener('keydown', (ev) => onPickerKeydown(ev, coloris));
                }

                return coloris;
            });
        }

        return colorisPromise;
    }

    // Keeps keys pressed inside the picker from reaching the form and popup around the field
    function onPickerKeydown(ev, coloris) {
        // Enter confirms the color, Coloris returns focus to the field input before the form sees the key
        if (ev.key === 'Enter' && ev.target.tagName !== 'BUTTON') {
            ev.preventDefault();
        }

        // Escape reverts the color, and cancelling it keeps an enclosing dialog open
        if (ev.key === 'Escape') {
            ev.preventDefault();
            ev.stopPropagation();
            coloris.close(true);
        }
    }
}
