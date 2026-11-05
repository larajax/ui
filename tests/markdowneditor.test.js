import { afterEach, beforeAll, describe, expect, mock, test } from 'bun:test';

const editors = [];
const sanitized = [];

// Stands in for EasyMDE 2: static actions, value(), and CodeMirror 5 events
class FakeEasyMDE {
    constructor(options) {
        this.options = options;
        this.calls = [];
        this.content = options.element.value;
        this.handlers = {};
        this.codemirror = {
            on: (name, handler) => { this.handlers[name] = handler; }
        };
        editors.push(this);
    }

    value(text) {
        if (text === undefined) {
            return this.content;
        }

        this.content = text;
        this.handlers.change();
    }

    markdown(text) { return `<p>${text}</p>`; }
    getState() { return this.state || {}; }
    isPreviewActive() { return !!this.previewActive; }
    isSideBySideActive() { return false; }
    isFullscreenActive() { return false; }
    togglePreview() { this.calls.push('togglePreview'); this.previewActive = !this.previewActive; }
    toggleSideBySide() { this.calls.push('toggleSideBySide'); }
    toggleFullScreen() { this.calls.push('toggleFullScreen'); }
    toTextArea() { this.calls.push('toTextArea'); }
    cleanup() { this.calls.push('cleanup'); }
}

['toggleBold', 'toggleItalic', 'toggleStrikethrough', 'toggleHeading1', 'toggleHeading2', 'toggleHeading3',
    'toggleCodeBlock', 'toggleBlockquote', 'toggleUnorderedList', 'toggleOrderedList', 'cleanBlock', 'drawLink',
    'drawImage', 'drawTable', 'drawHorizontalRule', 'togglePreview', 'toggleSideBySide', 'toggleFullScreen'
].forEach((name) => {
    FakeEasyMDE[name] = (editor) => {
        if (name === 'togglePreview') {
            editor.togglePreview();
            return;
        }

        editor.calls.push(name);
    };
});

const FakeDOMPurify = {
    sanitize: (html) => {
        sanitized.push(html);
        return html.replace(/<script>.*<\/script>/, '');
    }
};

mock.module('../resources/assets/vendor/easymde/easymde.esm.js', () => ({ EasyMDE: FakeEasyMDE, DOMPurify: FakeDOMPurify }));

const { registerMarkdownEditor, markdownEditor } = await import('../resources/assets/formwidgets/markdowneditor/markdowneditor.js');

function parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value.charAt(0) === '[') return JSON.parse(value);
    return value;
}

function makeFakeJax() {
    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = {};

            for (const attr of element.attributes) {
                if (attr.name.startsWith('data-')) {
                    const key = attr.name.slice(5).replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
                    this.config[key] = parseValue(attr.value);
                }
            }
        }

        proxy(handler) {
            return handler.bind(this);
        }
    }

    return {
        controls: new Map(),
        ControlBase,
        registerControl(id, control) {
            this.controls.set(id, control);
        }
    };
}

let jax;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeAll(() => {
    jax = makeFakeJax();
    registerMarkdownEditor(jax);
});

afterEach(() => {
    document.body.innerHTML = '';
    editors.length = 0;
    sanitized.length = 0;
});

const TOOLBAR = [
    { name: 'bold', title: 'Bold', icon: '<i class="ph ph-text-b"></i>' },
    { name: 'heading-1', title: 'Header 1', icon: '<i class="ph ph-text-h-one"></i>' },
    '|',
    { name: 'mystery', title: 'Mystery', icon: '<i></i>' },
    { name: 'preview', title: 'Preview', icon: '<i class="ph ph-eye"></i>' },
    { name: 'fullscreen', title: 'Full Screen', icon: '<i class="ph ph-arrows-out"></i>' }
];

const field = (attributes = 'data-view-mode="tab" data-safe-mode="true"', value = 'Hello **world**') => `
    <div class="field-markdowneditor size-small" data-control="markdowneditor" data-size="small"
        data-toolbar-buttons='${JSON.stringify(TOOLBAR)}' ${attributes}>
        <textarea name="notes" placeholder="Write something">${value}</textarea>
    </div>
`;

async function connect(attributes, value) {
    document.body.innerHTML = field(attributes, value);
    const element = document.querySelector('[data-control="markdowneditor"]');
    const control = new (jax.controls.get('markdowneditor'))(element);
    control.init();
    control.connect();
    await flush();
    return { element, control, editor: editors[editors.length - 1] };
}

