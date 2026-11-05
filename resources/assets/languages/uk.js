/*
 * Translations for uk, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Ukrainian (uk)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['uk'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Значення не повинно бути порожнім.',
        ruleInteger: 'Значення повинно бути цілим числом.',
        rulePositiveInteger: 'Значення повинно бути додатним цілим числом.',
        ruleFloat: 'Значення повинно бути числом з плаваючою комою.',
        rulePositiveFloat: 'Значення повинно бути додатним числом з плаваючою комою.',
        ruleMin: 'Значення не повинно бути меншим за :min.',
        ruleMax: 'Значення не повинно бути більшим за :max.',
        ruleMinLength: 'Довжина тексту не повинна бути меншою за :min.',
        ruleMaxLength: 'Довжина тексту не повинна бути більшою за :max.',
        ruleRegex: 'Неправильний формат значення.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Жирний',
        italic: 'Курсив',
        strikethrough: 'Закреслений',
        heading1: 'Заголовок 1',
        heading2: 'Заголовок 2',
        heading3: 'Заголовок 3',
        code: 'Код',
        quote: 'Цитата',
        unorderedList: 'Ненумерований список',
        orderedList: 'Нумерований список',
        cleanBlock: 'Очистити форматування блоку',
        link: 'Посилання',
        image: 'Зображення',
        table: 'Таблиця',
        horizontalRule: 'Вставити горизонтальну лінію',
        preview: 'Попередній перегляд',
        sideBySide: 'Попередній перегляд поруч із редактором',
        fullscreen: 'Повний екран'
    }
};

/*
 * RichArea translation: Ukrainian (uk)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['uk'] = {
    // Toolbar buttons
    toolbar: 'Панель інструментів редактора',
    fullscreen: 'Повний екран',
    bold: 'Жирний',
    italic: 'Курсив',
    underline: 'Підкреслений',
    strikeThrough: 'Закреслений',
    subscript: 'Нижній індекс',
    superscript: 'Верхній індекс',
    fontFamily: 'Шрифт',
    fontSize: 'Розмір шрифту',
    color: 'Кольори',
    emoticons: 'Смайлики',
    inlineStyle: 'Стиль тексту',
    paragraphStyle: 'Стиль абзацу',
    paragraphFormat: 'Формат абзацу',
    align: 'Вирівнювання',
    formatOL: 'Нумерований список',
    formatUL: 'Ненумерований список',
    outdent: 'Зменшити відступ',
    indent: 'Збільшити відступ',
    quote: 'Цитата',
    insertHR: 'Вставити горизонтальну лінію',
    insertLink: 'Вставити посилання',
    insertPageLink: 'Вставити посилання',
    insertImage: 'Вставити зображення',
    insertVideo: 'Вставити відео',
    insertAudio: 'Вставити аудіо',
    insertFile: 'Вставити файл',
    insertTable: 'Вставити таблицю',
    insertSnippet: 'Вставити сніппет',
    undo: 'Скасувати',
    redo: 'Повторити',
    clearFormatting: 'Очистити форматування',
    selectAll: 'Виділити все',
    html: 'Режим коду',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Звичайний',
    formatHeading1: 'Заголовок 1',
    formatHeading2: 'Заголовок 2',
    formatHeading3: 'Заголовок 3',
    formatHeading4: 'Заголовок 4',
    formatHeading5: 'Заголовок 5',
    formatHeading6: 'Заголовок 6',
    formatCode: 'Код',

    // Alignment
    alignLeft: 'За лівим краєм',
    alignCenter: 'По центру',
    alignRight: 'За правим краєм',
    alignJustify: 'За шириною',

    // Colors
    textColor: 'Текст',
    backgroundColor: 'Фон',
    removeColor: 'Видалити колір',
    defaultFont: 'За замовчуванням',

    // Insert menus
    uploadFromComputer: 'Завантажити з комп\'ютера',
    browse: 'Огляд медіафайлів',
    byUrl: 'За URL',
    embeddingCode: 'Код для вбудовування',

    // Popover forms
    url: 'URL',
    text: 'Текст',
    openInNewTab: 'Відкрити в новій вкладці',
    linkStyle: 'Стиль',
    none: 'Немає',
    insert: 'Вставити',
    update: 'Оновити',
    cancel: 'Скасувати',
    remove: 'Видалити',
    browsePages: 'Вибрати сторінку',
    alternativeText: 'Альтернативний текст',
    width: 'Ширина',
    widthPlaceholder: '300 або 50%',
    widthInvalid: 'Введіть ширину в пікселях або відсотках',
    urlRequired: 'Будь ласка, введіть URL',
    urlInvalid: 'Будь ласка, введіть правильний URL',
    embeddingCodeRequired: 'Будь ласка, введіть код для вбудовування',
    embeddingCodeInvalid: 'Код для вбудовування має містити iframe',

    // Contextual toolbars
    openLink: 'Відкрити посилання',
    editLink: 'Редагувати посилання',
    unlink: 'Видалити посилання',
    imageAlign: 'Вирівнювання',
    imageAlignNone: 'У тексті',
    imageAlignLeft: 'Ліворуч з обтіканням',
    imageAlignCenter: 'По центру',
    imageAlignRight: 'Праворуч з обтіканням',
    imageStyle: 'Стиль зображення',
    imageAlt: 'Альтернативний текст',
    imageSize: 'Змінити розмір',
    imageReplace: 'Замінити',
    imageRemove: 'Видалити зображення',
    imageLink: 'Вставити посилання',
    tableHeader: 'Рядок заголовка',
    tableRows: 'Рядок',
    tableRowAbove: 'Вставити рядок вище',
    tableRowBelow: 'Вставити рядок нижче',
    tableRowDelete: 'Видалити рядок',
    tableColumns: 'Стовпець',
    tableColumnBefore: 'Вставити стовпець ліворуч',
    tableColumnAfter: 'Вставити стовпець праворуч',
    tableColumnDelete: 'Видалити стовпець',
    tableCells: 'Клітинка',
    tableCellsMerge: 'Об\'єднати клітинки',
    tableCellsSplit: 'Розділити клітинку',
    tableStyle: 'Стиль таблиці',
    tableCellStyle: 'Стиль клітинки',
    tableRemove: 'Видалити таблицю',
    snippet: 'Сніппет',
    snippetProperties: 'Властивості',
    snippetRemove: 'Видалити сніппет',
    mediaRemove: 'Видалити',

    // Messages
    uploadFailed: 'Не вдалося завантажити файл',
    invalidFileEmptyInsert: 'Будь ласка, оберіть файл для вставки.',
    invalidFileSingleInsert: 'Будь ласка, оберіть один файл.',
    invalidImageEmptyInsert: 'Будь ласка, оберіть зображення для вставки.',
    invalidImageInvalidInsert: 'Обраний файл не є зображенням.',
    invalidVideoInvalidInsert: 'Обраний файл не є відео.',
    invalidAudioInvalidInsert: 'Обраний файл не є аудіофайлом.'
};

/*
 * Hotsheet translation: Ukrainian (uk)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['uk'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Немає даних',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Вставити рядок вище',
    insertRowBelow: 'Вставити рядок нижче',
    removeRow: 'Видалити рядок',
    undo: 'Скасувати',
    redo: 'Повторити',
    freezeColumn: 'Закріпити стовпець',
    unfreezeColumn: 'Відкріпити стовпець',

    // A cell whose value its column does not accept
    invalidValue: 'Неприпустиме значення.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Вибрати дату',
    chooseTime: 'Вибрати час'
};

// Select2's own translation, kept for the custom-select control
(function (jQuery) {
/*! Select2 4.1.0 | https://github.com/select2/select2/blob/master/LICENSE.md */

!function(){if(jQuery&&jQuery.fn&&jQuery.fn.select2&&jQuery.fn.select2.amd)var n=jQuery.fn.select2.amd;n.define("select2/i18n/uk",[],function(){function n(n,e,u,r){return n%100>10&&n%100<15?r:n%10==1?e:n%10>1&&n%10<5?u:r}return{errorLoading:function(){return"Неможливо завантажити результати"},inputTooLong:function(e){return"Будь ласка, видаліть "+(e.input.length-e.maximum)+" "+n(e.maximum,"літеру","літери","літер")},inputTooShort:function(n){return"Будь ласка, введіть "+(n.minimum-n.input.length)+" або більше літер"},loadingMore:function(){return"Завантаження інших результатів…"},maximumSelected:function(e){return"Ви можете вибрати лише "+e.maximum+" "+n(e.maximum,"пункт","пункти","пунктів")},noResults:function(){return"Нічого не знайдено"},searching:function(){return"Пошук…"},removeAllItems:function(){return"Видалити всі елементи"}}}),n.define,n.require}();
})({ fn: { select2: { amd: { define: function (name, deps, factory) {
    (globalThis.Select2Languages = globalThis.Select2Languages || {})['uk'] = factory();
} } } } });
