/*
 * Translations for ca, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Catalan (ca)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['ca'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'El valor no pot estar buit.',
        ruleInteger: 'El valor ha de ser un nombre enter.',
        rulePositiveInteger: 'El valor ha de ser un nombre enter positiu.',
        ruleFloat: 'El valor ha de ser un nombre decimal.',
        rulePositiveFloat: 'El valor ha de ser un nombre decimal positiu.',
        ruleMin: 'El valor no pot ser inferior a :min.',
        ruleMax: 'El valor no pot ser superior a :max.',
        ruleMinLength: 'El text no pot tenir menys de :min caràcters.',
        ruleMaxLength: 'El text no pot tenir més de :max caràcters.',
        ruleRegex: 'El format del valor no és vàlid.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Negreta',
        italic: 'Cursiva',
        strikethrough: 'Ratllat',
        heading1: 'Títol 1',
        heading2: 'Títol 2',
        heading3: 'Títol 3',
        code: 'Codi',
        quote: 'Cita',
        unorderedList: 'Llista desordenada',
        orderedList: 'Llista ordenada',
        cleanBlock: 'Esborrar format del bloc',
        link: 'Enllaç',
        image: 'Imatge',
        table: 'Taula',
        horizontalRule: 'Inserir línia horitzontal',
        preview: 'Previsualitzar',
        sideBySide: 'En paral·lel',
        fullscreen: 'Pantalla completa'
    }
};

/*
 * RichArea translation: Catalan (ca)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['ca'] = {
    // Toolbar buttons
    toolbar: 'Barra d\'eines de l\'editor',
    fullscreen: 'Pantalla completa',
    bold: 'Negreta',
    italic: 'Cursiva',
    underline: 'Subratllat',
    strikeThrough: 'Ratllat',
    subscript: 'Subíndex',
    superscript: 'Superíndex',
    fontFamily: 'Tipus de lletra',
    fontSize: 'Mida de la font',
    color: 'Colors',
    emoticons: 'Emoticones',
    inlineStyle: 'Estil de text',
    paragraphStyle: 'Estil de paràgraf',
    paragraphFormat: 'Format de paràgraf',
    align: 'Alinear',
    formatOL: 'Llista ordenada',
    formatUL: 'Llista desordenada',
    outdent: 'Reduir sagnat',
    indent: 'Augmentar sagnat',
    quote: 'Cita',
    insertHR: 'Inserir línia horitzontal',
    insertLink: 'Inserir enllaç',
    insertPageLink: 'Inserir enllaç',
    insertImage: 'Inserir imatge',
    insertVideo: 'Inserir vídeo',
    insertAudio: 'Inserir àudio',
    insertFile: 'Inserir arxiu',
    insertTable: 'Inserir taula',
    insertSnippet: 'Inserir fragment',
    undo: 'Desfer',
    redo: 'Refer',
    clearFormatting: 'Esborrar format',
    selectAll: 'Seleccionar-ho tot',
    html: 'Vista de codi',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Maj',

    // Paragraph formats
    formatNormal: 'Normal',
    formatHeading1: 'Títol 1',
    formatHeading2: 'Títol 2',
    formatHeading3: 'Títol 3',
    formatHeading4: 'Títol 4',
    formatHeading5: 'Títol 5',
    formatHeading6: 'Títol 6',
    formatCode: 'Codi',

    // Alignment
    alignLeft: 'Alinear a l\'esquerra',
    alignCenter: 'Centrar',
    alignRight: 'Alinear a la dreta',
    alignJustify: 'Justificar',

    // Colors
    textColor: 'Text',
    backgroundColor: 'Fons',
    removeColor: 'Eliminar color',
    defaultFont: 'Per defecte',

    // Insert menus
    uploadFromComputer: 'Pujar des de l\'ordinador',
    browse: 'Explorar',
    byUrl: 'Per URL',
    embeddingCode: 'Codi d\'inserció',

    // Popover forms
    url: 'URL',
    text: 'Text',
    openInNewTab: 'Obrir en una pestanya nova',
    linkStyle: 'Estil',
    none: 'Cap',
    insert: 'Inserir',
    update: 'Actualitzar',
    cancel: 'Cancel·lar',
    remove: 'Eliminar',
    browsePages: 'Explorar pàgines',
    alternativeText: 'Text alternatiu',
    width: 'Amplada',
    widthPlaceholder: '300 o 50%',
    widthInvalid: 'Introduïu una amplada en píxels o en percentatge',
    urlRequired: 'Introduïu un URL',
    urlInvalid: 'Introduïu un URL vàlid',
    embeddingCodeRequired: 'Introduïu el codi d\'inserció',
    embeddingCodeInvalid: 'El codi d\'inserció ha de contenir un iframe',

    // Contextual toolbars
    openLink: 'Obrir enllaç',
    editLink: 'Editar enllaç',
    unlink: 'Eliminar enllaç',
    imageAlign: 'Alinear',
    imageAlignNone: 'En línia',
    imageAlignLeft: 'Flotant a l\'esquerra',
    imageAlignCenter: 'Centrat',
    imageAlignRight: 'Flotant a la dreta',
    imageStyle: 'Estil d\'imatge',
    imageAlt: 'Text alternatiu',
    imageSize: 'Canviar la mida',
    imageReplace: 'Substituir',
    imageRemove: 'Eliminar imatge',
    imageLink: 'Inserir enllaç',
    tableHeader: 'Capçalera de taula',
    tableRows: 'Fila',
    tableRowAbove: 'Inserir fila a sobre',
    tableRowBelow: 'Inserir fila a sota',
    tableRowDelete: 'Eliminar fila',
    tableColumns: 'Columna',
    tableColumnBefore: 'Inserir columna abans',
    tableColumnAfter: 'Inserir columna després',
    tableColumnDelete: 'Eliminar columna',
    tableCells: 'Cel·la',
    tableCellsMerge: 'Combinar cel·les',
    tableCellsSplit: 'Dividir cel·la',
    tableStyle: 'Estil de taula',
    tableCellStyle: 'Estil de cel·la',
    tableRemove: 'Eliminar taula',
    snippet: 'Fragment',
    snippetProperties: 'Propietats',
    snippetRemove: 'Eliminar fragment',
    mediaRemove: 'Eliminar',

    // Messages
    uploadFailed: 'No s\'ha pogut pujar l\'arxiu',
    invalidFileEmptyInsert: 'Seleccioneu un arxiu per inserir.',
    invalidFileSingleInsert: 'Seleccioneu un sol arxiu.',
    invalidImageEmptyInsert: 'Seleccioneu una imatge per inserir.',
    invalidImageInvalidInsert: 'L\'arxiu seleccionat no és una imatge.',
    invalidVideoInvalidInsert: 'L\'arxiu seleccionat no és un vídeo.',
    invalidAudioInvalidInsert: 'L\'arxiu seleccionat no és un arxiu d\'àudio.'
};

/*
 * Hotsheet translation: Catalan (ca)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['ca'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Sense dades',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Inserir fila a sobre',
    insertRowBelow: 'Inserir fila a sota',
    removeRow: 'Eliminar fila',
    undo: 'Desfer',
    redo: 'Refer',
    freezeColumn: 'Fixar columna',
    unfreezeColumn: 'Alliberar columna',

    // A cell whose value its column does not accept
    invalidValue: 'El valor no és vàlid.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Seleccionar una data',
    chooseTime: 'Seleccionar una hora'
};

// Select2's own translation, kept for the custom-select control
(function (jQuery) {
/*! Select2 4.1.0 | https://github.com/select2/select2/blob/master/LICENSE.md */

!function(){if(jQuery&&jQuery.fn&&jQuery.fn.select2&&jQuery.fn.select2.amd)var e=jQuery.fn.select2.amd;e.define("select2/i18n/ca",[],function(){return{errorLoading:function(){return"La càrrega ha fallat"},inputTooLong:function(e){var n=e.input.length-e.maximum,r="Si us plau, elimina "+n+" car";return r+=1==n?"àcter":"àcters"},inputTooShort:function(e){var n=e.minimum-e.input.length,r="Si us plau, introdueix "+n+" car";return r+=1==n?"àcter":"àcters"},loadingMore:function(){return"Carregant més resultats…"},maximumSelected:function(e){var n="Només es pot seleccionar "+e.maximum+" element";return 1!=e.maximum&&(n+="s"),n},noResults:function(){return"No s'han trobat resultats"},searching:function(){return"Cercant…"},removeAllItems:function(){return"Treu tots els elements"}}}),e.define,e.require}();
})({ fn: { select2: { amd: { define: function (name, deps, factory) {
    (globalThis.Select2Languages = globalThis.Select2Languages || {})['ca'] = factory();
} } } } });
