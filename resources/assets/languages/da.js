/*
 * Translations for da, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Danish (da)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['da'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Værdien må ikke være tom.',
        ruleInteger: 'Værdien skal være et heltal.',
        rulePositiveInteger: 'Værdien skal være et positivt heltal.',
        ruleFloat: 'Værdien skal være et decimaltal.',
        rulePositiveFloat: 'Værdien skal være et positivt decimaltal.',
        ruleMin: 'Værdien må ikke være mindre end :min.',
        ruleMax: 'Værdien må ikke være større end :max.',
        ruleMinLength: 'Teksten må ikke være kortere end :min tegn.',
        ruleMaxLength: 'Teksten må ikke være længere end :max tegn.',
        ruleRegex: 'Værdien har et ugyldigt format.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Fed',
        italic: 'Kursiv',
        strikethrough: 'Gennemstreget',
        heading1: 'Overskrift 1',
        heading2: 'Overskrift 2',
        heading3: 'Overskrift 3',
        code: 'Kode',
        quote: 'Citat',
        unorderedList: 'Punktopstilling',
        orderedList: 'Nummereret liste',
        cleanBlock: 'Ryd blokformatering',
        link: 'Link',
        image: 'Billede',
        table: 'Tabel',
        horizontalRule: 'Indsæt horisontal streg',
        preview: 'Forhåndsvisning',
        sideBySide: 'Side om side',
        fullscreen: 'Fuld skærm'
    },

    // Custom select messages
    customselect: {
        noResults: 'Ingen resultater fundet',
        searching: 'Søger…',
        loadingMore: 'Indlæser flere resultater…',
        errorLoading: 'Resultaterne kunne ikke indlæses.',
        inputTooShort: 'Angiv venligst :count tegn mere',
        maximumSelected: {
            one: 'Du kan kun vælge :count emne',
            other: 'Du kan kun vælge :count emner'
        },
        removeItem: 'Fjern element',
        removeAllItems: 'Fjern alle elementer'
    }
};

/*
 * RichArea translation: Danish (da)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['da'] = {
    // Toolbar buttons
    toolbar: 'Editorens værktøjslinje',
    fullscreen: 'Fuld skærm',
    bold: 'Fed',
    italic: 'Kursiv',
    underline: 'Understreget',
    strikeThrough: 'Gennemstreget',
    subscript: 'Sænket skrift',
    superscript: 'Hævet skrift',
    fontFamily: 'Skrifttype',
    fontSize: 'Skriftstørrelse',
    color: 'Farver',
    emoticons: 'Humørikoner',
    inlineStyle: 'Tegnstil',
    paragraphStyle: 'Afsnitsstil',
    paragraphFormat: 'Afsnitsformat',
    align: 'Juster',
    formatOL: 'Nummereret liste',
    formatUL: 'Punktopstilling',
    outdent: 'Formindsk indrykning',
    indent: 'Forøg indrykning',
    quote: 'Citat',
    insertHR: 'Indsæt horisontal streg',
    insertLink: 'Indsæt link',
    insertPageLink: 'Indsæt link',
    insertImage: 'Indsæt billede',
    insertVideo: 'Indsæt video',
    insertAudio: 'Indsæt lyd',
    insertFile: 'Indsæt fil',
    insertTable: 'Indsæt tabel',
    insertSnippet: 'Indsæt uddrag',
    undo: 'Fortryd',
    redo: 'Annuller fortryd',
    clearFormatting: 'Ryd formatering',
    selectAll: 'Markér alt',
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
    alignCenter: 'Centrer',
    alignRight: 'Højrejuster',
    alignJustify: 'Lige margener',

    // Colors
    textColor: 'Tekst',
    backgroundColor: 'Baggrund',
    removeColor: 'Fjern farve',
    defaultFont: 'Standard',

    // Insert menus
    uploadFromComputer: 'Upload fra computer',
    browse: 'Gennemse',
    byUrl: 'Via URL',
    embeddingCode: 'Indlejringskode',

    // Popover forms
    url: 'URL',
    text: 'Tekst',
    openInNewTab: 'Åbn i ny fane',
    linkStyle: 'Stil',
    none: 'Ingen',
    insert: 'Indsæt',
    update: 'Opdater',
    cancel: 'Annuller',
    remove: 'Fjern',
    browsePages: 'Gennemse sider',
    alternativeText: 'Alternativ tekst',
    width: 'Bredde',
    widthPlaceholder: '300 eller 50%',
    widthInvalid: 'Angiv en bredde i pixels eller procent',
    urlRequired: 'Angiv venligst en URL',
    urlInvalid: 'Angiv venligst en gyldig URL',
    embeddingCodeRequired: 'Angiv venligst indlejringskoden',
    embeddingCodeInvalid: 'Indlejringskoden skal indeholde en iframe',

    // Contextual toolbars
    openLink: 'Åbn link',
    editLink: 'Rediger link',
    unlink: 'Fjern link',
    imageAlign: 'Juster',
    imageAlignNone: 'På linje med tekst',
    imageAlignLeft: 'Flyd til venstre',
    imageAlignCenter: 'Centrer',
    imageAlignRight: 'Flyd til højre',
    imageStyle: 'Billedstil',
    imageAlt: 'Alternativ tekst',
    imageSize: 'Ændr størrelse',
    imageReplace: 'Erstat',
    imageRemove: 'Fjern billede',
    imageLink: 'Indsæt link',
    tableHeader: 'Overskriftsrække',
    tableRows: 'Række',
    tableRowAbove: 'Indsæt række over',
    tableRowBelow: 'Indsæt række under',
    tableRowDelete: 'Slet række',
    tableColumns: 'Kolonne',
    tableColumnBefore: 'Indsæt kolonne før',
    tableColumnAfter: 'Indsæt kolonne efter',
    tableColumnDelete: 'Slet kolonne',
    tableCells: 'Celle',
    tableCellsMerge: 'Flet celler',
    tableCellsSplit: 'Opdel celle',
    tableStyle: 'Tabelstil',
    tableCellStyle: 'Cellestil',
    tableRemove: 'Fjern tabel',
    snippet: 'Uddrag',
    snippetProperties: 'Indstillinger',
    snippetRemove: 'Fjern uddrag',
    mediaRemove: 'Fjern',

    // Messages
    uploadFailed: 'Filen kunne ikke uploades',
    invalidFileEmptyInsert: 'Vælg venligst en fil, der skal indsættes.',
    invalidFileSingleInsert: 'Vælg venligst en enkelt fil.',
    invalidImageEmptyInsert: 'Vælg venligst et billede, der skal indsættes.',
    invalidImageInvalidInsert: 'Den valgte fil er ikke et billede.',
    invalidVideoInvalidInsert: 'Den valgte fil er ikke en video.',
    invalidAudioInvalidInsert: 'Den valgte fil er ikke en lydfil.'
};

/*
 * Hotsheet translation: Danish (da)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['da'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Ingen data',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Indsæt række over',
    insertRowBelow: 'Indsæt række under',
    removeRow: 'Slet række',
    undo: 'Fortryd',
    redo: 'Annuller fortryd',
    freezeColumn: 'Frys kolonne',
    unfreezeColumn: 'Frigør kolonne',

    // A cell whose value its column does not accept
    invalidValue: 'Værdien er ugyldig.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Vælg dato',
    chooseTime: 'Vælg tidspunkt'
};
