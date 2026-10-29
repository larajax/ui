/*
 * Code editor form field control
 *
 * Data attributes:
 * - data-control="codeeditor" - enables the code editor plugin
 * - data-language="php" - set the coding language used
 * - data-theme="vs-dark" - the Monaco theme, follows the page color mode when empty
 * - data-editor-command="undo" - a toolbar button running an editor command: undo, redo, search,
 *   replace, format, wrap or fullscreen
 *
 * JavaScript API:
 * jax.fetchControl(element, 'codeeditor').getContent()
 *
 * Dependencies:
 * - Monaco Editor (vendor/monaco/monaco.js)
 */
'use strict';

import { MONACO_THEMES, loadMonaco, resolveTheme, followPageTheme, unfollowPageTheme } from './monaco-loader.js';

// Language names that differ in Monaco
const LANGUAGE_ALIASES = {
    plain_text: 'plaintext',
    text: 'plaintext',
    txt: 'plaintext',
    htm: 'html',
    sass: 'scss',
    js: 'javascript',
    md: 'markdown',
    yml: 'yaml'
};

// Space kept above the first line and below the last when the field sets no margin
const MIN_PADDING = 8;

const DEFAULTS = {
    fontSize: 12,
    wordWrap: 'off',
    codeFolding: 'manual',
    autocompletion: 'manual',
    tabSize: 4,
    theme: '',
    showInvisibles: true,
    highlightActiveLine: true,
    useSoftTabs: true,
    autoCloseTags: true,
    showGutter: true,
    enableSnippets: true,
    displayIndentGuides: true,
    language: 'php',
    margin: 0,
    showPrintMargin: false,
    readOnly: false
};

