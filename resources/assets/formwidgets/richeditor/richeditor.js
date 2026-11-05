/*
 * RichEditor plugin
 *
 * Mounts the RichArea editor over the field textarea and keeps the textarea
 * value in sync with the editor content.
 *
 * Data attributes:
 * - data-control="richeditor" - enables the plugin on an element
 * - data-richeditor-textarea - the textarea holding the field value
 *
 * Config:
 * - toolbarButtons: null - comma separated toolbar buttons, the default list when omitted
 * - readOnly: false - shows the content without editing
 * - useLineBreaks: false - new lines insert line breaks instead of paragraphs
 * - externalToolbar: false - draws no toolbar, the page draws one from the editor's toolbar API
 * - editorOptions: {} - extra editor options, such as paragraphStyles
 * - icons: {} - icon classes keyed by button or element name
 * - language: null - the editor translation to use, such as de, loaded from vendor/richarea/languages
 *   unless the page has it already
 * - lang: {} - strings keyed like the editor's English defaults, over the translation
 * - uploadHandler: null - AJAX handler storing uploads when the page sets no uploadFile hook
 *
 * JavaScript API:
 * jax.fetchControl(element, 'richeditor').richArea
 *
 * Events:
 * - richeditor:ready - on the field once its editor is mounted, with detail.richArea
 */
'use strict';

import { richEditor } from './richeditor-api.js';

// Options a field may not set through editorOptions, since the control or the page owns them
const RESERVED_OPTIONS = ['content', 'readOnly', 'useLineBreaks', 'toolbarButtons', 'buttons', 'hooks', 'extensions', 'sourceEditor'];

// RichArea is shared by every field, loaded on first use
let richAreaPromise = null;

export function registerRichEditor(jax) {
    jax.registerControl('richeditor', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({
                toolbarButtons: null,
                readOnly: false,
                useLineBreaks: false,
                externalToolbar: false,
                editorOptions: {},
                icons: {},
                language: null,
                lang: {},
                uploadHandler: null
            }, this.config);
        }

        connect() {
            this.textarea = this.element.querySelector('textarea[data-richeditor-textarea]');
            if (!this.textarea) {
                return;
            }

            Promise.all([loadRichArea(), loadLanguage(this.config.language)]).then(([{ RichArea, defaultOptions }]) => {
                // The field may have left the page while the editor loaded
                if (!this.textarea) {
                    return;
                }

                this.richArea = new RichArea(this.element, this.getEditorOptions(defaultOptions));
                this.richArea.on('change', this.proxy(this.onChange));
                this.element.dispatchEvent(new CustomEvent('richeditor:ready', { bubbles: true, detail: { richArea: this.richArea } }));
            });
        }

        disconnect() {
            if (this.richArea) {
                this.richArea.destroy();
            }

            this.richArea = null;
            this.textarea = null;
        }

        onChange(html) {
            this.textarea.value = html;
            this.textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }

        getEditorOptions(defaultOptions) {
            const editorOptions = plainObject(this.config.editorOptions),
                options = {};

            Object.keys(editorOptions).forEach((key) => {
                if (key in defaultOptions && !RESERVED_OPTIONS.includes(key)) {
                    options[key] = editorOptions[key];
                }
            });

            return Object.assign(options, {
                content: this.textarea.value,
                placeholder: this.textarea.getAttribute('placeholder') || '',
                readOnly: !!this.config.readOnly,
                useLineBreaks: !!this.config.useLineBreaks,
                externalToolbar: !!this.config.externalToolbar,
                icons: Object.assign({}, plainObject(this.config.icons), plainObject(options.icons)),
                language: this.config.language || null,
                lang: Object.assign({}, plainObject(this.config.lang), plainObject(options.lang)),
                toolbarButtons: richEditor.resolveButtons({ fieldButtons: this.config.toolbarButtons }),
                buttons: richEditor.buttons,
                hooks: this.getHooks()
            });
        }

        // Page hooks, plus the built-in upload when the field has one and the page sets no uploadFile hook
        getHooks() {
            if (!this.config.uploadHandler || richEditor.hooks.uploadFile) {
                return richEditor.hooks;
            }

            return Object.assign({}, richEditor.hooks, {
                uploadFile: this.proxy(this.uploadFile)
            });
        }

        // Posts a file to the field's upload handler, resolving with the address of the stored file
        uploadFile(file, context) {
            return new Promise((resolve, reject) => {
                jax.request(this.element, this.config.uploadHandler, {
                    files: true,
                    data: {
                        file_data: file,
                        file_type: context && context.type === 'image' ? 'image' : 'file'
                    },
                    // The editor reports the failure itself
                    handleErrorMessage() {}
                }).then((data) => {
                    if (data && data.url) {
                        resolve(data.url);
                    }
                    else {
                        reject(new Error(''));
                    }
                }, (data) => {
                    reject(new Error(responseMessage(data)));
                });
            });
        }
    });

    function loadRichArea() {
        if (!richAreaPromise) {
            richAreaPromise = import('../../vendor/richarea/richarea.js');
        }

        return richAreaPromise;
    }

    // A translation registers itself on the page, so one the page bundles needs no request. The editor
    // stays in English when it fails to load
    function loadLanguage(language) {
        const languages = globalThis.RichAreaLanguages || {};

        if (!language || languages[language] || !/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(language)) {
            return Promise.resolve();
        }

        return import(`../../vendor/richarea/languages/${language}.js`).catch(() => {});
    }
}

// Returns the value when it is a plain object, otherwise an empty one
function plainObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

// Reads the message of a failed AJAX response, leaving out server error pages
function responseMessage(data) {
    if (data && data.$env && data.$env.getMessage()) {
        return data.$env.getMessage();
    }

    return typeof data === 'string' && !/^\s*</.test(data) ? data : '';
}
