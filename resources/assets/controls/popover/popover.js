/*
 * Popover control
 *
 * A floating panel positioned below a trigger element, closed by clicking
 * outside or pressing Escape. Only one popover is active at a time.
 *
 * Programmatic API:
 *
 *     import { Popover } from './controls/popover/popover.js';
 *
 *     const popover = new Popover(triggerEl, {
 *         extraClass: 'my-popover',
 *         content: '<p>Hello</p>',    // optional, shows a loading state otherwise
 *         onClose: () => { ... }
 *     });
 *     popover.show();
 *     popover.setContent('<p>Loaded</p>');
 *
 * Declarative API:
 * - data-control="popover" - toggles a popover from the element
 * - data-content-from="#template" - selector of a template element supplying the content
 */
'use strict';

import { createPopper } from '../../vendor/popperjs/popper.esm.js';

export class Popover {
    static activeInstance = null;

    constructor(trigger, options = {}) {
        this.trigger = trigger;
        this.options = Object.assign({
            extraClass: '',
            content: null,
            onClose: null,
            onCheckDocumentClickTarget: null
        }, options);

        this.element = null;
        this.popper = null;
        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    show() {
        Popover.hideActive();
        Popover.activeInstance = this;

        this.element = document.createElement('div');
        this.element.className = ('control-popover ' + this.options.extraClass).trim();

        if (this.options.content !== null) {
            this.setContent(this.options.content);
        }
        else {
            this.element.innerHTML = '<span class="control-popover-loading"></span>';
        }

        // Attach to the body so overflow-clipping containers cannot hide it
        document.body.appendChild(this.element);

        this.popper = createPopper(this.trigger, this.element, {
            placement: 'bottom-start',
            modifiers: [
                { name: 'offset', options: { offset: [0, 6] } },
                { name: 'preventOverflow', options: { padding: 8 } }
            ]
        });

        // Outside detection uses mousedown so a click handler that detaches its
        // own target (e.g. group filter items) cannot read as an outside click.
        // Defer binding so the interaction that opened the popover cannot close it.
        setTimeout(() => {
            if (this.element) {
                addEventListener('mousedown', this.onDocumentClick);
                addEventListener('keydown', this.onKeyDown);
            }
        }, 0);
    }

    setContent(content) {
        if (content instanceof Node) {
            this.element.replaceChildren(content);
        }
        else {
            this.element.innerHTML = content;
        }

        if (this.popper) {
            this.popper.update();
        }
    }

    hide() {
        if (!this.element) {
            return;
        }

        removeEventListener('mousedown', this.onDocumentClick);
        removeEventListener('keydown', this.onKeyDown);

        if (this.popper) {
            this.popper.destroy();
            this.popper = null;
        }

        this.element.remove();
        this.element = null;

        if (Popover.activeInstance === this) {
            Popover.activeInstance = null;
        }

        if (this.options.onClose) {
            this.options.onClose();
        }
    }

    static hideActive() {
        if (Popover.activeInstance) {
            Popover.activeInstance.hide();
        }
    }

    onDocumentClick(ev) {
        if (!this.element) {
            return;
        }

        if (this.options.onCheckDocumentClickTarget && this.options.onCheckDocumentClickTarget(ev.target)) {
            return;
        }

        if (!this.element.contains(ev.target) && !this.trigger.contains(ev.target)) {
            this.hide();
        }
    }

    onKeyDown(ev) {
        if (ev.key === 'Escape') {
            this.hide();
        }
    }
}

/*
 * Declarative binding: toggles a popover with content cloned from a template
 */
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

        let content = null;
        if (this.config.contentFrom) {
            const template = document.querySelector(this.config.contentFrom);
            if (template) {
                content = template.innerHTML;
            }
        }

        this.popover = new Popover(this.element, { content: content });
        this.popover.show();

        // Focus any autofocus input in the content
        const focusEl = this.popover.element.querySelector('[data-popover-autofocus]');
        if (focusEl) {
            focusEl.focus();
        }
    }
});
