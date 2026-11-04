/*
 * List widget control
 *
 * Data attributes:
 * - data-control="listwidget" - enables the list widget
 * - data-checkbox-selector - selector of the row checkboxes, default: .list-checkbox input[type="checkbox"]
 *
 * JavaScript API:
 * jax.fetchControl(element, 'listwidget')
 * jax.fetchControl(el.closest('.control-list'), 'listwidget').getChecked() - values of the checked rows
 * jax.fetchControl(el.closest('.control-list'), 'listwidget').toggleChecked(el) - toggles the row containing el
 * jax.fetchControl(el.closest('.control-list'), 'listwidget').setUpdating(true) - marks the list as updating, as a linked filter does
 * jax.listOnLoadForm(recordId, context) - opens the onLoadPopupForm handler in a popup,
 *   used by the recordOnClick "popup" shorthand
 *
 * While a pagination request runs, the list has the is-updating class and aria-busy="true", the pressed
 * link has is-loading and the target page shows as the current one; a failed request puts them back.
 *
 * Toolbar buttons inside a [data-list-linkage] container:
 * - data-list-checked-trigger - enabled through the trigger API while rows are checked,
 *   a [data-list-checked-counter] element inside shows the count
 * - data-list-checked-request - AJAX requests include the checked row values as "checked"
 *
 * The list setup form:
 * - data-control="list-setup-columns" - reorders the columns by dragging their .drag-handle,
 *   so the column_order[] inputs post in the new order
 *
 * Dependencies:
 * - SortableJS (vendor/sortablejs/sortable.esm.js), loaded when the setup form first opens
 */
'use strict';

import { Popup } from '../../controls/popup/popup.js';

