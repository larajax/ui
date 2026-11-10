/*
 * Drag Scroll control
 *
 * Makes containers drag/scrollable with overflow indicators.
 *
 * Data attributes:
 * - data-control="drag-scroll" - enables the drag scroll plugin
 *
 * Config:
 * - noDragSupport - disables drag support, leaving only mouse wheel support
 * - useNativeDrag - if native CSS is enabled via "mobile" on the HTML tag
 * - vertical - enables vertical scrolling mode
 * - scrollToActive - brings the element with the active class into view when the control connects
 */
'use strict';

import DragScroll from './drag-scroll.js';

export function registerDragScroll(jax) {
    jax.registerControl('drag-scroll', class extends jax.ControlBase {
        init() {
            this.scrollClassContainer = this.element.parentNode;
            this.instance = null;
        }

        connect() {
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

            if (this.config.scrollToActive) {
                const active = this.element.querySelector('.active');
                if (active) {
                    this.instance.goToElement(active, undefined, { duration: 0 });
                }
            }
        }

        disconnect() {
            if (this.instance) {
                this.instance.dispose();
                this.instance = null;
            }
        }
    });
}
