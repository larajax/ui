// Same Mac test ProseMirror uses for Mod.
const isMac = typeof navigator !== 'undefined' && /Mac|iP(hone|[oa]d)/.test(navigator.platform);

const MAC_MODIFIERS = [['Ctrl', '⌃'], ['Alt', '⌥'], ['Shift', '⇧'], ['Mod', '⌘']];

const OTHER_MODIFIERS = [['Mod', 'keyCtrl'], ['Ctrl', 'keyCtrl'], ['Alt', 'keyAlt'], ['Shift', 'keyShift']];

/**
 * formatShortcut turns a key binding into the platform notation.
 */
export function formatShortcut(shortcut, trans) {
    const parts = shortcut.split(/-(?!$)/);
    const key = parts.pop();
    const keyLabel = key.length === 1 ? key.toUpperCase() : key;

    if (isMac) {
        return MAC_MODIFIERS
            .filter(([name]) => parts.includes(name))
            .map(([, symbol]) => symbol)
            .join('') + keyLabel;
    }

    const modifiers = OTHER_MODIFIERS
        .filter(([name]) => parts.includes(name))
        .map(([, langKey]) => trans(langKey));

    return [...new Set(modifiers), keyLabel].join('+');
}

/**
 * tooltipAttributes returns a button's tooltip attributes.
 */
export function tooltipAttributes(hooks, label, shortcut) {
    return hooks.tooltip(label, shortcut || null) || {};
}
