import { h, icon } from '../ui/dom.js';
import { insertionChain } from './helpers.js';

/**
 * markButton defines a toggle button for a text mark, with the key binding of the mark shown
 * in its tooltip.
 */
function markButton(label, markName, command, shortcut = null) {
    return {
        label,
        shortcut,
        isActive: (re) => re.editor.isActive(markName),
        run: (re) => re.editor.chain().focus()[command]().run()
    };
}

/**
 * colorPanel renders the text and background color swatches.
 */
function colorPanel(re, close) {
    let mode = 'text';
    const panel = h('div', { className: 'rich-editor-colors' });
    const tabs = h('div', { className: 'rich-editor-colors-tabs', role: 'tablist' });
    const grid = h('div', { className: 'rich-editor-colors-grid' });

    const apply = (color) => {
        const chain = re.editor.chain().focus();

        if (mode === 'text') {
            (color ? chain.setColor(color) : chain.unsetColor()).run();
        }
        else {
            (color ? chain.setBackgroundColor(color) : chain.unsetBackgroundColor()).run();
        }

        close();
    };

    const render = () => {
        const current = re.editor.getAttributes('textStyle')[mode === 'text' ? 'color' : 'backgroundColor'];

        tabs.querySelectorAll('button').forEach((tab) => {
            tab.classList.toggle('is-active', tab.dataset.mode === mode);
            tab.setAttribute('aria-selected', String(tab.dataset.mode === mode));
        });

        grid.replaceChildren(...re.options.colors.map((color) => h('button', {
            type: 'button',
            className: 'rich-editor-swatch' + (current && current.toLowerCase() === color.toLowerCase() ? ' is-active' : ''),
            title: color,
            'aria-label': color,
            style: { backgroundColor: color },
            onMousedown: (event) => event.preventDefault(),
            onClick: () => apply(color)
        })), h('button', {
            type: 'button',
            className: 'rich-editor-swatch is-remove',
            title: re.trans('removeColor'),
            'aria-label': re.trans('removeColor'),
            onMousedown: (event) => event.preventDefault(),
            onClick: () => apply(null)
        }, icon(re.options.icons.removeColor)));
    };

    [['text', 'textColor'], ['background', 'backgroundColor']].forEach(([value, label]) => {
        tabs.appendChild(h('button', {
            type: 'button',
            role: 'tab',
            'data-mode': value,
            text: re.trans(label),
            onMousedown: (event) => event.preventDefault(),
            onClick: () => {
                mode = value;
                render();
            }
        }));
    });

    render();
    panel.append(tabs, grid);

    return panel;
}

/**
 * emoticonPanel renders a grid of emoji characters.
 */
function emoticonPanel(re, close) {
    return h('div', { className: 'rich-editor-emoticons' }, re.options.emoticons.map((emoji) => h('button', {
        type: 'button',
        className: 'rich-editor-emoticon',
        text: emoji,
        onMousedown: (event) => event.preventDefault(),
        onClick: () => {
            insertionChain(re.editor).insertContent(emoji).run();
            close();
        }
    })));
}

/**
 * fontSizeValue returns the active font size without its unit.
 */
function fontSizeValue(re) {
    const size = re.editor.getAttributes('textStyle').fontSize;
    return size ? String(size).replace('px', '') : null;
}

export const formatButtons = {
    bold: markButton('bold', 'bold', 'toggleBold', 'Mod-b'),
    italic: markButton('italic', 'italic', 'toggleItalic', 'Mod-i'),
    underline: markButton('underline', 'underline', 'toggleUnderline', 'Mod-u'),
    strikeThrough: markButton('strikeThrough', 'strike', 'toggleStrike', 'Mod-Shift-s'),
    subscript: markButton('subscript', 'subscript', 'toggleSubscript'),
    superscript: markButton('superscript', 'superscript', 'toggleSuperscript'),

    inlineStyle: {
        label: 'inlineStyle',
        checkable: true,
        menu: (re) => Object.keys(re.options.inlineStyles).map((className) => ({
            label: re.options.inlineStyles[className],
            active: re.editor.isActive('inlineClass', { class: className }),
            run: () => re.editor.chain().focus().toggleInlineClass(className).run()
        }))
    },

    fontFamily: {
        label: 'fontFamily',
        checkable: true,
        menu: (re) => {
            const current = re.editor.getAttributes('textStyle').fontFamily;

            return [{
                label: re.trans('defaultFont'),
                active: !current,
                run: () => re.editor.chain().focus().unsetFontFamily().run()
            }].concat(Object.keys(re.options.fontFamily).map((family) => ({
                label: re.options.fontFamily[family],
                style: 'font-family: ' + family,
                active: current === family,
                run: () => re.editor.chain().focus().setFontFamily(family).run()
            })));
        }
    },

    fontSize: {
        label: 'fontSize',
        checkable: true,
        menu: (re) => {
            const current = fontSizeValue(re);

            return [{
                label: re.trans('defaultFont'),
                active: !current,
                run: () => re.editor.chain().focus().unsetFontSize().run()
            }].concat(re.options.fontSize.map((size) => ({
                label: String(size),
                active: current === String(size),
                run: () => re.editor.chain().focus().setFontSize(size + 'px').run()
            })));
        }
    },

    color: {
        label: 'color',
        panel: colorPanel
    },

    emoticons: {
        label: 'emoticons',
        panel: emoticonPanel
    },

    clearFormatting: {
        label: 'clearFormatting',
        run: (re) => re.editor.chain().focus().unsetAllMarks().run()
    }
};
