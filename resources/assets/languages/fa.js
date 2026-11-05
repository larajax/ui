/*
 * Translations for fa, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Persian (fa)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['fa'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'مقدار نباید خالی باشد.',
        ruleInteger: 'مقدار باید یک عدد صحیح باشد.',
        rulePositiveInteger: 'مقدار باید یک عدد صحیح مثبت باشد.',
        ruleFloat: 'مقدار باید یک عدد اعشاری باشد.',
        rulePositiveFloat: 'مقدار باید یک عدد اعشاری مثبت باشد.',
        ruleMin: 'مقدار نباید کمتر از :min باشد.',
        ruleMax: 'مقدار نباید بیشتر از :max باشد.',
        ruleMinLength: 'متن نباید کمتر از :min کاراکتر باشد.',
        ruleMaxLength: 'متن نباید بیشتر از :max کاراکتر باشد.',
        ruleRegex: 'قالب مقدار معتبر نیست.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'ضخیم',
        italic: 'مورب',
        strikethrough: 'خط‌خورده',
        heading1: 'سرخط 1',
        heading2: 'سرخط 2',
        heading3: 'سرخط 3',
        code: 'کد',
        quote: 'نقل قول',
        unorderedList: 'لیست بدون ترتیب',
        orderedList: 'لیست با ترتیب',
        cleanBlock: 'پاک کردن قالب پاراگراف',
        link: 'پیوند',
        image: 'تصویر',
        table: 'جدول',
        horizontalRule: 'درج خط افقی',
        preview: 'پیش‌نمایش',
        sideBySide: 'نمایش کنار هم',
        fullscreen: 'تمام صفحه'
    }
};

/*
 * RichArea translation: Persian (fa)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['fa'] = {
    // Toolbar buttons
    toolbar: 'نوار ابزار ویرایشگر',
    fullscreen: 'تمام صفحه',
    bold: 'ضخیم',
    italic: 'مورب',
    underline: 'زیرخط',
    strikeThrough: 'خط‌خورده',
    subscript: 'زیرنویس',
    superscript: 'بالانویس',
    fontFamily: 'خانواده فونت',
    fontSize: 'اندازه فونت',
    color: 'رنگ‌ها',
    emoticons: 'شکلک‌ها',
    inlineStyle: 'سبک متن',
    paragraphStyle: 'سبک پاراگراف',
    paragraphFormat: 'قالب پاراگراف',
    align: 'تراز',
    formatOL: 'لیست با ترتیب',
    formatUL: 'لیست بدون ترتیب',
    outdent: 'کاهش تورفتگی',
    indent: 'افزایش تورفتگی',
    quote: 'نقل قول',
    insertHR: 'درج خط افقی',
    insertLink: 'درج پیوند',
    insertPageLink: 'درج پیوند',
    insertImage: 'درج تصویر',
    insertVideo: 'درج ویدیو',
    insertAudio: 'درج صوت',
    insertFile: 'درج فایل',
    insertTable: 'درج جدول',
    insertSnippet: 'درج تکه کد',
    undo: 'واگرد',
    redo: 'انجام دوباره',
    clearFormatting: 'پاک کردن قالب‌بندی',
    selectAll: 'انتخاب همه',
    html: 'نمایش کد',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'معمولی',
    formatHeading1: 'سرخط 1',
    formatHeading2: 'سرخط 2',
    formatHeading3: 'سرخط 3',
    formatHeading4: 'سرخط 4',
    formatHeading5: 'سرخط 5',
    formatHeading6: 'سرخط 6',
    formatCode: 'کد',

    // Alignment
    alignLeft: 'تراز چپ',
    alignCenter: 'تراز وسط',
    alignRight: 'تراز راست',
    alignJustify: 'تراز دوطرفه',

    // Colors
    textColor: 'متن',
    backgroundColor: 'پس‌زمینه',
    removeColor: 'حذف رنگ',
    defaultFont: 'پیش‌فرض',

    // Insert menus
    uploadFromComputer: 'ارسال از رایانه',
    browse: 'مرور',
    byUrl: 'از طریق آدرس',
    embeddingCode: 'کد جاسازی',

    // Popover forms
    url: 'آدرس',
    text: 'متن',
    openInNewTab: 'باز کردن در زبانه جدید',
    linkStyle: 'سبک',
    none: 'هیچ‌کدام',
    insert: 'درج',
    update: 'به‌روزرسانی',
    cancel: 'انصراف',
    remove: 'حذف',
    browsePages: 'مرور صفحات',
    alternativeText: 'متن جایگزین',
    width: 'عرض',
    widthPlaceholder: '300 یا 50%',
    widthInvalid: 'عرض را به پیکسل یا درصد وارد کنید',
    urlRequired: 'لطفا یک آدرس وارد کنید',
    urlInvalid: 'لطفا یک آدرس معتبر وارد کنید',
    embeddingCodeRequired: 'لطفا کد جاسازی را وارد کنید',
    embeddingCodeInvalid: 'کد جاسازی باید شامل یک iframe باشد',

    // Contextual toolbars
    openLink: 'باز کردن پیوند',
    editLink: 'ویرایش پیوند',
    unlink: 'حذف پیوند',
    imageAlign: 'تراز',
    imageAlignNone: 'درون‌خطی',
    imageAlignLeft: 'شناور چپ',
    imageAlignCenter: 'وسط',
    imageAlignRight: 'شناور راست',
    imageStyle: 'سبک تصویر',
    imageAlt: 'متن جایگزین',
    imageSize: 'تغییر اندازه',
    imageReplace: 'جایگزینی',
    imageRemove: 'حذف تصویر',
    imageLink: 'درج پیوند',
    tableHeader: 'سرآیند جدول',
    tableRows: 'ردیف',
    tableRowAbove: 'درج ردیف در بالا',
    tableRowBelow: 'درج ردیف در پایین',
    tableRowDelete: 'حذف ردیف',
    tableColumns: 'ستون',
    tableColumnBefore: 'درج ستون قبل',
    tableColumnAfter: 'درج ستون بعد',
    tableColumnDelete: 'حذف ستون',
    tableCells: 'سلول',
    tableCellsMerge: 'ادغام سلول‌ها',
    tableCellsSplit: 'تقسیم سلول',
    tableStyle: 'سبک جدول',
    tableCellStyle: 'سبک سلول',
    tableRemove: 'حذف جدول',
    snippet: 'تکه کد',
    snippetProperties: 'خصوصیات',
    snippetRemove: 'حذف تکه کد',
    mediaRemove: 'حذف',

    // Messages
    uploadFailed: 'ارسال فایل انجام نشد',
    invalidFileEmptyInsert: 'لطفا فایلی را برای درج انتخاب کنید.',
    invalidFileSingleInsert: 'لطفا تنها یک فایل انتخاب کنید.',
    invalidImageEmptyInsert: 'لطفا تصویری را برای درج انتخاب کنید.',
    invalidImageInvalidInsert: 'فایل انتخاب‌شده تصویر نیست.',
    invalidVideoInvalidInsert: 'فایل انتخاب‌شده ویدیو نیست.',
    invalidAudioInvalidInsert: 'فایل انتخاب‌شده فایل صوتی نیست.'
};

/*
 * Hotsheet translation: Persian (fa)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['fa'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'داده‌ای وجود ندارد',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'درج ردیف در بالا',
    insertRowBelow: 'درج ردیف در پایین',
    removeRow: 'حذف ردیف',
    undo: 'واگرد',
    redo: 'انجام دوباره',
    freezeColumn: 'ثابت کردن ستون',
    unfreezeColumn: 'لغو ثابت کردن ستون',

    // A cell whose value its column does not accept
    invalidValue: 'مقدار معتبر نیست.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'انتخاب تاریخ',
    chooseTime: 'انتخاب زمان'
};
