/**
 * Row windowing: large tables draw only the rows in view plus a margin, and spacers above and below keep the
 * table its full height so the scrollbar stays true. Rows are measured where they wrap, otherwise every row
 * is the row height.
 */

// Rows drawn past the view, and the margin left before redrawing
export const WINDOW_MARGIN = 20;
export const WINDOW_EDGE = 5;

/**
 * rowOffsets returns each row's top, then the total height.
 */
export function rowOffsets(count, heightOf) {
    const offsets = new Float64Array(count + 1);

    for (let row = 0; row < count; row++) {
        offsets[row + 1] = offsets[row] + heightOf(row);
    }

    return offsets;
}

/**
 * rowAt returns the row at a distance from the top, clamped.
 */
export function rowAt(offsets, y) {
    const count = offsets.length - 1;
    let low = 0;
    let high = count - 1;

    while (low < high) {
        const middle = (low + high + 1) >> 1;
        if (offsets[middle] <= y) {
            low = middle;
        }
        else {
            high = middle - 1;
        }
    }

    return Math.max(0, low);
}

/**
 * windowFor returns the rows to draw for a view, plus `margin`.
 */
export function windowFor(offsets, top, bottom, margin = 0) {
    const count = offsets.length - 1;

    if (!count) {
        return { first: 0, last: -1 };
    }

    return {
        first: Math.max(0, rowAt(offsets, Math.max(0, top)) - margin),
        last: Math.min(count - 1, rowAt(offsets, Math.max(0, bottom)) + margin)
    };
}

/**
 * covers tells whether a drawn window holds a needed one.
 */
export function covers(drawn, needed) {
    return needed.first > needed.last || (needed.first >= drawn.first && needed.last <= drawn.last);
}
