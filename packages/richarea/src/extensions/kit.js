import { StarterKit } from '@tiptap/starter-kit';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Color, BackgroundColor, FontFamily, FontSize } from '@tiptap/extension-text-style';
import { Placeholder } from '@tiptap/extensions';
import { PreservedAttributes, InlineClass, LineBreaks } from './attributes.js';
import { Image } from './image.js';
import { Link, linkProtocolValidator } from './link.js';
import { TextAlign } from './textalign.js';
import { TextStyle } from './textstyle.js';
import { MediaFigure, Iframe } from './media.js';
import { SnippetBlock, SnippetInline } from './snippet.js';
import { Table, TableRow, TableCell, TableHeader } from './table.js';

/**
 * buildExtensions assembles the schema and behavior extensions for an editor instance.
 */
export function buildExtensions(options, richArea) {
    const snippetOptions = {
        hooks: options.hooks,
        icons: options.icons,
        trans: richArea.trans,
        onToggle: () => richArea.refreshUi()
    };

    const extensions = [
        StarterKit.configure({
            heading: {
                levels: [1, 2, 3, 4, 5, 6]
            },
            link: false,
            dropcursor: {
                class: 'rich-editor-dropcursor',
                width: 2
            },
            trailingNode: false
        }),
        Link.configure({
            isAllowedUri: linkProtocolValidator(options.linkProtocols || [])
        }),
        TextAlign.configure({
            types: ['heading', 'paragraph']
        }),
        Subscript,
        Superscript,
        TextStyle,
        Color,
        BackgroundColor,
        FontFamily,
        FontSize,
        PreservedAttributes,
        InlineClass,
        Image,
        MediaFigure,
        Iframe,
        SnippetBlock.configure(snippetOptions),
        SnippetInline.configure(snippetOptions),
        Table,
        TableRow,
        TableHeader,
        TableCell
    ];

    if (options.placeholder) {
        extensions.push(Placeholder.configure({
            placeholder: options.placeholder
        }));
    }

    if (options.useLineBreaks) {
        extensions.push(LineBreaks);
    }

    return extensions.concat(options.extensions || []);
}
