import { applyTheme } from './dom.js';

const GAP = 4;
const MARGIN = 8;

/**
 * placePanel positions a fixed panel below an anchor rectangle, flipping above when there is
 * no room and keeping it inside the viewport.
 */
export function placePanel(panel, rect, placement = 'bottom-start') {
    panel.style.left = '0px';
    panel.style.top = '0px';

    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;

    let top = placement.startsWith('top') ? rect.top - height - GAP : rect.bottom + GAP;
    if (placement.startsWith('bottom') && top + height > viewportHeight - MARGIN && rect.top - height - GAP > MARGIN) {
        top = rect.top - height - GAP;
    }
    else if (placement.startsWith('top') && top < MARGIN) {
        top = rect.bottom + GAP;
    }

    let left = rect.left;
    if (placement.endsWith('center')) {
        left = rect.left + rect.width / 2 - width / 2;
    }
    else if (placement.endsWith('end')) {
        left = rect.right - width;
    }

    left = Math.max(MARGIN, Math.min(left, viewportWidth - width - MARGIN));

    panel.style.left = Math.round(left) + 'px';
    panel.style.top = Math.round(top) + 'px';
}

/**
 * Floating manages the single open dropdown or popover of an editor, closing it on outside
 * clicks and Escape and following its anchor when the page scrolls.
 */
export class Floating {
    constructor(richArea) {
        this.richArea = richArea;
        this.panel = null;
        this.anchor = null;
        this.owner = null;
        this.options = {};

        this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);
        this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);
        this.onViewportChange = this.onViewportChange.bind(this);
    }

    /**
     * open shows a panel against an anchor element or a function returning a rectangle.
     */
    open(panel, anchor, options = {}) {
        this.close();

        this.panel = panel;
        this.anchor = anchor;
        this.owner = options.owner || null;
        this.options = options;

        panel.classList.add('rich-editor-floating');
        applyTheme(panel, this.richArea.root);
        document.body.appendChild(panel);
        this.position();

        document.addEventListener('mousedown', this.onDocumentMouseDown, true);
        document.addEventListener('keydown', this.onDocumentKeyDown, true);
        window.addEventListener('resize', this.onViewportChange);
        window.addEventListener('scroll', this.onViewportChange, true);

        if (this.owner) {
            this.owner.setAttribute('aria-expanded', 'true');
        }

        this.richArea.emit('floatingOpen', panel);
    }

    /**
     * close removes the open panel, if any.
     */
    close() {
        if (!this.panel) {
            return;
        }

        const { panel, owner, options } = this;

        this.panel = null;
        this.anchor = null;
        this.owner = null;
        this.options = {};

        document.removeEventListener('mousedown', this.onDocumentMouseDown, true);
        document.removeEventListener('keydown', this.onDocumentKeyDown, true);
        window.removeEventListener('resize', this.onViewportChange);
        window.removeEventListener('scroll', this.onViewportChange, true);

        panel.remove();

        if (owner) {
            owner.setAttribute('aria-expanded', 'false');
        }

        if (options.onClose) {
            options.onClose();
        }

        this.richArea.emit('floatingClose', panel);
    }

    /**
     * isOpen checks for an open panel, optionally opened by a specific button.
     */
    isOpen(owner) {
        return !!this.panel && (!owner || this.owner === owner);
    }

    /**
     * position places the panel against the current anchor rectangle.
     */
    position() {
        if (!this.panel) {
            return;
        }

        const rect = typeof this.anchor === 'function'
            ? this.anchor()
            : this.anchor.getBoundingClientRect();

        if (!rect) {
            this.close();
            return;
        }

        placePanel(this.panel, rect, this.options.placement);
    }

    onDocumentMouseDown(event) {
        if (this.panel.contains(event.target) || (this.owner && this.owner.contains(event.target))) {
            return;
        }

        this.close();
    }

    onDocumentKeyDown(event) {
        if (event.key !== 'Escape') {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const returnFocus = this.owner;
        this.close();

        if (returnFocus && returnFocus.isConnected) {
            returnFocus.focus();
        }
        else {
            this.richArea.focus();
        }
    }

    onViewportChange(event) {
        if (event && event.type === 'scroll' && this.panel && this.panel.contains(event.target)) {
            return;
        }

        this.position();
    }
}
