import { makeHooks } from './hooks.js';
import { makeIcons } from './icons.js';

/**
 * Paragraph formats offered when the host sets none, as format keys mapped to their lang keys.
 */
export const defaultParagraphFormats = {
    N: 'formatNormal',
    H1: 'formatHeading1',
    H2: 'formatHeading2',
    H3: 'formatHeading3',
    H4: 'formatHeading4',
    PRE: 'formatCode'
};

/**
 * Default editor options.
 */
export const defaultOptions = {
    content: '',
    placeholder: '',
    readOnly: false,
    useLineBreaks: false,
    lang: {},
    icons: {},

    toolbarButtons: [
        'paragraphFormat',
        'align',
        'bold',
        'italic',
        'underline',
        '|',
        'formatOL',
        'formatUL',
        '|',
        'insertSnippet',
        'insertTable',
        'insertPageLink',
        'insertImage',
        'insertHR',
        'html'
    ],

    buttons: {},

    // Format keys mapped to labels, the translated defaultParagraphFormats when omitted
    paragraphFormat: null,

    paragraphStyles: {
        'oc-text-gray': 'Gray',
        'oc-text-bordered': 'Bordered',
        'oc-text-spaced': 'Spaced',
        'oc-text-uppercase': 'Uppercase'
    },

    inlineStyles: {
        'oc-class-code': 'Code',
        'oc-class-highlighted': 'Highlighted',
        'oc-class-transparency': 'Transparent'
    },

    imageStyles: {
        'oc-img-rounded': 'Rounded',
        'oc-img-bordered': 'Bordered'
    },

    linkStyles: {
        'oc-link-green': 'Green',
        'oc-link-strong': 'Thick'
    },

    tableStyles: {
        'oc-dashed-borders': 'Dashed Borders',
        'oc-alternate-rows': 'Alternate Rows'
    },

    tableCellStyles: {
        'oc-cell-highlighted': 'Highlighted',
        'oc-cell-thick-border': 'Thick'
    },

    imageAlignClasses: {
        left: 'oc-dii oc-fil',
        center: 'oc-dib',
        right: 'oc-dii oc-fir'
    },

    imageDefaultAlign: 'center',

    imageResize: true,

    fontFamily: {
        'Arial,Helvetica,sans-serif': 'Arial',
        'Georgia,serif': 'Georgia',
        'Impact,Charcoal,sans-serif': 'Impact',
        'Tahoma,Geneva,sans-serif': 'Tahoma',
        "'Times New Roman',Times,serif": 'Times New Roman',
        'Verdana,Geneva,sans-serif': 'Verdana'
    },

    fontSize: ['8', '9', '10', '11', '12', '14', '18', '24', '30', '36', '48', '60', '72', '96'],

    colors: [
        '#61BD6D', '#1ABC9C', '#54ACD2', '#2C82C9', '#9365B8', '#475577', '#CCCCCC',
        '#41A85F', '#00A885', '#3D8EB9', '#2969B0', '#553982', '#28324E', '#000000',
        '#F7DA64', '#FBA026', '#EB6B56', '#E25041', '#A38F84', '#EFEFEF', '#FFFFFF',
        '#FAC51C', '#F37934', '#D14841', '#B8312F', '#7C706B', '#D1D5D8'
    ],

    emoticons: [
        '😀', '😁', '😂', '😃', '😄', '😅', '😆', '😇', '😈', '😉',
        '😊', '😋', '😌', '😍', '😎', '😏', '😐', '😑', '😒', '😓',
        '😔', '😕', '😖', '😗', '😘', '😙', '😚', '😛', '😜', '😝',
        '😞', '😟', '😠', '😡', '😢', '😣', '😤', '😥', '😦', '😧',
        '😨', '😩', '😪', '😫', '😬', '😭', '😮', '😯', '😰', '😱',
        '😲', '😳', '😴', '😵', '😶', '😷', '👍', '👎', '👏', '🙏'
    ],

    linkProtocols: [],
    hooks: {},
    sourceEditor: null,
    extensions: []
};

/**
 * makeOptions merges host options over the defaults, ignoring undefined and null values and
 * copying the default maps and lists so instances never share them, then resolves the hooks and icons.
 */
export function makeOptions(options) {
    const result = {};

    Object.keys(defaultOptions).forEach((key) => {
        const value = defaultOptions[key];

        if (Array.isArray(value)) {
            result[key] = value.slice();
        }
        else if (value && typeof value === 'object') {
            result[key] = { ...value };
        }
        else {
            result[key] = value;
        }
    });

    Object.keys(options || {}).forEach((key) => {
        if (options[key] !== undefined && options[key] !== null) {
            result[key] = options[key];
        }
    });

    result.hooks = makeHooks(result.hooks);
    result.icons = makeIcons(result.icons);

    return result;
}

/**
 * makeParagraphFormats returns the default paragraph formats with their labels translated.
 */
export function makeParagraphFormats(trans) {
    const result = {};

    Object.keys(defaultParagraphFormats).forEach((key) => {
        result[key] = trans(defaultParagraphFormats[key]);
    });

    return result;
}
