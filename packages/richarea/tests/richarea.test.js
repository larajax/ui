import { afterEach, describe, expect, test } from 'bun:test';
import { RichArea } from '../src/richarea.js';
import { isSnippetEditing } from '../src/extensions/snippet.js';
import { defaultIcons } from '../src/icons.js';
import { defaultLang } from '../src/lang.js';
import { createForm } from '../src/ui/form.js';

const editors = [];

function mount(options = {}) {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const richArea = new RichArea(element, options);
    editors.push(richArea);

    return richArea;
}

function menuLabels(richArea, code) {
    return richArea.getButtonDefinition(code).menu(richArea).map((item) => item.label);
}

afterEach(() => {
    editors.splice(0).forEach((richArea) => richArea.destroy());
    document.body.innerHTML = '';
});

describe('mounting', () => {
    test('builds the toolbar and document inside the host element', () => {
        const richArea = mount({ content: '<p>Hello</p>' });

        expect(richArea.root.querySelector('.rich-editor-toolbar [data-cmd="bold"]')).not.toBeNull();
        expect(richArea.root.querySelector('.rich-editor-document .rich-editor-content')).not.toBeNull();
        expect(richArea.getContent()).toBe('<p>Hello</p>');
    });

    test('opens floating panels inside an enclosing dialog, outside the inert page', () => {
        const dialog = document.createElement('dialog');
        document.body.appendChild(dialog);
        dialog.showModal();

        const element = document.createElement('div');
        dialog.appendChild(element);
        const richArea = new RichArea(element, { content: '<p>Hello</p>' });
        editors.push(richArea);

        const panel = document.createElement('div');
        richArea.floating.open(panel, richArea.root);

        expect(panel.parentElement).toBe(dialog);
    });

    test('opens floating panels on the body outside a dialog', () => {
        const richArea = mount({ content: '<p>Hello</p>' });

        const panel = document.createElement('div');
        richArea.floating.open(panel, richArea.root);

        expect(panel.parentElement).toBe(document.body);
    });

    test('fires change with the new content', () => {
        const richArea = mount({ content: '<p>Hello</p>' });
        const changes = [];
        richArea.on('change', (html) => changes.push(html));

        richArea.setContent('<p>World</p>', { emitChange: true });

        expect(changes).toEqual(['<p>World</p>']);
    });
});

describe('without hooks', () => {
    test('offers only the address option for images', () => {
        const richArea = mount();

        expect(menuLabels(richArea, 'insertImage')).toEqual([richArea.trans('byUrl')]);
    });

    test('disables the snippet buttons', () => {
        const richArea = mount();

        expect(richArea.isButtonDisabled(richArea.getButtonDefinition('insertSnippet'))).toBe(true);
        expect(richArea.isButtonDisabled(richArea.getButtonDefinition('snippetProperties'))).toBe(true);
    });

    test('leaves pasted images to the browser', () => {
        const richArea = mount();
        const file = new File(['x'], 'photo.png', { type: 'image/png' });

        expect(richArea.onPasteFiles({ clipboardData: { files: [file] }, preventDefault() {} })).toBe(false);
    });

    test('uses a native title for button hints', () => {
        const richArea = mount();
        const button = richArea.root.querySelector('[data-cmd="bold"]');

        expect(button.getAttribute('title')).toContain(richArea.trans('bold'));
        expect(button.hasAttribute('data-tooltip-text')).toBe(false);
    });

    test('drops links with unknown protocols', () => {
        const richArea = mount({ content: '<p><a href="page://about">About</a></p>' });

        expect(richArea.getContent()).toBe('<p>About</p>');
    });
});

