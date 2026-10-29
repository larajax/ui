/**
 * Moving the active cell and extending a range, with the DataTable's wrapping rules: moving past the last
 * column continues on the next row, and past the last row continues at the top of the next column (and the
 * same backwards). The rules match the grid the DataTable has always used, quirks included.
 */

function clamp(value, max) {
    return Math.min(Math.max(value, 0), max);
}

/**
 * moveCell returns the cell reached from `cell` by a row and column step.
 */
export function moveCell(cell, rowStep, colStep, rowCount, colCount, wrap = true) {
    let rowDelta = rowStep;
    let colDelta = colStep;

    if (wrap) {
        if (cell.row + rowStep > rowCount - 1) {
            rowDelta = 1 - rowCount;
            colDelta = cell.col + colDelta === colCount - 1 ? 1 - colCount : 1;
        }
        else if (cell.row + rowDelta < 0 && cell.col + colDelta >= 0) {
            rowDelta = rowCount - 1;
            colDelta = cell.col + colDelta === 0 ? colCount - 1 : -1;
        }

        if (cell.col + colDelta > colCount - 1) {
            rowDelta = cell.row + rowDelta === rowCount - 1 ? 1 - rowCount : 1;
            colDelta = 1 - colCount;
        }
        else if (cell.col + colDelta < 0 && cell.row + rowDelta >= 0) {
            rowDelta = cell.row + rowDelta === 0 ? rowCount - 1 : -1;
            colDelta = colCount - 1;
        }
    }

    return {
        row: clamp(cell.row + rowDelta, rowCount - 1),
        col: clamp(cell.col + colDelta, colCount - 1)
    };
}

/**
 * extendCell returns the range end reached from `cell` by a step, without wrapping.
 */
export function extendCell(cell, rowStep, colStep, rowCount, colCount) {
    return {
        row: clamp(cell.row + rowStep, rowCount - 1),
        col: clamp(cell.col + colStep, colCount - 1)
    };
}

/**
 * rangeOf returns the top-left and bottom-right corners of a selection.
 */
export function rangeOf(selection) {
    const { anchor, focus } = selection;

    return {
        top: Math.min(anchor.row, focus.row),
        bottom: Math.max(anchor.row, focus.row),
        left: Math.min(anchor.col, focus.col),
        right: Math.max(anchor.col, focus.col)
    };
}
