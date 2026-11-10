/*
 * Translations for be, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Belarusian (be)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['be'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Значэнне не павінна быць пустым.',
        ruleInteger: 'Значэнне павінна быць цэлым лікам.',
        rulePositiveInteger: 'Значэнне павінна быць дадатным цэлым лікам.',
        ruleFloat: 'Значэнне павінна быць лікам з плаваючай коскай.',
        rulePositiveFloat: 'Значэнне павінна быць дадатным лікам з плаваючай коскай.',
        ruleMin: 'Значэнне не павінна быць меншым за :min.',
        ruleMax: 'Значэнне не павінна быць большым за :max.',
        ruleMinLength: 'Даўжыня тэксту не павінна быць меншай за :min.',
        ruleMaxLength: 'Даўжыня тэксту не павінна быць большай за :max.',
        ruleRegex: 'Няправільны фармат значэння.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Тоўсты',
        italic: 'Курсіў',
        strikethrough: 'Закрэслены',
        heading1: 'Загаловак 1',
        heading2: 'Загаловак 2',
        heading3: 'Загаловак 3',
        code: 'Код',
        quote: 'Цытата',
        unorderedList: 'Ненумараваны спіс',
        orderedList: 'Нумараваны спіс',
        cleanBlock: 'Ачысціць фарматаванне блока',
        link: 'Спасылка',
        image: 'Выява',
        table: 'Табліца',
        horizontalRule: 'Уставіць гарызантальную лінію',
        preview: 'Папярэдні прагляд',
        sideBySide: 'Папярэдні прагляд побач з рэдактарам',
        fullscreen: 'Поўны экран'
    },

    // Custom select messages
    customselect: {
        noResults: 'Нічога не знойдзена',
        searching: 'Пошук…',
        loadingMore: 'Загрузка дадатковых вынікаў…',
        errorLoading: 'Немагчыма загрузіць вынікі.',
        inputTooShort: {
            one: 'Увядзіце яшчэ хаця б :count сімвал',
            few: 'Увядзіце яшчэ хаця б :count сімвалы',
            many: 'Увядзіце яшчэ хаця б :count сімвалаў',
            other: 'Увядзіце яшчэ хаця б :count сімвала'
        },
        maximumSelected: {
            one: 'Вы можаце выбраць не больш за :count элемент',
            few: 'Вы можаце выбраць не больш за :count элементы',
            many: 'Вы можаце выбраць не больш за :count элементаў',
            other: 'Вы можаце выбраць не больш за :count элемента'
        },
        removeItem: 'Выдаліць элемент',
        removeAllItems: 'Выдаліць усе элементы'
    }
};

/*
 * RichArea translation: Belarusian (be)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['be'] = {
    // Toolbar buttons
    toolbar: 'Панэль інструментаў рэдактара',
    fullscreen: 'Поўны экран',
    bold: 'Тоўсты',
    italic: 'Курсіў',
    underline: 'Падкрэслены',
    strikeThrough: 'Закрэслены',
    subscript: 'Падрадковы індэкс',
    superscript: 'Надрадковы індэкс',
    fontFamily: 'Шрыфт',
    fontSize: 'Памер шрыфту',
    color: 'Колеры',
    emoticons: 'Смайлікі',
    inlineStyle: 'Стыль тэксту',
    paragraphStyle: 'Стыль абзаца',
    paragraphFormat: 'Фармат абзаца',
    align: 'Выраўноўванне',
    formatOL: 'Нумараваны спіс',
    formatUL: 'Ненумараваны спіс',
    outdent: 'Паменшыць водступ',
    indent: 'Павялічыць водступ',
    quote: 'Цытата',
    insertHR: 'Уставіць гарызантальную лінію',
    insertLink: 'Уставіць спасылку',
    insertPageLink: 'Уставіць спасылку',
    insertImage: 'Уставіць выяву',
    insertVideo: 'Уставіць відэа',
    insertAudio: 'Уставіць аўдыё',
    insertFile: 'Уставіць файл',
    insertTable: 'Уставіць табліцу',
    insertSnippet: 'Уставіць фрагмент',
    undo: 'Адмяніць',
    redo: 'Паўтарыць',
    clearFormatting: 'Ачысціць фарматаванне',
    selectAll: 'Вылучыць усё',
    html: 'Рэжым кода',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Звычайны',
    formatHeading1: 'Загаловак 1',
    formatHeading2: 'Загаловак 2',
    formatHeading3: 'Загаловак 3',
    formatHeading4: 'Загаловак 4',
    formatHeading5: 'Загаловак 5',
    formatHeading6: 'Загаловак 6',
    formatCode: 'Код',

    // Alignment
    alignLeft: 'Па левым краі',
    alignCenter: 'Па цэнтры',
    alignRight: 'Па правым краі',
    alignJustify: 'Па шырыні',

    // Colors
    textColor: 'Тэкст',
    backgroundColor: 'Фон',
    removeColor: 'Выдаліць колер',
    defaultFont: 'Па змаўчанні',

    // Insert menus
    uploadFromComputer: 'Загрузіць з камп\'ютара',
    browse: 'Агляд медыяфайлаў',
    byUrl: 'Па URL',
    embeddingCode: 'Код для ўбудавання',

    // Popover forms
    url: 'URL',
    text: 'Тэкст',
    openInNewTab: 'Адкрыць у новай укладцы',
    linkStyle: 'Стыль',
    none: 'Няма',
    insert: 'Уставіць',
    update: 'Абнавіць',
    cancel: 'Адмена',
    remove: 'Выдаліць',
    browsePages: 'Выбраць старонку',
    alternativeText: 'Альтэрнатыўны тэкст',
    width: 'Шырыня',
    widthPlaceholder: '300 або 50%',
    widthInvalid: 'Увядзіце шырыню ў пікселях або працэнтах',
    urlRequired: 'Калі ласка, увядзіце URL',
    urlInvalid: 'Калі ласка, увядзіце правільны URL',
    embeddingCodeRequired: 'Калі ласка, увядзіце код для ўбудавання',
    embeddingCodeInvalid: 'Код для ўбудавання павінен змяшчаць iframe',

    // Contextual toolbars
    openLink: 'Адкрыць спасылку',
    editLink: 'Рэдагаваць спасылку',
    unlink: 'Выдаліць спасылку',
    imageAlign: 'Выраўноўванне',
    imageAlignNone: 'У тэксце',
    imageAlignLeft: 'Злева з абцяканнем',
    imageAlignCenter: 'Па цэнтры',
    imageAlignRight: 'Справа з абцяканнем',
    imageStyle: 'Стыль выявы',
    imageAlt: 'Альтэрнатыўны тэкст',
    imageSize: 'Змяніць памер',
    imageReplace: 'Замяніць',
    imageRemove: 'Выдаліць выяву',
    imageLink: 'Уставіць спасылку',
    tableHeader: 'Загаловак табліцы',
    tableRows: 'Радок',
    tableRowAbove: 'Уставіць радок вышэй',
    tableRowBelow: 'Уставіць радок ніжэй',
    tableRowDelete: 'Выдаліць радок',
    tableColumns: 'Слупок',
    tableColumnBefore: 'Уставіць слупок злева',
    tableColumnAfter: 'Уставіць слупок справа',
    tableColumnDelete: 'Выдаліць слупок',
    tableCells: 'Ячэйка',
    tableCellsMerge: 'Аб\'яднаць ячэйкі',
    tableCellsSplit: 'Падзяліць ячэйку',
    tableStyle: 'Стыль табліцы',
    tableCellStyle: 'Стыль ячэйкі',
    tableRemove: 'Выдаліць табліцу',
    snippet: 'Фрагмент',
    snippetProperties: 'Уласцівасці',
    snippetRemove: 'Выдаліць фрагмент',
    mediaRemove: 'Выдаліць',

    // Messages
    uploadFailed: 'Не ўдалося загрузіць файл',
    invalidFileEmptyInsert: 'Калі ласка, выберыце файл для ўстаўкі.',
    invalidFileSingleInsert: 'Калі ласка, выберыце адзін файл.',
    invalidImageEmptyInsert: 'Калі ласка, выберыце выяву для ўстаўкі.',
    invalidImageInvalidInsert: 'Выбраны файл не з\'яўляецца выявай.',
    invalidVideoInvalidInsert: 'Выбраны файл не з\'яўляецца відэа.',
    invalidAudioInvalidInsert: 'Выбраны файл не з\'яўляецца аўдыяфайлам.'
};

/*
 * Hotsheet translation: Belarusian (be)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['be'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Няма дадзеных',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Уставіць радок вышэй',
    insertRowBelow: 'Уставіць радок ніжэй',
    removeRow: 'Выдаліць радок',
    undo: 'Адмяніць',
    redo: 'Паўтарыць',
    freezeColumn: 'Замацаваць слупок',
    unfreezeColumn: 'Адмацаваць слупок',

    // A cell whose value its column does not accept
    invalidValue: 'Няправільнае значэнне.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Выбраць дату',
    chooseTime: 'Выбраць час'
};
