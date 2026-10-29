/*
 * Popup control
 *
 * Displays a modal popup on a native <dialog> styled with Bootstrap's dialog
 * classes, with its content loaded from an AJAX handler, a URL, or supplied directly.
 *
 * Data attributes:
 * - data-control="popup" - opens a popup when the element is clicked
 * - data-handler="onLoadContent" - AJAX handler that returns the popup contents
 * - data-ajax="popup-content.htm" - URL to load the popup contents from
 * - data-extra-data="file_id: 1" - extra request data (data-request-data also applies)
 * - data-size="large" - popup size: tiny, small, large, huge, giant, fullscreen, adaptive, auto or a pixel width
 * - data-keyboard="false" - disallow closing the popup with the Escape key
 * - data-backdrop="true" - close on a backdrop click; "static" (default) bounces the popup, false ignores the click
 * - data-adaptive-height="true" - stretch the popup to the window height
 * - data-dismiss="popup" - inside a popup, closes it when clicked
 * - data-popup-load-indicator - inside a popup, on a request element, hides the popup
 *   behind the loading indicator while that request runs
 *
 * Events, dispatched on the trigger element and the popup's first content div with
 * detail { popup, trigger, modal }, where modal is the dialog element: popup:show,
 * popup:shown, popup:hide, popup:hidden, popup:complete, popup:error, popup:toggle,
 * popup:download. Dispatching popup:close on the popup container closes it.
 *
 * JavaScript API:
 *
 *     import { Popup } from './controls/popup/popup.js';
 *
 *     Popup.open({ handler: 'onLoadContent', extraData: { id: 3 } });
 *     Popup.fromElement(link, { ajax: 'popup-content.htm' });
 *     Popup.getInstance(element).hide();
 *     jax.popup.bindToPopups('#container', { file_id: 1 });
 */
'use strict';

import { PopupStacker } from './popup-stacker.js';

// Framework instance bound by registerPopup
let jax = null;

// Popup instances keyed by trigger element, popup container and first content div
const instances = new WeakMap();

// Popup sizes that have a Bootstrap dialog size class
const sizeClasses = {
    tiny: 'dialog-sm',
    large: 'dialog-lg',
    giant: 'dialog-xl',
    fullscreen: 'dialog-fullscreen'
};

export class Popup
{
    static DEFAULTS = {
        ajax: null,
        handler: null,
        keyboard: true,
        backdrop: 'static',
        extraData: {},
        content: null,
        size: null,
        adaptiveHeight: false,
        zIndex: null
    };

    constructor(element, options) {
        this.options = options;
        this.el = element;
        this.container = null;
        this.backdrop = null;
        this.isOpen = false;
        this.isLoading = false;
        this.isConcealed = false;
        this.isBackdropPress = false;
        this.firstDiv = null;
        this.allowHide = true;
        this.dismissBound = false;
        this.resizeObserver = null;
        this.listeners = [];

        instances.set(element, this);

        // The dialog is the popup box, so all three references point at it
        this.container = this.createPopupContainer();
        this.content = this.container;
        this.dialog = this.container;

        this.initEvents();
        this.init();
    }

    init() {
        var self = this;

        // Do not allow the same popup to open twice
        if (self.isOpen) {
            return;
        }

        // Show loading panel
        if (!this.options.content) {
            this.setBackdrop(true);
            this.setLoading(true);
        }

        // Larajax AJAX
        if (this.options.handler) {
            jax.request(this.el, this.options.handler, {
                data: paramToObj('data-extra-data', this.options.extraData),
                success: function(data, statusCode, xhr) {
                    if (data instanceof Blob) {
                        if (self.isLoading) {
                            self.hideLoading();
                        }
                        else {
                            self.hide();
                        }
                        self.triggerEvent('popup:download');
                        this.success(data, statusCode, xhr);
                        return;
                    }

                    this.success(data, statusCode, xhr).done(() => {
                        self.setContent(data.result);
                        jax.Events.dispatch('ajax:update-complete', {
                            target: window,
                            detail: { context: this, data, responseCode: statusCode, xhr }
                        });
                        self.triggerEvent('popup:complete');
                    });
                },
                error: function(data, statusCode, xhr) {
                    this.error(data, statusCode, xhr).done(() => {
                        if (self.isLoading) {
                            self.hideLoading();
                        }
                        else {
                            self.hide();
                        }
                        self.triggerEvent('popup:error');
                    });
                },
                cancel: function() {
                    if (self.isLoading) {
                        self.hideLoading();
                    }
                    else {
                        self.hide();
                    }
                }
            });
        }
        // Regular AJAX
        else if (this.options.ajax) {
            const url = new URL(this.options.ajax, window.location.href);
            const data = paramToObj('data-extra-data', this.options.extraData);

            Object.entries(data).forEach(([key, value]) => url.searchParams.append(key, value));

            // Matches jQuery's cache: false
            url.searchParams.set('_', Date.now());

            fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
                .then((response) => response.text())
                .then((html) => self.setContent(html));
        }
        // Specified content
        else if (this.options.content) {
            var content = typeof this.options.content == 'function'
                ? this.options.content.call(this.el, this)
                : this.options.content;

            this.setContent(content);
        }
    }

