/*
 * Toolbar control
 *
 * Makes toolbars drag/scrollable.
 *
 * Data attributes:
 * - data-control="toolbar" - enables the toolbar plugin
 *
 * Config:
 * - noDragSupport - disables drag support, leaving only mouse wheel support
 * - useNativeDrag - if native CSS is enabled via "mobile" on the HTML tag
 * - vertical - enables vertical scrolling mode
 */
'use strict';

import DragScroll from '../drag-scroll/drag-scroll.js';

jax.registerControl('toolbar', class extends jax.ControlBase {
    connect() {
        this.toolbar = this.element.closest('.control-toolbar');
        this.scrollClassContainer = this.element.parentNode;

        const noDragSupport = this.config.noDragSupport !== undefined && this.config.noDragSupport;

        if (this.config.useNativeDrag) {
            this.element.classList.add('is-native-drag');
        }

        this.instance = new DragScroll(this.element, {
            scrollClassContainer: this.scrollClassContainer,
            useDrag: !noDragSupport,
            useNative: this.config.useNativeDrag,
            vertical: this.config.vertical,
            noOverScroll: this.config.vertical
        });

        if (this.toolbar) {
            this.growables = this.toolbar.querySelectorAll('.form-control.is-growable');
            this.growables.forEach((el) => {
                this.listen('focus', el, this.onGrowableFocus);
                this.listen('blur', el, this.onGrowableFocus);
                this.listen('transitionend', el, this.onGrowableFocus);
            });
        }
    }

    disconnect() {
        if (this.instance) {
            this.instance.dispose();
            this.instance = null;
        }

        this.toolbar = null;
        this.growables = null;
    }

    // Growable inputs resize the primary item as they animate; refresh the
    // scroll classes once the transition settles
    onGrowableFocus() {
        if (this.instance) {
            this.instance.fixScrollClasses();
        }
    }
});