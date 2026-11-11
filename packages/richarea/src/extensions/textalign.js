import { TextAlign as BaseTextAlign } from '@tiptap/extension-text-align';

/**
 * TextAlign clears alignment for the left shortcut, like Align Left.
 */
export const TextAlign = BaseTextAlign.extend({
    addKeyboardShortcuts() {
        return {
            ...this.parent?.(),
            'Mod-Shift-l': () => this.editor.commands.unsetTextAlign()
        };
    }
});
