import { Extension } from '@tiptap/core';
import { openLinkForm, browseLinks } from '../commands/links.js';

/**
 * createShortcuts binds editor shortcuts, such as Mod+K for links.
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
