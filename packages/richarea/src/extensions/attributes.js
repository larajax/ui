import { Extension, Mark, mergeAttributes } from '@tiptap/core';
import { cleanClassName } from '../html/utils.js';

/**
 * classAttribute keeps class names, minus runtime editor classes.
 */
function classAttribute() {
    return {
        default: null,
        parseHTML: (element) => cleanClassName(element.getAttribute('class')),
        renderHTML: (attributes) => (attributes.class ? { class: attributes.class } : {})
    };
}

/**
 * PreservedAttributes keeps existing class and id attributes.
 */
export const PreservedAttributes = Extension.create({
    name: 'preservedAttributes',

    addOptions() {
        return {
            classTypes: [
                'paragraph',
                'heading',
                'blockquote',
                'bulletList',
                'orderedList',
                'listItem',
                'horizontalRule',
                'table',
                'tableRow',
                'tableCell',
                'tableHeader'
            ],
            idTypes: ['paragraph', 'heading']
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.classTypes,
                attributes: {
                    class: classAttribute()
                }
            },
            {
                types: this.options.idTypes,
                attributes: {
                    id: {
                        default: null,
                        keepOnSplit: false,
                        parseHTML: (element) => element.getAttribute('id') || null,
                        renderHTML: (attributes) => (attributes.id ? { id: attributes.id } : {})
                    }
                }
            }
        ];
    }
});

/**
 * InlineClass is a span with class names, for inline styles.
 */
export const InlineClass = Mark.create({
    name: 'inlineClass',

    addAttributes() {
        return {
            class: {
                default: null,
                parseHTML: (element) => cleanClassName(element.getAttribute('class'))
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[class]',
                consuming: false,
                getAttrs: (element) => {
                    if (element.hasAttribute('data-snippet')) {
                        return false;
                    }

                    return cleanClassName(element.getAttribute('class')) ? null : false;
                }
            }
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes), 0];
    },

    addCommands() {
        return {
            toggleInlineClass: (className) => ({ editor, commands }) => {
                if (editor.isActive(this.name, { class: className })) {
                    return commands.unsetMark(this.name, { extendEmptyMarkRange: true });
                }

                return commands.setMark(this.name, { class: className });
            }
        };
    }
});

/**
 * LineBreaks makes Enter insert a line break, except inside lists.
 */
export const LineBreaks = Extension.create({
    name: 'lineBreaks',

    priority: 1000,

    addKeyboardShortcuts() {
        return {
            Enter: () => {
                if (this.editor.isActive('listItem') || this.editor.isActive('codeBlock')) {
                    return false;
                }

                return this.editor.commands.setHardBreak();
            }
        };
    }
});
