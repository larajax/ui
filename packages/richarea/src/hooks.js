/**
 * Host hooks connect the editor to the pickers, uploads and messages of the page it runs on.
 * Each one is optional, and without it the editor hides or falls back for the feature it powers.
 *
 * - uploadFile(file, { type }) resolves with the public URL of the stored file, where type is
 *   'image' for inserted, pasted or dropped images and 'file' for file links, enabling the upload
 *   menu items and pasted or dropped images
 * - browseMedia({ type, onInsert }) opens a picker for 'image', 'video', 'audio' or 'file',
 *   calling onInsert with [{ url, title, type }], where returning false keeps the picker open
 * - browseLinks({ value, onInsert }) opens a link picker, calling onInsert with { url, title }
 * - resolveLink(href) turns a stored link into an address the browser can open
 * - browseSnippets({ onInsert }) opens a snippet picker, calling onInsert with the snippet markup
 * - mountSnippet(element, { changed, opened, closed }) prepares a snippet element for editing,
 *   calling changed after its attributes change and opened or closed around its properties
 *   panel, and returns a function that releases it
 * - editSnippet(element) opens the properties of a snippet, returning false when it cannot
 * - alert(message) shows an error message
 * - tooltip(label, shortcut) returns the attributes that give a button its hover hint
 */
export const defaultHooks = {
    uploadFile: null,
    browseMedia: null,
    browseLinks: null,
    resolveLink: null,
    browseSnippets: null,
    mountSnippet: null,
    editSnippet: null,

    alert(message) {
        window.alert(message);
    },

    tooltip(label, shortcut) {
        return { title: shortcut ? label + ' (' + shortcut + ')' : label };
    }
};

/**
 * makeHooks merges host hooks over the defaults, ignoring anything that is not a function.
 */
export function makeHooks(hooks) {
    const result = { ...defaultHooks };

    Object.keys(hooks || {}).forEach((name) => {
        if (typeof hooks[name] === 'function') {
            result[name] = hooks[name];
        }
    });

    return result;
}
