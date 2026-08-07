/*
 * Filter widget control
 *
 * Data attributes:
 * - data-control="filterwidget" - enables the filter widget
 * - data-update-handler - AJAX handler for scope updates
 * - data-load-handler - AJAX handler for popover form contents
 * - data-page-name - page parameter to reset when a filter is applied
 *
 * JavaScript API:
 * jax.fetchControl(element, 'filterwidget')
 *
 * Ported from October CMS (october.filter.js) as vanilla JS. Covers the
 * built-in scope types (checkbox, switch, dropdown) and the popover scope
 * types backed by filter widgets (text, number, date, group).
 */
'use strict';

jax.registerControl('filterwidget', class extends jax.ControlBase {
    init() {
        this.config = Object.assign({
            updateHandler: null,
            loadHandler: null,
            pageName: null
        }, this.config);

        this.popover = null;
        this.activeScope = null;
        this.onDocumentClick = this.onDocumentClick.bind(this);
    }

    connect() {
        this.listen('change', this.onChange);
        this.listen('click', this.onClick);

        addEventListener('click', this.onDocumentClick);

        this.bindCheckboxes();
    }

    disconnect() {
        removeEventListener('click', this.onDocumentClick);
        this.closePopover();
    }

    onChange(ev) {
        const el = ev.target,
            scope = el.closest('.filter-scope');

        if (!scope || this.element.querySelector('.filter-popover')?.contains(el)) {
            return;
        }

        // Dropdown scope
        if (el.matches('select')) {
            this.submitUpdate(scope, { value: el.value });
            return;
        }

        // Checkbox and switch scopes
        if (el.matches('input[type="checkbox"]')) {
            if (scope.classList.contains('is-indeterminate')) {
                this.switchToggle(el, scope);
            }
            else {
                this.checkboxToggle(el, scope);
            }
        }
    }

    onClick(ev) {
        // Popover scope trigger
        const scopeLink = ev.target.closest('a.filter-scope');
        if (scopeLink && this.element.contains(scopeLink)) {
            ev.preventDefault();
            this.openPopover(scopeLink);
            return;
        }

        // Apply / clear buttons inside the popover
        const actionEl = ev.target.closest('[data-filter-action]');
        if (actionEl && this.popover && this.popover.contains(actionEl)) {
            ev.preventDefault();

            if (actionEl.dataset.filterAction === 'apply') {
                this.submitUpdate(this.activeScope, jax.values(this.popover.querySelector('form')));
            }
            else {
                this.submitUpdate(this.activeScope, { clearScope: true });
            }

            this.closePopover();
        }
    }

    onDocumentClick(ev) {
        if (!this.popover) {
            return;
        }

        if (!this.popover.contains(ev.target) && !ev.target.closest('a.filter-scope')) {
            this.closePopover();
        }
    }

    //
    // Popover scopes
    //

    openPopover(scopeLink) {
        // Second click closes the scope
        if (this.activeScope === scopeLink) {
            this.closePopover();
            return;
        }

        this.closePopover();
        this.activeScope = scopeLink;
        scopeLink.classList.add('filter-scope-open');

        const scopeName = scopeLink.dataset.scopeName;

        this.popover = document.createElement('div');
        this.popover.className = 'filter-popover';
        this.popover.innerHTML = '<form data-request-parent-form>'
            + '<input type="hidden" name="scopeName" value="" />'
            + '<div class="filter-popover-content"><span class="filter-popover-loading"></span></div>'
            + '</form>';
        this.popover.querySelector('[name="scopeName"]').value = scopeName;

        // Position below the scope link
        scopeLink.parentNode.style.position = 'relative';
        scopeLink.parentNode.appendChild(this.popover);

        // Load form contents
        jax.request(this.popover.querySelector('form'), this.config.loadHandler, {
            success: (data) => {
                if (this.popover && typeof data.result === 'string') {
                    this.popover.querySelector('.filter-popover-content').innerHTML = data.result;
                    this.bindPopoverContent();
                }
            }
        });
    }

    closePopover() {
        if (this.popover) {
            this.popover.remove();
            this.popover = null;
        }

        if (this.activeScope) {
            this.activeScope.classList.remove('filter-scope-open');
            this.activeScope = null;
        }
    }

    // bindPopoverContent wires the behavior October provides through its
    // trigger API and filter widget scripts: condition-based visibility,
    // native date mirrors and group option loading.
    bindPopoverContent() {
        const root = this.popover;

        // Condition select show/hide (data-trigger)
        const conditionSelect = root.querySelector('select[name="Filter[condition]"]');
        if (conditionSelect) {
            const applyTriggers = () => {
                root.querySelectorAll('[data-trigger-condition]').forEach((el) => {
                    const match = /value\[(.+)\]/.exec(el.dataset.triggerCondition);
                    if (!match) {
                        return;
                    }
                    const isMatch = conditionSelect.value === match[1],
                        show = el.dataset.triggerAction === 'show';
                    el.style.display = (isMatch === show) ? '' : 'none';
                });
            };
            conditionSelect.addEventListener('change', applyTriggers);
            applyTriggers();
        }

        // Native date inputs mirror to their hidden ISO targets
        root.querySelectorAll('[data-datepicker]').forEach((el) => {
            el.addEventListener('change', () => {
                const target = document.getElementById(el.dataset.datepickerTarget);
                if (target) {
                    target.value = el.value;
                }
            });
        });

        // Group filter option management
        const group = root.querySelector('[data-control="groupfilter"]');
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
            li.firstChild.textContent = option.name;
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

        // Initial load
        jax.request(group, handler, {
            success: (data) => {
                if (data.options) {
                    renderOptions(data.options);
                }
            }
        });
    }

    //
    // Checkboxes
    //

    bindCheckboxes() {
        this.element.querySelectorAll('.filter-scope input[type="checkbox"]').forEach((el) => {
            const scope = el.closest('.filter-scope');

            if (scope.classList.contains('is-indeterminate')) {
                this.applySwitchVisual(el, parseInt(el.dataset.checked) || 0);
            }
            else {
                scope.classList.toggle('active', el.checked);
            }
        });
    }

    checkboxToggle(el, scope) {
        this.submitUpdate(scope, { value: el.checked });

        scope.classList.toggle('active', el.checked);
    }

    // Switch cycles through three states: 0 = unfiltered (indeterminate),
    // 1 = the off condition (unchecked), 2 = the on condition (checked)
    switchToggle(el, scope) {
        const current = parseInt(el.dataset.checked) || 0,
            next = (current + 1) % 3;

        el.dataset.checked = next;
        this.applySwitchVisual(el, next);

        this.submitUpdate(scope, { value: next });

        scope.classList.toggle('active', !!next);
    }

    applySwitchVisual(el, value) {
        el.indeterminate = value === 0;
        el.checked = value === 2;
    }

    //
    // AJAX
    //

    submitUpdate(scope, data) {
        if (!this.config.updateHandler || !scope) {
            return;
        }

        data = data || {};
        data.scopeName = scope.dataset.scopeName;

        this.element.classList.add('is-loading');

        const submitData = { data: data };

        // Reset the shared page parameter when a filter is applied
        if (this.config.pageName) {
            submitData.query = { [this.config.pageName]: null };
        }

        jax.request(this.element, this.config.updateHandler, submitData)
            .always(() => {
                this.element.classList.remove('is-loading');
            });
    }
});
