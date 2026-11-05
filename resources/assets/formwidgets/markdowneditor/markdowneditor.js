/*
 * Markdown Editor form field control
 *
 * Data attributes:
 * - data-control="markdowneditor" - enables the markdown editor plugin
 * - data-view-mode="tab" - split opens the preview beside the editor
 * - data-safe-mode="true" - runs the preview HTML through DOMPurify
 * - data-size="large" - the field size, which sets the editor height
 * - data-toolbar-buttons="[...]" - the toolbar, EasyMDE button names with their icon markup and icon
 *   class, and "|" between groups; a title labels a button with no label of its own
 * - data-language="de" - the translation of the button labels, see lang.js
 * - data-external-toolbar="true" - draws no toolbar or status bar, the page draws the toolbar from
 *   getToolbarItems() and getButtonState(), and handles fullscreen itself
 *
 * JavaScript API:
 * jax.fetchControl(element, 'markdowneditor').getEditorObject()
 *
 * Events:
 * - markdowneditor:ready - on the field once its editor is mounted, with detail.markdownEditor, the control
 *
 * Subscribed with on(): update, after the button states may have changed
 *
 * Hooks, shared by every markdown editor on the page:
 *
 *     import { markdownEditor } from '/vendor/larajax/ui/index.js';
 *
 *     // Returns the markdown to render in the preview, or null to leave the preview as it is
 *     markdownEditor.hooks.preparePreview = (markdown, control) => markdown;
 *
 * Dependencies:
 * - EasyMDE (vendor/easymde/easymde.esm.js)
 */
'use strict';

import { makeTranslator, loadLanguage } from '../../lang.js';

/**
 * DEFAULT_LANG are the button labels, keyed by the camel cased button name.
 */
export const DEFAULT_LANG = {
    bold: 'Bold',
    italic: 'Italic',
    strikethrough: 'Strikethrough',
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    code: 'Code',
    quote: 'Quote',
    unorderedList: 'Unordered List',
    orderedList: 'Ordered List',
    cleanBlock: 'Clear Block Formatting',
    link: 'Link',
    image: 'Image',
    table: 'Table',
    horizontalRule: 'Insert Horizontal Line',
    preview: 'Preview',
    sideBySide: 'Side by Side',
    fullscreen: 'Fullscreen'
};

// EasyMDE actions by toolbar button name
const BUTTON_ACTIONS = {
    'bold': 'toggleBold',
    'italic': 'toggleItalic',
    'strikethrough': 'toggleStrikethrough',
    'heading-1': 'toggleHeading1',
    'heading-2': 'toggleHeading2',
    'heading-3': 'toggleHeading3',
    'code': 'toggleCodeBlock',
    'quote': 'toggleBlockquote',
    'unordered-list': 'toggleUnorderedList',
    'ordered-list': 'toggleOrderedList',
    'clean-block': 'cleanBlock',
    'link': 'drawLink',
    'image': 'drawImage',
    'table': 'drawTable',
    'horizontal-rule': 'drawHorizontalRule',
    'preview': 'togglePreview',
    'side-by-side': 'toggleSideBySide',
    'fullscreen': 'toggleFullScreen'
};

// Buttons that stay available in the preview
const VIEW_BUTTONS = ['preview', 'side-by-side', 'fullscreen'];

// Buttons left out on small screens
const DESKTOP_BUTTONS = ['side-by-side', 'fullscreen'];

// EasyMDE's getState() keys that mark a button as active
const STATE_KEYS = ['bold', 'italic', 'strikethrough', 'heading-1', 'heading-2', 'heading-3', 'code', 'quote', 'unordered-list', 'ordered-list', 'link', 'image'];

// Editor heights by field size
const SIZE_HEIGHTS = {
    tiny: '50px',
    small: '100px',
    large: '200px',
    huge: '250px',
    giant: '350px'
};

// EasyMDE is shared by every field, loaded on first use
let easyMdePromise = null;

export const markdownEditor = {
    /*
     * hooks shared by every editor on this page, see the header for the available names
     */
    hooks: {}
};

