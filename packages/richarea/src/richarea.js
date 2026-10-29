import { Editor } from '@tiptap/core';
import { buildExtensions } from './extensions/kit.js';
import { createShortcuts } from './extensions/shortcuts.js';
import { normalizeHtml } from './html/normalizer.js';
import { serializeDocument } from './html/serializer.js';
import { cleanPastedHtml } from './html/paste.js';
import { makeOptions, makeParagraphFormats } from './options.js';
import { makeTranslator } from './lang.js';
import { buttonDefinitions, customButtonDefinition } from './commands/index.js';
import { uploadAndInsertImages } from './commands/media.js';
import { selectionRect } from './commands/helpers.js';
import { RichAreaFacade } from './facade.js';
import { Floating } from './ui/floating.js';
import { Toolbar } from './ui/toolbar.js';
import { BubbleManager } from './ui/bubbles.js';
import { ImageResizer } from './ui/resizer.js';
import { SourceView } from './ui/sourceview.js';
import { createForm } from './ui/form.js';
import { h } from './ui/dom.js';

/**
 * imageFiles returns the image files from a clipboard or drag data transfer.
 */
function imageFiles(dataTransfer) {
    return Array.from((dataTransfer && dataTransfer.files) || []).filter((file) => file.type.startsWith('image/'));
}

/**
 * scrollPositions records the scroll offsets of an element's ancestors, the page included.
 */
function scrollPositions(element) {
    const positions = [];

    for (let node = element.parentElement; node; node = node.parentElement) {
        if (node.scrollTop || node.scrollLeft) {
            positions.push({ node, top: node.scrollTop, left: node.scrollLeft });
        }
    }

    return positions;
}

/**
 * RichArea is a rich text editor built on TipTap, with its own toolbar, contextual toolbars and
 * source view, mounted inside a host element and connected to the page through its hooks.
 *
 * Events, subscribed with on(): init, change, focus, blur, sourceToggle.
 */
export class RichArea {
    constructor(element, options = {}) {
        this.element = element;
        this.options = makeOptions(options);
        this.trans = makeTranslator(this.options.lang);
        this.options.paragraphFormat = this.options.paragraphFormat || makeParagraphFormats(this.trans);
        this.listeners = {};
        this.savedBookmark = null;
        this.isFullscreen = false;
        this.fullscreenScroll = null;
        this.refreshFrame = null;

        this.buildDom();
        this.floating = new Floating(this);

        this.editor = new Editor({
            element: this.documentElement,
            extensions: buildExtensions(this.options, this).concat(createShortcuts(this)),
            content: normalizeHtml(this.options.content),
            editable: !this.options.readOnly,
            editorProps: {
                attributes: {
                    class: 'rich-editor-content'
                },
                transformPastedHTML: (html) => cleanPastedHtml(html),
                handlePaste: (view, event) => this.onPasteFiles(event),
                handleDrop: (view, event, slice, moved) => this.onDropFiles(view, event, moved)
            },
            onUpdate: () => this.emitChange(),
            onTransaction: ({ transaction }) => this.onTransaction(transaction),
            onFocus: () => this.onFocus(),
            onBlur: () => this.onBlur()
        });

        this.facade = new RichAreaFacade(this);
        this.toolbar = new Toolbar(this, this.toolbarElement);
        this.bubbles = new BubbleManager(this);
        this.resizer = new ImageResizer(this);
        this.sourceView = new SourceView(this, this.sourceElement);
        this.lastContent = this.getContent();

        this.refreshUi();
        setTimeout(() => this.emit('init', this), 0);
    }

    buildDom() {
        this.root = h('div', { className: 'rich-editor' + (this.options.readOnly ? ' is-read-only' : '') });
        this.toolbarElement = h('div', { className: 'rich-editor-toolbar', role: 'toolbar', 'aria-label': this.trans('toolbar', 'Editor toolbar') });
        this.bodyElement = h('div', { className: 'rich-editor-body' });
        this.documentElement = h('div', { className: 'rich-editor-document' });
        this.sourceElement = h('div', { className: 'rich-editor-source', hidden: true });

        this.bodyElement.append(this.documentElement, this.sourceElement);
        this.root.append(this.toolbarElement, this.bodyElement);
        this.element.appendChild(this.root);
    }

    //
    // Content
    //

    /**
     * getContent returns the clean HTML of the document.
     */
    getContent() {
        if (this.sourceView && this.sourceView.isActive()) {
            return this.sourceView.getCleanContent();
        }

        return serializeDocument(this.editor.state.doc, this.editor.schema, this.options);
    }

    /**
     * setContent replaces the document, where emitChange fires the change event and undoable
     * records it in the undo history, both off for content loaded by the host.
     */
    setContent(html, { emitChange = false, undoable = false } = {}) {
        const content = normalizeHtml(html || '');

        if (this.sourceView && this.sourceView.isActive()) {
            this.sourceView.setValue(html || '');
        }

        this.editor.chain()
            .setMeta('addToHistory', undoable)
            .setContent(content, { emitUpdate: emitChange })
            .run();

        if (!emitChange) {
            this.lastContent = this.getContent();
        }
    }

    /**
     * emitChange fires the change event when the saved HTML actually changed, skipping the
     * serialization entirely when nothing listens.
     */
    emitChange() {
        if (!(this.listeners.change || []).length) {
            return;
        }

        const content = this.getContent();
        if (content === this.lastContent) {
            return;
        }

        this.lastContent = content;
        this.emit('change', content);
    }

    //
    // Selection
    //

