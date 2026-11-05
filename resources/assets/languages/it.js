/*
 * Translations for it, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Italian (it)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['it'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Il valore non deve essere vuoto.',
        ruleInteger: 'Il valore deve essere un numero intero.',
        rulePositiveInteger: 'Il valore deve essere un numero intero positivo.',
        ruleFloat: 'Il valore deve essere un numero decimale.',
        rulePositiveFloat: 'Il valore deve essere un numero decimale positivo.',
        ruleMin: 'Il valore non deve essere inferiore a :min.',
        ruleMax: 'Il valore non deve essere superiore a :max.',
        ruleMinLength: 'Il numero di caratteri non deve essere inferiore a :min.',
        ruleMaxLength: 'Il numero di caratteri non deve essere superiore a :max.',
        ruleRegex: 'Il formato del valore non è valido.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Grassetto',
        italic: 'Corsivo',
        strikethrough: 'Barrato',
        heading1: 'Titolo 1',
        heading2: 'Titolo 2',
        heading3: 'Titolo 3',
        code: 'Codice',
        quote: 'Citazione',
        unorderedList: 'Elenco puntato',
        orderedList: 'Elenco numerato',
        cleanBlock: 'Cancella formattazione blocco',
        link: 'Collegamento',
        image: 'Immagine',
        table: 'Tabella',
        horizontalRule: 'Inserisci linea orizzontale',
        preview: 'Anteprima',
        sideBySide: 'Affiancato',
        fullscreen: 'Schermo intero'
    }
};

/*
 * RichArea translation: Italian (it)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['it'] = {
    // Toolbar buttons
    toolbar: 'Barra degli strumenti dell\'editor',
    fullscreen: 'Schermo intero',
    bold: 'Grassetto',
    italic: 'Corsivo',
    underline: 'Sottolineato',
    strikeThrough: 'Barrato',
    subscript: 'Pedice',
    superscript: 'Apice',
    fontFamily: 'Tipo di carattere',
    fontSize: 'Dimensione carattere',
    color: 'Colori',
    emoticons: 'Emoticon',
    inlineStyle: 'Stile del testo',
    paragraphStyle: 'Stile paragrafo',
    paragraphFormat: 'Formato paragrafo',
    align: 'Allinea',
    formatOL: 'Elenco numerato',
    formatUL: 'Elenco puntato',
    outdent: 'Riduci rientro',
    indent: 'Aumenta rientro',
    quote: 'Citazione',
    insertHR: 'Inserisci linea orizzontale',
    insertLink: 'Inserisci collegamento',
    insertPageLink: 'Inserisci collegamento',
    insertImage: 'Inserisci immagine',
    insertVideo: 'Inserisci video',
    insertAudio: 'Inserisci audio',
    insertFile: 'Inserisci file',
    insertTable: 'Inserisci tabella',
    insertSnippet: 'Inserisci snippet',
    undo: 'Annulla',
    redo: 'Ripeti',
    clearFormatting: 'Cancella formattazione',
    selectAll: 'Seleziona tutto',
    html: 'Vista codice',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Maiusc',

    // Paragraph formats
    formatNormal: 'Normale',
    formatHeading1: 'Titolo 1',
    formatHeading2: 'Titolo 2',
    formatHeading3: 'Titolo 3',
    formatHeading4: 'Titolo 4',
    formatHeading5: 'Titolo 5',
    formatHeading6: 'Titolo 6',
    formatCode: 'Codice',

    // Alignment
    alignLeft: 'Allinea a sinistra',
    alignCenter: 'Allinea al centro',
    alignRight: 'Allinea a destra',
    alignJustify: 'Giustifica',

    // Colors
    textColor: 'Testo',
    backgroundColor: 'Sfondo',
    removeColor: 'Rimuovi colore',
    defaultFont: 'Predefinito',

    // Insert menus
    uploadFromComputer: 'Carica dal computer',
    browse: 'Sfoglia',
    byUrl: 'Da URL',
    embeddingCode: 'Codice di incorporamento',

    // Popover forms
    url: 'URL',
    text: 'Testo',
    openInNewTab: 'Apri in una nuova scheda',
    linkStyle: 'Stile',
    none: 'Nessuno',
    insert: 'Inserisci',
    update: 'Aggiorna',
    cancel: 'Annulla',
    remove: 'Rimuovi',
    browsePages: 'Sfoglia pagine',
    alternativeText: 'Testo alternativo',
    width: 'Larghezza',
    widthPlaceholder: '300 o 50%',
    widthInvalid: 'Inserisci una larghezza in pixel o in percentuale',
    urlRequired: 'Per favore, inserisci un URL',
    urlInvalid: 'Per favore, inserisci un URL valido',
    embeddingCodeRequired: 'Per favore, inserisci il codice di incorporamento',
    embeddingCodeInvalid: 'Il codice di incorporamento deve contenere un iframe',

    // Contextual toolbars
    openLink: 'Apri collegamento',
    editLink: 'Modifica collegamento',
    unlink: 'Rimuovi collegamento',
    imageAlign: 'Allinea',
    imageAlignNone: 'In linea',
    imageAlignLeft: 'Flottante a sinistra',
    imageAlignCenter: 'Centrato',
    imageAlignRight: 'Flottante a destra',
    imageStyle: 'Stile immagine',
    imageAlt: 'Testo alternativo',
    imageSize: 'Cambia dimensione',
    imageReplace: 'Sostituisci',
    imageRemove: 'Rimuovi immagine',
    imageLink: 'Inserisci collegamento',
    tableHeader: 'Intestazione tabella',
    tableRows: 'Riga',
    tableRowAbove: 'Inserisci riga sopra',
    tableRowBelow: 'Inserisci riga sotto',
    tableRowDelete: 'Elimina riga',
    tableColumns: 'Colonna',
    tableColumnBefore: 'Inserisci colonna prima',
    tableColumnAfter: 'Inserisci colonna dopo',
    tableColumnDelete: 'Elimina colonna',
    tableCells: 'Cella',
    tableCellsMerge: 'Unisci celle',
    tableCellsSplit: 'Dividi cella',
    tableStyle: 'Stile tabella',
    tableCellStyle: 'Stile cella',
    tableRemove: 'Rimuovi tabella',
    snippet: 'Snippet',
    snippetProperties: 'Proprietà',
    snippetRemove: 'Rimuovi snippet',
    mediaRemove: 'Rimuovi',

    // Messages
    uploadFailed: 'Impossibile caricare il file',
    invalidFileEmptyInsert: 'Si prega di selezionare un file da inserire.',
    invalidFileSingleInsert: 'Si prega di selezionare un singolo file.',
    invalidImageEmptyInsert: 'Si prega di selezionare un\'immagine da inserire.',
    invalidImageInvalidInsert: 'Il file selezionato non è un\'immagine.',
    invalidVideoInvalidInsert: 'Il file selezionato non è un video.',
    invalidAudioInvalidInsert: 'Il file selezionato non è un file audio.'
};

/*
 * Hotsheet translation: Italian (it)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['it'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Nessun dato',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Inserisci riga sopra',
    insertRowBelow: 'Inserisci riga sotto',
    removeRow: 'Elimina riga',
    undo: 'Annulla',
    redo: 'Ripeti',
    freezeColumn: 'Blocca colonna',
    unfreezeColumn: 'Sblocca colonna',

    // A cell whose value its column does not accept
    invalidValue: 'Il valore non è valido.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Scegli una data',
    chooseTime: 'Scegli un orario'
};
