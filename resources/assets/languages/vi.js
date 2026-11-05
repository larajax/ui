/*
 * Translations for vi, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Vietnamese (vi)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['vi'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Giá trị không được để trống.',
        ruleInteger: 'Giá trị phải là số nguyên.',
        rulePositiveInteger: 'Giá trị phải là số nguyên dương.',
        ruleFloat: 'Giá trị phải là số thực.',
        rulePositiveFloat: 'Giá trị phải là số thực dương.',
        ruleMin: 'Giá trị không được nhỏ hơn :min.',
        ruleMax: 'Giá trị không được lớn hơn :max.',
        ruleMinLength: 'Văn bản không được ngắn hơn :min ký tự.',
        ruleMaxLength: 'Văn bản không được dài hơn :max ký tự.',
        ruleRegex: 'Định dạng giá trị không hợp lệ.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'In đậm',
        italic: 'In nghiêng',
        strikethrough: 'Gạch ngang chữ',
        heading1: 'Tiêu đề 1',
        heading2: 'Tiêu đề 2',
        heading3: 'Tiêu đề 3',
        code: 'Mã',
        quote: 'Trích dẫn',
        unorderedList: 'Danh sách không thứ tự',
        orderedList: 'Danh sách có thứ tự',
        cleanBlock: 'Xóa định dạng khối',
        link: 'Liên kết',
        image: 'Hình ảnh',
        table: 'Bảng',
        horizontalRule: 'Chèn đường kẻ ngang',
        preview: 'Xem trước',
        sideBySide: 'Xem song song',
        fullscreen: 'Toàn màn hình'
    }
};

/*
 * RichArea translation: Vietnamese (vi)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['vi'] = {
    // Toolbar buttons
    toolbar: 'Thanh công cụ trình soạn thảo',
    fullscreen: 'Toàn màn hình',
    bold: 'In đậm',
    italic: 'In nghiêng',
    underline: 'Gạch chân',
    strikeThrough: 'Gạch ngang chữ',
    subscript: 'Chỉ số dưới',
    superscript: 'Chỉ số trên',
    fontFamily: 'Phông chữ',
    fontSize: 'Cỡ chữ',
    color: 'Màu sắc',
    emoticons: 'Biểu tượng cảm xúc',
    inlineStyle: 'Kiểu nội dòng',
    paragraphStyle: 'Kiểu đoạn văn',
    paragraphFormat: 'Định dạng đoạn văn',
    align: 'Căn chỉnh',
    formatOL: 'Danh sách có thứ tự',
    formatUL: 'Danh sách không thứ tự',
    outdent: 'Giảm thụt lề',
    indent: 'Tăng thụt lề',
    quote: 'Trích dẫn',
    insertHR: 'Chèn đường kẻ ngang',
    insertLink: 'Chèn liên kết',
    insertPageLink: 'Chèn liên kết',
    insertImage: 'Chèn hình ảnh',
    insertVideo: 'Chèn video',
    insertAudio: 'Chèn âm thanh',
    insertFile: 'Chèn tệp',
    insertTable: 'Chèn bảng',
    insertSnippet: 'Chèn đoạn mã',
    undo: 'Hoàn tác',
    redo: 'Làm lại',
    clearFormatting: 'Xóa định dạng',
    selectAll: 'Chọn tất cả',
    html: 'Xem mã',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Bình thường',
    formatHeading1: 'Tiêu đề 1',
    formatHeading2: 'Tiêu đề 2',
    formatHeading3: 'Tiêu đề 3',
    formatHeading4: 'Tiêu đề 4',
    formatHeading5: 'Tiêu đề 5',
    formatHeading6: 'Tiêu đề 6',
    formatCode: 'Mã',

    // Alignment
    alignLeft: 'Căn trái',
    alignCenter: 'Căn giữa',
    alignRight: 'Căn phải',
    alignJustify: 'Căn đều hai bên',

    // Colors
    textColor: 'Màu chữ',
    backgroundColor: 'Màu nền',
    removeColor: 'Xóa màu',
    defaultFont: 'Mặc định',

    // Insert menus
    uploadFromComputer: 'Tải lên từ máy tính',
    browse: 'Duyệt',
    byUrl: 'Từ URL',
    embeddingCode: 'Mã nhúng',

    // Popover forms
    url: 'URL',
    text: 'Văn bản',
    openInNewTab: 'Mở trong tab mới',
    linkStyle: 'Kiểu',
    none: 'Không có',
    insert: 'Chèn',
    update: 'Cập nhật',
    cancel: 'Hủy',
    remove: 'Gỡ bỏ',
    browsePages: 'Duyệt trang',
    alternativeText: 'Văn bản thay thế',
    width: 'Chiều rộng',
    widthPlaceholder: '300 hoặc 50%',
    widthInvalid: 'Nhập chiều rộng theo pixel hoặc phần trăm',
    urlRequired: 'Vui lòng nhập URL',
    urlInvalid: 'Vui lòng nhập một URL hợp lệ',
    embeddingCodeRequired: 'Vui lòng nhập mã nhúng',
    embeddingCodeInvalid: 'Mã nhúng phải chứa một iframe',

    // Contextual toolbars
    openLink: 'Mở liên kết',
    editLink: 'Sửa liên kết',
    unlink: 'Hủy liên kết',
    imageAlign: 'Căn chỉnh',
    imageAlignNone: 'Nội dòng',
    imageAlignLeft: 'Đặt bên trái',
    imageAlignCenter: 'Căn giữa',
    imageAlignRight: 'Đặt bên phải',
    imageStyle: 'Kiểu hình ảnh',
    imageAlt: 'Văn bản thay thế',
    imageSize: 'Thay đổi kích thước',
    imageReplace: 'Thay thế',
    imageRemove: 'Xóa hình ảnh',
    imageLink: 'Chèn liên kết',
    tableHeader: 'Hàng tiêu đề',
    tableRows: 'Hàng',
    tableRowAbove: 'Chèn hàng phía trên',
    tableRowBelow: 'Chèn hàng phía dưới',
    tableRowDelete: 'Xóa hàng',
    tableColumns: 'Cột',
    tableColumnBefore: 'Chèn cột bên trái',
    tableColumnAfter: 'Chèn cột bên phải',
    tableColumnDelete: 'Xóa cột',
    tableCells: 'Ô',
    tableCellsMerge: 'Gộp ô',
    tableCellsSplit: 'Tách ô',
    tableStyle: 'Kiểu bảng',
    tableCellStyle: 'Kiểu ô',
    tableRemove: 'Xóa bảng',
    snippet: 'Đoạn mã',
    snippetProperties: 'Thuộc tính',
    snippetRemove: 'Xóa đoạn mã',
    mediaRemove: 'Xóa',

    // Messages
    uploadFailed: 'Không thể tải tệp lên',
    invalidFileEmptyInsert: 'Vui lòng chọn tệp để chèn.',
    invalidFileSingleInsert: 'Vui lòng chỉ chọn một tệp.',
    invalidImageEmptyInsert: 'Vui lòng chọn hình ảnh để chèn.',
    invalidImageInvalidInsert: 'Tệp đã chọn không phải là hình ảnh.',
    invalidVideoInvalidInsert: 'Tệp đã chọn không phải là video.',
    invalidAudioInvalidInsert: 'Tệp đã chọn không phải là tệp âm thanh.'
};

/*
 * Hotsheet translation: Vietnamese (vi)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['vi'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Không có dữ liệu',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Chèn hàng phía trên',
    insertRowBelow: 'Chèn hàng phía dưới',
    removeRow: 'Xóa hàng',
    undo: 'Hoàn tác',
    redo: 'Làm lại',
    freezeColumn: 'Cố định cột',
    unfreezeColumn: 'Bỏ cố định cột',

    // A cell whose value its column does not accept
    invalidValue: 'Giá trị không hợp lệ.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Chọn ngày',
    chooseTime: 'Chọn giờ'
};

// Select2's own translation, kept for the custom-select control
(function (jQuery) {
/*! Select2 4.1.0 | https://github.com/select2/select2/blob/master/LICENSE.md */

!function(){if(jQuery&&jQuery.fn&&jQuery.fn.select2&&jQuery.fn.select2.amd)var n=jQuery.fn.select2.amd;n.define("select2/i18n/vi",[],function(){return{inputTooLong:function(n){return"Vui lòng xóa bớt "+(n.input.length-n.maximum)+" ký tự"},inputTooShort:function(n){return"Vui lòng nhập thêm từ "+(n.minimum-n.input.length)+" ký tự trở lên"},loadingMore:function(){return"Đang lấy thêm kết quả…"},maximumSelected:function(n){return"Chỉ có thể chọn được "+n.maximum+" lựa chọn"},noResults:function(){return"Không tìm thấy kết quả"},searching:function(){return"Đang tìm…"},removeAllItems:function(){return"Xóa tất cả các mục"}}}),n.define,n.require}();
})({ fn: { select2: { amd: { define: function (name, deps, factory) {
    (globalThis.Select2Languages = globalThis.Select2Languages || {})['vi'] = factory();
} } } } });
