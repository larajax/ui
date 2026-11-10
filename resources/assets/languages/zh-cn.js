/*
 * Translations for zh-cn, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Simplified Chinese (zh-cn)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['zh-cn'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: '该值不能为空。',
        ruleInteger: '该值必须是整数。',
        rulePositiveInteger: '该值必须是正整数。',
        ruleFloat: '该值必须是浮点数。',
        rulePositiveFloat: '该值必须是正浮点数。',
        ruleMin: '该值不能小于 :min。',
        ruleMax: '该值不能大于 :max。',
        ruleMinLength: '字符串长度不能少于 :min 个字符。',
        ruleMaxLength: '字符串长度不能超过 :max 个字符。',
        ruleRegex: '值的格式无效。'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: '粗体',
        italic: '斜体',
        strikethrough: '删除线',
        heading1: '标题 1',
        heading2: '标题 2',
        heading3: '标题 3',
        code: '代码',
        quote: '引用',
        unorderedList: '无序列表',
        orderedList: '有序列表',
        cleanBlock: '清除块格式',
        link: '链接',
        image: '图片',
        table: '表格',
        horizontalRule: '插入分割线',
        preview: '预览',
        sideBySide: '并排显示',
        fullscreen: '全屏'
    },

    // Custom select messages
    customselect: {
        noResults: '未找到结果',
        searching: '搜索中…',
        loadingMore: '载入更多结果…',
        errorLoading: '无法载入结果。',
        inputTooShort: '请再输入至少:count个字符',
        maximumSelected: '最多只能选择:count个项目',
        removeItem: '删除项目',
        removeAllItems: '删除所有项目'
    }
};

/*
 * RichArea translation: Simplified Chinese (zh-cn)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['zh-cn'] = {
    // Toolbar buttons
    toolbar: '编辑器工具栏',
    fullscreen: '全屏',
    bold: '粗体',
    italic: '斜体',
    underline: '下划线',
    strikeThrough: '删除线',
    subscript: '下标',
    superscript: '上标',
    fontFamily: '字体',
    fontSize: '字体大小',
    color: '颜色',
    emoticons: '表情',
    inlineStyle: '内联样式',
    paragraphStyle: '段落样式',
    paragraphFormat: '段落格式',
    align: '对齐',
    formatOL: '有序列表',
    formatUL: '无序列表',
    outdent: '减少缩进',
    indent: '增加缩进',
    quote: '引用',
    insertHR: '插入分割线',
    insertLink: '插入链接',
    insertPageLink: '插入链接',
    insertImage: '插入图片',
    insertVideo: '插入视频',
    insertAudio: '插入音频',
    insertFile: '插入文件',
    insertTable: '插入表格',
    insertSnippet: '插入代码片段',
    undo: '撤销',
    redo: '重做',
    clearFormatting: '清除格式',
    selectAll: '全选',
    html: '代码视图',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: '正文',
    formatHeading1: '标题 1',
    formatHeading2: '标题 2',
    formatHeading3: '标题 3',
    formatHeading4: '标题 4',
    formatHeading5: '标题 5',
    formatHeading6: '标题 6',
    formatCode: '代码',

    // Alignment
    alignLeft: '左对齐',
    alignCenter: '居中',
    alignRight: '右对齐',
    alignJustify: '两端对齐',

    // Colors
    textColor: '文字',
    backgroundColor: '背景',
    removeColor: '清除颜色',
    defaultFont: '默认',

    // Insert menus
    uploadFromComputer: '从电脑上传',
    browse: '浏览',
    byUrl: '通过 URL',
    embeddingCode: '嵌入代码',

    // Popover forms
    url: 'URL',
    text: '文本',
    openInNewTab: '在新标签页中打开',
    linkStyle: '样式',
    none: '无',
    insert: '插入',
    update: '更新',
    cancel: '取消',
    remove: '移除',
    browsePages: '浏览页面',
    alternativeText: '替代文本',
    width: '宽度',
    widthPlaceholder: '300 或 50%',
    widthInvalid: '请输入以像素或百分比表示的宽度',
    urlRequired: '请输入 URL',
    urlInvalid: '请输入有效的 URL',
    embeddingCodeRequired: '请输入嵌入代码',
    embeddingCodeInvalid: '嵌入代码必须包含 iframe',

    // Contextual toolbars
    openLink: '打开链接',
    editLink: '编辑链接',
    unlink: '取消链接',
    imageAlign: '对齐',
    imageAlignNone: '内联',
    imageAlignLeft: '左浮动',
    imageAlignCenter: '居中',
    imageAlignRight: '右浮动',
    imageStyle: '图片样式',
    imageAlt: '替代文本',
    imageSize: '更改大小',
    imageReplace: '替换',
    imageRemove: '删除图片',
    imageLink: '插入链接',
    tableHeader: '表头',
    tableRows: '行',
    tableRowAbove: '在上方插入行',
    tableRowBelow: '在下方插入行',
    tableRowDelete: '删除行',
    tableColumns: '列',
    tableColumnBefore: '在左侧插入列',
    tableColumnAfter: '在右侧插入列',
    tableColumnDelete: '删除列',
    tableCells: '单元格',
    tableCellsMerge: '合并单元格',
    tableCellsSplit: '拆分单元格',
    tableStyle: '表格样式',
    tableCellStyle: '单元格样式',
    tableRemove: '删除表格',
    snippet: '代码片段',
    snippetProperties: '属性',
    snippetRemove: '删除代码片段',
    mediaRemove: '删除',

    // Messages
    uploadFailed: '无法上传该文件',
    invalidFileEmptyInsert: '请选择要插入的文件。',
    invalidFileSingleInsert: '请只选择一个文件。',
    invalidImageEmptyInsert: '请选择要插入的图片。',
    invalidImageInvalidInsert: '所选文件不是图片。',
    invalidVideoInvalidInsert: '所选文件不是视频。',
    invalidAudioInvalidInsert: '所选文件不是音频文件。'
};

/*
 * Hotsheet translation: Simplified Chinese (zh-cn)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['zh-cn'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: '暂无数据',

    // Row and column actions, for a host's context menu
    insertRowAbove: '在上方插入行',
    insertRowBelow: '在下方插入行',
    removeRow: '删除行',
    undo: '撤销',
    redo: '重做',
    freezeColumn: '冻结列',
    unfreezeColumn: '取消冻结列',

    // A cell whose value its column does not accept
    invalidValue: '该值无效。',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: '选择日期',
    chooseTime: '选择时间'
};
