/*
 * Translations for nl, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Dutch (nl)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['nl'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'De waarde mag niet leeg zijn.',
        ruleInteger: 'De waarde moet een geheel getal zijn.',
        rulePositiveInteger: 'De waarde moet een positief geheel getal zijn.',
        ruleFloat: 'De waarde moet een decimaal getal zijn.',
        rulePositiveFloat: 'De waarde moet een positief decimaal getal zijn.',
        ruleMin: 'De waarde mag niet kleiner zijn dan :min.',
        ruleMax: 'De waarde mag niet groter zijn dan :max.',
        ruleMinLength: 'De tekst mag niet korter zijn dan :min tekens.',
        ruleMaxLength: 'De tekst mag niet langer zijn dan :max tekens.',
        ruleRegex: 'De waarde heeft een ongeldig formaat.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Vet',
        italic: 'Cursief',
        strikethrough: 'Doorhalen',
        heading1: 'Kop 1',
        heading2: 'Kop 2',
        heading3: 'Kop 3',
        code: 'Code',
        quote: 'Citaat',
        unorderedList: 'Ongeordende lijst',
        orderedList: 'Genummerde lijst',
        cleanBlock: 'Blokopmaak wissen',
        link: 'Link',
        image: 'Afbeelding',
        table: 'Tabel',
        horizontalRule: 'Horizontale lijn invoegen',
        preview: 'Voorbeeld',
        sideBySide: 'Naast elkaar',
        fullscreen: 'Volledig scherm'
    }
};

/*
 * RichArea translation: Dutch (nl)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['nl'] = {
    // Toolbar buttons
    toolbar: 'Editorwerkbalk',
    fullscreen: 'Volledig scherm',
    bold: 'Vet',
    italic: 'Cursief',
    underline: 'Onderstrepen',
    strikeThrough: 'Doorhalen',
    subscript: 'Subscript',
    superscript: 'Superscript',
    fontFamily: 'Lettertype',
    fontSize: 'Lettergrootte',
    color: 'Kleuren',
    emoticons: 'Emoticons',
    inlineStyle: 'Inline-stijl',
    paragraphStyle: 'Alineastijl',
    paragraphFormat: 'Alinea-opmaak',
    align: 'Uitlijnen',
    formatOL: 'Genummerde lijst',
    formatUL: 'Ongeordende lijst',
    outdent: 'Inspringing verkleinen',
    indent: 'Inspringing vergroten',
    quote: 'Citaat',
    insertHR: 'Horizontale lijn invoegen',
    insertLink: 'Link invoegen',
    insertPageLink: 'Link invoegen',
    insertImage: 'Afbeelding invoegen',
    insertVideo: 'Video invoegen',
    insertAudio: 'Audio invoegen',
    insertFile: 'Bestand invoegen',
    insertTable: 'Tabel invoegen',
    insertSnippet: 'Snippet invoegen',
    undo: 'Ongedaan maken',
    redo: 'Opnieuw',
    clearFormatting: 'Opmaak wissen',
    selectAll: 'Alles selecteren',
    html: 'Codeweergave',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Normaal',
    formatHeading1: 'Kop 1',
    formatHeading2: 'Kop 2',
    formatHeading3: 'Kop 3',
    formatHeading4: 'Kop 4',
    formatHeading5: 'Kop 5',
    formatHeading6: 'Kop 6',
    formatCode: 'Code',

    // Alignment
    alignLeft: 'Links uitlijnen',
    alignCenter: 'Centreren',
    alignRight: 'Rechts uitlijnen',
    alignJustify: 'Uitvullen',

    // Colors
    textColor: 'Tekst',
    backgroundColor: 'Achtergrond',
    removeColor: 'Kleur verwijderen',
    defaultFont: 'Standaard',

    // Insert menus
    uploadFromComputer: 'Uploaden vanaf computer',
    browse: 'Bladeren',
    byUrl: 'Via URL',
    embeddingCode: 'Insluitcode',

    // Popover forms
    url: 'URL',
    text: 'Tekst',
    openInNewTab: 'Openen in nieuw tabblad',
    linkStyle: 'Stijl',
    none: 'Geen',
    insert: 'Invoegen',
    update: 'Bijwerken',
    cancel: 'Annuleren',
    remove: 'Verwijderen',
    browsePages: 'Bladeren door pagina\'s',
    alternativeText: 'Alternatieve tekst',
    width: 'Breedte',
    widthPlaceholder: '300 of 50%',
    widthInvalid: 'Voer een breedte in pixels of als percentage in',
    urlRequired: 'Voer een URL in',
    urlInvalid: 'Voer een geldige URL in',
    embeddingCodeRequired: 'Voer de insluitcode in',
    embeddingCodeInvalid: 'De insluitcode moet een iframe bevatten',

    // Contextual toolbars
    openLink: 'Link openen',
    editLink: 'Link bewerken',
    unlink: 'Link verwijderen',
    imageAlign: 'Uitlijnen',
    imageAlignNone: 'Inline',
    imageAlignLeft: 'Links zwevend',
    imageAlignCenter: 'Centreren',
    imageAlignRight: 'Rechts zwevend',
    imageStyle: 'Afbeeldingsstijl',
    imageAlt: 'Alternatieve tekst',
    imageSize: 'Grootte wijzigen',
    imageReplace: 'Vervangen',
    imageRemove: 'Afbeelding verwijderen',
    imageLink: 'Link invoegen',
    tableHeader: 'Tabelkop',
    tableRows: 'Rij',
    tableRowAbove: 'Rij erboven invoegen',
    tableRowBelow: 'Rij eronder invoegen',
    tableRowDelete: 'Rij verwijderen',
    tableColumns: 'Kolom',
    tableColumnBefore: 'Kolom ervoor invoegen',
    tableColumnAfter: 'Kolom erna invoegen',
    tableColumnDelete: 'Kolom verwijderen',
    tableCells: 'Cel',
    tableCellsMerge: 'Cellen samenvoegen',
    tableCellsSplit: 'Cel splitsen',
    tableStyle: 'Tabelstijl',
    tableCellStyle: 'Celstijl',
    tableRemove: 'Tabel verwijderen',
    snippet: 'Snippet',
    snippetProperties: 'Eigenschappen',
    snippetRemove: 'Snippet verwijderen',
    mediaRemove: 'Verwijderen',

    // Messages
    uploadFailed: 'Het bestand kon niet worden geüpload',
    invalidFileEmptyInsert: 'Selecteer een bestand om in te voegen.',
    invalidFileSingleInsert: 'Selecteer één bestand.',
    invalidImageEmptyInsert: 'Selecteer een afbeelding om in te voegen.',
    invalidImageInvalidInsert: 'Het geselecteerde bestand is geen afbeelding.',
    invalidVideoInvalidInsert: 'Het geselecteerde bestand is geen video.',
    invalidAudioInvalidInsert: 'Het geselecteerde bestand is geen audiobestand.'
};

/*
 * Hotsheet translation: Dutch (nl)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['nl'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Geen gegevens',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Rij erboven invoegen',
    insertRowBelow: 'Rij eronder invoegen',
    removeRow: 'Rij verwijderen',
    undo: 'Ongedaan maken',
    redo: 'Opnieuw',
    freezeColumn: 'Kolom vastzetten',
    unfreezeColumn: 'Kolom losmaken',

    // A cell whose value its column does not accept
    invalidValue: 'De waarde is ongeldig.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Datum kiezen',
    chooseTime: 'Tijd kiezen'
};
