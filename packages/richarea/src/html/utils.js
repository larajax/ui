/**
 * Runtime editor classes, never saved.
 */
export const RUNTIME_CLASSES = [
    'fr-draggable',
    'fr-dragging',
    'fr-active',
    'fr-uploading',
    'fr-error',
    'fr-deletable',
    'fr-marker',
    'ProseMirror-selectednode',
    'inspector-open',
    'loading',
    'has-error'
];

/**
 * cleanClassName strips runtime classes, null when none remain.
 */
export function cleanClassName(value, extraClasses = []) {
    if (typeof value !== 'string') {
        return null;
    }

    const result = value
        .split(/\s+/)
        .filter((name) => name && !RUNTIME_CLASSES.includes(name) && !extraClasses.includes(name));

    return result.length ? result.join(' ') : null;
}

/**
 * hasClass checks a space separated class attribute for a class name.
 */
export function hasClass(value, className) {
    return typeof value === 'string' && value.split(/\s+/).includes(className);
}

/**
 * toggleClass adds or removes a class in a class attribute.
 */
export function toggleClass(value, className, force) {
    const classes = typeof value === 'string' ? value.split(/\s+/).filter(Boolean) : [];
    const index = classes.indexOf(className);
    const shouldAdd = force === undefined ? index === -1 : force;

    if (shouldAdd && index === -1) {
        classes.push(className);
    }
    else if (!shouldAdd && index !== -1) {
        classes.splice(index, 1);
    }

    return classes.length ? classes.join(' ') : null;
}

/**
 * replaceClasses swaps one set of classes for another.
 */
export function replaceClasses(value, removeClasses, addClasses) {
    const remove = splitClasses(removeClasses);
    const classes = splitClasses(value).filter((name) => !remove.includes(name));

    splitClasses(addClasses).forEach((name) => {
        if (!classes.includes(name)) {
            classes.push(name);
        }
    });

    return classes.length ? classes.join(' ') : null;
}

/**
 * splitClasses turns a class string or array into a clean array.
 */
export function splitClasses(value) {
    if (Array.isArray(value)) {
        return value.flatMap(splitClasses);
    }

    return typeof value === 'string' ? value.split(/\s+/).filter(Boolean) : [];
}

/**
 * isSafeUrl rejects script URLs, optionally allowing data images.
 */
export function isSafeUrl(url, allowDataImages = false) {
    if (typeof url !== 'string' || !url.trim()) {
        return false;
    }

    // eslint-disable-next-line no-control-regex
    const normalized = url.replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase();

    if (normalized.startsWith('javascript:') || normalized.startsWith('vbscript:')) {
        return false;
    }

    if (normalized.startsWith('data:')) {
        return allowDataImages && /^data:image\/(png|gif|jpe?g|webp|avif);/.test(normalized);
    }

    return true;
}

/**
 * isRemoteUrl checks for an absolute http address, as frames need.
 */
export function isRemoteUrl(url) {
    return typeof url === 'string' && /^(https?:)?\/\//i.test(url.trim());
}

/**
 * titleFromUrl returns a URL's decoded last path segment.
 */
export function titleFromUrl(url) {
    const parts = String(url).split('?')[0].split('/');

    for (let index = parts.length - 1; index >= 0; index--) {
        if (parts[index].length) {
            try {
                return decodeURIComponent(parts[index]);
            }
            catch (error) {
                return parts[index];
            }
        }
    }

    return String(url);
}

/**
 * parseList reads a list option as an array or comma separated text.
 */
export function parseList(value) {
    if (!value) {
        return [];
    }

    const items = Array.isArray(value) ? value : String(value).split(',');

    return items.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
}
