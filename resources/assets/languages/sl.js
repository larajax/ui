/*
 * Translations for sl, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Slovenian (sl)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['sl'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Vrednost ne sme biti prazna.',
        ruleInteger: 'Vrednost mora biti celo število.',
        rulePositiveInteger: 'Vrednost mora biti pozitivno celo število.',
        ruleFloat: 'Vrednost mora biti število s plavajočo vejico.',
        rulePositiveFloat: 'Vrednost mora biti pozitivno število s plavajočo vejico.',
        ruleMin: 'Vrednost ne sme biti manjša od :min.',
        ruleMax: 'Vrednost ne sme biti večja od :max.',
        ruleMinLength: 'Dolžina besedila ne sme biti manjša od :min.',
        ruleMaxLength: 'Dolžina besedila ne sme biti večja od :max.',
        ruleRegex: 'Neveljavna oblika vrednosti.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Krepko',
        italic: 'Ležeče',
        strikethrough: 'Prečrtano',
        heading1: 'Naslov 1',
        heading2: 'Naslov 2',
        heading3: 'Naslov 3',
        code: 'Koda',
        quote: 'Citat',
        unorderedList: 'Neoštevilčeni seznam',
        orderedList: 'Številčni seznam',
        cleanBlock: 'Počisti oblikovanje bloka',
        link: 'Povezava',
        image: 'Slika',
        table: 'Tabela',
        horizontalRule: 'Vstavi vodoravno črto',
        preview: 'Predogled',
        sideBySide: 'Predogled ob urejevalniku',
        fullscreen: 'Celozaslonski način'
    }
};

/*
 * RichArea translation: Slovenian (sl)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['sl'] = {
    // Toolbar buttons
    toolbar: 'Orodna vrstica urejevalnika',
    fullscreen: 'Celozaslonski način',
    bold: 'Krepko',
    italic: 'Ležeče',
    underline: 'Podčrtano',
    strikeThrough: 'Prečrtano',
    subscript: 'Podpisano',
    superscript: 'Nadpisano',
    fontFamily: 'Pisava',
    fontSize: 'Velikost pisave',
    color: 'Barve',
    emoticons: 'Čustvenčki',
    inlineStyle: 'Slog besedila',
    paragraphStyle: 'Slog odstavka',
    paragraphFormat: 'Format odstavka',
    align: 'Poravnava',
    formatOL: 'Številčni seznam',
    formatUL: 'Neoštevilčeni seznam',
    outdent: 'Zmanjšaj zamik',
    indent: 'Povečaj zamik',
    quote: 'Citat',
    insertHR: 'Vstavi vodoravno črto',
    insertLink: 'Vstavi povezavo',
    insertPageLink: 'Vstavi povezavo',
    insertImage: 'Vstavi sliko',
    insertVideo: 'Vstavi videoposnetek',
    insertAudio: 'Vstavi zvočni posnetek',
    insertFile: 'Vstavi datoteko',
    insertTable: 'Vstavi tabelo',
    insertSnippet: 'Vstavi gradnik',
    undo: 'Razveljavi',
    redo: 'Uveljavi',
    clearFormatting: 'Počisti oblikovanje',
    selectAll: 'Izberi vse',
    html: 'Pogled kode',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Navadno',
    formatHeading1: 'Naslov 1',
    formatHeading2: 'Naslov 2',
    formatHeading3: 'Naslov 3',
    formatHeading4: 'Naslov 4',
    formatHeading5: 'Naslov 5',
    formatHeading6: 'Naslov 6',
    formatCode: 'Koda',

    // Alignment
    alignLeft: 'Poravnaj levo',
    alignCenter: 'Poravnaj na sredino',
    alignRight: 'Poravnaj desno',
    alignJustify: 'Poravnaj obojestransko',

    // Colors
    textColor: 'Besedilo',
    backgroundColor: 'Ozadje',
    removeColor: 'Odstrani barvo',
    defaultFont: 'Privzeto',

    // Insert menus
    uploadFromComputer: 'Naloži z računalnika',
    browse: 'Prebrskaj',
    byUrl: 'Prek URL-ja',
    embeddingCode: 'Koda za vdelavo',

    // Popover forms
    url: 'URL',
    text: 'Besedilo',
    openInNewTab: 'Odpri v novem zavihku',
    linkStyle: 'Slog',
    none: 'Brez',
    insert: 'Vstavi',
    update: 'Posodobi',
    cancel: 'Prekliči',
    remove: 'Odstrani',
    browsePages: 'Prebrskaj strani',
    alternativeText: 'Nadomestno besedilo',
    width: 'Širina',
    widthPlaceholder: '300 ali 50%',
    widthInvalid: 'Vnesite širino v slikovnih pikah ali odstotkih',
    urlRequired: 'Vnesite URL',
    urlInvalid: 'Vnesite veljaven URL',
    embeddingCodeRequired: 'Vnesite kodo za vdelavo',
    embeddingCodeInvalid: 'Koda za vdelavo mora vsebovati iframe',

    // Contextual toolbars
    openLink: 'Odpri povezavo',
    editLink: 'Uredi povezavo',
    unlink: 'Odstrani povezavo',
    imageAlign: 'Poravnava',
    imageAlignNone: 'V vrstici',
    imageAlignLeft: 'Levo z obtekanjem',
    imageAlignCenter: 'Na sredino',
    imageAlignRight: 'Desno z obtekanjem',
    imageStyle: 'Slog slike',
    imageAlt: 'Nadomestno besedilo',
    imageSize: 'Spremeni velikost',
    imageReplace: 'Zamenjaj',
    imageRemove: 'Odstrani sliko',
    imageLink: 'Vstavi povezavo',
    tableHeader: 'Glava tabele',
    tableRows: 'Vrstica',
    tableRowAbove: 'Vstavi vrstico zgoraj',
    tableRowBelow: 'Vstavi vrstico spodaj',
    tableRowDelete: 'Izbriši vrstico',
    tableColumns: 'Stolpec',
    tableColumnBefore: 'Vstavi stolpec levo',
    tableColumnAfter: 'Vstavi stolpec desno',
    tableColumnDelete: 'Izbriši stolpec',
    tableCells: 'Celica',
    tableCellsMerge: 'Združi celice',
    tableCellsSplit: 'Razdeli celico',
    tableStyle: 'Slog tabele',
    tableCellStyle: 'Slog celice',
    tableRemove: 'Odstrani tabelo',
    snippet: 'Gradnik',
    snippetProperties: 'Lastnosti',
    snippetRemove: 'Odstrani gradnik',
    mediaRemove: 'Odstrani',

    // Messages
    uploadFailed: 'Datoteke ni bilo mogoče naložiti',
    invalidFileEmptyInsert: 'Izberite datoteko za vstavljanje.',
    invalidFileSingleInsert: 'Izberite eno samo datoteko.',
    invalidImageEmptyInsert: 'Izberite sliko za vstavljanje.',
    invalidImageInvalidInsert: 'Izbrana datoteka ni slika.',
    invalidVideoInvalidInsert: 'Izbrana datoteka ni videoposnetek.',
    invalidAudioInvalidInsert: 'Izbrana datoteka ni zvočna datoteka.'
};

/*
 * Hotsheet translation: Slovenian (sl)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['sl'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Ni podatkov',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Vstavi vrstico zgoraj',
    insertRowBelow: 'Vstavi vrstico spodaj',
    removeRow: 'Izbriši vrstico',
    undo: 'Razveljavi',
    redo: 'Uveljavi',
    freezeColumn: 'Zamrzni stolpec',
    unfreezeColumn: 'Odmrzni stolpec',

    // A cell whose value its column does not accept
    invalidValue: 'Vrednost ni veljavna.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Izberi datum',
    chooseTime: 'Izberi čas'
};

// Select2's own translation, kept for the custom-select control
(function (jQuery) {
/*! Select2 4.1.0 | https://github.com/select2/select2/blob/master/LICENSE.md */

!function(){if(jQuery&&jQuery.fn&&jQuery.fn.select2&&jQuery.fn.select2.amd)var e=jQuery.fn.select2.amd;e.define("select2/i18n/sl",[],function(){return{errorLoading:function(){return"Zadetkov iskanja ni bilo mogoče naložiti."},inputTooLong:function(e){var n=e.input.length-e.maximum,t="Prosim zbrišite "+n+" znak";return 2==n?t+="a":1!=n&&(t+="e"),t},inputTooShort:function(e){var n=e.minimum-e.input.length,t="Prosim vpišite še "+n+" znak";return 2==n?t+="a":1!=n&&(t+="e"),t},loadingMore:function(){return"Nalagam več zadetkov…"},maximumSelected:function(e){var n="Označite lahko največ "+e.maximum+" predmet";return 2==e.maximum?n+="a":1!=e.maximum&&(n+="e"),n},noResults:function(){return"Ni zadetkov."},searching:function(){return"Iščem…"},removeAllItems:function(){return"Odstranite vse elemente"}}}),e.define,e.require}();
})({ fn: { select2: { amd: { define: function (name, deps, factory) {
    (globalThis.Select2Languages = globalThis.Select2Languages || {})['sl'] = factory();
} } } } });
