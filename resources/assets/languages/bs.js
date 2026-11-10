/*
 * Translations for bs, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Bosnian (bs)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['bs'] = {
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
        unorderedList: 'Nenumerisana lista',
        orderedList: 'Numerisana lista',
        cleanBlock: 'Očisti formatiranje bloka',
        link: 'Link',
        image: 'Slika',
        table: 'Tabela',
        horizontalRule: 'Umetni horizontalnu liniju',
        preview: 'Pregled',
        sideBySide: 'Uporedni prikaz',
        fullscreen: 'Cijeli ekran'
    },

    // Custom select messages
    customselect: {
        noResults: 'Ništa nije pronađeno',
        searching: 'Pretraga…',
        loadingMore: 'Preuzimanje još rezultata…',
        errorLoading: 'Preuzimanje nije uspijelo.',
        inputTooShort: {
            one: 'Ukucajte bar još :count simbol',
            few: 'Ukucajte bar još :count simbola',
            other: 'Ukucajte bar još :count simbola'
        },
        maximumSelected: {
            one: 'Možete izabrati samo :count stavku',
            few: 'Možete izabrati samo :count stavke',
            other: 'Možete izabrati samo :count stavki'
        },
        removeItem: 'Ukloni stavku',
        removeAllItems: 'Uklonite sve stavke'
    }
};

/*
 * RichArea translation: Bosnian (bs)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['bs'] = {
    // Toolbar buttons
    toolbar: 'Traka s alatima uređivača',
    fullscreen: 'Cijeli ekran',
    bold: 'Podebljano',
    italic: 'Kurziv',
    underline: 'Podvučeno',
    strikeThrough: 'Precrtano',
    subscript: 'Indeks',
    superscript: 'Eksponent',
    fontFamily: 'Vrsta fonta',
    fontSize: 'Veličina fonta',
    color: 'Boje',
    emoticons: 'Emotikoni',
    inlineStyle: 'Stil teksta',
    paragraphStyle: 'Stil paragrafa',
    paragraphFormat: 'Format paragrafa',
    align: 'Poravnanje',
    formatOL: 'Numerisana lista',
    formatUL: 'Nenumerisana lista',
    outdent: 'Smanji uvlačenje',
    indent: 'Povećaj uvlačenje',
    quote: 'Citat',
    insertHR: 'Umetni horizontalnu liniju',
    insertLink: 'Umetni link',
    insertPageLink: 'Umetni link',
    insertImage: 'Umetni sliku',
    insertVideo: 'Umetni video',
    insertAudio: 'Umetni audio',
    insertFile: 'Umetni datoteku',
    insertTable: 'Umetni tabelu',
    insertSnippet: 'Umetni isječak',
    undo: 'Poništi',
    redo: 'Ponovi',
    clearFormatting: 'Očisti formatiranje',
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
    uploadFromComputer: 'Učitaj s računara',
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
    cancel: 'Otkaži',
    remove: 'Ukloni',
    browsePages: 'Pregledaj stranice',
    alternativeText: 'Alternativni tekst',
    width: 'Širina',
    widthPlaceholder: '300 ili 50%',
    widthInvalid: 'Unesite širinu u pikselima ili procentima',
    urlRequired: 'Unesite URL',
    urlInvalid: 'Unesite ispravan URL',
    embeddingCodeRequired: 'Unesite kod za ugradnju',
    embeddingCodeInvalid: 'Kod za ugradnju mora sadržavati iframe',

    // Contextual toolbars
    openLink: 'Otvori link',
    editLink: 'Uredi link',
    unlink: 'Ukloni link',
    imageAlign: 'Poravnanje',
    imageAlignNone: 'U liniji s tekstom',
    imageAlignLeft: 'Plutajuće lijevo',
    imageAlignCenter: 'Centrirano',
    imageAlignRight: 'Plutajuće desno',
    imageStyle: 'Stil slike',
    imageAlt: 'Alternativni tekst',
    imageSize: 'Promijeni veličinu',
    imageReplace: 'Zamijeni',
    imageRemove: 'Ukloni sliku',
    imageLink: 'Umetni link',
    tableHeader: 'Zaglavlje tabele',
    tableRows: 'Red',
    tableRowAbove: 'Umetni red iznad',
    tableRowBelow: 'Umetni red ispod',
    tableRowDelete: 'Izbriši red',
    tableColumns: 'Kolona',
    tableColumnBefore: 'Umetni kolonu ispred',
    tableColumnAfter: 'Umetni kolonu iza',
    tableColumnDelete: 'Izbriši kolonu',
    tableCells: 'Ćelija',
    tableCellsMerge: 'Spoji ćelije',
    tableCellsSplit: 'Podijeli ćeliju',
    tableStyle: 'Stil tabele',
    tableCellStyle: 'Stil ćelije',
    tableRemove: 'Ukloni tabelu',
    snippet: 'Isječak',
    snippetProperties: 'Svojstva',
    snippetRemove: 'Ukloni isječak',
    mediaRemove: 'Ukloni',

    // Messages
    uploadFailed: 'Učitavanje datoteke nije uspjelo',
    invalidFileEmptyInsert: 'Odaberite datoteku za umetanje.',
    invalidFileSingleInsert: 'Odaberite samo jednu datoteku.',
    invalidImageEmptyInsert: 'Odaberite sliku za umetanje.',
    invalidImageInvalidInsert: 'Odabrana datoteka nije slika.',
    invalidVideoInvalidInsert: 'Odabrana datoteka nije video.',
    invalidAudioInvalidInsert: 'Odabrana datoteka nije audio datoteka.'
};

/*
 * Hotsheet translation: Bosnian (bs)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['bs'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Nema podataka',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Umetni red iznad',
    insertRowBelow: 'Umetni red ispod',
    removeRow: 'Ukloni red',
    undo: 'Poništi',
    redo: 'Ponovi',
    freezeColumn: 'Zamrzni kolonu',
    unfreezeColumn: 'Odmrzni kolonu',

    // A cell whose value its column does not accept
    invalidValue: 'Vrijednost nije ispravna.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Odaberi datum',
    chooseTime: 'Odaberi vrijeme'
};
