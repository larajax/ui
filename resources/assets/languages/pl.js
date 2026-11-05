/*
 * Translations for pl, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Polish (pl)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['pl'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'Wartość nie może być pusta.',
        ruleInteger: 'Wartość musi być liczbą całkowitą.',
        rulePositiveInteger: 'Wartość musi być dodatnią liczbą całkowitą.',
        ruleFloat: 'Wartość musi być liczbą zmiennoprzecinkową.',
        rulePositiveFloat: 'Wartość musi być dodatnią liczbą zmiennoprzecinkową.',
        ruleMin: 'Wartość nie może być mniejsza niż :min.',
        ruleMax: 'Wartość nie może być większa niż :max.',
        ruleMinLength: 'Długość tekstu nie może być mniejsza niż :min.',
        ruleMaxLength: 'Długość tekstu nie może być większa niż :max.',
        ruleRegex: 'Nieprawidłowy format wartości.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Pogrubienie',
        italic: 'Kursywa',
        strikethrough: 'Przekreślenie',
        heading1: 'Nagłówek 1',
        heading2: 'Nagłówek 2',
        heading3: 'Nagłówek 3',
        code: 'Kod',
        quote: 'Cytat',
        unorderedList: 'Lista punktowana',
        orderedList: 'Lista numerowana',
        cleanBlock: 'Wyczyść formatowanie bloku',
        link: 'Link',
        image: 'Obraz',
        table: 'Tabela',
        horizontalRule: 'Wstaw linię poziomą',
        preview: 'Podgląd',
        sideBySide: 'Podgląd obok edytora',
        fullscreen: 'Pełny ekran'
    }
};

/*
 * RichArea translation: Polish (pl)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['pl'] = {
    // Toolbar buttons
    toolbar: 'Pasek narzędzi edytora',
    fullscreen: 'Pełny ekran',
    bold: 'Pogrubienie',
    italic: 'Kursywa',
    underline: 'Podkreślenie',
    strikeThrough: 'Przekreślenie',
    subscript: 'Indeks dolny',
    superscript: 'Indeks górny',
    fontFamily: 'Czcionka',
    fontSize: 'Wielkość czcionki',
    color: 'Kolory',
    emoticons: 'Emotikony',
    inlineStyle: 'Styl tekstu',
    paragraphStyle: 'Styl akapitu',
    paragraphFormat: 'Format akapitu',
    align: 'Wyrównanie',
    formatOL: 'Lista numerowana',
    formatUL: 'Lista punktowana',
    outdent: 'Zmniejsz wcięcie',
    indent: 'Zwiększ wcięcie',
    quote: 'Cytat',
    insertHR: 'Wstaw linię poziomą',
    insertLink: 'Wstaw link',
    insertPageLink: 'Wstaw link',
    insertImage: 'Wstaw obraz',
    insertVideo: 'Wstaw wideo',
    insertAudio: 'Wstaw audio',
    insertFile: 'Wstaw plik',
    insertTable: 'Wstaw tabelę',
    insertSnippet: 'Wstaw snippet',
    undo: 'Cofnij',
    redo: 'Ponów',
    clearFormatting: 'Wyczyść formatowanie',
    selectAll: 'Zaznacz wszystko',
    html: 'Widok kodu',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Normalny',
    formatHeading1: 'Nagłówek 1',
    formatHeading2: 'Nagłówek 2',
    formatHeading3: 'Nagłówek 3',
    formatHeading4: 'Nagłówek 4',
    formatHeading5: 'Nagłówek 5',
    formatHeading6: 'Nagłówek 6',
    formatCode: 'Kod',

    // Alignment
    alignLeft: 'Wyrównaj do lewej',
    alignCenter: 'Wyśrodkuj',
    alignRight: 'Wyrównaj do prawej',
    alignJustify: 'Wyjustuj',

    // Colors
    textColor: 'Tekst',
    backgroundColor: 'Tło',
    removeColor: 'Usuń kolor',
    defaultFont: 'Domyślny',

    // Insert menus
    uploadFromComputer: 'Prześlij z komputera',
    browse: 'Przeglądaj',
    byUrl: 'Z adresu URL',
    embeddingCode: 'Kod osadzania',

    // Popover forms
    url: 'URL',
    text: 'Tekst',
    openInNewTab: 'Otwórz w nowej karcie',
    linkStyle: 'Styl',
    none: 'Brak',
    insert: 'Wstaw',
    update: 'Aktualizuj',
    cancel: 'Anuluj',
    remove: 'Usuń',
    browsePages: 'Przeglądaj strony',
    alternativeText: 'Tekst alternatywny',
    width: 'Szerokość',
    widthPlaceholder: '300 lub 50%',
    widthInvalid: 'Podaj szerokość w pikselach lub procentach',
    urlRequired: 'Wprowadź adres URL',
    urlInvalid: 'Wprowadź prawidłowy adres URL',
    embeddingCodeRequired: 'Wprowadź kod osadzania',
    embeddingCodeInvalid: 'Kod osadzania musi zawierać iframe',

    // Contextual toolbars
    openLink: 'Otwórz link',
    editLink: 'Edytuj link',
    unlink: 'Usuń link',
    imageAlign: 'Wyrównanie',
    imageAlignNone: 'W linii',
    imageAlignLeft: 'Do lewej z opływaniem',
    imageAlignCenter: 'Wyśrodkuj',
    imageAlignRight: 'Do prawej z opływaniem',
    imageStyle: 'Styl obrazu',
    imageAlt: 'Tekst alternatywny',
    imageSize: 'Zmień rozmiar',
    imageReplace: 'Zastąp',
    imageRemove: 'Usuń obraz',
    imageLink: 'Wstaw link',
    tableHeader: 'Nagłówek tabeli',
    tableRows: 'Wiersz',
    tableRowAbove: 'Wstaw wiersz powyżej',
    tableRowBelow: 'Wstaw wiersz poniżej',
    tableRowDelete: 'Usuń wiersz',
    tableColumns: 'Kolumna',
    tableColumnBefore: 'Wstaw kolumnę z lewej',
    tableColumnAfter: 'Wstaw kolumnę z prawej',
    tableColumnDelete: 'Usuń kolumnę',
    tableCells: 'Komórka',
    tableCellsMerge: 'Scal komórki',
    tableCellsSplit: 'Podziel komórkę',
    tableStyle: 'Styl tabeli',
    tableCellStyle: 'Styl komórki',
    tableRemove: 'Usuń tabelę',
    snippet: 'Snippet',
    snippetProperties: 'Właściwości',
    snippetRemove: 'Usuń snippet',
    mediaRemove: 'Usuń',

    // Messages
    uploadFailed: 'Nie udało się przesłać pliku',
    invalidFileEmptyInsert: 'Wybierz plik do wstawienia.',
    invalidFileSingleInsert: 'Wybierz pojedynczy plik.',
    invalidImageEmptyInsert: 'Wybierz obraz do wstawienia.',
    invalidImageInvalidInsert: 'Wybrany plik nie jest obrazem.',
    invalidVideoInvalidInsert: 'Wybrany plik nie jest plikiem wideo.',
    invalidAudioInvalidInsert: 'Wybrany plik nie jest plikiem audio.'
};

/*
 * Hotsheet translation: Polish (pl)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['pl'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Brak danych',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Wstaw wiersz powyżej',
    insertRowBelow: 'Wstaw wiersz poniżej',
    removeRow: 'Usuń wiersz',
    undo: 'Cofnij',
    redo: 'Ponów',
    freezeColumn: 'Zablokuj kolumnę',
    unfreezeColumn: 'Odblokuj kolumnę',

    // A cell whose value its column does not accept
    invalidValue: 'Wartość jest nieprawidłowa.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Wybierz datę',
    chooseTime: 'Wybierz godzinę'
};

// Select2's own translation, kept for the custom-select control
(function (jQuery) {
/*! Select2 4.1.0 | https://github.com/select2/select2/blob/master/LICENSE.md */

