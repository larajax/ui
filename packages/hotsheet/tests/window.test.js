import { describe, test, expect } from 'bun:test';
import { rowOffsets, rowAt, windowFor, covers } from '../src/view/window.js';
import { scaledRowHeight } from '../src/view/renderer.js';

describe('rowOffsets', () => {
    test('adds up row heights, ending with the total', () => {
        expect([...rowOffsets(3, () => 30)]).toEqual([0, 30, 60, 90]);
        expect([...rowOffsets(3, (row) => (row === 1 ? 52 : 30))]).toEqual([0, 30, 82, 112]);
        expect([...rowOffsets(0, () => 30)]).toEqual([0]);
    });
});

describe('rowAt', () => {
    const offsets = rowOffsets(5, () => 30);

    test('finds the row covering a distance, including row edges', () => {
        expect(rowAt(offsets, 0)).toBe(0);
        expect(rowAt(offsets, 29.9)).toBe(0);
        expect(rowAt(offsets, 30)).toBe(1);
        expect(rowAt(offsets, 149)).toBe(4);
    });

    test('clamps distances outside the rows', () => {
        expect(rowAt(offsets, -100)).toBe(0);
        expect(rowAt(offsets, 10000)).toBe(4);
    });

    test('works with measured heights', () => {
        const measured = rowOffsets(3, (row) => (row === 1 ? 90 : 30));
        expect(rowAt(measured, 100)).toBe(1);
        expect(rowAt(measured, 120)).toBe(2);
    });
});

describe('windowFor', () => {
    const offsets = rowOffsets(1000, () => 30);

    test('covers the rows in view plus a margin, within the table', () => {
        expect(windowFor(offsets, 3000, 3500, 0)).toEqual({ first: 100, last: 116 });
        expect(windowFor(offsets, 3000, 3500, 10)).toEqual({ first: 90, last: 126 });
        expect(windowFor(offsets, -500, 200, 10)).toEqual({ first: 0, last: 16 });
        expect(windowFor(offsets, 29900, 31000, 10)).toEqual({ first: 986, last: 999 });
    });

    test('keeps a margin of rows when the table is scrolled out of view', () => {
        expect(windowFor(offsets, -2000, -1500, 10)).toEqual({ first: 0, last: 10 });
    });

    test('returns an empty window without rows', () => {
        expect(windowFor(rowOffsets(0, () => 30), 0, 500, 10)).toEqual({ first: 0, last: -1 });
    });
});

describe('covers', () => {
    test('tells whether the drawn rows hold the needed ones', () => {
        expect(covers({ first: 10, last: 50 }, { first: 20, last: 40 })).toBe(true);
        expect(covers({ first: 10, last: 50 }, { first: 5, last: 40 })).toBe(false);
        expect(covers({ first: 10, last: 50 }, { first: 20, last: 51 })).toBe(false);
        expect(covers({ first: 0, last: -1 }, { first: 0, last: -1 })).toBe(true);
    });
});

describe('scaledRowHeight', () => {
    test('scales the row height, given for a 16px root, with the page root font size', () => {
        expect(scaledRowHeight(30)).toBe(30);

        document.documentElement.style.fontSize = '20px';
        try {
            expect(scaledRowHeight(30)).toBe(38);
            expect(scaledRowHeight(32)).toBe(40);
        }
        finally {
            document.documentElement.style.fontSize = '';
        }
    });
});
