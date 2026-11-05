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
import { createMenu, focusFirstItem } from './ui/menu.js';
import { formatShortcut } from './ui/tooltip.js';
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
 * Events, subscribed with on(): init, change, focus, blur, sourceToggle, and update after the button
 * states may have changed, for a page drawing its own toolbar.
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
        this.focusElements = [];

        this.buildDom();
        this.floating = new Floating(this);

        this.editor = new Editor({
            element: this.documentElement,
            extensions: buildExtensions(this.options, this).concat(createShortcuts(this)),
            content: normalizeHtml(this.options.content, this.options),
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
        const content = normalizeHtml(html || '', this.options);

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
            || (!!active && active !== document.body && (this.root.contains(active) || this.bubbles.contains(active)
                || this.focusElements.some((element) => element.contains(active))));
    }

    /**
     * addFocusElement counts an element outside the editor, such as a toolbar the page draws, as part
     * of the editor for focus, so the contextual toolbars stay while it is used.
     */
    addFocusElement(element) {
        if (element && !this.focusElements.includes(element)) {
            this.focusElements.push(element);
        }
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
     * resolveButtonIcon returns a button icon from its definition, then the icons option by button
     * code, falling back to the custom button icon.
     */
    resolveButtonIcon(code, definition) {
        if (definition.getIcon) {
            return definition.getIcon(this);
        }

        return definition.icon || this.options.icons[code] || this.options.icons.customButton;
    }

    //
    // Toolbar drawn by the page
    //

    /**
     * getToolbarItems lists the toolbar in order: { type: 'separator' }, { type: 'button', code } and
     * { type: 'group', code, label, buttons: [code] } for sets such as the alignment buttons.
     */
    getToolbarItems() {
        const items = [];
        const addSeparator = () => {
            if (items.length && items[items.length - 1].type !== 'separator') {
                items.push({ type: 'separator' });
            }
        };

        this.options.toolbarButtons.forEach((code) => {
            if (code === '|' || code === '-') {
                addSeparator();
                return;
            }

            const definition = this.getButtonDefinition(code);
            if (!definition) {
                return;
            }

            if (definition.buttons) {
                const buttons = definition.buttons.filter((buttonCode) => {
                    const buttonDefinition = this.getButtonDefinition(buttonCode);
                    return buttonDefinition && !buttonDefinition.buttons;
                });

                if (buttons.length) {
                    addSeparator();
                    items.push({ type: 'group', code, label: this.trans(definition.label || code, definition.label || code), buttons });
                    addSeparator();
                }
                return;
            }

            items.push({ type: 'button', code });
        });

        if (items.length && items[items.length - 1].type === 'separator') {
            items.pop();
        }

        return items;
    }

    /**
     * getButtonState describes a button as it stands: its label, icon or text, shortcut, whether it runs,
     * opens a menu or opens a panel, and whether it is active or disabled.
     */
    getButtonState(code) {
        const definition = this.getButtonDefinition(code);
        if (!definition) {
            return null;
        }

        const label = this.trans(definition.label || code, definition.label || code);
        const disabled = this.isButtonDisabled(definition);

        return {
            code,
            label,
            icon: definition.getLabel ? null : this.resolveButtonIcon(code, definition),
            text: definition.getLabel ? (definition.getLabel(this) || label) : null,
            shortcut: definition.shortcut ? formatShortcut(definition.shortcut, this.trans) : null,
            type: definition.panel ? 'panel' : (definition.menu ? 'menu' : 'button'),
            checkable: !!definition.checkable,
            active: !disabled && definition.isActive ? !!definition.isActive(this) : false,
            disabled
        };
    }

    /**
     * getButtonMenu returns the items of a menu button as they stand, { type, label, icon, active,
     * disabled, style, className, title }. Read them again before each showing, since they follow
     * the selection.
     */
    getButtonMenu(code) {
        const definition = this.getButtonDefinition(code);
        if (!definition || !definition.menu) {
            return [];
        }

        return definition.menu(this).map(({ run, ...item }) => item);
    }

    /**
     * activateButton runs a button, or opens its menu or panel under an anchor element, such as a
     * button of a toolbar the page draws, closing it when it is already open there.
     */
    activateButton(code, { anchor = null, focusMenu = false } = {}) {
        const definition = this.getButtonDefinition(code);
        if (!definition || this.isButtonDisabled(definition)) {
            return;
        }

        const context = { anchor };

        if (!definition.menu && !definition.panel) {
            this.floating.close();
            definition.run(this, context);
            this.refreshUi();
            return;
        }

        if (anchor && this.floating.isOpen(anchor)) {
            this.floating.close();
            return;
        }

        const panel = definition.panel
            ? definition.panel(this, () => this.floating.close(), context)
            : createMenu(definition.menu(this), {
                checkable: !!definition.checkable,
                checkIcon: this.options.icons.check,
                onSelect: (menuItem) => {
                    this.floating.close();
                    menuItem.run(context);
                    this.refreshUi();
                }
            });

        const isElement = anchor && anchor.getBoundingClientRect;
        this.floating.open(panel, isElement && anchor.isConnected ? anchor : () => selectionRect(this.editor), { owner: isElement ? anchor : null });

        if (focusMenu) {
            focusFirstItem(panel);
        }
    }

    /**
     * runMenuItem runs an item of a menu button by its position in getButtonMenu().
     */
    runMenuItem(code, index, { anchor = null } = {}) {
        const definition = this.getButtonDefinition(code);
        const item = definition && definition.menu && !this.isButtonDisabled(definition) ? definition.menu(this)[index] : null;
        if (!item || !item.run || item.disabled) {
            return;
        }

        this.floating.close();
        item.run({ anchor });
        this.refreshUi();
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
            this.emit('update');
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
