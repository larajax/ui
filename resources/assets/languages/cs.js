/*
 * Translations for cs, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Czech (cs)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['cs'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Hodnota nesmí být prázdná.',
        ruleInteger: 'Hodnota musí být celé číslo.',
        rulePositiveInteger: 'Hodnota musí být kladné celé číslo.',
        ruleFloat: 'Hodnota musí být desetinné číslo.',
        rulePositiveFloat: 'Hodnota musí být kladné desetinné číslo.',
        ruleMin: 'Hodnota nesmí být menší než :min.',
        ruleMax: 'Hodnota nesmí být větší než :max.',
        ruleMinLength: 'Délka textu nesmí být menší než :min.',
        ruleMaxLength: 'Délka textu nesmí být větší než :max.',
        ruleRegex: 'Neplatný formát hodnoty.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Tučné',
        italic: 'Kurzíva',
        strikethrough: 'Přeškrtnutí',
        heading1: 'Nadpis 1',
        heading2: 'Nadpis 2',
        heading3: 'Nadpis 3',
        code: 'Kód',
        quote: 'Citace',
        unorderedList: 'Nečíslovaný seznam',
        orderedList: 'Číslovaný seznam',
        cleanBlock: 'Vymazat formátování bloku',
        link: 'Odkaz',
        image: 'Obrázek',
        table: 'Tabulka',
        horizontalRule: 'Vložit horizontální linku',
        preview: 'Náhled',
        sideBySide: 'Náhled vedle editoru',
        fullscreen: 'Celá obrazovka'
    }
};

/*
 * RichArea translation: Czech (cs)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['cs'] = {
    // Toolbar buttons
    toolbar: 'Panel nástrojů editoru',
    fullscreen: 'Celá obrazovka',
    bold: 'Tučné',
    italic: 'Kurzíva',
    underline: 'Podtržení',
    strikeThrough: 'Přeškrtnutí',
    subscript: 'Dolní index',
    superscript: 'Horní index',
    fontFamily: 'Písmo',
    fontSize: 'Velikost písma',
    color: 'Barvy',
    emoticons: 'Emotikony',
    inlineStyle: 'Styl textu',
    paragraphStyle: 'Styl odstavce',
    paragraphFormat: 'Formát odstavce',
    align: 'Zarovnání',
    formatOL: 'Číslovaný seznam',
    formatUL: 'Nečíslovaný seznam',
    outdent: 'Zmenšit odsazení',
    indent: 'Zvětšit odsazení',
    quote: 'Citace',
    insertHR: 'Vložit horizontální linku',
    insertLink: 'Vložit odkaz',
    insertPageLink: 'Vložit odkaz',
    insertImage: 'Vložit obrázek',
    insertVideo: 'Vložit video',
    insertAudio: 'Vložit zvuk',
    insertFile: 'Vložit soubor',
    insertTable: 'Vložit tabulku',
    insertSnippet: 'Vložit snippet',
    undo: 'Zpět',
    redo: 'Znovu',
    clearFormatting: 'Vymazat formátování',
    selectAll: 'Vybrat vše',
    html: 'Zobrazení kódu',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Normální',
    formatHeading1: 'Nadpis 1',
    formatHeading2: 'Nadpis 2',
    formatHeading3: 'Nadpis 3',
    formatHeading4: 'Nadpis 4',
    formatHeading5: 'Nadpis 5',
    formatHeading6: 'Nadpis 6',
    formatCode: 'Kód',

    // Alignment
    alignLeft: 'Zarovnat vlevo',
    alignCenter: 'Zarovnat na střed',
    alignRight: 'Zarovnat vpravo',
    alignJustify: 'Zarovnat do bloku',

    // Colors
    textColor: 'Text',
    backgroundColor: 'Pozadí',
    removeColor: 'Odstranit barvu',
    defaultFont: 'Výchozí',

    // Insert menus
    uploadFromComputer: 'Nahrát z počítače',
    browse: 'Procházet',
    byUrl: 'Z adresy URL',
    embeddingCode: 'Kód pro vložení',

    // Popover forms
    url: 'URL',
    text: 'Text',
    openInNewTab: 'Otevřít v nové kartě',
    linkStyle: 'Styl',
    none: 'Žádný',
    insert: 'Vložit',
    update: 'Aktualizovat',
    cancel: 'Zrušit',
    remove: 'Odstranit',
    browsePages: 'Procházet stránky',
    alternativeText: 'Alternativní text',
    width: 'Šířka',
    widthPlaceholder: '300 nebo 50%',
    widthInvalid: 'Zadejte šířku v pixelech nebo v procentech',
    urlRequired: 'Zadejte prosím adresu URL',
    urlInvalid: 'Zadejte prosím platnou adresu URL',
    embeddingCodeRequired: 'Zadejte prosím kód pro vložení',
    embeddingCodeInvalid: 'Kód pro vložení musí obsahovat iframe',

    // Contextual toolbars
    openLink: 'Otevřít odkaz',
    editLink: 'Upravit odkaz',
    unlink: 'Odstranit odkaz',
    imageAlign: 'Zarovnání',
    imageAlignNone: 'V řádku',
    imageAlignLeft: 'Vlevo s obtékáním',
    imageAlignCenter: 'Na střed',
    imageAlignRight: 'Vpravo s obtékáním',
    imageStyle: 'Styl obrázku',
    imageAlt: 'Alternativní text',
    imageSize: 'Změnit velikost',
    imageReplace: 'Nahradit',
    imageRemove: 'Odstranit obrázek',
    imageLink: 'Vložit odkaz',
    tableHeader: 'Záhlaví tabulky',
    tableRows: 'Řádek',
    tableRowAbove: 'Vložit řádek nad',
    tableRowBelow: 'Vložit řádek pod',
    tableRowDelete: 'Smazat řádek',
    tableColumns: 'Sloupec',
    tableColumnBefore: 'Vložit sloupec vlevo',
    tableColumnAfter: 'Vložit sloupec vpravo',
    tableColumnDelete: 'Smazat sloupec',
    tableCells: 'Buňka',
    tableCellsMerge: 'Sloučit buňky',
    tableCellsSplit: 'Rozdělit buňku',
    tableStyle: 'Styl tabulky',
    tableCellStyle: 'Styl buňky',
    tableRemove: 'Odstranit tabulku',
    snippet: 'Snippet',
    snippetProperties: 'Parametry',
    snippetRemove: 'Odstranit snippet',
    mediaRemove: 'Odstranit',

    // Messages
    uploadFailed: 'Soubor se nepodařilo nahrát',
    invalidFileEmptyInsert: 'Vyberte soubor, který chcete vložit.',
    invalidFileSingleInsert: 'Vyberte jeden soubor.',
    invalidImageEmptyInsert: 'Vyberte obrázek, který chcete vložit.',
    invalidImageInvalidInsert: 'Vybraný soubor není obrázek.',
    invalidVideoInvalidInsert: 'Vybraný soubor není video.',
    invalidAudioInvalidInsert: 'Vybraný soubor není zvukový soubor.'
};

/*
 * Hotsheet translation: Czech (cs)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['cs'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Žádná data',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Vložit řádek nad',
    insertRowBelow: 'Vložit řádek pod',
    removeRow: 'Smazat řádek',
    undo: 'Zpět',
    redo: 'Znovu',
    freezeColumn: 'Ukotvit sloupec',
    unfreezeColumn: 'Uvolnit sloupec',

    // A cell whose value its column does not accept
    invalidValue: 'Hodnota není platná.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Vybrat datum',
    chooseTime: 'Vybrat čas'
};

// Select2's own translation, kept for the custom-select control
(function (jQuery) {
/*! Select2 4.1.0 | https://github.com/select2/select2/blob/master/LICENSE.md */

