/*
 * Popup stacker
 *
 * Pushes open popups back, scaled and offset, when another popup opens on
 * top of them, and pulls the next one forward when the top popup closes.
 * Popups are modal dialogs, so the browser's top layer already orders them
 * by opening and the stacker only moves them. Registered as jax.popupStacker.
 */
'use strict';

export class PopupStacker
{
    constructor() {
        // Dialogs fire a close event that does not bubble, so it is caught on the way down
        document.addEventListener('close', (ev) => {
            if (ev.target instanceof Element && ev.target.matches('.control-popup')) {
                this.onPopupHidden(ev);
            }
        }, true);

        // Only the document-level announcement, not the bubbling popup:show element event
        document.addEventListener('popup:show', (ev) => {
            if (ev.target === document) {
                this.onPopupShowing(ev);
            }
        });
    }

    onPopupHidden(ev) {
        this.redrawStack();
        this.pullForward();
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

    // Open popups, topmost first, since popups join the page in the order they open
    getAllPopups() {
        return Array.from(document.querySelectorAll('dialog.control-popup.show[open]')).reverse();
    }
}
