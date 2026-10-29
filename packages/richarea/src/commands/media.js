import { normalizeHtml } from '../html/normalizer.js';
import { hasClass, isRemoteUrl, isSafeUrl, replaceClasses, splitClasses, titleFromUrl, toggleClass } from '../html/utils.js';
import { selectFiles } from '../ui/dom.js';
import { applyLink, openLinkForm } from './links.js';
import { insertionChain, selectedNode, selectedNodeElement, updateSelectedNode } from './helpers.js';

/**
 * Image alignments mapped to the name of their label and icon.
 */
const IMAGE_ALIGNMENTS = {
    none: 'imageAlignNone',
    left: 'imageAlignLeft',
    center: 'imageAlignCenter',
    right: 'imageAlignRight'
};

/**
 * Classes of the default image alignments, cleared on realignment even when a host configures others.
 */
const DEFAULT_ALIGN_CLASSES = ['oc-dii', 'oc-dib', 'oc-fil', 'oc-fir'];

/**
 * allAlignClasses lists every class used by the image alignment options.
 */
function allAlignClasses(re) {
    return splitClasses(Object.values(re.options.imageAlignClasses)).concat(DEFAULT_ALIGN_CLASSES);
}

/**
 * imageAlignment reads the alignment option matching an image's classes.
 */
function imageAlignment(re, className) {
    const classes = splitClasses(className);
    const alignments = re.options.imageAlignClasses;

    for (const name of ['left', 'right', 'center']) {
        const required = splitClasses(alignments[name]);
        if (required.length && required.every((value) => classes.includes(value))) {
            return name;
        }
    }

    if (classes.includes('oc-fil')) {
        return 'left';
    }

    if (classes.includes('oc-fir')) {
        return 'right';
    }

    if (classes.includes('oc-dib')) {
        return 'center';
    }

    return 'none';
}

/**
 * imageAlignClass returns the class value for an image alignment.
 */
function imageAlignClass(re, currentClass, alignment) {
    return replaceClasses(currentClass, allAlignClasses(re), re.options.imageAlignClasses[alignment] || '');
}

/**
 * insertImages inserts images at the selection, or replaces the source of a selected image.
 */
export function insertImages(re, urls, { replace = false } = {}) {
    if (!urls.length) {
        return;
    }

    if (replace && selectedNode(re.editor, ['image'])) {
        updateSelectedNode(re.editor, { src: urls[0] });
        return;
    }

    const className = imageAlignClass(re, null, re.options.imageDefaultAlign);
    const nodes = urls.map((src) => ({ type: 'image', attrs: { src, class: className } }));

    insertionChain(re.editor).insertContent(nodes).run();
}

/**
 * uploadImages uploads images from the computer with the upload hook and inserts them.
 */
async function uploadImages(re, { replace = false } = {}) {
    const files = await selectFiles({ accept: 'image/*', multiple: !replace, root: re.root });
    await uploadAndInsertImages(re, files, { replace });
}

/**
 * uploadAndInsertImages uploads image files one at a time, inserting each as it completes.
 */
export async function uploadAndInsertImages(re, files, { replace = false } = {}) {
    for (const file of files) {
        try {
            const url = await re.options.hooks.uploadFile(file, { type: 'image' });
            insertImages(re, [url], { replace });
        }
        catch (error) {
            alertUploadFailed(re, error);
        }
    }
}

/**
 * alertUploadFailed reports a failed upload with the reason given by the upload hook.
 */
function alertUploadFailed(re, error) {
    const reason = error && error.message ? error.message : '';
    re.options.hooks.alert(re.trans('uploadFailed') + (reason ? ': ' + reason : ''));
}

/**
 * browseImages picks images with the media picker hook.
 */
function browseImages(re, { replace = false } = {}) {
    re.options.hooks.browseMedia({
        type: 'image',
        onInsert: (items) => {
            items = items || [];

            if (!items.length) {
                re.options.hooks.alert(re.trans('invalidImageEmptyInsert'));
                return false;
            }

            const images = items.filter((item) => item.type === 'image');
            if (!images.length) {
                re.options.hooks.alert(re.trans('invalidImageInvalidInsert'));
                return false;
            }

            insertImages(re, images.map((item) => item.url), { replace });
        }
    });
}

/**
 * promptUrl opens a single address field and passes the valid address to a callback.
 */
function promptUrl(re, anchor, callback, value = '') {
    re.openForm({
        fields: [{ name: 'url', label: re.trans('url'), value, placeholder: 'https://', autofocus: true }],
        submitLabel: re.trans('insert'),
        onSubmit: (values) => {
            if (!values.url) {
                return re.trans('urlRequired');
            }

            if (!isSafeUrl(values.url)) {
                return re.trans('urlInvalid');
            }

            callback(values.url);
        }
    }, anchor);
}

/**
 * promptEmbedCode opens the embedding code field and inserts the frame it contains.
 */
