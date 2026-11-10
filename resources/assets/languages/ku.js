/*
 * Translations for ku, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Kurdish, Sorani (ku)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['ku'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'بەهاکە نابێت بەتاڵ بێت.',
        ruleInteger: 'بەهاکە دەبێت ژمارەیەکی تەواو بێت.',
        rulePositiveInteger: 'بەهاکە دەبێت ژمارەیەکی تەواوی پۆزەتیڤ بێت.',
        ruleFloat: 'بەهاکە دەبێت ژمارەیەکی دەیی بێت.',
        rulePositiveFloat: 'بەهاکە دەبێت ژمارەیەکی دەیی پۆزەتیڤ بێت.',
        ruleMin: 'بەهاکە نابێت لە :min کەمتر بێت.',
        ruleMax: 'بەهاکە نابێت لە :max زیاتر بێت.',
        ruleMinLength: 'دەقەکە نابێت لە :min پیت کەمتر بێت.',
        ruleMaxLength: 'دەقەکە نابێت لە :max پیت زیاتر بێت.',
        ruleRegex: 'فۆرماتی بەهاکە دروست نییە.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'تۆخ',
        italic: 'لار',
        strikethrough: 'هێڵ بەسەردا',
        heading1: 'سەردێڕ 1',
        heading2: 'سەردێڕ 2',
        heading3: 'سەردێڕ 3',
        code: 'کۆد',
        quote: 'وتەی وەرگیراو',
        unorderedList: 'لیستی خاڵدار',
        orderedList: 'لیستی ژمارەدار',
        cleanBlock: 'سڕینەوەی فۆرماتی بڕگە',
        link: 'بەستەر',
        image: 'وێنە',
        table: 'خشتە',
        horizontalRule: 'دانانی هێڵی ئاسۆیی',
        preview: 'پێشبینین',
        sideBySide: 'پیشاندانی تەنیشت بە تەنیشت',
        fullscreen: 'پڕ بە شاشە'
    },

    // Custom select messages
    customselect: {
        noResults: 'هیچ ئەنجامێک نەدۆزرایەوە',
        searching: 'گەڕان…',
        loadingMore: 'ئەنجامی زیاتر بار دەکرێت…',
        errorLoading: 'ئەنجامەکان بار نەکران.',
        inputTooShort: 'تکایە :count پیت یان زیاتر بنووسە',
        maximumSelected: 'تەنها دەتوانیت :count دانە هەڵبژێریت',
        removeItem: 'لابردنی دانە',
        removeAllItems: 'لابردنی هەموو دانەکان'
    }
};

/*
 * RichArea translation: Kurdish, Sorani (ku)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['ku'] = {
    // Toolbar buttons
    toolbar: 'شریتی ئامرازی دەستکاریکەر',
    fullscreen: 'پڕ بە شاشە',
    bold: 'تۆخ',
    italic: 'لار',
    underline: 'هێڵ بەژێردا',
    strikeThrough: 'هێڵ بەسەردا',
    subscript: 'ژێرنووس',
    superscript: 'سەرنووس',
    fontFamily: 'جۆری فۆنت',
    fontSize: 'قەبارەی فۆنت',
    color: 'ڕەنگەکان',
    emoticons: 'ئیمۆجییەکان',
    inlineStyle: 'شێوازی دەق',
    paragraphStyle: 'شێوازی بڕگە',
    paragraphFormat: 'فۆرماتی بڕگە',
    align: 'ڕێکخستن',
    formatOL: 'لیستی ژمارەدار',
    formatUL: 'لیستی خاڵدار',
    outdent: 'کەمکردنەوەی بۆشایی',
    indent: 'زیادکردنی بۆشایی',
    quote: 'وتەی وەرگیراو',
    insertHR: 'دانانی هێڵی ئاسۆیی',
    insertLink: 'دانانی بەستەر',
    insertPageLink: 'دانانی بەستەر',
    insertImage: 'دانانی وێنە',
    insertVideo: 'دانانی ڤیدیۆ',
    insertAudio: 'دانانی دەنگ',
    insertFile: 'دانانی پەڕگە',
    insertTable: 'دانانی خشتە',
    insertSnippet: 'دانانی پارچە',
    undo: 'پاشگەزبوونەوە',
    redo: 'دووبارەکردنەوە',
    clearFormatting: 'سڕینەوەی فۆرمات',
    selectAll: 'دیاریکردنی هەموو',
    html: 'پیشاندانی کۆد',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'ئاسایی',
    formatHeading1: 'سەردێڕ 1',
    formatHeading2: 'سەردێڕ 2',
    formatHeading3: 'سەردێڕ 3',
    formatHeading4: 'سەردێڕ 4',
    formatHeading5: 'سەردێڕ 5',
    formatHeading6: 'سەردێڕ 6',
    formatCode: 'کۆد',

    // Alignment
    alignLeft: 'ڕێکخستن بە چەپ',
    alignCenter: 'ڕێکخستن بە ناوەڕاست',
    alignRight: 'ڕێکخستن بە ڕاست',
    alignJustify: 'ڕێکخستنی هەردوولا',

    // Colors
    textColor: 'دەق',
    backgroundColor: 'پاشبنەما',
    removeColor: 'لابردنی ڕەنگ',
    defaultFont: 'بنەڕەتی',

    // Insert menus
    uploadFromComputer: 'بارکردن لە کۆمپیوتەرەوە',
    browse: 'گەڕان',
    byUrl: 'بە URL',
    embeddingCode: 'کۆدی جێگیرکردن',

    // Popover forms
    url: 'URL',
    text: 'دەق',
    openInNewTab: 'کردنەوە لە بازدەرێکی نوێ',
    linkStyle: 'شێواز',
    none: 'هیچ',
    insert: 'دانان',
    update: 'نوێکردنەوە',
    cancel: 'هەڵوەشاندنەوە',
    remove: 'لابردن',
    browsePages: 'گەڕان لە پەڕەکان',
    alternativeText: 'دەقی جێگرەوە',
    width: 'پانی',
    widthPlaceholder: '300 یان 50%',
    widthInvalid: 'پانی بە پیکسڵ یان بە ڕێژەی سەدی بنووسە',
    urlRequired: 'تکایە URL بنووسە',
    urlInvalid: 'تکایە URL ی دروست بنووسە',
    embeddingCodeRequired: 'تکایە کۆدی جێگیرکردن بنووسە',
    embeddingCodeInvalid: 'کۆدی جێگیرکردن دەبێت iframe لەخۆ بگرێت',

    // Contextual toolbars
    openLink: 'کردنەوەی بەستەر',
    editLink: 'دەستکاریکردنی بەستەر',
    unlink: 'لابردنی بەستەر',
    imageAlign: 'ڕێکخستن',
    imageAlignNone: 'لەناو دێڕدا',
    imageAlignLeft: 'خستنە لای چەپ',
    imageAlignCenter: 'ناوەڕاست',
    imageAlignRight: 'خستنە لای ڕاست',
    imageStyle: 'شێوازی وێنە',
    imageAlt: 'دەقی جێگرەوە',
    imageSize: 'گۆڕینی قەبارە',
    imageReplace: 'گۆڕینەوە',
    imageRemove: 'لابردنی وێنە',
    imageLink: 'دانانی بەستەر',
    tableHeader: 'ڕیزی سەردێڕ',
    tableRows: 'ڕیز',
    tableRowAbove: 'دانانی ڕیز لە سەرەوە',
    tableRowBelow: 'دانانی ڕیز لە خوارەوە',
    tableRowDelete: 'سڕینەوەی ڕیز',
    tableColumns: 'ستوون',
    tableColumnBefore: 'دانانی ستوون لە پێشەوە',
    tableColumnAfter: 'دانانی ستوون لە دواوە',
    tableColumnDelete: 'سڕینەوەی ستوون',
    tableCells: 'خانە',
    tableCellsMerge: 'یەکخستنی خانەکان',
    tableCellsSplit: 'دابەشکردنی خانە',
    tableStyle: 'شێوازی خشتە',
    tableCellStyle: 'شێوازی خانە',
    tableRemove: 'لابردنی خشتە',
    snippet: 'پارچە',
    snippetProperties: 'تایبەتمەندییەکان',
    snippetRemove: 'لابردنی پارچە',
    mediaRemove: 'لابردن',

    // Messages
    uploadFailed: 'نەتوانرا پەڕگەکە بار بکرێت',
    invalidFileEmptyInsert: 'تکایە پەڕگەیەک بۆ دانان دیاری بکە.',
    invalidFileSingleInsert: 'تکایە تەنها یەک پەڕگە دیاری بکە.',
    invalidImageEmptyInsert: 'تکایە وێنەیەک بۆ دانان دیاری بکە.',
    invalidImageInvalidInsert: 'پەڕگەی دیاریکراو وێنە نییە.',
    invalidVideoInvalidInsert: 'پەڕگەی دیاریکراو ڤیدیۆ نییە.',
    invalidAudioInvalidInsert: 'پەڕگەی دیاریکراو پەڕگەی دەنگی نییە.'
};

/*
 * Hotsheet translation: Kurdish, Sorani (ku)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['ku'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'هیچ داتایەک نییە',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'دانانی ڕیز لە سەرەوە',
    insertRowBelow: 'دانانی ڕیز لە خوارەوە',
    removeRow: 'لابردنی ڕیز',
    undo: 'پاشگەزبوونەوە',
    redo: 'دووبارەکردنەوە',
    freezeColumn: 'چەسپاندنی ستوون',
    unfreezeColumn: 'لابردنی چەسپاندنی ستوون',

    // A cell whose value its column does not accept
    invalidValue: 'بەهاکە دروست نییە.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'هەڵبژاردنی بەروار',
    chooseTime: 'هەڵبژاردنی کات'
};