!function(){if(jQuery&&jQuery.fn&&jQuery.fn.select2&&jQuery.fn.select2.amd)var n=jQuery.fn.select2.amd;n.define("select2/i18n/pl",[],function(){var n=["znak","znaki","znaków"],e=["element","elementy","elementów"],r=function(n,e){return 1===n?e[0]:n>1&&n<=4?e[1]:n>=5?e[2]:void 0};return{errorLoading:function(){return"Wystąpił błąd podczas ładowania wyników."},inputTooLong:function(e){var t=e.input.length-e.maximum;return"Usuń "+t+" "+r(t,n)},inputTooShort:function(e){var t=e.minimum-e.input.length;return"Wpisz co najmniej "+t+" "+r(t,n)},loadingMore:function(){return"Trwa ładowanie..."},maximumSelected:function(n){return"Możesz zaznaczyć maksymalnie "+n.maximum+" "+r(n.maximum,e)},noResults:function(){return"Brak wyników"},searching:function(){return"Trwa wyszukiwanie..."},removeAllItems:function(){return"Usuń wszystkie elementy"},removeItem:function(){return"Usuń element"},search:function(){return"Szukaj"}}}),n.define,n.require}();
})({ fn: { select2: { amd: { define: function (name, deps, factory) {
    (globalThis.Select2Languages = globalThis.Select2Languages || {})['pl'] = factory();
} } } } });
