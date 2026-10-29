import { h, icon } from './dom.js';
import { defaultIcons } from '../icons.js';

/**
 * createMenu renders a dropdown menu, where items are { label, icon, active, disabled,
 * style, run } objects or { type: 'separator' } and checkable menus show their state with checkIcon.
 */
export function createMenu(items, { onSelect, checkable = false, checkIcon = defaultIcons.check, className = '' } = {}) {
    const menu = h('div', { className: 'rich-editor-menu ' + className, role: 'menu' });

    items.forEach((item) => {
        if (item.type === 'separator') {
            menu.appendChild(h('div', { className: 'rich-editor-menu-separator', role: 'separator' }));
            return;
        }

        if (item.type === 'header') {
            menu.appendChild(h('div', { className: 'rich-editor-menu-header', text: item.label }));
            return;
        }

        const button = h('button', {
            type: 'button',
            className: 'rich-editor-menu-item' + (item.active ? ' is-active' : '') + (item.className ? ' ' + item.className : ''),
            role: checkable ? 'menuitemcheckbox' : 'menuitem',
            'aria-checked': checkable ? String(!!item.active) : null,
            disabled: !!item.disabled,
            title: item.title || null
        }, [
            checkable ? icon(checkIcon, 'rich-editor-menu-check') : null,
            item.icon ? icon(item.icon) : null,
            h('span', { className: 'rich-editor-menu-label', style: item.style || null, text: item.label })
        ]);

        button.addEventListener('mousedown', (event) => event.preventDefault());
        button.addEventListener('click', (event) => {
            event.preventDefault();
            if (onSelect) {
                onSelect(item, event);
            }
        });

        menu.appendChild(button);
    });

    menu.addEventListener('keydown', (event) => onMenuKeyDown(menu, event));

    return menu;
}

/**
 * focusFirstItem moves focus into a menu, preferring the active item.
 */
export function focusFirstItem(menu) {
    const item = menu.querySelector('.rich-editor-menu-item.is-active:not([disabled])')
        || menu.querySelector('.rich-editor-menu-item:not([disabled])');

    if (item) {
        item.focus();
    }
}

/**
 * onMenuKeyDown moves focus between menu items with the arrow keys.
 */
function onMenuKeyDown(menu, event) {
    const items = Array.from(menu.querySelectorAll('.rich-editor-menu-item:not([disabled])'));
    const index = items.indexOf(document.activeElement);

    let next = null;
    if (event.key === 'ArrowDown') {
        next = items[(index + 1) % items.length];
    }
    else if (event.key === 'ArrowUp') {
        next = items[(index - 1 + items.length) % items.length];
    }
    else if (event.key === 'Home') {
        next = items[0];
    }
    else if (event.key === 'End') {
        next = items[items.length - 1];
    }

    if (next) {
        event.preventDefault();
        next.focus();
    }
}
