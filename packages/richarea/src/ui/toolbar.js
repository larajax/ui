import { ButtonGroup } from './buttons.js';

/**
 * Toolbar renders the main button row, one tab stop with arrow keys moving between buttons.
 */
export class Toolbar {
    constructor(richArea, element) {
        this.richArea = richArea;
        this.element = element;
        this.group = new ButtonGroup(richArea, element, richArea.options.toolbarButtons);
        this.focusIndex = 0;

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onFocusIn = this.onFocusIn.bind(this);
        element.addEventListener('keydown', this.onKeyDown);
        element.addEventListener('focusin', this.onFocusIn);

        element.hidden = !this.group.items.length;
    }

    refresh() {
        this.group.refresh();
        this.updateTabStop();
    }

    enabledButtons() {
        return this.group.buttons().filter((button) => !button.disabled);
    }

    updateTabStop() {
        const buttons = this.group.buttons();
        const enabled = this.enabledButtons();
        const target = buttons[this.focusIndex] && !buttons[this.focusIndex].disabled
            ? buttons[this.focusIndex]
            : enabled[0];

        buttons.forEach((button) => button.setAttribute('tabindex', button === target ? '0' : '-1'));
    }

    onFocusIn(event) {
        const index = this.group.buttons().indexOf(event.target);
        if (index !== -1) {
            this.focusIndex = index;
            this.updateTabStop();
        }
    }

    onKeyDown(event) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            return;
        }

        const enabled = this.enabledButtons();
        const index = enabled.indexOf(document.activeElement);
        if (index === -1) {
            return;
        }

        let next;
        if (event.key === 'ArrowLeft') {
            next = enabled[(index - 1 + enabled.length) % enabled.length];
        }
        else if (event.key === 'ArrowRight') {
            next = enabled[(index + 1) % enabled.length];
        }
        else if (event.key === 'Home') {
            next = enabled[0];
        }
        else {
            next = enabled[enabled.length - 1];
        }

        event.preventDefault();
        next.focus();
    }

    destroy() {
        this.element.removeEventListener('keydown', this.onKeyDown);
        this.element.removeEventListener('focusin', this.onFocusIn);
    }
}
