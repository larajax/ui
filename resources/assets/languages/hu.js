/*
 * Translations for hu, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Hungarian (hu)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['hu'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Az érték nem lehet üres.',
        ruleInteger: 'Az értéknek egész számnak kell lennie.',
        rulePositiveInteger: 'Az értéknek pozitív egész számnak kell lennie.',
        ruleFloat: 'Az értéknek tizedes törtnek kell lennie.',
        rulePositiveFloat: 'Az értéknek pozitív tizedes törtnek kell lennie.',
        ruleMin: 'Az érték nem lehet kisebb, mint :min.',
        ruleMax: 'Az érték nem lehet nagyobb, mint :max.',
        ruleMinLength: 'A szöveg nem lehet rövidebb :min karakternél.',
        ruleMaxLength: 'A szöveg nem lehet hosszabb :max karakternél.',
        ruleRegex: 'Az érték formátuma érvénytelen.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Félkövér',
        italic: 'Dőlt',
        strikethrough: 'Áthúzott',
        heading1: 'Címsor 1',
        heading2: 'Címsor 2',
        heading3: 'Címsor 3',
        code: 'Kód',
        quote: 'Idézet',
        unorderedList: 'Felsorolásjeles lista',
        orderedList: 'Számozott lista',
        cleanBlock: 'Blokkformázás törlése',
        link: 'Hivatkozás',
        image: 'Kép',
        table: 'Táblázat',
        horizontalRule: 'Vízszintes vonal beszúrása',
        preview: 'Előnézet',
        sideBySide: 'Egymás melletti nézet',
        fullscreen: 'Teljes képernyő'
    },

    // Custom select messages
    customselect: {
        noResults: 'Nincs találat.',
        searching: 'Keresés…',
        loadingMore: 'Töltés…',
        errorLoading: 'Az eredmények betöltése nem sikerült.',
        inputTooShort: 'Túl rövid. Még :count karakter hiányzik.',
        maximumSelected: 'Csak :count elemet lehet kiválasztani.',
        removeItem: 'Elem eltávolítása',
        removeAllItems: 'Távolítson el minden elemet'
    }
};

/*
 * RichArea translation: Hungarian (hu)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['hu'] = {
    // Toolbar buttons
    toolbar: 'Szerkesztő eszköztára',
    fullscreen: 'Teljes képernyő',
    bold: 'Félkövér',
    italic: 'Dőlt',
    underline: 'Aláhúzott',
    strikeThrough: 'Áthúzott',
    subscript: 'Alsó index',
    superscript: 'Felső index',
    fontFamily: 'Betűtípus',
    fontSize: 'Betűméret',
    color: 'Színek',
    emoticons: 'Hangulatjelek',
    inlineStyle: 'Szövegstílus',
    paragraphStyle: 'Bekezdésstílus',
    paragraphFormat: 'Bekezdésformátum',
    align: 'Igazítás',
    formatOL: 'Számozott lista',
    formatUL: 'Felsorolásjeles lista',
    outdent: 'Behúzás csökkentése',
    indent: 'Behúzás növelése',
    quote: 'Idézet',
    insertHR: 'Vízszintes vonal beszúrása',
    insertLink: 'Hivatkozás beszúrása',
    insertPageLink: 'Hivatkozás beszúrása',
    insertImage: 'Kép beszúrása',
    insertVideo: 'Videó beszúrása',
    insertAudio: 'Audió beszúrása',
    insertFile: 'Fájl beszúrása',
    insertTable: 'Táblázat beszúrása',
    insertSnippet: 'Kódrészlet beszúrása',
    undo: 'Visszavonás',
    redo: 'Újra',
    clearFormatting: 'Formázás törlése',
    selectAll: 'Összes kijelölése',
    html: 'Kódnézet',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Normál',
    formatHeading1: 'Címsor 1',
    formatHeading2: 'Címsor 2',
    formatHeading3: 'Címsor 3',
    formatHeading4: 'Címsor 4',
    formatHeading5: 'Címsor 5',
    formatHeading6: 'Címsor 6',
    formatCode: 'Kód',

    // Alignment
    alignLeft: 'Balra igazítás',
    alignCenter: 'Középre igazítás',
    alignRight: 'Jobbra igazítás',
    alignJustify: 'Sorkizárás',

    // Colors
    textColor: 'Szöveg',
    backgroundColor: 'Háttér',
    removeColor: 'Szín eltávolítása',
    defaultFont: 'Alapértelmezett',

    // Insert menus
    uploadFromComputer: 'Feltöltés számítógépről',
    browse: 'Böngészés',
    byUrl: 'URL alapján',
    embeddingCode: 'Beágyazási kód',

    // Popover forms
    url: 'URL',
    text: 'Szöveg',
    openInNewTab: 'Megnyitás új lapon',
    linkStyle: 'Stílus',
    none: 'Nincs',
    insert: 'Beszúrás',
    update: 'Frissítés',
    cancel: 'Mégse',
    remove: 'Eltávolítás',
    browsePages: 'Oldalak böngészése',
    alternativeText: 'Helyettesítő szöveg',
    width: 'Szélesség',
    widthPlaceholder: '300 vagy 50%',
    widthInvalid: 'Adja meg a szélességet képpontban vagy százalékban',
    urlRequired: 'Adjon meg egy URL-címet',
    urlInvalid: 'Adjon meg egy érvényes URL-címet',
    embeddingCodeRequired: 'Adja meg a beágyazási kódot',
    embeddingCodeInvalid: 'A beágyazási kódnak tartalmaznia kell egy iframe-et',

    // Contextual toolbars
    openLink: 'Hivatkozás megnyitása',
    editLink: 'Hivatkozás szerkesztése',
    unlink: 'Hivatkozás eltávolítása',
    imageAlign: 'Igazítás',
    imageAlignNone: 'Szöveggel egy sorban',
    imageAlignLeft: 'Balra úsztatva',
    imageAlignCenter: 'Középre',
    imageAlignRight: 'Jobbra úsztatva',
    imageStyle: 'Képstílus',
    imageAlt: 'Helyettesítő szöveg',
    imageSize: 'Méret módosítása',
    imageReplace: 'Csere',
    imageRemove: 'Kép eltávolítása',
    imageLink: 'Hivatkozás beszúrása',
    tableHeader: 'Táblázatfejléc',
    tableRows: 'Sor',
    tableRowAbove: 'Sor beszúrása fölé',
    tableRowBelow: 'Sor beszúrása alá',
    tableRowDelete: 'Sor törlése',
    tableColumns: 'Oszlop',
    tableColumnBefore: 'Oszlop beszúrása elé',
    tableColumnAfter: 'Oszlop beszúrása mögé',
    tableColumnDelete: 'Oszlop törlése',
    tableCells: 'Cella',
    tableCellsMerge: 'Cellák egyesítése',
    tableCellsSplit: 'Cella felosztása',
    tableStyle: 'Táblázatstílus',
    tableCellStyle: 'Cellastílus',
    tableRemove: 'Táblázat eltávolítása',
    snippet: 'Kódrészlet',
    snippetProperties: 'Tulajdonságok',
    snippetRemove: 'Kódrészlet eltávolítása',
    mediaRemove: 'Eltávolítás',

    // Messages
    uploadFailed: 'A fájlt nem sikerült feltölteni',
    invalidFileEmptyInsert: 'Válasszon ki egy fájlt a beszúráshoz.',
    invalidFileSingleInsert: 'Kérjük, csak egy fájlt válasszon ki.',
    invalidImageEmptyInsert: 'Válasszon ki egy képet a beszúráshoz.',
    invalidImageInvalidInsert: 'A kiválasztott fájl nem kép.',
    invalidVideoInvalidInsert: 'A kiválasztott fájl nem videó.',
    invalidAudioInvalidInsert: 'A kiválasztott fájl nem hangfájl.'
};

/*
 * Hotsheet translation: Hungarian (hu)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['hu'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Nincs adat',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Sor beszúrása fölé',
    insertRowBelow: 'Sor beszúrása alá',
    removeRow: 'Sor eltávolítása',
    undo: 'Visszavonás',
    redo: 'Újra',
    freezeColumn: 'Oszlop rögzítése',
    unfreezeColumn: 'Oszlop rögzítésének feloldása',

    // A cell whose value its column does not accept
    invalidValue: 'Az érték nem érvényes.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Dátum kiválasztása',
    chooseTime: 'Időpont kiválasztása'
};
