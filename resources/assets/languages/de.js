/*
 * Translations for de, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: German (de)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['de'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Der Wert darf nicht leer sein.',
        ruleInteger: 'Der Wert muss eine ganze Zahl sein.',
        rulePositiveInteger: 'Der Wert muss eine positive ganze Zahl sein.',
        ruleFloat: 'Der Wert muss eine Dezimalzahl sein.',
        rulePositiveFloat: 'Der Wert muss eine positive Dezimalzahl sein.',
        ruleMin: 'Der Wert darf nicht kleiner als :min sein.',
        ruleMax: 'Der Wert darf nicht größer als :max sein.',
        ruleMinLength: 'Der Text darf nicht kürzer als :min Zeichen sein.',
        ruleMaxLength: 'Der Text darf nicht länger als :max Zeichen sein.',
        ruleRegex: 'Der Wert hat ein ungültiges Format.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Fett',
        italic: 'Kursiv',
        strikethrough: 'Durchgestrichen',
        heading1: 'Überschrift 1',
        heading2: 'Überschrift 2',
        heading3: 'Überschrift 3',
        code: 'Code',
        quote: 'Zitat',
        unorderedList: 'Aufzählungsliste',
        orderedList: 'Nummerierte Liste',
        cleanBlock: 'Blockformatierung entfernen',
        link: 'Link',
        image: 'Bild',
        table: 'Tabelle',
        horizontalRule: 'Horizontale Linie einfügen',
        preview: 'Vorschau',
        sideBySide: 'Nebeneinander',
        fullscreen: 'Vollbild'
    }
};

/*
 * RichArea translation: German (de)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['de'] = {
    // Toolbar buttons
    toolbar: 'Editor-Werkzeugleiste',
    fullscreen: 'Vollbild',
    bold: 'Fett',
    italic: 'Kursiv',
    underline: 'Unterstrichen',
    strikeThrough: 'Durchgestrichen',
    subscript: 'Tiefgestellt',
    superscript: 'Hochgestellt',
    fontFamily: 'Schriftart',
    fontSize: 'Schriftgröße',
    color: 'Farben',
    emoticons: 'Emoticons',
    inlineStyle: 'Inline-Stil',
    paragraphStyle: 'Absatzstil',
    paragraphFormat: 'Absatzformat',
    align: 'Ausrichten',
    formatOL: 'Nummerierte Liste',
    formatUL: 'Aufzählungsliste',
    outdent: 'Einzug verkleinern',
    indent: 'Einzug vergrößern',
    quote: 'Zitat',
    insertHR: 'Horizontale Linie einfügen',
    insertLink: 'Link einfügen',
    insertPageLink: 'Link einfügen',
    insertImage: 'Bild einfügen',
    insertVideo: 'Video einfügen',
    insertAudio: 'Audio einfügen',
    insertFile: 'Datei einfügen',
    insertTable: 'Tabelle einfügen',
    insertSnippet: 'Snippet einfügen',
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    clearFormatting: 'Formatierung entfernen',
    selectAll: 'Alles auswählen',
    html: 'Codeansicht',

    // Shortcut keys
    keyCtrl: 'Strg',
    keyAlt: 'Alt',
    keyShift: 'Umschalt',

    // Paragraph formats
    formatNormal: 'Normal',
    formatHeading1: 'Überschrift 1',
    formatHeading2: 'Überschrift 2',
    formatHeading3: 'Überschrift 3',
    formatHeading4: 'Überschrift 4',
    formatHeading5: 'Überschrift 5',
    formatHeading6: 'Überschrift 6',
    formatCode: 'Code',

    // Alignment
    alignLeft: 'Linksbündig',
    alignCenter: 'Zentriert',
    alignRight: 'Rechtsbündig',
    alignJustify: 'Blocksatz',

    // Colors
    textColor: 'Text',
    backgroundColor: 'Hintergrund',
    removeColor: 'Farbe entfernen',
    defaultFont: 'Standard',

    // Insert menus
    uploadFromComputer: 'Vom Computer hochladen',
    browse: 'Durchsuchen',
    byUrl: 'Per URL',
    embeddingCode: 'Einbettungscode',

    // Popover forms
    url: 'URL',
    text: 'Text',
    openInNewTab: 'In neuem Tab öffnen',
    linkStyle: 'Stil',
    none: 'Keiner',
    insert: 'Einfügen',
    update: 'Aktualisieren',
    cancel: 'Abbrechen',
    remove: 'Entfernen',
    browsePages: 'Seiten durchsuchen',
    alternativeText: 'Alternativtext',
    width: 'Breite',
    widthPlaceholder: '300 oder 50%',
    widthInvalid: 'Bitte eine Breite in Pixeln oder Prozent eingeben',
    urlRequired: 'Bitte eine URL eingeben',
    urlInvalid: 'Bitte eine gültige URL eingeben',
    embeddingCodeRequired: 'Bitte den Einbettungscode eingeben',
    embeddingCodeInvalid: 'Der Einbettungscode muss ein iframe enthalten',

    // Contextual toolbars
    openLink: 'Link öffnen',
    editLink: 'Link bearbeiten',
    unlink: 'Link entfernen',
    imageAlign: 'Ausrichten',
    imageAlignNone: 'Inline',
    imageAlignLeft: 'Links mit Textumfluss',
    imageAlignCenter: 'Zentriert',
    imageAlignRight: 'Rechts mit Textumfluss',
    imageStyle: 'Bildstil',
    imageAlt: 'Alternativtext',
    imageSize: 'Größe ändern',
    imageReplace: 'Ersetzen',
    imageRemove: 'Bild entfernen',
    imageLink: 'Link einfügen',
    tableHeader: 'Tabellenkopf',
    tableRows: 'Zeile',
    tableRowAbove: 'Zeile oberhalb einfügen',
    tableRowBelow: 'Zeile unterhalb einfügen',
    tableRowDelete: 'Zeile löschen',
    tableColumns: 'Spalte',
    tableColumnBefore: 'Spalte davor einfügen',
    tableColumnAfter: 'Spalte danach einfügen',
    tableColumnDelete: 'Spalte löschen',
    tableCells: 'Zelle',
    tableCellsMerge: 'Zellen verbinden',
    tableCellsSplit: 'Zelle teilen',
    tableStyle: 'Tabellenstil',
    tableCellStyle: 'Zellenstil',
    tableRemove: 'Tabelle entfernen',
    snippet: 'Snippet',
    snippetProperties: 'Eigenschaften',
    snippetRemove: 'Snippet entfernen',
    mediaRemove: 'Entfernen',

    // Messages
    uploadFailed: 'Die Datei konnte nicht hochgeladen werden',
    invalidFileEmptyInsert: 'Bitte eine Datei zum Einfügen auswählen.',
    invalidFileSingleInsert: 'Bitte nur eine Datei auswählen.',
    invalidImageEmptyInsert: 'Bitte ein Bild zum Einfügen auswählen.',
    invalidImageInvalidInsert: 'Die ausgewählte Datei ist kein Bild.',
    invalidVideoInvalidInsert: 'Die ausgewählte Datei ist kein Video.',
    invalidAudioInvalidInsert: 'Die ausgewählte Datei ist keine Audiodatei.'
};

/*
 * Hotsheet translation: German (de)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['de'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Keine Daten',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Zeile oberhalb einfügen',
    insertRowBelow: 'Zeile unterhalb einfügen',
    removeRow: 'Zeile löschen',
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    freezeColumn: 'Spalte fixieren',
    unfreezeColumn: 'Spaltenfixierung aufheben',

    // A cell whose value its column does not accept
    invalidValue: 'Der Wert ist ungültig.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Datum auswählen',
    chooseTime: 'Uhrzeit auswählen'
};

// Select2's own translation, kept for the custom-select control
(function (jQuery) {
/*! Select2 4.1.0 | https://github.com/select2/select2/blob/master/LICENSE.md */

!function(){if(jQuery&&jQuery.fn&&jQuery.fn.select2&&jQuery.fn.select2.amd)var e=jQuery.fn.select2.amd;e.define("select2/i18n/de",[],function(){return{errorLoading:function(){return"Die Ergebnisse konnten nicht geladen werden."},inputTooLong:function(e){return"Bitte "+(e.input.length-e.maximum)+" Zeichen weniger eingeben"},inputTooShort:function(e){return"Bitte "+(e.minimum-e.input.length)+" Zeichen mehr eingeben"},loadingMore:function(){return"Lade mehr Ergebnisse…"},maximumSelected:function(e){var n="Sie können nur "+e.maximum+" Element";return 1!=e.maximum&&(n+="e"),n+=" auswählen"},noResults:function(){return"Keine Übereinstimmungen gefunden"},searching:function(){return"Suche…"},removeAllItems:function(){return"Entferne alle Elemente"},removeItem:function(){return"Element entfernen"},search:function(){return"Suchen"}}}),e.define,e.require}();
})({ fn: { select2: { amd: { define: function (name, deps, factory) {
    (globalThis.Select2Languages = globalThis.Select2Languages || {})['de'] = factory();
} } } } });
