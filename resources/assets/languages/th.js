/*
 * Translations for th, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Thai (th)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['th'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'ค่าต้องไม่เว้นว่าง',
        ruleInteger: 'ค่าต้องเป็นจำนวนเต็ม',
        rulePositiveInteger: 'ค่าต้องเป็นจำนวนเต็มบวก',
        ruleFloat: 'ค่าต้องเป็นตัวเลขทศนิยม',
        rulePositiveFloat: 'ค่าต้องเป็นตัวเลขทศนิยมบวก',
        ruleMin: 'ค่าต้องไม่น้อยกว่า :min',
        ruleMax: 'ค่าต้องไม่มากกว่า :max',
        ruleMinLength: 'ข้อความต้องยาวไม่น้อยกว่า :min ตัวอักษร',
        ruleMaxLength: 'ข้อความต้องยาวไม่เกิน :max ตัวอักษร',
        ruleRegex: 'รูปแบบของค่าไม่ถูกต้อง'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'ตัวหนา',
        italic: 'ตัวเอียง',
        strikethrough: 'ขีดทับ',
        heading1: 'หัวเรื่อง 1',
        heading2: 'หัวเรื่อง 2',
        heading3: 'หัวเรื่อง 3',
        code: 'โค้ด',
        quote: 'อ้างข้อความ',
        unorderedList: 'รายการแบบไม่มีลำดับ',
        orderedList: 'รายการแบบมีลำดับ',
        cleanBlock: 'ล้างการจัดรูปแบบบล็อก',
        link: 'ลิงก์',
        image: 'รูปภาพ',
        table: 'ตาราง',
        horizontalRule: 'แทรกเส้นแนวนอน',
        preview: 'แสดงตัวอย่าง',
        sideBySide: 'แสดงเคียงข้างกัน',
        fullscreen: 'เต็มหน้าจอ'
    }
};

/*
 * RichArea translation: Thai (th)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['th'] = {
    // Toolbar buttons
    toolbar: 'แถบเครื่องมือตัวแก้ไข',
    fullscreen: 'เต็มหน้าจอ',
    bold: 'ตัวหนา',
    italic: 'ตัวเอียง',
    underline: 'ขีดเส้นใต้',
    strikeThrough: 'ขีดทับ',
    subscript: 'ตัวห้อย',
    superscript: 'ตัวยก',
    fontFamily: 'ฟอนต์',
    fontSize: 'ขนาดฟอนต์',
    color: 'สี',
    emoticons: 'อีโมติคอน',
    inlineStyle: 'สไตล์ข้อความ',
    paragraphStyle: 'สไตล์ย่อหน้า',
    paragraphFormat: 'รูปแบบย่อหน้า',
    align: 'จัดแนว',
    formatOL: 'รายการแบบมีลำดับ',
    formatUL: 'รายการแบบไม่มีลำดับ',
    outdent: 'ลดการเยื้อง',
    indent: 'เพิ่มการเยื้อง',
    quote: 'อ้างข้อความ',
    insertHR: 'แทรกเส้นแนวนอน',
    insertLink: 'แทรกลิงก์',
    insertPageLink: 'แทรกลิงก์',
    insertImage: 'แทรกรูปภาพ',
    insertVideo: 'แทรกวิดีโอ',
    insertAudio: 'แทรกไฟล์เสียง',
    insertFile: 'แทรกไฟล์',
    insertTable: 'แทรกตาราง',
    insertSnippet: 'แทรกสนิปเพ็ต',
    undo: 'เลิกทำ',
    redo: 'ทำซ้ำ',
    clearFormatting: 'ล้างการจัดรูปแบบ',
    selectAll: 'เลือกทั้งหมด',
    html: 'มุมมองโค้ด',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'ปกติ',
    formatHeading1: 'หัวเรื่อง 1',
    formatHeading2: 'หัวเรื่อง 2',
    formatHeading3: 'หัวเรื่อง 3',
    formatHeading4: 'หัวเรื่อง 4',
    formatHeading5: 'หัวเรื่อง 5',
    formatHeading6: 'หัวเรื่อง 6',
    formatCode: 'โค้ด',

    // Alignment
    alignLeft: 'จัดชิดซ้าย',
    alignCenter: 'จัดกึ่งกลาง',
    alignRight: 'จัดชิดขวา',
    alignJustify: 'จัดชิดขอบ',

    // Colors
    textColor: 'ข้อความ',
    backgroundColor: 'พื้นหลัง',
    removeColor: 'ลบสี',
    defaultFont: 'ค่าเริ่มต้น',

    // Insert menus
    uploadFromComputer: 'อัปโหลดจากคอมพิวเตอร์',
    browse: 'เรียกดู',
    byUrl: 'จาก URL',
    embeddingCode: 'โค้ดสำหรับฝัง',

    // Popover forms
    url: 'URL',
    text: 'ข้อความ',
    openInNewTab: 'เปิดในแท็บใหม่',
    linkStyle: 'สไตล์',
    none: 'ไม่มี',
    insert: 'แทรก',
    update: 'อัปเดต',
    cancel: 'ยกเลิก',
    remove: 'เอาออก',
    browsePages: 'เรียกดูหน้า',
    alternativeText: 'ข้อความแสดงแทน',
    width: 'ความกว้าง',
    widthPlaceholder: '300 หรือ 50%',
    widthInvalid: 'ป้อนความกว้างเป็นพิกเซลหรือเปอร์เซ็นต์',
    urlRequired: 'โปรดป้อน URL',
    urlInvalid: 'โปรดป้อน URL ที่ถูกต้อง',
    embeddingCodeRequired: 'โปรดป้อนโค้ดสำหรับฝัง',
    embeddingCodeInvalid: 'โค้ดสำหรับฝังต้องมี iframe',

    // Contextual toolbars
    openLink: 'เปิดลิงก์',
    editLink: 'แก้ไขลิงก์',
    unlink: 'ยกเลิกลิงก์',
    imageAlign: 'จัดแนว',
    imageAlignNone: 'อยู่ในบรรทัด',
    imageAlignLeft: 'ลอยชิดซ้าย',
    imageAlignCenter: 'กึ่งกลาง',
    imageAlignRight: 'ลอยชิดขวา',
    imageStyle: 'สไตล์รูปภาพ',
    imageAlt: 'ข้อความแสดงแทน',
    imageSize: 'เปลี่ยนขนาด',
    imageReplace: 'แทนที่',
    imageRemove: 'ลบรูปภาพ',
    imageLink: 'แทรกลิงก์',
    tableHeader: 'ส่วนหัวตาราง',
    tableRows: 'แถว',
    tableRowAbove: 'แทรกแถวด้านบน',
    tableRowBelow: 'แทรกแถวด้านล่าง',
    tableRowDelete: 'ลบแถว',
    tableColumns: 'คอลัมน์',
    tableColumnBefore: 'แทรกคอลัมน์ด้านซ้าย',
    tableColumnAfter: 'แทรกคอลัมน์ด้านขวา',
    tableColumnDelete: 'ลบคอลัมน์',
    tableCells: 'เซลล์',
    tableCellsMerge: 'ผสานเซลล์',
    tableCellsSplit: 'แยกเซลล์',
    tableStyle: 'สไตล์ตาราง',
    tableCellStyle: 'สไตล์เซลล์',
    tableRemove: 'ลบตาราง',
    snippet: 'สนิปเพ็ต',
    snippetProperties: 'คุณสมบัติ',
    snippetRemove: 'ลบสนิปเพ็ต',
    mediaRemove: 'ลบ',

    // Messages
    uploadFailed: 'ไม่สามารถอัปโหลดไฟล์ได้',
    invalidFileEmptyInsert: 'กรุณาเลือกไฟล์ที่จะแทรก',
    invalidFileSingleInsert: 'กรุณาเลือกไฟล์เดียว',
    invalidImageEmptyInsert: 'กรุณาเลือกรูปภาพที่จะแทรก',
    invalidImageInvalidInsert: 'ไฟล์ที่เลือกไม่ใช่รูปภาพ',
    invalidVideoInvalidInsert: 'ไฟล์ที่เลือกไม่ใช่วิดีโอ',
    invalidAudioInvalidInsert: 'ไฟล์ที่เลือกไม่ใช่ไฟล์เสียง'
};

/*
 * Hotsheet translation: Thai (th)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['th'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'ไม่มีข้อมูล',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'แทรกแถวด้านบน',
    insertRowBelow: 'แทรกแถวด้านล่าง',
    removeRow: 'ลบแถว',
    undo: 'เลิกทำ',
    redo: 'ทำซ้ำ',
    freezeColumn: 'ตรึงคอลัมน์',
    unfreezeColumn: 'ยกเลิกการตรึงคอลัมน์',

    // A cell whose value its column does not accept
    invalidValue: 'ค่าไม่ถูกต้อง',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'เลือกวันที่',
    chooseTime: 'เลือกเวลา'
};

// Select2's own translation, kept for the custom-select control
(function (jQuery) {
/*! Select2 4.1.0 | https://github.com/select2/select2/blob/master/LICENSE.md */

!function(){if(jQuery&&jQuery.fn&&jQuery.fn.select2&&jQuery.fn.select2.amd)var n=jQuery.fn.select2.amd;n.define("select2/i18n/th",[],function(){return{errorLoading:function(){return"ไม่สามารถค้นข้อมูลได้"},inputTooLong:function(n){return"โปรดลบออก "+(n.input.length-n.maximum)+" ตัวอักษร"},inputTooShort:function(n){return"โปรดพิมพ์เพิ่มอีก "+(n.minimum-n.input.length)+" ตัวอักษร"},loadingMore:function(){return"กำลังค้นข้อมูลเพิ่ม…"},maximumSelected:function(n){return"คุณสามารถเลือกได้ไม่เกิน "+n.maximum+" รายการ"},noResults:function(){return"ไม่พบข้อมูล"},searching:function(){return"กำลังค้นข้อมูล…"},removeAllItems:function(){return"ลบรายการทั้งหมด"}}}),n.define,n.require}();
})({ fn: { select2: { amd: { define: function (name, deps, factory) {
    (globalThis.Select2Languages = globalThis.Select2Languages || {})['th'] = factory();
} } } } });
