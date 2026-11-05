/*
 * Translations for zh-tw, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Traditional Chinese, Taiwan (zh-tw)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['zh-tw'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: '此值不可空白。',
        ruleInteger: '此值必須是整數。',
        rulePositiveInteger: '此值必須是正整數。',
        ruleFloat: '此值必須是浮點數。',
        rulePositiveFloat: '此值必須是正浮點數。',
        ruleMin: '此值不得小於 :min。',
        ruleMax: '此值不得大於 :max。',
        ruleMinLength: '字串長度不得少於 :min 個字元。',
        ruleMaxLength: '字串長度不得超過 :max 個字元。',
        ruleRegex: '值的格式無效。'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: '粗體',
        italic: '斜體',
        strikethrough: '刪除線',
        heading1: '標題一',
        heading2: '標題二',
        heading3: '標題三',
        code: '程式碼',
        quote: '引用',
        unorderedList: '項目清單',
        orderedList: '數字清單',
        cleanBlock: '清除區塊格式',
        link: '連結',
        image: '圖片',
        table: '表格',
        horizontalRule: '插入水平線',
        preview: '預覽',
        sideBySide: '並排顯示',
        fullscreen: '全螢幕'
    }
};

/*
 * RichArea translation: Traditional Chinese, Taiwan (zh-tw)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['zh-tw'] = {
    // Toolbar buttons
    toolbar: '編輯器工具列',
    fullscreen: '全螢幕',
    bold: '粗體',
    italic: '斜體',
    underline: '底線',
    strikeThrough: '刪除線',
    subscript: '下標',
    superscript: '上標',
    fontFamily: '字型',
    fontSize: '字型大小',
    color: '顏色',
    emoticons: '表情符號',
    inlineStyle: '行內樣式',
    paragraphStyle: '段落樣式',
    paragraphFormat: '段落格式',
    align: '對齊',
    formatOL: '數字清單',
    formatUL: '項目清單',
    outdent: '減少縮排',
    indent: '增加縮排',
    quote: '引用',
    insertHR: '插入水平線',
    insertLink: '插入連結',
    insertPageLink: '插入連結',
    insertImage: '插入圖片',
    insertVideo: '插入影片',
    insertAudio: '插入音訊',
    insertFile: '插入檔案',
    insertTable: '插入表格',
    insertSnippet: '插入程式碼片段',
    undo: '復原',
    redo: '重做',
    clearFormatting: '清除格式',
    selectAll: '全選',
    html: '程式碼檢視',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: '內文',
    formatHeading1: '標題一',
    formatHeading2: '標題二',
    formatHeading3: '標題三',
    formatHeading4: '標題四',
    formatHeading5: '標題五',
    formatHeading6: '標題六',
    formatCode: '程式碼',

    // Alignment
    alignLeft: '靠左對齊',
    alignCenter: '置中',
    alignRight: '靠右對齊',
    alignJustify: '左右對齊',

    // Colors
    textColor: '文字',
    backgroundColor: '背景',
    removeColor: '清除顏色',
    defaultFont: '預設',

    // Insert menus
    uploadFromComputer: '從電腦上傳',
    browse: '瀏覽',
    byUrl: '透過 URL',
    embeddingCode: '嵌入程式碼',

    // Popover forms
    url: 'URL',
    text: '文字',
    openInNewTab: '在新分頁中開啟',
    linkStyle: '樣式',
    none: '無',
    insert: '插入',
    update: '更新',
    cancel: '取消',
    remove: '移除',
    browsePages: '瀏覽頁面',
    alternativeText: '替代文字',
    width: '寬度',
    widthPlaceholder: '300 或 50%',
    widthInvalid: '請輸入以像素或百分比表示的寬度',
    urlRequired: '請輸入 URL',
    urlInvalid: '請輸入有效的 URL',
    embeddingCodeRequired: '請輸入嵌入程式碼',
    embeddingCodeInvalid: '嵌入程式碼必須包含 iframe',

    // Contextual toolbars
    openLink: '開啟連結',
    editLink: '編輯連結',
    unlink: '移除連結',
    imageAlign: '對齊',
    imageAlignNone: '行內',
    imageAlignLeft: '靠左浮動',
    imageAlignCenter: '置中',
    imageAlignRight: '靠右浮動',
    imageStyle: '圖片樣式',
    imageAlt: '替代文字',
    imageSize: '變更大小',
    imageReplace: '更換',
    imageRemove: '刪除圖片',
    imageLink: '插入連結',
    tableHeader: '標題列',
    tableRows: '列',
    tableRowAbove: '在上方插入列',
    tableRowBelow: '在下方插入列',
    tableRowDelete: '刪除列',
    tableColumns: '欄',
    tableColumnBefore: '在左側插入欄',
    tableColumnAfter: '在右側插入欄',
    tableColumnDelete: '刪除欄',
    tableCells: '儲存格',
    tableCellsMerge: '合併儲存格',
    tableCellsSplit: '分割儲存格',
    tableStyle: '表格樣式',
    tableCellStyle: '儲存格樣式',
    tableRemove: '刪除表格',
    snippet: '程式碼片段',
    snippetProperties: '屬性',
    snippetRemove: '刪除程式碼片段',
    mediaRemove: '刪除',

    // Messages
    uploadFailed: '無法上傳檔案',
    invalidFileEmptyInsert: '請選擇要插入的檔案。',
    invalidFileSingleInsert: '請只選擇一個檔案。',
    invalidImageEmptyInsert: '請選擇要插入的圖片。',
    invalidImageInvalidInsert: '所選的檔案不是圖片。',
    invalidVideoInvalidInsert: '所選的檔案不是影片。',
    invalidAudioInvalidInsert: '所選的檔案不是音訊檔案。'
};

/*
 * Hotsheet translation: Traditional Chinese, Taiwan (zh-tw)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['zh-tw'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: '沒有資料',

    // Row and column actions, for a host's context menu
    insertRowAbove: '在上方插入列',
    insertRowBelow: '在下方插入列',
    removeRow: '刪除列',
    undo: '復原',
    redo: '重做',
    freezeColumn: '凍結欄',
    unfreezeColumn: '取消凍結欄',

    // A cell whose value its column does not accept
    invalidValue: '此值無效。',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: '選擇日期',
    chooseTime: '選擇時間'
};
