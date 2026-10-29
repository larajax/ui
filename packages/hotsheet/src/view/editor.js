/**
 * CellEditor is the one textarea the grid keeps focused while it is active. Closed, it sits invisibly on the
 * active cell and receives keys and clipboard events; typing a character opens it in place, so the character
 * lands in it, as do IME compositions. Open, it covers the cell and grows with its content.
 *
 * Modes: `fast` (opened by typing, arrow keys commit and move) and `full` (opened with Enter, F2 or a double
 * click, arrow keys move the caret).
 */
export class CellEditor {
    constructor(container) {
        this.textarea = document.createElement('textarea');
        this.textarea.className = 'hotsheet-input';
        this.textarea.setAttribute('autocomplete', 'off');
        this.textarea.setAttribute('autocorrect', 'off');
        this.textarea.setAttribute('autocapitalize', 'off');
        this.textarea.setAttribute('spellcheck', 'false');
        this.textarea.setAttribute('rows', '1');
        this.textarea.setAttribute('aria-hidden', 'true');

        // A touch screen's keyboard shows only while editing; a physical keyboard types into the closed editor
        this.textarea.inputMode = 'none';
        container.append(this.textarea);

        this.cell = null;
        this.mode = null;
        this.originalText = '';
    }

    isOpen() {
        return this.mode !== null;
    }

    getValue() {
        return this.textarea.value;
    }

    focus() {
        if (document.activeElement !== this.textarea) {
            this.textarea.focus({ preventScroll: true });
        }
    }

    hasFocus() {
        return document.activeElement === this.textarea;
    }

    /**
     * refocus focuses the editor again, which a touch screen needs before its keyboard follows a change of
     * input mode; call it while handling a tap.
     */
    refocus() {
        this.textarea.blur();
        this.textarea.focus({ preventScroll: true });
    }

    /**
     * park places the closed textarea over a cell, so focusing it never scrolls the page.
     */
    park(cellEl) {
        if (this.isOpen()) {
            return;
        }

        this.place(cellEl);
        this.textarea.value = '';
    }

    open(cell, cellEl, text, mode) {
        this.cell = cell;
        this.mode = mode;
        this.originalText = text;
        this.place(cellEl);
        this.textarea.value = text;
        this.textarea.inputMode = 'text';
        this.textarea.classList.add('is-open');
        this.textarea.removeAttribute('aria-hidden');
        this.focus();

        const end = text.length;
        this.textarea.setSelectionRange(end, end);
    }

    /**
     * openForTyping shows the editor without touching its value, so the key or composition being typed lands in it.
     */
    openForTyping(cell, cellEl) {
        this.cell = cell;
        this.mode = 'fast';
        this.originalText = '';
        this.place(cellEl);
        this.textarea.inputMode = 'text';
        this.textarea.classList.add('is-open');
        this.textarea.removeAttribute('aria-hidden');
    }

    close() {
        this.cell = null;
        this.mode = null;
        this.textarea.value = '';
        this.textarea.inputMode = 'none';
        this.textarea.classList.remove('is-open');
        this.textarea.setAttribute('aria-hidden', 'true');

        for (const name of ['role', 'aria-expanded', 'aria-controls', 'aria-activedescendant', 'aria-autocomplete']) {
            this.textarea.removeAttribute(name);
        }
    }

    /**
     * describeOptions marks the editor as a combobox controlling the option list.
     */
    describeOptions(list) {
        this.textarea.setAttribute('role', 'combobox');
        this.textarea.setAttribute('aria-expanded', 'true');
        this.textarea.setAttribute('aria-autocomplete', 'list');
        this.textarea.setAttribute('aria-controls', list.el.id);

        const active = list.activeDescendant();
        if (active) {
            this.textarea.setAttribute('aria-activedescendant', active);
        }
        else {
            this.textarea.removeAttribute('aria-activedescendant');
        }
    }

    insertLineBreak() {
        const { selectionStart, selectionEnd, value } = this.textarea;
        this.textarea.value = value.slice(0, selectionStart) + '\n' + value.slice(selectionEnd);
        this.textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
    }

    /**
     * place covers the cell inside its grid lines at fractional precision, so the open editor's ring lands on the selection ring.
     */
    place(cellEl) {
        if (!cellEl) {
            return;
        }

        const cell = cellEl.getBoundingClientRect();
        const container = this.textarea.parentElement.getBoundingClientRect();
        const { borderRightWidth, borderBottomWidth } = getComputedStyle(cellEl);

        const style = this.textarea.style;
        style.top = `${cell.top - container.top}px`;
        style.left = `${cell.left - container.left}px`;
        style.minWidth = `${cell.width - parseFloat(borderRightWidth)}px`;
        style.minHeight = `${cell.height - parseFloat(borderBottomWidth)}px`;
    }

    destroy() {
        this.textarea.remove();
    }
}