export function registerMarkdownEditor(jax) {
    jax.registerControl('markdowneditor', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({
                viewMode: 'tab',
                safeMode: true,
                size: 'large',
                toolbarButtons: null,
                externalToolbar: false,
                language: null
            }, this.config);

            this.trans = this.makeTranslator();
            this.listeners = {};
            this.onTextareaChangeHandler = () => this.onTextareaChange();
        }

        connect() {
            this.textarea = this.element.querySelector(':scope > textarea');
            if (!this.textarea) {
                return;
            }

            Promise.all([loadEasyMde(), loadLanguage(this.config.language)]).then(([{ EasyMDE, DOMPurify }]) => {
                // The field may have left the page while EasyMDE loaded
                if (!this.textarea) {
                    return;
                }

                this.EasyMDE = EasyMDE;
                this.trans = this.makeTranslator();
                this.initEditor(EasyMDE, DOMPurify);
            });
        }

        disconnect() {
            if (this.updateFrame) {
                cancelAnimationFrame(this.updateFrame);
            }

            if (this.textarea) {
                this.textarea.removeEventListener('change', this.onTextareaChangeHandler);
            }

            if (this.editor) {
                this.editor.toTextArea();
                this.editor.cleanup();
            }

            this.editor = null;
            this.textarea = null;
            this.listeners = {};
        }

        initEditor(EasyMDE, DOMPurify) {
            const renderingConfig = {};
            const external = !!this.config.externalToolbar;

            if (this.config.safeMode) {
                renderingConfig.sanitizerFunction = (html) => DOMPurify.sanitize(html);
            }

            this.editor = new EasyMDE({
                element: this.textarea,
                toolbar: external ? false : this.getToolbar(EasyMDE),
                placeholder: this.textarea.getAttribute('placeholder') || undefined,
                minHeight: SIZE_HEIGHTS[this.config.size] || SIZE_HEIGHTS.large,
                autoDownloadFontAwesome: false,
                // Fields in hidden tabs draw once they show
                autoRefresh: { delay: 300 },
                spellChecker: false,
                nativeSpellcheck: true,
                previewImagesInEditor: false,
                sideBySideFullscreen: false,
                syncSideBySidePreviewScroll: true,
                status: !external,
                previewRender: (text) => this.renderPreview(text),
                renderingConfig
            });

            this.lastValue = this.editor.value();

            const codemirror = this.editor.codemirror;
            codemirror.on('change', this.proxy(this.onEditorChange));
            codemirror.on('focus', this.proxy(this.onFocus));
            codemirror.on('blur', this.proxy(this.onBlur));
            codemirror.on('cursorActivity', this.proxy(this.scheduleUpdate));
            this.textarea.addEventListener('change', this.onTextareaChangeHandler);

            if (this.config.viewMode === 'split') {
                this.editor.toggleSideBySide();
            }

            this.element.dispatchEvent(new CustomEvent('markdowneditor:ready', { bubbles: true, detail: { markdownEditor: this } }));
        }

        // Builds EasyMDE buttons from the field toolbar, each running the EasyMDE action of its name
        getToolbar(EasyMDE) {
            return this.toolbarButtons()
                .map((button) => {
                    if (button === '|') {
                        return '|';
                    }

                    const action = button && EasyMDE[BUTTON_ACTIONS[button.name]];
                    if (typeof action !== 'function') {
                        return null;
                    }

                    return {
                        name: button.name,
                        title: this.buttonLabel(button),
                        icon: button.icon,
                        action: action,
                        noDisable: VIEW_BUTTONS.includes(button.name),
                        noMobile: DESKTOP_BUTTONS.includes(button.name)
                    };
                })
                .filter(Boolean);
        }

        toolbarButtons() {
            return Array.isArray(this.config.toolbarButtons) ? this.config.toolbarButtons : [];
        }

        makeTranslator() {
            return makeTranslator('markdowneditor', DEFAULT_LANG, { language: this.config.language });
        }

        // heading-1 is labelled by heading1, a button with no label of its own by its title
        buttonLabel(button) {
            const key = button.name.replace(/-([a-z0-9])/g, (match, letter) => letter.toUpperCase());

            return this.trans(key, button.title || button.name);
        }

        onEditorChange() {
            const value = this.editor.value();
            if (value === this.lastValue) {
                return;
            }

            this.lastValue = value;
            this.textarea.value = value;
            this.dispatchingChange = true;
            this.textarea.dispatchEvent(new Event('change', { bubbles: true }));
            this.dispatchingChange = false;
            this.scheduleUpdate();
        }

        // A value set on the textarea from outside, announced with a change event, reaches the editor
        onTextareaChange() {
            if (this.dispatchingChange || !this.editor || this.textarea.value === this.lastValue) {
                return;
            }

            this.lastValue = this.textarea.value;
            this.editor.value(this.textarea.value);
        }

        // The page may change the markdown first, see the preparePreview hook. EasyMDE's own rendering
        // applies the sanitizer in safe mode
        renderPreview(text) {
            const preparePreview = markdownEditor.hooks.preparePreview;

            if (typeof preparePreview === 'function') {
                text = preparePreview(text, this);

                if (text === null) {
                    return null;
                }
            }

            return this.editor.markdown(text);
        }

        onFocus() {
            this.element.classList.add('editor-focus');
        }

        onBlur() {
            this.element.classList.remove('editor-focus');
        }

        //
        // Toolbar drawn by the page
        //

        on(name, listener) {
            (this.listeners[name] = this.listeners[name] || []).push(listener);
        }

        off(name, listener) {
            this.listeners[name] = (this.listeners[name] || []).filter((item) => item !== listener);
        }

        emit(name, ...args) {
            (this.listeners[name] || []).slice().forEach((listener) => listener(...args));
        }

        // Batched to one update per frame
        scheduleUpdate() {
            if (this.updateFrame) {
                return;
            }

            this.updateFrame = requestAnimationFrame(() => {
                this.updateFrame = null;
                this.emit('update');
            });
        }

        /**
         * getToolbarItems lists the toolbar in order, { type: 'separator' } and { type: 'button', code }.
         * The page handles fullscreen itself, so it is left out with an external toolbar.
         */
        getToolbarItems() {
            const items = [];

            this.toolbarButtons().forEach((button) => {
                if (button === '|') {
                    if (items.length && items[items.length - 1].type !== 'separator') {
                        items.push({ type: 'separator' });
                    }
                    return;
                }

                if (!button || !BUTTON_ACTIONS[button.name]) {
                    return;
                }

                if (this.config.externalToolbar && button.name === 'fullscreen') {
                    return;
                }

                items.push({ type: 'button', code: button.name });
            });

            if (items.length && items[items.length - 1].type === 'separator') {
                items.pop();
            }

            return items;
        }

        /**
         * getButtonState describes a button as it stands: its label, icon class, and whether it is
         * active or disabled, all but the view buttons being disabled in the preview.
         */
        getButtonState(code) {
            const button = this.toolbarButtons().find((item) => item && item.name === code);
            if (!button || !BUTTON_ACTIONS[code]) {
                return null;
            }

            const editor = this.editor;
            let active = false;

            if (editor) {
                if (code === 'preview') {
                    active = editor.isPreviewActive();
                }
                else if (code === 'side-by-side') {
                    active = editor.isSideBySideActive();
                }
                else if (code === 'fullscreen') {
                    active = editor.isFullscreenActive();
                }
                else if (STATE_KEYS.includes(code)) {
                    active = !!editor.getState()[code];
                }
            }

            return {
                code,
                label: this.buttonLabel(button),
                icon: button.iconClass || null,
                type: 'button',
                active,
                disabled: !editor || (editor.isPreviewActive() && !VIEW_BUTTONS.includes(code))
            };
        }

        /**
         * activateButton runs a button's EasyMDE action. Without an editor toolbar, side by side leaves
         * the full preview first, as EasyMDE expects its toolbar there.
         */
        activateButton(code) {
            const state = this.getButtonState(code);
            if (!state || state.disabled) {
                return;
            }

            if (code === 'fullscreen' && this.config.externalToolbar) {
                return;
            }

            if (code === 'side-by-side' && this.config.externalToolbar && this.editor.isPreviewActive()) {
                this.editor.togglePreview();
            }

            this.EasyMDE[BUTTON_ACTIONS[code]](this.editor);
            this.scheduleUpdate();
        }

        getEditorObject() {
            return this.editor;
        }

        getContent() {
            return this.editor ? this.editor.value() : this.textarea.value;
        }

        setContent(value) {
            if (this.editor) {
                this.editor.value(value);
            }
            else {
                this.textarea.value = value;
            }
        }

        togglePreview() {
            if (this.editor) {
                this.editor.togglePreview();
                this.scheduleUpdate();
            }
        }

        toggleSideBySide() {
            if (!this.editor) {
                return;
            }

            if (this.config.externalToolbar && this.editor.isPreviewActive()) {
                this.editor.togglePreview();
            }

            this.editor.toggleSideBySide();
            this.scheduleUpdate();
        }

        toggleFullscreen() {
            if (this.editor) {
                this.editor.toggleFullScreen();
            }
        }
    });

    function loadEasyMde() {
        if (!easyMdePromise) {
            easyMdePromise = import('../../vendor/easymde/easymde.esm.js');
        }

        return easyMdePromise;
    }
}