function promptEmbedCode(re, anchor) {
    re.openForm({
        fields: [{ name: 'code', type: 'textarea', label: re.trans('embeddingCode'), placeholder: '<iframe ...', autofocus: true }],
        submitLabel: re.trans('insert'),
        onSubmit: (values) => {
            if (!values.code) {
                return re.trans('embeddingCodeRequired');
            }

            const template = document.createElement('template');
            template.innerHTML = normalizeHtml(values.code);

            const embeds = Array.from(template.content.querySelectorAll('iframe[src], figure[data-video], figure[data-audio]'))
                .filter((element) => element.tagName !== 'IFRAME' || isRemoteUrl(element.getAttribute('src')));

            if (!embeds.length) {
                return re.trans('embeddingCodeInvalid');
            }

            insertionChain(re.editor).insertContent(embeds.map((element) => element.outerHTML).join('')).run();
        }
    }, anchor);
}

/**
 * embedUrlFor converts a YouTube or Vimeo page address into its embeddable frame address.
 */
function embedUrlFor(url) {
    const youtube = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i.exec(url);
    if (youtube) {
        return 'https://www.youtube.com/embed/' + youtube[1];
    }

    const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/i.exec(url);
    if (vimeo) {
        return 'https://player.vimeo.com/video/' + vimeo[1];
    }

    return null;
}

/**
 * insertMedia inserts a video or audio figure, or a frame for known video hosts.
 */
function insertMedia(re, type, url, label) {
    const embedUrl = type === 'video' ? embedUrlFor(url) : null;

    if (embedUrl) {
        insertionChain(re.editor).insertIframe({
            src: embedUrl,
            width: '640',
            height: '360',
            frameborder: '0',
            allowfullscreen: true
        }).run();
        return;
    }

    insertionChain(re.editor).insertMediaFigure({ type, src: url, label: label || titleFromUrl(url) }).run();
}

/**
 * browseSingleFile picks one file with the media picker hook, alerting when nothing or more
 * than one was chosen.
 */
function browseSingleFile(re, type, callback) {
    re.options.hooks.browseMedia({
        type,
        onInsert: (items) => {
            items = items || [];

            if (!items.length) {
                re.options.hooks.alert(re.trans('invalidFileEmptyInsert'));
                return false;
            }

            if (items.length > 1) {
                re.options.hooks.alert(re.trans('invalidFileSingleInsert'));
                return false;
            }

            return callback(items[0]);
        }
    });
}

/**
 * browseMedia picks a single video or audio file with the media picker hook.
 */
function browseMedia(re, type) {
    browseSingleFile(re, type, (item) => {
        if (item.type !== type) {
            re.options.hooks.alert(re.trans(type === 'audio' ? 'invalidAudioInvalidInsert' : 'invalidVideoInvalidInsert'));
            return false;
        }

        insertMedia(re, type, item.url, item.title);
    });
}

/**
 * insertFileLink links the selection, or a new title, to a file with the file link class.
 */
function insertFileLink(re, url, title) {
    applyLink(re, url, { fallbackText: title || titleFromUrl(url), className: 'oc-file' });
}

/**
 * mediaMenu builds the shared upload, browse and address menu for insert buttons.
 */
function mediaMenu(re, handlers) {
    const items = [];
    const item = (name, run) => ({ label: re.trans(name), icon: re.options.icons[name], run });

    if (handlers.embed) {
        items.push(item('embeddingCode', handlers.embed));
    }

    if (handlers.upload && re.options.hooks.uploadFile) {
        items.push(item('uploadFromComputer', handlers.upload));
    }

    if (handlers.browse && re.options.hooks.browseMedia) {
        items.push(item('browse', handlers.browse));
    }

    items.push(item('byUrl', handlers.url));

    return items;
}

/**
 * tablePanel renders the grid used to choose the size of a new table.
 */
function tablePanel(re, close) {
    const size = 10;
    const panel = document.createElement('div');
    const grid = document.createElement('div');
    const label = document.createElement('div');

    panel.className = 'rich-editor-table-picker';
    grid.className = 'rich-editor-table-grid';
    label.className = 'rich-editor-table-label';
    label.textContent = '1 × 1';

    const highlight = (rows, cols) => {
        grid.querySelectorAll('button').forEach((cell) => {
            cell.classList.toggle('is-active', +cell.dataset.row <= rows && +cell.dataset.col <= cols);
        });
        label.textContent = rows + ' × ' + cols;
    };

    for (let row = 1; row <= size; row++) {
        for (let col = 1; col <= size; col++) {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.setAttribute('aria-label', row + ' ' + re.trans('rows') + ', ' + col + ' ' + re.trans('columns'));
            cell.addEventListener('mousedown', (event) => event.preventDefault());
            cell.addEventListener('mouseenter', () => highlight(row, col));
            cell.addEventListener('focus', () => highlight(row, col));
            cell.addEventListener('click', () => {
                insertionChain(re.editor).insertTable({ rows: row, cols: col, withHeaderRow: false }).run();
                close();
            });
            grid.appendChild(cell);
        }
    }

    highlight(1, 1);
    panel.append(grid, label);

    return panel;
}