describe('markdown editor', () => {
    test('mounts EasyMDE over the textarea', async () => {
        const { element, control, editor } = await connect();

        expect(control.getEditorObject()).toBe(editor);
        expect(editor.options.element).toBe(element.querySelector('textarea'));
        expect(editor.options).toMatchObject({
            placeholder: 'Write something',
            minHeight: '100px',
            autoDownloadFontAwesome: false,
            spellChecker: false,
            previewImagesInEditor: false,
            sideBySideFullscreen: false,
            syncSideBySidePreviewScroll: true,
            status: true
        });
        expect(editor.calls).toEqual([]);
    });

    test('builds the toolbar from the field buttons with their icons and EasyMDE actions', async () => {
        const { editor } = await connect();
        const toolbar = editor.options.toolbar;

        expect(toolbar.map((button) => button === '|' ? '|' : button.name)).toEqual(['bold', 'heading-1', '|', 'preview', 'fullscreen']);
        expect(toolbar[0]).toMatchObject({ title: 'Bold', icon: '<i class="ph ph-text-b"></i>', noDisable: false, noMobile: false });
        expect(toolbar[0].action).toBe(FakeEasyMDE.toggleBold);
        expect(toolbar[1].action).toBe(FakeEasyMDE.toggleHeading1);
        expect(toolbar[3]).toMatchObject({ noDisable: true, noMobile: false });
        expect(toolbar[4]).toMatchObject({ noDisable: true, noMobile: true });
        expect(toolbar[4].action).toBe(FakeEasyMDE.toggleFullScreen);
    });

    test('safe mode cleans the preview with DOMPurify', async () => {
        const { editor } = await connect();

        expect(editor.options.renderingConfig.sanitizerFunction('<p>Hi</p><script>x</script>')).toBe('<p>Hi</p>');
        expect(sanitized).toEqual(['<p>Hi</p><script>x</script>']);
    });

    test('without safe mode the preview HTML is left alone', async () => {
        const { editor } = await connect('data-safe-mode="false"');

        expect(editor.options.renderingConfig.sanitizerFunction).toBeUndefined();
    });

    test('split mode opens the preview beside the editor', async () => {
        const { editor } = await connect('data-view-mode="split"');

        expect(editor.calls).toEqual(['toggleSideBySide']);
    });

    test('writes edits to the textarea and announces them once', async () => {
        const { element, control, editor } = await connect();
        const textarea = element.querySelector('textarea');
        const events = [];
        element.addEventListener('change', (ev) => events.push(ev.target));

        control.setContent('# Changed');

        expect(textarea.value).toBe('# Changed');
        expect(control.getContent()).toBe('# Changed');
        expect(events).toEqual([textarea]);

        editor.handlers.change();
        expect(events.length).toBe(1);
    });

    test('marks the field while the editor has focus', async () => {
        const { element, editor } = await connect();

        editor.handlers.focus();
        expect(element.classList.contains('editor-focus')).toBe(true);

        editor.handlers.blur();
        expect(element.classList.contains('editor-focus')).toBe(false);
    });

    test('passes the view toggles to EasyMDE', async () => {
        const { control, editor } = await connect();

        control.togglePreview();
        control.toggleSideBySide();
        control.toggleFullscreen();

        expect(editor.calls).toEqual(['togglePreview', 'toggleSideBySide', 'toggleFullScreen']);
    });

    test('restores the textarea on disconnect', async () => {
        const { control, editor } = await connect();

        control.disconnect();

        expect(editor.calls).toEqual(['toTextArea', 'cleanup']);
        expect(control.getEditorObject()).toBeNull();
    });

    test('skips mounting when the field left the page before EasyMDE loaded', async () => {
        document.body.innerHTML = field();
        const element = document.querySelector('[data-control="markdowneditor"]');
        const control = new (jax.controls.get('markdowneditor'))(element);
        control.init();
        control.connect();
        control.disconnect();
        await flush();

        expect(editors.length).toBe(0);
    });
});

describe('markdown editor with a toolbar drawn by the page', () => {
    test('draws no toolbar or status bar and announces the mounted editor', async () => {
        const ready = [];
        const onReady = (event) => ready.push(event.detail.markdownEditor);
        document.addEventListener('markdowneditor:ready', onReady);

        try {
            const { control, editor } = await connect('data-external-toolbar="true"');

            expect(editor.options.toolbar).toBe(false);
            expect(editor.options.status).toBe(false);
            expect(ready).toEqual([control]);
        }
        finally {
            document.removeEventListener('markdowneditor:ready', onReady);
        }
    });

    test('lists the known buttons in order, leaving fullscreen to the page', async () => {
        const { control } = await connect('data-external-toolbar="true"');

        expect(control.getToolbarItems()).toEqual([
            { type: 'button', code: 'bold' },
            { type: 'button', code: 'heading-1' },
            { type: 'separator' },
            { type: 'button', code: 'preview' }
        ]);
    });

    test('describes buttons from the editor state, disabling all but the view buttons in the preview', async () => {
        const { control, editor } = await connect('data-external-toolbar="true"');
        editor.state = { bold: true };

        expect(control.getButtonState('bold')).toMatchObject({ code: 'bold', label: 'Bold', active: true, disabled: false });
        expect(control.getButtonState('mystery')).toBeNull();

        control.activateButton('preview');

        expect(control.getButtonState('preview')).toMatchObject({ active: true, disabled: false });
        expect(control.getButtonState('bold').disabled).toBe(true);
    });

    test('runs a button\'s action and announces an update', async () => {
        const { control, editor } = await connect('data-external-toolbar="true"');
        let updates = 0;
        control.on('update', () => updates++);

        control.activateButton('bold');
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(editor.calls).toContain('toggleBold');
        expect(updates).toBeGreaterThan(0);
    });

    test('takes a value set on the textarea from outside', async () => {
        const { element, editor } = await connect('data-external-toolbar="true"');
        const textarea = element.querySelector('textarea');

        textarea.value = 'From outside';
        textarea.dispatchEvent(new Event('change', { bubbles: true }));

        expect(editor.value()).toBe('From outside');
    });
});

describe('markdown editor preview', () => {
    afterEach(() => {
        delete markdownEditor.hooks.preparePreview;
    });

    test('renders the markdown as it is without a hook', async () => {
        const { editor } = await connect();

        expect(editor.options.previewRender('Hello')).toBe('<p>Hello</p>');
    });

    test('renders the markdown the page prepares, or leaves the preview when it returns null', async () => {
        const { control, editor } = await connect();
        const seen = [];

        markdownEditor.hooks.preparePreview = (markdown, owner) => {
            seen.push(owner);
            return markdown === 'skip' ? null : markdown.replace('october://page', '/page');
        };

        expect(editor.options.previewRender('[Page](october://page)')).toBe('<p>[Page](/page)</p>');
        expect(editor.options.previewRender('skip')).toBeNull();
        expect(seen).toEqual([control, control]);
    });
});
