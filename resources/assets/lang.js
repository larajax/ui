/*
 * Translations of the library's client-side strings
 *
 * The library's own widgets keep their English strings beside their code and take translations from
 * the LarajaxUiLanguages registry, each widget's strings under its name:
 *
 *     (globalThis.LarajaxUiLanguages = globalThis.LarajaxUiLanguages || {})['de'] = {
 *         datatable: { ruleRequired: '...' },
 *         markdowneditor: { bold: 'Fett' }
 *     };
 *
 * A string that changes with a count is an object of forms keyed by plural category, see pluralize().
 *
 * The editor and grid packages keep theirs the same way, in RichAreaLanguages and HotsheetLanguages.
 * languages/<code>.js is one plain script per language that fills every registry, joined by build.js
 * from resources/languages and the packages' translations. A page may bundle the file, otherwise a
 * widget loads it.
 */
'use strict';

// Language codes some hosts use in place of the standard ones
const LANGUAGE_ALIASES = {
    kr: 'ko',
    no: 'nb',
    pt: 'pt-pt',
    rs: 'sr',
    ua: 'uk',
    vn: 'vi',
    zh: 'zh-cn'
};

// Language folder, a variable so bundlers leave it out
const LANGUAGE_FOLDER = './languages';

const LANGUAGE_CODE = /^[a-z]{2,3}(-[a-z0-9]{2,8})?$/;

/**
 * getLanguages returns the page's translations by language code.
 */
export function getLanguages(registry = 'LarajaxUiLanguages') {
    if (!globalThis[registry]) {
        globalThis[registry] = {};
    }

    return globalThis[registry];
}

/**
 * languageCandidates lists a locale's codes, most specific first.
 */
export function languageCandidates(code) {
    if (!code) {
        return [];
    }

    const normal = String(code).trim().toLowerCase().replace(/_/g, '-');
    const base = normal.split('-')[0];
    const result = [normal, LANGUAGE_ALIASES[normal], base, LANGUAGE_ALIASES[base]];

    return [...new Set(result.filter(Boolean))];
}

/**
 * resolveLanguage returns a locale's loaded code, or null for English.
 */
export function resolveLanguage(code, registry = 'LarajaxUiLanguages') {
    const languages = getLanguages(registry);

    return languageCandidates(code).find((candidate) => languages[candidate]) || null;
}

/**
 * getStrings returns a widget's strings, from overrides to English.
 */
export function getStrings(widget, defaults, { language = null, overrides = null } = {}) {
    const code = resolveLanguage(language || document.documentElement.lang);
    const translation = code ? getLanguages()[code][widget] : null;

    return { ...defaults, ...(translation || {}), ...(overrides || {}) };
}

/**
 * makeTranslator returns a lookup of a widget's strings, see getStrings.
 */
export function makeTranslator(widget, defaults, options = {}) {
    const strings = getStrings(widget, defaults, options);

    return (key, fallback) => {
        if (strings[key] !== undefined) {
            return strings[key];
        }

        return fallback !== undefined ? fallback : key;
    };
}

/**
 * pluralize picks a count's plural form and fills in :count.
 */
export function pluralize(value, count, language = null) {
    let text = value;

    if (value && typeof value === 'object') {
        let category = 'other';

        try {
            category = new Intl.PluralRules(language || 'en').select(count);
        }
        catch (error) {}

        text = value[category] !== undefined ? value[category] : value.other;
    }

    return String(text ?? '').replace(/:count/g, count);
}

/**
 * hasLanguage tells whether every given registry has a language.
 */
export function hasLanguage(language, registries = ['LarajaxUiLanguages']) {
    return !language || registries.every((registry) => !!getLanguages(registry)[language]);
}

/**
 * loadLanguage loads a missing language file; failures stay English.
 */
export function loadLanguage(language, registries = ['LarajaxUiLanguages']) {
    if (!language || !LANGUAGE_CODE.test(language) || hasLanguage(language, registries)) {
        return Promise.resolve();
    }

    return import(/* @vite-ignore */ /* webpackIgnore: true */ `${LANGUAGE_FOLDER}/${language}.js`).catch(() => {});
}
