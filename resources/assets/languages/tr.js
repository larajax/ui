/*
 * Translations for tr, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Turkish (tr)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['tr'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Değer boş olmamalıdır.',
        ruleInteger: 'Değer bir tam sayı olmalıdır.',
        rulePositiveInteger: 'Değer pozitif bir tam sayı olmalıdır.',
        ruleFloat: 'Değer ondalık bir sayı olmalıdır.',
        rulePositiveFloat: 'Değer pozitif ondalık bir sayı olmalıdır.',
        ruleMin: 'Değer :min değerinden küçük olmamalıdır.',
        ruleMax: 'Değer :max değerinden büyük olmamalıdır.',
        ruleMinLength: 'Metin :min karakterden kısa olmamalıdır.',
        ruleMaxLength: 'Metin :max karakterden uzun olmamalıdır.',
        ruleRegex: 'Değer biçimi geçersiz.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Kalın',
        italic: 'İtalik',
        strikethrough: 'Üstü çizili',
        heading1: 'Başlık 1',
        heading2: 'Başlık 2',
        heading3: 'Başlık 3',
        code: 'Kod',
        quote: 'Alıntı',
        unorderedList: 'Sırasız liste',
        orderedList: 'Sıralı liste',
        cleanBlock: 'Paragraf biçimini temizle',
        link: 'Bağlantı',
        image: 'Resim',
        table: 'Tablo',
        horizontalRule: 'Yatay çizgi ekle',
        preview: 'Önizleme',
        sideBySide: 'Yan yana görünüm',
        fullscreen: 'Tam ekran'
    },

    // Custom select messages
    customselect: {
        noResults: 'Sonuç bulunamadı',
        searching: 'Aranıyor…',
        loadingMore: 'Daha fazla…',
        errorLoading: 'Sonuç yüklenemedi',
        inputTooShort: 'En az :count karakter daha girmelisiniz',
        maximumSelected: 'Sadece :count seçim yapabilirsiniz',
        removeItem: 'Bu öğeyi kaldır',
        removeAllItems: 'Tüm öğeleri kaldır'
    }
};

/*
 * RichArea translation: Turkish (tr)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['tr'] = {
    // Toolbar buttons
    toolbar: 'Düzenleyici araç çubuğu',
    fullscreen: 'Tam ekran',
    bold: 'Kalın',
    italic: 'İtalik',
    underline: 'Altı çizili',
    strikeThrough: 'Üstü çizili',
    subscript: 'Alt simge',
    superscript: 'Üst simge',
    fontFamily: 'Font ailesi',
    fontSize: 'Font büyüklüğü',
    color: 'Renkler',
    emoticons: 'İfadeler',
    inlineStyle: 'Satır içi stil',
    paragraphStyle: 'Paragraf stili',
    paragraphFormat: 'Paragraf biçimi',
    align: 'Hizala',
    formatOL: 'Sıralı liste',
    formatUL: 'Sırasız liste',
    outdent: 'Girintiyi azalt',
    indent: 'Girintiyi artır',
    quote: 'Alıntı',
    insertHR: 'Yatay çizgi ekle',
    insertLink: 'Bağlantı ekle',
    insertPageLink: 'Bağlantı ekle',
    insertImage: 'Resim ekle',
    insertVideo: 'Video ekle',
    insertAudio: 'Ses ekle',
    insertFile: 'Dosya ekle',
    insertTable: 'Tablo ekle',
    insertSnippet: 'Snippet ekle',
    undo: 'Geri al',
    redo: 'Yinele',
    clearFormatting: 'Biçimlendirmeyi temizle',
    selectAll: 'Tümünü seç',
    html: 'Kod görünümü',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Normal',
    formatHeading1: 'Başlık 1',
    formatHeading2: 'Başlık 2',
    formatHeading3: 'Başlık 3',
    formatHeading4: 'Başlık 4',
    formatHeading5: 'Başlık 5',
    formatHeading6: 'Başlık 6',
    formatCode: 'Kod',

    // Alignment
    alignLeft: 'Sola hizala',
    alignCenter: 'Ortala',
    alignRight: 'Sağa hizala',
    alignJustify: 'İki yana yasla',

    // Colors
    textColor: 'Metin',
    backgroundColor: 'Arka plan',
    removeColor: 'Rengi kaldır',
    defaultFont: 'Varsayılan',

    // Insert menus
    uploadFromComputer: 'Bilgisayardan yükle',
    browse: 'Gözat',
    byUrl: 'URL ile',
    embeddingCode: 'Gömme kodu',

    // Popover forms
    url: 'URL',
    text: 'Metin',
    openInNewTab: 'Yeni sekmede aç',
    linkStyle: 'Stil',
    none: 'Yok',
    insert: 'Ekle',
    update: 'Güncelle',
    cancel: 'İptal',
    remove: 'Kaldır',
    browsePages: 'Sayfalara gözat',
    alternativeText: 'Alternatif metin',
    width: 'Genişlik',
    widthPlaceholder: '300 veya 50%',
    widthInvalid: 'Genişliği piksel veya yüzde olarak girin',
    urlRequired: 'Lütfen bir URL girin',
    urlInvalid: 'Lütfen geçerli bir URL girin',
    embeddingCodeRequired: 'Lütfen gömme kodunu girin',
    embeddingCodeInvalid: 'Gömme kodu bir iframe içermelidir',

    // Contextual toolbars
    openLink: 'Bağlantıyı aç',
    editLink: 'Bağlantıyı düzenle',
    unlink: 'Bağlantıyı kaldır',
    imageAlign: 'Hizala',
    imageAlignNone: 'Satır içi',
    imageAlignLeft: 'Sola yerleştir',
    imageAlignCenter: 'Ortala',
    imageAlignRight: 'Sağa yerleştir',
    imageStyle: 'Resim stili',
    imageAlt: 'Alternatif metin',
    imageSize: 'Boyutu değiştir',
    imageReplace: 'Değiştir',
    imageRemove: 'Resmi kaldır',
    imageLink: 'Bağlantı ekle',
    tableHeader: 'Başlık satırı',
    tableRows: 'Satır',
    tableRowAbove: 'Üste satır ekle',
    tableRowBelow: 'Alta satır ekle',
    tableRowDelete: 'Satırı sil',
    tableColumns: 'Sütun',
    tableColumnBefore: 'Öncesine sütun ekle',
    tableColumnAfter: 'Sonrasına sütun ekle',
    tableColumnDelete: 'Sütunu sil',
    tableCells: 'Hücre',
    tableCellsMerge: 'Hücreleri birleştir',
    tableCellsSplit: 'Hücreyi böl',
    tableStyle: 'Tablo stili',
    tableCellStyle: 'Hücre stili',
    tableRemove: 'Tabloyu kaldır',
    snippet: 'Snippet',
    snippetProperties: 'Özellikler',
    snippetRemove: 'Snippet\'i kaldır',
    mediaRemove: 'Kaldır',

    // Messages
    uploadFailed: 'Dosya yüklenemedi',
    invalidFileEmptyInsert: 'Lütfen eklenecek bir dosya seçin.',
    invalidFileSingleInsert: 'Lütfen tek bir dosya seçin.',
    invalidImageEmptyInsert: 'Lütfen eklenecek bir resim seçin.',
    invalidImageInvalidInsert: 'Seçilen dosya bir resim değil.',
    invalidVideoInvalidInsert: 'Seçilen dosya bir video değil.',
    invalidAudioInvalidInsert: 'Seçilen dosya bir ses dosyası değil.'
};

/*
 * Hotsheet translation: Turkish (tr)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['tr'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Veri yok',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Üste satır ekle',
    insertRowBelow: 'Alta satır ekle',
    removeRow: 'Satırı kaldır',
    undo: 'Geri al',
    redo: 'Yinele',
    freezeColumn: 'Sütunu dondur',
    unfreezeColumn: 'Sütunu çöz',

    // A cell whose value its column does not accept
    invalidValue: 'Değer geçersiz.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Tarih seç',
    chooseTime: 'Saat seç'
};
