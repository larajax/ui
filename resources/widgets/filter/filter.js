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
 * Ported from October CMS (october.filter.js) as vanilla JS. The popover
 * scope types (widget-based filters such as date, text, number, group) are
 * not yet ported; this control covers the built-in scope types: checkbox,
 * switch and dropdown.
 */
'use strict';

jax.registerControl('filterwidget', class extends jax.ControlBase {
    init() {
        this.config = Object.assign({
            updateHandler: null,
            loadHandler: null,
            pageName: null
        }, this.config);
    }

    connect() {
        this.listen('change', this.onChange);

        this.bindCheckboxes();
    }

    disconnect() {
    }

    onChange(ev) {
        const el = ev.target,
            scope = el.closest('.filter-scope');

        if (!scope) {
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
        if (!this.config.updateHandler) {
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
