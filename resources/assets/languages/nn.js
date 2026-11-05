/*
 * Translations for nn, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Norwegian Nynorsk (nn)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['nn'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Verdien kan ikkje vere tom.',
        ruleInteger: 'Verdien må vere eit heiltal.',
        rulePositiveInteger: 'Verdien må vere eit positivt heiltal.',
        ruleFloat: 'Verdien må vere eit desimaltal.',
        rulePositiveFloat: 'Verdien må vere eit positivt desimaltal.',
        ruleMin: 'Verdien kan ikkje vere mindre enn :min.',
        ruleMax: 'Verdien kan ikkje vere større enn :max.',
        ruleMinLength: 'Teksten kan ikkje vere kortare enn :min teikn.',
        ruleMaxLength: 'Teksten kan ikkje vere lengre enn :max teikn.',
        ruleRegex: 'Verdien har eit ugyldig format.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Feit',
        italic: 'Kursiv',
        strikethrough: 'Gjennomstreking',
        heading1: 'Overskrift 1',
        heading2: 'Overskrift 2',
        heading3: 'Overskrift 3',
        code: 'Kode',
        quote: 'Sitat',
        unorderedList: 'Punktliste',
        orderedList: 'Nummerert liste',
        cleanBlock: 'Fjern blokkformatering',
        link: 'Lenkje',
        image: 'Bilete',
        table: 'Tabell',
        horizontalRule: 'Set inn horisontal linje',
        preview: 'Førehandsvising',
        sideBySide: 'Side ved side',
        fullscreen: 'Fullskjerm'
    }
};

/*
 * RichArea translation: Norwegian Nynorsk (nn)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['nn'] = {
    // Toolbar buttons
    toolbar: 'Verktøylinje for redigering',
    fullscreen: 'Fullskjerm',
    bold: 'Feit',
    italic: 'Kursiv',
    underline: 'Understreking',
    strikeThrough: 'Gjennomstreking',
    subscript: 'Senka skrift',
    superscript: 'Heva skrift',
    fontFamily: 'Skrifttype',
    fontSize: 'Tekststorleik',
    color: 'Fargar',
    emoticons: 'Uttrykksikon',
    inlineStyle: 'Teiknstil',
    paragraphStyle: 'Avsnittsstil',
    paragraphFormat: 'Avsnittsformat',
    align: 'Juster',
    formatOL: 'Nummerert liste',
    formatUL: 'Punktliste',
    outdent: 'Reduser innrykk',
    indent: 'Auk innrykk',
    quote: 'Sitat',
    insertHR: 'Set inn horisontal linje',
    insertLink: 'Set inn lenkje',
    insertPageLink: 'Set inn lenkje',
    insertImage: 'Set inn bilete',
    insertVideo: 'Set inn video',
    insertAudio: 'Set inn lyd',
    insertFile: 'Set inn fil',
    insertTable: 'Set inn tabell',
    insertSnippet: 'Set inn snippet',
    undo: 'Angre',
    redo: 'Gjer om',
    clearFormatting: 'Fjern formatering',
    selectAll: 'Merk alt',
    html: 'Kodevising',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Skift',

    // Paragraph formats
    formatNormal: 'Normal',
    formatHeading1: 'Overskrift 1',
    formatHeading2: 'Overskrift 2',
    formatHeading3: 'Overskrift 3',
    formatHeading4: 'Overskrift 4',
    formatHeading5: 'Overskrift 5',
    formatHeading6: 'Overskrift 6',
    formatCode: 'Kode',

    // Alignment
    alignLeft: 'Venstrejuster',
    alignCenter: 'Midtstill',
    alignRight: 'Høgrejuster',
    alignJustify: 'Blokkjuster',

    // Colors
    textColor: 'Tekst',
    backgroundColor: 'Bakgrunn',
    removeColor: 'Fjern farge',
    defaultFont: 'Standard',

    // Insert menus
    uploadFromComputer: 'Last opp frå datamaskin',
    browse: 'Bla gjennom',
    byUrl: 'Via URL',
    embeddingCode: 'Innebyggingskode',

    // Popover forms
    url: 'URL',
    text: 'Tekst',
    openInNewTab: 'Opne i ny fane',
    linkStyle: 'Stil',
    none: 'Ingen',
    insert: 'Set inn',
    update: 'Oppdater',
    cancel: 'Avbryt',
    remove: 'Fjern',
    browsePages: 'Bla gjennom sider',
    alternativeText: 'Alternativ tekst',
    width: 'Breidd',
    widthPlaceholder: '300 eller 50%',
    widthInvalid: 'Skriv inn ei breidd i pikslar eller prosent',
    urlRequired: 'Skriv inn ein URL',
    urlInvalid: 'Skriv inn ein gyldig URL',
    embeddingCodeRequired: 'Skriv inn innebyggingskoden',
    embeddingCodeInvalid: 'Innebyggingskoden må innehalde ein iframe',

    // Contextual toolbars
    openLink: 'Opne lenkje',
    editLink: 'Rediger lenkje',
    unlink: 'Fjern lenkje',
    imageAlign: 'Juster',
    imageAlignNone: 'I tekstlinja',
    imageAlignLeft: 'Flytande venstre',
    imageAlignCenter: 'Midtstill',
    imageAlignRight: 'Flytande høgre',
    imageStyle: 'Biletstil',
    imageAlt: 'Alternativ tekst',
    imageSize: 'Endre storleik',
    imageReplace: 'Byt ut',
    imageRemove: 'Fjern bilete',
    imageLink: 'Set inn lenkje',
    tableHeader: 'Tabelloverskrift',
    tableRows: 'Rad',
    tableRowAbove: 'Set inn rad over',
    tableRowBelow: 'Set inn rad under',
    tableRowDelete: 'Slett rad',
    tableColumns: 'Kolonne',
    tableColumnBefore: 'Set inn kolonne før',
    tableColumnAfter: 'Set inn kolonne etter',
    tableColumnDelete: 'Slett kolonne',
    tableCells: 'Celle',
    tableCellsMerge: 'Slå saman celler',
    tableCellsSplit: 'Del celle',
    tableStyle: 'Tabellstil',
    tableCellStyle: 'Cellestil',
    tableRemove: 'Fjern tabell',
    snippet: 'Snippet',
    snippetProperties: 'Eigenskapar',
    snippetRemove: 'Fjern snippet',
    mediaRemove: 'Fjern',

    // Messages
    uploadFailed: 'Fila kunne ikkje lastast opp',
    invalidFileEmptyInsert: 'Vel ei fil å setje inn.',
    invalidFileSingleInsert: 'Vel berre éi fil.',
    invalidImageEmptyInsert: 'Vel eit bilete å setje inn.',
    invalidImageInvalidInsert: 'Den valde fila er ikkje eit bilete.',
    invalidVideoInvalidInsert: 'Den valde fila er ikkje ein video.',
    invalidAudioInvalidInsert: 'Den valde fila er ikkje ei lydfil.'
};

/*
 * Hotsheet translation: Norwegian Nynorsk (nn)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['nn'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Ingen data',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Set inn rad over',
    insertRowBelow: 'Set inn rad under',
    removeRow: 'Slett rad',
    undo: 'Angre',
    redo: 'Gjer om',
    freezeColumn: 'Frys kolonne',
    unfreezeColumn: 'Opphev frysing av kolonne',

    // A cell whose value its column does not accept
    invalidValue: 'Verdien er ugyldig.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Vel dato',
    chooseTime: 'Vel klokkeslett'
};
