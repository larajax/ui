/**
 * Elements from office documents and web pages that never carry content.
 */
const REMOVED_ELEMENTS = 'style, meta, link, title, script, xml, template';

/**
 * Block elements, which keep only their alignment from pasted styles.
 */
const BLOCK_TAGS = new Set([
    'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DD', 'DIV', 'DL', 'DT', 'FIGCAPTION', 'FIGURE',
    'FOOTER', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'LI', 'MAIN', 'NAV', 'OL', 'P', 'PRE',
    'SECTION', 'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'UL'
]);

/**
 * Inline style properties that carry bold, italic, underline and sub or superscript, which
 * the schema turns into clean marks.
 */
const INLINE_PROPERTIES = ['font-weight', 'font-style', 'text-decoration', 'text-decoration-line', 'vertical-align'];

/**
 * isBoldWeight checks a font weight is heavy enough to count as bold.
 */
function isBoldWeight(value) {
    return /^(bold|bolder|[6-9]\d\d)$/.test(String(value).trim());
}

/**
 * keptProperties returns the style properties kept for a pasted element.
 */
function keptProperties(element) {
    if (element.tagName === 'IMG') {
        return ['width', 'height'];
    }

    if (BLOCK_TAGS.has(element.tagName)) {
        return ['text-align'];
    }

    return INLINE_PROPERTIES;
}

/**
 * unwrapNeutralFormatting removes bold and italic tags whose own style cancels them, such as
 * the normal weight bold wrapper Google Docs puts around copied content.
 */
function unwrapNeutralFormatting(root) {
    root.querySelectorAll('b, strong').forEach((element) => {
        const weight = element.style.getPropertyValue('font-weight');
        if (weight && !isBoldWeight(weight)) {
            element.replaceWith(...element.childNodes);
        }
    });

    root.querySelectorAll('i, em').forEach((element) => {
        if (element.style.getPropertyValue('font-style') === 'normal') {
            element.replaceWith(...element.childNodes);
        }
    });
}

/**
 * cleanPastedHtml strips classes, ids and presentational styles from content pasted from
 * other applications, while copy and paste within the editor is left untouched.
 */
export function cleanPastedHtml(html) {
    if (typeof html !== 'string' || html.includes('data-pm-slice')) {
        return html;
    }

    const template = document.createElement('template');
    template.innerHTML = html;

    template.content.querySelectorAll(REMOVED_ELEMENTS).forEach((element) => element.remove());
    unwrapNeutralFormatting(template.content);

    template.content.querySelectorAll('*').forEach((element) => {
        element.removeAttribute('class');
        element.removeAttribute('id');
        element.removeAttribute('lang');
        element.removeAttribute('dir');

        if (!element.hasAttribute('style')) {
            return;
        }

        const kept = keptProperties(element)
            .map((name) => [name, element.style.getPropertyValue(name)])
            .filter(([name, value]) => value && (name !== 'font-weight' || isBoldWeight(value) || /^(normal|400)$/.test(value)))
            .map(([name, value]) => name + ': ' + value);

        if (kept.length) {
            element.setAttribute('style', kept.join('; '));
        }
        else {
            element.removeAttribute('style');
        }
    });

    return template.innerHTML;
}
