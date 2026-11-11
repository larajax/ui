import { cleanClassName, splitClasses, titleFromUrl, parseList } from './utils.js';

/**
 * Attributes that editors add at runtime, never part of saved content.
 */
const RUNTIME_ATTRIBUTES = ['contenteditable', 'draggable', 'tabindex', 'data-ui-block', 'spellcheck'];

/**
 * Blocks lifted out of paragraphs.
 */
const LIFTED_TAGS = new Set([
    'FIGURE', 'IFRAME', 'TABLE', 'UL', 'OL', 'BLOCKQUOTE', 'HR', 'PRE', 'DIV',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6'
]);

/**
 * Blocks whose final line break is removed.
 */
const TRAILING_BREAK_TAGS = new Set([
    'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'TH', 'DIV', 'BLOCKQUOTE'
]);

/**
 * Froala classes and their replacements; null drops an unstyled class.
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
 * normalizeHtml repairs incoming markup before the schema parses it.
 */
export function normalizeHtml(html, options = {}) {
    if (typeof html !== 'string' || !html.trim()) {
        return '';
    }

    const template = document.createElement('template');
    template.innerHTML = html;
    const root = template.content;

    const removeTags = parseList(options.removeTags);
    if (removeTags.length) {
        removeElements(root, removeTags.join(','));
    }

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
 * unwrapImageCaptions flattens Froala captions, keeping their text.
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
 * convertMediaElements turns video and audio tags into media figures.
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
 * cleanRuntimeArtifacts strips editor state attributes and classes.
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
 * renameLegacyClasses swaps Froala classes for their oc- names.
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
 * liftBlocksFromParagraphs splits paragraphs around nested blocks.
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
 * convertPreformattedBreaks turns pre line breaks into newlines.
 */
function convertPreformattedBreaks(root) {
    root.querySelectorAll('pre br').forEach((element) => {
        element.replaceWith(document.createTextNode('\n'));
    });
}

/**
 * removeTrailingBreaks drops a block's final line break.
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
