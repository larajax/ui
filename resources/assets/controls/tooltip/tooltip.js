/*
 * Tooltip
 *
 * Shows a tooltip for any element with data-tooltip-text, through document listeners,
 * so elements added later need no setup. The Ui button helpers set these attributes
 * for buttons with a hotkey.
 *
 * Data attributes:
 * - data-tooltip-text - the tooltip text
 * - data-tooltip-hotkey - comma separated hotkey labels shown after the text, such as "⌃S, ⌘S"
 * - data-tooltip-position - "top" places the tooltip above the element, otherwise it goes below
 *
 * JavaScript API:
 * jax.tooltips.clear() - hides the tooltip and cancels a pending one
 */
'use strict';

import { mountParentFor, mountOrigin } from '../popup/dialog-mount.js';

// Delay before a hovered element shows its tooltip
const SHOW_DELAY = 300;

// Time the fade out takes before the tooltip is hidden
const HIDE_DELAY = 150;

export class Tooltips
{
    constructor() {
        this.tooltipElement = null;
        this.showTimer = null;

        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.clear = this.clear.bind(this);
        this.hideAll = this.hideAll.bind(this);
    }

    listen() {
        document.addEventListener('mouseenter', this.onMouseEnter, true);
        document.addEventListener('mouseleave', this.onMouseLeave, true);
        document.addEventListener('mousedown', this.clear);
        document.addEventListener('click', this.clear);
        document.addEventListener('keydown', this.clear);
        addEventListener('ajax:before-update', this.hideAll);
        addEventListener('page:before-render', this.hideAll);
    }

    dispose() {
        document.removeEventListener('mouseenter', this.onMouseEnter, true);
        document.removeEventListener('mouseleave', this.onMouseLeave, true);
        document.removeEventListener('mousedown', this.clear);
        document.removeEventListener('click', this.clear);
        document.removeEventListener('keydown', this.clear);
        removeEventListener('ajax:before-update', this.hideAll);
        removeEventListener('page:before-render', this.hideAll);
        this.hideAll();
    }

    onMouseEnter(ev) {
        const element = tooltipTarget(ev);
        if (!element) {
            return;
        }

        this.clear();

        this.showTimer = setTimeout(() => {
            this.showTimer = null;
            this.show(element);
        }, SHOW_DELAY);
    }

    onMouseLeave(ev) {
        if (tooltipTarget(ev)) {
            this.clear();
        }
    }

    clear() {
        this.clearTimer();
        this.hide();
    }

    clearTimer() {
        if (this.showTimer !== null) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
    }

    show(element) {
        if (!element.isConnected) {
            return;
        }

        const tooltip = this.getTooltipElement(),
            parent = mountParentFor(element);

        if (tooltip.parentNode !== parent) {
            parent.appendChild(tooltip);
        }

        tooltip.querySelector('.tooltip-text').textContent = element.getAttribute('data-tooltip-text');

        const hotkeySpan = tooltip.querySelector('.tooltip-hotkey'),
            hotkeys = element.getAttribute('data-tooltip-hotkey');

        hotkeySpan.replaceChildren();

        if (hotkeys) {
            hotkeys.split(',').forEach((hotkey) => {
                const key = document.createElement('i');
                key.textContent = hotkey.trim();
                hotkeySpan.appendChild(key);
            });
        }

        tooltip.classList.remove('tooltip-hidden');
        tooltip.style.left = '0px';

        const origin = mountOrigin(parent),
            box = element.getBoundingClientRect(),
            elementLeft = box.left + window.scrollX - origin.left,
            elementTop = box.top + window.scrollY - origin.top,
            tooltipWidth = tooltip.offsetWidth,
            tooltipHeight = tooltip.offsetHeight;

        let left = Math.round(elementLeft + box.width / 2 - tooltipWidth / 2);

        if (left < 0) {
            left = 15;
        }

        const rightDiff = left + tooltipWidth - origin.width;
        if (rightDiff > 0) {
            left -= rightDiff + 15;
        }

        const top = element.getAttribute('data-tooltip-position') === 'top'
            ? elementTop - tooltipHeight - 5
            : elementTop + box.height + 5;

        tooltip.style.left = left + 'px';
        tooltip.style.top = Math.round(top) + 'px';

        tooltip.classList.remove('tooltip-invisible');
    }

    hide() {
        const tooltip = this.tooltipElement;
        if (!tooltip || tooltip.classList.contains('tooltip-hidden')) {
            return;
        }

        tooltip.classList.add('tooltip-invisible');

        setTimeout(() => {
            if (tooltip.classList.contains('tooltip-invisible')) {
                tooltip.classList.add('tooltip-hidden');
            }
        }, HIDE_DELAY);
    }

    hideAll() {
        this.clearTimer();

        if (this.tooltipElement) {
            this.tooltipElement.remove();
            this.tooltipElement = null;
        }
    }

    getTooltipElement() {
        if (!this.tooltipElement) {
            const tooltip = document.createElement('div'),
                text = document.createElement('span'),
                hotkey = document.createElement('span');

            tooltip.className = 'control-tooltip tooltip-hidden tooltip-invisible';
            tooltip.setAttribute('role', 'tooltip');
            text.className = 'tooltip-text';
            hotkey.className = 'tooltip-hotkey';
            tooltip.append(text, hotkey);

            this.tooltipElement = tooltip;
        }

        return this.tooltipElement;
    }
}

// Returns the event target when it carries a tooltip, ignoring text nodes and the document.
function tooltipTarget(ev) {
    const target = ev.target;

    if (!(target instanceof Element) || !target.getAttribute('data-tooltip-text')) {
        return null;
    }

    return target;
}

export function registerTooltip(jax) {
    const tooltips = new Tooltips();
    tooltips.listen();

    jax.tooltips = {
        clear: () => tooltips.clear()
    };
}
