import { Node } from '@tiptap/core';
import { cleanClassName, isRemoteUrl } from '../html/utils.js';

/**
 * MediaFigure is a video or audio placeholder, stored as figure[data-video] or
 * figure[data-audio] and rendered into a player by the server.
 */
export const MediaFigure = Node.create({
    name: 'mediaFigure',

    group: 'block',

    atom: true,

    draggable: true,

    selectable: true,

    addAttributes() {
        return {
            type: {
                default: 'video',
                parseHTML: (element) => (element.hasAttribute('data-audio') ? 'audio' : 'video'),
                renderHTML: () => ({})
            },
            src: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-video') || element.getAttribute('data-audio'),
                renderHTML: () => ({})
            },
            label: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-label'),
                renderHTML: () => ({})
            }
        };
    },

    parseHTML() {
        return [
            { tag: 'figure[data-video]', priority: 60 },
            { tag: 'figure[data-audio]', priority: 60 }
        ];
    },

    renderHTML({ node }) {
        const attributes = {
            ['data-' + (node.attrs.type === 'audio' ? 'audio' : 'video')]: node.attrs.src
        };

        if (node.attrs.label) {
            attributes['data-label'] = node.attrs.label;
        }

        return ['figure', attributes, '\u00a0'];
    },

    addCommands() {
        return {
            insertMediaFigure: (attributes) => ({ commands }) => {
                return commands.insertContent({ type: this.name, attrs: attributes });
            }
        };
    }
});

/**
 * Iframe is an embedded frame from pasted embedding code, previewed behind an overlay so
 * clicks select it instead of interacting with the frame.
 */
export const Iframe = Node.create({
    name: 'iframe',

    group: 'block',

    atom: true,

    draggable: true,

    selectable: true,

    addAttributes() {
        return {
            src: { default: null },
            width: { default: null },
            height: { default: null },
            title: { default: null },
            allow: { default: null },
            allowfullscreen: {
                default: false,
                parseHTML: (element) => element.hasAttribute('allowfullscreen'),
                renderHTML: (attributes) => (attributes.allowfullscreen ? { allowfullscreen: '' } : {})
            },
            frameborder: { default: null },
            referrerpolicy: { default: null },
            loading: { default: null },
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
                tag: 'iframe[src]',
                getAttrs: (element) => (isRemoteUrl(element.getAttribute('src')) ? null : false)
            }
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['iframe', HTMLAttributes];
    },

    addNodeView() {
        return ({ node: initialNode, HTMLAttributes }) => {
            let currentNode = initialNode;
            const dom = document.createElement('div');
            dom.className = 'rich-editor-embed';
            dom.setAttribute('contenteditable', 'false');

            const frame = document.createElement('iframe');
            const overlay = document.createElement('div');
            overlay.className = 'rich-editor-embed-overlay';

            Object.keys(HTMLAttributes).forEach((name) => {
                if (HTMLAttributes[name] !== null && HTMLAttributes[name] !== undefined) {
                    frame.setAttribute(name, HTMLAttributes[name]);
                }
            });

            dom.append(frame, overlay);

            return {
                dom,
                update: (node) => {
                    if (node.type !== currentNode.type || !node.sameMarkup(currentNode)) {
                        return false;
                    }

                    currentNode = node;
                    return true;
                },
                ignoreMutation: () => true
            };
        };
    },

    addCommands() {
        return {
            insertIframe: (attributes) => ({ commands }) => {
                return commands.insertContent({ type: this.name, attrs: attributes });
            }
        };
    }
});
