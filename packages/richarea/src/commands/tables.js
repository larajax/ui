import { hasClass, toggleClass } from '../html/utils.js';
import { parentNode } from './helpers.js';

/**
 * currentCell returns the table cell or header holding the selection.
 */
function currentCell(re) {
    return parentNode(re.editor, 'tableCell') || parentNode(re.editor, 'tableHeader');
}

/**
 * hasHeaderRow checks whether the first row of the current table is made of header cells.
 */
function hasHeaderRow(re) {
    const table = parentNode(re.editor, 'table');
    if (!table || !table.node.firstChild) {
        return false;
    }

    let result = true;
    table.node.firstChild.forEach((cell) => {
        result = result && cell.type.name === 'tableHeader';
    });

    return result;
}

/**
 * tableMenuItem builds a menu item that runs a table command when it is allowed.
 */
function tableMenuItem(re, label, command) {
    return {
        label: re.trans(label),
        disabled: !re.editor.can()[command](),
        run: () => re.editor.chain().focus()[command]().run()
    };
}

export const tableButtons = {
    tableHeader: {
        label: 'tableHeader',
        isActive: (re) => hasHeaderRow(re),
        run: (re) => re.editor.chain().focus().toggleHeaderRow().run()
    },

    tableRows: {
        label: 'tableRows',
        menu: (re) => [
            tableMenuItem(re, 'tableRowAbove', 'addRowBefore'),
            tableMenuItem(re, 'tableRowBelow', 'addRowAfter'),
            tableMenuItem(re, 'tableRowDelete', 'deleteRow')
        ]
    },

    tableColumns: {
        label: 'tableColumns',
        menu: (re) => [
            tableMenuItem(re, 'tableColumnBefore', 'addColumnBefore'),
            tableMenuItem(re, 'tableColumnAfter', 'addColumnAfter'),
            tableMenuItem(re, 'tableColumnDelete', 'deleteColumn')
        ]
    },

    tableCells: {
        label: 'tableCells',
        menu: (re) => [
            tableMenuItem(re, 'tableCellsMerge', 'mergeCells'),
            tableMenuItem(re, 'tableCellsSplit', 'splitCell')
        ]
    },

    tableStyle: {
        label: 'tableStyle',
        checkable: true,
        isDisabled: (re) => !Object.keys(re.options.tableStyles).length,
        menu: (re) => {
            const table = parentNode(re.editor, 'table');
            const current = table ? table.node.attrs.class : null;

            return Object.keys(re.options.tableStyles).map((className) => ({
                label: re.options.tableStyles[className],
                active: hasClass(current, className),
                run: () => re.editor.chain().focus().command(({ tr }) => {
                    const target = parentNode(re.editor, 'table');
                    if (!target) {
                        return false;
                    }

                    tr.setNodeMarkup(target.pos, undefined, {
                        ...target.node.attrs,
                        class: toggleClass(target.node.attrs.class, className)
                    });

                    return true;
                }).run()
            }));
        }
    },

    tableCellStyle: {
        label: 'tableCellStyle',
        checkable: true,
        isDisabled: (re) => !Object.keys(re.options.tableCellStyles).length,
        menu: (re) => {
            const cell = currentCell(re);
            const current = cell ? cell.node.attrs.class : null;

            return Object.keys(re.options.tableCellStyles).map((className) => ({
                label: re.options.tableCellStyles[className],
                active: hasClass(current, className),
                run: () => re.editor.chain().focus()
                    .setCellAttribute('class', toggleClass(current, className))
                    .run()
            }));
        }
    },

    tableRemove: {
        label: 'tableRemove',
        run: (re) => re.editor.chain().focus().deleteTable().run()
    }
};
