import { Node, mergeAttributes } from '@tiptap/core';
import { cleanClassName, isSafeUrl } from '../html/utils.js';

/**
 * parseDimension reads a width or height from the attribute or the inline style Froala wrote
 * when an image was resized, where style values keep their unit so they save as a style again.
 */
function parseDimension(element, name) {
    const attribute = (element.getAttribute(name) || '').trim();
    if (/^\d+(px)?$/.test(attribute)) {
        return attribute.replace('px', '');
    }

    if (/^\d+(\.\d+)?%$/.test(attribute)) {
        return attribute;
    }

    const style = (element.style[name] || '').trim();
    if (/^\d+(\.\d+)?px$/.test(style)) {
        return Math.round(parseFloat(style)) + 'px';
    }

    if (/^\d+(\.\d+)?%$/.test(style)) {
        return style;
    }

    return null;
}

/**
 * renderDimension writes plain numbers as attributes and pixel or percentage values as a style.
 */
function renderDimension(name, value) {
    if (!value) {
        return {};
    }

    if (/^\d+$/.test(value)) {
        return { [name]: value };
    }

    return { style: `${name}: ${value}` };
}

/**
 * Image is an inline image, kept inline so existing content with images inside paragraphs
 * round trips unchanged; alignment is expressed through classes.
 */
export const Image = Node.create({
    name: 'image',

    inline: true,

    group: 'inline',

    atom: true,

    draggable: true,

    selectable: true,

    addAttributes() {
        return {
            src: {
                default: null
            },
            alt: {
                default: null
            },
            title: {
                default: null
            },
            width: {
                default: null,
                parseHTML: (element) => parseDimension(element, 'width'),
                renderHTML: (attributes) => renderDimension('width', attributes.width)
            },
            height: {
                default: null,
                parseHTML: (element) => parseDimension(element, 'height'),
                renderHTML: (attributes) => renderDimension('height', attributes.height)
            },
            class: {
                default: null,
                parseHTML: (element) => cleanClassName(element.getAttribute('class')),
                renderHTML: (attributes) => (attributes.class ? { class: attributes.class } : {})
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'img[src]',
                getAttrs: (element) => (isSafeUrl(element.getAttribute('src'), true) ? null : false)
            }
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['img', mergeAttributes(HTMLAttributes)];
    },

    addCommands() {
        return {
            insertImage: (attributes) => ({ commands }) => {
                return commands.insertContent({ type: this.name, attrs: attributes });
            }
        };
    }
});