    focus({ scroll = true } = {}) {
        if (this.sourceView.isActive()) {
            this.sourceView.adapter.focus();
            return;
        }

        this.editor.commands.focus(null, { scrollIntoView: scroll });
    }

    saveSelection() {
        this.savedBookmark = this.editor.state.selection.getBookmark();
    }

    restoreSelection() {
        if (!this.savedBookmark) {
            return;
        }

        const selection = this.savedBookmark.resolve(this.editor.state.doc);
        this.editor.view.dispatch(this.editor.state.tr.setSelection(selection));
        this.editor.view.focus();
    }

    /**
     * hasFocus checks whether the document, toolbar or an editor popup holds focus.
     */
    hasFocus() {
        const active = document.activeElement;

        return this.editor.view.hasFocus()
            || this.floating.isOpen()
            || (!!active && active !== document.body && (this.root.contains(active) || this.bubbles.contains(active)));
    }

    //
    // Buttons
    //

    /**
     * getButtonDefinition resolves a button code, registered buttons taking precedence.
     */
    getButtonDefinition(code) {
        const custom = this.options.buttons ? this.options.buttons[code] : null;
        if (custom) {
            return customButtonDefinition(code, custom);
        }

        return buttonDefinitions[code] || null;
    }

    /**
     * isButtonDisabled applies the read only and source view states to a button.
     */
    isButtonDisabled(definition) {
        if (this.options.readOnly && !definition.availableReadOnly) {
            return true;
        }

        if (this.sourceView && this.sourceView.isActive() && !definition.availableInSource) {
            return true;
        }

        return definition.isDisabled ? !!definition.isDisabled(this) : false;
    }

    /**
     * openForm shows a popover form below an anchor element, or the selection when omitted.
     */
    openForm(config, anchor) {
        const close = () => this.floating.close();
        const form = createForm({
            ...config,
            onSubmit: (values) => {
                const result = config.onSubmit(values);
                if (typeof result !== 'string') {
                    close();
                }
                return result;
            },
            actions: (config.actions || []).map((action) => ({
                ...action,
                run: (values) => {
                    close();
                    return action.run(values);
                }
            }))
        });

        const isElement = anchor && anchor.getBoundingClientRect;
        const target = isElement && anchor.isConnected ? anchor : () => selectionRect(this.editor);

        this.floating.open(form.element, target, { owner: isElement ? anchor : null });
        form.focus();
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;

        // Locking the page for fullscreen resets its scroll, so the positions are put back instantly on the way out, since pages may scroll smoothly
        if (this.isFullscreen) {
            this.fullscreenScroll = scrollPositions(this.root);
        }

        this.root.classList.toggle('is-fullscreen', this.isFullscreen);
        document.documentElement.classList.toggle('rich-editor-has-fullscreen', this.isFullscreen);
        this.sourceView.pinHeight();
        this.focus({ scroll: false });

        if (!this.isFullscreen && this.fullscreenScroll) {
            this.fullscreenScroll.forEach(({ node, top, left }) => node.scrollTo({ top, left, behavior: 'instant' }));
            this.fullscreenScroll = null;
        }

        this.refreshUi();
    }

    /**
     * refreshUi updates the toolbar and contextual toolbar, batched to one per frame.
     */
    refreshUi() {
        if (this.refreshFrame) {
            return;
        }

        this.refreshFrame = requestAnimationFrame(() => {
            this.refreshFrame = null;

            if (!this.editor || this.editor.isDestroyed) {
                return;
            }

            this.toolbar.refresh();
            this.bubbles.update();
            this.resizer.update();
        });
    }

    //
    // Events
    //

    on(name, callback) {
        (this.listeners[name] = this.listeners[name] || []).push(callback);
        return this;
    }

    off(name, callback) {
        this.listeners[name] = (this.listeners[name] || []).filter((listener) => listener !== callback);
        return this;
    }

    emit(name, ...args) {
        (this.listeners[name] || []).slice().forEach((listener) => listener(...args));
    }

    onTransaction(transaction) {
        if (this.savedBookmark && transaction.docChanged) {
            this.savedBookmark = this.savedBookmark.map(transaction.mapping);
        }

        this.refreshUi();
    }

    onFocus() {
        this.root.classList.add('is-focused');
        this.refreshUi();
        this.emit('focus');
    }

    onBlur() {
        this.root.classList.remove('is-focused');
        setTimeout(() => this.refreshUi(), 0);
        this.emit('blur');
    }

    onPasteFiles(event) {
        const files = imageFiles(event.clipboardData);
        if (!files.length || !this.options.hooks.uploadFile) {
            return false;
        }

        event.preventDefault();
        uploadAndInsertImages(this, files);
        return true;
    }

    onDropFiles(view, event, moved) {
        const files = moved ? [] : imageFiles(event.dataTransfer);
        if (!files.length || !this.options.hooks.uploadFile) {
            return false;
        }

        event.preventDefault();

        const position = view.posAtCoords({ left: event.clientX, top: event.clientY });
        if (position) {
            this.editor.commands.setTextSelection(position.pos);
        }

        uploadAndInsertImages(this, files);
        return true;
    }

    destroy() {
        if (this.refreshFrame) {
            cancelAnimationFrame(this.refreshFrame);
        }

        if (this.isFullscreen) {
            document.documentElement.classList.remove('rich-editor-has-fullscreen');
        }

        this.floating.close();
        this.bubbles.destroy();
        this.resizer.destroy();
        this.sourceView.destroy();
        this.toolbar.destroy();
        this.editor.destroy();
        this.root.remove();
        this.listeners = {};
    }
}
