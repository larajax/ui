/*
 * Translations for es, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Spanish (es)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['es'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: 'El valor no debe estar vacío.',
        ruleInteger: 'El valor debe ser un número entero.',
        rulePositiveInteger: 'El valor debe ser un número entero positivo.',
        ruleFloat: 'El valor debe ser un número decimal.',
        rulePositiveFloat: 'El valor debe ser un número decimal positivo.',
        ruleMin: 'El valor no debe ser menor que :min.',
        ruleMax: 'El valor no debe ser mayor que :max.',
        ruleMinLength: 'El número de caracteres no debe ser menor que :min.',
        ruleMaxLength: 'El número de caracteres no debe ser mayor que :max.',
        ruleRegex: 'El formato del valor no es válido.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: 'Negrita',
        italic: 'Cursiva',
        strikethrough: 'Tachado',
        heading1: 'Encabezado 1',
        heading2: 'Encabezado 2',
        heading3: 'Encabezado 3',
        code: 'Código',
        quote: 'Cita',
        unorderedList: 'Lista desordenada',
        orderedList: 'Lista ordenada',
        cleanBlock: 'Borrar formato del bloque',
        link: 'Enlace',
        image: 'Imagen',
        table: 'Tabla',
        horizontalRule: 'Insertar línea horizontal',
        preview: 'Vista previa',
        sideBySide: 'En paralelo',
        fullscreen: 'Pantalla completa'
    }
};

/*
 * RichArea translation: Spanish (es)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['es'] = {
    // Toolbar buttons
    toolbar: 'Barra de herramientas del editor',
    fullscreen: 'Pantalla completa',
    bold: 'Negrita',
    italic: 'Cursiva',
    underline: 'Subrayado',
    strikeThrough: 'Tachado',
    subscript: 'Subíndice',
    superscript: 'Superíndice',
    fontFamily: 'Tipo de letra',
    fontSize: 'Tamaño de la letra',
    color: 'Colores',
    emoticons: 'Emoticonos',
    inlineStyle: 'Estilo de texto',
    paragraphStyle: 'Estilo de párrafo',
    paragraphFormat: 'Formato de párrafo',
    align: 'Alinear',
    formatOL: 'Lista ordenada',
    formatUL: 'Lista desordenada',
    outdent: 'Reducir sangría',
    indent: 'Aumentar sangría',
    quote: 'Cita',
    insertHR: 'Insertar línea horizontal',
    insertLink: 'Insertar enlace',
    insertPageLink: 'Insertar enlace',
    insertImage: 'Insertar imagen',
    insertVideo: 'Insertar vídeo',
    insertAudio: 'Insertar audio',
    insertFile: 'Insertar archivo',
    insertTable: 'Insertar tabla',
    insertSnippet: 'Insertar fragmento',
    undo: 'Deshacer',
    redo: 'Rehacer',
    clearFormatting: 'Borrar formato',
    selectAll: 'Seleccionar todo',
    html: 'Vista de código',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Mayús',

    // Paragraph formats
    formatNormal: 'Normal',
    formatHeading1: 'Encabezado 1',
    formatHeading2: 'Encabezado 2',
    formatHeading3: 'Encabezado 3',
    formatHeading4: 'Encabezado 4',
    formatHeading5: 'Encabezado 5',
    formatHeading6: 'Encabezado 6',
    formatCode: 'Código',

    // Alignment
    alignLeft: 'Alinear a la izquierda',
    alignCenter: 'Centrar',
    alignRight: 'Alinear a la derecha',
    alignJustify: 'Justificar',

    // Colors
    textColor: 'Texto',
    backgroundColor: 'Fondo',
    removeColor: 'Quitar color',
    defaultFont: 'Predeterminado',

    // Insert menus
    uploadFromComputer: 'Subir desde el equipo',
    browse: 'Explorar',
    byUrl: 'Por URL',
    embeddingCode: 'Código de inserción',

    // Popover forms
    url: 'URL',
    text: 'Texto',
    openInNewTab: 'Abrir en una pestaña nueva',
    linkStyle: 'Estilo',
    none: 'Ninguno',
    insert: 'Insertar',
    update: 'Actualizar',
    cancel: 'Cancelar',
    remove: 'Eliminar',
    browsePages: 'Explorar páginas',
    alternativeText: 'Texto alternativo',
    width: 'Ancho',
    widthPlaceholder: '300 o 50%',
    widthInvalid: 'Introduzca un ancho en píxeles o un porcentaje',
    urlRequired: 'Por favor, introduzca una URL',
    urlInvalid: 'Por favor, introduzca una URL válida',
    embeddingCodeRequired: 'Por favor, introduzca el código de inserción',
    embeddingCodeInvalid: 'El código de inserción debe contener un iframe',

    // Contextual toolbars
    openLink: 'Abrir enlace',
    editLink: 'Editar enlace',
    unlink: 'Quitar enlace',
    imageAlign: 'Alinear',
    imageAlignNone: 'En línea',
    imageAlignLeft: 'Flotante a la izquierda',
    imageAlignCenter: 'Centrado',
    imageAlignRight: 'Flotante a la derecha',
    imageStyle: 'Estilo de imagen',
    imageAlt: 'Texto alternativo',
    imageSize: 'Cambiar tamaño',
    imageReplace: 'Reemplazar',
    imageRemove: 'Eliminar imagen',
    imageLink: 'Insertar enlace',
    tableHeader: 'Encabezado de tabla',
    tableRows: 'Fila',
    tableRowAbove: 'Insertar fila encima',
    tableRowBelow: 'Insertar fila debajo',
    tableRowDelete: 'Eliminar fila',
    tableColumns: 'Columna',
    tableColumnBefore: 'Insertar columna antes',
    tableColumnAfter: 'Insertar columna después',
    tableColumnDelete: 'Eliminar columna',
    tableCells: 'Celda',
    tableCellsMerge: 'Combinar celdas',
    tableCellsSplit: 'Dividir celda',
    tableStyle: 'Estilo de tabla',
    tableCellStyle: 'Estilo de celda',
    tableRemove: 'Eliminar tabla',
    snippet: 'Fragmento',
    snippetProperties: 'Propiedades',
    snippetRemove: 'Eliminar fragmento',
    mediaRemove: 'Eliminar',

    // Messages
    uploadFailed: 'No se pudo subir el archivo',
    invalidFileEmptyInsert: 'Por favor, seleccione un archivo para insertar.',
    invalidFileSingleInsert: 'Por favor, seleccione un solo archivo.',
    invalidImageEmptyInsert: 'Por favor, seleccione una imagen para insertar.',
    invalidImageInvalidInsert: 'El archivo seleccionado no es una imagen.',
    invalidVideoInvalidInsert: 'El archivo seleccionado no es un vídeo.',
    invalidAudioInvalidInsert: 'El archivo seleccionado no es un archivo de audio.'
};

/*
 * Hotsheet translation: Spanish (es)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['es'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'Sin datos',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Insertar fila encima',
    insertRowBelow: 'Insertar fila debajo',
    removeRow: 'Eliminar fila',
    undo: 'Deshacer',
    redo: 'Rehacer',
    freezeColumn: 'Inmovilizar columna',
    unfreezeColumn: 'Liberar columna',

    // A cell whose value its column does not accept
    invalidValue: 'El valor no es válido.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Seleccionar una fecha',
    chooseTime: 'Seleccionar una hora'
};
