/*
 * Translations for ko, joined by build.js from resources/languages, packages/richarea/src/languages, packages/hotsheet/src/languages, which hold the strings to edit
 */

/*
 * Larajax UI translation: Korean (ko)
 */
(globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['ko'] = {
    // Data table rule messages
    datatable: {
        ruleRequired: '값을 입력해 주세요.',
        ruleInteger: '값은 정수여야 합니다.',
        rulePositiveInteger: '값은 양의 정수여야 합니다.',
        ruleFloat: '값은 실수여야 합니다.',
        rulePositiveFloat: '값은 양의 실수여야 합니다.',
        ruleMin: '값은 :min 이상이어야 합니다.',
        ruleMax: '값은 :max 이하여야 합니다.',
        ruleMinLength: '문자열은 :min자 이상이어야 합니다.',
        ruleMaxLength: '문자열은 :max자 이하여야 합니다.',
        ruleRegex: '값의 형식이 올바르지 않습니다.'
    },

    // Markdown editor buttons
    markdowneditor: {
        bold: '진하게',
        italic: '이탤릭',
        strikethrough: '취소선',
        heading1: '제목 1',
        heading2: '제목 2',
        heading3: '제목 3',
        code: '코드',
        quote: '인용',
        unorderedList: '비순차 목록',
        orderedList: '순차 목록',
        cleanBlock: '블록 서식 지우기',
        link: '링크',
        image: '이미지',
        table: '테이블',
        horizontalRule: '가로선 삽입',
        preview: '미리 보기',
        sideBySide: '나란히 보기',
        fullscreen: '전체화면'
    },

    // Custom select messages
    customselect: {
        noResults: '결과가 없습니다.',
        searching: '검색 중…',
        loadingMore: '불러오는 중…',
        errorLoading: '결과를 불러올 수 없습니다.',
        inputTooShort: '너무 짧습니다. :count 글자 더 입력해주세요.',
        maximumSelected: '최대 :count개까지만 선택 가능합니다.',
        removeItem: '항목 삭제',
        removeAllItems: '모든 항목 삭제'
    }
};

/*
 * RichArea translation: Korean (ko)
 */
(globalThis.RichAreaLanguages = globalThis.RichAreaLanguages || {})['ko'] = {
    // Toolbar buttons
    toolbar: '편집기 도구 모음',
    fullscreen: '전체화면',
    bold: '진하게',
    italic: '이탤릭',
    underline: '밑줄',
    strikeThrough: '취소선',
    subscript: '아래 첨자',
    superscript: '위 첨자',
    fontFamily: '폰트',
    fontSize: '폰트 크기',
    color: '색상',
    emoticons: '이모티콘',
    inlineStyle: '인라인 스타일',
    paragraphStyle: '단락 스타일',
    paragraphFormat: '단락 서식',
    align: '정렬',
    formatOL: '순차 목록',
    formatUL: '비순차 목록',
    outdent: '내어쓰기',
    indent: '들여쓰기',
    quote: '인용',
    insertHR: '가로선 삽입',
    insertLink: '링크 삽입',
    insertPageLink: '링크 삽입',
    insertImage: '이미지 삽입',
    insertVideo: '동영상 삽입',
    insertAudio: '오디오 삽입',
    insertFile: '파일 삽입',
    insertTable: '테이블 삽입',
    insertSnippet: '스니펫 삽입',
    undo: '실행 취소',
    redo: '다시 실행',
    clearFormatting: '서식 지우기',
    selectAll: '모두 선택',
    html: '코드 보기',

    // Shortcut keys
    keyCtrl: 'Ctrl',
    keyAlt: 'Alt',
    keyShift: 'Shift',

    // Paragraph formats
    formatNormal: '일반',
    formatHeading1: '제목 1',
    formatHeading2: '제목 2',
    formatHeading3: '제목 3',
    formatHeading4: '제목 4',
    formatHeading5: '제목 5',
    formatHeading6: '제목 6',
    formatCode: '코드',

    // Alignment
    alignLeft: '왼쪽 정렬',
    alignCenter: '가운데 정렬',
    alignRight: '오른쪽 정렬',
    alignJustify: '양쪽 정렬',

    // Colors
    textColor: '텍스트',
    backgroundColor: '배경',
    removeColor: '색상 제거',
    defaultFont: '기본',

    // Insert menus
    uploadFromComputer: '컴퓨터에서 업로드',
    browse: '찾아보기',
    byUrl: 'URL로 삽입',
    embeddingCode: '임베드 코드',

    // Popover forms
    url: 'URL',
    text: '텍스트',
    openInNewTab: '새 탭에서 열기',
    linkStyle: '스타일',
    none: '없음',
    insert: '삽입',
    update: '업데이트',
    cancel: '취소',
    remove: '삭제',
    browsePages: '페이지 찾아보기',
    alternativeText: '대체 텍스트',
    width: '너비',
    widthPlaceholder: '300 또는 50%',
    widthInvalid: '너비를 픽셀 또는 백분율로 입력해 주세요',
    urlRequired: 'URL을 입력해 주세요',
    urlInvalid: '유효한 URL을 입력해 주세요',
    embeddingCodeRequired: '임베드 코드를 입력해 주세요',
    embeddingCodeInvalid: '임베드 코드에는 iframe이 포함되어야 합니다',

    // Contextual toolbars
    openLink: '링크 열기',
    editLink: '링크 편집',
    unlink: '링크 삭제',
    imageAlign: '정렬',
    imageAlignNone: '인라인',
    imageAlignLeft: '왼쪽 배치',
    imageAlignCenter: '가운데',
    imageAlignRight: '오른쪽 배치',
    imageStyle: '이미지 스타일',
    imageAlt: '대체 텍스트',
    imageSize: '크기 변경',
    imageReplace: '교체',
    imageRemove: '이미지 삭제',
    imageLink: '링크 삽입',
    tableHeader: '테이블 헤더',
    tableRows: '행',
    tableRowAbove: '위에 행 삽입',
    tableRowBelow: '아래에 행 삽입',
    tableRowDelete: '행 삭제',
    tableColumns: '열',
    tableColumnBefore: '왼쪽에 열 삽입',
    tableColumnAfter: '오른쪽에 열 삽입',
    tableColumnDelete: '열 삭제',
    tableCells: '셀',
    tableCellsMerge: '셀 병합',
    tableCellsSplit: '셀 분할',
    tableStyle: '테이블 스타일',
    tableCellStyle: '셀 스타일',
    tableRemove: '테이블 삭제',
    snippet: '스니펫',
    snippetProperties: '속성',
    snippetRemove: '스니펫 삭제',
    mediaRemove: '삭제',

    // Messages
    uploadFailed: '파일을 업로드할 수 없습니다',
    invalidFileEmptyInsert: '삽입할 파일을 선택해 주세요.',
    invalidFileSingleInsert: '파일을 하나만 선택해 주세요.',
    invalidImageEmptyInsert: '삽입할 이미지를 선택해 주세요.',
    invalidImageInvalidInsert: '선택한 파일은 이미지가 아닙니다.',
    invalidVideoInvalidInsert: '선택한 파일은 동영상이 아닙니다.',
    invalidAudioInvalidInsert: '선택한 파일은 오디오 파일이 아닙니다.'
};

/*
 * Hotsheet translation: Korean (ko)
 */
(globalThis.HotsheetLanguages = globalThis.HotsheetLanguages || {})['ko'] = {
    // The placeholder of an empty grid, with emptyState: true
    noData: '데이터 없음',

    // Row and column actions, for a host's context menu
    insertRowAbove: '위에 행 삽입',
    insertRowBelow: '아래에 행 삽입',
    removeRow: '행 삭제',
    undo: '실행 취소',
    redo: '다시 실행',
    freezeColumn: '열 고정',
    unfreezeColumn: '열 고정 해제',

    // A cell whose value its column does not accept
    invalidValue: '값이 올바르지 않습니다.',

    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: '날짜 선택',
    chooseTime: '시간 선택'
};
