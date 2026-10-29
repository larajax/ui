/*
 * happy-dom has no popover API, so the option list and context menu get a stand-in while a test file runs:
 * showing and hiding set an attribute, and :popover-open matches it.
 */

const OPEN_ATTRIBUTE = 'data-test-popover-open';

/**
 * installPopoverStandIn adds the stand-in where the API is missing, returning a function that removes it.
 */
export function installPopoverStandIn() {
    if (typeof HTMLElement.prototype.showPopover === 'function') {
        return () => {};
    }

    const { matches } = Element.prototype;

    HTMLElement.prototype.showPopover = function() {
        this.setAttribute(OPEN_ATTRIBUTE, '');
    };

    HTMLElement.prototype.hidePopover = function() {
        this.removeAttribute(OPEN_ATTRIBUTE);
    };

    Element.prototype.matches = function(selector) {
        return matches.call(this, selector.replaceAll(':popover-open', `[${OPEN_ATTRIBUTE}]`));
    };

    return () => {
        delete HTMLElement.prototype.showPopover;
        delete HTMLElement.prototype.hidePopover;
        Element.prototype.matches = matches;
    };
}