    initEvents() {
        // Duplicate the popup reference on the .control-popup container
        instances.set(this.container, this);

        // Escape is a native cancel request, handled here so closing animates
        this.listen('cancel', (ev) => {
            ev.preventDefault();

            if (!this.isOpen) {
                return;
            }

            if (!this.options.keyboard) {
                this.bounce();
                return;
            }

            this.hide();
        });

        // The browser can still close the dialog itself, which then closes the popup
        this.listen('close', () => {
            if (!this.isOpen || this.isConcealed || this.container.open) {
                return;
            }

            if (!this.allowHide) {
                this.container.showModal();
                return;
            }

            this.hide();
        });

        // A backdrop click must also start on the backdrop, so a drag out of the popup is not one
        this.listen('mousedown', (ev) => {
            this.isBackdropPress = ev.target === this.container && isOutside(this.container, ev);
        }, false);

        this.listen('click', (ev) => this.onBackdropClick(ev));

        // Also closes when triggered from an element inside the popup
        this.listen('popup:close', (ev) => {
            this.hide();
            ev.preventDefault();
            ev.stopPropagation();
        }, false);

        jax.Events.dispatch('popup:show');
    }

    // Binds a container listener, by default only for events targeting the dialog itself
    listen(eventName, handler, ownEventsOnly = true) {
        const listener = (ev) => {
            if (!ownEventsOnly || ev.target === this.container) {
                handler(ev);
            }
        };

        this.container.addEventListener(eventName, listener);
        this.listeners.push([eventName, listener]);
    }

    dispose() {
        this.listeners.forEach(([eventName, listener]) => {
            this.container.removeEventListener(eventName, listener);
        });
        this.listeners = [];

        if (this.dismissBound) {
            this.container.removeEventListener('click', this.onDismissClick);
        }

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        instances.delete(this.el);
        instances.delete(this.container);

        if (this.firstDiv) {
            instances.delete(this.firstDiv);
        }

        this.container = null;
        this.content = null;
        this.dialog = null;
        this.firstDiv = null;
        this.el = null;

        // In some cases options could contain callbacks,
        // so it's better to clean them up too.
        this.options = null;
    }

    createPopupContainer() {
        var dialog = document.createElement('dialog');

        dialog.className = 'control-popup dialog';

        // Focus lands on the dialog itself, the content's autofocus elements follow after the animation
        dialog.tabIndex = -1;
        dialog.setAttribute('autofocus', '');

        // Browsers that support it then ignore Escape, which could otherwise force the dialog closed
        if (!this.options.keyboard) {
            dialog.setAttribute('closedby', 'none');
        }

        if (this.options.adaptiveHeight) {
            dialog.classList.add('adaptive-height');
        }

        this.container = dialog;
        this.applySize(this.options.size);

        return dialog;
    }

    /**
     * applySize maps a popup size onto Bootstrap's dialog size classes, replacing any earlier size.
     */
    applySize(size) {
        var dialog = this.container;

        Array.from(dialog.classList)
            .filter((name) => name.startsWith('size-') || Object.values(sizeClasses).includes(name))
            .forEach((name) => dialog.classList.remove(name));

        dialog.style.removeProperty('--bs-dialog-width');

        if (size === null || size === undefined || size === '') {
            return;
        }

        size = String(size);
        dialog.classList.add('size-' + size);

        if (sizeClasses[size]) {
            dialog.classList.add(sizeClasses[size]);
        }
        else if (/^\d+$/.test(size)) {
            dialog.style.setProperty('--bs-dialog-width', size + 'px');
        }
    }