!function(){if(jQuery&&jQuery.fn&&jQuery.fn.select2&&jQuery.fn.select2.amd)var e=jQuery.fn.select2.amd;e.define("select2/i18n/cs",[],function(){function e(e,n){switch(e){case 2:return n?"dva":"dvě";case 3:return"tři";case 4:return"čtyři"}return""}return{errorLoading:function(){return"Výsledky nemohly být načteny."},inputTooLong:function(n){var t=n.input.length-n.maximum;return 1==t?"Prosím, zadejte o jeden znak méně.":t<=4?"Prosím, zadejte o "+e(t,!0)+" znaky méně.":"Prosím, zadejte o "+t+" znaků méně."},inputTooShort:function(n){var t=n.minimum-n.input.length;return 1==t?"Prosím, zadejte ještě jeden znak.":t<=4?"Prosím, zadejte ještě další "+e(t,!0)+" znaky.":"Prosím, zadejte ještě dalších "+t+" znaků."},loadingMore:function(){return"Načítají se další výsledky…"},maximumSelected:function(n){var t=n.maximum;return 1==t?"Můžete zvolit jen jednu položku.":t<=4?"Můžete zvolit maximálně "+e(t,!1)+" položky.":"Můžete zvolit maximálně "+t+" položek."},noResults:function(){return"Nenalezeny žádné položky."},searching:function(){return"Vyhledávání…"},removeAllItems:function(){return"Odstraňte všechny položky"}}}),e.define,e.require}();
})({ fn: { select2: { amd: { define: function (name, deps, factory) {
    (globalThis.Select2Languages = globalThis.Select2Languages || {})['cs'] = factory();
} } } } });
