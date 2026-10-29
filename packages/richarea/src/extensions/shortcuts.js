import { Extension } from '@tiptap/core';
import { openLinkForm, browseLinks } from '../commands/links.js';

/**
 * createShortcuts binds editor level keyboard shortcuts, Mod+K opens the link picker.
 */
export function createShortcuts(richArea) {
    return Extension.create({
        name: 'richAreaShortcuts',

        addKeyboardShortcuts() {
            return {
                'Mod-k': () => {
                    if (richArea.options.hooks.browseLinks) {
                        browseLinks(richArea);
                    }
                    else {
                        openLinkForm(richArea);
                    }

                    return true;
                }
            };
        }
    });
}
