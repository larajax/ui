/*
 * Tab control
 *
 * Data attributes:
 * - data-control="tab" - enables the tab control on a .control-tabs element
 * - data-closable - enables the close tab feature
 * - data-linkable - reflects the active tab in the URL hash and opens the
 *   tab matching the hash on page load
 * - data-pane-classes - a list of CSS classes to apply new pane elements
 * - data-tab-url - set on a tab anchor, the URL shown in the address bar when the tab is shown
 *
 * Config:
 * - closable - adds the close icon to the tab and lets users close tabs
 * - linkable - reflects the active tab in the URL, see data-linkable
 * - paneClasses - a list of CSS classes to apply new pane elements
 * - titleAsFileNames - treat tab titles as file names, only the file name part is displayed
 * - maxTitleSymbols - the maximum number of characters in tab titles
 * - closeConfirmation - a confirmation to show when a user tries to close a modified tab
 *
 * Events:
 * - tab:shown - dispatched on a tab anchor after its tab is shown
 * - tab:shown-linkable - dispatched on the tab anchor opened from the URL hash
 * - tab:init-tab - dispatched on the control after a tab is set up, detail { pane, tab }
 * - tab:before-close - dispatched on the control before a tab is closed, detail { relatedTarget },
 *   call preventDefault() to cancel
 * - tab:closed - dispatched on the control after a tab is closed, detail { tab, pane }
 * - tab:after-all-closed - dispatched on the control after all tabs have been closed
 *
 * Dispatch these on a tab, a tab pane or any element inside them:
 * - tab:close - closes the tab, detail { force: true } skips the close confirmation
 * - tab:modified - marks the tab as modified
 * - tab:unmodified - marks the tab as unmodified
 *
 * JavaScript API:
 * jax.fetchControl(element, 'tab').addTab(title, content, identifier, tabClass)
 * jax.fetchControl(element, 'tab').updateTab(tab, title, content)
 * jax.fetchControl(element, 'tab').closeTab(tab, force) - tab is a tab or pane element, or a selector
 * jax.fetchControl(element, 'tab').modifyTab(tab) / unmodifyTab(tab)
 * jax.fetchControl(element, 'tab').goTo(identifier) - opens a tab by its identifier
 * jax.fetchControl(element, 'tab').goToIndex(index)
 * jax.fetchControl(element, 'tab').goToPane(pane)
 * jax.fetchControl(element, 'tab').goToElement(element) - shows the tab containing the element
 * jax.fetchControl(element, 'tab').prev() / next()
 *
 * Tabs that do not fit scroll horizontally by dragging or with the mouse wheel.
 * The first invalid field of a failed AJAX validation has its tab shown and is focused.
 */
'use strict';

import DragScroll from '../drag-scroll/drag-scroll.js';

