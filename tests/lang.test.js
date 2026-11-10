import { afterEach, describe, expect, test } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { getLanguages, getStrings, hasLanguage, loadLanguage, makeTranslator, pluralize, resolveLanguage } from '../resources/assets/lang.js';
import { DEFAULT_LANG as MARKDOWN_LANG } from '../resources/assets/formwidgets/markdowneditor/markdowneditor.js';
import { DEFAULT_MESSAGES } from '../resources/assets/formwidgets/datatable/datatable.validation.js';
import { DEFAULT_LANG as CUSTOM_SELECT_LANG } from '../resources/assets/controls/custom-select/custom-select-control.js';

// Froala's languages (ua served by uk) and those October offers beyond them
const LANGUAGES = [
    'ar', 'be', 'bg', 'bs', 'ca', 'cs', 'da', 'de', 'el', 'en-ca', 'en-gb', 'es', 'et', 'fa', 'fi', 'fr',
    'he', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'ku', 'lt', 'lv', 'me', 'nb', 'nl', 'nn', 'pl', 'pt-br',
    'pt-pt', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'th', 'tr', 'uk', 'vi', 'zh-cn', 'zh-tw'
];

// The English strings of each widget with client-side strings
const WIDGETS = {
    datatable: DEFAULT_MESSAGES,
    markdowneditor: MARKDOWN_LANG,
    customselect: CUSTOM_SELECT_LANG
};

// The library's translations to edit, and the language files build.js joins from them and the packages'
const languagesDir = path.join(import.meta.dir, '../resources/languages');
const builtDir = path.join(import.meta.dir, '../resources/assets/languages');
const packageDirs = [
    path.join(import.meta.dir, '../packages/richarea/src/languages'),
    path.join(import.meta.dir, '../packages/hotsheet/src/languages')
];

const REGISTRIES = ['LarajaxUiLanguages', 'RichAreaLanguages', 'HotsheetLanguages'];

// A translated string is text, or the forms of a count keyed by the language's plural categories
function isTranslatedString(value, code) {
    if (typeof value === 'string') {
        return value.trim() !== '';
    }

    const categories = new Intl.PluralRules(code).resolvedOptions().pluralCategories;

    return !!value && typeof value.other === 'string' && Object.entries(value).every(([category, text]) => {
        return categories.includes(category) && typeof text === 'string' && text.trim() !== '';
    });
}

describe('library translations', () => {
    afterEach(() => {
        REGISTRIES.forEach((registry) => delete globalThis[registry]);
        document.documentElement.lang = '';
    });

    test('take a widget string from the overrides, then the language, then English', () => {
        getLanguages().de = { markdowneditor: { bold: 'Fett', italic: 'Kursiv' } };
        const trans = makeTranslator('markdowneditor', MARKDOWN_LANG, { language: 'de', overrides: { italic: 'Schräg' } });

        expect(trans('italic')).toBe('Schräg');
        expect(trans('bold')).toBe('Fett');
        expect(trans('table')).toBe('Table');
        expect(getStrings('datatable', DEFAULT_MESSAGES, { language: 'de' })).toEqual(DEFAULT_MESSAGES);
    });

    test('use the page language when none is given, and serve a locale from an alias', () => {
        getLanguages().vi = { markdowneditor: { bold: 'Đậm' } };
        document.documentElement.lang = 'vn';

        expect(makeTranslator('markdowneditor', MARKDOWN_LANG)('bold')).toBe('Đậm');
        expect(resolveLanguage('vi-VN')).toBe('vi');
    });

    test('tell whether every registry has a language', () => {
        getLanguages().de = {};

        expect(hasLanguage('de')).toBe(true);
        expect(hasLanguage('de', ['LarajaxUiLanguages', 'HotsheetLanguages'])).toBe(false);
        expect(hasLanguage(null)).toBe(true);
    });

    test('pick the form for a count by the language\'s plural rules, falling back to other', () => {
        expect(pluralize('Enter :count more', 2)).toBe('Enter 2 more');
        expect(pluralize({ one: ':count item', other: ':count items' }, 1, 'en')).toBe('1 item');
        expect(pluralize({ one: ':count item', other: ':count items' }, 4, 'en')).toBe('4 items');
        expect(pluralize({ one: 'one', other: 'general :count' }, 3, 'ru')).toBe('general 3');
    });

    test('load one file that fills every registry, and nothing the page already has', async () => {
        await loadLanguage('fr', ['RichAreaLanguages']);

        REGISTRIES.forEach((registry) => expect([registry, !!getLanguages(registry).fr]).toEqual([registry, true]));

        getLanguages().xx = {};
        await loadLanguage('xx');
        await loadLanguage('../de');
        expect(getLanguages().de).toBeUndefined();
    });
});

