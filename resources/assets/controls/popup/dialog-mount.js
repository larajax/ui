/*
 * Dialog mounting helpers
 *
 * Floating UI opened from inside a modal dialog must mount inside that dialog, since
 * the page outside it is inert and renders below the browser's top layer.
 *
 *     import { mountParentFor, mountOrigin } from '../popup/dialog-mount.js';
 *
 *     const parent = mountParentFor(trigger);
 *     const origin = mountOrigin(parent);
 *     panel.style.left = (pageLeft - origin.left) + 'px';
 */
'use strict';

/**
 * mountParentFor returns the dialog enclosing an element, or the body outside one.
 */
export function mountParentFor(element) {
    return (element && element.closest('dialog')) || document.body;
}

/**
 * mountOrigin returns the page coordinates that absolute positions inside the parent start from, and its width.
 */
export function mountOrigin(parent) {
    if (!parent || parent === document.body) {
        return { left: 0, top: 0, width: document.documentElement.clientWidth };
    }

    const box = parent.getBoundingClientRect();

    return {
        left: box.left + window.scrollX + parent.clientLeft - parent.scrollLeft,
        top: box.top + window.scrollY + parent.clientTop - parent.scrollTop,
        width: parent.clientWidth
    };
}
