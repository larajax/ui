/*
 * Markdown Editor form field control
 *
 * Data attributes:
 * - data-control="markdowneditor" - enables the markdown editor plugin
 * - data-view-mode="tab" - split opens the preview beside the editor
 * - data-safe-mode="true" - runs the preview HTML through DOMPurify
 * - data-size="large" - the field size, which sets the editor height
 * - data-toolbar-buttons="[...]" - the toolbar, EasyMDE button names with their title and icon
 *   markup, and "|" between groups
 *
 * JavaScript API:
 * jax.fetchControl(element, 'markdowneditor').getEditorObject()
 *
 * Dependencies:
 * - EasyMDE (vendor/easymde/easymde.esm.js)
 */
'use strict';

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

export function registerMarkdownEditor(jax) {
    jax.registerControl('markdowneditor', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({
                viewMode: 'tab',
                safeMode: true,
                size: 'large',
                toolbarButtons: null
            }, this.config);
        }

        connect() {
            this.textarea = this.element.querySelector(':scope > textarea');
            if (!this.textarea) {
                return;
            }

            loadEasyMde().then(({ EasyMDE, DOMPurify }) => {
                // The field may have left the page while EasyMDE loaded
                if (!this.textarea) {
                    return;
                }

                this.initEditor(EasyMDE, DOMPurify);
            });
        }

        disconnect() {
            if (this.editor) {
                this.editor.toTextArea();
                this.editor.cleanup();
            }

            this.editor = null;
            this.textarea = null;
        }

        initEditor(EasyMDE, DOMPurify) {
            const renderingConfig = {};

            if (this.config.safeMode) {
                renderingConfig.sanitizerFunction = (html) => DOMPurify.sanitize(html);
            }

            this.editor = new EasyMDE({
                element: this.textarea,
                toolbar: this.getToolbar(EasyMDE),
                placeholder: this.textarea.getAttribute('placeholder') || undefined,
                minHeight: SIZE_HEIGHTS[this.config.size] || SIZE_HEIGHTS.large,
                autoDownloadFontAwesome: false,
                spellChecker: false,
                nativeSpellcheck: true,
                previewImagesInEditor: false,
                sideBySideFullscreen: false,
                syncSideBySidePreviewScroll: true,
                status: true,
                renderingConfig
            });

            this.lastValue = this.editor.value();

            const codemirror = this.editor.codemirror;
            codemirror.on('change', this.proxy(this.onEditorChange));
            codemirror.on('focus', this.proxy(this.onFocus));
            codemirror.on('blur', this.proxy(this.onBlur));

            if (this.config.viewMode === 'split') {
                this.editor.toggleSideBySide();
            }
        }

        // Builds EasyMDE buttons from the field toolbar, each running the EasyMDE action of its name
        getToolbar(EasyMDE) {
            const buttons = Array.isArray(this.config.toolbarButtons) ? this.config.toolbarButtons : [];

            return buttons
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
                        title: button.title,
                        icon: button.icon,
                        action: action,
                        noDisable: VIEW_BUTTONS.includes(button.name),
                        noMobile: DESKTOP_BUTTONS.includes(button.name)
                    };
                })
                .filter(Boolean);
        }

        onEditorChange() {
            const value = this.editor.value();
            if (value === this.lastValue) {
                return;
            }

            this.lastValue = value;
            this.textarea.value = value;
            this.textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }

        onFocus() {
            this.element.classList.add('editor-focus');
        }

        onBlur() {
            this.element.classList.remove('editor-focus');
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
            }
        }

        toggleSideBySide() {
            if (this.editor) {
                this.editor.toggleSideBySide();
            }
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