    setContent(contents) {
        var contentNode = parseContents(contents),
            firstElement = contentNode.nodeType === Node.ELEMENT_NODE ? contentNode : contentNode.firstElementChild;

        // Set the popup size from the inner contents instead
        // of needing it from the calling code
        if (firstElement && firstElement.dataset.popupSize) {
            this.applySize(firstElement.dataset.popupSize);
        }
        else {
            var defaultSize = contentNode.querySelector('[data-popup-size]');
            if (defaultSize) {
                this.applySize(defaultSize.dataset.popupSize);
            }
        }

        this.setLoading(false);

        if (!this.container.isConnected) {
            document.body.appendChild(this.container);
        }

        this.content.replaceChildren(contentNode);
        var isOpening = this.openDialog();
        activateScripts(this.content);
        this.triggerShowEvent();

        // Duplicate the popup object reference on to the first div
        // inside the popup. Eg: Popup.getInstance(firstDiv).hide()
        this.firstDiv = this.content.querySelector(':scope > div');
        if (this.firstDiv) {
            instances.set(this.firstDiv, this);
        }

        this.observeContent();

        if (isOpening) {
            this.afterOpen();
        }

        var defaultFocus = Array.from(this.content.querySelectorAll('[default-focus],[autofocus]'));
        if (defaultFocus.some(isVisible)) {
            window.setTimeout(function() {
                defaultFocus.forEach((el) => el.focus());
                defaultFocus = null;
            }, 300);
        }
    }

    /**
     * openDialog shows the dialog as a modal in the browser's top layer, returning false when it was already open.
     */
    openDialog() {
        var dialog = this.container;

        if (!dialog.isConnected) {
            document.body.appendChild(dialog);
        }

        if (dialog.open) {
            dialog.classList.add('show');
            return false;
        }

        this.isOpen = true;
        this.isConcealed = false;

        // The loading backdrop already dims the page, so the dialog backdrop starts dimmed
        if (this.backdrop) {
            dialog.classList.add('dialog-swap-in');
        }

        // Reading the layout settles the closed style, so the opening transition runs
        void dialog.offsetWidth;

        dialog.showModal();
        dialog.classList.add('show');
        document.documentElement.classList.add('dialog-open');
        this.setBackdrop(false);

        return true;
    }

    /**
     * afterOpen fires popup:shown once the opening transition ends.
     */
    afterOpen() {
        var dialog = this.container;

        afterTransition(dialog, () => {
            if (this.container !== dialog || !this.isOpen) {
                return;
            }

            dialog.classList.remove('dialog-swap-in');
            this.updateScrollable();
            this.triggerEvent('popup:shown');
        });
    }

    /**
     * hideDialog runs the closing transition, then closes the dialog and removes the popup.
     */
    hideDialog() {
        var dialog = this.container;

        this.triggerEvent('popup:hide');
        this.isOpen = false;
        this.setBackdrop(false);

        dialog.classList.remove('show', 'dialog-static');
        dialog.classList.add('hiding');

        afterTransition(dialog, () => this.closeDialog());
    }

    /**
     * closeDialog closes the native dialog while it is still connected, so its close event reaches the stacker.
     */
    closeDialog() {
        var dialog = this.container;
        if (!dialog) {
            return;
        }

        dialog.addEventListener('close', () => this.onDialogHidden(), { once: true });

        if (dialog.open) {
            dialog.close();
        }
        else {
            dialog.dispatchEvent(new Event('close'));
        }
    }

    onDialogHidden() {
        var dialog = this.container;
        if (!dialog) {
            return;
        }

        dialog.classList.remove('hiding');
        this.triggerEvent('popup:hidden');
        dialog.remove();

        if (!document.querySelector('dialog[open]:modal')) {
            document.documentElement.classList.remove('dialog-open');
        }

        this.dispose();
    }

    onBackdropClick(ev) {
        var isBackdropPress = this.isBackdropPress;
        this.isBackdropPress = false;

        if (!isBackdropPress || !this.isOpen || !this.container.classList.contains('show') || !isOutside(this.container, ev)) {
            return;
        }

        if (this.options.backdrop === false) {
            return;
        }

        if (this.options.backdrop === 'static') {
            this.bounce();
            return;
        }

        this.hide();
    }

