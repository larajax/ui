/*
 * Popover control
 *
 * Renders a rich popover with content, positioning, modal overlay, and animation.
 * Only one popover is active at a time.
 *
 * Data attributes:
 * - data-control="popover" - toggles a popover from the element
 * - data-content="..." - HTML content of the popover
 * - data-content-from="#template" - selector of a template element supplying the content
 * - data-placement="top", data-width="200", data-modal="true", ... - any option below
 *
 * Options:
 * - placement - top, bottom, left, right or center, default bottom
 * - fallbackPlacement - placement used when the preferred one doesn't fit, default bottom
 * - content - HTML string, node, or function returning one (called with the trigger as `this`)
 * - contentFrom - selector of an element to source the content HTML from
 * - width - fixed width in pixels
 * - modal - show a backdrop overlay
 * - highlightModalTarget - raise the trigger element above the overlay
 * - closeOnPageClick - close when clicking outside, default true
 * - closeOnEsc - close on the Escape key, default true
 * - container - element or selector to mount in, default the enclosing dialog or the body
 * - containerClass - CSS class(es) for the popover container, extraClass is the same option
 * - offset - offset in pixels along the trigger, default 15
 * - offsetX - offset for top and bottom placements, overrides offset
 * - offsetY - offset for left and right placements, overrides offset
 * - useAnimation - fade and scale animation
 * - onCheckDocumentClickTarget - function returning true for page clicks that keep it open
 * - onClose - function called after the popover is removed
 *
 * Events, dispatched on the trigger element with detail { popover, relatedTarget }:
 * - popover:showing - before display, use preventDefault() to cancel
 * - popover:show - after display
 * - popover:hiding - before close, use preventDefault() to cancel
 * - popover:hide - after close
 *
 * Closing: call hide(), dispatch popover:close on any element inside the popover,
 * or click an element with data-dismiss="popover" inside the popover.
 *
 * JavaScript API:
 *
 *     import { Popover } from './controls/popover/popover.js';
 *
 *     const popover = new Popover(triggerEl, {
 *         content: '<p>Hello</p>',      // optional, shows a loading state otherwise
 *         placement: 'top',
 *         onClose: () => { ... }
 *     });
 *     popover.show();
 *     popover.setContent('<p>Loaded</p>');
 *     popover.getContainer();
 *     popover.hide();
 */
'use strict';

import { createPopper, detectOverflow } from '../../vendor/popperjs/popper.esm.js';

const placements = ['top', 'bottom', 'left', 'right'];

export class Popover {
    static activeInstance = null;

    static DEFAULTS = {
        placement: 'bottom',
        fallbackPlacement: 'bottom',
        content: null,
        contentFrom: null,
        width: false,
        modal: false,
        highlightModalTarget: false,
        closeOnPageClick: true,
        closeOnEsc: true,
        container: false,
        containerClass: null,
        extraClass: null,
        offset: 15,
        offsetX: undefined,
        offsetY: undefined,
        useAnimation: false,
        onCheckDocumentClickTarget: null,
        onClose: null
    };

