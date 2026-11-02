/*
 * Filter widget control
 *
 * Data attributes:
 * - data-control="filterwidget" - enables the filter widget
 * - data-popover-template - selector of the template wrapping each scope popover form
 * - data-update-handler - AJAX handler for scope updates
 * - data-load-handler - AJAX handler for the popover form of a scope rendered without its form template
 * - data-page-name - page parameter to reset when a filter is applied
 * - data-list-linkage - id of the linked list widget, shown as updating while a scope update redraws it
 *
 * Events:
 * - filter-scope:change - dispatched on the scope element after its value is updated
 *
 * JavaScript API:
 * jax.fetchControl(element, 'filterwidget')
 *
 * Covers the built-in scope types (checkbox, switch, dropdown), the popover
 * scope types backed by filter widgets (text, number, date, group) and inline
 * scopes that carry their own apply and clear buttons.
 */
'use strict';

import { Popover } from '../../controls/popover/popover.js';
import DragScroll from '../../controls/drag-scroll/drag-scroll.js';

export function registerFilterWidget(jax) {
    jax.registerControl('filterwidget', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({
                popoverTemplate: null,
                updateHandler: null,
                loadHandler: null,
                pageName: null
            }, this.config);

            this.popover = null;
            this.activeScope = null;
        }

        connect() {
            this.listen('click', this.onClick);
            this.listen('ajax:update', this.onContainerUpdate);

            // Bootstrap's own event names, which the framework's listener would read as namespaced events
            this.element.addEventListener('change.bs.combobox', this.proxy(this.onPickDropdown));
            this.element.addEventListener('shown.bs.combobox', this.proxy(this.onDropdownShown));

            this.bindScrollable();
            this.orderScopes();
        }

        disconnect() {
            this.element.removeEventListener('change.bs.combobox', this.proxy(this.onPickDropdown));
            this.element.removeEventListener('shown.bs.combobox', this.proxy(this.onDropdownShown));
            this.hidePopover();
            this.unbindScrollable();
        }

        bindScrollable() {
            this.scrollable = this.element.querySelector('.filter-scopes');
            if (this.scrollable) {
                this.dragScroll = new DragScroll(this.scrollable, {
                    scrollClassContainer: this.scrollable.parentNode
                });
                this.scrollable.querySelectorAll(':scope > .filter-group').forEach((group, index) => {
                    group.dataset.filterOrder ??= index;
                });
            }
        }

        unbindScrollable() {
            if (this.dragScroll) {
                this.dragScroll.dispose();
            }

            this.dragScroll = null;
            this.scrollable = null;
        }

        // Rebinds the scrollable area when the entire container is replaced.
        onContainerUpdate(ev) {
            if (ev.target === this.element) {
                this.unbindScrollable();
                this.bindScrollable();
                this.orderScopes();
            }
        }

        // Active scopes lead, with the configured order retained within both groups.
        orderScopes(updatedScopeName) {
            if (!this.scrollable) {
                return;
            }

            const groups = [...this.scrollable.querySelectorAll(':scope > .filter-group')];
            groups.sort((a, b) => {
                const activeA = !!a.querySelector('.filter-scope.active'),
                    activeB = !!b.querySelector('.filter-scope.active');

                return Number(activeB) - Number(activeA) || Number(a.dataset.filterOrder) - Number(b.dataset.filterOrder);
            });

            groups.forEach((group, index) => {
                if (this.scrollable.children[index] !== group) {
                    this.scrollable.insertBefore(group, this.scrollable.children[index]);
                }
            });

            const updatedGroup = updatedScopeName
                ? groups.find(group => group.querySelector('.filter-scope')?.dataset.scopeName === updatedScopeName)
                : null;
            if (updatedGroup) {
                this.dragScroll.goToStart();
                if (updatedGroup.querySelector('.filter-scope.active') && updatedGroup !== groups[0]) {
                    this.scrollable.scrollLeft = updatedGroup.offsetLeft - groups[0].offsetLeft;
                }
            }
            this.dragScroll.fixScrollClasses();
        }

        onClick(ev) {
            if (!ev.target.closest) {
                return;
            }

            const tab = ev.target.closest('[data-filter-tab-value]');
            if (tab && this.element.contains(tab)) {
                ev.preventDefault();
                this.hidePopover();
                this.submitUpdate(tab.closest('.scope-tabs'), { value: tab.dataset.filterTabValue });
                return;
            }

            const clearScope = ev.target.closest('[data-filter-clear-scope]');
            if (clearScope && this.element.contains(clearScope)) {
                ev.preventDefault();
                const scope = clearScope.closest('.filter-group')?.querySelector('.filter-scope');
                this.hidePopover();
                this.submitUpdate(scope, { clearScope: true });
                return;
            }

            const checkboxScope = ev.target.closest('button.filter-scope.scope-checkbox, a.filter-scope.scope-checkbox');
            if (checkboxScope && this.element.contains(checkboxScope)) {
                ev.preventDefault();
                this.hidePopover();
                this.submitUpdate(checkboxScope, { value: checkboxScope.classList.contains('active') ? 0 : 1 });
                return;
            }

            // Inline scope actions
            const actionEl = ev.target.closest('.filter-scope [data-filter-action]');
            if (actionEl && this.element.contains(actionEl)) {
                if (actionEl.dataset.filterAction === 'apply') {
                    this.onClickInlineScopeApply(ev, actionEl);
                }
                else if (actionEl.dataset.filterAction === 'clear') {
                    this.onClickInlineScopeClear(ev, actionEl);
                }
                return;
            }

            // Popover scope trigger
            const scopeLink = ev.target.closest('a.filter-scope');
            if (scopeLink && this.element.contains(scopeLink)) {
                ev.preventDefault();
                this.onClickScopePopover(scopeLink);
            }
        }

        //
        // Popover Scope
        //

        // Bound on the popover element directly since it is attached outside this widget.
        initContainer(container) {
            container.addEventListener('click', (ev) => {
                const actionEl = ev.target.closest('[data-filter-action]');
                if (!actionEl) {
                    return;
                }

                if (actionEl.dataset.filterAction === 'apply') {
                    this.onClickScopeApply(ev, container);
                }
                else if (actionEl.dataset.filterAction === 'clear') {
                    this.onClickScopeClear(ev);
                }
            });
        }

        onClickScopePopover(scopeLink) {
            // Second click closes the filter scope
            if (this.activeScope === scopeLink) {
                if (this.popover) {
                    this.popover.hide();
                }
                return;
            }

            // Hide any old scopes
            this.hidePopover();

            this.activeScope = scopeLink;

            this.showPopover(scopeLink);
        }

        onClickScopeApply(ev, container) {
            ev.preventDefault();

            this.submitUpdate(this.activeScope, jax.values(container.querySelector('form')));

            this.hidePopover();
        }

        onClickScopeClear(ev) {
            ev.preventDefault();

            this.submitUpdate(this.activeScope, {
                clearScope: true
            });

            this.hidePopover();
        }

        onHideScopePopover(scopeLink, popover) {
            if (this.activeScope === scopeLink) {
                this.activeScope = null;
            }

            if (this.popover === popover) {
                this.popover = null;
            }
        }

        // hidePopover closes the active scope popover.
        hidePopover() {
            if (this.popover) {
                this.popover.hide();
                this.popover = null;
            }

            this.activeScope = null;
        }

        showPopover(scopeLink) {
            const scopeName = scopeLink.dataset.scopeName;

            const popover = new Popover(scopeLink, {
                content: renderTemplate(this.getPopoverTemplate(), { scopeName: scopeName }),
                modal: false,
                highlightModalTarget: true,
                closeOnPageClick: true,
                placement: 'bottom',
                onCheckDocumentClickTarget: (target) => this.onCheckDocumentClickTargetDatePicker(target),
                onClose: () => this.onHideScopePopover(scopeLink, popover)
            });

            this.popover = popover;
            popover.show();

            // A popover:showing listener cancelled it
            const container = popover.getContainer();
            if (!container) {
                this.popover = null;
                this.activeScope = null;
                return;
            }

            // The form comes rendered with the scope, so it reflects the scope's value and opens without a request
            const formTemplate = this.scopeFormTemplate(scopeLink);

            if (formTemplate) {
                this.setPopoverContent(container, formTemplate.innerHTML);
            }
            else {
                jax.request(container.querySelector('form'), this.config.loadHandler, {
                    success: (data) => {
                        if (popover.element && typeof data.result === 'string') {
                            this.setPopoverContent(container, data.result);
                        }
                    }
                });
            }

            // Bind events
            this.initContainer(container);
        }

        // setPopoverContent places the scope form in the popover and initializes its controls.
        setPopoverContent(container, html) {
            container.querySelector('.control-filter-popover').innerHTML = html;

            this.bindPopoverContent(container);

            jax.Events.dispatch('render');
        }

        getPopoverTemplate() {
            const template = this.config.popoverTemplate ? document.querySelector(this.config.popoverTemplate) : null;

            return template ? template.innerHTML : '';
        }

        // The popover form rendered alongside a scope, which the server renders again whenever the scope changes.
        scopeFormTemplate(scopeLink) {
            const group = scopeLink.closest('.filter-group');

            return group ? group.querySelector(':scope > template[data-scope-form]') : null;
        }

        // A press inside a date picker calendar, which mounts outside the popover, keeps the popover open.
        onCheckDocumentClickTargetDatePicker(target) {
            return !!(target && target.closest && target.closest('[data-vc="calendar"]'));
        }

        // bindPopoverContent wires the group filter option loading inside the popover form.
        bindPopoverContent(container) {
            const group = container.querySelector('[data-control="groupfilter"]');
            if (group) {
                this.bindGroupFilter(group);
            }
        }

        bindGroupFilter(group) {
            const locker = group.querySelector('[data-groupfilter-datalocker]'),
                availableList = group.querySelector('[data-groupfilter-available]'),
                activeList = group.querySelector('[data-groupfilter-active]'),
                handler = group.dataset.optionsHandler;

            const activeIds = () => {
                try { return JSON.parse(locker.value) || []; }
                catch (e) { return []; }
            };

            const saveIds = (ids) => {
                locker.value = JSON.stringify(ids);
            };

            let availableOptions = [],
                selectedOptions = [];

            const renderItem = (list, option, isActive) => {
                const li = document.createElement('li');
                li.dataset.itemId = option.id;
                li.className = isActive ? 'is-active' : '';
                li.innerHTML = '<button type="button" class="filter-item"><span class="filter-item-label"></span></button>';
                const button = li.firstChild;
                button.querySelector('.filter-item-label').textContent = option.name;
                button.setAttribute('aria-label', (isActive
                    ? group.dataset.removeLabel || 'Remove :name'
                    : group.dataset.addLabel || 'Add :name').replace(':name', option.name));
                const iconClass = isActive ? group.dataset.removeIcon : group.dataset.addIcon;
                if (iconClass) {
                    const icon = document.createElement('i');
                    icon.className = iconClass + ' filter-item-icon';
                    icon.setAttribute('aria-hidden', 'true');
                    button.appendChild(icon);
                }
                button.addEventListener('click', () => {
                    const ids = activeIds(),
                        index = ids.indexOf(option.id),
                        wasFocused = document.activeElement === button;

                    if (index > -1) {
                        ids.splice(index, 1);
                        selectedOptions = selectedOptions.filter(item => item.id !== option.id);
                    }
                    else {
                        ids.push(option.id);
                        selectedOptions.push(option);
                    }

                    saveIds(ids);
                    renderLists();
                    if (wasFocused) {
                        const targetList = index > -1 ? availableList : activeList,
                            target = [...targetList.children].find(item => item.dataset.itemId === String(option.id));
                        (target?.querySelector('button') || group.querySelector('input[name="search"]'))?.focus();
                    }
                });
                list.appendChild(li);
            };

            const renderLists = () => {
                const ids = activeIds();
                availableList.innerHTML = '';
                activeList.innerHTML = '';
                selectedOptions.forEach((option) => {
                    if (ids.includes(option.id)) {
                        renderItem(activeList, option, true);
                    }
                });
                availableOptions.forEach((option) => {
                    if (!ids.includes(option.id)) {
                        renderItem(availableList, option, false);
                    }
                });
            };

            const renderOptions = (options, preserveSelection = false) => {
                availableOptions = options.available || [];
                if (!preserveSelection) {
                    selectedOptions = options.active || [];
                }
                renderLists();
            };

            // Expose for the search input's AJAX response
            group.addEventListener('ajax:done', (ev) => {
                const data = ev.detail && ev.detail.data;
                if (data && data.options) {
                    renderOptions(data.options, true);
                }
            });

            // The form carries its first options, and only a form rendered without them asks for them
            const initialOptions = readJson(group.dataset.options);

            if (initialOptions) {
                renderOptions(initialOptions);
            }
            else {
                jax.request(group, handler, {
                    success: (data) => {
                        if (data.options) {
                            renderOptions(data.options);
                        }
                    }
                });
            }
        }

        //
        // Inline Scope
        //

        onClickInlineScopeApply(ev, actionEl) {
            ev.preventDefault();

            const scope = actionEl.closest('.filter-scope');

            this.submitUpdate(scope, jax.values(scope));

            this.hidePopover();
        }

        onClickInlineScopeClear(ev, actionEl) {
            ev.preventDefault();

            const scope = actionEl.closest('.filter-scope');

            this.submitUpdate(scope, {
                clearScope: true
            });

            this.hidePopover();
        }

        //
        // Dropdowns
        //

        // A dropdown scope is Bootstrap's combobox, which shows the picked label itself, so a pick copies the option's mark beside it and updates the scope.
        onPickDropdown(ev) {
            const toggle = ev.target instanceof Element ? ev.target.closest('.scope-dropdown > .combobox-toggle') : null;
            const scope = toggle ? toggle.closest('.filter-scope') : null;
            const item = scope ? scope.querySelector('.menu > .menu-item.selected') : null;

            if (!item || !this.element.contains(scope)) {
                return;
            }

            const mark = [...item.children].filter((child) => !child.classList.contains('menu-item-content'));
            toggle.querySelector('[data-scope-mark]')?.replaceChildren(...mark.map((child) => child.cloneNode(true)));

            this.hidePopover();
            this.submitUpdate(scope, { value: item.dataset.bsValue });
        }

        // The open options start at the picked one, after the combobox focuses its first item, so Escape and the arrow keys work from there.
        onDropdownShown(ev) {
            const toggle = ev.target instanceof Element ? ev.target.closest('.scope-dropdown > .combobox-toggle') : null;
            const item = toggle ? toggle.closest('.filter-scope').querySelector('.menu > .menu-item.selected') : null;

            if (!item || !this.element.contains(item)) {
                return;
            }

            requestAnimationFrame(() => item.focus());
        }

        //
        // AJAX
        //

        submitUpdate(scope, data) {
            if (!this.config.updateHandler || !scope) {
                return;
            }

            const scopeName = scope.dataset.scopeName,
                restoreTabFocus = !!scope.querySelector('[data-filter-tab-value]:focus');

            data = data || {};
            data.scopeName = scopeName;

            this.element.classList.add('is-loading');
            this.setListUpdating(true);

            const submitData = { data: data };

            // Reset the shared page parameter when a filter is applied
            if (this.config.pageName) {
                submitData.query = { [this.config.pageName]: null };
            }

            jax.request(this.element, this.config.updateHandler, submitData)
                .always(() => {
                    this.element.classList.remove('is-loading');
                    this.setListUpdating(false);
                })
                .done(() => {
                    this.orderScopes(scopeName);
                    // Trigger dependsOn updates on successful requests
                    this.element.querySelectorAll('[data-scope-name]').forEach((el) => {
                        if (el.dataset.scopeName === scopeName) {
                            if (restoreTabFocus) {
                                const tab = el.querySelector('[data-filter-tab-value][aria-pressed="true"]');
                                tab?.focus({ preventScroll: true });
                                tab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                            }
                            jax.Events.dispatch('filter-scope:change', { target: el });
                        }
                    });
                });
        }

        // Marks the linked list as updating while a scope update redraws it, finding the list each time since the update replaces it.
        setListUpdating(isUpdating) {
            const listId = this.element.dataset.listLinkage;
            const container = listId ? document.getElementById(listId) : null;
            const listElement = container ? container.querySelector(':scope > .control-list') : null;
            const list = listElement ? jax.fetchControl(listElement, 'listwidget') : null;

            if (list && list.setUpdating) {
                list.setUpdating(isUpdating);
            }
        }
    });
}

// Fills {{ name }} placeholders in the popover template with escaped values
function renderTemplate(template, values) {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => escapeHtml(values[name] ?? ''));
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

// Parses JSON from a data attribute, or null when it is missing or invalid
function readJson(value) {
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value);
    }
    catch (e) {
        return null;
    }
}
