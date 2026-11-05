import { Extension, Mark, Node, mergeAttributes } from '@tiptap/core';
import { cleanClassName, parseList } from '../html/utils.js';

/*
 * Passthrough keeps HTML the editor has no tools for, for content written by hand. It is off
 * unless the allowTags option lists tags, which mirrors the allowed tags setting of earlier
 * editors:
 *
 * - allowTags: tags kept, as containers of blocks or text, as marks around text, or whole
 * - allowAttrs: attributes kept on any element, all when empty; names may end in * as in data-*
 * - allowEmptyTags: tags or .class names kept when empty, such as icon fonts
 * - noWrapTags: tags whose text is kept without a paragraph inside them
 *
 * Tags the editor has its own tools for, such as paragraphs, lists, links and tables, keep their
 * other attributes too.
 */

// Elements kept as containers, holding text directly or other blocks
const BLOCK_TAGS = new Set([
    'address', 'article', 'aside', 'center', 'dd', 'details', 'dialog', 'div', 'dl', 'dt', 'fieldset',
    'figcaption', 'footer', 'header', 'hgroup', 'legend', 'main', 'nav', 'search', 'section', 'summary'
]);

// Elements kept as marks around text
const INLINE_TAGS = new Set([
    'abbr', 'acronym', 'b', 'bdi', 'bdo', 'big', 'cite', 'data', 'del', 'dfn', 'em', 'font', 'i', 'ins',
    'kbd', 'label', 'mark', 'q', 'samp', 'small', 'span', 'strong', 'time', 'tt', 'u', 'var'
]);

// Elements kept whole, since what they hold isn't text to edit, as blocks or inside text
const RAW_BLOCK_TAGS = new Set([
    'audio', 'canvas', 'embed', 'form', 'map', 'math', 'menu', 'noscript', 'object', 'picture', 'script',
    'style', 'svg', 'template', 'video'
]);

const RAW_INLINE_TAGS = new Set(['button', 'input', 'keygen', 'meter', 'output', 'progress', 'select', 'textarea']);

// Tags with their own tools, the editor's attributes for each, and its kinds of content
const TOOL_ATTRIBUTES = {
    paragraph: ['class', 'id'],
    heading: ['class', 'id'],
    blockquote: ['class'],
    bulletList: ['class'],
    orderedList: ['class', 'start', 'type'],
    listItem: ['class'],
    horizontalRule: ['class'],
    codeBlock: ['class'],
    table: ['class', 'style'],
    tableRow: ['class'],
    tableCell: ['class', 'colspan', 'rowspan', 'colwidth', 'style'],
    tableHeader: ['class', 'colspan', 'rowspan', 'colwidth', 'style'],
    image: ['src', 'alt', 'title', 'width', 'height', 'class'],
    link: ['href', 'target', 'rel', 'class']
};

// Style properties the editor's own tools set, left out of a kept style
const TOOL_STYLE_PROPERTIES = {
    paragraph: ['text-align'],
    heading: ['text-align']
};

// Attributes editors add while editing, never kept
const RUNTIME_ATTRIBUTES = new Set(['contenteditable', 'draggable', 'tabindex', 'spellcheck', 'data-ui-block']);

/**
 * makePassthroughSettings turns the options into the lookups the passthrough uses, or null when off.
 */
export function makePassthroughSettings(options) {
    const allowTags = parseList(options.allowTags);
    if (!allowTags.length) {
        return null;
    }

    return {
        allowTags: new Set(allowTags),
        allowAttrs: parseList(options.allowAttrs),
        allowEmptyTags: parseList(options.allowEmptyTags),
        noWrapTags: new Set(parseList(options.noWrapTags))
    };
}

function isAllowedAttribute(settings, name) {
    if (RUNTIME_ATTRIBUTES.has(name) || name.startsWith('on')) {
        return false;
    }

    if (!settings.allowAttrs.length) {
        return true;
    }

    return settings.allowAttrs.some((pattern) => (pattern.endsWith('*')
        ? name.startsWith(pattern.slice(0, -1))
        : name === pattern));
}

/**
 * captureAttributes returns the attributes an element keeps, leaving out those the editor sets itself.
 */
