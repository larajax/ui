/*
 * Translations for me, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Montenegrin (me)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['me'] = {
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
        cleanBlock: 'Ukloni formatiranje bloka',
        link: 'Link',
        image: 'Slika',
        table: 'Tabela',
        horizontalRule: 'Ubaci horizontalnu liniju',
        preview: 'Pregled',
        sideBySide: 'Uporedni prikaz',
        fullscreen: 'Cijeli ekran'
    }
};

/*
 * RichArea translation: Montenegrin (me)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['me'] = {
    // Toolbar buttons
    toolbar: 'Traka sa alatkama editora',
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
    paragraphStyle: 'Stil pasusa',
    paragraphFormat: 'Format pasusa',
    align: 'Poravnanje',
    formatOL: 'Numerisana lista',
    formatUL: 'Nenumerisana lista',
    outdent: 'Smanji uvlačenje',
    indent: 'Povećaj uvlačenje',
    quote: 'Citat',
    insertHR: 'Ubaci horizontalnu liniju',
    insertLink: 'Ubaci link',
    insertPageLink: 'Ubaci link',
    insertImage: 'Ubaci sliku',
    insertVideo: 'Ubaci video',
    insertAudio: 'Ubaci audio',
    insertFile: 'Ubaci fajl',
    insertTable: 'Ubaci tabelu',
    insertSnippet: 'Ubaci isječak',
    undo: 'Opozovi',
    redo: 'Ponovi',
    clearFormatting: 'Ukloni formatiranje',
    selectAll: 'Izaberi sve',
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
    defaultFont: 'Podrazumijevano',

    // Insert menus
    uploadFromComputer: 'Otpremi sa računara',
    browse: 'Pregledaj',
    byUrl: 'Preko URL-a',
    embeddingCode: 'Kod za ugrađivanje',

    // Popover forms
    url: 'URL',
    text: 'Tekst',
    openInNewTab: 'Otvori u novoj kartici',
    linkStyle: 'Stil',
    none: 'Nijedan',
    insert: 'Ubaci',
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
    embeddingCodeRequired: 'Unesite kod za ugrađivanje',
    embeddingCodeInvalid: 'Kod za ugrađivanje mora da sadrži iframe',

    // Contextual toolbars
    openLink: 'Otvori link',
    editLink: 'Izmijeni link',
    unlink: 'Ukloni link',
    imageAlign: 'Poravnanje',
    imageAlignNone: 'U liniji sa tekstom',
    imageAlignLeft: 'Plutajuće lijevo',
    imageAlignCenter: 'Centrirano',
    imageAlignRight: 'Plutajuće desno',
    imageStyle: 'Stil slike',
    imageAlt: 'Alternativni tekst',
    imageSize: 'Promijeni veličinu',
    imageReplace: 'Zamijeni',
    imageRemove: 'Ukloni sliku',
    imageLink: 'Ubaci link',
    tableHeader: 'Zaglavlje tabele',
    tableRows: 'Red',
    tableRowAbove: 'Ubaci red iznad',
    tableRowBelow: 'Ubaci red ispod',
    tableRowDelete: 'Obriši red',
    tableColumns: 'Kolona',
    tableColumnBefore: 'Ubaci kolonu ispred',
    tableColumnAfter: 'Ubaci kolonu iza',
    tableColumnDelete: 'Obriši kolonu',
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
    uploadFailed: 'Otpremanje fajla nije uspjelo',
    invalidFileEmptyInsert: 'Izaberite fajl za ubacivanje.',
    invalidFileSingleInsert: 'Izaberite samo jedan fajl.',
    invalidImageEmptyInsert: 'Izaberite sliku za ubacivanje.',
    invalidImageInvalidInsert: 'Izabrani fajl nije slika.',
    invalidVideoInvalidInsert: 'Izabrani fajl nije video.',
    invalidAudioInvalidInsert: 'Izabrani fajl nije audio fajl.'
};

/*
 * Hotsheet translation: Montenegrin (me)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['me'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Nema podataka',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Ubaci red iznad',
    insertRowBelow: 'Ubaci red ispod',
    removeRow: 'Ukloni red',
    undo: 'Opozovi',
    redo: 'Ponovi',
    freezeColumn: 'Zamrzni kolonu',
    unfreezeColumn: 'Odmrzni kolonu',

    // A cell whose value its column does not accept
    invalidValue: 'Vrijednost nije ispravna.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Izaberi datum',
    chooseTime: 'Izaberi vrijeme'
};
