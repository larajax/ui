/*
 * Translations for ru, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Russian (ru)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['ru'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Значение не должно быть пустым.',
        ruleInteger: 'Значение должно быть целым числом.',
        rulePositiveInteger: 'Значение должно быть положительным целым числом.',
        ruleFloat: 'Значение должно быть числом с плавающей точкой.',
        rulePositiveFloat: 'Значение должно быть положительным числом с плавающей точкой.',
        ruleMin: 'Значение не должно быть меньше :min.',
        ruleMax: 'Значение не должно быть больше :max.',
        ruleMinLength: 'Длина текста не должна быть меньше :min.',
        ruleMaxLength: 'Длина текста не должна быть больше :max.',
        ruleRegex: 'Неверный формат значения.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Жирный',
        italic: 'Курсив',
        strikethrough: 'Зачёркнутый',
        heading1: 'Заголовок 1',
        heading2: 'Заголовок 2',
        heading3: 'Заголовок 3',
        code: 'Код',
        quote: 'Цитата',
        unorderedList: 'Ненумерованный список',
        orderedList: 'Нумерованный список',
        cleanBlock: 'Очистить форматирование блока',
        link: 'Ссылка',
        image: 'Изображение',
        table: 'Таблица',
        horizontalRule: 'Вставить горизонтальную черту',
        preview: 'Предпросмотр',
        sideBySide: 'Предпросмотр рядом с редактором',
        fullscreen: 'Полный экран'
    }
};

/*
 * RichArea translation: Russian (ru)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['ru'] = {
    // Toolbar buttons
    toolbar: 'Панель инструментов редактора',
    fullscreen: 'Полный экран',
    bold: 'Жирный',
    italic: 'Курсив',
    underline: 'Подчёркнутый',
    strikeThrough: 'Зачёркнутый',
    subscript: 'Подстрочный индекс',
    superscript: 'Надстрочный индекс',
    fontFamily: 'Шрифт',
    fontSize: 'Размер шрифта',
    color: 'Цвета',
    emoticons: 'Смайлики',
    inlineStyle: 'Стиль текста',
    paragraphStyle: 'Стиль абзаца',
    paragraphFormat: 'Формат абзаца',
    align: 'Выравнивание',
    formatOL: 'Нумерованный список',
    formatUL: 'Ненумерованный список',
    outdent: 'Уменьшить отступ',
    indent: 'Увеличить отступ',
    quote: 'Цитата',
    insertHR: 'Вставить горизонтальную черту',
    insertLink: 'Вставить ссылку',
    insertPageLink: 'Вставить ссылку',
    insertImage: 'Вставить изображение',
    insertVideo: 'Вставить видео',
    insertAudio: 'Вставить аудио',
    insertFile: 'Вставить файл',
    insertTable: 'Вставить таблицу',
    insertSnippet: 'Вставить сниппет',
    undo: 'Отменить',
    redo: 'Повторить',
    clearFormatting: 'Очистить форматирование',
    selectAll: 'Выделить всё',
    html: 'Режим кода',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Обычный',
    formatHeading1: 'Заголовок 1',
    formatHeading2: 'Заголовок 2',
    formatHeading3: 'Заголовок 3',
    formatHeading4: 'Заголовок 4',
    formatHeading5: 'Заголовок 5',
    formatHeading6: 'Заголовок 6',
    formatCode: 'Код',

    // Alignment
    alignLeft: 'По левому краю',
    alignCenter: 'По центру',
    alignRight: 'По правому краю',
    alignJustify: 'По ширине',

    // Colors
    textColor: 'Текст',
    backgroundColor: 'Фон',
    removeColor: 'Удалить цвет',
    defaultFont: 'По умолчанию',

    // Insert menus
    uploadFromComputer: 'Загрузить с компьютера',
    browse: 'Просмотр медиафайлов',
    byUrl: 'По URL',
    embeddingCode: 'Код для встраивания',

    // Popover forms
    url: 'URL',
    text: 'Текст',
    openInNewTab: 'Открыть в новой вкладке',
    linkStyle: 'Стиль',
    none: 'Нет',
    insert: 'Вставить',
    update: 'Обновить',
    cancel: 'Отмена',
    remove: 'Удалить',
    browsePages: 'Выбрать страницу',
    alternativeText: 'Альтернативный текст',
    width: 'Ширина',
    widthPlaceholder: '300 или 50%',
    widthInvalid: 'Введите ширину в пикселях или процентах',
    urlRequired: 'Пожалуйста, введите URL',
    urlInvalid: 'Пожалуйста, введите корректный URL',
    embeddingCodeRequired: 'Пожалуйста, введите код для встраивания',
    embeddingCodeInvalid: 'Код для встраивания должен содержать iframe',

    // Contextual toolbars
    openLink: 'Открыть ссылку',
    editLink: 'Изменить ссылку',
    unlink: 'Удалить ссылку',
    imageAlign: 'Выравнивание',
    imageAlignNone: 'В тексте',
    imageAlignLeft: 'Слева с обтеканием',
    imageAlignCenter: 'По центру',
    imageAlignRight: 'Справа с обтеканием',
    imageStyle: 'Стиль изображения',
    imageAlt: 'Альтернативный текст',
    imageSize: 'Изменить размер',
    imageReplace: 'Заменить',
    imageRemove: 'Удалить изображение',
    imageLink: 'Вставить ссылку',
    tableHeader: 'Строка заголовка',
    tableRows: 'Строка',
    tableRowAbove: 'Вставить строку выше',
    tableRowBelow: 'Вставить строку ниже',
    tableRowDelete: 'Удалить строку',
    tableColumns: 'Столбец',
    tableColumnBefore: 'Вставить столбец слева',
    tableColumnAfter: 'Вставить столбец справа',
    tableColumnDelete: 'Удалить столбец',
    tableCells: 'Ячейка',
    tableCellsMerge: 'Объединить ячейки',
    tableCellsSplit: 'Разделить ячейку',
    tableStyle: 'Стиль таблицы',
    tableCellStyle: 'Стиль ячейки',
    tableRemove: 'Удалить таблицу',
    snippet: 'Сниппет',
    snippetProperties: 'Свойства',
    snippetRemove: 'Удалить сниппет',
    mediaRemove: 'Удалить',

    // Messages
    uploadFailed: 'Не удалось загрузить файл',
    invalidFileEmptyInsert: 'Пожалуйста, выберите файл для вставки.',
    invalidFileSingleInsert: 'Пожалуйста, выберите один файл.',
    invalidImageEmptyInsert: 'Пожалуйста, выберите изображение для вставки.',
    invalidImageInvalidInsert: 'Выбранный файл не является изображением.',
    invalidVideoInvalidInsert: 'Выбранный файл не является видео.',
    invalidAudioInvalidInsert: 'Выбранный файл не является аудиофайлом.'
};

/*
 * Hotsheet translation: Russian (ru)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['ru'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Нет данных',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Вставить строку выше',
    insertRowBelow: 'Вставить строку ниже',
    removeRow: 'Удалить строку',
    undo: 'Отменить',
    redo: 'Повторить',
    freezeColumn: 'Закрепить столбец',
    unfreezeColumn: 'Открепить столбец',

    // A cell whose value its column does not accept
    invalidValue: 'Недопустимое значение.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Выбрать дату',
    chooseTime: 'Выбрать время'
};
