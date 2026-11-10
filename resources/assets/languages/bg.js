/*
 * Translations for bg, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Bulgarian (bg)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['bg'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Стойността не трябва да е празна.',
        ruleInteger: 'Стойността трябва да е цяло число.',
        rulePositiveInteger: 'Стойността трябва да е положително цяло число.',
        ruleFloat: 'Стойността трябва да е число с плаваща запетая.',
        rulePositiveFloat: 'Стойността трябва да е положително число с плаваща запетая.',
        ruleMin: 'Стойността не трябва да е по-малка от :min.',
        ruleMax: 'Стойността не трябва да е по-голяма от :max.',
        ruleMinLength: 'Дължината на текста не трябва да е по-малка от :min.',
        ruleMaxLength: 'Дължината на текста не трябва да е по-голяма от :max.',
        ruleRegex: 'Невалиден формат на стойността.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Удебелен',
        italic: 'Курсив',
        strikethrough: 'Зачертан',
        heading1: 'Заглавие 1',
        heading2: 'Заглавие 2',
        heading3: 'Заглавие 3',
        code: 'Код',
        quote: 'Цитат',
        unorderedList: 'Неномериран списък',
        orderedList: 'Номериран списък',
        cleanBlock: 'Изчистване на форматирането на блока',
        link: 'Връзка',
        image: 'Изображение',
        table: 'Таблица',
        horizontalRule: 'Вмъкване на хоризонтална линия',
        preview: 'Предварителен преглед',
        sideBySide: 'Предварителен преглед до редактора',
        fullscreen: 'На цял екран'
    },

    // Custom select messages
    customselect: {
        noResults: 'Няма намерени съвпадения',
        searching: 'Търсене…',
        loadingMore: 'Зареждат се още…',
        errorLoading: 'Резултатите не можаха да бъдат заредени.',
        inputTooShort: {
            one: 'Моля въведете още :count символ',
            other: 'Моля въведете още :count символа'
        },
        maximumSelected: {
            one: 'Можете да направите до :count избор',
            other: 'Можете да направите до :count избора'
        },
        removeItem: 'Премахване на елемента',
        removeAllItems: 'Премахнете всички елементи'
    }
};

/*
 * RichArea translation: Bulgarian (bg)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['bg'] = {
    // Toolbar buttons
    toolbar: 'Лента с инструменти на редактора',
    fullscreen: 'На цял екран',
    bold: 'Удебелен',
    italic: 'Курсив',
    underline: 'Подчертан',
    strikeThrough: 'Зачертан',
    subscript: 'Долен индекс',
    superscript: 'Горен индекс',
    fontFamily: 'Шрифт',
    fontSize: 'Размер на шрифта',
    color: 'Цветове',
    emoticons: 'Емотикони',
    inlineStyle: 'Стил на текста',
    paragraphStyle: 'Стил на абзаца',
    paragraphFormat: 'Формат на абзаца',
    align: 'Подравняване',
    formatOL: 'Номериран списък',
    formatUL: 'Неномериран списък',
    outdent: 'Намаляване на отстъпа',
    indent: 'Увеличаване на отстъпа',
    quote: 'Цитат',
    insertHR: 'Вмъкване на хоризонтална линия',
    insertLink: 'Вмъкване на връзка',
    insertPageLink: 'Вмъкване на връзка',
    insertImage: 'Вмъкване на изображение',
    insertVideo: 'Вмъкване на видео',
    insertAudio: 'Вмъкване на аудио',
    insertFile: 'Вмъкване на файл',
    insertTable: 'Вмъкване на таблица',
    insertSnippet: 'Вмъкване на фрагмент',
    undo: 'Отмяна',
    redo: 'Възстановяване',
    clearFormatting: 'Изчистване на форматирането',
    selectAll: 'Избиране на всичко',
    html: 'Изглед на кода',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Нормален',
    formatHeading1: 'Заглавие 1',
    formatHeading2: 'Заглавие 2',
    formatHeading3: 'Заглавие 3',
    formatHeading4: 'Заглавие 4',
    formatHeading5: 'Заглавие 5',
    formatHeading6: 'Заглавие 6',
    formatCode: 'Код',

    // Alignment
    alignLeft: 'Подравняване вляво',
    alignCenter: 'Центриране',
    alignRight: 'Подравняване вдясно',
    alignJustify: 'Двустранно подравняване',

    // Colors
    textColor: 'Текст',
    backgroundColor: 'Фон',
    removeColor: 'Премахване на цвета',
    defaultFont: 'По подразбиране',

    // Insert menus
    uploadFromComputer: 'Качване от компютъра',
    browse: 'Преглед на медийните файлове',
    byUrl: 'От URL адрес',
    embeddingCode: 'Код за вграждане',

    // Popover forms
    url: 'URL',
    text: 'Текст',
    openInNewTab: 'Отваряне в нов раздел',
    linkStyle: 'Стил',
    none: 'Няма',
    insert: 'Вмъкване',
    update: 'Актуализиране',
    cancel: 'Отказ',
    remove: 'Премахване',
    browsePages: 'Избор на страница',
    alternativeText: 'Алтернативен текст',
    width: 'Широчина',
    widthPlaceholder: '300 или 50%',
    widthInvalid: 'Въведете широчина в пиксели или проценти',
    urlRequired: 'Моля, въведете URL адрес',
    urlInvalid: 'Моля, въведете валиден URL адрес',
    embeddingCodeRequired: 'Моля, въведете кода за вграждане',
    embeddingCodeInvalid: 'Кодът за вграждане трябва да съдържа iframe',

    // Contextual toolbars
    openLink: 'Отваряне на връзката',
    editLink: 'Редактиране на връзката',
    unlink: 'Премахване на връзката',
    imageAlign: 'Подравняване',
    imageAlignNone: 'В текста',
    imageAlignLeft: 'Вляво с обтичане',
    imageAlignCenter: 'Центриране',
    imageAlignRight: 'Вдясно с обтичане',
    imageStyle: 'Стил на изображението',
    imageAlt: 'Алтернативен текст',
    imageSize: 'Промяна на размера',
    imageReplace: 'Замяна',
    imageRemove: 'Премахване на изображението',
    imageLink: 'Вмъкване на връзка',
    tableHeader: 'Заглавен ред',
    tableRows: 'Ред',
    tableRowAbove: 'Вмъкване на ред отгоре',
    tableRowBelow: 'Вмъкване на ред отдолу',
    tableRowDelete: 'Изтриване на реда',
    tableColumns: 'Колона',
    tableColumnBefore: 'Вмъкване на колона вляво',
    tableColumnAfter: 'Вмъкване на колона вдясно',
    tableColumnDelete: 'Изтриване на колоната',
    tableCells: 'Клетка',
    tableCellsMerge: 'Обединяване на клетки',
    tableCellsSplit: 'Разделяне на клетка',
    tableStyle: 'Стил на таблицата',
    tableCellStyle: 'Стил на клетката',
    tableRemove: 'Премахване на таблицата',
    snippet: 'Фрагмент',
    snippetProperties: 'Свойства',
    snippetRemove: 'Премахване на фрагмента',
    mediaRemove: 'Премахване',

    // Messages
    uploadFailed: 'Файлът не можа да бъде качен',
    invalidFileEmptyInsert: 'Моля, изберете файл за вмъкване.',
    invalidFileSingleInsert: 'Моля, изберете един файл.',
    invalidImageEmptyInsert: 'Моля, изберете изображение за вмъкване.',
    invalidImageInvalidInsert: 'Избраният файл не е изображение.',
    invalidVideoInvalidInsert: 'Избраният файл не е видео.',
    invalidAudioInvalidInsert: 'Избраният файл не е звуков файл.'
};

/*
 * Hotsheet translation: Bulgarian (bg)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['bg'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Няма данни',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Вмъкване на ред отгоре',
    insertRowBelow: 'Вмъкване на ред отдолу',
    removeRow: 'Премахване на реда',
    undo: 'Отмяна',
    redo: 'Възстановяване',
    freezeColumn: 'Фиксиране на колоната',
    unfreezeColumn: 'Освобождаване на колоната',

    // A cell whose value its column does not accept
    invalidValue: 'Невалидна стойност.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Избор на дата',
    chooseTime: 'Избор на час'
};
