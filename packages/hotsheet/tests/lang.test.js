import { afterEach, describe, expect, test } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { defaultLang, getLanguages, languageCandidates, makeTranslator, registerLanguage, resolveLanguage } from '../src/lang.js';
import { Sheet } from '../src/sheet.js';

// Froala's languages (ua served by uk) and those October offers beyond them
const LANGUAGES = [
    'ar', 'be', 'bg', 'bs', 'ca', 'cs', 'da', 'de', 'el', 'en-ca', 'en-gb', 'es', 'et', 'fa', 'fi', 'fr',
    'he', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'ku', 'lt', 'lv', 'me', 'nb', 'nl', 'nn', 'pl', 'pt-br',
    'pt-pt', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'th', 'tr', 'uk', 'vi', 'zh-cn', 'zh-tw'
];

const languagesDir = path.join(import.meta.dir, '../src/languages');

describe('translator', () => {
    afterEach(() => {
        delete globalThis.HotsheetLanguages;
        document.body.innerHTML = '';
    });

    test('takes a string from the overrides, then the language, then English', () => {
        registerLanguage('de', { undo: 'Rückgängig', redo: 'Wiederholen' });
        const trans = makeTranslator({ redo: 'Erneut' }, 'de');

        expect(trans('redo')).toBe('Erneut');
        expect(trans('undo')).toBe('Rückgängig');
        expect(trans('removeRow')).toBe('Remove row');
    });

    test('serves a locale from its region, its base language or a common alias', () => {
        registerLanguage('pt_BR', { undo: 'Desfazer' });
        registerLanguage('vi', { undo: 'Hoàn tác' });

        expect(resolveLanguage('pt-BR')).toBe('pt-br');
        expect(resolveLanguage('vn')).toBe('vi');
        expect(resolveLanguage('fr')).toBeNull();
        expect(languageCandidates('nb_NO')).toEqual(['nb-no', 'nb']);
    });

    test('shows the translated placeholder of an empty grid', () => {
        registerLanguage('de', { noData: 'Keine Daten' });
        const element = document.createElement('div');
        document.body.append(element);

        const sheet = new Sheet(element, { columns: [{ key: 'name', title: 'Name' }], rows: [], emptyState: true, language: 'de' });

        expect(element.querySelector('.hotsheet-empty-title').textContent).toBe('Keine Daten');
        sheet.destroy();
    });
});

describe('language files', () => {
    const files = fs.readdirSync(languagesDir).filter((file) => file.endsWith('.js')).sort();
    const englishKeys = Object.keys(defaultLang);

    test('cover every supported language', () => {
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