describe('library language files', () => {
    const files = fs.readdirSync(languagesDir).filter((file) => file.endsWith('.js')).sort();

    test('cover every supported language', () => {
        expect(files.map((file) => file.replace(/\.js$/, ''))).toEqual(LANGUAGES);
    });

    for (const file of files) {
        const code = file.replace(/\.js$/, '');

        test(`${code} registers itself with every widget string translated, in the English order`, async () => {
            await import(path.join(languagesDir, file));
            const translation = getLanguages()[code];

            expect(translation).toBeDefined();
            expect(Object.keys(translation)).toEqual(Object.keys(WIDGETS));

            for (const [widget, english] of Object.entries(WIDGETS)) {
                expect([widget, Object.keys(translation[widget])]).toEqual([widget, Object.keys(english)]);

                for (const [key, value] of Object.entries(translation[widget])) {
                    expect([widget, key, isTranslatedString(value, code)]).toEqual([widget, key, true]);
                }
            }

            // Placeholders such as :min stay as they are
            for (const [key, value] of Object.entries(translation.datatable)) {
                const placeholders = (DEFAULT_MESSAGES[key].match(/:\w+/g) || []).sort();
                expect([key, (value.match(/:\w+/g) || []).sort()]).toEqual([key, placeholders]);
            }

            // A message about a count shows the count, at least in its general form
            for (const key of ['inputTooShort', 'maximumSelected']) {
                const value = translation.customselect[key];
                expect([key, (typeof value === 'string' ? value : value.other).includes(':count')]).toEqual([key, true]);
            }
        });
    }
});

describe('built language files', () => {
    afterEach(() => {
        REGISTRIES.forEach((registry) => delete globalThis[registry]);
    });

    test('cover every supported language', () => {
        expect(fs.readdirSync(builtDir).filter((file) => file.endsWith('.js')).map((file) => file.replace(/.js$/, '')).sort()).toEqual(LANGUAGES);
    });

    for (const code of LANGUAGES) {
        test(`${code} holds the library, rich editor and grid translations as they are, so build.js has run since they changed`, () => {
            const built = fs.readFileSync(path.join(builtDir, `${code}.js`), 'utf8');

            for (const dir of [languagesDir, ...packageDirs]) {
                const source = fs.readFileSync(path.join(dir, `${code}.js`), 'utf8').trim();
                expect([dir, built.includes(source)]).toEqual([dir, true]);
            }
        });
    }

    test('give the custom select its messages, plural forms included', () => {
        // Run as the plain script a page loads, since an import of the file may have run already
        new Function(fs.readFileSync(path.join(builtDir, 'ru.js'), 'utf8'))();
        const russian = getLanguages().ru.customselect;

        expect(russian.noResults).toBe('Совпадений не найдено');
        expect(pluralize(russian.maximumSelected, 1, 'ru')).toBe('Вы можете выбрать не более 1 элемент');
        expect(pluralize(russian.maximumSelected, 3, 'ru')).toBe('Вы можете выбрать не более 3 элемента');
        expect(pluralize(russian.maximumSelected, 5, 'ru')).toBe('Вы можете выбрать не более 5 элементов');
    });
});
