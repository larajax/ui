import { describe, test, expect } from 'bun:test';
import { correctDate, correctTime, isInFormat, formatParts, toIsoDate, fromIsoDate, toIsoTime, fromIsoTime } from '../src/values/dates.js';

describe('correctDate', () => {
    test('keeps dates already in the format and pads loose ones', () => {
        expect(correctDate('2026-05-06', 'YYYY-MM-DD')).toBe('2026-05-06');
        expect(correctDate('2026-7-8', 'YYYY-MM-DD')).toBe('2026-07-08');
        expect(correctDate('9/10/2026', 'DD/MM/YYYY')).toBe('09/10/2026');
    });

    test('reads other separators and ISO dates in any format', () => {
        expect(correctDate('9-10-2026', 'DD/MM/YYYY')).toBe('09/10/2026');
        expect(correctDate('2026-10-09', 'DD/MM/YYYY')).toBe('09/10/2026');
    });

    test('reads month names', () => {
        expect(correctDate('4 Mar 2026', 'D MMM YYYY')).toBe('4 Mar 2026');
        expect(correctDate('2026-03-04', 'D MMMM YYYY')).toBe('4 March 2026');
    });

    test('rejects text and impossible dates', () => {
        expect(correctDate('hello', 'YYYY-MM-DD')).toBe(null);
        expect(correctDate('2026-02-30', 'YYYY-MM-DD')).toBe(null);
        expect(correctDate('2026-13-01', 'YYYY-MM-DD')).toBe(null);
    });

    test('reads the date of ISO date times without moving it to another day', () => {
        expect(correctDate('2026-03-04T20:00:00Z', 'YYYY-MM-DD')).toBe('2026-03-04');
        expect(correctDate('2026-03-04T00:00:00Z', 'YYYY-MM-DD')).toBe('2026-03-04');
        expect(correctDate('2026-03-04 23:30', 'YYYY-MM-DD')).toBe('2026-03-04');
    });

    test('reads month names with a year, but never rolls impossible days over or reads other words as dates', () => {
        expect(correctDate('March 4, 2026', 'YYYY-MM-DD')).toBe('2026-03-04');
        expect(correctDate('February 31, 2026', 'YYYY-MM-DD')).toBe(null);
        expect(correctDate('Week 3', 'YYYY-MM-DD')).toBe(null);
        expect(correctDate('Item 12', 'YYYY-MM-DD')).toBe(null);
    });
});

describe('correctTime', () => {
    test('pads loose times and reads twelve hour clocks', () => {
        expect(correctTime('9:05', 'HH:mm')).toBe('09:05');
        expect(correctTime('21:15', 'HH:mm')).toBe('21:15');
        expect(correctTime('9:05 pm', 'h:mm A')).toBe('9:05 PM');
        expect(correctTime('12:30 am', 'HH:mm')).toBe(null);
    });

    test('rejects text and impossible times', () => {
        expect(correctTime('later', 'HH:mm')).toBe(null);
        expect(correctTime('25:00', 'HH:mm')).toBe(null);
    });
});

describe('isInFormat', () => {
    test('accepts only text the format would write', () => {
        expect(isInFormat('2026-05-06', 'YYYY-MM-DD')).toBe(true);
        expect(isInFormat('2026-5-6', 'YYYY-MM-DD')).toBe(false);
        expect(isInFormat('hello', 'YYYY-MM-DD')).toBe(false);
        expect(isInFormat('09:05', 'HH:mm', correctTime)).toBe(true);
    });
});

describe('formatParts and native input conversion', () => {
    test('keeps bracketed text literal', () => {
        expect(formatParts({ year: 2026, month: 3, day: 4, hour: 0, minute: 0, second: 0 }, '[Day] D')).toBe('Day 4');
    });

    test('converts between a column format and native input values', () => {
        expect(toIsoDate('04/03/2026', 'DD/MM/YYYY')).toBe('2026-03-04');
        expect(fromIsoDate('2026-03-04', 'DD/MM/YYYY')).toBe('04/03/2026');
        expect(toIsoTime('9:05 PM', 'h:mm A')).toBe('21:05');
        expect(fromIsoTime('21:05', 'h:mm A')).toBe('9:05 PM');
        expect(toIsoDate('hello', 'DD/MM/YYYY')).toBe('');
    });
});