function captureAttributes(settings, element, skip = [], skipStyles = []) {
    const result = {};

    for (const { name, value } of Array.from(element.attributes)) {
        const lower = name.toLowerCase();
        if (skip.includes(lower) || !isAllowedAttribute(settings, lower)) {
            continue;
        }

        if (lower === 'class') {
            result[name] = cleanClassName(value);
        }
        else if (lower === 'style' && skipStyles.length) {
            result[name] = withoutStyleProperties(value, skipStyles);
        }
        else {
            result[name] = value;
        }

        if (result[name] === null || result[name] === '' && (lower === 'class' || lower === 'style')) {
            delete result[name];
        }
    }

    return Object.keys(result).length ? result : null;
}

function withoutStyleProperties(style, properties) {
    return String(style).split(';')
        .map((declaration) => declaration.trim())
        .filter((declaration) => declaration && !properties.includes(declaration.split(':')[0].trim().toLowerCase()))
        .join('; ');
}

function hasBlockChildren(element) {
    return Array.from(element.children).some((child) => {
        const tag = child.tagName.toLowerCase();
        return BLOCK_TAGS.has(tag) || RAW_BLOCK_TAGS.has(tag) || /^(p|h[1-6]|ul|ol|table|blockquote|pre|hr|figure|iframe)$/.test(tag);
    });
}

function isEmptyElement(element) {
    return !element.children.length && !element.textContent.trim();
}

function allowedTags(settings, set) {
    return Array.from(settings.allowTags).filter((tag) => set.has(tag));
}

// The empty element matches an entry of allowEmptyTags, a tag name or a .class name
function emptyRuleSelectors(settings) {
    return settings.allowEmptyTags.map((entry) => (entry.startsWith('.') ? '*' + entry : entry));
}

function tagAttributes(settings) {
    return {
        tag: { default: 'div', rendered: false },
        htmlAttributes: { default: null, rendered: false, keepOnSplit: false }
    };
}

function renderTag(node) {
    return [node.attrs.tag, mergeAttributes(node.attrs.htmlAttributes || {})];
}

/**
 * HtmlBlock keeps a container holding other blocks, such as a div around paragraphs.
 */
const HtmlBlock = Node.create({
    name: 'htmlBlock',
    group: 'block',
    content: 'block+',
    defining: true,

    addOptions() {
        return { settings: null };
    },

    addAttributes() {
        return tagAttributes(this.options.settings);
    },

    parseHTML() {
        const settings = this.options.settings;

        return allowedTags(settings, BLOCK_TAGS).map((tag) => ({
            tag,
            priority: 20,
            getAttrs: (element) => ({ tag, htmlAttributes: captureAttributes(settings, element) })
        }));
    },

    renderHTML({ node }) {
        return [...renderTag(node), 0];
    }
});

/**
 * HtmlTextBlock keeps a container holding text directly, such as a div with a line of text, so the
 * text isn't moved into a paragraph.
 */
const HtmlTextBlock = Node.create({
    name: 'htmlTextBlock',
    group: 'block',
    content: 'inline*',
    defining: true,

    addOptions() {
        return { settings: null };
    },

    addAttributes() {
        return tagAttributes(this.options.settings);
    },

    parseHTML() {
        const settings = this.options.settings;
        const tags = new Set(allowedTags(settings, BLOCK_TAGS).concat(Array.from(settings.noWrapTags).filter((tag) => settings.allowTags.has(tag))));

        return Array.from(tags).map((tag) => ({
            tag,
            priority: 21,
            getAttrs: (element) => {
                if (hasBlockChildren(element) || (isEmptyElement(element) && !settings.noWrapTags.has(tag))) {
                    return false;
                }

                return { tag, htmlAttributes: captureAttributes(settings, element) };
            }
        }));
    },

    renderHTML({ node }) {
        return [...renderTag(node), 0];
    }
});

/**
 * HtmlInline keeps an element around text, such as an abbr, or a span with attributes beyond the
 * class and style the editor's own tools set.
 */
const HtmlInline = Mark.create({
    name: 'htmlInline',
    excludes: '',
    spanning: false,

    addOptions() {
        return { settings: null };
    },

    addAttributes() {
        return tagAttributes(this.options.settings);
    },

    parseHTML() {
        const settings = this.options.settings;

        return allowedTags(settings, INLINE_TAGS).map((tag) => ({
            tag,
            // Ahead of the editor's own marks for the same tag only when it carries more than they keep
            priority: 60,
            getAttrs: (element) => {
                if (element.hasAttribute('data-snippet')) {
                    return false;
                }

                const htmlAttributes = captureAttributes(settings, element);
                const extra = htmlAttributes && Object.keys(htmlAttributes).some((name) => name !== 'class' && name !== 'style');
                const ownTool = ['b', 'strong', 'i', 'em', 'u', 'del', 'span'].includes(tag);

                if (ownTool && !extra) {
                    return false;
                }

                return { tag, htmlAttributes };
            }
        }));
    },

    renderHTML({ mark }) {
        return [mark.attrs.tag, mergeAttributes(mark.attrs.htmlAttributes || {}), 0];
    }
});

