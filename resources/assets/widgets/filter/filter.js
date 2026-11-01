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
            this.listen('change', this.onChange);
            this.listen('click', this.onClick);
            this.listen('ajax:update', this.onContainerUpdate);

            this.bindScrollable();
            this.bindCheckboxes();
        }

        disconnect() {
            this.hidePopover();
            this.unbindScrollable();
        }

        bindScrollable() {
            this.scrollable = this.element.querySelector('.filter-scopes');
            if (this.scrollable) {
                this.dragScroll = new DragScroll(this.scrollable, {
                    scrollClassContainer: this.scrollable.parentNode
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
            }
        }

        onChange(ev) {
            const el = ev.target,
                scope = el.closest('.filter-scope');

            if (!scope || this.popover?.element?.contains(el)) {
                return;
            }

            // Dropdown scope
            if (el.matches('select')) {
                this.onToggleDropdown(el, scope);
                return;
            }

            // Checkbox and switch scopes
            if (el.matches('input[type="checkbox"]')) {
                this.onToggleCheckbox(el, scope);
            }
        }

        onClick(ev) {
            if (!ev.target.closest) {
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

            const renderItem = (list, option, isActive) => {
                const li = document.createElement('li');
                li.dataset.itemId = option.id;
                li.className = isActive ? 'is-active' : '';
                li.innerHTML = '<a href="javascript:;"></a>';
                const iconClass = isActive ? group.dataset.removeIcon : group.dataset.addIcon;
                if (iconClass) {
                    const icon = document.createElement('i');
                    icon.className = iconClass;
                    icon.setAttribute('aria-hidden', 'true');
                    li.firstChild.appendChild(icon);
                }
                li.firstChild.appendChild(document.createTextNode(option.name));
                li.addEventListener('click', () => {
                    const ids = activeIds(),
                        index = ids.indexOf(option.id);

                    if (index > -1) {
                        ids.splice(index, 1);
                    }
                    else {
                        ids.push(option.id);
                    }

                    saveIds(ids);
                    li.remove();
                    renderItem(index > -1 ? availableList : activeList, option, index === -1);
                });
                list.appendChild(li);
            };

            const renderOptions = (options) => {
                availableList.innerHTML = '';
                activeList.innerHTML = '';
                (options.active || []).forEach((option) => renderItem(activeList, option, true));
                (options.available || []).forEach((option) => {
                    if (!activeIds().includes(option.id)) {
                        renderItem(availableList, option, false);
                    }
                });
            };

            // Expose for the search input's AJAX response
            group.addEventListener('ajax:done', (ev) => {
                const data = ev.detail && ev.detail.data;
                if (data && data.options) {
                    renderOptions(data.options);
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

        onToggleDropdown(el, scope) {
            // Hide any old scopes
            this.hidePopover();

            this.submitUpdate(scope, { value: el.value });
        }

        //
        // Checkboxes
        //

        bindCheckboxes() {
            this.element.querySelectorAll('.filter-scope input[type="checkbox"]').forEach((el) => {
                const scope = el.closest('.filter-scope');

                if (scope.classList.contains('is-indeterminate')) {
                    scope.classList.toggle('active', !!this.getSwitchValue(el));
                }
                else {
                    scope.classList.toggle('active', el.checked);
                }
            });
        }

        onToggleCheckbox(el, scope) {
            // Hide any old scopes
            this.hidePopover();

            if (scope.classList.contains('is-indeterminate')) {
                this.switchToggle(el, scope);
            }
            else {
                this.checkboxToggle(el, scope);
            }
        }

        checkboxToggle(el, scope) {
            this.submitUpdate(scope, { value: el.checked });

            scope.classList.toggle('active', el.checked);
        }

        // Switch value is the checkbox control state, already advanced by its click
        // handler: 0 = unfiltered (unchecked), 1 = first condition (indeterminate),
        // 2 = second condition (checked)
        switchToggle(el, scope) {
            const switchValue = this.getSwitchValue(el);

            this.submitUpdate(scope, { value: switchValue });

            scope.classList.toggle('active', !!switchValue);
        }

        getSwitchValue(el) {
            return parseInt(el.dataset.checked) || 0;
        }

        //
        // AJAX
        //

        submitUpdate(scope, data) {
            if (!this.config.updateHandler || !scope) {
                return;
            }

            const scopeName = scope.dataset.scopeName;

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
                    // Trigger dependsOn updates on successful requests
                    this.element.querySelectorAll('[data-scope-name]').forEach((el) => {
                        if (el.dataset.scopeName === scopeName) {
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
