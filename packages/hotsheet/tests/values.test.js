import { describe, test, expect } from 'bun:test';
import { parseNumericText, isNumericValue } from '../src/values/numeric.js';
import { parseTsv, stringifyTsv } from '../src/values/tsv.js';

describe('parseNumericText', () => {
    test('reads commas grouping thousands as separators with a dot decimal separator', () => {
        expect(parseNumericText('1,234')).toBe(1234);
        expect(parseNumericText('1,234,567.5')).toBe(1234567.5);
    });

    test('reads dots grouping thousands as separators with a comma decimal separator, when they can only be groups', () => {
        expect(parseNumericText('1.234.567', ',')).toBe(1234567);
        expect(parseNumericText('1.234,5', ',')).toBe(1234.5);
    });

    test('reads a lone dot as a decimal point with a comma decimal separator, as stored numbers show', () => {
        expect(parseNumericText('2.125', ',')).toBe(2.125);
        expect(parseNumericText('1.234', ',')).toBe(1.234);
        expect(parseNumericText('2,125', ',')).toBe(2.125);
    });

    test('reads a single separator that does not group thousands as a decimal', () => {
        expect(parseNumericText('3.5')).toBe(3.5);
        expect(parseNumericText('3,5')).toBe(3.5);
        expect(parseNumericText('1,23')).toBe(1.23);
    });

    test('reads signs, leading zeros, bare decimals and exponents', () => {
        expect(parseNumericText('-7')).toBe(-7);
        expect(parseNumericText('- 7')).toBe(-7);
        expect(parseNumericText('0012')).toBe(12);
        expect(parseNumericText('.5')).toBe(0.5);
        expect(parseNumericText('1e3')).toBe(1000);
    });

    test('returns null for text that is not a number', () => {
        expect(parseNumericText('abc')).toBe(null);
        expect(parseNumericText('0x1f')).toBe(null);
        expect(parseNumericText('1,2,3')).toBe(null);
        expect(parseNumericText('')).toBe(null);
    });
});

describe('isNumericValue', () => {
    test('accepts numbers and numeric text only', () => {
        expect(isNumericValue(12)).toBe(true);
        expect(isNumericValue('12.5')).toBe(true);
        expect(isNumericValue('abc')).toBe(false);
        expect(isNumericValue(Infinity)).toBe(false);
        expect(isNumericValue(null)).toBe(false);
    });
});

describe('parseTsv', () => {
    test('splits cells and rows and ignores the trailing line break', () => {
        expect(parseTsv('a\tb\nc\td\n')).toEqual([['a', 'b'], ['c', 'd']]);
    });

    test('unquotes cells with doubled quotes and keeps tabs and line breaks inside quotes', () => {
        expect(parseTsv('"Say ""hi"""\t"one\ntwo"\t"a\tb"')).toEqual([['Say "hi"', 'one\ntwo', 'a\tb']]);
    });

    test('reads a cell that only starts with a quote as plain text', () => {
        expect(parseTsv('"open\tx')).toEqual([['"open', 'x']]);
        expect(parseTsv('"a"b\tx')).toEqual([['"a"b', 'x']]);
    });

    test('keeps empty cells and an empty input', () => {
        expect(parseTsv('a\t\tc')).toEqual([['a', '', 'c']]);
        expect(parseTsv('')).toEqual([['']]);
        expect(parseTsv('\r\n')).toEqual([['']]);
    });
});

describe('stringifyTsv', () => {
    test('quotes cells a spreadsheet would split or unquote and round trips', () => {
        const rows = [['one\ntwo', 'a\tb'], ['"q"', 'mid "q"'], [null, 5]];
        const text = stringifyTsv(rows);

        expect(text).toBe('"one\ntwo"\t"a\tb"\n"""q"""\tmid "q"\n\t5');
        expect(parseTsv(text)).toEqual([['one\ntwo', 'a\tb'], ['"q"', 'mid "q"'], ['', '5']]);
    });
});
