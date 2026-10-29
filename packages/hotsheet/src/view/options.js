/**
 * OptionList is the list shown under a dropdown or autocomplete cell while it is edited. It is a popover, so
 * it sits in the top layer and isn't clipped by the field's container; it is positioned against the cell and
 * follows it when anything scrolls. The editor keeps focus: arrows move the highlight, Enter picks.
 */
export class OptionList {
    constructor(container, onPick) {
        this.el = document.createElement('div');
        this.el.className = 'hotsheet-options';
        this.el.setAttribute('role', 'listbox');
        this.el.setAttribute('popover', 'manual');
        this.el.id = `hotsheet-options-${Math.random().toString(36).slice(2)}`;
        container.append(this.el);

        this.items = [];
        this.highlight = -1;
        this.anchorEl = null;

        // Pressing an option must not take focus from the editor
        this.el.addEventListener('mousedown', (event) => event.preventDefault());
        this.el.addEventListener('click', (event) => {
            const optionEl = event.target.closest('[role="option"]');
            if (optionEl) {
                onPick(this.items[Number(optionEl.dataset.index)]);
            }
        });

        this.reposition = () => this.position();
    }

    isOpen() {
        return this.el.matches(':popover-open');
    }

    show(anchorEl, items, highlight) {
        this.anchorEl = anchorEl;
        this.items = items;
        this.highlight = highlight;
        this.renderItems();

        if (!this.isOpen()) {
            this.el.showPopover();
            window.addEventListener('scroll', this.reposition, true);
            window.addEventListener('resize', this.reposition);
        }

        this.position();
        this.scrollToHighlight();
    }

    hide() {
        if (this.isOpen()) {
            this.el.hidePopover();
            window.removeEventListener('scroll', this.reposition, true);
            window.removeEventListener('resize', this.reposition);
        }

        this.items = [];
        this.highlight = -1;
        this.anchorEl = null;
    }

    /**
     * move steps the highlight, starting from the first or last option when nothing is highlighted.
     */
    move(step) {
        if (!this.items.length) {
            return;
        }

        if (this.highlight < 0) {
            this.highlight = step > 0 ? 0 : this.items.length - 1;
        }
        else {
            this.highlight = Math.min(Math.max(this.highlight + step, 0), this.items.length - 1);
        }

        this.renderItems();
        this.scrollToHighlight();
    }

    highlighted() {
        return this.highlight >= 0 ? this.items[this.highlight] || null : null;
    }

    renderItems() {
        const elements = this.items.map((item, index) => {
            const optionEl = document.createElement('div');
            optionEl.className = 'hotsheet-option';
            optionEl.id = `${this.el.id}-${index}`;
            optionEl.dataset.index = index;
            optionEl.setAttribute('role', 'option');
            optionEl.setAttribute('aria-selected', index === this.highlight ? 'true' : 'false');
            optionEl.textContent = item.label;
            return optionEl;
        });

        this.el.replaceChildren(...elements);
    }

    activeDescendant() {
        return this.highlight >= 0 ? `${this.el.id}-${this.highlight}` : null;
    }

    scrollToHighlight() {
        const optionEl = this.el.children[this.highlight];
        if (!optionEl) {
            return;
        }

        if (optionEl.offsetTop < this.el.scrollTop) {
            this.el.scrollTop = optionEl.offsetTop;
        }
        else if (optionEl.offsetTop + optionEl.offsetHeight > this.el.scrollTop + this.el.clientHeight) {
            this.el.scrollTop = optionEl.offsetTop + optionEl.offsetHeight - this.el.clientHeight;
        }
    }

    /**
     * position hangs the list from the cell's selection ring, under it or above it when there isn't room below.
     */
    position() {
        if (!this.anchorEl || !this.isOpen()) {
            return;
        }

        const rect = this.anchorEl.getBoundingClientRect();
        const { borderRightWidth, borderBottomWidth } = getComputedStyle(this.anchorEl);
        const bottom = rect.bottom - parseFloat(borderBottomWidth);
        const style = this.el.style;
        style.left = `${rect.left}px`;
        style.minWidth = `${rect.width - parseFloat(borderRightWidth)}px`;

        const height = this.el.offsetHeight;
        const fitsBelow = bottom + height <= window.innerHeight || rect.top - height < 0;
        style.top = `${fitsBelow ? bottom : rect.top - height}px`;
        this.el.classList.toggle('is-above', !fitsBelow);
    }

    destroy() {
        this.hide();
        this.el.remove();
    }
}
