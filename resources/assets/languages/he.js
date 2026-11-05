/*
 * Translations for he, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Hebrew (he)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['he'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'יש להזין ערך.',
        ruleInteger: 'הערך חייב להיות מספר שלם.',
        rulePositiveInteger: 'הערך חייב להיות מספר שלם חיובי.',
        ruleFloat: 'הערך חייב להיות מספר עשרוני.',
        rulePositiveFloat: 'הערך חייב להיות מספר עשרוני חיובי.',
        ruleMin: 'הערך אינו יכול להיות קטן מ-:min.',
        ruleMax: 'הערך אינו יכול להיות גדול מ-:max.',
        ruleMinLength: 'הטקסט חייב להכיל לפחות :min תווים.',
        ruleMaxLength: 'הטקסט אינו יכול להכיל יותר מ-:max תווים.',
        ruleRegex: 'פורמט הערך אינו תקין.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'מודגש',
        italic: 'נטוי',
        strikethrough: 'קו חוצה',
        heading1: 'כותרת 1',
        heading2: 'כותרת 2',
        heading3: 'כותרת 3',
        code: 'קוד',
        quote: 'ציטוט',
        unorderedList: 'רשימת תבליטים',
        orderedList: 'רשימה ממוספרת',
        cleanBlock: 'ניקוי עיצוב פסקה',
        link: 'קישור',
        image: 'תמונה',
        table: 'טבלה',
        horizontalRule: 'הוספת קו אופקי',
        preview: 'תצוגה מקדימה',
        sideBySide: 'תצוגה זה לצד זה',
        fullscreen: 'מסך מלא'
    }
};

/*
 * RichArea translation: Hebrew (he)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['he'] = {
    // Toolbar buttons
    toolbar: 'סרגל הכלים של העורך',
    fullscreen: 'מסך מלא',
    bold: 'מודגש',
    italic: 'נטוי',
    underline: 'קו תחתון',
    strikeThrough: 'קו חוצה',
    subscript: 'כתב תחתי',
    superscript: 'כתב עילי',
    fontFamily: 'גופן',
    fontSize: 'גודל גופן',
    color: 'צבעים',
    emoticons: 'סמלי הבעה',
    inlineStyle: 'סגנון טקסט',
    paragraphStyle: 'סגנון פסקה',
    paragraphFormat: 'עיצוב פסקה',
    align: 'יישור',
    formatOL: 'רשימה ממוספרת',
    formatUL: 'רשימת תבליטים',
    outdent: 'הקטנת הזחה',
    indent: 'הגדלת הזחה',
    quote: 'ציטוט',
    insertHR: 'הוספת קו אופקי',
    insertLink: 'הוספת קישור',
    insertPageLink: 'הוספת קישור',
    insertImage: 'הוספת תמונה',
    insertVideo: 'הוספת וידאו',
    insertAudio: 'הוספת שמע',
    insertFile: 'הוספת קובץ',
    insertTable: 'הוספת טבלה',
    insertSnippet: 'הוספת קטע',
    undo: 'ביטול פעולה',
    redo: 'ביצוע חוזר',
    clearFormatting: 'ניקוי עיצוב',
    selectAll: 'בחירת הכל',
    html: 'תצוגת קוד',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'רגיל',
    formatHeading1: 'כותרת 1',
    formatHeading2: 'כותרת 2',
    formatHeading3: 'כותרת 3',
    formatHeading4: 'כותרת 4',
    formatHeading5: 'כותרת 5',
    formatHeading6: 'כותרת 6',
    formatCode: 'קוד',

    // Alignment
    alignLeft: 'יישור לשמאל',
    alignCenter: 'מרכוז',
    alignRight: 'יישור לימין',
    alignJustify: 'יישור לשני הצדדים',

    // Colors
    textColor: 'טקסט',
    backgroundColor: 'רקע',
    removeColor: 'הסרת צבע',
    defaultFont: 'ברירת מחדל',

    // Insert menus
    uploadFromComputer: 'העלאה מהמחשב',
    browse: 'עיון',
    byUrl: 'מכתובת URL',
    embeddingCode: 'קוד הטמעה',

    // Popover forms
    url: 'כתובת URL',
    text: 'טקסט',
    openInNewTab: 'פתיחה בכרטיסייה חדשה',
    linkStyle: 'סגנון',
    none: 'ללא',
    insert: 'הוספה',
    update: 'עדכון',
    cancel: 'ביטול',
    remove: 'הסרה',
    browsePages: 'עיון בדפים',
    alternativeText: 'טקסט חלופי',
    width: 'רוחב',
    widthPlaceholder: '300 או 50%',
    widthInvalid: 'יש להזין רוחב בפיקסלים או באחוזים',
    urlRequired: 'יש להזין כתובת URL',
    urlInvalid: 'יש להזין כתובת URL תקינה',
    embeddingCodeRequired: 'יש להזין את קוד ההטמעה',
    embeddingCodeInvalid: 'קוד ההטמעה חייב לכלול iframe',

    // Contextual toolbars
    openLink: 'פתיחת קישור',
    editLink: 'עריכת קישור',
    unlink: 'הסרת קישור',
    imageAlign: 'יישור',
    imageAlignNone: 'בתוך השורה',
    imageAlignLeft: 'הצמדה לשמאל',
    imageAlignCenter: 'מרכוז',
    imageAlignRight: 'הצמדה לימין',
    imageStyle: 'סגנון תמונה',
    imageAlt: 'טקסט חלופי',
    imageSize: 'שינוי גודל',
    imageReplace: 'החלפה',
    imageRemove: 'הסרת תמונה',
    imageLink: 'הוספת קישור',
    tableHeader: 'שורת כותרת',
    tableRows: 'שורה',
    tableRowAbove: 'הוספת שורה מעל',
    tableRowBelow: 'הוספת שורה מתחת',
    tableRowDelete: 'מחיקת שורה',
    tableColumns: 'עמודה',
    tableColumnBefore: 'הוספת עמודה לפני',
    tableColumnAfter: 'הוספת עמודה אחרי',
    tableColumnDelete: 'מחיקת עמודה',
    tableCells: 'תא',
    tableCellsMerge: 'מיזוג תאים',
    tableCellsSplit: 'פיצול תא',
    tableStyle: 'סגנון טבלה',
    tableCellStyle: 'סגנון תא',
    tableRemove: 'הסרת טבלה',
    snippet: 'קטע',
    snippetProperties: 'מאפיינים',
    snippetRemove: 'הסרת קטע',
    mediaRemove: 'הסרה',

    // Messages
    uploadFailed: 'לא ניתן היה להעלות את הקובץ',
    invalidFileEmptyInsert: 'יש לבחור קובץ להוספה.',
    invalidFileSingleInsert: 'יש לבחור קובץ אחד בלבד.',
    invalidImageEmptyInsert: 'יש לבחור תמונה להוספה.',
    invalidImageInvalidInsert: 'הקובץ שנבחר אינו תמונה.',
    invalidVideoInvalidInsert: 'הקובץ שנבחר אינו קובץ וידאו.',
    invalidAudioInvalidInsert: 'הקובץ שנבחר אינו קובץ שמע.'
};

/*
 * Hotsheet translation: Hebrew (he)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['he'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'אין נתונים',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'הוספת שורה מעל',
    insertRowBelow: 'הוספת שורה מתחת',
    removeRow: 'הסרת שורה',
    undo: 'ביטול פעולה',
    redo: 'ביצוע חוזר',
    freezeColumn: 'הקפאת עמודה',
    unfreezeColumn: 'ביטול הקפאת עמודה',

    // A cell whose value its column does not accept
    invalidValue: 'הערך אינו תקין.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'בחירת תאריך',
    chooseTime: 'בחירת שעה'
};

// Select2's own translation, kept for the custom-select control
(function (jQuery) {
/*! Select2 4.1.0 | https://github.com/select2/select2/blob/master/LICENSE.md */

!function(){if(jQuery&&jQuery.fn&&jQuery.fn.select2&&jQuery.fn.select2.amd)var n=jQuery.fn.select2.amd;n.define("select2/i18n/he",[],function(){return{errorLoading:function(){return"שגיאה בטעינת התוצאות"},inputTooLong:function(n){var e=n.input.length-n.maximum,r="נא למחוק ";return r+=1===e?"תו אחד":e+" תווים"},inputTooShort:function(n){var e=n.minimum-n.input.length,r="נא להכניס ";return r+=1===e?"תו אחד":e+" תווים",r+=" או יותר"},loadingMore:function(){return"טוען תוצאות נוספות…"},maximumSelected:function(n){var e="באפשרותך לבחור עד ";return 1===n.maximum?e+="פריט אחד":e+=n.maximum+" פריטים",e},noResults:function(){return"לא נמצאו תוצאות"},searching:function(){return"מחפש…"},removeAllItems:function(){return"הסר את כל הפריטים"}}}),n.define,n.require}();
})({ fn: { select2: { amd: { define: function (name, deps, factory) {
    (globalThis.Select2Languages = globalThis.Select2Languages || {})['he'] = factory();
} } } } });
