// Matches the platform test ProseMirror uses to resolve Mod to Cmd or Ctrl.
const isMac = typeof navigator !== 'undefined' && /Mac|iP(hone|[oa]d)/.test(navigator.platform);

const MAC_MODIFIERS = [['Ctrl', '⌃'], ['Alt', '⌥'], ['Shift', '⇧'], ['Mod', '⌘']];

const OTHER_MODIFIERS = [['Mod', 'keyCtrl'], ['Ctrl', 'keyCtrl'], ['Alt', 'keyAlt'], ['Shift', 'keyShift']];

/**
 * formatShortcut turns a key binding such as Mod-Shift-z into the platform notation, ⇧⌘Z on
 * Apple devices and Ctrl+Shift+Z elsewhere.
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
 * tooltipAttributes returns the hover tooltip attributes for a button from the tooltip hook.
 */
export function tooltipAttributes(hooks, label, shortcut) {
    return hooks.tooltip(label, shortcut || null) || {};
}
