import { afterEach, describe, expect, test } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { defaultLang, getLanguages, languageCandidates, makeTranslator, registerLanguage, resolveLanguage } from '../src/lang.js';

// The languages Froala offered, ua served by uk
const LANGUAGES = [
    'ar', 'bs', 'cs', 'da', 'de', 'el', 'en-ca', 'en-gb', 'es', 'et', 'fa', 'fi', 'fr', 'he', 'hr', 'hu',
    'id', 'it', 'ja', 'ko', 'ku', 'me', 'nb', 'nl', 'pl', 'pt-br', 'pt-pt', 'ro', 'ru', 'sk', 'sl', 'sr',
    'sv', 'th', 'tr', 'uk', 'vi', 'zh-cn', 'zh-tw'
];

const languagesDir = path.join(import.meta.dir, '../src/languages');

describe('translator', () => {
    afterEach(() => {
        delete globalThis.RichAreaLanguages;
    });

    test('takes a string from the overrides, then the language, then English', () => {
        registerLanguage('de', { bold: 'Fett', italic: 'Kursiv' });
        const trans = makeTranslator({ italic: 'Schräg' }, 'de');

        expect(trans('italic')).toBe('Schräg');
        expect(trans('bold')).toBe('Fett');
        expect(trans('underline')).toBe('Underline');
        expect(trans('mystery', 'Fallback')).toBe('Fallback');
    });

    test('serves a locale from its region, its base language or a common alias', () => {
        registerLanguage('pt_BR', { bold: 'Negrito' });
        registerLanguage('de', { bold: 'Fett' });
        registerLanguage('vi', { bold: 'Đậm' });

        expect(resolveLanguage('pt-BR')).toBe('pt-br');
        expect(resolveLanguage('de_AT')).toBe('de');
        expect(resolveLanguage('vn')).toBe('vi');
        expect(resolveLanguage('fr')).toBeNull();
        expect(resolveLanguage('')).toBeNull();
        expect(languageCandidates('nb_NO')).toEqual(['nb-no', 'nb']);
    });

    test('stays in English without a language', () => {
        expect(makeTranslator({}, null)('bold')).toBe('Bold');
        expect(makeTranslator({}, 'xx')('bold')).toBe('Bold');
    });
});

describe('language files', () => {
    const files = fs.readdirSync(languagesDir).filter((file) => file.endsWith('.js')).sort();
    const englishKeys = Object.keys(defaultLang);

    test('cover every language Froala offered', () => {
        expect(files.map((file) => file.replace(/\.js$/, ''))).toEqual(LANGUAGES);
    });

    for (const file of files) {
        const code = file.replace(/\.js$/, '');

        test(`${code} registers itself with every string translated, in the English order`, async () => {
            await import(path.join(languagesDir, file));
            const strings = getLanguages()[code];

            expect(strings).toBeDefined();
            expect(Object.keys(strings)).toEqual(englishKeys);

            for (const [key, value] of Object.entries(strings)) {
                expect([key, typeof value === 'string' && value.trim() !== '']).toEqual([key, true]);
            }
        });
    }
});
