import { describe, test, expect } from 'bun:test';
import { moveCell, extendCell, rangeOf } from '../src/view/navigation.js';

// A 4 row by 5 column grid
const ROWS = 4;
const COLS = 5;

function move(row, col, rowStep, colStep) {
    return moveCell({ row, col }, rowStep, colStep, ROWS, COLS);
}

describe('moveCell', () => {
    test('moves within the grid', () => {
        expect(move(1, 1, 1, 0)).toEqual({ row: 2, col: 1 });
        expect(move(1, 1, 0, 1)).toEqual({ row: 1, col: 2 });
    });

    test('wraps down past the last row to the top of the next column, and from the last cell to the first', () => {
        expect(move(3, 3, 1, 0)).toEqual({ row: 0, col: 4 });
        expect(move(3, 4, 1, 0)).toEqual({ row: 0, col: 0 });
    });

    test('wraps up past the first row to the bottom of the previous column', () => {
        expect(move(0, 2, -1, 0)).toEqual({ row: 3, col: 1 });
        expect(move(0, 0, -1, 0)).toEqual({ row: 3, col: 4 });
    });

    test('wraps right past the last column to the next row, and left to the previous row', () => {
        expect(move(1, 4, 0, 1)).toEqual({ row: 2, col: 0 });
        expect(move(3, 4, 0, 1)).toEqual({ row: 0, col: 0 });
        expect(move(2, 0, 0, -1)).toEqual({ row: 1, col: 4 });
        expect(move(0, 0, 0, -1)).toEqual({ row: 3, col: 4 });
    });

    test('stays put without wrapping', () => {
        expect(moveCell({ row: 3, col: 4 }, 1, 0, ROWS, COLS, false)).toEqual({ row: 3, col: 4 });
    });
});

describe('extendCell and rangeOf', () => {
    test('extends without wrapping and normalizes the range corners', () => {
        expect(extendCell({ row: 3, col: 4 }, 1, 1, ROWS, COLS)).toEqual({ row: 3, col: 4 });
        expect(rangeOf({ anchor: { row: 2, col: 3 }, focus: { row: 0, col: 1 } })).toEqual({ top: 0, bottom: 2, left: 1, right: 3 });
    });
});
