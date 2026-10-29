/*
 * Rich Editor public API
 *
 * Registry for custom toolbar buttons and the host hooks shared by every rich editor on the
 * page. Register buttons at the top level of a page script, before the editors initialize:
 *
 *     import { richEditor } from '/vendor/larajax/ui/index.js';
 *
 *     richEditor.registerButton('insertCustomThing', {
 *         label: 'Insert Something',
 *         icon: 'ph ph-star',
 *         toolbar: 'end',
 *         onClick: function(editor) {
 *             editor.insertHtml('<strong>My Custom Thing!</strong>');
 *         }
 *     });
 *
 * Hooks connect the editors to the page, for example an upload endpoint:
 *
 *     richEditor.hooks.uploadFile = async (file) => '/storage/' + file.name;
 */
'use strict';

// normalizeList accepts an array or comma separated string, returning a clean array or null
function normalizeList(value) {
    if (typeof value === 'string') {
        value = value.split(',');
    }

    if (!Array.isArray(value)) {
        return null;
    }

    const result = value
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);

    return result.length ? result : null;
}

// findInsertIndex resolves a placement hint to an index in the button list
function findInsertIndex(list, placement) {
    if (placement === 'start') {
        return 0;
    }

    if (placement && typeof placement === 'object') {
        const reference = placement.before || placement.after,
            index = list.indexOf(reference);

        if (index !== -1) {
            return placement.before ? index : index + 1;
        }
    }

    return list.length;
}

// injectButton splices a button into the list, applying separator hints
function injectButton(list, name, definition) {
    const index = findInsertIndex(list, definition.toolbar),
        separator = definition.separator,
        entry = [name];

    if ((separator === 'before' || separator === 'both') && index > 0 && list[index - 1] !== '|') {
        entry.unshift('|');
    }

    if ((separator === 'after' || separator === 'both') && index < list.length && list[index] !== '|') {
        entry.push('|');
    }

    list.splice(index, 0, ...entry);
}

export const richEditor = {
    /*
     * buttons registered on this page, keyed by name
     */
    buttons: {},

    /*
     * hooks shared by every editor on this page, see the RichArea hooks for the available names
     */
    hooks: {},

    /*
     * defaultButtons used when no field configuration applies
     */
    defaultButtons: [
        'paragraphFormat',
        'align',
        'bold',
        'italic',
        'underline',
        '|',
        'formatOL',
        'formatUL',
        '|',
        'insertSnippet',
        'insertTable',
        'insertPageLink',
        'insertImage',
        'insertHR',
        'html'
    ],

    /*
     * registerButton adds a button definition:
     *
     * - label: tooltip and accessible label
     * - icon: icon class name, or { html: '...' } markup
     * - toolbar: 'start' | 'end' | { before: name } | { after: name }, omit to register without placing
     * - separator: 'before' | 'after' | 'both' inserts a visual separator
     * - undo: records an undo step after onClick
     * - focus: focuses the editor before onClick
     * - onClick: function(editor) receiving the editor facade
     */
    registerButton(name, definition) {
        this.buttons[name] = definition || {};
    },

    /*
     * resolveButtons builds the toolbar list for an editor instance, configured
     * buttons are used verbatim while the built-in default list receives
     * registered button injection
     */
    resolveButtons(context) {
        context = context || {};

        const fieldButtons = normalizeList(context.fieldButtons);
        if (fieldButtons) {
            return fieldButtons;
        }

        const globalButtons = normalizeList(context.globalButtons);
        if (globalButtons) {
            return globalButtons;
        }

        return this.injectRegisteredButtons(this.defaultButtons);
    },

    /*
     * injectRegisteredButtons returns a copy of a button list with the
     * registered buttons that request a toolbar placement injected
     */
    injectRegisteredButtons(list) {
        const result = (list || []).slice();

        Object.keys(this.buttons).forEach((name) => {
            const definition = this.buttons[name];
            if (definition.toolbar && result.indexOf(name) === -1) {
                injectButton(result, name, definition);
            }
        });

        return result;
    }
};