export function registerListWidget(jax) {
    // List helper, opens a record form in a popup from the controller's onLoadPopupForm handler
    jax.listOnLoadForm = function(recordId, context) {
        Popup.open({
            handler: 'onLoadPopupForm',
            extraData: {
                form_record_id: recordId,
                form_context: context || null
            }
        });
    };

    registerListSetupColumns(jax);

    jax.registerControl('listwidget', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({
                checkboxSelector: '.list-checkbox input[type="checkbox"]'
            }, this.config);
        }

        connect() {
            this.head = this.element.querySelector('thead');
            this.body = this.element.querySelector('tbody');

            this.listen('ajax:setup', this.beforeAjaxRequest);
            this.listen('ajax:promise', this.onPageRequest);
            this.listen('ajax:always', this.onPageRequestEnd);
            this.listen('click', this.onClickCheckbox);
            this.listen('change', this.onChangeCheckbox);

            this.updateUi();
        }

        disconnect() {
            this.head = null;
            this.body = null;
            this.pageChange = null;
        }

        // A page change marks the list as updating, turns the pressed link into a spinner and shows the target page as current straight away.
        onPageRequest(ev) {
            const link = pageLinkFor(ev, this.element);
            if (!link) {
                return;
            }

            const current = this.element.querySelector('.list-pagination .page-item.active');
            const target = this.pageItemFor(targetPageFor(ev, link));

            this.setUpdating(true);
            link.classList.add('is-loading');

            if (target && current && target !== current) {
                current.classList.remove('active');
                target.classList.add('active');
            }

            this.pageChange = { link, current, target };
        }

        // A successful page change redraws the list, so this only undoes the state when the request failed or changed nothing.
        onPageRequestEnd(ev) {
            if (!pageLinkFor(ev, this.element) || !this.pageChange) {
                return;
            }

            const { link, current, target } = this.pageChange;

            this.setUpdating(false);
            link.classList.remove('is-loading');

            if (target && current && target !== current) {
                target.classList.remove('active');
                current.classList.add('active');
            }

            this.pageChange = null;
        }

        // Marks the list as updating while a request that redraws it runs, which the stylesheet shows after a short delay.
        setUpdating(isUpdating) {
            this.element.classList.toggle('is-updating', !!isUpdating);

            if (isUpdating) {
                this.element.setAttribute('aria-busy', 'true');
            }
            else {
                this.element.removeAttribute('aria-busy');
            }
        }

        // The numbered page item for a page, when it is shown.
        pageItemFor(page) {
            if (page === null) {
                return null;
            }

            return [...this.element.querySelectorAll('.list-pagination .page-item:not(.page-choose)')]
                .find((item) => item.textContent.trim() === String(page)) || null;
        }

        updateUi() {
            this.bodyCheckboxes().forEach((el) => {
                if (el.checked) {
                    el.closest('tr').classList.add('active');
                }
            });

            this.checkIndeterminate();
        }

        checkIndeterminate() {
            const all = this.bodyCheckboxes(),
                checkedCount = all.filter((el) => el.checked).length;

            this.headCheckboxes().forEach((headCb) => {
                headCb.indeterminate = checkedCount > 0 && all.length !== checkedCount;
                headCb.checked = !!checkedCount;
            });
        }

        onChangeCheckbox(ev) {
            const el = ev.target;
            if (!el.matches || !el.matches(this.config.checkboxSelector)) {
                return;
            }

            if (this.head && this.head.contains(el)) {
                this.toggleHeadCheckbox(ev);
            }
            else if (this.body && this.body.contains(el)) {
                this.toggleBodyCheckbox(ev);
            }
        }

        toggleHeadCheckbox(ev) {
            const checked = ev.target.checked,
                checkboxes = this.bodyCheckboxes();

            checkboxes.forEach((el) => {
                el.checked = checked;
            });

            // One change event updates the head state and any trigger watching the rows
            if (checkboxes.length) {
                checkboxes[0].dispatchEvent(new Event('change', { bubbles: true }));
            }

            this.body.querySelectorAll('tr').forEach((row) => {
                row.classList.toggle('active', checked);
            });
        }

        toggleBodyCheckbox(ev) {
            const el = ev.target,
                row = el.closest('tr');

            if (el.checked) {
                row.classList.add('active');
            }
            else {
                this.headCheckboxes().forEach((headCb) => {
                    headCb.checked = false;
                });
                row.classList.remove('active');
            }

            this.checkIndeterminate();
        }

        // Shift-click selects the range between the previously clicked checkbox and this one
        onClickCheckbox(ev) {
            const el = ev.target;
            if (!el.matches || !el.matches('.list-checkbox > input[type=checkbox]') || !this.body || !this.body.contains(el)) {
                return;
            }

            jax.checkboxRangeRegisterClick(ev, 'tr', this.config.checkboxSelector);
        }

        bodyCheckboxes() {
            return this.body ? [...this.body.querySelectorAll(this.config.checkboxSelector)] : [];
        }

        headCheckboxes() {
            return this.head ? [...this.head.querySelectorAll(this.config.checkboxSelector)] : [];
        }

        getAllChecked() {
            return this.getChecked().concat(this.getCheckedFromLocker());
        }

        getChecked() {
            return this.bodyCheckboxes()
                .filter((el) => el.checked)
                .map((el) => el.value);
        }

        getUnchecked() {
            return this.bodyCheckboxes()
                .filter((el) => !el.checked)
                .map((el) => el.value);
        }

        getCheckedFromLocker() {
            try {
                const lockerEl = this.element.querySelector('[data-list-datalocker-checked]'),
                    locker = JSON.parse(lockerEl.value);

                this.getUnchecked().forEach((value) => {
                    const index = locker.indexOf(value);
                    if (index > -1) {
                        locker.splice(index, 1);
                    }
                });

                return locker;
            }
            catch (err) {
                return [];
            }
        }

        toggleChecked(el) {
            const row = el.closest('tr'),
                checkbox = row ? row.querySelector(this.config.checkboxSelector) : null;

            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        beforeAjaxRequest(ev) {
            const context = ev.detail && ev.detail.context;
            if (context && context.options && context.options.data) {
                context.options.data.allChecked = this.getAllChecked();
            }
        }
    });

    // LIST HELPER DATA-API
    // ============================

    // Reads the checked rows of the list control inside a list widget container
    function listGetChecked(listId) {
        const listEl = document.querySelector('#' + listId + ' > .control-list'),
            control = listEl ? jax.fetchControl(listEl, 'listwidget') : null;

        return control ? control.getChecked() : [];
    }

    // Buttons bound to the trigger API, so later renders only ask them to re-evaluate
    const triggerBoundButtons = new WeakSet();

    // listCheckedTriggerOn enables a button through the trigger API while rows of its linked list are checked.
    function listCheckedTriggerOn(buttonEl) {
        const linkageEl = buttonEl.closest('[data-list-linkage]'),
            listId = linkageEl ? linkageEl.dataset.listLinkage : null;

        // No list or already bound
        if (!listId || triggerBoundButtons.has(buttonEl)) {
            buttonEl.dispatchEvent(new CustomEvent('trigger:update', { bubbles: true }));
            return;
        }

        const counterEl = buttonEl.querySelector('[data-list-checked-counter]');
        if (counterEl) {
            buttonEl.addEventListener('trigger:after-update', () => {
                const checked = listGetChecked(listId);
                counterEl.textContent = checked.length ? '(' + checked.length + ')' : '';
            });
        }

        buttonEl.dataset.triggerAction = 'enable';
        buttonEl.dataset.triggerCondition = 'checked';
        buttonEl.dataset.trigger = '#' + listId + ' > .control-list tbody .list-checkbox input[type=checkbox]';

        if (!buttonEl.matches('[data-control~="input-trigger"]')) {
            buttonEl.dataset.control = ((buttonEl.dataset.control || '') + ' input-trigger').trim();
        }

        triggerBoundButtons.add(buttonEl);
    }

    addEventListener('render', function() {
        document.querySelectorAll('[data-list-checked-trigger]').forEach(listCheckedTriggerOn);
    });

    /*
     * Checked-request buttons: AJAX requests fired from a [data-list-checked-request]
     * button inside a [data-list-linkage] container include the checked row values of
     * the linked list widget
     */
    addEventListener('ajax:setup', function(ev) {
        const buttonEl = ev.target.closest && ev.target.closest('[data-list-checked-request]');
        if (!buttonEl) {
            return;
        }

        const linkageEl = buttonEl.closest('[data-list-linkage]');
        if (!linkageEl) {
            return;
        }

        const checked = listGetChecked(linkageEl.dataset.listLinkage),
            context = ev.detail && ev.detail.context;

        if (checked.length && context && context.options && context.options.data) {
            context.options.data.checked = checked;
        }
    });

    /*
     * Page chooser: closes its popover, then submits the "Go to page" form via AJAX
     */
    addEventListener('submit', function(ev) {
        const form = ev.target.closest && ev.target.closest('form[data-list-page-chooser]');
        if (!form) {
            return;
        }

        ev.preventDefault();
        jax.Events.dispatch('popover:close', { target: form });

        const chooser = document.getElementById(form.dataset.chooserId),
            input = form.querySelector('input[data-chooser-input]'),
            handler = form.dataset.handler,
            pageName = input.name,
            pageNumber = input.value,
            transportMethod = pageName === '_page' ? 'data' : 'query';

        jax.request(chooser || form, handler, {
            [transportMethod]: { [pageName]: pageNumber }
        });
    });
}

