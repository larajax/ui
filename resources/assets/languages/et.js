/*
 * Translations for et, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Estonian (et)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['et'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Väärtus ei tohi olla tühi.',
        ruleInteger: 'Väärtus peab olema täisarv.',
        rulePositiveInteger: 'Väärtus peab olema positiivne täisarv.',
        ruleFloat: 'Väärtus peab olema kümnendmurd.',
        rulePositiveFloat: 'Väärtus peab olema positiivne kümnendmurd.',
        ruleMin: 'Väärtus ei tohi olla väiksem kui :min.',
        ruleMax: 'Väärtus ei tohi olla suurem kui :max.',
        ruleMinLength: 'Tekst ei tohi olla lühem kui :min tähemärki.',
        ruleMaxLength: 'Tekst ei tohi olla pikem kui :max tähemärki.',
        ruleRegex: 'Väärtuse vorming ei ole kehtiv.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Paks',
        italic: 'Kursiiv',
        strikethrough: 'Läbikriipsutus',
        heading1: 'Pealkiri 1',
        heading2: 'Pealkiri 2',
        heading3: 'Pealkiri 3',
        code: 'Kood',
        quote: 'Tsitaat',
        unorderedList: 'Täpploend',
        orderedList: 'Nummerdatud loend',
        cleanBlock: 'Eemalda ploki vorming',
        link: 'Link',
        image: 'Pilt',
        table: 'Tabel',
        horizontalRule: 'Sisesta horisontaaljoon',
        preview: 'Eelvaade',
        sideBySide: 'Kõrvuti',
        fullscreen: 'Täisekraan'
    }
};

/*
 * RichArea translation: Estonian (et)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['et'] = {
    // Toolbar buttons
    toolbar: 'Redaktori tööriistariba',
    fullscreen: 'Täisekraan',
    bold: 'Paks',
    italic: 'Kursiiv',
    underline: 'Allakriipsutus',
    strikeThrough: 'Läbikriipsutus',
    subscript: 'Alaindeks',
    superscript: 'Ülaindeks',
    fontFamily: 'Font',
    fontSize: 'Fondi suurus',
    color: 'Värvid',
    emoticons: 'Emotikonid',
    inlineStyle: 'Tekstistiil',
    paragraphStyle: 'Lõigustiil',
    paragraphFormat: 'Lõigu vorming',
    align: 'Joonda',
    formatOL: 'Nummerdatud loend',
    formatUL: 'Täpploend',
    outdent: 'Vähenda taanet',
    indent: 'Suurenda taanet',
    quote: 'Tsitaat',
    insertHR: 'Sisesta horisontaaljoon',
    insertLink: 'Sisesta link',
    insertPageLink: 'Sisesta link',
    insertImage: 'Sisesta pilt',
    insertVideo: 'Sisesta video',
    insertAudio: 'Sisesta heliklipp',
    insertFile: 'Sisesta fail',
    insertTable: 'Sisesta tabel',
    insertSnippet: 'Sisesta katkend',
    undo: 'Võta tagasi',
    redo: 'Tee uuesti',
    clearFormatting: 'Eemalda vorming',
    selectAll: 'Vali kõik',
    html: 'Koodivaade',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Tavaline',
    formatHeading1: 'Pealkiri 1',
    formatHeading2: 'Pealkiri 2',
    formatHeading3: 'Pealkiri 3',
    formatHeading4: 'Pealkiri 4',
    formatHeading5: 'Pealkiri 5',
    formatHeading6: 'Pealkiri 6',
    formatCode: 'Kood',

    // Alignment
    alignLeft: 'Joonda vasakule',
    alignCenter: 'Joonda keskele',
    alignRight: 'Joonda paremale',
    alignJustify: 'Rööpjoonda',

    // Colors
    textColor: 'Tekst',
    backgroundColor: 'Taust',
    removeColor: 'Eemalda värv',
    defaultFont: 'Vaikimisi',

    // Insert menus
    uploadFromComputer: 'Laadi üles arvutist',
    browse: 'Sirvi',
    byUrl: 'URL-i kaudu',
    embeddingCode: 'Manustamiskood',

    // Popover forms
    url: 'URL',
    text: 'Tekst',
    openInNewTab: 'Ava uuel vahelehel',
    linkStyle: 'Stiil',
    none: 'Puudub',
    insert: 'Sisesta',
    update: 'Värskenda',
    cancel: 'Tühista',
    remove: 'Eemalda',
    browsePages: 'Sirvi lehti',
    alternativeText: 'Alternatiivtekst',
    width: 'Laius',
    widthPlaceholder: '300 või 50%',
    widthInvalid: 'Sisesta laius pikslites või protsentides',
    urlRequired: 'Palun sisesta URL',
    urlInvalid: 'Palun sisesta kehtiv URL',
    embeddingCodeRequired: 'Palun sisesta manustamiskood',
    embeddingCodeInvalid: 'Manustamiskoodis peab olema iframe',

    // Contextual toolbars
    openLink: 'Ava link',
    editLink: 'Muuda linki',
    unlink: 'Eemalda link',
    imageAlign: 'Joonda',
    imageAlignNone: 'Tekstiga ühel joonel',
    imageAlignLeft: 'Ujuv vasakul',
    imageAlignCenter: 'Keskele',
    imageAlignRight: 'Ujuv paremal',
    imageStyle: 'Pildi stiil',
    imageAlt: 'Alternatiivtekst',
    imageSize: 'Muuda suurust',
    imageReplace: 'Asenda',
    imageRemove: 'Eemalda pilt',
    imageLink: 'Sisesta link',
    tableHeader: 'Tabeli päis',
    tableRows: 'Rida',
    tableRowAbove: 'Lisa rida ülespoole',
    tableRowBelow: 'Lisa rida allapoole',
    tableRowDelete: 'Kustuta rida',
    tableColumns: 'Veerg',
    tableColumnBefore: 'Lisa veerg ette',
    tableColumnAfter: 'Lisa veerg järele',
    tableColumnDelete: 'Kustuta veerg',
    tableCells: 'Lahter',
    tableCellsMerge: 'Ühenda lahtrid',
    tableCellsSplit: 'Poolita lahter',
    tableStyle: 'Tabeli stiil',
    tableCellStyle: 'Lahtri stiil',
    tableRemove: 'Eemalda tabel',
    snippet: 'Katkend',
    snippetProperties: 'Seaded',
    snippetRemove: 'Eemalda katkend',
    mediaRemove: 'Eemalda',

    // Messages
    uploadFailed: 'Faili ei õnnestunud üles laadida',
    invalidFileEmptyInsert: 'Palun vali fail, mida lisada.',
    invalidFileSingleInsert: 'Palun vali üks fail.',
    invalidImageEmptyInsert: 'Palun vali pilt, mida lisada.',
    invalidImageInvalidInsert: 'Valitud fail ei ole pilt.',
    invalidVideoInvalidInsert: 'Valitud fail ei ole video.',
    invalidAudioInvalidInsert: 'Valitud fail ei ole helifail.'
};

/*
 * Hotsheet translation: Estonian (et)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['et'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Andmed puuduvad',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Lisa rida ülespoole',
    insertRowBelow: 'Lisa rida allapoole',
    removeRow: 'Kustuta rida',
    undo: 'Võta tagasi',
    redo: 'Tee uuesti',
    freezeColumn: 'Külmuta veerg',
    unfreezeColumn: 'Vabasta veerg',

    // A cell whose value its column does not accept
    invalidValue: 'Väärtus ei ole kehtiv.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Vali kuupäev',
    chooseTime: 'Vali kellaaeg'
};
