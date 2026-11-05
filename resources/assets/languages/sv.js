/*
 * Translations for sv, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Swedish (sv)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['sv'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Värdet får inte vara tomt.',
        ruleInteger: 'Värdet måste vara ett heltal.',
        rulePositiveInteger: 'Värdet måste vara ett positivt heltal.',
        ruleFloat: 'Värdet måste vara ett decimaltal.',
        rulePositiveFloat: 'Värdet måste vara ett positivt decimaltal.',
        ruleMin: 'Värdet får inte vara mindre än :min.',
        ruleMax: 'Värdet får inte vara större än :max.',
        ruleMinLength: 'Texten får inte vara kortare än :min tecken.',
        ruleMaxLength: 'Texten får inte vara längre än :max tecken.',
        ruleRegex: 'Värdet har ett ogiltigt format.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Fet',
        italic: 'Kursiv',
        strikethrough: 'Genomstruken',
        heading1: 'Rubrik 1',
        heading2: 'Rubrik 2',
        heading3: 'Rubrik 3',
        code: 'Kod',
        quote: 'Citat',
        unorderedList: 'Oordnad lista',
        orderedList: 'Ordnad lista',
        cleanBlock: 'Rensa blockformatering',
        link: 'Länk',
        image: 'Bild',
        table: 'Tabell',
        horizontalRule: 'Infoga horisontell linje',
        preview: 'Förhandsgranska',
        sideBySide: 'Sida vid sida',
        fullscreen: 'Fullskärm'
    }
};

/*
 * RichArea translation: Swedish (sv)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['sv'] = {
    // Toolbar buttons
    toolbar: 'Redigerarens verktygsfält',
    fullscreen: 'Fullskärm',
    bold: 'Fet',
    italic: 'Kursiv',
    underline: 'Understruken',
    strikeThrough: 'Genomstruken',
    subscript: 'Nedsänkt',
    superscript: 'Upphöjd',
    fontFamily: 'Teckensnitt',
    fontSize: 'Teckenstorlek',
    color: 'Färger',
    emoticons: 'Uttryckssymboler',
    inlineStyle: 'Teckenstil',
    paragraphStyle: 'Styckestil',
    paragraphFormat: 'Styckeformat',
    align: 'Justera',
    formatOL: 'Ordnad lista',
    formatUL: 'Oordnad lista',
    outdent: 'Minska indrag',
    indent: 'Öka indrag',
    quote: 'Citat',
    insertHR: 'Infoga horisontell linje',
    insertLink: 'Infoga länk',
    insertPageLink: 'Infoga länk',
    insertImage: 'Infoga bild',
    insertVideo: 'Infoga video',
    insertAudio: 'Infoga ljud',
    insertFile: 'Infoga fil',
    insertTable: 'Infoga tabell',
    insertSnippet: 'Infoga stump',
    undo: 'Ångra',
    redo: 'Gör om',
    clearFormatting: 'Rensa formatering',
    selectAll: 'Markera allt',
    html: 'Kodvy',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Skift',

    // Paragraph formats
    formatNormal: 'Normal',
    formatHeading1: 'Rubrik 1',
    formatHeading2: 'Rubrik 2',
    formatHeading3: 'Rubrik 3',
    formatHeading4: 'Rubrik 4',
    formatHeading5: 'Rubrik 5',
    formatHeading6: 'Rubrik 6',
    formatCode: 'Kod',

    // Alignment
    alignLeft: 'Vänsterjustera',
    alignCenter: 'Centrera',
    alignRight: 'Högerjustera',
    alignJustify: 'Marginaljustera',

    // Colors
    textColor: 'Text',
    backgroundColor: 'Bakgrund',
    removeColor: 'Ta bort färg',
    defaultFont: 'Standard',

    // Insert menus
    uploadFromComputer: 'Ladda upp från datorn',
    browse: 'Bläddra',
    byUrl: 'Via URL',
    embeddingCode: 'Inbäddningskod',

    // Popover forms
    url: 'URL',
    text: 'Text',
    openInNewTab: 'Öppna i ny flik',
    linkStyle: 'Stil',
    none: 'Ingen',
    insert: 'Infoga',
    update: 'Uppdatera',
    cancel: 'Avbryt',
    remove: 'Ta bort',
    browsePages: 'Bläddra bland sidor',
    alternativeText: 'Alternativ text',
    width: 'Bredd',
    widthPlaceholder: '300 eller 50%',
    widthInvalid: 'Ange en bredd i pixlar eller procent',
    urlRequired: 'Ange en URL',
    urlInvalid: 'Ange en giltig URL',
    embeddingCodeRequired: 'Ange inbäddningskoden',
    embeddingCodeInvalid: 'Inbäddningskoden måste innehålla en iframe',

    // Contextual toolbars
    openLink: 'Öppna länk',
    editLink: 'Redigera länk',
    unlink: 'Ta bort länk',
    imageAlign: 'Justera',
    imageAlignNone: 'I nivå med texten',
    imageAlignLeft: 'Flytande vänster',
    imageAlignCenter: 'Centrera',
    imageAlignRight: 'Flytande höger',
    imageStyle: 'Bildstil',
    imageAlt: 'Alternativ text',
    imageSize: 'Ändra storlek',
    imageReplace: 'Byt ut',
    imageRemove: 'Ta bort bild',
    imageLink: 'Infoga länk',
    tableHeader: 'Rubrikrad',
    tableRows: 'Rad',
    tableRowAbove: 'Infoga rad ovanför',
    tableRowBelow: 'Infoga rad nedanför',
    tableRowDelete: 'Ta bort rad',
    tableColumns: 'Kolumn',
    tableColumnBefore: 'Infoga kolumn före',
    tableColumnAfter: 'Infoga kolumn efter',
    tableColumnDelete: 'Ta bort kolumn',
    tableCells: 'Cell',
    tableCellsMerge: 'Sammanfoga celler',
    tableCellsSplit: 'Dela cell',
    tableStyle: 'Tabellstil',
    tableCellStyle: 'Cellstil',
    tableRemove: 'Ta bort tabell',
    snippet: 'Stump',
    snippetProperties: 'Egenskaper',
    snippetRemove: 'Ta bort stump',
    mediaRemove: 'Ta bort',

    // Messages
    uploadFailed: 'Filen kunde inte laddas upp',
    invalidFileEmptyInsert: 'Välj en fil att infoga.',
    invalidFileSingleInsert: 'Välj en enskild fil.',
    invalidImageEmptyInsert: 'Välj en bild att infoga.',
    invalidImageInvalidInsert: 'Den valda filen är inte en bild.',
    invalidVideoInvalidInsert: 'Den valda filen är inte en video.',
    invalidAudioInvalidInsert: 'Den valda filen är inte en ljudfil.'
};

/*
 * Hotsheet translation: Swedish (sv)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['sv'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Inga data',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Infoga rad ovanför',
    insertRowBelow: 'Infoga rad nedanför',
    removeRow: 'Ta bort rad',
    undo: 'Ångra',
    redo: 'Gör om',
    freezeColumn: 'Lås kolumn',
    unfreezeColumn: 'Lås upp kolumn',

    // A cell whose value its column does not accept
    invalidValue: 'Värdet är ogiltigt.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Välj datum',
    chooseTime: 'Välj tid'
};

// Select2's own translation, kept for the custom-select control
(function (jQuery) {
/*! Select2 4.1.0 | https://github.com/select2/select2/blob/master/LICENSE.md */

!function(){if(jQuery&&jQuery.fn&&jQuery.fn.select2&&jQuery.fn.select2.amd)var n=jQuery.fn.select2.amd;n.define("select2/i18n/sv",[],function(){return{errorLoading:function(){return"Resultat kunde inte laddas."},inputTooLong:function(n){return"Vänligen sudda ut "+(n.input.length-n.maximum)+" tecken"},inputTooShort:function(n){return"Vänligen skriv in "+(n.minimum-n.input.length)+" eller fler tecken"},loadingMore:function(){return"Laddar fler resultat…"},maximumSelected:function(n){return"Du kan max välja "+n.maximum+" element"},noResults:function(){return"Inga träffar"},searching:function(){return"Söker…"},removeAllItems:function(){return"Ta bort alla objekt"}}}),n.define,n.require}();
})({ fn: { select2: { amd: { define: function (name, deps, factory) {
    (globalThis.Select2Languages = globalThis.Select2Languages || {})['sv'] = factory();
} } } } });
