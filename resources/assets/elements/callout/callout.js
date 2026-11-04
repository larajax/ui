/*
 * Callout
 *
 * Data attributes:
 * - data-dismiss="callout" - on a button inside a callout, closes and removes the callout
 * - data-target - on the dismiss button, a selector for the callout to close, otherwise the
 *   href, otherwise the callout containing the button
 *
 * Events:
 * - callout:close - dispatched on the callout before it closes, cancel it to keep the callout open
 * - callout:closed - dispatched on the callout once it has closed, just before it is removed
 */
'use strict';

const dismissSelector = '[data-dismiss="callout"]';

export function registerCallout() {
    document.addEventListener('click', (ev) => {
        const button = ev.target.closest && ev.target.closest(dismissSelector);
        if (!button) {
            return;
        }

        ev.preventDefault();
        closeCallout(findCallout(button));
    });
}

export function closeCallout(callout) {
    if (!callout) {
        return;
    }

    const closing = new CustomEvent('callout:close', { bubbles: true, cancelable: true });
    if (!callout.dispatchEvent(closing)) {
        return;
    }

    const remove = () => {
        callout.dispatchEvent(new CustomEvent('callout:closed', { bubbles: true }));
        callout.remove();
    };

    callout.classList.remove('show');

    // A fading callout is removed once its transition ends
    if (callout.classList.contains('fade') && hasTransition(callout)) {
        callout.addEventListener('transitionend', remove, { once: true });
    }
    else {
        remove();
    }
}

function findCallout(button) {
    const selector = button.getAttribute('data-target') || button.getAttribute('href');

    if (selector && selector !== '#' && !selector.startsWith('javascript:')) {
        const target = document.querySelector(selector);
        if (target) {
            return target;
        }
    }

    return button.closest('.callout');
}

function hasTransition(element) {
    const style = getComputedStyle(element);
    return (parseFloat(style.transitionDuration) || 0) + (parseFloat(style.transitionDelay) || 0) > 0;
}
