/**
 * Default English strings. The language option picks a translation from languages/, and hosts
 * pass their own overrides through the lang option.
 */
export const defaultLang = {
    // Toolbar buttons
    toolbar: 'Editor toolbar',
    fullscreen: 'Fullscreen',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strikeThrough: 'Strikethrough',
    subscript: 'Subscript',
    superscript: 'Superscript',
    fontFamily: 'Font Family',
    fontSize: 'Font Size',
    color: 'Colors',
    emoticons: 'Emoticons',
    inlineStyle: 'Inline Style',
    paragraphStyle: 'Paragraph Style',
    paragraphFormat: 'Paragraph Format',
    align: 'Align',
    formatOL: 'Ordered List',
    formatUL: 'Unordered List',
    outdent: 'Decrease Indent',
    indent: 'Increase Indent',
    quote: 'Quote',
    insertHR: 'Insert Horizontal Line',
    insertLink: 'Insert Link',
    insertPageLink: 'Insert Link',
    insertImage: 'Insert Image',
    insertVideo: 'Insert Video',
    insertAudio: 'Insert Audio',
    insertFile: 'Insert File',
    insertTable: 'Insert Table',
    insertSnippet: 'Insert Snippet',
    undo: 'Undo',
    redo: 'Redo',
    clearFormatting: 'Clear Formatting',
    selectAll: 'Select All',
    html: 'Code View',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Normal',
    formatHeading1: 'Heading 1',
    formatHeading2: 'Heading 2',
    formatHeading3: 'Heading 3',
    formatHeading4: 'Heading 4',
    formatHeading5: 'Heading 5',
    formatHeading6: 'Heading 6',
    formatCode: 'Code',

    // Alignment
    alignLeft: 'Align Left',
    alignCenter: 'Align Center',
    alignRight: 'Align Right',
    alignJustify: 'Align Justify',

    // Colors
    textColor: 'Text',
    backgroundColor: 'Background',
    removeColor: 'Remove Color',
    defaultFont: 'Default',

    // Insert menus
    uploadFromComputer: 'Upload from Computer',
    browse: 'Browse',
    byUrl: 'By URL',
    embeddingCode: 'Embedding Code',
    rows: 'rows',
    columns: 'columns',

    // Popover forms
    url: 'URL',
    text: 'Text',
    openInNewTab: 'Open in new tab',
    linkStyle: 'Style',
    none: 'None',
    insert: 'Insert',
    update: 'Update',
    cancel: 'Cancel',
    remove: 'Remove',
    browsePages: 'Browse Pages',
    alternativeText: 'Alternative Text',
    width: 'Width',
    widthPlaceholder: '300 or 50%',
    widthInvalid: 'Enter a width in pixels or a percentage',
    urlRequired: 'Please enter a URL',
    urlInvalid: 'Please enter a valid URL',
    embeddingCodeRequired: 'Please enter the embedding code',
    embeddingCodeInvalid: 'The embedding code must contain an iframe',

    // Contextual toolbars
    openLink: 'Open Link',
    editLink: 'Edit Link',
    unlink: 'Unlink',
    imageAlign: 'Align',
    imageAlignNone: 'Inline',
    imageAlignLeft: 'Float Left',
    imageAlignCenter: 'Center',
    imageAlignRight: 'Float Right',
    imageStyle: 'Image Style',
    imageAlt: 'Alternative Text',
    imageSize: 'Change Size',
    imageReplace: 'Replace',
    imageRemove: 'Remove Image',
    imageLink: 'Insert Link',
    tableHeader: 'Table Header',
    tableRows: 'Row',
    tableRowAbove: 'Insert row above',
    tableRowBelow: 'Insert row below',
    tableRowDelete: 'Delete row',
    tableColumns: 'Column',
    tableColumnBefore: 'Insert column before',
    tableColumnAfter: 'Insert column after',
    tableColumnDelete: 'Delete column',
    tableCells: 'Cell',
    tableCellsMerge: 'Merge cells',
    tableCellsSplit: 'Split cell',
    tableStyle: 'Table Style',
    tableCellStyle: 'Cell Style',
    tableRemove: 'Remove Table',
    snippet: 'Snippet',
    snippetProperties: 'Properties',
    snippetRemove: 'Remove Snippet',
    mediaRemove: 'Remove',

    // Messages
    uploadFailed: 'The file could not be uploaded',
    invalidFileEmptyInsert: 'Please select a file to insert.',
    invalidFileSingleInsert: 'Please select a single file.',
    invalidImageEmptyInsert: 'Please select an image to insert.',
    invalidImageInvalidInsert: 'The selected file is not an image.',
    invalidVideoInvalidInsert: 'The selected file is not a video.',
    invalidAudioInvalidInsert: 'The selected file is not an audio file.'
};

/**
 * Language codes some hosts use in place of the standard ones
 */
const LANGUAGE_ALIASES = {
    kr: 'ko',
    no: 'nb',
    pt: 'pt-pt',
    rs: 'sr',
    ua: 'uk',
    vn: 'vi',
    zh: 'zh-cn'
};

/**
 * getLanguages returns the translations on the page, keyed by language code. Each file in languages/
 * adds itself here, so it can load before or after the editor, as a plain script or a module.
 */
export function getLanguages() {
    if (!globalThis.RichAreaLanguages) {
        globalThis.RichAreaLanguages = {};
    }

    return globalThis.RichAreaLanguages;
}

/**
 * registerLanguage adds a translation, its strings keyed like the English defaults.
 */
export function registerLanguage(code, strings) {
    getLanguages()[normalizeLanguage(code)] = strings;
}

/**
 * languageCandidates lists the codes that serve a locale, most specific first, such as pt-br and pt for pt_BR.
 */
export function languageCandidates(code) {
    if (!code) {
        return [];
    }

    const normal = normalizeLanguage(code);
    const base = normal.split('-')[0];
    const result = [normal, LANGUAGE_ALIASES[normal], base, LANGUAGE_ALIASES[base]];

    return [...new Set(result.filter(Boolean))];
}

/**
 * resolveLanguage returns the code of the loaded translation serving a locale, or null for English.
 */
export function resolveLanguage(code) {
    const languages = getLanguages();

    return languageCandidates(code).find((candidate) => languages[candidate]) || null;
}

function normalizeLanguage(code) {
    return String(code).trim().toLowerCase().replace(/_/g, '-');
}

/**
 * makeTranslator returns a lookup function. A string comes from the host overrides, then the
 * translation for the language, then the English defaults.
 */
export function makeTranslator(overrides, language) {
    const code = resolveLanguage(language);
    const strings = { ...defaultLang, ...(code ? getLanguages()[code] : {}), ...(overrides || {}) };

    return (key, fallback) => {
        if (strings[key] !== undefined) {
            return strings[key];
        }

        return fallback !== undefined ? fallback : key;
    };
}
