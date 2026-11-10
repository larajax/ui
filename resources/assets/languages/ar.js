/*
 * Translations for ar, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Arabic (ar)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['ar'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'يجب ألا تكون القيمة فارغة.',
        ruleInteger: 'يجب أن تكون القيمة عددًا صحيحًا.',
        rulePositiveInteger: 'يجب أن تكون القيمة عددًا صحيحًا موجبًا.',
        ruleFloat: 'يجب أن تكون القيمة عددًا عشريًا.',
        rulePositiveFloat: 'يجب أن تكون القيمة عددًا عشريًا موجبًا.',
        ruleMin: 'يجب ألا تقل القيمة عن :min.',
        ruleMax: 'يجب ألا تزيد القيمة عن :max.',
        ruleMinLength: 'يجب ألا يقل عدد أحرف النص عن :min.',
        ruleMaxLength: 'يجب ألا يزيد عدد أحرف النص عن :max.',
        ruleRegex: 'تنسيق القيمة غير صالح.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'غامق',
        italic: 'مائل',
        strikethrough: 'يتوسطه خط',
        heading1: 'عنوان 1',
        heading2: 'عنوان 2',
        heading3: 'عنوان 3',
        code: 'كود',
        quote: 'اقتباس',
        unorderedList: 'قائمة نقطية',
        orderedList: 'قائمة مرقمة',
        cleanBlock: 'مسح تنسيق الفقرة',
        link: 'رابط',
        image: 'صورة',
        table: 'جدول',
        horizontalRule: 'إدراج خط أفقي',
        preview: 'معاينة',
        sideBySide: 'عرض جنبًا إلى جنب',
        fullscreen: 'ملء الشاشة'
    },

    // Custom select messages
    customselect: {
        noResults: 'لم يتم العثور على أي نتائج',
        searching: 'جاري البحث…',
        loadingMore: 'جاري تحميل نتائج إضافية...',
        errorLoading: 'لا يمكن تحميل النتائج',
        inputTooShort: 'الرجاء إضافة :count عناصر',
        maximumSelected: 'تستطيع إختيار :count بنود فقط',
        removeItem: 'قم بإزالة العنصر',
        removeAllItems: 'قم بإزالة كل العناصر'
    }
};

/*
 * RichArea translation: Arabic (ar)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['ar'] = {
    // Toolbar buttons
    toolbar: 'شريط أدوات المحرر',
    fullscreen: 'ملء الشاشة',
    bold: 'غامق',
    italic: 'مائل',
    underline: 'تسطير',
    strikeThrough: 'يتوسطه خط',
    subscript: 'منخفض',
    superscript: 'مرتفع',
    fontFamily: 'نوع الخط',
    fontSize: 'حجم الخط',
    color: 'الألوان',
    emoticons: 'الرموز التعبيرية',
    inlineStyle: 'نمط النص',
    paragraphStyle: 'نمط الفقرة',
    paragraphFormat: 'تنسيق الفقرة',
    align: 'محاذاة',
    formatOL: 'قائمة مرقمة',
    formatUL: 'قائمة نقطية',
    outdent: 'إنقاص المسافة البادئة',
    indent: 'زيادة المسافة البادئة',
    quote: 'اقتباس',
    insertHR: 'إدراج خط أفقي',
    insertLink: 'إدراج رابط',
    insertPageLink: 'إدراج رابط',
    insertImage: 'إدراج صورة',
    insertVideo: 'إدراج فيديو',
    insertAudio: 'إدراج صوت',
    insertFile: 'إدراج ملف',
    insertTable: 'إدراج جدول',
    insertSnippet: 'إدراج مقتطف',
    undo: 'تراجع',
    redo: 'إعادة',
    clearFormatting: 'مسح التنسيق',
    selectAll: 'تحديد الكل',
    html: 'عرض الكود',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'عادي',
    formatHeading1: 'عنوان 1',
    formatHeading2: 'عنوان 2',
    formatHeading3: 'عنوان 3',
    formatHeading4: 'عنوان 4',
    formatHeading5: 'عنوان 5',
    formatHeading6: 'عنوان 6',
    formatCode: 'كود',

    // Alignment
    alignLeft: 'محاذاة لليسار',
    alignCenter: 'توسيط',
    alignRight: 'محاذاة لليمين',
    alignJustify: 'ضبط',

    // Colors
    textColor: 'النص',
    backgroundColor: 'الخلفية',
    removeColor: 'إزالة اللون',
    defaultFont: 'افتراضي',

    // Insert menus
    uploadFromComputer: 'رفع من الحاسوب',
    browse: 'استعراض',
    byUrl: 'من عنوان URL',
    embeddingCode: 'كود التضمين',

    // Popover forms
    url: 'عنوان URL',
    text: 'النص',
    openInNewTab: 'فتح في علامة تبويب جديدة',
    linkStyle: 'النمط',
    none: 'بلا',
    insert: 'إدراج',
    update: 'تحديث',
    cancel: 'إلغاء',
    remove: 'إزالة',
    browsePages: 'استعراض الصفحات',
    alternativeText: 'النص البديل',
    width: 'العرض',
    widthPlaceholder: '300 أو 50%',
    widthInvalid: 'أدخل العرض بالبكسل أو كنسبة مئوية',
    urlRequired: 'يرجى إدخال عنوان URL',
    urlInvalid: 'يرجى إدخال عنوان URL صالح',
    embeddingCodeRequired: 'يرجى إدخال كود التضمين',
    embeddingCodeInvalid: 'يجب أن يحتوي كود التضمين على iframe',

    // Contextual toolbars
    openLink: 'فتح الرابط',
    editLink: 'تحرير الرابط',
    unlink: 'إزالة الرابط',
    imageAlign: 'محاذاة',
    imageAlignNone: 'ضمن السطر',
    imageAlignLeft: 'تعويم لليسار',
    imageAlignCenter: 'توسيط',
    imageAlignRight: 'تعويم لليمين',
    imageStyle: 'نمط الصورة',
    imageAlt: 'النص البديل',
    imageSize: 'تغيير الحجم',
    imageReplace: 'استبدال',
    imageRemove: 'إزالة الصورة',
    imageLink: 'إدراج رابط',
    tableHeader: 'رأس الجدول',
    tableRows: 'صف',
    tableRowAbove: 'إدراج صف أعلاه',
    tableRowBelow: 'إدراج صف أسفله',
    tableRowDelete: 'حذف الصف',
    tableColumns: 'عمود',
    tableColumnBefore: 'إدراج عمود قبله',
    tableColumnAfter: 'إدراج عمود بعده',
    tableColumnDelete: 'حذف العمود',
    tableCells: 'خلية',
    tableCellsMerge: 'دمج الخلايا',
    tableCellsSplit: 'تقسيم الخلية',
    tableStyle: 'نمط الجدول',
    tableCellStyle: 'نمط الخلية',
    tableRemove: 'إزالة الجدول',
    snippet: 'مقتطف',
    snippetProperties: 'الخصائص',
    snippetRemove: 'إزالة المقتطف',
    mediaRemove: 'إزالة',

    // Messages
    uploadFailed: 'تعذر رفع الملف',
    invalidFileEmptyInsert: 'يرجى تحديد ملف لإدراجه.',
    invalidFileSingleInsert: 'يرجى تحديد ملف واحد فقط.',
    invalidImageEmptyInsert: 'يرجى تحديد صورة لإدراجها.',
    invalidImageInvalidInsert: 'الملف المحدد ليس صورة.',
    invalidVideoInvalidInsert: 'الملف المحدد ليس فيديو.',
    invalidAudioInvalidInsert: 'الملف المحدد ليس ملفًا صوتيًا.'
};

/*
 * Hotsheet translation: Arabic (ar)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['ar'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'لا توجد بيانات',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'إدراج صف أعلاه',
    insertRowBelow: 'إدراج صف أسفله',
    removeRow: 'إزالة الصف',
    undo: 'تراجع',
    redo: 'إعادة',
    freezeColumn: 'تجميد العمود',
    unfreezeColumn: 'إلغاء تجميد العمود',

    // A cell whose value its column does not accept
    invalidValue: 'القيمة غير صالحة.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'اختيار تاريخ',
    chooseTime: 'اختيار وقت'
};
