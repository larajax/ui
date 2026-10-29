import { TextAlign as BaseTextAlign } from '@tiptap/extension-text-align';

/**
 * TextAlign clears the alignment for the left shortcut, matching the Align Left button.
 */
export const TextAlign = BaseTextAlign.extend({
    addKeyboardShortcuts() {
        return {
            ...this.parent?.(),
            'Mod-Shift-l': () => this.editor.commands.unsetTextAlign()
        };
    }
});
