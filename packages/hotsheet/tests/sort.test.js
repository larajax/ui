import { describe, test, expect } from 'bun:test';
import { sortRows } from '../src/model/sort.js';

function sortValues(values, type, order) {
    const rows = values.map((value, index) => ({ value, index }));
    return sortRows(rows, { type }, order, (row) => row.value).map((row) => row.value);
}

describe('sortRows', () => {
    test('sorts text case-insensitively with empty values last in both directions', () => {
        expect(sortValues(['banana', null, 'Apple', '', 'cherry'], 'text', 'asc')).toEqual(['Apple', 'banana', 'cherry', null, '']);
        expect(sortValues(['banana', null, 'Apple', '', 'cherry'], 'text', 'desc')).toEqual(['cherry', 'banana', 'Apple', null, '']);
    });

    test('sorts numeric columns by number, including numeric text, with other text after the numbers', () => {
        expect(sortValues(['2.50', 1.2, null, '9', 'abc', 10], 'numeric', 'asc')).toEqual([1.2, '2.50', '9', 10, 'abc', null]);
        expect(sortValues(['2.50', 1.2, null, '9'], 'numeric', 'desc')).toEqual(['9', '2.50', 1.2, null]);
    });

    test('keeps equal values in their order', () => {
        const rows = [{ value: 'a', id: 1 }, { value: 'b', id: 2 }, { value: 'a', id: 3 }];
        expect(sortRows(rows, { type: 'text' }, 'asc', (row) => row.value).map((row) => row.id)).toEqual([1, 3, 2]);
    });
});
