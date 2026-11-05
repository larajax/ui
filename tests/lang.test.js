import { afterEach, describe, expect, test } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { getLanguages, getStrings, hasLanguage, loadLanguage, makeTranslator, resolveLanguage } from '../resources/assets/lang.js';
import { DEFAULT_LANG as MARKDOWN_LANG } from '../resources/assets/formwidgets/markdowneditor/markdowneditor.js';
import { DEFAULT_MESSAGES } from '../resources/assets/formwidgets/datatable/datatable.validation.js';

// Froala's languages (ua served by uk) and those October offers beyond them
const LANGUAGES = [
    'ar', 'be', 'bg', 'bs', 'ca', 'cs', 'da', 'de', 'el', 'en-ca', 'en-gb', 'es', 'et', 'fa', 'fi', 'fr',
    'he', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'ku', 'lt', 'lv', 'me', 'nb', 'nl', 'nn', 'pl', 'pt-br',
    'pt-pt', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'th', 'tr', 'uk', 'vi', 'zh-cn', 'zh-tw'
];

// The English strings of each widget with client-side strings
const WIDGETS = {
    datatable: DEFAULT_MESSAGES,
    markdowneditor: MARKDOWN_LANG
};

// The library's translations to edit, and the language files build.js joins from them and the packages'
const languagesDir = path.join(import.meta.dir, '../resources/languages');
const builtDir = path.join(import.meta.dir, '../resources/assets/languages');
const packageDirs = [
    path.join(import.meta.dir, '../packages/richarea/src/languages'),
    path.join(import.meta.dir, '../packages/hotsheet/src/languages')
];

const REGISTRIES = ['LarajaxUiLanguages', 'RichAreaLanguages', 'HotsheetLanguages'];

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
                    expect([widget, key, typeof value === 'string' && value.trim() !== '']).toEqual([widget, key, true]);
                }
            }

            // Placeholders such as :min stay as they are
            for (const [key, value] of Object.entries(translation.datatable)) {
                const placeholders = (DEFAULT_MESSAGES[key].match(/:\w+/g) || []).sort();
                expect([key, (value.match(/:\w+/g) || []).sort()]).toEqual([key, placeholders]);
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
});
