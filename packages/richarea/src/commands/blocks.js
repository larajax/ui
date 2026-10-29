import { hasClass, toggleClass } from '../html/utils.js';
import { currentTextblock, insertionChain, updateTextblocks } from './helpers.js';

/**
 * isFormatActive checks a paragraph format key (N, H1 to H6, PRE) against the selection.
 */
function isFormatActive(re, key) {
    const { editor } = re;
    const heading = /^H([1-6])$/.exec(key);

    if (heading) {
        return editor.isActive('heading', { level: parseInt(heading[1], 10) });
    }

    if (key === 'PRE') {
        return editor.isActive('codeBlock');
    }

    if (key === 'N') {
        return editor.isActive('paragraph');
    }

    return false;
}

/**
 * setFormat applies a paragraph format key to the selected blocks.
 */
function setFormat(re, key) {
    const chain = re.editor.chain().focus();
    const heading = /^H([1-6])$/.exec(key);

    if (heading) {
        return chain.setHeading({ level: parseInt(heading[1], 10) }).run();
    }

    if (key === 'PRE') {
        return chain.setCodeBlock().run();
    }

    return chain.setParagraph().run();
}

/**
 * currentAlignment returns the text alignment of the block holding the selection.
 */
function currentAlignment(re) {
    const block = currentTextblock(re.editor);
    return (block && block.attrs.textAlign) || 'left';
}

/**
 * alignButton defines a text alignment button, where left clears the alignment since it is the default.
 */
function alignButton(label, alignment, shortcut) {
    return {
        label,
        shortcut,
        isActive: (re) => currentAlignment(re) === alignment,
        run: (re) => {
            const chain = re.editor.chain().focus();
            return (alignment === 'left' ? chain.unsetTextAlign() : chain.setTextAlign(alignment)).run();
        }
    };
}

export const blockButtons = {
    paragraphFormat: {
        label: 'paragraphFormat',
        checkable: true,
        getLabel: (re) => {
            const formats = re.options.paragraphFormat;
            const key = Object.keys(formats).find((name) => isFormatActive(re, name));
            return key ? formats[key] : formats.N || re.trans('formatNormal');
        },
        menu: (re) => Object.keys(re.options.paragraphFormat).map((key) => ({
            label: re.options.paragraphFormat[key],
            active: isFormatActive(re, key),
            className: 'is-format-' + key.toLowerCase(),
            run: () => setFormat(re, key)
        }))
    },

    paragraphStyle: {
        label: 'paragraphStyle',
        checkable: true,
        menu: (re) => {
            const block = currentTextblock(re.editor);
            const current = block ? block.attrs.class : null;

            return Object.keys(re.options.paragraphStyles).map((className) => ({
                label: re.options.paragraphStyles[className],
                active: hasClass(current, className),
                run: () => {
                    const enable = !hasClass(current, className);
                    updateTextblocks(re.editor, (attributes) => ({
                        class: toggleClass(attributes.class, className, enable)
                    }));
                }
            }));
        }
    },

    align: {
        label: 'align',
        buttons: ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify']
    },

    alignLeft: alignButton('alignLeft', 'left', 'Mod-Shift-l'),
    alignCenter: alignButton('alignCenter', 'center', 'Mod-Shift-e'),
    alignRight: alignButton('alignRight', 'right', 'Mod-Shift-r'),
    alignJustify: alignButton('alignJustify', 'justify', 'Mod-Shift-j'),

    formatOL: {
        label: 'formatOL',
        shortcut: 'Mod-Shift-7',
        isActive: (re) => re.editor.isActive('orderedList'),
        run: (re) => re.editor.chain().focus().toggleOrderedList().run()
    },

    formatUL: {
        label: 'formatUL',
        shortcut: 'Mod-Shift-8',
        isActive: (re) => re.editor.isActive('bulletList'),
        run: (re) => re.editor.chain().focus().toggleBulletList().run()
    },

    outdent: {
        label: 'outdent',
        shortcut: 'Shift-Tab',
        isDisabled: (re) => !re.editor.can().liftListItem('listItem'),
        run: (re) => re.editor.chain().focus().liftListItem('listItem').run()
    },

    indent: {
        label: 'indent',
        shortcut: 'Tab',
        isDisabled: (re) => !re.editor.can().sinkListItem('listItem'),
        run: (re) => re.editor.chain().focus().sinkListItem('listItem').run()
    },

    quote: {
        label: 'quote',
        shortcut: 'Mod-Shift-b',
        isActive: (re) => re.editor.isActive('blockquote'),
        run: (re) => re.editor.chain().focus().toggleBlockquote().run()
    },

    insertHR: {
        label: 'insertHR',
        run: (re) => insertionChain(re.editor).setHorizontalRule().run()
    }
};
