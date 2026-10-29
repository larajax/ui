/**
 * Spreadsheet clipboard text: tabs between cells, line breaks between rows, and quotes around cells that
 * hold tabs, line breaks or quotes, with quotes doubled inside.
 */

/**
 * readQuotedCell reads a quoted cell starting at its opening quote, returning null when the quote doesn't
 * close right before a tab, a line break or the end (the cell is then plain text starting with a quote).
 */
function readQuotedCell(text, start) {
    let value = '';
    let i = start + 1;

    while (i < text.length) {
        if (text[i] === '"') {
            if (text[i + 1] === '"') {
                value += '"';
                i += 2;
                continue;
            }

            const next = text[i + 1];
            return next === undefined || next === '\t' || next === '\n' ? { value, end: i + 1 } : null;
        }

        value += text[i];
        i += 1;
    }

    return null;
}

/**
 * parseTsv turns clipboard text into rows of cell strings.
 */
export function parseTsv(input) {
    let text = String(input).replace(/\r\n|\r/g, '\n');
    const rows = [];
    let row = [];
    let i = 0;

    // Spreadsheets end the copied text with a line break, which isn't another row
    if (text.endsWith('\n')) {
        text = text.slice(0, -1);
    }

    while (true) {
        const quoted = text[i] === '"' ? readQuotedCell(text, i) : null;

        if (quoted) {
            row.push(quoted.value);
            i = quoted.end;
        }
        else {
            let end = i;
            while (end < text.length && text[end] !== '\t' && text[end] !== '\n') {
                end += 1;
            }
            row.push(text.slice(i, end));
            i = end;
        }

        if (text[i] === '\t') {
            i += 1;
            continue;
        }

        rows.push(row);
        row = [];

        if (i >= text.length) {
            break;
        }

        i += 1;
    }

    return rows;
}

/**
 * stringifyTsv turns rows of values into clipboard text, quoting cells a spreadsheet would split or unquote.
 */
export function stringifyTsv(rows) {
    const text = rows.map((row) => row.map((value) => {
        if (value === null || value === undefined) {
            return '';
        }

        const cell = String(value);
        return /[\t\n\r]/.test(cell) || cell.startsWith('"') ? `"${cell.replace(/"/g, '""')}"` : cell;
    }).join('\t')).join('\n');

    // A last row of empty cells keeps a line break after it, since a final line break is dropped when read
    const last = rows[rows.length - 1];
    return last && last.every((value) => value === null || value === undefined || value === '') ? text + '\n' : text;
}
