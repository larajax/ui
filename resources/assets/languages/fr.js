/*
 * Translations for fr, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: French (fr)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['fr'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'La valeur ne doit pas être vide.',
        ruleInteger: 'La valeur doit être un nombre entier.',
        rulePositiveInteger: 'La valeur doit être un nombre entier positif.',
        ruleFloat: 'La valeur doit être un nombre décimal.',
        rulePositiveFloat: 'La valeur doit être un nombre décimal positif.',
        ruleMin: 'La valeur ne doit pas être inférieure à :min.',
        ruleMax: 'La valeur ne doit pas être supérieure à :max.',
        ruleMinLength: 'Le nombre de caractères ne doit pas être inférieur à :min.',
        ruleMaxLength: 'Le nombre de caractères ne doit pas être supérieur à :max.',
        ruleRegex: 'Le format de la valeur n\'est pas valide.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Gras',
        italic: 'Italique',
        strikethrough: 'Barré',
        heading1: 'Titre 1',
        heading2: 'Titre 2',
        heading3: 'Titre 3',
        code: 'Code',
        quote: 'Citation',
        unorderedList: 'Liste non ordonnée',
        orderedList: 'Liste ordonnée',
        cleanBlock: 'Effacer la mise en forme du bloc',
        link: 'Lien',
        image: 'Image',
        table: 'Tableau',
        horizontalRule: 'Insérer une ligne horizontale',
        preview: 'Aperçu',
        sideBySide: 'Côte à côte',
        fullscreen: 'Plein écran'
    }
};

/*
 * RichArea translation: French (fr)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['fr'] = {
    // Toolbar buttons
    toolbar: 'Barre d\'outils de l\'éditeur',
    fullscreen: 'Plein écran',
    bold: 'Gras',
    italic: 'Italique',
    underline: 'Souligné',
    strikeThrough: 'Barré',
    subscript: 'Indice',
    superscript: 'Exposant',
    fontFamily: 'Police',
    fontSize: 'Taille de la police',
    color: 'Couleurs',
    emoticons: 'Émoticônes',
    inlineStyle: 'Style du texte',
    paragraphStyle: 'Style de paragraphe',
    paragraphFormat: 'Format de paragraphe',
    align: 'Aligner',
    formatOL: 'Liste ordonnée',
    formatUL: 'Liste non ordonnée',
    outdent: 'Diminuer le retrait',
    indent: 'Augmenter le retrait',
    quote: 'Citation',
    insertHR: 'Insérer une ligne horizontale',
    insertLink: 'Insérer un lien',
    insertPageLink: 'Insérer un lien',
    insertImage: 'Insérer une image',
    insertVideo: 'Insérer une vidéo',
    insertAudio: 'Insérer un fichier audio',
    insertFile: 'Insérer un fichier',
    insertTable: 'Insérer un tableau',
    insertSnippet: 'Insérer un fragment',
    undo: 'Annuler',
    redo: 'Rétablir',
    clearFormatting: 'Effacer la mise en forme',
    selectAll: 'Tout sélectionner',
    html: 'Affichage du code',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Maj',

    // Paragraph formats
    formatNormal: 'Normal',
    formatHeading1: 'Titre 1',
    formatHeading2: 'Titre 2',
    formatHeading3: 'Titre 3',
    formatHeading4: 'Titre 4',
    formatHeading5: 'Titre 5',
    formatHeading6: 'Titre 6',
    formatCode: 'Code',

    // Alignment
    alignLeft: 'Aligner à gauche',
    alignCenter: 'Centrer',
    alignRight: 'Aligner à droite',
    alignJustify: 'Justifier',

    // Colors
    textColor: 'Texte',
    backgroundColor: 'Arrière-plan',
    removeColor: 'Supprimer la couleur',
    defaultFont: 'Par défaut',

    // Insert menus
    uploadFromComputer: 'Ajouter depuis l\'ordinateur',
    browse: 'Parcourir',
    byUrl: 'Par URL',
    embeddingCode: 'Code d\'intégration',

    // Popover forms
    url: 'URL',
    text: 'Texte',
    openInNewTab: 'Ouvrir dans un nouvel onglet',
    linkStyle: 'Style',
    none: 'Aucun',
    insert: 'Insérer',
    update: 'Mettre à jour',
    cancel: 'Annuler',
    remove: 'Supprimer',
    browsePages: 'Parcourir les pages',
    alternativeText: 'Texte alternatif',
    width: 'Largeur',
    widthPlaceholder: '300 ou 50%',
    widthInvalid: 'Saisissez une largeur en pixels ou en pourcentage',
    urlRequired: 'Veuillez saisir une URL',
    urlInvalid: 'Veuillez saisir une URL valide',
    embeddingCodeRequired: 'Veuillez saisir le code d\'intégration',
    embeddingCodeInvalid: 'Le code d\'intégration doit contenir une iframe',

    // Contextual toolbars
    openLink: 'Ouvrir le lien',
    editLink: 'Modifier le lien',
    unlink: 'Supprimer le lien',
    imageAlign: 'Aligner',
    imageAlignNone: 'Dans le texte',
    imageAlignLeft: 'Flottant à gauche',
    imageAlignCenter: 'Centré',
    imageAlignRight: 'Flottant à droite',
    imageStyle: 'Style de l\'image',
    imageAlt: 'Texte alternatif',
    imageSize: 'Modifier la taille',
    imageReplace: 'Remplacer',
    imageRemove: 'Supprimer l\'image',
    imageLink: 'Insérer un lien',
    tableHeader: 'En-tête du tableau',
    tableRows: 'Ligne',
    tableRowAbove: 'Insérer une ligne au-dessus',
    tableRowBelow: 'Insérer une ligne en dessous',
    tableRowDelete: 'Supprimer la ligne',
    tableColumns: 'Colonne',
    tableColumnBefore: 'Insérer une colonne avant',
    tableColumnAfter: 'Insérer une colonne après',
    tableColumnDelete: 'Supprimer la colonne',
    tableCells: 'Cellule',
    tableCellsMerge: 'Fusionner les cellules',
    tableCellsSplit: 'Fractionner la cellule',
    tableStyle: 'Style du tableau',
    tableCellStyle: 'Style de cellule',
    tableRemove: 'Supprimer le tableau',
    snippet: 'Fragment',
    snippetProperties: 'Propriétés',
    snippetRemove: 'Supprimer le fragment',
    mediaRemove: 'Supprimer',

    // Messages
    uploadFailed: 'Le fichier n\'a pas pu être envoyé',
    invalidFileEmptyInsert: 'Veuillez sélectionner un fichier à insérer.',
    invalidFileSingleInsert: 'Veuillez sélectionner un seul fichier.',
    invalidImageEmptyInsert: 'Veuillez sélectionner une image à insérer.',
    invalidImageInvalidInsert: 'Le fichier sélectionné n\'est pas une image.',
    invalidVideoInvalidInsert: 'Le fichier sélectionné n\'est pas une vidéo.',
    invalidAudioInvalidInsert: 'Le fichier sélectionné n\'est pas un fichier audio.'
};

/*
 * Hotsheet translation: French (fr)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['fr'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Aucune donnée',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Insérer une ligne au-dessus',
    insertRowBelow: 'Insérer une ligne en dessous',
    removeRow: 'Supprimer la ligne',
    undo: 'Annuler',
    redo: 'Rétablir',
    freezeColumn: 'Figer la colonne',
    unfreezeColumn: 'Libérer la colonne',

    // A cell whose value its column does not accept
    invalidValue: 'La valeur n\'est pas valide.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Choisir une date',
    chooseTime: 'Choisir une heure'
};

// Select2's own translation, kept for the custom-select control
(function (jQuery) {
/*! Select2 4.1.0 | https://github.com/select2/select2/blob/master/LICENSE.md */

!function(){if(jQuery&&jQuery.fn&&jQuery.fn.select2&&jQuery.fn.select2.amd)var e=jQuery.fn.select2.amd;e.define("select2/i18n/fr",[],function(){return{errorLoading:function(){return"Les résultats ne peuvent pas être chargés."},inputTooLong:function(e){var n=e.input.length-e.maximum;return"Supprimez "+n+" caractère"+(n>1?"s":"")},inputTooShort:function(e){var n=e.minimum-e.input.length;return"Saisissez au moins "+n+" caractère"+(n>1?"s":"")},loadingMore:function(){return"Chargement de résultats supplémentaires…"},maximumSelected:function(e){return"Vous pouvez seulement sélectionner "+e.maximum+" élément"+(e.maximum>1?"s":"")},noResults:function(){return"Aucun résultat trouvé"},searching:function(){return"Recherche en cours…"},removeAllItems:function(){return"Supprimer tous les éléments"},removeItem:function(){return"Supprimer l'élément"},search:function(){return"Rechercher"}}}),e.define,e.require}();
})({ fn: { select2: { amd: { define: function (name, deps, factory) {
    (globalThis.Select2Languages = globalThis.Select2Languages || {})['fr'] = factory();
} } } } });
