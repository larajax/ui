/**
 * Default icon classes keyed by button code or interface element, hosts pass overrides through the icons option.
 */
export const defaultIcons = {
    // Text formatting
    bold: 'ph ph-text-b',
    italic: 'ph ph-text-italic',
    underline: 'ph ph-text-underline',
    strikeThrough: 'ph ph-text-strikethrough',
    subscript: 'ph ph-text-subscript',
    superscript: 'ph ph-text-superscript',
    inlineStyle: 'ph ph-paint-brush',
    fontFamily: 'ph ph-text-aa',
    fontSize: 'ph ph-text-h',
    color: 'ph ph-palette',
    emoticons: 'ph ph-smiley',
    clearFormatting: 'ph ph-eraser',

    // Blocks
    paragraphStyle: 'ph ph-paragraph',
    alignLeft: 'ph ph-text-align-left',
    alignCenter: 'ph ph-text-align-center',
    alignRight: 'ph ph-text-align-right',
    alignJustify: 'ph ph-text-align-justify',
    formatOL: 'ph ph-list-numbers',
    formatUL: 'ph ph-list-bullets',
    outdent: 'ph ph-text-outdent',
    indent: 'ph ph-text-indent',
    quote: 'ph ph-quotes',
    insertHR: 'ph ph-minus',

    // Links
    insertLink: 'ph ph-link',
    insertPageLink: 'ph ph-link',
    linkOpen: 'ph ph-arrow-square-out',
    linkEdit: 'ph ph-pencil-simple',
    linkStyle: 'ph ph-paint-brush',
    unlink: 'ph ph-link-break',

    // Media, tables and snippets
    insertImage: 'ph ph-image',
    insertVideo: 'ph ph-video-camera',
    insertAudio: 'ph ph-speaker-high',
    insertFile: 'ph ph-paperclip',
    insertTable: 'ph ph-table',
    insertSnippet: 'ph ph-newspaper',
    imageReplace: 'ph ph-swap',
    imageAlignNone: 'ph ph-text-align-left',
    imageAlignLeft: 'ph ph-align-left',
    imageAlignCenter: 'ph ph-align-center-horizontal',
    imageAlignRight: 'ph ph-align-right',
    imageStyle: 'ph ph-paint-brush',
    imageAlt: 'ph ph-textbox',
    imageSize: 'ph ph-arrows-out-simple',
    imageLink: 'ph ph-link',
    snippetProperties: 'ph ph-sliders-horizontal',
    nodeRemove: 'ph ph-trash',
    tableHeader: 'ph ph-rows',
    tableRows: 'ph ph-rows-plus-bottom',
    tableColumns: 'ph ph-columns-plus-right',
    tableCells: 'ph ph-squares-four',
    tableStyle: 'ph ph-paint-brush',
    tableCellStyle: 'ph ph-paint-bucket',
    tableRemove: 'ph ph-trash',

    // Tools
    undo: 'ph ph-arrow-counter-clockwise',
    redo: 'ph ph-arrow-clockwise',
    selectAll: 'ph ph-selection-all',
    html: 'ph ph-code',
    fullscreen: 'ph ph-arrows-out',
    fullscreenExit: 'ph ph-arrows-in',

    // Menus, panels and placeholders
    caret: 'ph ph-caret-down',
    check: 'ph ph-check',
    removeColor: 'ph ph-prohibit',
    embeddingCode: 'ph ph-code',
    uploadFromComputer: 'ph ph-upload-simple',
    browse: 'ph ph-folder-open',
    byUrl: 'ph ph-globe',
    customButton: 'ph ph-puzzle-piece',
    snippet: 'ph ph-newspaper'
};

/**
 * makeIcons merges host icon classes over the defaults, ignoring empty values.
 */
export function makeIcons(icons) {
    const result = { ...defaultIcons };

    Object.keys(icons || {}).forEach((name) => {
        const value = icons[name];

        if ((typeof value === 'string' && value.trim()) || (value && typeof value === 'object' && value.html)) {
            result[name] = value;
        }
    });

    return result;
}
