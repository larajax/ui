import { Node } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { cleanClassName } from '../html/utils.js';
import { defaultIcons } from '../icons.js';
import { h, icon } from '../ui/dom.js';

/**
 * Snippet elements whose properties panel is open.
 */
const editingSnippets = new WeakSet();

/**
 * Placeholder class, never saved with the content.
 */
const PLACEHOLDER_CLASS = 'rich-editor-snippet';

/**
 * isSnippetEditing checks whether a snippet's properties are open.
 */
export function isSnippetEditing(element) {
    return editingSnippets.has(element);
}

/**
 * Editing attributes, stripped from saved content.
 */
const EDITOR_ATTRIBUTES = new Set([
    'contenteditable',
    'tabindex',
    'draggable',
    'data-control',
    'data-ui-block',
    'data-name',
    'data-inspector-handler-alias',
    'data-inspector-id',
    'data-inspector-class',
    'data-inspector-css-class',
    'data-property-inspectorclassname',
    'data-property-inspectorproperty'
]);

/**
 * readSnippetAttributes collects a snippet's saved attributes.
 */
export function readSnippetAttributes(element) {
    const result = {};

    Array.from(element.attributes).forEach((attribute) => {
        if (EDITOR_ATTRIBUTES.has(attribute.name)) {
            return;
        }

        if (attribute.name === 'class') {
            const className = cleanClassName(attribute.value, [PLACEHOLDER_CLASS]);
            if (className) {
                result.class = className;
            }
            return;
        }

        result[attribute.name] = attribute.value;
    });

    return result;
}

/**
 * sameAttributes compares two attribute maps.
 */
function sameAttributes(first, second) {
    const firstKeys = Object.keys(first || {});
    const secondKeys = Object.keys(second || {});

    return firstKeys.length === secondKeys.length && firstKeys.every((key) => first[key] === second[key]);
}

/**
 * SnippetView mounts a snippet with mountSnippet, or a placeholder.
 */
class SnippetView {
    constructor({ node, editor, getPos }, tagName, options) {
        this.node = node;
        this.editor = editor;
        this.getPos = getPos;
        this.options = options;

        this.dom = document.createElement(tagName);
        this.renderAttributes();
        this.dom.setAttribute('contenteditable', 'false');
        this.dom.textContent = '\u00a0';

        const mountSnippet = options.hooks && options.hooks.mountSnippet;
        this.isPlaceholder = !mountSnippet;
        this.release = mountSnippet
            ? mountSnippet(this.dom, {
                changed: () => this.onPropertiesChanged(),
                opened: () => this.onPropertiesOpened(),
                closed: () => this.onPropertiesClosed()
            })
            : null;

        if (this.isPlaceholder) {
            this.renderPlaceholder();
        }
    }

    /**
     * renderPlaceholder labels the snippet with its icon, code and class.
     */
    renderPlaceholder() {
        const attributes = this.node.attrs.attributes || {};
        const icons = this.options.icons || {};
        const name = attributes['data-snippet'] || (this.options.trans ? this.options.trans('snippet') : 'Snippet');
        const component = attributes['data-component'];
        const children = [
            icon(icons.snippet || defaultIcons.snippet),
            h('span', { className: 'rich-editor-snippet-name', text: name })
        ];

        if (component) {
            children.push(h('span', { className: 'rich-editor-snippet-component', title: component, text: component }));
        }

        this.dom.classList.add(PLACEHOLDER_CLASS);
        this.dom.replaceChildren(...children);
    }

    renderAttributes() {
        const attributes = this.node.attrs.attributes || {};

        Array.from(this.dom.attributes).forEach((attribute) => {
            if (!EDITOR_ATTRIBUTES.has(attribute.name) && attribute.name !== 'class' && attributes[attribute.name] === undefined) {
                this.dom.removeAttribute(attribute.name);
            }
        });

        Object.keys(attributes).forEach((name) => {
            if (name === 'class') {
                attributes.class.split(/\s+/).forEach((className) => this.dom.classList.add(className));
            }
            else if (this.dom.getAttribute(name) !== attributes[name]) {
                this.dom.setAttribute(name, attributes[name]);
            }
        });
    }

    update(node) {
        if (node.type !== this.node.type) {
            return false;
        }

        this.node = node;
        this.renderAttributes();

        if (this.isPlaceholder) {
            this.renderPlaceholder();
        }

        return true;
    }

    ignoreMutation() {
        return true;
    }

    destroy() {
        editingSnippets.delete(this.dom);

        if (typeof this.release === 'function') {
            this.release();
        }
    }

    onPropertiesOpened() {
        editingSnippets.add(this.dom);
        this.notifyToggle();
    }

    /**
     * onPropertiesClosed saves the properties and restores focus.
     */
    onPropertiesClosed() {
        editingSnippets.delete(this.dom);
        this.onPropertiesChanged();
        this.notifyToggle();

        setTimeout(() => {
            const active = document.activeElement;
            if (!this.editor.isDestroyed && (!active || active === document.body)) {
                this.editor.commands.focus(null, { scrollIntoView: false });
            }
        }, 0);
    }

    notifyToggle() {
        if (this.options.onToggle) {
            this.options.onToggle();
        }
    }

    onPropertiesChanged() {
        const position = this.getPos();
        if (typeof position !== 'number') {
            return;
        }

        const attributes = readSnippetAttributes(this.dom);
        if (sameAttributes(attributes, this.node.attrs.attributes)) {
            return;
        }

        const { tr } = this.editor.state;
        tr.setNodeMarkup(position, undefined, { ...this.node.attrs, attributes });
        this.editor.view.dispatch(tr);
    }
}

/**
 * createSnippetNode builds a block or inline snippet node type.
 */
function createSnippetNode({ name, tagName, inline }) {
    return Node.create({
        name,

        group: inline ? 'inline' : 'block',

        inline,

        atom: true,

        draggable: true,

        selectable: true,

        addOptions() {
            return {
                hooks: {},
                icons: {},
                trans: null,
                onToggle: null
            };
        },

        addAttributes() {
            return {
                attributes: {
                    default: {},
                    parseHTML: (element) => readSnippetAttributes(element),
                    renderHTML: (attributes) => attributes.attributes || {}
                }
            };
        },

        parseHTML() {
            return [{ tag: tagName + '[data-snippet]', priority: 100 }];
        },

        renderHTML({ HTMLAttributes }) {
            return [tagName, HTMLAttributes, '\u00a0'];
        },

        addNodeView() {
            return (props) => new SnippetView(props, tagName, this.options);
        },

        addKeyboardShortcuts() {
            return {
                // Space opens a selected snippet's properties
                Space: () => {
                    const { selection } = this.editor.state;
                    const element = selection instanceof NodeSelection && selection.node.type.name === name
                        ? this.editor.view.nodeDOM(selection.from)
                        : null;

                    const editSnippet = this.options.hooks && this.options.hooks.editSnippet;
                    return !!element && !!editSnippet && editSnippet(element) !== false;
                }
            };
        }
    });
}

/**
 * SnippetBlock is a block snippet, stored as figure[data-snippet].
 */
export const SnippetBlock = createSnippetNode({ name: 'snippetBlock', tagName: 'figure', inline: false });

/**
 * SnippetInline is stored as span[data-snippet][data-ui-block-inline].
 */
export const SnippetInline = createSnippetNode({ name: 'snippetInline', tagName: 'span', inline: true });
