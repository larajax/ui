/*
 * Translations for fi, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Finnish (fi)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['fi'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Arvo ei voi olla tyhjä.',
        ruleInteger: 'Arvon on oltava kokonaisluku.',
        rulePositiveInteger: 'Arvon on oltava positiivinen kokonaisluku.',
        ruleFloat: 'Arvon on oltava desimaaliluku.',
        rulePositiveFloat: 'Arvon on oltava positiivinen desimaaliluku.',
        ruleMin: 'Arvo ei voi olla pienempi kuin :min.',
        ruleMax: 'Arvo ei voi olla suurempi kuin :max.',
        ruleMinLength: 'Teksti ei voi olla lyhyempi kuin :min merkkiä.',
        ruleMaxLength: 'Teksti ei voi olla pidempi kuin :max merkkiä.',
        ruleRegex: 'Arvon muoto ei ole kelvollinen.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Lihavointi',
        italic: 'Kursivointi',
        strikethrough: 'Yliviivaus',
        heading1: 'Otsikko 1',
        heading2: 'Otsikko 2',
        heading3: 'Otsikko 3',
        code: 'Koodi',
        quote: 'Lainaus',
        unorderedList: 'Järjestämätön lista',
        orderedList: 'Järjestetty lista',
        cleanBlock: 'Poista lohkon muotoilu',
        link: 'Linkki',
        image: 'Kuva',
        table: 'Taulukko',
        horizontalRule: 'Lisää vaakaviiva',
        preview: 'Esikatselu',
        sideBySide: 'Rinnakkain',
        fullscreen: 'Kokonäyttö'
    },

    // Custom select messages
    customselect: {
        noResults: 'Ei tuloksia',
        searching: 'Haetaan…',
        loadingMore: 'Ladataan lisää tuloksia…',
        errorLoading: 'Tuloksia ei saatu ladattua.',
        inputTooShort: 'Ole hyvä ja anna :count merkkiä lisää',
        maximumSelected: 'Voit valita ainoastaan :count kpl',
        removeItem: 'Poista kohde',
        removeAllItems: 'Poista kaikki kohteet'
    }
};

/*
 * RichArea translation: Finnish (fi)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['fi'] = {
    // Toolbar buttons
    toolbar: 'Editorin työkalurivi',
    fullscreen: 'Kokonäyttö',
    bold: 'Lihavointi',
    italic: 'Kursivointi',
    underline: 'Alleviivaus',
    strikeThrough: 'Yliviivaus',
    subscript: 'Alaindeksi',
    superscript: 'Yläindeksi',
    fontFamily: 'Kirjasin',
    fontSize: 'Kirjasimen koko',
    color: 'Värit',
    emoticons: 'Hymiöt',
    inlineStyle: 'Merkkityyli',
    paragraphStyle: 'Kappaletyyli',
    paragraphFormat: 'Kappaleen muotoilu',
    align: 'Tasaus',
    formatOL: 'Järjestetty lista',
    formatUL: 'Järjestämätön lista',
    outdent: 'Pienennä sisennystä',
    indent: 'Suurenna sisennystä',
    quote: 'Lainaus',
    insertHR: 'Lisää vaakaviiva',
    insertLink: 'Lisää linkki',
    insertPageLink: 'Lisää linkki',
    insertImage: 'Lisää kuva',
    insertVideo: 'Lisää video',
    insertAudio: 'Lisää äänitiedosto',
    insertFile: 'Lisää tiedosto',
    insertTable: 'Lisää taulukko',
    insertSnippet: 'Lisää osa',
    undo: 'Kumoa',
    redo: 'Tee uudelleen',
    clearFormatting: 'Poista muotoilu',
    selectAll: 'Valitse kaikki',
    html: 'Koodinäkymä',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Vaihto',

    // Paragraph formats
    formatNormal: 'Normaali',
    formatHeading1: 'Otsikko 1',
    formatHeading2: 'Otsikko 2',
    formatHeading3: 'Otsikko 3',
    formatHeading4: 'Otsikko 4',
    formatHeading5: 'Otsikko 5',
    formatHeading6: 'Otsikko 6',
    formatCode: 'Koodi',

    // Alignment
    alignLeft: 'Tasaa vasemmalle',
    alignCenter: 'Keskitä',
    alignRight: 'Tasaa oikealle',
    alignJustify: 'Tasaa molemmat reunat',

    // Colors
    textColor: 'Teksti',
    backgroundColor: 'Tausta',
    removeColor: 'Poista väri',
    defaultFont: 'Oletus',

    // Insert menus
    uploadFromComputer: 'Lähetä tietokoneelta',
    browse: 'Selaa',
    byUrl: 'URL-osoitteesta',
    embeddingCode: 'Upotuskoodi',

    // Popover forms
    url: 'URL',
    text: 'Teksti',
    openInNewTab: 'Avaa uudessa välilehdessä',
    linkStyle: 'Tyyli',
    none: 'Ei mitään',
    insert: 'Lisää',
    update: 'Päivitä',
    cancel: 'Peruuta',
    remove: 'Poista',
    browsePages: 'Selaa sivuja',
    alternativeText: 'Vaihtoehtoinen teksti',
    width: 'Leveys',
    widthPlaceholder: '300 tai 50%',
    widthInvalid: 'Anna leveys pikseleinä tai prosentteina',
    urlRequired: 'Anna URL-osoite',
    urlInvalid: 'Anna kelvollinen URL-osoite',
    embeddingCodeRequired: 'Anna upotuskoodi',
    embeddingCodeInvalid: 'Upotuskoodin on sisällettävä iframe',

    // Contextual toolbars
    openLink: 'Avaa linkki',
    editLink: 'Muokkaa linkkiä',
    unlink: 'Poista linkitys',
    imageAlign: 'Tasaus',
    imageAlignNone: 'Tekstin tasossa',
    imageAlignLeft: 'Kellu vasemmalle',
    imageAlignCenter: 'Keskitä',
    imageAlignRight: 'Kellu oikealle',
    imageStyle: 'Kuvan tyyli',
    imageAlt: 'Vaihtoehtoinen teksti',
    imageSize: 'Muuta kokoa',
    imageReplace: 'Korvaa',
    imageRemove: 'Poista kuva',
    imageLink: 'Lisää linkki',
    tableHeader: 'Taulukon otsikkorivi',
    tableRows: 'Rivi',
    tableRowAbove: 'Lisää rivi yläpuolelle',
    tableRowBelow: 'Lisää rivi alapuolelle',
    tableRowDelete: 'Poista rivi',
    tableColumns: 'Sarake',
    tableColumnBefore: 'Lisää sarake eteen',
    tableColumnAfter: 'Lisää sarake perään',
    tableColumnDelete: 'Poista sarake',
    tableCells: 'Solu',
    tableCellsMerge: 'Yhdistä solut',
    tableCellsSplit: 'Jaa solu',
    tableStyle: 'Taulukon tyyli',
    tableCellStyle: 'Solun tyyli',
    tableRemove: 'Poista taulukko',
    snippet: 'Osa',
    snippetProperties: 'Ominaisuudet',
    snippetRemove: 'Poista osa',
    mediaRemove: 'Poista',

    // Messages
    uploadFailed: 'Tiedostoa ei voitu lähettää',
    invalidFileEmptyInsert: 'Valitse lisättävä tiedosto.',
    invalidFileSingleInsert: 'Valitse vain yksi tiedosto.',
    invalidImageEmptyInsert: 'Valitse lisättävä kuva.',
    invalidImageInvalidInsert: 'Valittu tiedosto ei ole kuva.',
    invalidVideoInvalidInsert: 'Valittu tiedosto ei ole video.',
    invalidAudioInvalidInsert: 'Valittu tiedosto ei ole äänitiedosto.'
};

/*
 * Hotsheet translation: Finnish (fi)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['fi'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Ei tietoja',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Lisää rivi yläpuolelle',
    insertRowBelow: 'Lisää rivi alapuolelle',
    removeRow: 'Poista rivi',
    undo: 'Kumoa',
    redo: 'Tee uudelleen',
    freezeColumn: 'Lukitse sarake',
    unfreezeColumn: 'Vapauta sarake',

    // A cell whose value its column does not accept
    invalidValue: 'Arvo ei ole kelvollinen.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Valitse päivämäärä',
    chooseTime: 'Valitse kellonaika'
};
