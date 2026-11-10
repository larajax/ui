/*
 * Translations for nb, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Norwegian Bokmål (nb)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['nb'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Verdien kan ikke være tom.',
        ruleInteger: 'Verdien må være et heltall.',
        rulePositiveInteger: 'Verdien må være et positivt heltall.',
        ruleFloat: 'Verdien må være et desimaltall.',
        rulePositiveFloat: 'Verdien må være et positivt desimaltall.',
        ruleMin: 'Verdien kan ikke være mindre enn :min.',
        ruleMax: 'Verdien kan ikke være større enn :max.',
        ruleMinLength: 'Teksten kan ikke være kortere enn :min tegn.',
        ruleMaxLength: 'Teksten kan ikke være lengre enn :max tegn.',
        ruleRegex: 'Verdien har et ugyldig format.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Fet',
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
        link: 'Lenke',
        image: 'Bilde',
        table: 'Tabell',
        horizontalRule: 'Sett inn horisontal linje',
        preview: 'Forhåndsvisning',
        sideBySide: 'Side ved side',
        fullscreen: 'Fullskjerm'
    },

    // Custom select messages
    customselect: {
        noResults: 'Ingen treff',
        searching: 'Søker…',
        loadingMore: 'Laster flere resultater…',
        errorLoading: 'Kunne ikke hente resultater.',
        inputTooShort: 'Vennligst skriv inn :count tegn til',
        maximumSelected: 'Du kan velge maks :count elementer',
        removeItem: 'Fjern element',
        removeAllItems: 'Fjern alle elementer'
    }
};

/*
 * RichArea translation: Norwegian Bokmål (nb)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['nb'] = {
    // Toolbar buttons
    toolbar: 'Verktøylinje for redigering',
    fullscreen: 'Fullskjerm',
    bold: 'Fet',
    italic: 'Kursiv',
    underline: 'Understreking',
    strikeThrough: 'Gjennomstreking',
    subscript: 'Senket skrift',
    superscript: 'Hevet skrift',
    fontFamily: 'Skrifttype',
    fontSize: 'Skriftstørrelse',
    color: 'Farger',
    emoticons: 'Uttrykksikoner',
    inlineStyle: 'Tegnstil',
    paragraphStyle: 'Avsnittsstil',
    paragraphFormat: 'Avsnittsformat',
    align: 'Juster',
    formatOL: 'Nummerert liste',
    formatUL: 'Punktliste',
    outdent: 'Reduser innrykk',
    indent: 'Øk innrykk',
    quote: 'Sitat',
    insertHR: 'Sett inn horisontal linje',
    insertLink: 'Sett inn lenke',
    insertPageLink: 'Sett inn lenke',
    insertImage: 'Sett inn bilde',
    insertVideo: 'Sett inn video',
    insertAudio: 'Sett inn lyd',
    insertFile: 'Sett inn fil',
    insertTable: 'Sett inn tabell',
    insertSnippet: 'Sett inn snippet',
    undo: 'Angre',
    redo: 'Gjør om',
    clearFormatting: 'Fjern formatering',
    selectAll: 'Merk alt',
    html: 'Kodevisning',

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
    alignRight: 'Høyrejuster',
    alignJustify: 'Blokkjuster',

    // Colors
    textColor: 'Tekst',
    backgroundColor: 'Bakgrunn',
    removeColor: 'Fjern farge',
    defaultFont: 'Standard',

    // Insert menus
    uploadFromComputer: 'Last opp fra datamaskin',
    browse: 'Bla gjennom',
    byUrl: 'Via URL',
    embeddingCode: 'Innebyggingskode',

    // Popover forms
    url: 'URL',
    text: 'Tekst',
    openInNewTab: 'Åpne i ny fane',
    linkStyle: 'Stil',
    none: 'Ingen',
    insert: 'Sett inn',
    update: 'Oppdater',
    cancel: 'Avbryt',
    remove: 'Fjern',
    browsePages: 'Bla gjennom sider',
    alternativeText: 'Alternativ tekst',
    width: 'Bredde',
    widthPlaceholder: '300 eller 50%',
    widthInvalid: 'Angi en bredde i piksler eller prosent',
    urlRequired: 'Angi en URL',
    urlInvalid: 'Angi en gyldig URL',
    embeddingCodeRequired: 'Angi innebyggingskoden',
    embeddingCodeInvalid: 'Innebyggingskoden må inneholde en iframe',

    // Contextual toolbars
    openLink: 'Åpne lenke',
    editLink: 'Rediger lenke',
    unlink: 'Fjern lenke',
    imageAlign: 'Juster',
    imageAlignNone: 'På linje med teksten',
    imageAlignLeft: 'Flytende venstre',
    imageAlignCenter: 'Midtstill',
    imageAlignRight: 'Flytende høyre',
    imageStyle: 'Bildestil',
    imageAlt: 'Alternativ tekst',
    imageSize: 'Endre størrelse',
    imageReplace: 'Erstatt',
    imageRemove: 'Fjern bilde',
    imageLink: 'Sett inn lenke',
    tableHeader: 'Overskriftsrad',
    tableRows: 'Rad',
    tableRowAbove: 'Sett inn rad over',
    tableRowBelow: 'Sett inn rad under',
    tableRowDelete: 'Slett rad',
    tableColumns: 'Kolonne',
    tableColumnBefore: 'Sett inn kolonne før',
    tableColumnAfter: 'Sett inn kolonne etter',
    tableColumnDelete: 'Slett kolonne',
    tableCells: 'Celle',
    tableCellsMerge: 'Slå sammen celler',
    tableCellsSplit: 'Del celle',
    tableStyle: 'Tabellstil',
    tableCellStyle: 'Cellestil',
    tableRemove: 'Fjern tabell',
    snippet: 'Snippet',
    snippetProperties: 'Egenskaper',
    snippetRemove: 'Fjern snippet',
    mediaRemove: 'Fjern',

    // Messages
    uploadFailed: 'Filen kunne ikke lastes opp',
    invalidFileEmptyInsert: 'Velg en fil å sette inn.',
    invalidFileSingleInsert: 'Velg én enkelt fil.',
    invalidImageEmptyInsert: 'Velg et bilde å sette inn.',
    invalidImageInvalidInsert: 'Den valgte filen er ikke et bilde.',
    invalidVideoInvalidInsert: 'Den valgte filen er ikke en video.',
    invalidAudioInvalidInsert: 'Den valgte filen er ikke en lydfil.'
};

/*
 * Hotsheet translation: Norwegian Bokmål (nb)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['nb'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Ingen data',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Sett inn rad over',
    insertRowBelow: 'Sett inn rad under',
    removeRow: 'Slett rad',
    undo: 'Angre',
    redo: 'Gjør om',
    freezeColumn: 'Frys kolonne',
    unfreezeColumn: 'Opphev frysing av kolonne',

    // A cell whose value its column does not accept
    invalidValue: 'Verdien er ugyldig.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Velg dato',
    chooseTime: 'Velg klokkeslett'
};
