import { createDocument } from '@tiptap/core';
import { formatHtml } from '../html/formatter.js';
import { normalizeHtml } from '../html/normalizer.js';
import { serializeDocument } from '../html/serializer.js';
import { h } from './dom.js';

/**
 * SourceView swaps the document for its formatted HTML, using a plain textarea unless the
 * host supplies a code editor through the sourceEditor option.
 */
export class SourceView {
    constructor(richArea, element) {
        this.richArea = richArea;
        this.element = element;
        this.active = false;
        this.adapter = null;
        this.changeTimer = null;
    }

    isActive() {
        return this.active;
    }

    toggle() {
        if (this.active) {
            this.deactivate();
        }
        else {
            this.activate();
        }
    }

    activate() {
        const re = this.richArea;
        if (this.active) {
            return;
        }

        re.floating.close();

        this.adapter = this.createAdapter(formatHtml(re.getContent()));
        this.active = true;

        re.root.classList.add('is-source-mode');
        re.documentElement.hidden = true;
        this.element.hidden = false;
        this.pinHeight();

        this.adapter.focus();
        re.refreshUi();
        re.emit('sourceToggle', true);
    }

    deactivate({ apply = true } = {}) {
        const re = this.richArea;
        if (!this.active) {
            return;
        }

        const value = this.adapter.getValue();

        clearTimeout(this.changeTimer);
        this.adapter.destroy();
        this.adapter = null;
        this.active = false;

        this.element.hidden = true;
        this.element.style.minHeight = '';
        this.element.replaceChildren();
        re.documentElement.hidden = false;
        re.root.classList.remove('is-source-mode');

        if (apply) {
            re.setContent(value, { emitChange: true, undoable: true });
        }

        re.focus();
        re.refreshUi();
        re.emit('sourceToggle', false);
    }

    /**
     * pinHeight holds the view at the height of the document it replaces so toggling it keeps the
     * editor size, except in fullscreen where it fills the screen.
     */
    pinHeight() {
        const re = this.richArea;
        const documentElement = re.documentElement;

        this.element.style.minHeight = '';
        if (!this.active || re.isFullscreen) {
            return;
        }

        documentElement.hidden = false;
        this.element.style.minHeight = documentElement.offsetHeight + 'px';
        documentElement.hidden = true;
    }

    /**
     * setValue replaces the source text, used when content is set while the view is open.
     */
    setValue(html) {
        if (this.adapter) {
            this.adapter.setValue(formatHtml(html));
        }
    }

    /**
     * getCleanContent parses the source through the schema, so saving from the source view
     * produces the same clean HTML as the document.
     */
    getCleanContent() {
        const re = this.richArea;
        const doc = createDocument(normalizeHtml(this.adapter.getValue()), re.editor.schema);

        return serializeDocument(doc, re.editor.schema, re.options);
    }

    createAdapter(value) {
        const factory = this.richArea.options.sourceEditor;
        if (typeof factory === 'function') {
            return factory(this.element, { value, onChange: () => this.onChange() });
        }

        const textarea = h('textarea', {
            className: 'rich-editor-source-textarea',
            spellcheck: 'false',
            'aria-label': this.richArea.trans('html')
        });

        textarea.value = value;
        textarea.addEventListener('input', () => this.onChange());
        this.element.appendChild(textarea);

        return {
            getValue: () => textarea.value,
            setValue: (html) => {
                textarea.value = html;
            },
            focus: () => textarea.focus(),
            destroy: () => textarea.remove()
        };
    }

    onChange() {
        clearTimeout(this.changeTimer);
        this.changeTimer = setTimeout(() => this.richArea.emitChange(), 300);
    }

    destroy() {
        clearTimeout(this.changeTimer);

        if (this.adapter) {
            this.adapter.destroy();
            this.adapter = null;
        }
    }
}
