import { cleanClassName, splitClasses, titleFromUrl } from './utils.js';

/**
 * Attributes that editors add at runtime, never part of saved content.
 */
const RUNTIME_ATTRIBUTES = ['contenteditable', 'draggable', 'tabindex', 'data-ui-block', 'spellcheck'];

/**
 * Block elements that cannot live inside a paragraph and are lifted out of it.
 */
const LIFTED_TAGS = new Set([
    'FIGURE', 'IFRAME', 'TABLE', 'UL', 'OL', 'BLOCKQUOTE', 'HR', 'PRE', 'DIV',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6'
]);

/**
 * Block elements where a final line break is ignored by browsers and removed.
 */
const TRAILING_BREAK_TAGS = new Set([
    'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'TH', 'DIV', 'BLOCKQUOTE'
]);

/**
 * Froala classes in older content and the classes that replace them, where null drops a class
 * that carries no styling.
 */
const LEGACY_CLASSES = new Map([
    ['fr-dib', 'oc-dib'],
    ['fr-dii', 'oc-dii'],
    ['fr-fil', 'oc-fil'],
    ['fr-fir', 'oc-fir'],
    ['fr-fic', null],
    ['fr-file', 'oc-file']
]);

/**
 * normalizeHtml repairs incoming markup before the schema parses it, covering Froala era
 * wrappers and editor artifacts that would otherwise be dropped or misread.
 */
export function normalizeHtml(html) {
    if (typeof html !== 'string' || !html.trim()) {
        return '';
    }

    const template = document.createElement('template');
    template.innerHTML = html;
    const root = template.content;

    removeElements(root, 'span.fr-marker');
    unwrapElements(root, 'span.fr-video, span.fr-emoticon');
    unwrapImageCaptions(root);
    convertMediaElements(root);
    cleanRuntimeArtifacts(root);
    renameLegacyClasses(root);
    liftBlocksFromParagraphs(root);
    convertPreformattedBreaks(root);
    removeTrailingBreaks(root);

    return template.innerHTML;
}

/**
 * removeElements deletes every element matching the selector.
 */
function removeElements(root, selector) {
    root.querySelectorAll(selector).forEach((element) => element.remove());
}

/**
 * unwrapElements replaces matching elements with their children.
 */
function unwrapElements(root, selector) {
    root.querySelectorAll(selector).forEach((element) => {
        element.replaceWith(...element.childNodes);
    });
}

/**
 * unwrapImageCaptions flattens the Froala caption wrapper, moving its display classes to the
 * image and keeping the caption as text so no content is lost.
 */
function unwrapImageCaptions(root) {
    root.querySelectorAll('span.fr-img-caption').forEach((wrapper) => {
        const image = wrapper.querySelector('img');
        if (!image) {
            wrapper.replaceWith(...wrapper.childNodes);
            return;
        }

        const wrapperClasses = cleanClassName(wrapper.className, ['fr-img-caption']);
        if (wrapperClasses) {
            image.className = [image.className, wrapperClasses].filter(Boolean).join(' ');
        }

        const caption = wrapper.querySelector('.fr-inner');
        const nodes = [image];
        if (caption && caption.textContent.trim()) {
            nodes.push(document.createTextNode(caption.textContent.trim()));
        }

        wrapper.replaceWith(...nodes);
    });
}

/**
 * convertMediaElements turns native video and audio tags into media figures, the same
 * markup the server renders back into players.
 */
function convertMediaElements(root) {
    root.querySelectorAll('video[src], audio[src]').forEach((element) => {
        const type = element.tagName.toLowerCase();
        const src = element.getAttribute('src');
        const figure = document.createElement('figure');

        figure.setAttribute('data-' + type, src);
        figure.setAttribute('data-label', element.getAttribute('title') || titleFromUrl(src));
        figure.textContent = '\u00a0';

        element.replaceWith(figure);
    });
}

/**
 * cleanRuntimeArtifacts strips editor state attributes and classes from every element.
 */
function cleanRuntimeArtifacts(root) {
    root.querySelectorAll('*').forEach((element) => {
        RUNTIME_ATTRIBUTES.forEach((name) => element.removeAttribute(name));

        if (element.hasAttribute('class')) {
            const className = cleanClassName(element.getAttribute('class'));
            if (className) {
                element.setAttribute('class', className);
            }
            else {
                element.removeAttribute('class');
            }
        }
    });
}

/**
 * renameLegacyClasses swaps the Froala image and file classes for their oc- names.
 */
function renameLegacyClasses(root) {
    root.querySelectorAll('[class*="fr-"]').forEach((element) => {
        const classes = splitClasses(element.getAttribute('class'))
            .map((name) => (LEGACY_CLASSES.has(name) ? LEGACY_CLASSES.get(name) : name))
            .filter(Boolean);

        if (classes.length) {
            element.setAttribute('class', Array.from(new Set(classes)).join(' '));
        }
        else {
            element.removeAttribute('class');
        }
    });
}

/**
 * liftBlocksFromParagraphs splits paragraphs around nested block elements, so the parser
 * does not leave empty paragraphs behind.
 */
function liftBlocksFromParagraphs(root) {
    root.querySelectorAll('p').forEach((paragraph) => {
        const hasBlocks = Array.from(paragraph.children).some((child) => LIFTED_TAGS.has(child.tagName));
        if (!hasBlocks) {
            return;
        }

        const result = [];
        let current = null;

        Array.from(paragraph.childNodes).forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && LIFTED_TAGS.has(node.tagName)) {
                current = null;
                result.push(node);
                return;
            }

            if (!current) {
                current = paragraph.cloneNode(false);
                result.push(current);
            }

            current.appendChild(node);
        });

        const kept = result.filter((node) => node.tagName !== 'P' || !isBlankParagraph(node));
        paragraph.replaceWith(...kept);
    });
}

/**
 * isBlankParagraph checks a paragraph for no visible content.
 */
function isBlankParagraph(paragraph) {
    return !paragraph.querySelector('img, br, span[data-snippet]') && !paragraph.textContent.replace(/\u00a0/g, ' ').trim();
}

/**
 * convertPreformattedBreaks turns line breaks inside preformatted blocks into newlines.
 */
function convertPreformattedBreaks(root) {
    root.querySelectorAll('pre br').forEach((element) => {
        element.replaceWith(document.createTextNode('\n'));
    });
}

/**
 * removeTrailingBreaks drops the final line break of a block, which browsers ignore but the
 * editor would render as an extra empty line.
 */
function removeTrailingBreaks(root) {
    root.querySelectorAll('br').forEach((element) => {
        const parent = element.parentElement;
        if (!parent || !TRAILING_BREAK_TAGS.has(parent.tagName)) {
            return;
        }

        let next = element.nextSibling;
        while (next && next.nodeType === Node.TEXT_NODE && !next.textContent.trim()) {
            next = next.nextSibling;
        }

        if (!next) {
            element.remove();
        }
    });
}