    /**
     * bounce briefly scales the popup up to show that it stays open.
     */
    bounce() {
        var dialog = this.container;
        if (!dialog || dialog.classList.contains('dialog-static')) {
            return;
        }

        dialog.classList.add('dialog-static');

        afterTransition(dialog, () => dialog.classList.remove('dialog-static'));
    }

    // Watches the content size, since the popup only scrolls while its content outgrows the window
    observeContent() {
        if (typeof ResizeObserver === 'undefined') {
            return;
        }

        if (!this.resizeObserver) {
            this.resizeObserver = new ResizeObserver(() => this.updateScrollable());
        }

        this.resizeObserver.disconnect();
        this.resizeObserver.observe(this.container);
        Array.from(this.container.children).forEach((child) => this.resizeObserver.observe(child));
    }

    /**
     * updateScrollable scrolls the popup as a whole only while its content is taller than the dialog allows,
     * because a scrolling dialog clips the menus and pickers mounted inside it.
     */
    updateScrollable() {
        var dialog = this.container;
        if (!dialog || !dialog.open) {
            return;
        }

        var contentHeight = Array.from(dialog.children).reduce((height, child) => {
            var style = getComputedStyle(child);

            if (style.position === 'absolute' || style.position === 'fixed') {
                return height;
            }

            return height + child.offsetHeight + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
        }, 0);

        dialog.classList.toggle('popup-scrollable', contentHeight > dialog.clientHeight + 1);
    }

    setBackdrop(val) {
        if (val && !this.backdrop) {
            var isOverPopup = !!(this.container && this.container.open);

            this.backdrop = document.createElement('div');
            this.backdrop.className = 'popup-backdrop fade';

            // Over its own open popup the dialog backdrop already dims the page
            if (isOverPopup) {
                this.backdrop.classList.add('popup-backdrop-clear');
            }

            var indicator = document.createElement('div');
            indicator.className = 'popup-loading-indicator';
            this.backdrop.appendChild(indicator);

            // Inside the open dialog it renders above it and stays outside the inert page
            var parent = isOverPopup
                ? this.container
                : (this.el && this.el.isConnected && this.el.closest('dialog[open]')) || document.body;

            parent.appendChild(this.backdrop);
            showInTopLayer(this.backdrop);

            this.backdrop.classList.add('show');
        }
        else if (!val && this.backdrop) {
            this.backdrop.remove();
            this.backdrop = null;
        }
    }

    setLoading(val) {
        // An open popup hidden behind the loading indicator needs a backdrop to hold it
        if (val && !this.backdrop && this.isOpen) {
            this.setBackdrop(true);
        }

        if (!this.backdrop) {
            return;
        }

        this.isLoading = val;

        if (val) {
            setTimeout(() => {
                if (this.backdrop) {
                    this.backdrop.classList.add('loading');
                }
            }, 100);
        }
        else {
            setTimeout(() => {
                if (this.backdrop) {
                    this.backdrop.classList.remove('loading');
                }
            }, 100);
        }
    }

    setShake() {
        var content = this.content;

        content.classList.add('popup-shaking');

        setTimeout(function() {
            content.classList.remove('popup-shaking');
        }, 1000);
    }

    hideLoading(val) {
        this.setLoading(false);

        // Wait for animations to complete
        var self = this;
        setTimeout(function() { self.setBackdrop(false) }, 250);
        setTimeout(function() { self.hide() }, 300);
    }

    triggerEvent(eventName, params) {
        var detail = Object.assign({
            popup: this,
            trigger: this.el,
            modal: this.container,
            relatedTarget: this.container
        }, params);

        this.el.dispatchEvent(new CustomEvent(eventName, { bubbles: true, cancelable: true, detail }));

        if (this.firstDiv) {
            this.firstDiv.dispatchEvent(new CustomEvent(eventName, { bubbles: true, cancelable: true, detail }));
        }
    }

    reload() {
        this.init();
    }

    show() {
        var isOpening = this.openDialog();
        this.triggerShowEvent();

        if (isOpening) {
            this.afterOpen();
        }
    }

