/**
 * ContextMenu is the menu a right click opens on a cell. Like the option list it is a popover in the top
 * layer, placed at the pointer and kept inside the window. Items are { label, disabled, action }; up and
 * down move between enabled items, Enter runs one, Escape closes.
 */
export class ContextMenu {
    constructor(container) {
        this.el = document.createElement('div');
        this.el.className = 'hotsheet-menu';
        this.el.setAttribute('role', 'menu');
        this.el.setAttribute('popover', 'manual');
        this.el.tabIndex = -1;
        container.append(this.el);

        this.items = [];
        this.active = -1;
        this.restoreFocus = null;

        this.el.addEventListener('mousedown', (event) => event.preventDefault());
        this.el.addEventListener('click', (event) => {
            const itemEl = event.target.closest('[role="menuitem"]');
            if (itemEl) {
                this.run(Number(itemEl.dataset.index));
            }
        });
        this.el.addEventListener('keydown', (event) => this.onKeyDown(event));

        this.onOutside = (event) => {
            if (!this.el.contains(event.target)) {
                this.hide();
            }
        };
    }

    isOpen() {
        return this.el.matches(':popover-open');
    }

    /**
     * show opens the menu at a window position, returning focus to `restoreFocus` when it closes.
     */
    show(x, y, items, restoreFocus) {
        this.items = items;
        this.active = -1;
        this.restoreFocus = restoreFocus;
        this.renderItems();

        if (!this.isOpen()) {
            this.el.showPopover();
            document.addEventListener('mousedown', this.onOutside, true);
        }

        const width = this.el.offsetWidth;
        const height = this.el.offsetHeight;
        this.el.style.left = `${Math.max(0, Math.min(x, window.innerWidth - width))}px`;
        this.el.style.top = `${Math.max(0, y + height > window.innerHeight ? y - height : y)}px`;
        this.el.focus({ preventScroll: true });
    }

    hide() {
        if (!this.isOpen()) {
            return;
        }

        this.el.hidePopover();
        document.removeEventListener('mousedown', this.onOutside, true);
        this.restoreFocus?.();
    }

    run(index) {
        const item = this.items[index];
        if (!item || item.disabled) {
            return;
        }

        this.hide();
        item.action();
    }

    renderItems() {
        const elements = this.items.map((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'hotsheet-menu-item';
            itemEl.dataset.index = index;
            itemEl.setAttribute('role', 'menuitem');
            itemEl.setAttribute('aria-disabled', item.disabled ? 'true' : 'false');
            itemEl.classList.toggle('is-active', index === this.active);
            itemEl.textContent = item.label;
            return itemEl;
        });

        this.el.replaceChildren(...elements);
    }

    onKeyDown(event) {
        const enabled = this.items.map((item, index) => (item.disabled ? -1 : index)).filter((index) => index >= 0);

        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp': {
                event.preventDefault();
                if (!enabled.length) {
                    return;
                }
                const position = enabled.indexOf(this.active);
                const step = event.key === 'ArrowDown' ? 1 : -1;

                // With nothing highlighted yet, down starts at the first item and up at the last
                const next = position === -1 ? (step === 1 ? 0 : enabled.length - 1) : (position + step + enabled.length) % enabled.length;
                this.active = enabled[next];
                this.renderItems();
                return;
            }

            case 'Enter':
            case ' ':
                event.preventDefault();
                this.run(this.active);
                return;

            case 'Escape':
            case 'Tab':
                event.preventDefault();
                this.hide();
                return;

            default:
                return;
        }
    }

    destroy() {
        this.hide();
        this.el.remove();
    }
}
