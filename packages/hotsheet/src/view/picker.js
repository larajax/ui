import { toIsoDate, fromIsoDate, toIsoTime, fromIsoTime } from '../values/dates.js';

/**
 * NativePicker opens the browser's own date or time picker for an edited cell. The open editor shows a
 * button at the cell's right edge (Alt+Down does the same); the picked value is written in the column's
 * format and committed.
 */
export class NativePicker {
    constructor(container, onPick) {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'hotsheet-picker';
        this.button.tabIndex = -1;
        this.button.hidden = true;

        this.input = document.createElement('input');
        this.input.className = 'hotsheet-picker-input';
        this.input.tabIndex = -1;
        this.input.setAttribute('aria-hidden', 'true');

        container.append(this.button, this.input);

        this.kind = null;
        this.format = null;

        // The button must not take focus from the editor
        this.button.addEventListener('mousedown', (event) => event.preventDefault());
        this.input.addEventListener('change', () => {
            if (this.kind && this.input.value) {
                onPick(this.kind === 'date' ? fromIsoDate(this.input.value, this.format) : fromIsoTime(this.input.value, this.format));
            }
        });
    }

    /**
     * attach shows the picker button on a cell being edited.
     */
    attach(kind, format, cellEl, label) {
        this.kind = kind;
        this.format = format;
        this.input.type = kind;
        this.button.dataset.kind = kind;
        this.button.hidden = false;
        this.button.setAttribute('aria-label', label);

        const top = `${cellEl.offsetTop}px`;
        this.button.style.top = top;
        this.button.style.left = `${cellEl.offsetLeft + cellEl.offsetWidth}px`;
        this.button.style.height = `${cellEl.offsetHeight}px`;
        this.input.style.top = top;
        this.input.style.left = `${cellEl.offsetLeft}px`;
        this.input.style.height = `${cellEl.offsetHeight}px`;
    }

    detach() {
        this.kind = null;
        this.button.hidden = true;
    }

    isAttached() {
        return this.kind !== null;
    }

    /**
     * open shows the native picker starting from the cell's current text.
     */
    open(text) {
        if (!this.kind) {
            return;
        }

        this.input.value = this.kind === 'date' ? toIsoDate(text, this.format) : toIsoTime(text, this.format);

        try {
            this.input.showPicker();
        }
        catch (error) {
            // Browsers refuse without a user gesture; the editor stays usable by typing
        }
    }

    destroy() {
        this.button.remove();
        this.input.remove();
    }
}
