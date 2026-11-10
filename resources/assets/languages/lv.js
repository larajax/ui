/*
 * Translations for lv, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Latvian (lv)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['lv'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Vērtība nedrīkst būt tukša.',
        ruleInteger: 'Vērtībai ir jābūt veselam skaitlim.',
        rulePositiveInteger: 'Vērtībai ir jābūt pozitīvam veselam skaitlim.',
        ruleFloat: 'Vērtībai ir jābūt decimālskaitlim.',
        rulePositiveFloat: 'Vērtībai ir jābūt pozitīvam decimālskaitlim.',
        ruleMin: 'Vērtība nedrīkst būt mazāka par :min.',
        ruleMax: 'Vērtība nedrīkst būt lielāka par :max.',
        ruleMinLength: 'Teksts nedrīkst būt īsāks par :min rakstzīmēm.',
        ruleMaxLength: 'Teksts nedrīkst būt garāks par :max rakstzīmēm.',
        ruleRegex: 'Vērtībai ir nederīgs formāts.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Treknraksts',
        italic: 'Slīpraksts',
        strikethrough: 'Pārsvītrojums',
        heading1: 'Virsraksts 1',
        heading2: 'Virsraksts 2',
        heading3: 'Virsraksts 3',
        code: 'Kods',
        quote: 'Citāts',
        unorderedList: 'Aizzīmju saraksts',
        orderedList: 'Numurēts saraksts',
        cleanBlock: 'Notīrīt bloka formatējumu',
        link: 'Saite',
        image: 'Attēls',
        table: 'Tabula',
        horizontalRule: 'Ievietot horizontālu līniju',
        preview: 'Priekšskatījums',
        sideBySide: 'Blakus skats',
        fullscreen: 'Pilnekrāna režīms'
    },

    // Custom select messages
    customselect: {
        noResults: 'Sakritību nav',
        searching: 'Meklēšana…',
        loadingMore: 'Datu ielāde…',
        errorLoading: 'Neizdevās ielādēt rezultātus.',
        inputTooShort: {
            zero: 'Lūdzu ievadiet vēl :count simbolus',
            one: 'Lūdzu ievadiet vēl :count simbolu',
            other: 'Lūdzu ievadiet vēl :count simbolus'
        },
        maximumSelected: {
            zero: 'Jūs varat izvēlēties ne vairāk kā :count elementus',
            one: 'Jūs varat izvēlēties ne vairāk kā :count elementu',
            other: 'Jūs varat izvēlēties ne vairāk kā :count elementus'
        },
        removeItem: 'Noņemt vienumu',
        removeAllItems: 'Noņemt visus vienumus'
    }
};

/*
 * RichArea translation: Latvian (lv)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['lv'] = {
    // Toolbar buttons
    toolbar: 'Redaktora rīkjosla',
    fullscreen: 'Pilnekrāna režīms',
    bold: 'Treknraksts',
    italic: 'Slīpraksts',
    underline: 'Pasvītrojums',
    strikeThrough: 'Pārsvītrojums',
    subscript: 'Apakšraksts',
    superscript: 'Augšraksts',
    fontFamily: 'Fonts',
    fontSize: 'Fonta izmērs',
    color: 'Krāsas',
    emoticons: 'Emocijzīmes',
    inlineStyle: 'Teksta stils',
    paragraphStyle: 'Rindkopas stils',
    paragraphFormat: 'Rindkopas formāts',
    align: 'Līdzināt',
    formatOL: 'Numurēts saraksts',
    formatUL: 'Aizzīmju saraksts',
    outdent: 'Samazināt atkāpi',
    indent: 'Palielināt atkāpi',
    quote: 'Citāts',
    insertHR: 'Ievietot horizontālu līniju',
    insertLink: 'Ievietot saiti',
    insertPageLink: 'Ievietot saiti',
    insertImage: 'Ievietot attēlu',
    insertVideo: 'Ievietot video',
    insertAudio: 'Ievietot audio',
    insertFile: 'Ievietot failu',
    insertTable: 'Ievietot tabulu',
    insertSnippet: 'Ievietot fragmentu',
    undo: 'Atsaukt',
    redo: 'Atcelt atsaukšanu',
    clearFormatting: 'Notīrīt formatējumu',
    selectAll: 'Atlasīt visu',
    html: 'Koda skats',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Normāls',
    formatHeading1: 'Virsraksts 1',
    formatHeading2: 'Virsraksts 2',
    formatHeading3: 'Virsraksts 3',
    formatHeading4: 'Virsraksts 4',
    formatHeading5: 'Virsraksts 5',
    formatHeading6: 'Virsraksts 6',
    formatCode: 'Kods',

    // Alignment
    alignLeft: 'Līdzināt pa kreisi',
    alignCenter: 'Centrēt',
    alignRight: 'Līdzināt pa labi',
    alignJustify: 'Taisnot',

    // Colors
    textColor: 'Teksts',
    backgroundColor: 'Fons',
    removeColor: 'Noņemt krāsu',
    defaultFont: 'Noklusējums',

    // Insert menus
    uploadFromComputer: 'Augšupielādēt no datora',
    browse: 'Pārlūkot',
    byUrl: 'No URL',
    embeddingCode: 'Iegulšanas kods',

    // Popover forms
    url: 'URL',
    text: 'Teksts',
    openInNewTab: 'Atvērt jaunā cilnē',
    linkStyle: 'Stils',
    none: 'Nav',
    insert: 'Ievietot',
    update: 'Atjaunināt',
    cancel: 'Atcelt',
    remove: 'Noņemt',
    browsePages: 'Pārlūkot lapas',
    alternativeText: 'Alternatīvais teksts',
    width: 'Platums',
    widthPlaceholder: '300 vai 50%',
    widthInvalid: 'Ievadiet platumu pikseļos vai procentos',
    urlRequired: 'Lūdzu, ievadiet URL',
    urlInvalid: 'Lūdzu, ievadiet derīgu URL',
    embeddingCodeRequired: 'Lūdzu, ievadiet iegulšanas kodu',
    embeddingCodeInvalid: 'Iegulšanas kodā jābūt iframe',

    // Contextual toolbars
    openLink: 'Atvērt saiti',
    editLink: 'Rediģēt saiti',
    unlink: 'Noņemt saiti',
    imageAlign: 'Līdzināt',
    imageAlignNone: 'Rindā ar tekstu',
    imageAlignLeft: 'Peldošs pa kreisi',
    imageAlignCenter: 'Centrēt',
    imageAlignRight: 'Peldošs pa labi',
    imageStyle: 'Attēla stils',
    imageAlt: 'Alternatīvais teksts',
    imageSize: 'Mainīt izmēru',
    imageReplace: 'Aizvietot',
    imageRemove: 'Noņemt attēlu',
    imageLink: 'Ievietot saiti',
    tableHeader: 'Tabulas galvene',
    tableRows: 'Rinda',
    tableRowAbove: 'Ievietot rindu virs šīs',
    tableRowBelow: 'Ievietot rindu zem šīs',
    tableRowDelete: 'Dzēst rindu',
    tableColumns: 'Kolonna',
    tableColumnBefore: 'Ievietot kolonnu pirms šīs',
    tableColumnAfter: 'Ievietot kolonnu aiz šīs',
    tableColumnDelete: 'Dzēst kolonnu',
    tableCells: 'Šūna',
    tableCellsMerge: 'Sapludināt šūnas',
    tableCellsSplit: 'Sadalīt šūnu',
    tableStyle: 'Tabulas stils',
    tableCellStyle: 'Šūnas stils',
    tableRemove: 'Noņemt tabulu',
    snippet: 'Fragments',
    snippetProperties: 'Rekvizīti',
    snippetRemove: 'Noņemt fragmentu',
    mediaRemove: 'Noņemt',

    // Messages
    uploadFailed: 'Failu neizdevās augšupielādēt',
    invalidFileEmptyInsert: 'Lūdzu, izvēlieties ievietojamo failu.',
    invalidFileSingleInsert: 'Lūdzu, izvēlieties vienu failu.',
    invalidImageEmptyInsert: 'Lūdzu, izvēlieties ievietojamo attēlu.',
    invalidImageInvalidInsert: 'Izvēlētais fails nav attēls.',
    invalidVideoInvalidInsert: 'Izvēlētais fails nav video.',
    invalidAudioInvalidInsert: 'Izvēlētais fails nav audio fails.'
};

/*
 * Hotsheet translation: Latvian (lv)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['lv'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Nav datu',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Ievietot rindu virs šīs',
    insertRowBelow: 'Ievietot rindu zem šīs',
    removeRow: 'Dzēst rindu',
    undo: 'Atsaukt',
    redo: 'Atcelt atsaukšanu',
    freezeColumn: 'Iesaldēt kolonnu',
    unfreezeColumn: 'Atsaldēt kolonnu',

    // A cell whose value its column does not accept
    invalidValue: 'Vērtība nav derīga.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Izvēlēties datumu',
    chooseTime: 'Izvēlēties laiku'
};
