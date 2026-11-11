import { DOMSerializer } from '@tiptap/pm/model';

/**
 * serializeDocument renders a document to tidy HTML.
 */
export function serializeDocument(doc, schema, options = {}) {
    if (isEmptyDocument(doc)) {
        return '';
    }

    const container = document.createElement('div');
    container.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document }));

    tidyHtml(container, options);

    return container.innerHTML;
}

/**
 * isEmptyDocument checks for one empty, attribute-free paragraph.
 */
export function isEmptyDocument(doc) {
    if (doc.childCount !== 1) {
        return false;
    }

    const node = doc.firstChild;
    if (node.type.name !== 'paragraph' || node.content.size !== 0) {
        return false;
    }

    return !Object.keys(node.attrs).some((name) => {
        const value = node.attrs[name];
        return value !== null && value !== undefined && value !== node.type.spec.attrs?.[name]?.default;
    });
}

/**
 * tidyHtml applies the output conventions to a container.
 */
export function tidyHtml(container, options = {}) {
    unwrapListParagraphs(container);
    unwrapCellParagraphs(container);
    doubleTrailingBreaks(container);
    fillEmptyParagraphs(container);
    preserveSpaces(container);
    wrapHeaderRows(container);

    if (options.useLineBreaks) {
        unwrapSingleParagraph(container);
    }
}

/**
 * unwrapListParagraphs unwraps a paragraph before nested lists.
 */
function unwrapListParagraphs(container) {
    container.querySelectorAll('li').forEach((item) => {
        const first = item.firstChild;
        if (!isPlainParagraph(first)) {
            return;
        }

        const rest = Array.from(item.childNodes).slice(1);
        if (!rest.every((node) => node.nodeName === 'UL' || node.nodeName === 'OL')) {
            return;
        }

        first.replaceWith(...first.childNodes);
    });
}

/**
 * unwrapCellParagraphs unwraps lone paragraphs in table cells.
 */
function unwrapCellParagraphs(container) {
    container.querySelectorAll('td, th').forEach((cell) => {
        if (cell.childNodes.length === 1 && isPlainParagraph(cell.firstChild)) {
            cell.firstChild.replaceWith(...cell.firstChild.childNodes);
        }
    });
}

/**
 * doubleTrailingBreaks doubles a final break, which browsers ignore.
 */
function doubleTrailingBreaks(container) {
    container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th').forEach((block) => {
        if (block.lastChild && block.lastChild.nodeName === 'BR') {
            block.appendChild(document.createElement('br'));
        }
    });
}

/**
 * fillEmptyParagraphs adds a break so empty paragraphs keep height.
 */
function fillEmptyParagraphs(container) {
    container.querySelectorAll('p').forEach((paragraph) => {
        if (!paragraph.childNodes.length) {
            paragraph.appendChild(document.createElement('br'));
        }
    });
}

/**
 * preserveSpaces keeps repeated spaces from collapsing outside pre.
 */
function preserveSpaces(container) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node;

    while ((node = walker.nextNode())) {
        if (node.data.includes('  ') && !node.parentElement.closest('pre')) {
            node.data = node.data.replace(/ {2}/g, ' \u00a0');
        }
    }
}

/**
 * wrapHeaderRows moves leading header rows into a thead.
 */
function wrapHeaderRows(container) {
    container.querySelectorAll('table').forEach((table) => {
        const body = table.querySelector(':scope > tbody');
        if (!body) {
            return;
        }

        const headerRows = [];
        for (const row of body.children) {
            const cells = Array.from(row.children);
            if (!cells.length || !cells.every((cell) => cell.nodeName === 'TH')) {
                break;
            }

            headerRows.push(row);
        }

        if (!headerRows.length || headerRows.length === body.children.length) {
            return;
        }

        const head = document.createElement('thead');
        headerRows.forEach((row) => head.appendChild(row));
        table.insertBefore(head, body);
    });
}

/**
 * unwrapSingleParagraph unwraps a lone paragraph in line break mode.
 */
function unwrapSingleParagraph(container) {
    if (container.childNodes.length === 1 && isPlainParagraph(container.firstChild)) {
        const paragraph = container.firstChild;
        const last = paragraph.lastChild;

        if (last && last.nodeName === 'BR' && paragraph.childNodes.length === 1) {
            paragraph.removeChild(last);
        }

        paragraph.replaceWith(...paragraph.childNodes);
    }
}

/**
 * isPlainParagraph checks for a paragraph element without attributes.
 */
function isPlainParagraph(node) {
    return !!node && node.nodeName === 'P' && node.attributes.length === 0;
}
