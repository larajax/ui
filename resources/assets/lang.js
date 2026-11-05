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
 * The editor and grid packages keep theirs the same way, in RichAreaLanguages and HotsheetLanguages,
 * and Select2's own translations for the custom-select control sit in Select2Languages. languages/<code>.js
 * is one plain script per language that fills every registry, joined by build.js from resources/languages,
 * the packages' translations and Select2's. A page may bundle the file, otherwise a widget loads it.
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

// The folder of the language files relative to this file, in a variable so bundlers leave the folder out of a bundle
const LANGUAGE_FOLDER = './languages';

const LANGUAGE_CODE = /^[a-z]{2,3}(-[a-z0-9]{2,8})?$/;

/**
 * getLanguages returns a registry of translations on the page, keyed by language code.
 */
export function getLanguages(registry = 'LarajaxUiLanguages') {
    if (!globalThis[registry]) {
        globalThis[registry] = {};
    }

    return globalThis[registry];
}

/**
 * languageCandidates lists the codes that serve a locale, most specific first, such as pt-br and pt for pt_BR.
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
 * resolveLanguage returns the code of the loaded translation serving a locale, or null for English.
 */
export function resolveLanguage(code, registry = 'LarajaxUiLanguages') {
    const languages = getLanguages(registry);

    return languageCandidates(code).find((candidate) => languages[candidate]) || null;
}

/**
 * getStrings returns a widget's strings. A string comes from the overrides, then the translation for
 * the language (the page's lang attribute when not given), then the English defaults.
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
 * hasLanguage tells whether the page has the translations of a language in all the given registries.
 */
export function hasLanguage(language, registries = ['LarajaxUiLanguages']) {
    return !language || registries.every((registry) => !!getLanguages(registry)[language]);
}

/**
 * loadLanguage loads the language file of a language unless the page already has its translations in
 * all the given registries. The language is a code with a file, as the field's data-language gives it;
 * the widgets stay in English when the file fails to load, as it does from inside a bundle.
 */
export function loadLanguage(language, registries = ['LarajaxUiLanguages']) {
    if (!language || !LANGUAGE_CODE.test(language) || hasLanguage(language, registries)) {
        return Promise.resolve();
    }

    return import(/* @vite-ignore */ /* webpackIgnore: true */ `${LANGUAGE_FOLDER}/${language}.js`).catch(() => {});
}
