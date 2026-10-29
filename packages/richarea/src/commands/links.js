import { getMarkRange } from '@tiptap/core';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { hasClass, isSafeUrl, toggleClass } from '../html/utils.js';

/**
 * applyLink links the selection, or the link around the caret, to an address. Options:
 * - text replaces the linked text when given
 * - fallbackText is inserted when nothing is selected
 * - target and className set those link attributes
 */
export function applyLink(re, href, { text, fallbackText, target, className } = {}) {
    const { editor } = re;
    const { state } = editor;
    const { selection } = state;
    const linkType = state.schema.marks.link;
    const isTextSelection = selection instanceof TextSelection;
    let { from, to, empty } = selection;
    let existing = null;

    if (isTextSelection) {
        const range = getMarkRange(state.doc.resolve(from), linkType);

        if (range && range.from <= from && range.to >= to) {
            from = range.from;
            to = range.to;
            empty = false;
        }
    }

    state.doc.nodesBetween(from, to, (node) => {
        existing = existing || linkType.isInSet(node.marks);
    });

    const attributes = {
        ...(existing ? existing.attrs : {}),
        href,
        target: target === undefined ? (existing ? existing.attrs.target : null) : target
    };

    if (className !== undefined) {
        attributes.class = className;
    }

    // Nothing is selected, so the text is inserted as a new link, which also places it
    // correctly at a gap cursor between blocks
    if (empty) {
        const marks = (state.storedMarks || selection.$from.marks())
            .filter((mark) => mark.type !== linkType)
            .map((mark) => mark.toJSON());

        return editor.chain().focus().insertContent({
            type: 'text',
            text: text || fallbackText || href,
            marks: marks.concat({ type: 'link', attrs: attributes })
        }).run();
    }

    return editor.chain().focus().command(({ tr }) => {
        if (isTextSelection && text && text !== tr.doc.textBetween(from, to, ' ')) {
            const marks = tr.doc.resolve(from).marks().filter((mark) => mark.type !== linkType);
            tr.replaceWith(from, to, state.schema.text(text, marks));
            to = from + text.length;
            tr.setSelection(TextSelection.create(tr.doc, to));
        }

        tr.removeMark(from, to, linkType);
        tr.addMark(from, to, linkType.create(attributes));
        tr.setMeta('preventAutolink', true);

        return true;
    }).run();
}

/**
 * removeLink unlinks the link around the selection.
 */
export function removeLink(re) {
    return re.editor.chain().focus().extendMarkRange('link').unsetLink().run();
}

/**
 * linkText returns the text of the link around the selection, or the selected text.
 */
function linkText(re) {
    const { state } = re.editor;
    const linkType = state.schema.marks.link;
    const { from, to } = state.selection;

    if (state.selection instanceof NodeSelection) {
        return null;
    }

    const range = getMarkRange(state.doc.resolve(from), linkType);

    if (range && range.from <= from && range.to >= to) {
        return state.doc.textBetween(range.from, range.to, ' ');
    }

    return state.doc.textBetween(from, to, ' ');
}

/**
 * openLinkForm shows the link popover for inserting or editing a link.
 */
export function openLinkForm(re, anchor) {
    const { editor } = re;
    const attributes = editor.getAttributes('link');
    const isEditing = editor.isActive('link');
    const text = linkText(re);
    const fields = [
        {
            name: 'href',
            label: re.trans('url'),
            value: attributes.href || '',
            placeholder: 'https://',
            autofocus: true
        }
    ];

    if (text !== null) {
        fields.push({ name: 'text', label: re.trans('text'), value: text });
    }

    fields.push({ name: 'newTab', type: 'checkbox', label: re.trans('openInNewTab'), value: attributes.target === '_blank' });

    const actions = [];

    if (re.options.hooks.browseLinks) {
        actions.push({
            label: re.trans('browsePages'),
            run: () => browseLinks(re)
        });
    }

    if (isEditing) {
        actions.push({
            label: re.trans('remove'),
            className: 'is-danger',
            run: () => removeLink(re)
        });
    }

    re.openForm({
        fields,
        actions,
        submitLabel: re.trans(isEditing ? 'update' : 'insert'),
        onSubmit: (values) => {
            if (!values.href) {
                return re.trans('urlRequired');
            }

            if (!isSafeUrl(values.href)) {
                return re.trans('urlInvalid');
            }

            applyLink(re, values.href, {
                text: values.text,
                target: values.newTab ? '_blank' : null
            });
        }
    }, anchor);
}

/**
 * browseLinks picks an address with the link picker hook.
 */
export function browseLinks(re) {
    re.options.hooks.browseLinks({
        value: re.editor.getAttributes('link').href || '',
        onInsert: (item) => {
            if (!item || !item.url) {
                return;
            }

            applyLink(re, item.url, {
                fallbackText: item.title || item.url
            });
        }
    });
}

/**
 * resolveLinkUrl turns a stored link into a browsable address with the resolveLink hook.
 */
function resolveLinkUrl(re, href) {
    return re.options.hooks.resolveLink ? re.options.hooks.resolveLink(href) : href;
}

export const linkButtons = {
    insertLink: {
        label: 'insertLink',
        isActive: (re) => re.editor.isActive('link'),
        run: (re, context) => openLinkForm(re, context.anchor)
    },

    insertPageLink: {
        label: 'insertPageLink',
        shortcut: 'Mod-k',
        isActive: (re) => re.editor.isActive('link'),
        run: (re, context) => {
            if (re.options.hooks.browseLinks) {
                browseLinks(re);
            }
            else {
                openLinkForm(re, context.anchor);
            }
        }
    },

    linkOpen: {
        label: 'openLink',
        run: (re) => {
            const href = re.editor.getAttributes('link').href;
            if (href) {
                window.open(resolveLinkUrl(re, href), '_blank', 'noopener');
            }
        }
    },

    linkEdit: {
        label: 'editLink',
        run: (re, context) => openLinkForm(re, context.anchor)
    },

    linkStyle: {
        label: 'linkStyle',
        checkable: true,
        isDisabled: (re) => !Object.keys(re.options.linkStyles).length,
        menu: (re) => {
            const current = re.editor.getAttributes('link').class;

            return Object.keys(re.options.linkStyles).map((className) => ({
                label: re.options.linkStyles[className],
                active: hasClass(current, className),
                run: () => {
                    const href = re.editor.getAttributes('link').href;
                    applyLink(re, href, { className: toggleClass(current, className) });
                }
            }));
        }
    },

    unlink: {
        label: 'unlink',
        run: (re) => removeLink(re)
    }
};
