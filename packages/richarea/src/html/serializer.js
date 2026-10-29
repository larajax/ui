import { DOMSerializer } from '@tiptap/pm/model';

/**
 * serializeDocument renders a document to HTML and tidies the structural wrappers the
 * schema needs internally but saved content does not.
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
 * isEmptyDocument checks for a single empty paragraph without attributes.
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
 * tidyHtml applies the output conventions to a rendered container element.
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
 * unwrapListParagraphs turns a list item's leading paragraph back into plain inline content
 * when only nested lists follow it.
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
 * unwrapCellParagraphs removes the paragraph wrapper from table cells with a single paragraph.
 */
function unwrapCellParagraphs(container) {
    container.querySelectorAll('td, th').forEach((cell) => {
        if (cell.childNodes.length === 1 && isPlainParagraph(cell.firstChild)) {
            cell.firstChild.replaceWith(...cell.firstChild.childNodes);
        }
    });
}

/**
 * doubleTrailingBreaks adds a second line break to blocks ending in one, since browsers
 * ignore a final line break and the empty line shown in the editor would be lost.
 */
function doubleTrailingBreaks(container) {
    container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th').forEach((block) => {
        if (block.lastChild && block.lastChild.nodeName === 'BR') {
            block.appendChild(document.createElement('br'));
        }
    });
}

/**
 * fillEmptyParagraphs adds a line break to empty paragraphs so they keep their height when
 * rendered, matching what authors see in the editor.
 */
function fillEmptyParagraphs(container) {
    container.querySelectorAll('p').forEach((paragraph) => {
        if (!paragraph.childNodes.length) {
            paragraph.appendChild(document.createElement('br'));
        }
    });
}

/**
 * preserveSpaces alternates repeated spaces with non-breaking spaces outside preformatted
 * blocks, so spacing typed in the editor is not collapsed when rendered.
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
 * wrapHeaderRows moves leading rows made entirely of header cells into a thead element.
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
 * unwrapSingleParagraph returns bare inline content when line break mode produced one paragraph.
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
