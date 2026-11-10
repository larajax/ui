/*
 * Translations for id, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Indonesian (id)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['id'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Nilai tidak boleh kosong.',
        ruleInteger: 'Nilai harus berupa bilangan bulat.',
        rulePositiveInteger: 'Nilai harus berupa bilangan bulat positif.',
        ruleFloat: 'Nilai harus berupa bilangan desimal.',
        rulePositiveFloat: 'Nilai harus berupa bilangan desimal positif.',
        ruleMin: 'Nilai tidak boleh kurang dari :min.',
        ruleMax: 'Nilai tidak boleh lebih dari :max.',
        ruleMinLength: 'Teks tidak boleh lebih pendek dari :min karakter.',
        ruleMaxLength: 'Teks tidak boleh lebih panjang dari :max karakter.',
        ruleRegex: 'Format nilai tidak valid.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Tebal',
        italic: 'Miring',
        strikethrough: 'Coret',
        heading1: 'Judul 1',
        heading2: 'Judul 2',
        heading3: 'Judul 3',
        code: 'Kode',
        quote: 'Kutipan',
        unorderedList: 'Daftar berpoin',
        orderedList: 'Daftar bernomor',
        cleanBlock: 'Hapus format blok',
        link: 'Tautan',
        image: 'Gambar',
        table: 'Tabel',
        horizontalRule: 'Sisipkan garis horizontal',
        preview: 'Pratinjau',
        sideBySide: 'Tampilan berdampingan',
        fullscreen: 'Layar penuh'
    },

    // Custom select messages
    customselect: {
        noResults: 'Tidak ada data yang sesuai',
        searching: 'Sedang mencari…',
        loadingMore: 'Mengambil data…',
        errorLoading: 'Data tidak boleh diambil.',
        inputTooShort: 'Masukkan :count huruf lagi',
        maximumSelected: 'Anda hanya dapat memilih :count pilihan',
        removeItem: 'Hapus item',
        removeAllItems: 'Hapus semua item'
    }
};

/*
 * RichArea translation: Indonesian (id)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['id'] = {
    // Toolbar buttons
    toolbar: 'Bilah alat editor',
    fullscreen: 'Layar penuh',
    bold: 'Tebal',
    italic: 'Miring',
    underline: 'Garis bawah',
    strikeThrough: 'Coret',
    subscript: 'Subskrip',
    superscript: 'Superskrip',
    fontFamily: 'Jenis huruf',
    fontSize: 'Ukuran huruf',
    color: 'Warna',
    emoticons: 'Emotikon',
    inlineStyle: 'Gaya sebaris',
    paragraphStyle: 'Gaya paragraf',
    paragraphFormat: 'Format paragraf',
    align: 'Perataan',
    formatOL: 'Daftar bernomor',
    formatUL: 'Daftar berpoin',
    outdent: 'Kurangi indentasi',
    indent: 'Tambah indentasi',
    quote: 'Kutipan',
    insertHR: 'Sisipkan garis horizontal',
    insertLink: 'Sisipkan tautan',
    insertPageLink: 'Sisipkan tautan',
    insertImage: 'Sisipkan gambar',
    insertVideo: 'Sisipkan video',
    insertAudio: 'Sisipkan audio',
    insertFile: 'Sisipkan berkas',
    insertTable: 'Sisipkan tabel',
    insertSnippet: 'Sisipkan cuplikan',
    undo: 'Urungkan',
    redo: 'Ulangi',
    clearFormatting: 'Hapus format',
    selectAll: 'Pilih semua',
    html: 'Tampilan kode',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Normal',
    formatHeading1: 'Judul 1',
    formatHeading2: 'Judul 2',
    formatHeading3: 'Judul 3',
    formatHeading4: 'Judul 4',
    formatHeading5: 'Judul 5',
    formatHeading6: 'Judul 6',
    formatCode: 'Kode',

    // Alignment
    alignLeft: 'Rata kiri',
    alignCenter: 'Rata tengah',
    alignRight: 'Rata kanan',
    alignJustify: 'Rata kiri-kanan',

    // Colors
    textColor: 'Teks',
    backgroundColor: 'Latar belakang',
    removeColor: 'Hapus warna',
    defaultFont: 'Bawaan',

    // Insert menus
    uploadFromComputer: 'Unggah dari komputer',
    browse: 'Telusuri',
    byUrl: 'Dari URL',
    embeddingCode: 'Kode sematan',

    // Popover forms
    url: 'URL',
    text: 'Teks',
    openInNewTab: 'Buka di tab baru',
    linkStyle: 'Gaya',
    none: 'Tidak ada',
    insert: 'Sisipkan',
    update: 'Perbarui',
    cancel: 'Batal',
    remove: 'Hapus',
    browsePages: 'Telusuri halaman',
    alternativeText: 'Teks alternatif',
    width: 'Lebar',
    widthPlaceholder: '300 atau 50%',
    widthInvalid: 'Masukkan lebar dalam piksel atau persentase',
    urlRequired: 'Harap masukkan URL',
    urlInvalid: 'Harap masukkan URL yang valid',
    embeddingCodeRequired: 'Harap masukkan kode sematan',
    embeddingCodeInvalid: 'Kode sematan harus berisi iframe',

    // Contextual toolbars
    openLink: 'Buka tautan',
    editLink: 'Ubah tautan',
    unlink: 'Hapus tautan',
    imageAlign: 'Perataan',
    imageAlignNone: 'Sebaris',
    imageAlignLeft: 'Mengambang kiri',
    imageAlignCenter: 'Tengah',
    imageAlignRight: 'Mengambang kanan',
    imageStyle: 'Gaya gambar',
    imageAlt: 'Teks alternatif',
    imageSize: 'Ubah ukuran',
    imageReplace: 'Ganti',
    imageRemove: 'Hapus gambar',
    imageLink: 'Sisipkan tautan',
    tableHeader: 'Header tabel',
    tableRows: 'Baris',
    tableRowAbove: 'Sisipkan baris di atas',
    tableRowBelow: 'Sisipkan baris di bawah',
    tableRowDelete: 'Hapus baris',
    tableColumns: 'Kolom',
    tableColumnBefore: 'Sisipkan kolom di kiri',
    tableColumnAfter: 'Sisipkan kolom di kanan',
    tableColumnDelete: 'Hapus kolom',
    tableCells: 'Sel',
    tableCellsMerge: 'Gabungkan sel',
    tableCellsSplit: 'Pisahkan sel',
    tableStyle: 'Gaya tabel',
    tableCellStyle: 'Gaya sel',
    tableRemove: 'Hapus tabel',
    snippet: 'Cuplikan',
    snippetProperties: 'Properti',
    snippetRemove: 'Hapus cuplikan',
    mediaRemove: 'Hapus',

    // Messages
    uploadFailed: 'Berkas tidak dapat diunggah',
    invalidFileEmptyInsert: 'Silakan pilih berkas yang akan disisipkan.',
    invalidFileSingleInsert: 'Silakan pilih satu berkas saja.',
    invalidImageEmptyInsert: 'Silakan pilih gambar yang akan disisipkan.',
    invalidImageInvalidInsert: 'Berkas yang dipilih bukan gambar.',
    invalidVideoInvalidInsert: 'Berkas yang dipilih bukan video.',
    invalidAudioInvalidInsert: 'Berkas yang dipilih bukan berkas audio.'
};

/*
 * Hotsheet translation: Indonesian (id)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['id'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Tidak ada data',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Sisipkan baris di atas',
    insertRowBelow: 'Sisipkan baris di bawah',
    removeRow: 'Hapus baris',
    undo: 'Urungkan',
    redo: 'Ulangi',
    freezeColumn: 'Bekukan kolom',
    unfreezeColumn: 'Batalkan pembekuan kolom',

    // A cell whose value its column does not accept
    invalidValue: 'Nilai tidak valid.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Pilih tanggal',
    chooseTime: 'Pilih waktu'
};
