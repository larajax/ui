import { afterEach, beforeAll, describe, expect, mock, test } from 'bun:test';
import { fakeMonaco, editors, calls, emmetCalls, support, resetFakeMonaco } from './support/fake-monaco.js';

mock.module('../resources/assets/vendor/monaco/monaco.js', () => fakeMonaco);

const { registerCodeEditor } = await import('../resources/assets/formwidgets/codeeditor/codeeditor.js');

function parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value !== '' && !isNaN(Number(value))) return Number(value);
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

        listen(eventName, selectorOrHandler, handler) {
            if (typeof selectorOrHandler === 'string') {
                this.element.addEventListener(eventName, (ev) => {
                    if (ev.target.closest(selectorOrHandler)) {
                        handler.call(this, ev);
                    }
                });
                return;
            }

            this.element.addEventListener(eventName, selectorOrHandler.bind(this));
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
    registerCodeEditor(jax);
});

afterEach(() => {
    document.body.innerHTML = '';
    document.body.style.overflow = '';
    document.documentElement.removeAttribute('data-bs-theme');
    resetFakeMonaco();
});

async function connect(html) {
    document.body.innerHTML = html;
    const element = document.querySelector('[data-control="codeeditor"]');
    const control = new (jax.controls.get('codeeditor'))(element);
    control.init();
    control.connect();
    await flush();
    return { element, control };
}

const DEFAULT_ATTRIBUTES = {
    'font-size': '12', 'word-wrap': 'fluid', 'code-folding': 'manual', 'auto-close-tags': 'true',
    'tab-size': '4', 'theme': '', 'show-invisibles': 'false', 'autocompletion': 'manual',
    'enable-snippets': 'true', 'display-indent-guides': 'true', 'show-print-margin': 'false',
    'highlight-active-line': 'true', 'use-soft-tabs': 'true', 'show-gutter': 'true',
    'read-only': 'false', 'language': 'php', 'margin': '0'
};

const COMMANDS = ['undo', 'redo', 'search', 'replace', 'format', 'wrap', 'fullscreen'];

const field = (overrides = {}) => `
    <div class="field-codeeditor size-large" data-control="codeeditor" ${Object.entries({ ...DEFAULT_ATTRIBUTES, ...overrides }).map(([name, value]) => `data-${name}="${value}"`).join(' ')}>
        <div class="editor-toolbar" role="toolbar">
            ${COMMANDS.map((command) => `<button type="button" class="editor-toolbar-button" data-editor-command="${command}"><i></i></button>`).join('')}
            <span class="editor-toolbar-language" data-editor-language>php</span>
        </div>
        <textarea name="code">&lt;?php echo 1;</textarea>
    </div>
`;

const button = (element, command) => element.querySelector(`[data-editor-command="${command}"]`);

