/*
 * Translations for sr, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Serbian (sr)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['sr'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Vrednost ne sme biti prazna.',
        ruleInteger: 'Vrednost mora biti ceo broj.',
        rulePositiveInteger: 'Vrednost mora biti pozitivan ceo broj.',
        ruleFloat: 'Vrednost mora biti decimalni broj.',
        rulePositiveFloat: 'Vrednost mora biti pozitivan decimalni broj.',
        ruleMin: 'Vrednost ne sme biti manja od :min.',
        ruleMax: 'Vrednost ne sme biti veća od :max.',
        ruleMinLength: 'Broj znakova ne sme biti manji od :min.',
        ruleMaxLength: 'Broj znakova ne sme biti veći od :max.',
        ruleRegex: 'Neispravan format vrednosti.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Podebljaj',
        italic: 'Ukosi',
        strikethrough: 'Precrtaj',
        heading1: 'Naslov 1',
        heading2: 'Naslov 2',
        heading3: 'Naslov 3',
        code: 'Kod',
        quote: 'Citat',
        unorderedList: 'Neuređena lista',
        orderedList: 'Uređena lista',
        cleanBlock: 'Obriši formatiranje bloka',
        link: 'Link',
        image: 'Slika',
        table: 'Tabela',
        horizontalRule: 'Ubaci horizontalnu liniju',
        preview: 'Pregled',
        sideBySide: 'Uporedni prikaz',
        fullscreen: 'Ceo ekran'
    }
};

/*
 * RichArea translation: Serbian (sr)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['sr'] = {
    // Toolbar buttons
    toolbar: 'Traka sa alatkama editora',
    fullscreen: 'Ceo ekran',
    bold: 'Podebljaj',
    italic: 'Ukosi',
    underline: 'Podvuci',
    strikeThrough: 'Precrtaj',
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
    formatOL: 'Uređena lista',
    formatUL: 'Neuređena lista',
    outdent: 'Smanji uvlačenje',
    indent: 'Povećaj uvlačenje',
    quote: 'Citat',
    insertHR: 'Ubaci horizontalnu liniju',
    insertLink: 'Ubaci link',
    insertPageLink: 'Ubaci link',
    insertImage: 'Ubaci sliku',
    insertVideo: 'Ubaci video zapis',
    insertAudio: 'Ubaci zvučni zapis',
    insertFile: 'Ubaci fajl',
    insertTable: 'Ubaci tabelu',
    insertSnippet: 'Ubaci isečak',
    undo: 'Opozovi',
    redo: 'Ponovi',
    clearFormatting: 'Obriši formatiranje',
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
    alignLeft: 'Poravnaj levo',
    alignCenter: 'Centriraj',
    alignRight: 'Poravnaj desno',
    alignJustify: 'Obostrano poravnaj',

    // Colors
    textColor: 'Tekst',
    backgroundColor: 'Pozadina',
    removeColor: 'Ukloni boju',
    defaultFont: 'Podrazumevano',

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
    widthInvalid: 'Unesi širinu u pikselima ili procentima',
    urlRequired: 'Unesi URL',
    urlInvalid: 'Unesi ispravan URL',
    embeddingCodeRequired: 'Unesi kod za ugrađivanje',
    embeddingCodeInvalid: 'Kod za ugrađivanje mora da sadrži iframe',

    // Contextual toolbars
    openLink: 'Otvori link',
    editLink: 'Izmeni link',
    unlink: 'Ukloni link',
    imageAlign: 'Poravnanje',
    imageAlignNone: 'U liniji sa tekstom',
    imageAlignLeft: 'Plutajuće levo',
    imageAlignCenter: 'Centrirano',
    imageAlignRight: 'Plutajuće desno',
    imageStyle: 'Stil slike',
    imageAlt: 'Alternativni tekst',
    imageSize: 'Promeni veličinu',
    imageReplace: 'Zameni',
    imageRemove: 'Ukloni sliku',
    imageLink: 'Ubaci link',
    tableHeader: 'Zaglavlje tabele',
    tableRows: 'Red',
    tableRowAbove: 'Ubaci red iznad',
    tableRowBelow: 'Ubaci red ispod',
    tableRowDelete: 'Izbriši red',
    tableColumns: 'Kolona',
    tableColumnBefore: 'Ubaci kolonu ispred',
    tableColumnAfter: 'Ubaci kolonu iza',
    tableColumnDelete: 'Izbriši kolonu',
    tableCells: 'Ćelija',
    tableCellsMerge: 'Spoji ćelije',
    tableCellsSplit: 'Podeli ćeliju',
    tableStyle: 'Stil tabele',
    tableCellStyle: 'Stil ćelije',
    tableRemove: 'Ukloni tabelu',
    snippet: 'Isečak',
    snippetProperties: 'Svojstva',
    snippetRemove: 'Ukloni isečak',
    mediaRemove: 'Ukloni',

    // Messages
    uploadFailed: 'Otpremanje fajla nije uspelo',
    invalidFileEmptyInsert: 'Odaberi fajl za ubacivanje.',
    invalidFileSingleInsert: 'Odaberi samo jedan fajl.',
    invalidImageEmptyInsert: 'Odaberi sliku za ubacivanje.',
    invalidImageInvalidInsert: 'Odabrani fajl nije slika.',
    invalidVideoInvalidInsert: 'Odabrani fajl nije video zapis.',
    invalidAudioInvalidInsert: 'Odabrani fajl nije zvučni zapis.'
};

/*
 * Hotsheet translation: Serbian (sr)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['sr'] = {
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
    invalidValue: 'Vrednost nije ispravna.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Izaberi datum',
    chooseTime: 'Izaberi vreme'
};

// Select2's own translation, kept for the custom-select control
(function (jQuery) {
/*! Select2 4.1.0 | https://github.com/select2/select2/blob/master/LICENSE.md */

!function(){if(jQuery&&jQuery.fn&&jQuery.fn.select2&&jQuery.fn.select2.amd)var n=jQuery.fn.select2.amd;n.define("select2/i18n/sr",[],function(){function n(n,e,r,t){return n%10==1&&n%100!=11?e:n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?r:t}return{errorLoading:function(){return"Preuzimanje nije uspelo."},inputTooLong:function(e){var r=e.input.length-e.maximum,t="Obrišite "+r+" simbol";return t+=n(r,"","a","a")},inputTooShort:function(e){var r=e.minimum-e.input.length,t="Ukucajte bar još "+r+" simbol";return t+=n(r,"","a","a")},loadingMore:function(){return"Preuzimanje još rezultata…"},maximumSelected:function(e){var r="Možete izabrati samo "+e.maximum+" stavk";return r+=n(e.maximum,"u","e","i")},noResults:function(){return"Ništa nije pronađeno"},searching:function(){return"Pretraga…"},removeAllItems:function(){return"Уклоните све ставке"}}}),n.define,n.require}();
})({ fn: { select2: { amd: { define: function (name, deps, factory) {
    (globalThis.Select2Languages = globalThis.Select2Languages || {})['sr'] = factory();
} } } } });
