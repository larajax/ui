/**
 * Default English strings; see the language and lang options.
 */
export const defaultLang = {
    // The placeholder of an empty grid, with emptyState: true
    noData: 'No data',

    // Row and column actions, for a host's context menu
    insertRowAbove: 'Insert row above',
    insertRowBelow: 'Insert row below',
    removeRow: 'Remove row',
    undo: 'Undo',
    redo: 'Redo',
    freezeColumn: 'Freeze column',
    unfreezeColumn: 'Unfreeze column',

    // A cell whose value its column does not accept
    invalidValue: 'The value is not valid.',

    // The button opening the native date or time picker
    chooseDate: 'Choose a date',
    chooseTime: 'Choose a time'
};

/**
 * Language codes some hosts use in place of the standard ones
 */
const LANGUAGE_ALIASES = {
    kr: 'ko',
    no: 'nb',
    pt: 'pt-pt',
    rs: 'sr',
    ua: 'uk',
    vn: 'vi',
    zh: 'zh-cn'
};

/**
 * getLanguages returns the page's translations, keyed by code.
 */
export function getLanguages() {
    if (!globalThis.HotsheetLanguages) {
        globalThis.HotsheetLanguages = {};
    }

    return globalThis.HotsheetLanguages;
}

/**
 * registerLanguage adds a translation keyed like the defaults.
 */
export function registerLanguage(code, strings) {
    getLanguages()[normalizeLanguage(code)] = strings;
}

/**
 * languageCandidates lists codes for a locale, such as pt-br and pt.
 */
export function languageCandidates(code) {
    if (!code) {
        return [];
    }

    const normal = normalizeLanguage(code);
    const base = normal.split('-')[0];
    const result = [normal, LANGUAGE_ALIASES[normal], base, LANGUAGE_ALIASES[base]];

    return [...new Set(result.filter(Boolean))];
}

/**
 * resolveLanguage returns the loaded code serving a locale, or null.
 */
export function resolveLanguage(code) {
    const languages = getLanguages();

    return languageCandidates(code).find((candidate) => languages[candidate]) || null;
}

function normalizeLanguage(code) {
    return String(code).trim().toLowerCase().replace(/_/g, '-');
}

/**
 * makeTranslator returns a lookup: overrides, language, English.
 */
export function makeTranslator(overrides, language) {
    const code = resolveLanguage(language);
    const strings = { ...defaultLang, ...(code ? getLanguages()[code] : {}), ...(overrides || {}) };

    return (key, fallback) => {
        if (strings[key] !== undefined) {
            return strings[key];
        }

        return fallback !== undefined ? fallback : key;
    };
}