    triggerShowEvent() {
        if (!this.dismissBound) {
            this.onDismissClick = (ev) => {
                var dismiss = ev.target.closest('[data-dismiss="popup"]');
                if (dismiss && this.container.contains(dismiss)) {
                    this.hide();
                }
            };

            this.container.addEventListener('click', this.onDismissClick);
            this.dismissBound = true;
        }

        this.triggerEvent('popup:show');
    }

    hide() {
        if (!this.isOpen) return;

        this.triggerEvent('popup:hide');

        if (this.allowHide) {
            this.hideDialog();
        }
    }

    /*
     * Hide the popup without destroying it,
     * you should call .hide() once finished
     */
    visible(val) {
        var dialog = this.container;

        if (val) {
            this.isConcealed = false;

            if (!dialog.open) {
                dialog.showModal();
            }

            dialog.classList.add('show');
        }
        else {
            this.isConcealed = true;
            dialog.classList.remove('show');

            if (dialog.open) {
                dialog.close();
            }
        }

        this.setBackdrop(false);
    }

    toggle() {
        this.triggerEvent('popup:toggle');

        if (this.isOpen) {
            this.hide();
        }
        else {
            this.show();
        }
    }

    /*
     * Lock the popup from closing
     */
    lock(val) {
        this.allowHide = !val;
    }

    //
    // Static API
    //

    /**
     * getInstance returns the popup for a trigger element, popup container or first content div.
     */
    static getInstance(element) {
        return element ? instances.get(element) || null : null;
    }

    /**
     * fromElement creates the popup on first use, then reloads it or calls the named method.
     */
    static fromElement(element, option, ...args) {
        var data = instances.get(element);

        if (!data) {
            if (!Popup.isAvailable()) {
                return null;
            }

            var options = Object.assign({}, Popup.DEFAULTS, readDataOptions(element), typeof option == 'object' && option);
            data = new Popup(element, options);
        }
        else if (typeof option == 'string') {
            data[option].apply(data, args);
        }
        else {
            data.reload();
        }

        return data;
    }

    /**
     * open shows a popup without a trigger element.
     */
    static open(option) {
        return Popup.fromElement(document.createElement('a'), option);
    }

    /**
     * bindToPopups transfers the supplied variables as hidden form inputs to any popup
     * that is spawned within the supplied container. The spawned popup must contain a form element.
     */
    static bindToPopups(container, vars) {
        resolveElements(container).forEach((el) => {
            el.addEventListener('popup:show', (ev) => {
                var modal = ev.detail.modal,
                    form = modal && modal.querySelector('form');

                if (form) {
                    Object.entries(vars).forEach(([name, value]) => {
                        var input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = name;
                        input.value = value;
                        form.prepend(input);
                    });
                }

                // Popups spawned within this popup need the variables too
                if (modal) {
                    Popup.bindToPopups(modal, vars);
                }
            });
        });
    }

    /**
     * focusFirstInput focuses the first input when no other autofocus attribute is found,
     * using a delay to account for the CSS animations used by the modal.
     */
    static focusFirstInput(container) {
        setTimeout(function() {
            resolveElements(container).forEach((el) => {
                if (!el.querySelector('[default-focus],[autofocus]')) {
                    var input = el.querySelector('input.form-control');
                    if (input) {
                        input.focus();
                    }
                }
            });
        }, 310);
    }

    /**
     * isAvailable checks the browser supports modal dialogs.
     */
    static isAvailable() {
        if (typeof HTMLDialogElement === 'undefined' || typeof HTMLDialogElement.prototype.showModal !== 'function') {
            console.error('[larajax.ui] The popup control requires a browser with native <dialog> support.');
            return false;
        }

        return true;
    }
}

//
// Helpers
//

function paramToObj(name, value) {
    if (value === undefined || value === null) value = '';
    if (typeof value == 'object') return value;

    try {
        return jax.parseJSON("{" + value + "}");
    }
    catch (e) {
        throw new Error('Error parsing the '+name+' attribute value. '+e);
    }
}

