/*
 * Translations for lt, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Lithuanian (lt)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['lt'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Reikšmė negali būti tuščia.',
        ruleInteger: 'Reikšmė turi būti sveikasis skaičius.',
        rulePositiveInteger: 'Reikšmė turi būti teigiamas sveikasis skaičius.',
        ruleFloat: 'Reikšmė turi būti slankiojo kablelio skaičius.',
        rulePositiveFloat: 'Reikšmė turi būti teigiamas slankiojo kablelio skaičius.',
        ruleMin: 'Reikšmė negali būti mažesnė už :min.',
        ruleMax: 'Reikšmė negali būti didesnė už :max.',
        ruleMinLength: 'Teksto ilgis negali būti mažesnis už :min.',
        ruleMaxLength: 'Teksto ilgis negali būti didesnis už :max.',
        ruleRegex: 'Netinkamas reikšmės formatas.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Pusjuodis',
        italic: 'Kursyvas',
        strikethrough: 'Perbrauktas',
        heading1: 'Antraštė 1',
        heading2: 'Antraštė 2',
        heading3: 'Antraštė 3',
        code: 'Kodas',
        quote: 'Citata',
        unorderedList: 'Nenumeruotas sąrašas',
        orderedList: 'Numeruotas sąrašas',
        cleanBlock: 'Išvalyti bloko formatavimą',
        link: 'Nuoroda',
        image: 'Paveikslėlis',
        table: 'Lentelė',
        horizontalRule: 'Įterpti horizontalią liniją',
        preview: 'Peržiūra',
        sideBySide: 'Peržiūra šalia rengyklės',
        fullscreen: 'Visas ekranas'
    }
};

/*
 * RichArea translation: Lithuanian (lt)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['lt'] = {
    // Toolbar buttons
    toolbar: 'Rengyklės įrankių juosta',
    fullscreen: 'Visas ekranas',
    bold: 'Pusjuodis',
    italic: 'Kursyvas',
    underline: 'Pabrauktas',
    strikeThrough: 'Perbrauktas',
    subscript: 'Apatinis indeksas',
    superscript: 'Viršutinis indeksas',
    fontFamily: 'Šriftas',
    fontSize: 'Šrifto dydis',
    color: 'Spalvos',
    emoticons: 'Jaustukai',
    inlineStyle: 'Teksto stilius',
    paragraphStyle: 'Pastraipos stilius',
    paragraphFormat: 'Pastraipos formatas',
    align: 'Lygiuotė',
    formatOL: 'Numeruotas sąrašas',
    formatUL: 'Nenumeruotas sąrašas',
    outdent: 'Mažinti įtrauką',
    indent: 'Didinti įtrauką',
    quote: 'Citata',
    insertHR: 'Įterpti horizontalią liniją',
    insertLink: 'Įterpti nuorodą',
    insertPageLink: 'Įterpti nuorodą',
    insertImage: 'Įterpti paveikslėlį',
    insertVideo: 'Įterpti vaizdo įrašą',
    insertAudio: 'Įterpti garso įrašą',
    insertFile: 'Įterpti failą',
    insertTable: 'Įterpti lentelę',
    insertSnippet: 'Įterpti fragmentą',
    undo: 'Anuliuoti',
    redo: 'Perdaryti',
    clearFormatting: 'Išvalyti formatavimą',
    selectAll: 'Pažymėti viską',
    html: 'Kodo rodinys',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Įprastas',
    formatHeading1: 'Antraštė 1',
    formatHeading2: 'Antraštė 2',
    formatHeading3: 'Antraštė 3',
    formatHeading4: 'Antraštė 4',
    formatHeading5: 'Antraštė 5',
    formatHeading6: 'Antraštė 6',
    formatCode: 'Kodas',

    // Alignment
    alignLeft: 'Lygiuoti kairėje',
    alignCenter: 'Centruoti',
    alignRight: 'Lygiuoti dešinėje',
    alignJustify: 'Lygiuoti abiejuose kraštuose',

    // Colors
    textColor: 'Tekstas',
    backgroundColor: 'Fonas',
    removeColor: 'Pašalinti spalvą',
    defaultFont: 'Numatytas',

    // Insert menus
    uploadFromComputer: 'Įkelti iš kompiuterio',
    browse: 'Naršyti medijos failus',
    byUrl: 'Iš URL adreso',
    embeddingCode: 'Įterpimo kodas',

    // Popover forms
    url: 'URL',
    text: 'Tekstas',
    openInNewTab: 'Atidaryti naujame skirtuke',
    linkStyle: 'Stilius',
    none: 'Nėra',
    insert: 'Įterpti',
    update: 'Atnaujinti',
    cancel: 'Atšaukti',
    remove: 'Pašalinti',
    browsePages: 'Pasirinkti puslapį',
    alternativeText: 'Alternatyvusis tekstas',
    width: 'Plotis',
    widthPlaceholder: '300 arba 50%',
    widthInvalid: 'Įveskite plotį pikseliais arba procentais',
    urlRequired: 'Įveskite URL adresą',
    urlInvalid: 'Įveskite tinkamą URL adresą',
    embeddingCodeRequired: 'Įveskite įterpimo kodą',
    embeddingCodeInvalid: 'Įterpimo kode turi būti iframe',

    // Contextual toolbars
    openLink: 'Atidaryti nuorodą',
    editLink: 'Redaguoti nuorodą',
    unlink: 'Pašalinti nuorodą',
    imageAlign: 'Lygiuotė',
    imageAlignNone: 'Tekste',
    imageAlignLeft: 'Kairėje, apgaubta tekstu',
    imageAlignCenter: 'Centre',
    imageAlignRight: 'Dešinėje, apgaubta tekstu',
    imageStyle: 'Paveikslėlio stilius',
    imageAlt: 'Alternatyvusis tekstas',
    imageSize: 'Keisti dydį',
    imageReplace: 'Pakeisti',
    imageRemove: 'Pašalinti paveikslėlį',
    imageLink: 'Įterpti nuorodą',
    tableHeader: 'Lentelės antraštė',
    tableRows: 'Eilutė',
    tableRowAbove: 'Įterpti eilutę aukščiau',
    tableRowBelow: 'Įterpti eilutę žemiau',
    tableRowDelete: 'Ištrinti eilutę',
    tableColumns: 'Stulpelis',
    tableColumnBefore: 'Įterpti stulpelį kairėje',
    tableColumnAfter: 'Įterpti stulpelį dešinėje',
    tableColumnDelete: 'Ištrinti stulpelį',
    tableCells: 'Langelis',
    tableCellsMerge: 'Sulieti langelius',
    tableCellsSplit: 'Skaidyti langelį',
    tableStyle: 'Lentelės stilius',
    tableCellStyle: 'Langelio stilius',
    tableRemove: 'Pašalinti lentelę',
    snippet: 'Fragmentas',
    snippetProperties: 'Savybės',
    snippetRemove: 'Pašalinti fragmentą',
    mediaRemove: 'Pašalinti',

    // Messages
    uploadFailed: 'Nepavyko įkelti failo',
    invalidFileEmptyInsert: 'Pasirinkite failą, kurį norite įterpti.',
    invalidFileSingleInsert: 'Pasirinkite vieną failą.',
    invalidImageEmptyInsert: 'Pasirinkite paveikslėlį, kurį norite įterpti.',
    invalidImageInvalidInsert: 'Pasirinktas failas nėra paveikslėlis.',
    invalidVideoInvalidInsert: 'Pasirinktas failas nėra vaizdo įrašas.',
    invalidAudioInvalidInsert: 'Pasirinktas failas nėra garso failas.'
};

/*
 * Hotsheet translation: Lithuanian (lt)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['lt'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Duomenų nėra',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Įterpti eilutę aukščiau',
    insertRowBelow: 'Įterpti eilutę žemiau',
    removeRow: 'Pašalinti eilutę',
    undo: 'Anuliuoti',
    redo: 'Perdaryti',
    freezeColumn: 'Fiksuoti stulpelį',
    unfreezeColumn: 'Atšaukti stulpelio fiksavimą',

    // A cell whose value its column does not accept
    invalidValue: 'Netinkama reikšmė.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Pasirinkti datą',
    chooseTime: 'Pasirinkti laiką'
};