describe('with hooks', () => {
    test('offers upload and browse for images', () => {
        const richArea = mount({ hooks: { uploadFile: async () => '', browseMedia: () => {} } });

        expect(menuLabels(richArea, 'insertImage')).toEqual([
            richArea.trans('uploadFromComputer'),
            richArea.trans('browse'),
            richArea.trans('byUrl')
        ]);
    });

    test('inserts images picked with the media picker', () => {
        const calls = [];
        const richArea = mount({ hooks: { browseMedia: (options) => calls.push(options) } });

        const browse = richArea.getButtonDefinition('insertImage').menu(richArea).find((item) => item.label === richArea.trans('browse'));
        browse.run({});

        expect(calls[0].type).toBe('image');
        calls[0].onInsert([{ url: '/media/photo.jpg', title: 'Photo', type: 'image' }]);

        expect(richArea.getContent()).toContain('src="/media/photo.jpg"');
    });

    test('alerts and keeps the picker open when the pick is not an image', () => {
        const alerts = [];
        const calls = [];
        const richArea = mount({
            hooks: {
                browseMedia: (options) => calls.push(options),
                alert: (message) => alerts.push(message)
            }
        });

        richArea.getButtonDefinition('insertImage').menu(richArea).find((item) => item.label === richArea.trans('browse')).run({});

        expect(calls[0].onInsert([{ url: '/media/notes.pdf', type: 'file' }])).toBe(false);
        expect(alerts).toEqual([richArea.trans('invalidImageInvalidInsert')]);
    });

    test('uploads pasted images and inserts the stored address', async () => {
        const uploaded = [];
        const richArea = mount({
            hooks: {
                uploadFile: async (file) => {
                    uploaded.push(file.name);
                    return '/storage/' + file.name;
                }
            }
        });

        const file = new File(['x'], 'photo.png', { type: 'image/png' });
        expect(richArea.onPasteFiles({ clipboardData: { files: [file] }, preventDefault() {} })).toBe(true);

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(uploaded).toEqual(['photo.png']);
        expect(richArea.getContent()).toContain('src="/storage/photo.png"');
    });

    test('keeps links using an extra protocol', () => {
        const richArea = mount({
            content: '<p><a href="page://about">About</a></p>',
            linkProtocols: ['page']
        });

        expect(richArea.getContent()).toBe('<p><a href="page://about">About</a></p>');
    });

    test('opens links through the resolver', () => {
        const opened = [];
        const originalOpen = window.open;
        window.open = (url) => opened.push(url);

        try {
            const richArea = mount({
                content: '<p><a href="page://about">About</a></p>',
                linkProtocols: ['page'],
                hooks: { resolveLink: (href) => href.replace('page://', '/') }
            });

            richArea.editor.commands.setTextSelection(3);
            richArea.getButtonDefinition('linkOpen').run(richArea, {});

            expect(opened).toEqual(['/about']);
        }
        finally {
            window.open = originalOpen;
        }
    });

    test('inserts snippets from the snippet picker', () => {
        const richArea = mount({
            hooks: {
                browseSnippets: ({ onInsert }) => onInsert('<figure data-snippet="banner">&nbsp;</figure>')
            }
        });

        expect(richArea.isButtonDisabled(richArea.getButtonDefinition('insertSnippet'))).toBe(false);
        richArea.getButtonDefinition('insertSnippet').run(richArea, {});

        expect(richArea.getContent()).toContain('data-snippet="banner"');
    });

    test('mounts snippets and saves their changed properties', () => {
        const mounted = [];
        let released = 0;
        const richArea = mount({
            content: '<figure data-snippet="banner" data-property-title="Hello">&nbsp;</figure>',
            hooks: {
                mountSnippet: (element, callbacks) => {
                    mounted.push({ element, callbacks });
                    return () => released++;
                }
            }
        });

        expect(mounted.length).toBe(1);
        const { element, callbacks } = mounted[0];
        expect(element.getAttribute('data-snippet')).toBe('banner');

        callbacks.opened();
        expect(isSnippetEditing(element)).toBe(true);

        element.setAttribute('data-property-title', 'Changed');
        callbacks.closed();

        expect(isSnippetEditing(element)).toBe(false);
        expect(richArea.getContent()).toContain('data-property-title="Changed"');

        richArea.destroy();
        editors.splice(editors.indexOf(richArea), 1);
        expect(released).toBe(1);
    });

    test('tells the upload hook an image is uploaded and reports failures', async () => {
        const contexts = [];
        const alerts = [];
        const richArea = mount({
            hooks: {
                uploadFile: async (file, context) => {
                    contexts.push(context);
                    throw new Error('');
                },
                alert: (message) => alerts.push(message)
            }
        });

        const file = new File(['x'], 'photo.png', { type: 'image/png' });
        richArea.onPasteFiles({ clipboardData: { files: [file] }, preventDefault() {} });

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(contexts).toEqual([{ type: 'image' }]);
        expect(alerts).toEqual([richArea.trans('uploadFailed')]);
    });

    test('uses the tooltip hook for button hints', () => {
        const richArea = mount({
            hooks: { tooltip: (label, shortcut) => ({ 'data-tooltip-text': label, 'data-tooltip-hotkey': shortcut }) }
        });

        const button = richArea.root.querySelector('[data-cmd="bold"]');

        expect(button.getAttribute('data-tooltip-text')).toBe(richArea.trans('bold'));
        expect(button.hasAttribute('title')).toBe(false);
    });
});

