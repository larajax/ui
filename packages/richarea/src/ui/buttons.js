import { h, icon } from './dom.js';
import { formatShortcut, tooltipAttributes } from './tooltip.js';

const warnedCodes = new Set();

/**
 * ButtonGroup renders button codes and keeps their state in step.
 */
export class ButtonGroup {
    constructor(richArea, container, codes) {
        this.richArea = richArea;
        this.container = container;
        this.items = [];

        this.render(codes || []);
    }

    render(codes) {
        let lastWasSeparator = true;

        const addSeparator = () => {
            if (!lastWasSeparator) {
                this.container.appendChild(h('span', { className: 'rich-editor-separator', role: 'separator' }));
                lastWasSeparator = true;
            }
        };

        codes.forEach((code) => {
            if (code === '|' || code === '-') {
                addSeparator();
                return;
            }

            const definition = this.resolveDefinition(code);
            if (!definition) {
                return;
            }

            // Sets stand apart, like the alignment buttons
            if (definition.buttons) {
                const set = this.renderSet(code, definition);
                if (set.childElementCount) {
                    addSeparator();
                    this.container.appendChild(set);
                    lastWasSeparator = false;
                    addSeparator();
                }
                return;
            }

            this.container.appendChild(this.addItem(code, definition));
            lastWasSeparator = false;
        });

        const last = this.container.lastElementChild;
        if (last && last.classList.contains('rich-editor-separator')) {
            last.remove();
        }
    }

    /**
     * resolveDefinition looks up a code, warning once if unknown.
     */
    resolveDefinition(code) {
        const definition = this.richArea.getButtonDefinition(code);

        if (!definition && !warnedCodes.has(code)) {
            warnedCodes.add(code);
            console.warn('[richeditor] Unknown toolbar button "' + code + '" is ignored.');
        }

        return definition;
    }

    /**
     * renderSet renders a set's buttons together, so they wrap as one.
     */
    renderSet(code, definition) {
        const label = this.richArea.trans(definition.label || code, definition.label || code);
        const set = h('span', { className: 'rich-editor-button-set', role: 'group', 'aria-label': label });

        definition.buttons.forEach((buttonCode) => {
            const buttonDefinition = this.resolveDefinition(buttonCode);
            if (buttonDefinition && !buttonDefinition.buttons) {
                set.appendChild(this.addItem(buttonCode, buttonDefinition));
            }
        });

        return set;
    }

    addItem(code, definition) {
        const item = this.renderItem(code, definition);
        this.items.push(item);
        return item.button;
    }

    renderItem(code, definition) {
        const re = this.richArea;
        const isDropdown = !!(definition.menu || definition.panel);
        const label = re.trans(definition.label || code, definition.label || code);
        const shortcut = definition.shortcut ? formatShortcut(definition.shortcut, re.trans) : null;
        const hasTextLabel = !!definition.getLabel;

        const iconValue = hasTextLabel ? null : re.resolveButtonIcon(code, definition);
        const iconElement = iconValue ? icon(iconValue) : null;
        const labelElement = hasTextLabel ? h('span', { className: 'rich-editor-button-label' }) : null;

        const button = h('button', {
            type: 'button',
            className: 'rich-editor-button' + (isDropdown ? ' has-dropdown' : '') + (hasTextLabel ? ' has-label' : ''),
            ...tooltipAttributes(re.options.hooks, label, shortcut),
            'aria-label': label,
            'aria-haspopup': isDropdown ? 'true' : null,
            'aria-expanded': isDropdown ? 'false' : null,
            'data-cmd': code,
            tabindex: '-1'
        }, [
            iconElement,
            labelElement,
            isDropdown ? icon(re.options.icons.caret, 'rich-editor-caret') : null
        ]);

        const item = { code, definition, button, iconElement, iconValue, labelElement, isDropdown };

        button.addEventListener('mousedown', (event) => event.preventDefault());
        button.addEventListener('click', (event) => {
            event.preventDefault();
            this.activate(item, { focusMenu: event.detail === 0 });
        });

        button.addEventListener('keydown', (event) => {
            if (isDropdown && event.key === 'ArrowDown') {
                event.preventDefault();
                this.activate(item, { focusMenu: true });
            }
        });

        return item;
    }

    activate(item, { focusMenu = false } = {}) {
        if (item.button.disabled) {
            return;
        }

        this.richArea.activateButton(item.code, { anchor: item.button, focusMenu });
    }

    refresh() {
        const re = this.richArea;

        this.items.forEach((item) => {
            const { definition, button } = item;
            const disabled = re.isButtonDisabled(definition);
            const active = !disabled && definition.isActive ? !!definition.isActive(re) : false;

            button.disabled = disabled;
            button.classList.toggle('is-active', active);

            if (definition.isActive && !item.isDropdown) {
                button.setAttribute('aria-pressed', String(active));
            }

            if (item.labelElement) {
                item.labelElement.textContent = definition.getLabel(re) || re.trans(definition.label);
            }

            if (item.iconElement && definition.getIcon) {
                this.refreshIcon(item, definition.getIcon(re));
            }
        });
    }

    /**
     * refreshIcon swaps a button icon when its state changes it.
     */
    refreshIcon(item, value) {
        if (!value || value === item.iconValue) {
            return;
        }

        const element = icon(value);
        item.iconElement.replaceWith(element);
        item.iconElement = element;
        item.iconValue = value;
    }

    buttons() {
        return this.items.map((item) => item.button);
    }
}
