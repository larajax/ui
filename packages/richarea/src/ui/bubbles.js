import { ButtonGroup } from './buttons.js';
import { applyTheme, h, mountRoot } from './dom.js';
import { placePanel } from './floating.js';
import { parentNode, selectedNode, selectedNodeElement } from '../commands/helpers.js';
import { isSnippetEditing } from '../extensions/snippet.js';

/**
 * linkRect finds the rectangle of the link around the selection.
 */
function linkRect(re) {
    const { view, state } = re.editor;
    const { node, offset } = view.domAtPos(state.selection.from);

    let element = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node.childNodes[offset] || node);
    if (element && element.nodeType !== Node.ELEMENT_NODE) {
        element = element.parentElement;
    }

    const link = element && element.closest ? element.closest('a') : null;
    if (link && view.dom.contains(link)) {
        return link.getBoundingClientRect();
    }

    const coords = view.coordsAtPos(state.selection.from);
    return { left: coords.left, right: coords.right, top: coords.top, bottom: coords.bottom, width: 0, height: coords.bottom - coords.top };
}

/**
 * tableRect returns the rectangle of the table around the selection.
 */
function tableRect(re) {
    const table = parentNode(re.editor, 'table');
    const element = table ? re.editor.view.nodeDOM(table.pos) : null;

    return element && element.getBoundingClientRect ? element.getBoundingClientRect() : null;
}

/**
 * nodeRect returns the rectangle of the selected node.
 */
function nodeRect(re) {
    const element = selectedNodeElement(re.editor);
    return element ? element.getBoundingClientRect() : null;
}

/**
 * imageRect returns the rectangle of the selected image, grown to keep clear of the resize handles.
 */
function imageRect(re) {
    const rect = nodeRect(re);
    if (!rect) {
        return null;
    }

    return {
        left: rect.left,
        right: rect.right,
        width: rect.width,
        top: rect.top - 6,
        bottom: rect.bottom + 6,
        height: rect.height + 12
    };
}

/**
 * Contextual toolbars, the first match for the selection is shown.
 */
const BUBBLES = [
    {
        name: 'image',
        buttons: ['imageReplace', 'imageAlign', 'imageStyle', 'imageAlt', 'imageSize', 'imageLink', '|', 'nodeRemove'],
        match: (re) => selectedNode(re.editor, ['image']),
        rect: imageRect
    },
    {
        name: 'snippet',
        buttons: ['snippetProperties', '|', 'nodeRemove'],
        // Stands aside while the snippet properties panel is open, which takes the same spot
        match: (re) => {
            const element = selectedNode(re.editor, ['snippetBlock', 'snippetInline']) && selectedNodeElement(re.editor);
            return !!element && !isSnippetEditing(element);
        },
        rect: nodeRect
    },
    {
        name: 'embed',
        buttons: ['nodeRemove'],
        match: (re) => selectedNode(re.editor, ['mediaFigure', 'iframe']),
        rect: nodeRect
    },
    {
        name: 'link',
        buttons: ['linkOpen', 'linkEdit', 'linkStyle', '|', 'unlink'],
        match: (re) => re.editor.isActive('link'),
        rect: linkRect
    },
    {
        name: 'table',
        buttons: ['tableHeader', 'tableRows', 'tableColumns', 'tableCells', '|', 'tableStyle', 'tableCellStyle', '|', 'tableRemove'],
        match: (re) => re.editor.isActive('table'),
        rect: tableRect,
        placement: 'top-start'
    }
];

/**
 * BubbleManager shows a small contextual toolbar next to links, images, tables, snippets and
 * embeds while the editor has focus.
 */
export class BubbleManager {
    constructor(richArea) {
        this.richArea = richArea;
        this.current = null;
        this.instances = {};

        this.onViewportChange = this.onViewportChange.bind(this);
        window.addEventListener('resize', this.onViewportChange);
        window.addEventListener('scroll', this.onViewportChange, true);
    }

    update() {
        const re = this.richArea;
        const enabled = re.editor.isEditable && !re.sourceView.isActive() && !re.resizer.isResizing() && re.hasFocus();
        const definition = enabled ? BUBBLES.find((bubble) => bubble.match(re)) : null;

        if (!definition) {
            this.hide();
            return;
        }

        const instance = this.getInstance(definition);
        if (this.current !== instance) {
            this.hide();
            this.current = instance;
            applyTheme(instance.element, re.root);
            instance.element.hidden = false;
        }

        instance.group.refresh();
        this.position();
    }

    getInstance(definition) {
        if (!this.instances[definition.name]) {
            const element = h('div', {
                className: 'rich-editor-bubble',
                role: 'toolbar',
                'data-bubble': definition.name,
                hidden: true
            });

            mountRoot(this.richArea.root).appendChild(element);

            this.instances[definition.name] = {
                definition,
                element,
                group: new ButtonGroup(this.richArea, element, definition.buttons)
            };
        }

        return this.instances[definition.name];
    }

    position() {
        if (!this.current) {
            return;
        }

        const rect = this.current.definition.rect(this.richArea);
        if (!rect) {
            this.hide();
            return;
        }

        this.current.element.style.visibility = this.isRectVisible(rect) ? '' : 'hidden';
        placePanel(this.current.element, rect, this.current.definition.placement || 'bottom-start');
    }

    /**
     * isRectVisible checks the target overlaps both the viewport and the editor body, so
     * bubbles for content scrolled out of view are hidden.
     */
    isRectVisible(rect) {
        const body = this.richArea.bodyElement.getBoundingClientRect();
        const top = Math.max(0, body.top);
        const bottom = Math.min(window.innerHeight, body.bottom);

        return rect.bottom > top && rect.top < bottom;
    }

    hide() {
        if (this.current) {
            this.current.element.hidden = true;
            this.current = null;
        }
    }

    contains(element) {
        return Object.values(this.instances).some((instance) => instance.element.contains(element));
    }

    onViewportChange() {
        if (this.current) {
            this.position();
        }
    }

    destroy() {
        window.removeEventListener('resize', this.onViewportChange);
        window.removeEventListener('scroll', this.onViewportChange, true);

        Object.values(this.instances).forEach((instance) => instance.element.remove());
        this.instances = {};
        this.current = null;
    }
}
