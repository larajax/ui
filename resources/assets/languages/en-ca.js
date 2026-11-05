/*
 * Translations for en-ca, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Canadian English (en-ca)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['en-ca'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'The value should not be empty.',
        ruleInteger: 'The value should be an integer.',
        rulePositiveInteger: 'The value should be a positive integer.',
        ruleFloat: 'The value should be a floating point number.',
        rulePositiveFloat: 'The value should be a positive floating point number.',
        ruleMin: 'The value should not be less than :min.',
        ruleMax: 'The value should not be more than :max.',
        ruleMinLength: 'The string should not be shorter than :min.',
        ruleMaxLength: 'The string should not be longer than :max.',
        ruleRegex: 'Invalid value format.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Bold',
        italic: 'Italic',
        strikethrough: 'Strikethrough',
        heading1: 'Heading 1',
        heading2: 'Heading 2',
        heading3: 'Heading 3',
        code: 'Code',
        quote: 'Quote',
        unorderedList: 'Unordered List',
        orderedList: 'Ordered List',
        cleanBlock: 'Clear Block Formatting',
        link: 'Link',
        image: 'Image',
        table: 'Table',
        horizontalRule: 'Insert Horizontal Line',
        preview: 'Preview',
        sideBySide: 'Side by Side',
        fullscreen: 'Fullscreen'
    }
};

/*
 * RichArea translation: Canadian English (en-ca)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['en-ca'] = {
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
    color: 'Colours',
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
    alignCenter: 'Align Centre',
    alignRight: 'Align Right',
    alignJustify: 'Align Justify',

    // Colors
    textColor: 'Text',
    backgroundColor: 'Background',
    removeColor: 'Remove Colour',
    defaultFont: 'Default',

    // Insert menus
    uploadFromComputer: 'Upload from Computer',
    browse: 'Browse',
    byUrl: 'By URL',
    embeddingCode: 'Embedding Code',

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
    imageAlignCenter: 'Centre',
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

/*
 * Hotsheet translation: Canadian English (en-ca)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['en-ca'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'No data',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Insert row above',
    insertRowBelow: 'Insert row below',
    removeRow: 'Remove row',
    undo: 'Undo',
    redo: 'Redo',
    freezeColumn: 'Freeze column',
    unfreezeColumn: 'Unfreeze column',

    // A cell whose value its column does not accept
    invalidValue: 'The value is not valid.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Choose a date',
    chooseTime: 'Choose a time'
};