describe('code editor', () => {
    test('mounts Monaco below the toolbar with the field value', async () => {
        const { element, control } = await connect(field());
        const textarea = element.querySelector('textarea');

        expect(editors.length).toBe(1);
        expect(control.getEditorObject()).toBe(editors[0]);
        expect(editors[0].container).toBe(element.querySelector(':scope > .editor-toolbar + .editor-code'));
        expect(textarea.style.display).toBe('none');
        expect(editors[0].options).toMatchObject({
            value: '<?php echo 1;',
            language: 'php',
            theme: 'vs',
            readOnly: false,
            fontSize: 12,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            autoClosingBrackets: 'languageDefined',
            renderWhitespace: 'none',
            renderLineHighlight: 'all',
            renderLineHighlightOnlyWhenFocus: true,
            guides: { indentation: true },
            quickSuggestions: false,
            snippetSuggestions: 'inline',
            padding: { top: 8, bottom: 8 },
            rulers: [],
            automaticLayout: true,
            minimap: { enabled: false },
            scrollbar: { alwaysConsumeMouseWheel: false }
        });
        expect(editors[0].model.eol).toBe(0);
    });

    test('loads the stylesheet and registers Emmet once', async () => {
        await connect(field());
        await connect(field());

        expect(document.head.querySelectorAll('link[data-codeeditor-stylesheet]').length).toBe(1);
        expect(document.head.querySelector('link[data-codeeditor-stylesheet]').href).toContain('vendor/monaco/monaco.css');
        expect(emmetCalls).toEqual([
            ['emmetHTML', ['html', 'twig', 'php']],
            ['emmetCSS', ['css', 'less', 'scss']]
        ]);
    });

    test('maps the field options to Monaco options', async () => {
        await connect(field({
            'word-wrap': '80', 'show-gutter': 'false', 'autocompletion': 'live', 'show-print-margin': 'true',
            'use-soft-tabs': 'false', 'auto-close-tags': 'false', 'show-invisibles': 'true', 'code-folding': 'markbeginend',
            'read-only': 'true', 'margin': '20'
        }));

        const options = editors[0].options;
        expect(options.wordWrap).toBe('wordWrapColumn');
        expect(options.wordWrapColumn).toBe(80);
        expect(options.lineNumbers).toBe('off');
        expect(options.showFoldingControls).toBe('never');
        expect(options.quickSuggestions).toBe(true);
        expect(options.rulers).toEqual([80]);
        expect(options.insertSpaces).toBe(false);
        expect(options.autoClosingQuotes).toBe('never');
        expect(options.renderWhitespace).toBe('all');
        expect(options.readOnly).toBe(true);
        expect(options.padding).toEqual({ top: 20, bottom: 20 });
    });

    test('maps language names Monaco spells differently and shows its display name', async () => {
        const { element } = await connect(field({ language: 'plain_text' }));

        expect(editors[0].options.language).toBe('plaintext');
        expect(element.querySelector('[data-editor-language]').textContent).toBe('Plain Text');
    });

    test('uses a named Monaco theme, otherwise the page color mode', async () => {
        await connect(field({ theme: 'hc-black' }));
        expect(editors[0].options.theme).toBe('hc-black');

        document.documentElement.setAttribute('data-bs-theme', 'dark');
        await connect(field());
        expect(editors[1].options.theme).toBe('vs-dark');
    });

    test('follows the page when its color mode changes', async () => {
        document.documentElement.setAttribute('data-bs-theme', 'light');
        await connect(field());

        document.documentElement.setAttribute('data-bs-theme', 'dark');
        await flush();

        expect(calls).toContainEqual(['setTheme', 'vs-dark']);
    });

    test('writes changes to the textarea and announces them', async () => {
        const { element, control } = await connect(field());
        const textarea = element.querySelector('textarea');
        const events = [];
        element.addEventListener('change', (ev) => events.push(ev.target));

        control.setContent('<?php echo 2;');

        expect(textarea.value).toBe('<?php echo 2;');
        expect(control.getContent()).toBe('<?php echo 2;');
        expect(events).toEqual([textarea]);
    });

    test('marks the field while the editor has focus', async () => {
        const { element } = await connect(field());

        editors[0].listeners.focus();
        expect(element.classList.contains('editor-focus')).toBe(true);

        editors[0].listeners.blur();
        expect(element.classList.contains('editor-focus')).toBe(false);
    });

    test('toolbar buttons run the editor commands', async () => {
        support.canUndo = true;
        support.canRedo = true;
        support.format = true;
        const { element } = await connect(field());

        ['undo', 'redo', 'search', 'replace', 'format'].forEach((command) => button(element, command).click());

        expect(calls.filter(([name]) => name === 'trigger' || name === 'action')).toEqual([
            ['trigger', 'undo'],
            ['trigger', 'redo'],
            ['action', 'actions.find'],
            ['action', 'editor.action.startFindReplaceAction'],
            ['action', 'editor.action.formatDocument']
        ]);
    });

    test('disables the buttons that cannot run', async () => {
        const { element, control } = await connect(field());

        expect(button(element, 'undo').disabled).toBe(true);
        expect(button(element, 'redo').disabled).toBe(true);
        expect(button(element, 'format').disabled).toBe(true);
        expect(button(element, 'search').disabled).toBe(false);

        support.canUndo = true;
        control.setContent('<?php echo 2;');
        expect(button(element, 'undo').disabled).toBe(false);
    });

    test('read only editors disable the editing buttons', async () => {
        support.canUndo = true;
        const { element } = await connect(field({ 'read-only': 'true' }));

        expect(button(element, 'undo').disabled).toBe(true);
        expect(button(element, 'replace').disabled).toBe(true);
        expect(button(element, 'search').disabled).toBe(false);
    });

    test('the wrap button toggles word wrap and keeps its mode', async () => {
        const { element } = await connect(field({ 'word-wrap': '80' }));
        const wrap = button(element, 'wrap');

        expect(wrap.classList.contains('is-active')).toBe(true);

        wrap.click();
        expect(calls).toContainEqual(['updateOptions', { wordWrap: 'off' }]);
        expect(wrap.classList.contains('is-active')).toBe(false);
        expect(wrap.getAttribute('aria-pressed')).toBe('false');

        wrap.click();
        expect(calls).toContainEqual(['updateOptions', { wordWrap: 'wordWrapColumn', wordWrapColumn: 80 }]);
        expect(wrap.classList.contains('is-active')).toBe(true);
    });

    test('the fullscreen button toggles fullscreen', async () => {
        const { element, control } = await connect(field());
        const fullscreen = button(element, 'fullscreen');

        fullscreen.click();
        expect(element.classList.contains('editor-fullscreen')).toBe(true);
        expect(control.isFullscreen).toBe(true);
        expect(document.body.style.overflow).toBe('hidden');
        expect(editors[0].contextKeys.codeEditorFullscreen.value).toBe(true);
        expect(fullscreen.classList.contains('is-active')).toBe(true);

        fullscreen.click();
        expect(element.classList.contains('editor-fullscreen')).toBe(false);
        expect(document.body.style.overflow).toBe('');
    });

    test('binds the fullscreen and word wrap hotkeys', async () => {
        await connect(field());

        const commands = editors[0].commands;
        expect(commands[0].keybinding).toBe(2048 | 1024 | 36);
        expect(commands[1].keybinding).toBe(9);
        expect(commands[1].context).toContain('codeEditorFullscreen');
        expect(commands[2].keybinding).toBe(512 | 56);
    });

    test('disposes the editor and restores the textarea on disconnect', async () => {
        const { element, control } = await connect(field());
        control.toggleFullscreen();

        control.disconnect();

        expect(editors[0].disposed).toBe(true);
        expect(editors[0].model.disposed).toBe(true);
        expect(element.querySelector('.editor-code')).toBeNull();
        expect(element.querySelector('textarea').style.display).toBe('');
        expect(document.body.style.overflow).toBe('');
    });
});
