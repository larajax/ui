/*
 * Translations for hr, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Croatian (hr)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['hr'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Vrijednost ne smije biti prazna.',
        ruleInteger: 'Vrijednost mora biti cijeli broj.',
        rulePositiveInteger: 'Vrijednost mora biti pozitivan cijeli broj.',
        ruleFloat: 'Vrijednost mora biti decimalni broj.',
        rulePositiveFloat: 'Vrijednost mora biti pozitivan decimalni broj.',
        ruleMin: 'Vrijednost ne smije biti manja od :min.',
        ruleMax: 'Vrijednost ne smije biti veća od :max.',
        ruleMinLength: 'Broj znakova ne smije biti manji od :min.',
        ruleMaxLength: 'Broj znakova ne smije biti veći od :max.',
        ruleRegex: 'Neispravan format vrijednosti.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Podebljano',
        italic: 'Kurziv',
        strikethrough: 'Precrtano',
        heading1: 'Naslov 1',
        heading2: 'Naslov 2',
        heading3: 'Naslov 3',
        code: 'Kod',
        quote: 'Citat',
        unorderedList: 'Nenumerirani popis',
        orderedList: 'Numerirani popis',
        cleanBlock: 'Očisti oblikovanje bloka',
        link: 'Poveznica',
        image: 'Slika',
        table: 'Tablica',
        horizontalRule: 'Umetni vodoravnu crtu',
        preview: 'Pretpregled',
        sideBySide: 'Usporedni prikaz',
        fullscreen: 'Cijeli zaslon'
    },

    // Custom select messages
    customselect: {
        noResults: 'Nema rezultata',
        searching: 'Pretraga…',
        loadingMore: 'Učitavanje rezultata…',
        errorLoading: 'Preuzimanje nije uspjelo.',
        inputTooShort: {
            one: 'Unesite još  :count znak',
            few: 'Unesite još  :count znaka',
            other: 'Unesite još  :count znakova'
        },
        maximumSelected: 'Maksimalan broj odabranih stavki je :count',
        removeItem: 'Ukloni stavku',
        removeAllItems: 'Ukloni sve stavke'
    }
};

/*
 * RichArea translation: Croatian (hr)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['hr'] = {
    // Toolbar buttons
    toolbar: 'Alatna traka uređivača',
    fullscreen: 'Cijeli zaslon',
    bold: 'Podebljano',
    italic: 'Kurziv',
    underline: 'Podcrtano',
    strikeThrough: 'Precrtano',
    subscript: 'Indeks',
    superscript: 'Eksponent',
    fontFamily: 'Vrsta fonta',
    fontSize: 'Veličina fonta',
    color: 'Boje',
    emoticons: 'Emotikoni',
    inlineStyle: 'Stil teksta',
    paragraphStyle: 'Stil odlomka',
    paragraphFormat: 'Format odlomka',
    align: 'Poravnanje',
    formatOL: 'Numerirani popis',
    formatUL: 'Nenumerirani popis',
    outdent: 'Smanji uvlaku',
    indent: 'Povećaj uvlaku',
    quote: 'Citat',
    insertHR: 'Umetni vodoravnu crtu',
    insertLink: 'Umetni poveznicu',
    insertPageLink: 'Umetni poveznicu',
    insertImage: 'Umetni sliku',
    insertVideo: 'Umetni videozapis',
    insertAudio: 'Umetni zvučni zapis',
    insertFile: 'Umetni datoteku',
    insertTable: 'Umetni tablicu',
    insertSnippet: 'Umetni isječak',
    undo: 'Poništi',
    redo: 'Ponovi',
    clearFormatting: 'Očisti oblikovanje',
    selectAll: 'Odaberi sve',
    html: 'Prikaz koda',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Normalno',
    formatHeading1: 'Naslov 1',
    formatHeading2: 'Naslov 2',
    formatHeading3: 'Naslov 3',
    formatHeading4: 'Naslov 4',
    formatHeading5: 'Naslov 5',
    formatHeading6: 'Naslov 6',
    formatCode: 'Kod',

    // Alignment
    alignLeft: 'Poravnaj lijevo',
    alignCenter: 'Centriraj',
    alignRight: 'Poravnaj desno',
    alignJustify: 'Obostrano poravnaj',

    // Colors
    textColor: 'Tekst',
    backgroundColor: 'Pozadina',
    removeColor: 'Ukloni boju',
    defaultFont: 'Zadano',

    // Insert menus
    uploadFromComputer: 'Prenesi s računala',
    browse: 'Pregledaj',
    byUrl: 'Putem URL-a',
    embeddingCode: 'Kod za ugradnju',

    // Popover forms
    url: 'URL',
    text: 'Tekst',
    openInNewTab: 'Otvori u novoj kartici',
    linkStyle: 'Stil',
    none: 'Nijedan',
    insert: 'Umetni',
    update: 'Ažuriraj',
    cancel: 'Odustani',
    remove: 'Ukloni',
    browsePages: 'Pregledaj stranice',
    alternativeText: 'Zamjenski tekst',
    width: 'Širina',
    widthPlaceholder: '300 ili 50%',
    widthInvalid: 'Unesite širinu u pikselima ili postocima',
    urlRequired: 'Unesite URL',
    urlInvalid: 'Unesite valjani URL',
    embeddingCodeRequired: 'Unesite kod za ugradnju',
    embeddingCodeInvalid: 'Kod za ugradnju mora sadržavati iframe',

    // Contextual toolbars
    openLink: 'Otvori poveznicu',
    editLink: 'Uredi poveznicu',
    unlink: 'Ukloni poveznicu',
    imageAlign: 'Poravnanje',
    imageAlignNone: 'U retku s tekstom',
    imageAlignLeft: 'Plutajuće lijevo',
    imageAlignCenter: 'Centrirano',
    imageAlignRight: 'Plutajuće desno',
    imageStyle: 'Stil slike',
    imageAlt: 'Zamjenski tekst',
    imageSize: 'Promijeni veličinu',
    imageReplace: 'Zamijeni',
    imageRemove: 'Ukloni sliku',
    imageLink: 'Umetni poveznicu',
    tableHeader: 'Zaglavlje tablice',
    tableRows: 'Redak',
    tableRowAbove: 'Umetni redak iznad',
    tableRowBelow: 'Umetni redak ispod',
    tableRowDelete: 'Izbriši redak',
    tableColumns: 'Stupac',
    tableColumnBefore: 'Umetni stupac ispred',
    tableColumnAfter: 'Umetni stupac iza',
    tableColumnDelete: 'Izbriši stupac',
    tableCells: 'Ćelija',
    tableCellsMerge: 'Spoji ćelije',
    tableCellsSplit: 'Podijeli ćeliju',
    tableStyle: 'Stil tablice',
    tableCellStyle: 'Stil ćelije',
    tableRemove: 'Ukloni tablicu',
    snippet: 'Isječak',
    snippetProperties: 'Svojstva',
    snippetRemove: 'Ukloni isječak',
    mediaRemove: 'Ukloni',

    // Messages
    uploadFailed: 'Prijenos datoteke nije uspio',
    invalidFileEmptyInsert: 'Odaberite datoteku za umetanje.',
    invalidFileSingleInsert: 'Odaberite samo jednu datoteku.',
    invalidImageEmptyInsert: 'Odaberite sliku za umetanje.',
    invalidImageInvalidInsert: 'Odabrana datoteka nije slika.',
    invalidVideoInvalidInsert: 'Odabrana datoteka nije videozapis.',
    invalidAudioInvalidInsert: 'Odabrana datoteka nije zvučna datoteka.'
};

/*
 * Hotsheet translation: Croatian (hr)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['hr'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Nema podataka',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Umetni redak iznad',
    insertRowBelow: 'Umetni redak ispod',
    removeRow: 'Ukloni redak',
    undo: 'Poništi',
    redo: 'Ponovi',
    freezeColumn: 'Zamrzni stupac',
    unfreezeColumn: 'Odmrzni stupac',

    // A cell whose value its column does not accept
    invalidValue: 'Vrijednost nije valjana.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Odaberi datum',
    chooseTime: 'Odaberi vrijeme'
};
