import { mergeAttributes } from '@tiptap/core';
import {
    Table as BaseTable,
    TableRow as BaseTableRow,
    TableCell as BaseTableCell,
    TableHeader as BaseTableHeader
} from '@tiptap/extension-table';

/**
 * spanAttribute parses a colspan or rowspan, only writing it when it spans more than one.
 */
function spanAttribute(name) {
    return {
        default: 1,
        parseHTML: (element) => {
            const value = parseInt(element.getAttribute(name) || '1', 10);
            return isNaN(value) || value < 1 ? 1 : value;
        },
        renderHTML: (attributes) => (attributes[name] > 1 ? { [name]: attributes[name] } : {})
    };
}

/**
 * cellAttributes drops the column widths the table plugin tracks, so saved tables carry no
 * pixel sizes and follow the site styles.
 */
function cellAttributes(parent) {
    return {
        ...parent,
        colspan: spanAttribute('colspan'),
        rowspan: spanAttribute('rowspan'),
        colwidth: {
            default: null,
            parseHTML: () => null,
            renderHTML: () => ({})
        }
    };
}

/**
 * Table renders a plain table with a tbody, without the colgroup and width styles of the
 * default table node.
 */
export const Table = BaseTable.extend({
    renderHTML({ HTMLAttributes }) {
        return ['table', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), ['tbody', 0]];
    }
}).configure({
    resizable: false,
    View: null
});

export const TableRow = BaseTableRow;

export const TableCell = BaseTableCell.extend({
    addAttributes() {
        return cellAttributes(this.parent?.());
    }
});

export const TableHeader = BaseTableHeader.extend({
    addAttributes() {
        return cellAttributes(this.parent?.());
    }
});
