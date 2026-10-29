import { describe, expect, test } from 'bun:test';
import { InputPresetEngine } from '../resources/assets/controls/input-preset/input-preset-engine.js';

const slug = (value) => new InputPresetEngine().formatValue({ inputPresetType: 'slug', inputPresetRemoveWords: false }, value);

describe('input preset transliteration', () => {
    test('accented Latin letters reduce to their base letter', () => {
        expect(slug('Crème Brûlée')).toBe('creme-brulee');
        expect(slug('Ẁales Ǩa')).toBe('wales-ka');
        expect(slug('Ǎǐǒǔ')).toBe('aiou');
    });

    test('letters that do not decompose use the transliteration maps', () => {
        expect(slug('Straße')).toBe('strasse');
        expect(slug('Ħamrun Ŋaw')).toBe('hamrun-ngaw');
        expect(slug('Ĳsselmeer')).toBe('ijsselmeer');
        expect(slug('Москва')).toBe('moskva');
    });
});