export function registerCodeEditor(jax) {
    jax.registerControl('codeeditor', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({}, DEFAULTS, this.config);
        }

        connect() {
            this.textarea = this.element.querySelector(':scope > textarea');
            this.toolbar = this.element.querySelector(':scope > .editor-toolbar');
            this.isFullscreen = false;

            if (!this.textarea) {
                return;
            }

            // Create code container below the toolbar
            this.code = document.createElement('div');
            this.code.className = 'editor-code';
            if (this.toolbar) {
                this.toolbar.after(this.code);
            }
            else {
                this.element.prepend(this.code);
            }

            this.textarea.style.display = 'none';

            this.listen('click', '[data-editor-command]', this.onClickCommand);
            this.listen('keydown', this.onKeyDown);
            this.refreshToolbar();

            loadMonaco().then((monaco) => {
                // The field may have left the page while Monaco loaded
                if (!this.textarea) {
                    return;
                }

                this.monaco = monaco;
                this.initEditor();
            });
        }

        disconnect() {
            if (this.isFullscreen) {
                this.toggleFullscreen();
            }

            unfollowPageTheme(this);

            if (this.editor) {
                const model = this.editor.getModel();
                this.editor.dispose();
                if (model) {
                    model.dispose();
                }
            }

            if (this.code) {
                this.code.remove();
            }

            if (this.textarea) {
                this.textarea.style.display = '';
            }

            this.editor = null;
            this.monaco = null;
            this.code = null;
            this.textarea = null;
            this.toolbar = null;
        }

        initEditor() {
            const monaco = this.monaco,
                options = this.getEditorOptions(),
                editor = this.editor = monaco.editor.create(this.code, options);

            // Line breaks match the textarea, which browsers keep as \n
            editor.getModel().setEOL(monaco.editor.EndOfLineSequence.LF);

            this.wrapOptions = options.wordWrap === 'off'
                ? { wordWrap: 'on' }
                : { wordWrap: options.wordWrap, wordWrapColumn: options.wordWrapColumn };
            this.isWordWrap = options.wordWrap !== 'off';

            this.fullscreenKey = editor.createContextKey('codeEditorFullscreen', false);

            editor.onDidChangeModelContent(this.proxy(this.onChange));
            editor.onDidFocusEditorText(this.proxy(this.onFocus));
            editor.onDidBlurEditorText(this.proxy(this.onBlur));

            // Hotkeys
            editor.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
                this.proxy(this.toggleFullscreen)
            );

            editor.addCommand(
                monaco.KeyCode.Escape,
                this.proxy(this.toggleFullscreen),
                'codeEditorFullscreen && !findWidgetVisible && !suggestWidgetVisible'
            );

            editor.addCommand(
                monaco.KeyMod.Alt | monaco.KeyCode.KeyZ,
                this.proxy(this.toggleWordWrap)
            );

            if (!MONACO_THEMES.includes(this.config.theme)) {
                followPageTheme(this);
            }

            this.showLanguageName();
            this.refreshToolbar();
        }

        getEditorOptions() {
            const config = this.config,
                wordWrap = String(config.wordWrap),
                padding = Math.max(Number(config.margin) || 0, MIN_PADDING),
                options = {
                    value: this.textarea.value,
                    language: this.getLanguage(),
                    theme: this.getTheme(),
                    readOnly: !!config.readOnly,
                    fontSize: Number(config.fontSize) || DEFAULTS.fontSize,
                    tabSize: Number(config.tabSize) || DEFAULTS.tabSize,
                    insertSpaces: !!config.useSoftTabs,
                    autoClosingBrackets: config.autoCloseTags ? 'languageDefined' : 'never',
                    autoClosingQuotes: config.autoCloseTags ? 'languageDefined' : 'never',
                    renderWhitespace: config.showInvisibles ? 'all' : 'none',
                    renderLineHighlight: config.highlightActiveLine ? 'all' : 'none',
                    renderLineHighlightOnlyWhenFocus: true,
                    guides: { indentation: !!config.displayIndentGuides },
                    showFoldingControls: config.codeFolding === 'manual' ? 'mouseover' : 'always',
                    quickSuggestions: config.autocompletion === 'live',
                    suggestOnTriggerCharacters: config.autocompletion === 'live',
                    snippetSuggestions: config.enableSnippets ? 'inline' : 'none',
                    padding: { top: padding, bottom: padding },
                    rulers: config.showPrintMargin ? [wordWrap === '40' ? 40 : 80] : [],
                    tabCompletion: 'on',
                    automaticLayout: true,
                    unusualLineTerminators: 'auto',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    overviewRulerLanes: 0,
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    scrollbar: {
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                        alwaysConsumeMouseWheel: false
                    },
                    fixedOverflowWidgets: true
                };

            if (wordWrap === 'off') {
                options.wordWrap = 'off';
            }
            else if (wordWrap === 'fluid') {
                options.wordWrap = 'on';
            }
            else {
                options.wordWrap = 'wordWrapColumn';
                options.wordWrapColumn = parseInt(wordWrap, 10) || 80;
            }

            if (!config.showGutter) {
                options.lineNumbers = 'off';
                options.lineDecorationsWidth = 0;
                options.lineNumbersMinChars = 0;
                options.showFoldingControls = 'never';
            }

            return options;
        }

        getLanguage() {
            const language = String(this.config.language || 'plaintext').toLowerCase();
            return LANGUAGE_ALIASES[language] || language;
        }

        getTheme() {
            return resolveTheme(this.config.theme, this.element);
        }

        // Monaco has one theme for the whole page
        applyTheme() {
            if (this.monaco) {
                this.monaco.editor.setTheme(this.getTheme());
            }
        }

        // Shows Monaco's display name for the language, such as Plain Text
        showLanguageName() {
            const label = this.toolbar && this.toolbar.querySelector('[data-editor-language]');
            if (!label) {
                return;
            }

            const id = this.editor.getModel().getLanguageId(),
                language = this.monaco.languages.getLanguages().find((info) => info.id === id),
                name = language && language.aliases && language.aliases[0];

            label.textContent = name || id;
        }

        refreshToolbar() {
            if (!this.toolbar) {
                return;
            }

            const editor = this.editor,
                model = editor ? editor.getModel() : null,
                readOnly = !!this.config.readOnly,
                formatAction = editor ? editor.getAction('editor.action.formatDocument') : null;

            const states = {
                undo: { disabled: !model || readOnly || !model.canUndo() },
                redo: { disabled: !model || readOnly || !model.canRedo() },
                search: { disabled: !editor },
                replace: { disabled: !editor || readOnly },
                format: { disabled: !formatAction || !formatAction.isSupported() },
                wrap: { disabled: !editor, active: !!this.isWordWrap },
                fullscreen: { disabled: false, active: this.isFullscreen }
            };

            this.toolbar.querySelectorAll('[data-editor-command]').forEach((button) => {
                const state = states[button.getAttribute('data-editor-command')];
                if (!state) {
                    return;
                }

                button.disabled = state.disabled;

                if (state.active !== undefined) {
                    button.classList.toggle('is-active', state.active);
                    button.setAttribute('aria-pressed', state.active ? 'true' : 'false');
                }
            });
        }

        onChange() {
            this.textarea.value = this.editor.getValue();
            this.textarea.dispatchEvent(new Event('change', { bubbles: true }));
            this.refreshToolbar();
        }

        onFocus() {
            this.element.classList.add('editor-focus');
            this.refreshToolbar();
        }

        onBlur() {
            this.element.classList.remove('editor-focus');
        }

        onKeyDown(ev) {
            // Escape inside the editor text is handled by the editor command
            if (ev.key === 'Escape' && this.isFullscreen && this.editor && !this.editor.hasTextFocus()) {
                this.toggleFullscreen();
            }
        }

        onClickCommand(ev) {
            const button = ev.target.closest('[data-editor-command]');
            if (!button || button.disabled) {
                return;
            }

            ev.preventDefault();

            switch (button.getAttribute('data-editor-command')) {
                case 'undo':
                    this.triggerEditorCommand('undo');
                    break;
                case 'redo':
                    this.triggerEditorCommand('redo');
                    break;
                case 'search':
                    this.showSearchbox();
                    break;
                case 'replace':
                    this.showReplacebox();
                    break;
                case 'format':
                    this.runEditorAction('editor.action.formatDocument');
                    break;
                case 'wrap':
                    this.toggleWordWrap();
                    break;
                case 'fullscreen':
                    this.toggleFullscreen();
                    break;
            }
        }

        getContent() {
            return this.editor ? this.editor.getValue() : this.textarea.value;
        }

        setContent(value) {
            if (this.editor) {
                this.editor.setValue(value);
            }
            else {
                this.textarea.value = value;
            }
        }

        getEditorObject() {
            return this.editor;
        }

        getToolbar() {
            return this.toolbar;
        }

        toggleFullscreen() {
            this.isFullscreen = this.element.classList.toggle('editor-fullscreen');

            document.body.style.overflow = this.isFullscreen ? 'hidden' : '';

            if (this.editor) {
                this.fullscreenKey.set(this.isFullscreen);
                this.editor.layout();
                this.editor.focus();
            }

            this.refreshToolbar();
        }

        toggleWordWrap() {
            if (!this.editor) {
                return;
            }

            this.isWordWrap = !this.isWordWrap;
            this.editor.updateOptions(this.isWordWrap ? this.wrapOptions : { wordWrap: 'off' });
            this.editor.focus();
            this.refreshToolbar();
        }

        showSearchbox() {
            this.runEditorAction('actions.find');
        }

        showReplacebox() {
            this.runEditorAction('editor.action.startFindReplaceAction');
        }

        runEditorAction(id) {
            if (!this.editor) {
                return;
            }

            this.editor.focus();

            const action = this.editor.getAction(id);
            if (action) {
                action.run();
            }
        }

        triggerEditorCommand(id) {
            if (!this.editor) {
                return;
            }

            this.editor.focus();
            this.editor.trigger('toolbar', id, null);
        }
    });
}
