/**
 * Elements placed on their own line in the formatted source.
 */
const BLOCK_TAGS = new Set([
    'ADDRESS', 'ARTICLE', 'ASIDE', 'AUDIO', 'BLOCKQUOTE', 'DD', 'DIV', 'DL', 'DT', 'FIGCAPTION',
    'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HR', 'IFRAME',
    'LI', 'MAIN', 'NAV', 'OL', 'P', 'PRE', 'SECTION', 'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH',
    'THEAD', 'TR', 'UL', 'VIDEO'
]);

const INDENT = '    ';

/**
 * formatHtml pretty prints editor HTML for the source view, one block per line with nested
 * blocks indented and inline content left untouched.
 */
export function formatHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html || '';

    const lines = [];
    formatChildren(template.content, 0, lines);

    return lines.join('\n');
}

/**
 * formatChildren writes child nodes, grouping inline runs onto a single line.
 */
function formatChildren(parent, depth, lines) {
    let inline = '';

    const flush = () => {
        const text = inline.trim();
        if (text) {
            lines.push(INDENT.repeat(depth) + text);
        }

        inline = '';
    };

    parent.childNodes.forEach((node) => {
        if (isBlock(node)) {
            flush();
            formatBlock(node, depth, lines);
        }
        else {
            inline += nodeToHtml(node);
        }
    });

    flush();
}

/**
 * formatBlock writes a block element, expanding it only when it contains other blocks.
 */
function formatBlock(element, depth, lines) {
    const hasBlockChildren = Array.from(element.childNodes).some(isBlock);

    if (element.tagName === 'PRE' || !hasBlockChildren) {
        lines.push(INDENT.repeat(depth) + element.outerHTML);
        return;
    }

    const shell = element.cloneNode(false).outerHTML;
    const closeIndex = shell.lastIndexOf('</');

    lines.push(INDENT.repeat(depth) + shell.slice(0, closeIndex));
    formatChildren(element, depth + 1, lines);
    lines.push(INDENT.repeat(depth) + shell.slice(closeIndex));
}

/**
 * isBlock checks for an element placed on its own line.
 */
function isBlock(node) {
    return node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has(node.tagName);
}

/**
 * nodeToHtml serializes an inline node, escaping text content.
 */
function nodeToHtml(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        return node.outerHTML;
    }

    if (node.nodeType === Node.TEXT_NODE) {
        const holder = document.createElement('span');
        holder.appendChild(node.cloneNode());
        return holder.innerHTML.replace(/\s+/g, ' ');
    }

    return '';
}