export const mediaButtons = {
    insertImage: {
        label: 'insertImage',
        menu: (re) => mediaMenu(re, {
            upload: () => uploadImages(re),
            browse: () => browseImages(re),
            url: (context) => promptUrl(re, context.anchor, (url) => insertImages(re, [url]))
        })
    },

    insertVideo: {
        label: 'insertVideo',
        menu: (re) => mediaMenu(re, {
            embed: (context) => promptEmbedCode(re, context.anchor),
            browse: () => browseMedia(re, 'video'),
            url: (context) => promptUrl(re, context.anchor, (url) => insertMedia(re, 'video', url))
        })
    },

    insertAudio: {
        label: 'insertAudio',
        menu: (re) => mediaMenu(re, {
            embed: (context) => promptEmbedCode(re, context.anchor),
            browse: () => browseMedia(re, 'audio'),
            url: (context) => promptUrl(re, context.anchor, (url) => insertMedia(re, 'audio', url))
        })
    },

    insertFile: {
        label: 'insertFile',
        menu: (re) => mediaMenu(re, {
            upload: async () => {
                const files = await selectFiles({ root: re.root });
                for (const file of files) {
                    try {
                        insertFileLink(re, await re.options.hooks.uploadFile(file, { type: 'file' }), file.name);
                    }
                    catch (error) {
                        alertUploadFailed(re, error);
                    }
                }
            },
            browse: () => browseSingleFile(re, 'file', (item) => {
                insertFileLink(re, item.url, item.title);
            }),
            url: (context) => promptUrl(re, context.anchor, (url) => insertFileLink(re, url))
        })
    },

    insertTable: {
        label: 'insertTable',
        isDisabled: (re) => re.editor.isActive('table'),
        panel: tablePanel
    },

    insertSnippet: {
        label: 'insertSnippet',
        isDisabled: (re) => !re.options.hooks.browseSnippets,
        run: (re) => re.options.hooks.browseSnippets({
            onInsert: (html) => insertionChain(re.editor).insertContent(html).run()
        })
    },

    imageReplace: {
        label: 'imageReplace',
        menu: (re) => mediaMenu(re, {
            upload: () => uploadImages(re, { replace: true }),
            browse: () => browseImages(re, { replace: true }),
            url: (context) => promptUrl(re, context.anchor, (url) => insertImages(re, [url], { replace: true }), re.editor.getAttributes('image').src)
        })
    },

    imageAlign: {
        label: 'imageAlign',
        getIcon: (re) => re.options.icons[IMAGE_ALIGNMENTS[imageAlignment(re, re.editor.getAttributes('image').class)]],
        checkable: true,
        menu: (re) => {
            const currentClass = re.editor.getAttributes('image').class;
            const current = imageAlignment(re, currentClass);

            return Object.keys(IMAGE_ALIGNMENTS).map((value) => ({
                label: re.trans(IMAGE_ALIGNMENTS[value]),
                icon: re.options.icons[IMAGE_ALIGNMENTS[value]],
                active: current === value,
                run: () => updateSelectedNode(re.editor, {
                    class: imageAlignClass(re, currentClass, value)
                })
            }));
        }
    },

    imageStyle: {
        label: 'imageStyle',
        checkable: true,
        isDisabled: (re) => !Object.keys(re.options.imageStyles).length,
        menu: (re) => {
            const current = re.editor.getAttributes('image').class;

            return Object.keys(re.options.imageStyles).map((className) => ({
                label: re.options.imageStyles[className],
                active: hasClass(current, className),
                run: () => updateSelectedNode(re.editor, {
                    class: toggleClass(current, className)
                })
            }));
        }
    },

    imageAlt: {
        label: 'imageAlt',
        run: (re, context) => re.openForm({
            fields: [{ name: 'alt', label: re.trans('alternativeText'), value: re.editor.getAttributes('image').alt || '', autofocus: true }],
            submitLabel: re.trans('update'),
            onSubmit: (values) => {
                updateSelectedNode(re.editor, { alt: values.alt });
            }
        }, context.anchor)
    },

    imageSize: {
        label: 'imageSize',
        run: (re, context) => re.openForm({
            fields: [{ name: 'width', label: re.trans('width'), value: String(re.editor.getAttributes('image').width || '').replace(/px$/, ''), placeholder: re.trans('widthPlaceholder'), autofocus: true }],
            submitLabel: re.trans('update'),
            onSubmit: (values) => {
                const width = values.width.replace(/px$/, '').trim();
                if (width && !/^\d+(\.\d+)?%?$/.test(width)) {
                    return re.trans('widthInvalid');
                }

                const value = !width ? null : (width.endsWith('%') ? width : Math.round(parseFloat(width)) + 'px');
                updateSelectedNode(re.editor, { width: value, height: null });
            }
        }, context.anchor)
    },

    imageLink: {
        label: 'imageLink',
        isActive: (re) => re.editor.isActive('link'),
        run: (re, context) => openLinkForm(re, context.anchor)
    },

    snippetProperties: {
        label: 'snippetProperties',
        isDisabled: (re) => !re.options.hooks.editSnippet,
        run: (re) => {
            const element = selectedNodeElement(re.editor);
            if (element) {
                re.options.hooks.editSnippet(element);
            }
        }
    },

    nodeRemove: {
        label: 'remove',
        run: (re) => re.editor.chain().focus().deleteSelection().run()
    }
};
