/*
 * Translations for ja, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Japanese (ja)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['ja'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: '値を入力してください。',
        ruleInteger: '値は整数で入力してください。',
        rulePositiveInteger: '値は正の整数で入力してください。',
        ruleFloat: '値は数値で入力してください。',
        rulePositiveFloat: '値は正の数値で入力してください。',
        ruleMin: '値は:min以上で入力してください。',
        ruleMax: '値は:max以下で入力してください。',
        ruleMinLength: '文字列は:min文字以上で入力してください。',
        ruleMaxLength: '文字列は:max文字以内で入力してください。',
        ruleRegex: '値の形式が無効です。'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: '太字',
        italic: '斜体',
        strikethrough: '取り消し線',
        heading1: '見出し 1',
        heading2: '見出し 2',
        heading3: '見出し 3',
        code: 'コード',
        quote: '引用',
        unorderedList: '箇条書きリスト',
        orderedList: '番号付きリスト',
        cleanBlock: 'ブロックの書式をクリア',
        link: 'リンク',
        image: '画像',
        table: 'テーブル',
        horizontalRule: '水平線を挿入',
        preview: 'プレビュー',
        sideBySide: '並べて表示',
        fullscreen: '全画面表示'
    }
};

/*
 * RichArea translation: Japanese (ja)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['ja'] = {
    // Toolbar buttons
    toolbar: 'エディターのツールバー',
    fullscreen: '全画面表示',
    bold: '太字',
    italic: '斜体',
    underline: '下線',
    strikeThrough: '取り消し線',
    subscript: '下付き文字',
    superscript: '上付き文字',
    fontFamily: 'フォント',
    fontSize: 'フォントサイズ',
    color: '色',
    emoticons: '絵文字',
    inlineStyle: 'インラインスタイル',
    paragraphStyle: '段落スタイル',
    paragraphFormat: '段落の書式',
    align: '配置',
    formatOL: '番号付きリスト',
    formatUL: '箇条書きリスト',
    outdent: 'インデントを減らす',
    indent: 'インデントを増やす',
    quote: '引用',
    insertHR: '水平線を挿入',
    insertLink: 'リンクを挿入',
    insertPageLink: 'リンクを挿入',
    insertImage: '画像を挿入',
    insertVideo: '動画を挿入',
    insertAudio: '音声を挿入',
    insertFile: 'ファイルを挿入',
    insertTable: 'テーブルを挿入',
    insertSnippet: 'スニペットを挿入',
    undo: '元に戻す',
    redo: 'やり直し',
    clearFormatting: '書式をクリア',
    selectAll: 'すべて選択',
    html: 'コード表示',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: '標準',
    formatHeading1: '見出し 1',
    formatHeading2: '見出し 2',
    formatHeading3: '見出し 3',
    formatHeading4: '見出し 4',
    formatHeading5: '見出し 5',
    formatHeading6: '見出し 6',
    formatCode: 'コード',

    // Alignment
    alignLeft: '左揃え',
    alignCenter: '中央揃え',
    alignRight: '右揃え',
    alignJustify: '両端揃え',

    // Colors
    textColor: '文字色',
    backgroundColor: '背景色',
    removeColor: '色を削除',
    defaultFont: 'デフォルト',

    // Insert menus
    uploadFromComputer: 'コンピューターからアップロード',
    browse: '参照',
    byUrl: 'URLで指定',
    embeddingCode: '埋め込みコード',

    // Popover forms
    url: 'URL',
    text: 'テキスト',
    openInNewTab: '新しいタブで開く',
    linkStyle: 'スタイル',
    none: 'なし',
    insert: '挿入',
    update: '更新',
    cancel: 'キャンセル',
    remove: '削除',
    browsePages: 'ページを参照',
    alternativeText: '代替テキスト',
    width: '幅',
    widthPlaceholder: '300 または 50%',
    widthInvalid: '幅をピクセルまたはパーセントで入力してください',
    urlRequired: 'URLを入力してください',
    urlInvalid: '有効なURLを入力してください',
    embeddingCodeRequired: '埋め込みコードを入力してください',
    embeddingCodeInvalid: '埋め込みコードには iframe が含まれている必要があります',

    // Contextual toolbars
    openLink: 'リンクを開く',
    editLink: 'リンクを編集',
    unlink: 'リンク解除',
    imageAlign: '配置',
    imageAlignNone: 'インライン',
    imageAlignLeft: '左に回り込み',
    imageAlignCenter: '中央',
    imageAlignRight: '右に回り込み',
    imageStyle: '画像スタイル',
    imageAlt: '代替テキスト',
    imageSize: 'サイズ変更',
    imageReplace: '差し替え',
    imageRemove: '画像を削除',
    imageLink: 'リンクを挿入',
    tableHeader: 'テーブルヘッダー',
    tableRows: '行',
    tableRowAbove: '上に行を挿入',
    tableRowBelow: '下に行を挿入',
    tableRowDelete: '行を削除',
    tableColumns: '列',
    tableColumnBefore: '左に列を挿入',
    tableColumnAfter: '右に列を挿入',
    tableColumnDelete: '列を削除',
    tableCells: 'セル',
    tableCellsMerge: 'セルを結合',
    tableCellsSplit: 'セルを分割',
    tableStyle: 'テーブルスタイル',
    tableCellStyle: 'セルスタイル',
    tableRemove: 'テーブルを削除',
    snippet: 'スニペット',
    snippetProperties: 'プロパティ',
    snippetRemove: 'スニペットを削除',
    mediaRemove: '削除',

    // Messages
    uploadFailed: 'ファイルをアップロードできませんでした',
    invalidFileEmptyInsert: '挿入するファイルを選択してください。',
    invalidFileSingleInsert: 'ファイルを1つだけ選択してください。',
    invalidImageEmptyInsert: '挿入する画像を選択してください。',
    invalidImageInvalidInsert: '選択したファイルは画像ではありません。',
    invalidVideoInvalidInsert: '選択したファイルは動画ではありません。',
    invalidAudioInvalidInsert: '選択したファイルは音声ファイルではありません。'
};

/*
 * Hotsheet translation: Japanese (ja)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['ja'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'データがありません',

    // Row and column actions, for a host's context menu
    insertRowAbove: '上に行を挿入',
    insertRowBelow: '下に行を挿入',
    removeRow: '行を削除',
    undo: '元に戻す',
    redo: 'やり直し',
    freezeColumn: '列を固定',
    unfreezeColumn: '列の固定を解除',

    // A cell whose value its column does not accept
    invalidValue: '値が無効です。',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: '日付を選択',
    chooseTime: '時刻を選択'
};