// The list setup form's columns, reordered by dragging their handles
export function registerListSetupColumns(jax) {
    jax.registerControl('list-setup-columns', class extends jax.ControlBase {
        connect() {
            this.listElement = this.element.querySelector(':scope > ul');

            if (!this.listElement) {
                return;
            }

            loadSortable().then((Sortable) => {
                // The form may have closed while SortableJS loaded
                if (!this.listElement) {
                    return;
                }

                this.sortable = Sortable.create(this.listElement, {
                    handle: '.drag-handle',
                    animation: 150
                });
            });
        }

        disconnect() {
            if (this.sortable) {
                this.sortable.destroy();
                this.sortable = null;
            }

            this.listElement = null;
        }
    });
}

// SortableJS for the setup form's columns, imported once
let sortablePromise = null;

function loadSortable() {
    if (!sortablePromise) {
        sortablePromise = import('../../vendor/sortablejs/sortable.esm.js')
            .then((sortable) => sortable.Sortable);
    }

    return sortablePromise;
}

// The pagination link of this list that sent a request, if one did
function pageLinkFor(ev, listElement) {
    const link = ev.target instanceof Element ? ev.target.closest('.list-pagination .page-link') : null;

    return link && listElement.contains(link) ? link : null;
}

// The page a pagination request asks for, from the link's request data such as { page: 2 } or the request's own options
function targetPageFor(ev, link) {
    const match = /:\s*(\d+)\s*}\s*$/.exec(link.dataset.requestQuery || link.dataset.requestData || '');
    if (match) {
        return match[1];
    }

    const options = (ev.detail && ev.detail.context && ev.detail.context.options) || {};
    for (const values of [options.query, options.data]) {
        const page = values && Object.values(values).find((value) => /^\d+$/.test(String(value)));
        if (page !== undefined) {
            return String(page);
        }
    }

    return null;
}
