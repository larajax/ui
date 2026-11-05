import { afterEach, describe, expect, test } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { getLanguages, getStrings, hasLanguage, makeTranslator, resolveLanguage } from '../resources/assets/lang.js';
import { DEFAULT_LANG as MARKDOWN_LANG } from '../resources/assets/formwidgets/markdowneditor/markdowneditor.js';
import { DEFAULT_MESSAGES } from '../resources/assets/formwidgets/datatable/datatable.validation.js';

// The languages the rich editor and the grid offer, ua served by uk
const LANGUAGES = [
    'ar', 'bs', 'cs', 'da', 'de', 'el', 'en-ca', 'en-gb', 'es', 'et', 'fa', 'fi', 'fr', 'he', 'hr', 'hu',
    'id', 'it', 'ja', 'ko', 'ku', 'me', 'nb', 'nl', 'pl', 'pt-br', 'pt-pt', 'ro', 'ru', 'sk', 'sl', 'sr',
    'sv', 'th', 'tr', 'uk', 'vi', 'zh-cn', 'zh-tw'
];

// The English strings of each widget with client-side strings
const WIDGETS = {
    datatable: DEFAULT_MESSAGES,
    markdowneditor: MARKDOWN_LANG
};

const languagesDir = path.join(import.meta.dir, '../resources/assets/languages');

describe('library translations', () => {
    afterEach(() => {
        delete globalThis.LarajaxUiLanguages;
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
});

describe('library language files', () => {
    const files = fs.readdirSync(languagesDir).filter((file) => file.endsWith('.js')).sort();

    test('cover every language the rich editor offers', () => {
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
