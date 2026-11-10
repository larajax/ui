/*
 * Translations for sk, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Slovak (sk)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['sk'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Hodnota nesmie byť prázdna.',
        ruleInteger: 'Hodnota musí byť celé číslo.',
        rulePositiveInteger: 'Hodnota musí byť kladné celé číslo.',
        ruleFloat: 'Hodnota musí byť desatinné číslo.',
        rulePositiveFloat: 'Hodnota musí byť kladné desatinné číslo.',
        ruleMin: 'Hodnota nesmie byť menšia ako :min.',
        ruleMax: 'Hodnota nesmie byť väčšia ako :max.',
        ruleMinLength: 'Dĺžka textu nesmie byť menšia ako :min.',
        ruleMaxLength: 'Dĺžka textu nesmie byť väčšia ako :max.',
        ruleRegex: 'Neplatný formát hodnoty.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Tučné',
        italic: 'Kurzíva',
        strikethrough: 'Prečiarknuté',
        heading1: 'Nadpis 1',
        heading2: 'Nadpis 2',
        heading3: 'Nadpis 3',
        code: 'Kód',
        quote: 'Citát',
        unorderedList: 'Nečíslovaný zoznam',
        orderedList: 'Číslovaný zoznam',
        cleanBlock: 'Vymazať formátovanie bloku',
        link: 'Odkaz',
        image: 'Obrázok',
        table: 'Tabuľka',
        horizontalRule: 'Vložiť horizontálnu linku',
        preview: 'Náhľad',
        sideBySide: 'Náhľad vedľa editora',
        fullscreen: 'Celá obrazovka'
    },

    // Custom select messages
    customselect: {
        noResults: 'Nenašli sa žiadne položky',
        searching: 'Vyhľadávanie…',
        loadingMore: 'Načítanie ďalších výsledkov…',
        errorLoading: 'Výsledky sa nepodarilo načítať.',
        inputTooShort: {
            one: 'Prosím, zadajte ešte jeden znak',
            few: 'Prosím, zadajte ešte ďalšie dva znaky',
            other: 'Prosím, zadajte ešte ďalších :count znakov'
        },
        maximumSelected: {
            one: 'Môžete zvoliť len jednu položku',
            few: 'Môžete zvoliť najviac dve položky',
            other: 'Môžete zvoliť najviac :count položiek'
        },
        removeItem: 'Odstrániť položku',
        removeAllItems: 'Odstráňte všetky položky'
    }
};

/*
 * RichArea translation: Slovak (sk)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['sk'] = {
    // Toolbar buttons
    toolbar: 'Panel nástrojov editora',
    fullscreen: 'Celá obrazovka',
    bold: 'Tučné',
    italic: 'Kurzíva',
    underline: 'Podčiarknuté',
    strikeThrough: 'Prečiarknuté',
    subscript: 'Dolný index',
    superscript: 'Horný index',
    fontFamily: 'Písmo',
    fontSize: 'Veľkosť písma',
    color: 'Farby',
    emoticons: 'Emotikony',
    inlineStyle: 'Štýl textu',
    paragraphStyle: 'Štýl odseku',
    paragraphFormat: 'Formát odseku',
    align: 'Zarovnanie',
    formatOL: 'Číslovaný zoznam',
    formatUL: 'Nečíslovaný zoznam',
    outdent: 'Zmenšiť odsadenie',
    indent: 'Zväčšiť odsadenie',
    quote: 'Citát',
    insertHR: 'Vložiť horizontálnu linku',
    insertLink: 'Vložiť odkaz',
    insertPageLink: 'Vložiť odkaz',
    insertImage: 'Vložiť obrázok',
    insertVideo: 'Vložiť video',
    insertAudio: 'Vložiť audio',
    insertFile: 'Vložiť súbor',
    insertTable: 'Vložiť tabuľku',
    insertSnippet: 'Vložiť snippet',
    undo: 'Späť',
    redo: 'Znova',
    clearFormatting: 'Vymazať formátovanie',
    selectAll: 'Vybrať všetko',
    html: 'Zobrazenie kódu',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Normálny',
    formatHeading1: 'Nadpis 1',
    formatHeading2: 'Nadpis 2',
    formatHeading3: 'Nadpis 3',
    formatHeading4: 'Nadpis 4',
    formatHeading5: 'Nadpis 5',
    formatHeading6: 'Nadpis 6',
    formatCode: 'Kód',

    // Alignment
    alignLeft: 'Zarovnať doľava',
    alignCenter: 'Zarovnať na stred',
    alignRight: 'Zarovnať doprava',
    alignJustify: 'Zarovnať do bloku',

    // Colors
    textColor: 'Text',
    backgroundColor: 'Pozadie',
    removeColor: 'Odstrániť farbu',
    defaultFont: 'Predvolené',

    // Insert menus
    uploadFromComputer: 'Nahrať z počítača',
    browse: 'Prehľadávať médiá',
    byUrl: 'Z adresy URL',
    embeddingCode: 'Kód na vloženie',

    // Popover forms
    url: 'URL',
    text: 'Text',
    openInNewTab: 'Otvoriť na novej karte',
    linkStyle: 'Štýl',
    none: 'Žiadny',
    insert: 'Vložiť',
    update: 'Aktualizovať',
    cancel: 'Zrušiť',
    remove: 'Odstrániť',
    browsePages: 'Prehľadávať stránky',
    alternativeText: 'Alternatívny text',
    width: 'Šírka',
    widthPlaceholder: '300 alebo 50%',
    widthInvalid: 'Zadajte šírku v pixeloch alebo v percentách',
    urlRequired: 'Prosím, zadajte adresu URL',
    urlInvalid: 'Prosím, zadajte platnú adresu URL',
    embeddingCodeRequired: 'Prosím, zadajte kód na vloženie',
    embeddingCodeInvalid: 'Kód na vloženie musí obsahovať iframe',

    // Contextual toolbars
    openLink: 'Otvoriť odkaz',
    editLink: 'Upraviť odkaz',
    unlink: 'Odstrániť odkaz',
    imageAlign: 'Zarovnanie',
    imageAlignNone: 'V riadku',
    imageAlignLeft: 'Vľavo s obtekaním',
    imageAlignCenter: 'Na stred',
    imageAlignRight: 'Vpravo s obtekaním',
    imageStyle: 'Štýl obrázka',
    imageAlt: 'Alternatívny text',
    imageSize: 'Zmeniť veľkosť',
    imageReplace: 'Nahradiť',
    imageRemove: 'Odstrániť obrázok',
    imageLink: 'Vložiť odkaz',
    tableHeader: 'Hlavička tabuľky',
    tableRows: 'Riadok',
    tableRowAbove: 'Vložiť riadok nad',
    tableRowBelow: 'Vložiť riadok pod',
    tableRowDelete: 'Odstrániť riadok',
    tableColumns: 'Stĺpec',
    tableColumnBefore: 'Vložiť stĺpec vľavo',
    tableColumnAfter: 'Vložiť stĺpec vpravo',
    tableColumnDelete: 'Odstrániť stĺpec',
    tableCells: 'Bunka',
    tableCellsMerge: 'Zlúčiť bunky',
    tableCellsSplit: 'Rozdeliť bunku',
    tableStyle: 'Štýl tabuľky',
    tableCellStyle: 'Štýl bunky',
    tableRemove: 'Odstrániť tabuľku',
    snippet: 'Snippet',
    snippetProperties: 'Parametre',
    snippetRemove: 'Odstrániť snippet',
    mediaRemove: 'Odstrániť',

    // Messages
    uploadFailed: 'Súbor sa nepodarilo nahrať',
    invalidFileEmptyInsert: 'Prosím, vyberte súbor na vloženie.',
    invalidFileSingleInsert: 'Prosím, vyberte jeden súbor.',
    invalidImageEmptyInsert: 'Prosím, vyberte obrázok na vloženie.',
    invalidImageInvalidInsert: 'Vybraný súbor nie je obrázok.',
    invalidVideoInvalidInsert: 'Vybraný súbor nie je video.',
    invalidAudioInvalidInsert: 'Vybraný súbor nie je zvukový súbor.'
};

/*
 * Hotsheet translation: Slovak (sk)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['sk'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Žiadne údaje',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Vložiť riadok nad',
    insertRowBelow: 'Vložiť riadok pod',
    removeRow: 'Odstrániť riadok',
    undo: 'Späť',
    redo: 'Znova',
    freezeColumn: 'Ukotviť stĺpec',
    unfreezeColumn: 'Uvoľniť stĺpec',

    // A cell whose value its column does not accept
    invalidValue: 'Hodnota nie je platná.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Vybrať dátum',
    chooseTime: 'Vybrať čas'
};