export function registerTab(jax) {
    jax.registerControl('tab', class extends jax.ControlBase {
        init() {
            this.tabId = 'tabs' + countParents(this.element) + Math.round(Math.random() * 1000);
            this.invalidElement = false;
            this.dragScroll = null;

            if (this.config.closable) {
                this.element.setAttribute('data-closable', '');
            }

            // Cast empty attribute
            if (this.config.linkable === '') {
                this.config.linkable = true;
            }
        }

        connect() {
            this.nav = this.element.querySelector('ul.nav-tabs');
            this.content = this.element.querySelector('.tab-content');

            if (!this.nav || !this.content) {
                return;
            }

            this.listen('click', this.onClick);
            this.listen('mousedown', 'li[data-tab-id]', this.onMiddleClickTab);
            this.listen('tab:close', this.onCloseTab);
            this.listen('tab:modified', this.onModifyTab);
            this.listen('tab:unmodified', this.onUnmodifyTab);
            this.listen('tab:shown', this.onContainerTabShown);

            this.tabs().forEach((li) => this.initTab(li));

            this.dragScroll = new DragScroll(this.nav, {
                scrollClassContainer: this.element
            });

            this.updateClasses();
            this.showHashedAnchorTab();
        }

        disconnect() {
            if (this.dragScroll) {
                this.dragScroll.dispose();
                this.dragScroll = null;
            }

            this.nav = null;
            this.content = null;
        }

        onClick(ev) {
            const closeButton = ev.target.closest('.nav-tabs span.tab-close');
            if (closeButton) {
                if (this.ownsElement(closeButton)) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    jax.Events.dispatch('tab:close', { target: closeButton });
                }
                return;
            }

            const anchor = ev.target.closest('.nav-tabs a');
            if (!anchor || !this.ownsElement(anchor)) {
                return;
            }

            ev.preventDefault();
            this.activate(anchor.closest('li'));
        }

        onMiddleClickTab(ev) {
            if (ev.button === 1 && this.ownsElement(ev.target)) {
                jax.Events.dispatch('tab:close', { target: ev.target });
            }
        }

        onCloseTab(ev) {
            if (!this.ownsElement(ev.target)) {
                return;
            }

            ev.preventDefault();

            const force = ev.detail && ev.detail.force !== undefined ? ev.detail.force : false;
            this.closeTab(ev.target.closest('ul.nav-tabs > li, div.tab-content > div'), force);
        }

        onModifyTab(ev) {
            if (!this.ownsElement(ev.target)) {
                return;
            }

            ev.preventDefault();
            this.modifyTab(ev.target.closest('ul.nav-tabs > li, div.tab-content > div'));
        }

        onUnmodifyTab(ev) {
            if (!this.ownsElement(ev.target)) {
                return;
            }

            ev.preventDefault();
            this.unmodifyTab(ev.target.closest('ul.nav-tabs > li, div.tab-content > div'));
        }

        onContainerTabShown(ev) {
            // Nested tab controls handle their own navs
            if (!this.nav || !this.nav.contains(ev.target)) {
                return;
            }

            const anchor = ev.target.closest('a') || ev.target;

            // Relayout controls revealed by the tab, as the framework render cycle does
            jax.Events.dispatch('render');
            dispatchEvent(new Event('resize'));

            let tabUrl = anchor.dataset.tabUrl;

            if (!tabUrl && this.config.linkable) {
                tabUrl = anchor.hash;
            }

            if (tabUrl && !this.invalidElement) {
                if (jax.useTurbo && jax.useTurbo()) {
                    jax.visit(tabUrl, { action: 'swap', scroll: false });
                }
                else {
                    history.replaceState({}, 'Tab link reference', tabUrl);
                }
            }
        }

        // Nested tab controls handle their own tabs and panes
        ownsElement(el) {
            return el.closest('[data-control~="tab"]') === this.element;
        }

        showHashedAnchorTab() {
            if (!location.hash || !this.config.linkable) {
                return;
            }

            const anchor = this.nav.querySelector('a[href="' + CSS.escape(location.hash) + '"], a[name="' + CSS.escape(location.hash.slice(1)) + '"]');
            if (!anchor) {
                return;
            }

            this.activate(anchor.closest('li'));

            // Next tick
            setTimeout(() => {
                jax.Events.dispatch('tab:shown-linkable', { target: anchor });
            }, 1);
        }

        initTab(li) {
            const tabIndex = this.tabs().indexOf(li),
                time = Date.now(),
                anchor = li.querySelector('a'),
                pane = this.panes()[tabIndex];

            if (!anchor || !pane) {
                return;
            }

            // Auto generate the tab pane identifier
            if (!pane.id) {
                pane.id = this.tabId + '-tab-' + tabIndex + time;
            }

            anchor.dataset.target = '#' + pane.id;

            // Setup the required tabs markup if it does not exist already
            if (!anchor.querySelector(':scope > span.title > span')) {
                const title = document.createElement('span'),
                    titleText = document.createElement('span');

                title.className = 'title';
                titleText.append(...anchor.childNodes);
                title.appendChild(titleText);
                anchor.appendChild(title);
            }

            if (!li.querySelector('span.tab-close')) {
                const closeButton = document.createElement('span');
                closeButton.className = 'tab-close';
                closeButton.innerHTML = '<i>&times;</i>';
                li.appendChild(closeButton);
            }

            jax.Events.dispatch('tab:init-tab', { target: this.element, detail: { pane, tab: li } });
        }

        tabs() {
            return [...this.nav.children].filter((el) => el.matches('li'));
        }

        panes() {
            return [...this.content.children].filter((el) => el.matches('.tab-pane'));
        }

        activate(li) {
            const tabs = this.tabs(),
                index = tabs.indexOf(li);

            if (index === -1 || li.classList.contains('active')) {
                return;
            }

            tabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
            this.panes().forEach((pane, i) => pane.classList.toggle('active', i === index));

            const anchor = li.querySelector('a');
            if (anchor) {
                jax.Events.dispatch('tab:shown', { target: anchor });
            }
        }

        addTab(title, content, identifier, tabClass) {
            const processedTitle = this.generateTitleText(title, -1),
                link = document.createElement('a'),
                li = document.createElement('li'),
                pane = document.createElement('div');

            link.setAttribute('href', 'javascript:;');
            link.textContent = processedTitle;
            link.setAttribute('title', title);
            pane.classList.add('tab-pane');

            li.appendChild(link);
            this.nav.appendChild(li);
            this.content.appendChild(pane);
            setPaneContent(pane, content);

            if (tabClass !== undefined) {
                addClasses(link, tabClass);
            }

            if (identifier !== undefined) {
                li.setAttribute('data-tab-id', identifier);
            }

            if (this.config.paneClasses) {
                addClasses(pane, this.config.paneClasses);
            }

            this.initTab(li);
            this.activate(li);

            dispatchEvent(new Event('resize'));

            if (this.dragScroll) {
                this.dragScroll.goToElement(li);
            }

            const defaultFocus = pane.querySelector('[default-focus]');
            if (defaultFocus && isVisible(defaultFocus)) {
                defaultFocus.focus();
            }

            this.updateClasses();
        }

        updateTab(tab, title, content) {
            const tabIndex = this.findTabIndex(tab);
            if (tabIndex === -1) {
                return;
            }

            const processedTitle = this.generateTitleText(title, -1),
                li = this.tabs()[tabIndex],
                pane = this.panes()[tabIndex],
                link = li.querySelector('a');

            if (link) {
                link.textContent = processedTitle;
                link.setAttribute('title', title);
            }

            if (pane) {
                setPaneContent(pane, content);
            }

            this.initTab(li);

            this.updateClasses();
        }

        generateTitleText(title, tabIndex) {
            let newTitle = String(title);

            if (this.config.titleAsFileNames) {
                newTitle = newTitle.replace(/^.*[\\\/]/, '');
            }

            if (this.config.maxTitleSymbols && newTitle.length > this.config.maxTitleSymbols) {
                newTitle = '...' + newTitle.substring(newTitle.length - this.config.maxTitleSymbols);
            }

            return newTitle;
        }

        closeTab(tab, force) {
            const tabIndex = this.findTabIndex(tab);
            if (tabIndex === -1) {
                return;
            }

            const li = this.tabs()[tabIndex],
                pane = this.panes()[tabIndex],
                isActive = li.classList.contains('active'),
                isModified = li.hasAttribute('data-modified');

            if (isModified && this.config.closeConfirmation && force !== true) {
                if (!confirm(this.config.closeConfirmation)) {
                    return;
                }
            }

            const event = jax.Events.dispatch('tab:before-close', {
                target: this.element,
                detail: { relatedTarget: pane }
            });

            if (event.defaultPrevented) {
                return;
            }

            if (pane) {
                pane.remove();
            }

            li.remove();

            if (isActive) {
                this.goToIndex(Math.max(tabIndex - 1, 0));
            }

            if (!this.tabs().length) {
                jax.Events.dispatch('tab:after-all-closed', { target: this.element });
            }

            jax.Events.dispatch('tab:closed', { target: this.element, detail: { tab: li, pane } });

            dispatchEvent(new Event('resize'));
            this.updateClasses();
        }

        updateClasses() {
            this.element.classList.toggle('has-tabs', this.nav.children.length > 0);
        }

        modifyTab(tab) {
            const tabIndex = this.findTabIndex(tab);
            if (tabIndex === -1) {
                return;
            }

            this.tabs()[tabIndex].setAttribute('data-modified', '');

            const pane = this.panes()[tabIndex];
            if (pane) {
                pane.setAttribute('data-modified', '');
            }
        }

        unmodifyTab(tab) {
            const tabIndex = this.findTabIndex(tab);
            if (tabIndex === -1) {
                return;
            }

            this.tabs()[tabIndex].removeAttribute('data-modified');

            const pane = this.panes()[tabIndex];
            if (pane) {
                pane.removeAttribute('data-modified');
            }
        }

        // Returns the index of a tab or pane, or of the active tab when none is given.
        findTabIndex(tab) {
            const tabToFind = tab === undefined
                ? this.nav.querySelector(':scope > li.active')
                : this.resolveElement(tab);

            if (!tabToFind || !tabToFind.parentElement) {
                return -1;
            }

            if (tabToFind.parentElement.classList.contains('nav-tabs')) {
                return this.tabs().indexOf(tabToFind);
            }

            return this.panes().indexOf(tabToFind);
        }

        // Resolves a tab or pane given as an element or as a selector inside the control.
        resolveElement(tab) {
            if (typeof tab === 'string') {
                return this.element.querySelector(tab);
            }

            return tab instanceof Element ? tab : null;
        }

        findTabFromPane(pane) {
            if (!pane || !pane.id) {
                return null;
            }

            return this.nav.querySelector('[data-target="#' + CSS.escape(pane.id) + '"]');
        }

        findPaneFromTab(tab) {
            const anchor = tab ? tab.querySelector(':scope > a') : null,
                target = anchor ? anchor.dataset.target : null;

            if (!target) {
                return null;
            }

            return this.panes().find((pane) => '#' + pane.id === target) || null;
        }

        goTo(identifier) {
            const li = this.findByIdentifier(identifier);
            if (!li) {
                return false;
            }

            const tabIndex = this.findTabIndex(li);
            if (tabIndex === -1) {
                return false;
            }

            this.goToIndex(tabIndex);

            if (this.dragScroll) {
                this.dragScroll.goToElement(li);
            }

            return true;
        }

        goToPane(pane) {
            pane = this.resolveElement(pane);
            if (!pane) {
                return false;
            }

            const tab = this.findTabFromPane(pane);

            pane.classList.remove('collapsed');

            const tabIndex = this.findTabIndex(pane);
            if (tabIndex === -1) {
                return false;
            }

            this.goToIndex(tabIndex);

            if (tab && this.dragScroll) {
                this.dragScroll.goToElement(tab.closest('li') || tab);
            }

            return true;
        }

        goToInvalidElement(element) {
            this.invalidElement = true;
            const result = this.goToPane(element.closest('.tab-pane'));
            this.invalidElement = false;
            return result;
        }

        goToElement(element) {
            return this.goToPane(element.closest('.tab-pane'));
        }

        findByIdentifier(identifier) {
            return this.nav.querySelector('[data-tab-id="' + CSS.escape(String(identifier)) + '"]');
        }

        updateIdentifier(tab, identifier) {
            const index = this.findTabIndex(tab);
            if (index === -1) {
                return;
            }

            this.tabs()[index].setAttribute('data-tab-id', identifier);
        }

        updateTitle(tab, title) {
            const index = this.findTabIndex(tab);
            if (index === -1) {
                return;
            }

            const processedTitle = this.generateTitleText(title, index),
                link = this.nav.querySelectorAll(':scope > li > a span.title')[index];

            if (link) {
                link.setAttribute('title', title);
                link.textContent = processedTitle;
            }
        }

        goToIndex(index) {
            const li = this.tabs()[index];
            if (li) {
                this.activate(li);
            }
        }

        prev() {
            const tabIndex = this.findTabIndex();
            if (tabIndex <= 0) {
                return;
            }

            this.goToIndex(tabIndex - 1);
        }

        next() {
            const tabIndex = this.findTabIndex();
            if (tabIndex === -1) {
                return;
            }

            this.goToIndex(tabIndex + 1);
        }
    });

    // GLOBAL EVENTS
    // ============================

    // Detect invalid fields, focus the tab
    addEventListener('ajax:invalid-field', function(ev) {
        const { element, isFirst } = ev.detail || {};
        if (!isFirst || !element) {
            return;
        }

        ev.preventDefault();

        const tabElement = element.closest('[data-control~="tab"]'),
            tab = tabElement ? jax.fetchControl(tabElement, 'tab') : null;

        if (tab) {
            tab.goToInvalidElement(element);
        }

        element.focus();
    });
}

// Counts the ancestors of an element, used to tell nested tab controls apart.
function countParents(element) {
    let count = 0;

    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        count++;
    }

    return count;
}

// Adds a space separated list of classes to an element.
function addClasses(element, classes) {
    String(classes).split(/\s+/).filter(Boolean).forEach((className) => {
        element.classList.add(className);
    });
}

// Replaces the pane content and runs its inline scripts, as jQuery's html() does.
function setPaneContent(pane, content) {
    if (content instanceof Node) {
        pane.replaceChildren(content);
    }
    else {
        pane.innerHTML = content === undefined || content === null ? '' : String(content);
    }

    pane.querySelectorAll('script').forEach((oldScript) => {
        const script = document.createElement('script');

        Array.from(oldScript.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
        script.textContent = oldScript.textContent;
        oldScript.replaceWith(script);
    });
}

function isVisible(element) {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}