/**
 * HtmlEmpty keeps an empty element listed in allowEmptyTags, such as an icon font element.
 */
const HtmlEmpty = Node.create({
    name: 'htmlEmpty',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,

    addOptions() {
        return { settings: null };
    },

    addAttributes() {
        return tagAttributes(this.options.settings);
    },

    parseHTML() {
        const settings = this.options.settings;

        return emptyRuleSelectors(settings).map((selector) => ({
            tag: selector,
            priority: 70,
            getAttrs: (element) => {
                const tag = element.tagName.toLowerCase();
                if (!isEmptyElement(element) || RAW_BLOCK_TAGS.has(tag) || BLOCK_TAGS.has(tag) || tag === 'iframe' || tag === 'img') {
                    return false;
                }

                return { tag, htmlAttributes: captureAttributes(settings, element) };
            }
        }));
    },

    renderHTML({ node }) {
        return renderTag(node);
    }
});

/**
 * rawHtmlNode makes a node keeping an element whole, shown as a labelled placeholder so a form or
 * script in the content never runs inside the editor.
 */
function rawHtmlNode(name, inline, tags) {
    return Node.create({
        name,
        group: inline ? 'inline' : 'block',
        inline,
        atom: true,
        selectable: true,
        draggable: !inline,

        addOptions() {
            return { settings: null };
        },

        addAttributes() {
            return {
                html: { default: '', rendered: false }
            };
        },

        parseHTML() {
            const settings = this.options.settings;

            return allowedTags(settings, tags).map((tag) => ({
                tag,
                priority: 15,
                getAttrs: (element) => ({ html: element.outerHTML })
            }));
        },

        renderHTML({ node }) {
            const template = document.createElement('template');
            template.innerHTML = node.attrs.html;

            return template.content.firstElementChild || ['span'];
        },

        addNodeView() {
            return ({ node }) => {
                const template = document.createElement('template');
                template.innerHTML = node.attrs.html;
                const element = template.content.firstElementChild;
                const label = element ? '<' + element.tagName.toLowerCase() + '>' : '<html>';

                const dom = document.createElement(inline ? 'span' : 'div');
                dom.className = 'rich-editor-raw-html' + (inline ? ' is-inline' : '');
                dom.textContent = label;
                dom.setAttribute('contenteditable', 'false');
                dom.title = (element && element.textContent.trim().slice(0, 200)) || label;

                return { dom };
            };
        }
    });
}

const HtmlRawBlock = rawHtmlNode('htmlRawBlock', false, RAW_BLOCK_TAGS);
const HtmlRawInline = rawHtmlNode('htmlRawInline', true, RAW_INLINE_TAGS);

/**
 * KeepAttributes keeps the other allowed attributes of the elements the editor has tools for.
 */
const KeepAttributes = Extension.create({
    name: 'keepAttributes',

    addOptions() {
        return { settings: null };
    },

    addGlobalAttributes() {
        const settings = this.options.settings;

        return Object.keys(TOOL_ATTRIBUTES).map((type) => ({
            types: [type],
            attributes: {
                htmlAttributes: {
                    default: null,
                    keepOnSplit: false,
                    parseHTML: (element) => captureAttributes(settings, element, TOOL_ATTRIBUTES[type], TOOL_STYLE_PROPERTIES[type] || []),
                    renderHTML: (attributes) => attributes.htmlAttributes || {}
                }
            }
        }));
    }
});

/**
 * passthroughExtensions returns the extensions keeping unknown HTML, none when the options leave it off.
 */
export function passthroughExtensions(options) {
    const settings = makePassthroughSettings(options);
    if (!settings) {
        return [];
    }

    return [
        HtmlBlock.configure({ settings }),
        HtmlTextBlock.configure({ settings }),
        HtmlInline.configure({ settings }),
        HtmlEmpty.configure({ settings }),
        HtmlRawBlock.configure({ settings }),
        HtmlRawInline.configure({ settings }),
        KeepAttributes.configure({ settings })
    ];
}
