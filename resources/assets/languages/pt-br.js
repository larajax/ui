/*
 * Translations for pt-br, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Brazilian Portuguese (pt-br)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['pt-br'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'O valor não deve estar vazio.',
        ruleInteger: 'O valor deve ser um número inteiro.',
        rulePositiveInteger: 'O valor deve ser um número inteiro positivo.',
        ruleFloat: 'O valor deve ser um número decimal.',
        rulePositiveFloat: 'O valor deve ser um número decimal positivo.',
        ruleMin: 'O valor não deve ser menor que :min.',
        ruleMax: 'O valor não deve ser maior que :max.',
        ruleMinLength: 'O número de caracteres não deve ser menor que :min.',
        ruleMaxLength: 'O número de caracteres não deve ser maior que :max.',
        ruleRegex: 'O formato do valor não é válido.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Negrito',
        italic: 'Itálico',
        strikethrough: 'Tachado',
        heading1: 'Título 1',
        heading2: 'Título 2',
        heading3: 'Título 3',
        code: 'Código',
        quote: 'Citação',
        unorderedList: 'Lista não ordenada',
        orderedList: 'Lista ordenada',
        cleanBlock: 'Limpar formatação do bloco',
        link: 'Link',
        image: 'Imagem',
        table: 'Tabela',
        horizontalRule: 'Inserir linha horizontal',
        preview: 'Visualizar',
        sideBySide: 'Lado a lado',
        fullscreen: 'Tela cheia'
    },

    // Custom select messages
    customselect: {
        noResults: 'Nenhum resultado encontrado',
        searching: 'Buscando…',
        loadingMore: 'Carregando mais resultados…',
        errorLoading: 'Os resultados não puderam ser carregados.',
        inputTooShort: 'Digite :count ou mais caracteres',
        maximumSelected: 'Você só pode selecionar :count itens',
        removeItem: 'Remover item',
        removeAllItems: 'Remover todos os itens'
    }
};

/*
 * RichArea translation: Brazilian Portuguese (pt-br)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['pt-br'] = {
    // Toolbar buttons
    toolbar: 'Barra de ferramentas do editor',
    fullscreen: 'Tela cheia',
    bold: 'Negrito',
    italic: 'Itálico',
    underline: 'Sublinhado',
    strikeThrough: 'Tachado',
    subscript: 'Subscrito',
    superscript: 'Sobrescrito',
    fontFamily: 'Fonte',
    fontSize: 'Tamanho da fonte',
    color: 'Cores',
    emoticons: 'Emoticons',
    inlineStyle: 'Estilo do texto',
    paragraphStyle: 'Estilo do parágrafo',
    paragraphFormat: 'Formato do parágrafo',
    align: 'Alinhar',
    formatOL: 'Lista ordenada',
    formatUL: 'Lista não ordenada',
    outdent: 'Diminuir recuo',
    indent: 'Aumentar recuo',
    quote: 'Citação',
    insertHR: 'Inserir linha horizontal',
    insertLink: 'Inserir link',
    insertPageLink: 'Inserir link',
    insertImage: 'Inserir imagem',
    insertVideo: 'Inserir vídeo',
    insertAudio: 'Inserir áudio',
    insertFile: 'Inserir arquivo',
    insertTable: 'Inserir tabela',
    insertSnippet: 'Inserir fragmento',
    undo: 'Desfazer',
    redo: 'Refazer',
    clearFormatting: 'Limpar formatação',
    selectAll: 'Selecionar tudo',
    html: 'Visualizar código',

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
    alignCenter: 'Centralizar',
    alignRight: 'Alinhar à direita',
    alignJustify: 'Justificar',

    // Colors
    textColor: 'Texto',
    backgroundColor: 'Fundo',
    removeColor: 'Remover cor',
    defaultFont: 'Padrão',

    // Insert menus
    uploadFromComputer: 'Carregar do computador',
    browse: 'Procurar',
    byUrl: 'Por URL',
    embeddingCode: 'Código de incorporação',

    // Popover forms
    url: 'URL',
    text: 'Texto',
    openInNewTab: 'Abrir em nova aba',
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
    widthInvalid: 'Informe uma largura em pixels ou em porcentagem',
    urlRequired: 'Por favor, insira uma URL',
    urlInvalid: 'Por favor, insira uma URL válida',
    embeddingCodeRequired: 'Por favor, insira o código de incorporação',
    embeddingCodeInvalid: 'O código de incorporação deve conter um iframe',

    // Contextual toolbars
    openLink: 'Abrir link',
    editLink: 'Editar link',
    unlink: 'Remover link',
    imageAlign: 'Alinhar',
    imageAlignNone: 'Em linha',
    imageAlignLeft: 'Flutuante à esquerda',
    imageAlignCenter: 'Centralizado',
    imageAlignRight: 'Flutuante à direita',
    imageStyle: 'Estilo da imagem',
    imageAlt: 'Texto alternativo',
    imageSize: 'Alterar tamanho',
    imageReplace: 'Substituir',
    imageRemove: 'Remover imagem',
    imageLink: 'Inserir link',
    tableHeader: 'Cabeçalho da tabela',
    tableRows: 'Linha',
    tableRowAbove: 'Inserir linha acima',
    tableRowBelow: 'Inserir linha abaixo',
    tableRowDelete: 'Excluir linha',
    tableColumns: 'Coluna',
    tableColumnBefore: 'Inserir coluna antes',
    tableColumnAfter: 'Inserir coluna depois',
    tableColumnDelete: 'Excluir coluna',
    tableCells: 'Célula',
    tableCellsMerge: 'Mesclar células',
    tableCellsSplit: 'Dividir célula',
    tableStyle: 'Estilo da tabela',
    tableCellStyle: 'Estilo da célula',
    tableRemove: 'Remover tabela',
    snippet: 'Fragmento',
    snippetProperties: 'Propriedades',
    snippetRemove: 'Remover fragmento',
    mediaRemove: 'Remover',

    // Messages
    uploadFailed: 'Não foi possível enviar o arquivo',
    invalidFileEmptyInsert: 'Por favor, selecione um arquivo para inserir.',
    invalidFileSingleInsert: 'Por favor, selecione apenas um arquivo.',
    invalidImageEmptyInsert: 'Por favor, selecione uma imagem para inserir.',
    invalidImageInvalidInsert: 'O arquivo selecionado não é uma imagem.',
    invalidVideoInvalidInsert: 'O arquivo selecionado não é um vídeo.',
    invalidAudioInvalidInsert: 'O arquivo selecionado não é um arquivo de áudio.'
};

/*
 * Hotsheet translation: Brazilian Portuguese (pt-br)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['pt-br'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Nenhum dado',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Inserir linha acima',
    insertRowBelow: 'Inserir linha abaixo',
    removeRow: 'Excluir linha',
    undo: 'Desfazer',
    redo: 'Refazer',
    freezeColumn: 'Congelar coluna',
    unfreezeColumn: 'Descongelar coluna',

    // A cell whose value its column does not accept
    invalidValue: 'O valor não é válido.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Escolher uma data',
    chooseTime: 'Escolher um horário'
};