// Reads data attributes with jQuery's data() type conversion
function readDataOptions(element) {
    var options = {};

    Object.entries(element.dataset || {}).forEach(([key, value]) => {
        if (value === 'true') {
            options[key] = true;
        }
        else if (value === 'false') {
            options[key] = false;
        }
        else if (value === 'null') {
            options[key] = null;
        }
        else if (value === +value + '') {
            options[key] = +value;
        }
        else if (/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/.test(value)) {
            try {
                options[key] = JSON.parse(value);
            }
            catch (e) {
                options[key] = value;
            }
        }
        else {
            options[key] = value;
        }
    });

    return options;
}

function parseContents(contents) {
    if (contents instanceof Node) {
        return contents;
    }

    var template = document.createElement('template');
    template.innerHTML = typeof contents == 'string' ? contents.trim() : '';

    return template.content;
}

// Inserted markup does not run its scripts, so recreate them as jQuery's html() would
function activateScripts(container) {
    container.querySelectorAll('script').forEach((oldScript) => {
        var script = document.createElement('script');

        Array.from(oldScript.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
        script.textContent = oldScript.textContent;
        oldScript.replaceWith(script);
    });
}

function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

// Checks a pointer event landed outside the dialog box, on its backdrop
function isOutside(dialog, ev) {
    var rect = dialog.getBoundingClientRect();

    return ev.clientX < rect.left || ev.clientX > rect.right || ev.clientY < rect.top || ev.clientY > rect.bottom;
}

// Shows an element as a manual popover so it renders in the top layer, above open dialogs
function showInTopLayer(element) {
    if (typeof element.showPopover !== 'function') {
        return;
    }

    element.setAttribute('popover', 'manual');
    element.showPopover();
}

// Runs the callback once the element's transition ends, or straight away when it has none
function afterTransition(element, callback) {
    var style = getComputedStyle(element),
        duration = (parseFloat(style.transitionDuration) || 0) + (parseFloat(style.transitionDelay) || 0),
        called = false;

    if (!duration) {
        callback();
        return;
    }

    var done = (ev) => {
        if (called || (ev && ev.target !== element)) {
            return;
        }

        called = true;
        element.removeEventListener('transitionend', done);
        callback();
    };

    element.addEventListener('transitionend', done);
    setTimeout(() => done(), duration * 1000 + 5);
}

function resolveElements(container) {
    if (typeof container == 'string') {
        return Array.from(document.querySelectorAll(container));
    }

    return container ? [container] : [];
}

/*
 * Declarative binding, request loading indicator hooks and the jax.popup / jax.popupStacker globals
 */
export function registerPopup(framework) {
    jax = framework;

    jax.registerControl('popup', class extends jax.ControlBase {
        connect() {
            this.listen('click', this.onClick);
        }

        onClick(ev) {
            ev.preventDefault();

            Popup.fromElement(this.element);
        }
    });

    // Popup loading indicator will only show if the handlers are an exact match.
    function loadIndicatorFor(ev) {
        var el = ev.target instanceof Element ? ev.target.closest('[data-popup-load-indicator]') : null;

        if (!el || !ev.detail || !ev.detail.context || el.dataset.request !== ev.detail.context.handler) {
            return null;
        }

        return el;
    }

    function popupFor(el) {
        return Popup.getInstance(el.closest('.control-popup'));
    }

    // Prevent subsequent requests while loading (mis-doubleclick)
    document.addEventListener('ajax:setup', function(ev) {
        var el = loadIndicatorFor(ev);
        if (!el) return;

        var container = el.closest('.control-popup');
        if (!container || !container.classList.contains('show')) ev.preventDefault();
    });

    // Hide popup during AJAX
    document.addEventListener('ajax:promise', function(ev) {
        var el = loadIndicatorFor(ev);
        if (!el) return;

        var popup = popupFor(el);
        if (popup) {
            popup.container.classList.remove('show');
            popup.setLoading(true);
        }
    });

    // Request failed, show popup again
    document.addEventListener('ajax:fail', function(ev) {
        var el = loadIndicatorFor(ev);
        if (!el) return;

        var popup = popupFor(el);
        if (popup) {
            popup.container.classList.add('show');
            popup.setLoading(false);
            popup.setShake();
        }
    });

    // Request complete, hide loader
    document.addEventListener('ajax:done', function(ev) {
        var el = loadIndicatorFor(ev);
        if (!el) return;

        var popup = popupFor(el);
        popup && popup.hideLoading();
    });

    jax.popup = Popup;
    jax.popupStacker = new PopupStacker();
}