describe('icons', () => {
    test('uses the default icon classes', () => {
        const richArea = mount({ toolbarButtons: ['bold', 'insertImage', 'fullscreen'] });

        expect(richArea.root.querySelector('[data-cmd="bold"] .rich-editor-icon').className).toBe('rich-editor-icon ' + defaultIcons.bold);
        expect(richArea.root.querySelector('[data-cmd="insertImage"] .rich-editor-caret').className).toBe('rich-editor-caret ' + defaultIcons.caret);
    });

    test('takes icon classes from the icons option', () => {
        const richArea = mount({
            toolbarButtons: ['bold', 'italic', 'insertImage', 'fullscreen'],
            icons: { bold: 'bi bi-type-bold', caret: 'bi bi-chevron-down', byUrl: 'bi bi-globe', fullscreen: 'bi bi-fullscreen', fullscreenExit: 'bi bi-fullscreen-exit' }
        });

        expect(richArea.root.querySelector('[data-cmd="bold"] .rich-editor-icon').className).toBe('rich-editor-icon bi bi-type-bold');
        expect(richArea.root.querySelector('[data-cmd="italic"] .rich-editor-icon').className).toBe('rich-editor-icon ' + defaultIcons.italic);
        expect(richArea.root.querySelector('[data-cmd="insertImage"] .rich-editor-caret').className).toBe('rich-editor-caret bi bi-chevron-down');
        expect(richArea.getButtonDefinition('insertImage').menu(richArea).map((item) => item.icon)).toEqual(['bi bi-globe']);
        expect(richArea.root.querySelector('[data-cmd="fullscreen"] .rich-editor-icon').className).toBe('rich-editor-icon bi bi-fullscreen');

        richArea.toggleFullscreen();
        richArea.toolbar.refresh();

        expect(richArea.root.querySelector('[data-cmd="fullscreen"] .rich-editor-icon').className).toBe('rich-editor-icon bi bi-fullscreen-exit');
        richArea.toggleFullscreen();
    });

    test('gives registered buttons their own icon or the custom button icon', () => {
        const richArea = mount({
            toolbarButtons: ['star', 'plain'],
            buttons: { star: { icon: 'bi bi-star' }, plain: {} },
            icons: { customButton: 'bi bi-puzzle' }
        });

        expect(richArea.root.querySelector('[data-cmd="star"] .rich-editor-icon').className).toBe('rich-editor-icon bi bi-star');
        expect(richArea.root.querySelector('[data-cmd="plain"] .rich-editor-icon').className).toBe('rich-editor-icon bi bi-puzzle');
    });
});

describe('lang', () => {
    test('translates button labels and the default paragraph formats', () => {
        const richArea = mount({
            toolbarButtons: ['paragraphFormat', 'bold'],
            lang: { bold: 'Gras', formatNormal: 'Normal FR', formatHeading1: 'Titre 1' }
        });

        expect(richArea.root.querySelector('[data-cmd="bold"]').getAttribute('aria-label')).toBe('Gras');
        expect(menuLabels(richArea, 'paragraphFormat').slice(0, 2)).toEqual(['Normal FR', 'Titre 1']);
        expect(menuLabels(richArea, 'paragraphFormat')[5]).toBe(defaultLang.formatCode);
    });

    test('keeps paragraph formats set by the host', () => {
        const richArea = mount({ paragraphFormat: { N: 'Body', H2: 'Title' }, lang: { formatNormal: 'Normal FR' } });

        expect(menuLabels(richArea, 'paragraphFormat')).toEqual(['Body', 'Title']);
    });
});

describe('snippet placeholders', () => {
    test('label snippets that no host mounts', () => {
        const richArea = mount({
            content: '<figure data-snippet="blogPosts" data-component="Acme\\Blog\\Components\\Posts">&nbsp;</figure><p>Hello <span data-snippet="price" data-ui-block-inline="true">&nbsp;</span></p>',
            icons: { snippet: 'bi bi-newspaper' }
        });

        const block = richArea.root.querySelector('figure[data-snippet]');
        expect(block.classList.contains('rich-editor-snippet')).toBe(true);
        expect(block.querySelector('.rich-editor-icon').className).toBe('rich-editor-icon bi bi-newspaper');
        expect(block.querySelector('.rich-editor-snippet-name').textContent).toBe('blogPosts');
        expect(block.querySelector('.rich-editor-snippet-component').textContent).toBe('Acme\\Blog\\Components\\Posts');

        const inline = richArea.root.querySelector('span[data-snippet]');
        expect(inline.querySelector('.rich-editor-snippet-name').textContent).toBe('price');
        expect(inline.querySelector('.rich-editor-snippet-component')).toBeNull();

        const html = richArea.getContent();
        expect(html).toContain('<figure data-snippet="blogPosts" data-component="Acme\\Blog\\Components\\Posts">');
        expect(html).not.toContain('rich-editor-snippet');
    });

    test('leaves mounted snippets to the host', () => {
        const richArea = mount({
            content: '<figure data-snippet="banner">&nbsp;</figure>',
            hooks: { mountSnippet: () => null }
        });

        const element = richArea.root.querySelector('figure[data-snippet]');
        expect(element.classList.contains('rich-editor-snippet')).toBe(false);
        expect(element.querySelector('.rich-editor-snippet-name')).toBeNull();
    });
});

describe('popover forms', () => {
    test('give checkboxes the Bootstrap check classes, so a Bootstrap page styles them like its other checks', () => {
        const form = createForm({
            title: 'Insert Link',
            submitLabel: 'Insert',
            onSubmit: () => {},
            fields: [
                { name: 'href', label: 'URL' },
                { name: 'newTab', label: 'Open in new tab', type: 'checkbox', value: true }
            ]
        });

        const checkbox = form.controls.newTab;
        expect(checkbox.type).toBe('checkbox');
        expect(checkbox.checked).toBe(true);
        expect(checkbox.classList.contains('check')).toBe(true);
        expect(checkbox.classList.contains('check-sm')).toBe(true);
        expect(checkbox.nextElementSibling.getAttribute('for')).toBe(checkbox.id);

        // Text fields keep the editor's own styling, which works with or without Bootstrap
        expect(form.controls.href.className).toBe('');
    });
});
