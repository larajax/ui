/*
 * Popup stacker
 *
 * Offsets popups behind the top one. Registered as jax.popupStacker.
 */
'use strict';

export class PopupStacker
{
    constructor() {
        // Close doesn't bubble, so capture it
        document.addEventListener('close', (ev) => {
            if (ev.target instanceof Element && ev.target.matches('.control-popup')) {
                this.onPopupHidden(ev);
            }
        }, true);

        // Document-level popup:show only
        document.addEventListener('popup:show', (ev) => {
            if (ev.target === document) {
                this.onPopupShowing(ev);
            }
        });
    }

    onPopupHidden(ev) {
        this.redrawStack();
        this.pullForward();
        this.restoreBottomBackdrop();
    }

    // Bottom popup dims the page again
    restoreBottomBackdrop() {
        const bottom = this.getAllPopups().at(-1);
        if (bottom) {
            bottom.classList.remove('popup-stacked');
        }
    }

    onPopupShowing(ev) {
        document.activeElement && document.activeElement.blur();
        this.redrawStack(true);
    }

    pullForward() {
        const el = this.getFirstPopup();
        if (!el) {
            return;
        }

        el.style.transform = '';
        el.style.transformOrigin = '';

        // Wait for transition end (.3s)
        setTimeout(() => {
            el.style.transition = '';
        }, 350);
    }

    redrawStack(isEarly) {
        let count = 0;

        this.getAllPopups().forEach((el) => {
            count++;

            // Push back popups before a new popup spawns
            let offset = count;
            if (!isEarly) {
                offset--;

                if (count === 1) {
                    return;
                }
            }

            el.style.transform = `scale(.9) translate(-${2*offset}rem, -${50*offset}px)`;
            el.style.transformOrigin = 'top left';
            el.style.transition = 'all .3s';
        });
    }

    getFirstPopup() {
        return this.getAllPopups()[0];
    }

    // Open popups, topmost first
    getAllPopups() {
        return Array.from(document.querySelectorAll('dialog.control-popup.show[open]')).reverse();
    }
}
