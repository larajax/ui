import { findParentNode } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';

/**
 * selectedNode returns the node of a node selection, optionally limited to type names.
 */
export function selectedNode(editor, typeNames) {
    const { selection } = editor.state;
    if (!(selection instanceof NodeSelection)) {
        return null;
    }

    if (typeNames && !typeNames.includes(selection.node.type.name)) {
        return null;
    }

    return selection.node;
}

/**
 * selectedNodeElement returns the DOM element of the selected node.
 */
export function selectedNodeElement(editor) {
    const { selection } = editor.state;
    if (!(selection instanceof NodeSelection)) {
        return null;
    }

    const element = editor.view.nodeDOM(selection.from);
    return element && element.nodeType === Node.ELEMENT_NODE ? element : null;
}

/**
 * insertionChain starts a command chain for inserting content, moving past a selected block
 * such as a figure or frame so inserting adds after it instead of replacing it.
 */
export function insertionChain(editor) {
    const { selection } = editor.state;
    const chain = editor.chain().focus();

    if (selection instanceof NodeSelection && selection.node.isBlock) {
        return chain
            .insertContentAt(selection.to, { type: 'paragraph' })
            .setTextSelection(selection.to + 1);
    }

    return chain;
}

/**
 * updateSelectedNode changes the attributes of the selected node and keeps it selected,
 * since leaf nodes are replaced on update and would otherwise lose the selection.
 */
export function updateSelectedNode(editor, attributes) {
    return editor.chain().focus().command(({ tr, state }) => {
        const { selection } = state;
        if (!(selection instanceof NodeSelection)) {
            return false;
        }

        tr.setNodeMarkup(selection.from, undefined, { ...selection.node.attrs, ...attributes });
        tr.setSelection(NodeSelection.create(tr.doc, selection.from));

        return true;
    }).run();
}

/**
 * parentNode finds the closest ancestor of the selection with a type name.
 */
export function parentNode(editor, typeName) {
    return findParentNode((node) => node.type.name === typeName)(editor.state.selection);
}

/**
 * updateTextblocks changes the attributes of every paragraph and heading in the selection.
 */
export function updateTextblocks(editor, update) {
    return editor.chain().focus().command(({ tr, state }) => {
        const { from, to } = state.selection;
        let changed = false;

        state.doc.nodesBetween(from, to, (node, position) => {
            if (!node.isTextblock || !['paragraph', 'heading'].includes(node.type.name)) {
                return;
            }

            const attributes = update(node.attrs);
            if (attributes) {
                tr.setNodeMarkup(position, undefined, { ...node.attrs, ...attributes });
                changed = true;
            }
        });

        return changed;
    }).run();
}

/**
 * currentTextblock returns the paragraph or heading holding the selection start.
 */
export function currentTextblock(editor) {
    const { $from } = editor.state.selection;

    for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);
        if (node.isTextblock) {
            return node;
        }
    }

    return null;
}

/**
 * selectionRect returns the viewport rectangle of the selection, used to anchor popovers.
 */
export function selectionRect(editor) {
    const { view, state } = editor;
    const element = selectedNodeElement(editor);

    if (element) {
        return element.getBoundingClientRect();
    }

    const start = view.coordsAtPos(state.selection.from);
    const end = view.coordsAtPos(state.selection.to);

    return {
        left: Math.min(start.left, end.left),
        right: Math.max(start.right, end.right),
        top: Math.min(start.top, end.top),
        bottom: Math.max(start.bottom, end.bottom),
        width: Math.abs(end.right - start.left),
        height: Math.max(start.bottom, end.bottom) - Math.min(start.top, end.top)
    };
}