    constructor(trigger, options = {}) {
        this.trigger = trigger;
        this.options = Object.assign({}, Popover.DEFAULTS, options);
        this.arrowSize = 15;
        this.edgePadding = 8;

        this.element = null;
        this.contentElement = null;
        this.overlay = null;
        this.popper = null;
        this.isHiding = false;
        this.hideTimer = null;
        this.resizeHandler = () => this.reposition();
        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    show() {
        const showingEvent = this.triggerEvent('popover:showing', { relatedTarget: this.trigger });
        if (showingEvent.defaultPrevented) {
            return;
        }

        Popover.hideActive();

        // A popover still fading out from an earlier hide is removed straight away
        if (this.element) {
            this.hidePopover();
        }

        Popover.activeInstance = this;

        // Create the popover container and overlay
        this.element = document.createElement('div');
        this.element.classList.add('control-popover');

        [this.options.containerClass, this.options.extraClass].join(' ').split(' ').forEach((cls) => {
            if (cls) {
                this.element.classList.add(cls);
            }
        });

        if (this.options.useAnimation) {
            this.element.classList.add('fade');
        }

        this.contentElement = document.createElement('div');
        this.element.appendChild(this.contentElement);

        const content = this.getContent();
        if (content !== null && content !== undefined) {
            this.setContent(content);
        }
        else {
            this.contentElement.innerHTML = '<span class="control-popover-loading"></span>';
        }

        if (this.options.width) {
            this.element.style.width = this.options.width + 'px';
        }

        // Mounting inside an enclosing dialog keeps the popover and overlay in its top layer and out of the inert page
        const container = this.getMountContainer();

        this.overlay = document.createElement('div');
        this.overlay.classList.add('popover-overlay');
        container.appendChild(this.overlay);

        if (this.options.highlightModalTarget) {
            this.trigger.classList.add('popover-highlight');
            this.trigger.blur();
        }

        container.appendChild(this.element);

        // Determine the popover position
        if (this.options.placement !== 'center') {
            this.popper = createPopper(this.trigger, this.element, this.getPopperOptions());
            this.popper.forceUpdate();
        }
        else {
            this.reposition();
        }

        addEventListener('resize', this.resizeHandler);

        // Bind events
        this.element.addEventListener('popover:close', () => this.hide());

        this.element.addEventListener('click', (ev) => {
            const dismiss = ev.target.closest('[data-dismiss=popover]');
            if (dismiss && this.element && this.element.contains(dismiss)) {
                this.hide();
                ev.preventDefault();
                ev.stopPropagation();
            }
        });

        // Outside detection uses mousedown so a click handler that detaches its own target
        // cannot read as an outside click, bound later so the opening interaction cannot close it
        setTimeout(() => {
            if (this.element && !this.isHiding) {
                addEventListener('mousedown', this.onDocumentClick);

                if (this.options.closeOnEsc) {
                    addEventListener('keydown', this.onKeyDown);
                }
            }
        }, 0);

        // Display the popover
        this.element.classList.add('show');
        if (this.options.modal) {
            this.overlay.classList.add('show');
        }

        document.body.classList.add('popover-open');
        this.triggerEvent('popover:show', { relatedTarget: this.element });

        // Autofocus
        const autofocusEl = this.element && this.element.querySelector('[data-popover-autofocus]');
        if (autofocusEl) {
            autofocusEl.focus();
        }
    }

    hide() {
        if (!this.element || this.isHiding) {
            return;
        }

        const hidingEvent = this.triggerEvent('popover:hiding', { relatedTarget: this.trigger });
        if (hidingEvent.defaultPrevented) {
            return;
        }

        this.isHiding = true;
        this.element.classList.remove('show');

        if (this.options.modal) {
            this.overlay.classList.remove('show');
        }

        if (this.element.classList.contains('fade')) {
            // The timer covers a transition that never runs, such as when the styles are missing
            this.element.addEventListener('transitionend', () => this.hidePopover(), { once: true });
            this.hideTimer = setTimeout(() => this.hidePopover(), 350);
        }
        else {
            this.hidePopover();
        }
    }

    hidePopover() {
        if (!this.element) {
            return;
        }

        clearTimeout(this.hideTimer);
        removeEventListener('mousedown', this.onDocumentClick);
        removeEventListener('keydown', this.onKeyDown);
        removeEventListener('resize', this.resizeHandler);

        if (this.popper) {
            this.popper.destroy();
            this.popper = null;
        }

        this.element.remove();
        this.overlay.remove();
        this.trigger.classList.remove('popover-highlight');

        // Another popover may have opened while this one faded out
        if (Popover.activeInstance === this) {
            Popover.activeInstance = null;
            document.body.classList.remove('popover-open');
        }

        this.element = null;
        this.contentElement = null;
        this.overlay = null;
        this.isHiding = false;

        this.triggerEvent('popover:hide', { relatedTarget: this.trigger });

        if (this.options.onClose) {
            this.options.onClose();
        }
    }

    static hideActive() {
        if (Popover.activeInstance) {
            Popover.activeInstance.hide();
        }
    }

    getContainer() {
        return this.element;
    }

    getContent() {
        if (this.options.contentFrom) {
            const sourceEl = document.querySelector(this.options.contentFrom);
            return sourceEl ? sourceEl.innerHTML : '';
        }

        if (typeof this.options.content === 'function') {
            return this.options.content.call(this.trigger, this);
        }

        return this.options.content;
    }

    setContent(content) {
        if (content instanceof Node) {
            this.contentElement.replaceChildren(content);
        }
        else {
            this.contentElement.innerHTML = content;
        }

        if (this.popper) {
            this.popper.update();
        }
    }

    getMountContainer() {
        const container = this.options.container;

        if (container) {
            return (typeof container === 'string' ? document.querySelector(container) : container) || document.body;
        }

        return this.trigger.closest('dialog') || document.body;
    }

    getPopperOptions() {
        return {
            placement: this.calcBasePlacement(this.options.placement) + '-start',
            modifiers: [
                { name: 'offset', options: { offset: ({ placement }) => this.calcOffset(placement) } },
                { name: 'preventOverflow', options: { padding: this.edgePadding } },
                { name: 'flip', enabled: false },
                { name: 'computeStyles', options: { gpuAcceleration: false } },
                { name: 'eventListeners', options: { resize: false } },
                {
                    name: 'calcPlacement',
                    enabled: true,
                    phase: 'main',
                    requiresIfExists: ['offset'],
                    data: { _skip: false },
                    fn: ({ state, name }) => this.applyPlacement(state, name)
                },
                {
                    name: 'placementClass',
                    enabled: true,
                    phase: 'write',
                    fn: ({ state }) => this.setPlacementClass(state.placement.split('-')[0])
                }
            ]
        };
    }

    reposition() {
        if (!this.element) {
            return;
        }

        if (this.popper) {
            this.popper.update();
            return;
        }

        const position = this.calcCenterPosition();
        this.element.style.position = 'fixed';
        this.element.style.left = position.x + 'px';
        this.element.style.top = position.y + 'px';
        this.setPlacementClass('center');
    }

    setPlacementClass(placement) {
        this.element.classList.remove('placement-center', 'placement-bottom', 'placement-top', 'placement-left', 'placement-right');
        this.element.classList.add('placement-' + placement);
    }

    /**
     * Popper modifier that moves the popover to the placement chosen by calcPlacement.
     */
    applyPlacement(state, name) {
        if (state.modifiersData[name]._skip) {
            return;
        }

        const placement = this.calcPlacement(state) + '-start';

        if (state.placement !== placement) {
            state.modifiersData[name]._skip = true;
            state.placement = placement;
            state.reset = true;
        }
    }

    calcBasePlacement(placement) {
        return placements.includes(placement) ? placement : 'bottom';
    }

    /**
     * Returns how far the popover overflows each side of the viewport for every placement.
     */
    calcDimensions(state) {
        const dimensions = {};

        placements.forEach((placement) => {
            dimensions[placement] = detectOverflow(state, {
                placement: placement + '-start',
                padding: this.edgePadding
            });
        });

        return dimensions;
    }

    fitsLeft(dimensions) {
        return dimensions.left.left <= 0 && dimensions.left.bottom <= 0;
    }

    fitsRight(dimensions) {
        return dimensions.right.right <= 0 && dimensions.right.bottom <= 0;
    }

    fitsBottom(dimensions) {
        return dimensions.bottom.bottom <= 0 && dimensions.bottom.right <= 0;
    }

    fitsTop(dimensions) {
        return dimensions.top.top <= 0 && dimensions.top.right <= 0;
    }

    calcPlacement(state) {
        const placement = this.calcBasePlacement(this.options.placement);
        const dimensions = this.calcDimensions(state);

        const placementFunctions = {
            top: (d) => this.fitsTop(d),
            bottom: (d) => this.fitsBottom(d),
            left: (d) => this.fitsLeft(d),
            right: (d) => this.fitsRight(d)
        };

        if (placementFunctions[placement](dimensions)) {
            return placement;
        }

        for (const key in placementFunctions) {
            if (placementFunctions[key](dimensions)) {
                return key;
            }
        }

        return this.calcBasePlacement(this.options.fallbackPlacement);
    }

    /**
     * Returns the Popper [skidding, distance] offset for a placement.
     */
    calcOffset(placement) {
        const isVertical = ['left', 'right'].includes(placement.split('-')[0]);
        const axisOffset = isVertical ? this.options.offsetY : this.options.offsetX;
        const realOffset = axisOffset !== undefined ? axisOffset : this.options.offset;

        return [Number(realOffset) || 0, this.arrowSize];
    }

    calcCenterPosition() {
        const result = {
            x: (document.documentElement.clientWidth - this.element.offsetWidth) / 2,
            y: (window.innerHeight - this.element.offsetHeight) / 2
        };

        if (result.y < 40) {
            result.y = 40;
        }

        return result;
    }

    onDocumentClick(ev) {
        if (!this.element || !this.options.closeOnPageClick) {
            return;
        }

        if (this.options.onCheckDocumentClickTarget && this.options.onCheckDocumentClickTarget(ev.target)) {
            return;
        }

        if (this.element.contains(ev.target) || this.trigger.contains(ev.target)) {
            return;
        }

        this.hide();
    }

    onKeyDown(ev) {
        if (!this.options.closeOnEsc) {
            return;
        }

        // Cancelling the key keeps an enclosing dialog from treating it as its own close request
        if (ev.key === 'Escape') {
            ev.preventDefault();
            this.hide();
        }
    }

    triggerEvent(eventName, params) {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            cancelable: true,
            detail: Object.assign({ popover: this }, params)
        });

        this.trigger.dispatchEvent(event);

        return event;
    }
}

/*
 * Declarative binding: toggles a popover configured from the element's data attributes
 */
export function registerPopover(jax) {
    jax.registerControl('popover', class extends jax.ControlBase {
        init() {
            this.popover = null;
        }

        connect() {
            this.listen('click', this.onClick);
        }

        disconnect() {
            if (this.popover) {
                this.popover.hide();
            }
            this.popover = null;
        }

        onClick(ev) {
            ev.preventDefault();

            // Second click closes
            if (this.popover && Popover.activeInstance === this.popover) {
                this.popover.hide();
                return;
            }

            this.popover = new Popover(this.element, Object.assign({}, this.config));
            this.popover.show();
        }
    });
}
