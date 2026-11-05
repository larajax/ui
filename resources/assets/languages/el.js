/*
 * Translations for el, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Greek (el)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['el'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Η τιμή δεν πρέπει να είναι κενή.',
        ruleInteger: 'Η τιμή πρέπει να είναι ακέραιος αριθμός.',
        rulePositiveInteger: 'Η τιμή πρέπει να είναι θετικός ακέραιος αριθμός.',
        ruleFloat: 'Η τιμή πρέπει να είναι δεκαδικός αριθμός.',
        rulePositiveFloat: 'Η τιμή πρέπει να είναι θετικός δεκαδικός αριθμός.',
        ruleMin: 'Η τιμή δεν πρέπει να είναι μικρότερη από :min.',
        ruleMax: 'Η τιμή δεν πρέπει να είναι μεγαλύτερη από :max.',
        ruleMinLength: 'Το κείμενο δεν πρέπει να έχει λιγότερους από :min χαρακτήρες.',
        ruleMaxLength: 'Το κείμενο δεν πρέπει να έχει περισσότερους από :max χαρακτήρες.',
        ruleRegex: 'Μη έγκυρη μορφή τιμής.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Έντονα',
        italic: 'Πλάγια',
        strikethrough: 'Διακριτή διαγραφή',
        heading1: 'Επικεφαλίδα 1',
        heading2: 'Επικεφαλίδα 2',
        heading3: 'Επικεφαλίδα 3',
        code: 'Κώδικας',
        quote: 'Παράθεση',
        unorderedList: 'Μη ταξινομημένη λίστα',
        orderedList: 'Ταξινομημένη λίστα',
        cleanBlock: 'Απαλοιφή μορφής παραγράφου',
        link: 'Σύνδεσμος',
        image: 'Εικόνα',
        table: 'Πίνακας',
        horizontalRule: 'Εισαγωγή οριζόντιας γραμμής',
        preview: 'Προεπισκόπηση',
        sideBySide: 'Παράλληλη προβολή',
        fullscreen: 'Πλήρης οθόνη'
    }
};

/*
 * RichArea translation: Greek (el)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['el'] = {
    // Toolbar buttons
    toolbar: 'Γραμμή εργαλείων επεξεργαστή',
    fullscreen: 'Πλήρης οθόνη',
    bold: 'Έντονα',
    italic: 'Πλάγια',
    underline: 'Υπογράμμιση',
    strikeThrough: 'Διακριτή διαγραφή',
    subscript: 'Δείκτης',
    superscript: 'Εκθέτης',
    fontFamily: 'Γραμματοσειρά',
    fontSize: 'Μέγεθος γραμματοσειράς',
    color: 'Χρώματα',
    emoticons: 'Φατσούλες',
    inlineStyle: 'Στυλ κειμένου',
    paragraphStyle: 'Στυλ παραγράφου',
    paragraphFormat: 'Μορφή παραγράφου',
    align: 'Στοίχιση',
    formatOL: 'Ταξινομημένη λίστα',
    formatUL: 'Μη ταξινομημένη λίστα',
    outdent: 'Μείωση εσοχής',
    indent: 'Αύξηση εσοχής',
    quote: 'Παράθεση',
    insertHR: 'Εισαγωγή οριζόντιας γραμμής',
    insertLink: 'Εισαγωγή συνδέσμου',
    insertPageLink: 'Εισαγωγή συνδέσμου',
    insertImage: 'Εισαγωγή εικόνας',
    insertVideo: 'Εισαγωγή βίντεο',
    insertAudio: 'Εισαγωγή ήχου',
    insertFile: 'Εισαγωγή αρχείου',
    insertTable: 'Εισαγωγή πίνακα',
    insertSnippet: 'Εισαγωγή αποσπάσματος',
    undo: 'Αναίρεση',
    redo: 'Επανάληψη',
    clearFormatting: 'Απαλοιφή μορφοποίησης',
    selectAll: 'Επιλογή όλων',
    html: 'Προβολή κώδικα',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Κανονικό',
    formatHeading1: 'Επικεφαλίδα 1',
    formatHeading2: 'Επικεφαλίδα 2',
    formatHeading3: 'Επικεφαλίδα 3',
    formatHeading4: 'Επικεφαλίδα 4',
    formatHeading5: 'Επικεφαλίδα 5',
    formatHeading6: 'Επικεφαλίδα 6',
    formatCode: 'Κώδικας',

    // Alignment
    alignLeft: 'Στοίχιση αριστερά',
    alignCenter: 'Στοίχιση στο κέντρο',
    alignRight: 'Στοίχιση δεξιά',
    alignJustify: 'Πλήρης στοίχιση',

    // Colors
    textColor: 'Κείμενο',
    backgroundColor: 'Φόντο',
    removeColor: 'Αφαίρεση χρώματος',
    defaultFont: 'Προκαθορισμένο',

    // Insert menus
    uploadFromComputer: 'Ανέβασμα από τον υπολογιστή',
    browse: 'Περιήγηση',
    byUrl: 'Μέσω URL',
    embeddingCode: 'Κώδικας ενσωμάτωσης',

    // Popover forms
    url: 'URL',
    text: 'Κείμενο',
    openInNewTab: 'Άνοιγμα σε νέα καρτέλα',
    linkStyle: 'Στυλ',
    none: 'Κανένα',
    insert: 'Εισαγωγή',
    update: 'Ενημέρωση',
    cancel: 'Ακύρωση',
    remove: 'Αφαίρεση',
    browsePages: 'Περιήγηση σελίδων',
    alternativeText: 'Εναλλακτικό κείμενο',
    width: 'Πλάτος',
    widthPlaceholder: '300 ή 50%',
    widthInvalid: 'Εισαγάγετε πλάτος σε pixel ή ποσοστό',
    urlRequired: 'Παρακαλούμε εισαγάγετε ένα URL',
    urlInvalid: 'Παρακαλούμε εισαγάγετε ένα έγκυρο URL',
    embeddingCodeRequired: 'Παρακαλούμε εισαγάγετε τον κώδικα ενσωμάτωσης',
    embeddingCodeInvalid: 'Ο κώδικας ενσωμάτωσης πρέπει να περιέχει ένα iframe',

    // Contextual toolbars
    openLink: 'Άνοιγμα συνδέσμου',
    editLink: 'Επεξεργασία συνδέσμου',
    unlink: 'Κατάργηση συνδέσμου',
    imageAlign: 'Στοίχιση',
    imageAlignNone: 'Εντός γραμμής',
    imageAlignLeft: 'Αιώρηση αριστερά',
    imageAlignCenter: 'Στο κέντρο',
    imageAlignRight: 'Αιώρηση δεξιά',
    imageStyle: 'Στυλ εικόνας',
    imageAlt: 'Εναλλακτικό κείμενο',
    imageSize: 'Αλλαγή μεγέθους',
    imageReplace: 'Αντικατάσταση',
    imageRemove: 'Αφαίρεση εικόνας',
    imageLink: 'Εισαγωγή συνδέσμου',
    tableHeader: 'Κεφαλίδα πίνακα',
    tableRows: 'Γραμμή',
    tableRowAbove: 'Εισαγωγή γραμμής από πάνω',
    tableRowBelow: 'Εισαγωγή γραμμής από κάτω',
    tableRowDelete: 'Διαγραφή γραμμής',
    tableColumns: 'Στήλη',
    tableColumnBefore: 'Εισαγωγή στήλης πριν',
    tableColumnAfter: 'Εισαγωγή στήλης μετά',
    tableColumnDelete: 'Διαγραφή στήλης',
    tableCells: 'Κελί',
    tableCellsMerge: 'Συγχώνευση κελιών',
    tableCellsSplit: 'Διαίρεση κελιού',
    tableStyle: 'Στυλ πίνακα',
    tableCellStyle: 'Στυλ κελιού',
    tableRemove: 'Αφαίρεση πίνακα',
    snippet: 'Απόσπασμα',
    snippetProperties: 'Ιδιότητες',
    snippetRemove: 'Αφαίρεση αποσπάσματος',
    mediaRemove: 'Αφαίρεση',

    // Messages
    uploadFailed: 'Δεν ήταν δυνατό το ανέβασμα του αρχείου',
    invalidFileEmptyInsert: 'Παρακαλούμε επιλέξτε ένα αρχείο για εισαγωγή.',
    invalidFileSingleInsert: 'Παρακαλούμε επιλέξτε ένα μόνο αρχείο.',
    invalidImageEmptyInsert: 'Παρακαλούμε επιλέξτε μια εικόνα για εισαγωγή.',
    invalidImageInvalidInsert: 'Το επιλεγμένο αρχείο δεν είναι εικόνα.',
    invalidVideoInvalidInsert: 'Το επιλεγμένο αρχείο δεν είναι βίντεο.',
    invalidAudioInvalidInsert: 'Το επιλεγμένο αρχείο δεν είναι αρχείο ήχου.'
};

/*
 * Hotsheet translation: Greek (el)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['el'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Δεν υπάρχουν δεδομένα',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Εισαγωγή γραμμής από πάνω',
    insertRowBelow: 'Εισαγωγή γραμμής από κάτω',
    removeRow: 'Αφαίρεση γραμμής',
    undo: 'Αναίρεση',
    redo: 'Επανάληψη',
    freezeColumn: 'Σταθεροποίηση στήλης',
    unfreezeColumn: 'Αποδέσμευση στήλης',

    // A cell whose value its column does not accept
    invalidValue: 'Η τιμή δεν είναι έγκυρη.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Επιλογή ημερομηνίας',
    chooseTime: 'Επιλογή ώρας'
};
