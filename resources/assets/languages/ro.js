/*
 * Translations for ro, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Romanian (ro)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['ro'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Valoarea nu trebuie să fie goală.',
        ruleInteger: 'Valoarea trebuie să fie un număr întreg.',
        rulePositiveInteger: 'Valoarea trebuie să fie un număr întreg pozitiv.',
        ruleFloat: 'Valoarea trebuie să fie un număr zecimal.',
        rulePositiveFloat: 'Valoarea trebuie să fie un număr zecimal pozitiv.',
        ruleMin: 'Valoarea nu trebuie să fie mai mică decât :min.',
        ruleMax: 'Valoarea nu trebuie să fie mai mare decât :max.',
        ruleMinLength: 'Numărul de caractere nu trebuie să fie mai mic decât :min.',
        ruleMaxLength: 'Numărul de caractere nu trebuie să fie mai mare decât :max.',
        ruleRegex: 'Formatul valorii nu este valid.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Îngroșat',
        italic: 'Italic',
        strikethrough: 'Tăiat',
        heading1: 'Titlu 1',
        heading2: 'Titlu 2',
        heading3: 'Titlu 3',
        code: 'Cod',
        quote: 'Citat',
        unorderedList: 'Listă neordonată',
        orderedList: 'Listă ordonată',
        cleanBlock: 'Eliminați formatarea blocului',
        link: 'Link',
        image: 'Imagine',
        table: 'Tabel',
        horizontalRule: 'Inserați linie orizontală',
        preview: 'Previzualizare',
        sideBySide: 'Vizualizare alăturată',
        fullscreen: 'Ecran complet'
    },

    // Custom select messages
    customselect: {
        noResults: 'Nu au fost găsite rezultate',
        searching: 'Căutare…',
        loadingMore: 'Se încarcă mai multe rezultate…',
        errorLoading: 'Rezultatele nu au putut fi incărcate.',
        inputTooShort: 'Vă rugăm să introduceți :count sau mai multe caractere',
        maximumSelected: {
            one: 'Aveți voie să selectați cel mult :count element',
            few: 'Aveți voie să selectați cel mult :count elemente',
            other: 'Aveți voie să selectați cel mult :count elemente'
        },
        removeItem: 'Eliminați elementul',
        removeAllItems: 'Eliminați toate elementele'
    }
};

/*
 * RichArea translation: Romanian (ro)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['ro'] = {
    // Toolbar buttons
    toolbar: 'Bara de instrumente a editorului',
    fullscreen: 'Ecran complet',
    bold: 'Îngroșat',
    italic: 'Italic',
    underline: 'Subliniat',
    strikeThrough: 'Tăiat',
    subscript: 'Indice',
    superscript: 'Exponent',
    fontFamily: 'Font',
    fontSize: 'Dimensiune font',
    color: 'Culori',
    emoticons: 'Emoticoane',
    inlineStyle: 'Stil text',
    paragraphStyle: 'Stil paragraf',
    paragraphFormat: 'Format paragraf',
    align: 'Aliniere',
    formatOL: 'Listă ordonată',
    formatUL: 'Listă neordonată',
    outdent: 'Micșorați indentarea',
    indent: 'Măriți indentarea',
    quote: 'Citat',
    insertHR: 'Inserați linie orizontală',
    insertLink: 'Inserați link',
    insertPageLink: 'Inserați link',
    insertImage: 'Inserați imagine',
    insertVideo: 'Inserați video',
    insertAudio: 'Inserați audio',
    insertFile: 'Inserați fișier',
    insertTable: 'Inserați tabel',
    insertSnippet: 'Inserați fragment',
    undo: 'Anulați',
    redo: 'Refaceți',
    clearFormatting: 'Eliminați formatarea',
    selectAll: 'Selectați tot',
    html: 'Vizualizare cod',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Normal',
    formatHeading1: 'Titlu 1',
    formatHeading2: 'Titlu 2',
    formatHeading3: 'Titlu 3',
    formatHeading4: 'Titlu 4',
    formatHeading5: 'Titlu 5',
    formatHeading6: 'Titlu 6',
    formatCode: 'Cod',

    // Alignment
    alignLeft: 'Aliniați la stânga',
    alignCenter: 'Centrați',
    alignRight: 'Aliniați la dreapta',
    alignJustify: 'Aliniați stânga-dreapta',

    // Colors
    textColor: 'Text',
    backgroundColor: 'Fundal',
    removeColor: 'Eliminați culoarea',
    defaultFont: 'Implicit',

    // Insert menus
    uploadFromComputer: 'Încărcați de pe computer',
    browse: 'Răsfoiți',
    byUrl: 'De la URL',
    embeddingCode: 'Cod de încorporare',

    // Popover forms
    url: 'URL',
    text: 'Text',
    openInNewTab: 'Deschideți într-o filă nouă',
    linkStyle: 'Stil',
    none: 'Niciunul',
    insert: 'Inserați',
    update: 'Actualizați',
    cancel: 'Anulați',
    remove: 'Eliminați',
    browsePages: 'Răsfoiți paginile',
    alternativeText: 'Text alternativ',
    width: 'Lățime',
    widthPlaceholder: '300 sau 50%',
    widthInvalid: 'Introduceți o lățime în pixeli sau un procent',
    urlRequired: 'Vă rugăm să introduceți o adresă URL',
    urlInvalid: 'Vă rugăm să introduceți o adresă URL validă',
    embeddingCodeRequired: 'Vă rugăm să introduceți codul de încorporare',
    embeddingCodeInvalid: 'Codul de încorporare trebuie să conțină un iframe',

    // Contextual toolbars
    openLink: 'Deschideți linkul',
    editLink: 'Editați linkul',
    unlink: 'Eliminați linkul',
    imageAlign: 'Aliniere',
    imageAlignNone: 'În linie',
    imageAlignLeft: 'Flotant la stânga',
    imageAlignCenter: 'Centrat',
    imageAlignRight: 'Flotant la dreapta',
    imageStyle: 'Stil imagine',
    imageAlt: 'Text alternativ',
    imageSize: 'Modificați dimensiunea',
    imageReplace: 'Înlocuiți',
    imageRemove: 'Eliminați imaginea',
    imageLink: 'Inserați link',
    tableHeader: 'Antet tabel',
    tableRows: 'Rând',
    tableRowAbove: 'Inserați rând deasupra',
    tableRowBelow: 'Inserați rând dedesubt',
    tableRowDelete: 'Ștergeți rândul',
    tableColumns: 'Coloană',
    tableColumnBefore: 'Inserați coloană înainte',
    tableColumnAfter: 'Inserați coloană după',
    tableColumnDelete: 'Ștergeți coloana',
    tableCells: 'Celulă',
    tableCellsMerge: 'Îmbinați celulele',
    tableCellsSplit: 'Scindați celula',
    tableStyle: 'Stil tabel',
    tableCellStyle: 'Stil celulă',
    tableRemove: 'Eliminați tabelul',
    snippet: 'Fragment',
    snippetProperties: 'Proprietăți',
    snippetRemove: 'Eliminați fragmentul',
    mediaRemove: 'Eliminați',

    // Messages
    uploadFailed: 'Fișierul nu a putut fi încărcat',
    invalidFileEmptyInsert: 'Vă rugăm să selectați un fișier de inserat.',
    invalidFileSingleInsert: 'Vă rugăm să selectați un singur fișier.',
    invalidImageEmptyInsert: 'Vă rugăm să selectați o imagine de inserat.',
    invalidImageInvalidInsert: 'Fișierul selectat nu este o imagine.',
    invalidVideoInvalidInsert: 'Fișierul selectat nu este un fișier video.',
    invalidAudioInvalidInsert: 'Fișierul selectat nu este un fișier audio.'
};

/*
 * Hotsheet translation: Romanian (ro)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['ro'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Nu există date',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Inserați rând deasupra',
    insertRowBelow: 'Inserați rând dedesubt',
    removeRow: 'Ștergeți rândul',
    undo: 'Anulați',
    redo: 'Refaceți',
    freezeColumn: 'Înghețați coloana',
    unfreezeColumn: 'Dezghețați coloana',

    // A cell whose value its column does not accept
    invalidValue: 'Valoarea nu este validă.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Alegeți o dată',
    chooseTime: 'Alegeți o oră'
};
