/*
 * Translations for pt-pt, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: European Portuguese (pt-pt)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['pt-pt'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'O valor não pode estar vazio.',
        ruleInteger: 'O valor tem de ser um número inteiro.',
        rulePositiveInteger: 'O valor tem de ser um número inteiro positivo.',
        ruleFloat: 'O valor tem de ser um número decimal.',
        rulePositiveFloat: 'O valor tem de ser um número decimal positivo.',
        ruleMin: 'O valor não pode ser inferior a :min.',
        ruleMax: 'O valor não pode ser superior a :max.',
        ruleMinLength: 'O número de carateres não pode ser inferior a :min.',
        ruleMaxLength: 'O número de carateres não pode ser superior a :max.',
        ruleRegex: 'O formato do valor não é válido.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Negrito',
        italic: 'Itálico',
        strikethrough: 'Rasurado',
        heading1: 'Título 1',
        heading2: 'Título 2',
        heading3: 'Título 3',
        code: 'Código',
        quote: 'Citação',
        unorderedList: 'Lista não ordenada',
        orderedList: 'Lista ordenada',
        cleanBlock: 'Limpar formatação do bloco',
        link: 'Ligação',
        image: 'Imagem',
        table: 'Tabela',
        horizontalRule: 'Inserir linha horizontal',
        preview: 'Pré-visualizar',
        sideBySide: 'Lado a lado',
        fullscreen: 'Ecrã inteiro'
    }
};

/*
 * RichArea translation: European Portuguese (pt-pt)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['pt-pt'] = {
    // Toolbar buttons
    toolbar: 'Barra de ferramentas do editor',
    fullscreen: 'Ecrã inteiro',
    bold: 'Negrito',
    italic: 'Itálico',
    underline: 'Sublinhado',
    strikeThrough: 'Rasurado',
    subscript: 'Inferior à linha',
    superscript: 'Superior à linha',
    fontFamily: 'Tipo de letra',
    fontSize: 'Tamanho do tipo de letra',
    color: 'Cores',
    emoticons: 'Emoticons',
    inlineStyle: 'Estilo do texto',
    paragraphStyle: 'Estilo do parágrafo',
    paragraphFormat: 'Formato do parágrafo',
    align: 'Alinhar',
    formatOL: 'Lista ordenada',
    formatUL: 'Lista não ordenada',
    outdent: 'Diminuir avanço',
    indent: 'Aumentar avanço',
    quote: 'Citação',
    insertHR: 'Inserir linha horizontal',
    insertLink: 'Inserir ligação',
    insertPageLink: 'Inserir ligação',
    insertImage: 'Inserir imagem',
    insertVideo: 'Inserir vídeo',
    insertAudio: 'Inserir áudio',
    insertFile: 'Inserir ficheiro',
    insertTable: 'Inserir tabela',
    insertSnippet: 'Inserir fragmento',
    undo: 'Anular',
    redo: 'Refazer',
    clearFormatting: 'Limpar formatação',
    selectAll: 'Selecionar tudo',
    html: 'Ver código',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: 'Normal',
    formatHeading1: 'Título 1',
    formatHeading2: 'Título 2',
    formatHeading3: 'Título 3',
    formatHeading4: 'Título 4',
    formatHeading5: 'Título 5',
    formatHeading6: 'Título 6',
    formatCode: 'Código',

    // Alignment
    alignLeft: 'Alinhar à esquerda',
    alignCenter: 'Centrar',
    alignRight: 'Alinhar à direita',
    alignJustify: 'Justificar',

    // Colors
    textColor: 'Texto',
    backgroundColor: 'Fundo',
    removeColor: 'Remover cor',
    defaultFont: 'Predefinido',

    // Insert menus
    uploadFromComputer: 'Carregar a partir do computador',
    browse: 'Procurar',
    byUrl: 'Por URL',
    embeddingCode: 'Código de incorporação',

    // Popover forms
    url: 'URL',
    text: 'Texto',
    openInNewTab: 'Abrir num novo separador',
    linkStyle: 'Estilo',
    none: 'Nenhum',
    insert: 'Inserir',
    update: 'Atualizar',
    cancel: 'Cancelar',
    remove: 'Remover',
    browsePages: 'Procurar páginas',
    alternativeText: 'Texto alternativo',
    width: 'Largura',
    widthPlaceholder: '300 ou 50%',
    widthInvalid: 'Introduza uma largura em píxeis ou em percentagem',
    urlRequired: 'Por favor, introduza um URL',
    urlInvalid: 'Por favor, introduza um URL válido',
    embeddingCodeRequired: 'Por favor, introduza o código de incorporação',
    embeddingCodeInvalid: 'O código de incorporação tem de conter um iframe',

    // Contextual toolbars
    openLink: 'Abrir ligação',
    editLink: 'Editar ligação',
    unlink: 'Remover ligação',
    imageAlign: 'Alinhar',
    imageAlignNone: 'Em linha',
    imageAlignLeft: 'Flutuante à esquerda',
    imageAlignCenter: 'Centrado',
    imageAlignRight: 'Flutuante à direita',
    imageStyle: 'Estilo da imagem',
    imageAlt: 'Texto alternativo',
    imageSize: 'Alterar tamanho',
    imageReplace: 'Substituir',
    imageRemove: 'Remover imagem',
    imageLink: 'Inserir ligação',
    tableHeader: 'Cabeçalho da tabela',
    tableRows: 'Linha',
    tableRowAbove: 'Inserir linha acima',
    tableRowBelow: 'Inserir linha abaixo',
    tableRowDelete: 'Eliminar linha',
    tableColumns: 'Coluna',
    tableColumnBefore: 'Inserir coluna antes',
    tableColumnAfter: 'Inserir coluna depois',
    tableColumnDelete: 'Eliminar coluna',
    tableCells: 'Célula',
    tableCellsMerge: 'Unir células',
    tableCellsSplit: 'Dividir célula',
    tableStyle: 'Estilo da tabela',
    tableCellStyle: 'Estilo da célula',
    tableRemove: 'Remover tabela',
    snippet: 'Fragmento',
    snippetProperties: 'Propriedades',
    snippetRemove: 'Remover fragmento',
    mediaRemove: 'Remover',

    // Messages
    uploadFailed: 'Não foi possível carregar o ficheiro',
    invalidFileEmptyInsert: 'Por favor, selecione um ficheiro para inserir.',
    invalidFileSingleInsert: 'Por favor, selecione apenas um ficheiro.',
    invalidImageEmptyInsert: 'Por favor, selecione uma imagem para inserir.',
    invalidImageInvalidInsert: 'O ficheiro selecionado não é uma imagem.',
    invalidVideoInvalidInsert: 'O ficheiro selecionado não é um vídeo.',
    invalidAudioInvalidInsert: 'O ficheiro selecionado não é um ficheiro de áudio.'
};

/*
 * Hotsheet translation: European Portuguese (pt-pt)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['pt-pt'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Sem dados',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Inserir linha acima',
    insertRowBelow: 'Inserir linha abaixo',
    removeRow: 'Eliminar linha',
    undo: 'Anular',
    redo: 'Refazer',
    freezeColumn: 'Fixar coluna',
    unfreezeColumn: 'Libertar coluna',

    // A cell whose value its column does not accept
    invalidValue: 'O valor não é válido.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Escolher uma data',
    chooseTime: 'Escolher uma hora'
};

// Select2's own translation, kept for the custom-select control
(function (jQuery) {
/*! Select2 4.1.0 | https://github.com/select2/select2/blob/master/LICENSE.md */

!function(){if(jQuery&&jQuery.fn&&jQuery.fn.select2&&jQuery.fn.select2.amd)var e=jQuery.fn.select2.amd;e.define("select2/i18n/pt",[],function(){return{errorLoading:function(){return"Os resultados não puderam ser carregados."},inputTooLong:function(e){var r=e.input.length-e.maximum,n="Por favor apague "+r+" ";return n+=1!=r?"caracteres":"caractere"},inputTooShort:function(e){return"Introduza "+(e.minimum-e.input.length)+" ou mais caracteres"},loadingMore:function(){return"A carregar mais resultados…"},maximumSelected:function(e){var r="Apenas pode seleccionar "+e.maximum+" ";return r+=1!=e.maximum?"itens":"item"},noResults:function(){return"Sem resultados"},searching:function(){return"A procurar…"},removeAllItems:function(){return"Remover todos os itens"},removeItem:function(){return"Remover iten"},search:function(){return"Procurar"}}}),e.define,e.require}();
})({ fn: { select2: { amd: { define: function (name, deps, factory) {
    (globalThis.Select2Languages = globalThis.Select2Languages || {})['pt-pt'] = factory();
} } } } });
