/*
 * List widget control
 *
 * Data attributes:
 * - data-control="listwidget" - enables the list widget
 *
 * JavaScript API:
 * jax.fetchControl(element, 'listwidget')
 *
 * Ported from October CMS (october.list.js) as vanilla JS. Not yet ported:
 * drag-scrollable headers, shift-click checkbox ranges, checked-trigger
 * button linkage (data-list-checked-trigger / data-list-checked-request).
 */
'use strict';

jax.registerControl('listwidget', class extends jax.ControlBase {
    init() {
        this.checkboxSelector = '.list-checkbox input[type="checkbox"]';
        this.head = this.element.querySelector('thead');
        this.body = this.element.querySelector('tbody');
    }

    connect() {
        this.listen('change', this.onChangeCheckbox);
        this.listen('ajax:setup', this.onAjaxSetup);

        this.updateUi();
    }

    disconnect() {
        this.head = null;
        this.body = null;
    }

    // Checkbox helpers

    bodyCheckboxes() {
        return [...this.body.querySelectorAll(this.checkboxSelector)];
    }

    headCheckbox() {
        return this.head.querySelector(this.checkboxSelector);
    }

    updateUi() {
        this.bodyCheckboxes().forEach((el) => {
            el.closest('tr').classList.toggle('active', el.checked);
        });

        this.checkIndeterminate();
    }

    checkIndeterminate() {
        const all = this.bodyCheckboxes(),
            headCb = this.headCheckbox(),
            checkedCount = all.filter((el) => el.checked).length;

        if (!headCb) {
            return;
        }

        headCb.indeterminate = checkedCount > 0 && checkedCount !== all.length;
        headCb.checked = checkedCount > 0;
    }

    onChangeCheckbox(ev) {
        const el = ev.target;
        if (!el.matches('input[type="checkbox"]') || !el.closest('.list-checkbox')) {
            return;
        }

        // Head checkbox toggles everything
        if (this.head.contains(el)) {
            this.bodyCheckboxes().forEach((cb) => {
                cb.checked = el.checked;
                cb.closest('tr').classList.toggle('active', el.checked);
            });
            this.checkIndeterminate();
            return;
        }

        // Body checkbox toggles its row
        el.closest('tr').classList.toggle('active', el.checked);

        if (!el.checked) {
            const headCb = this.headCheckbox();
            if (headCb) {
                headCb.checked = false;
            }
        }

        this.checkIndeterminate();
    }

    // Checked value collection

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

    getAllChecked() {
        return this.getChecked().concat(this.getCheckedFromLocker());
    }

    toggleChecked(el) {
        const checkbox = el.closest('tr').querySelector(this.checkboxSelector);
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    // AJAX integration: include checked state with requests inside the list

    onAjaxSetup(ev) {
        const context = ev.detail && ev.detail.context;
        if (context && context.options && context.options.data) {
            context.options.data.allChecked = this.getAllChecked();
        }
    }
});

/*
 * Page chooser: submits the "Go to page" form via AJAX
 */
addEventListener('submit', function(ev) {
    const form = ev.target.closest('form[data-list-page-chooser]');
    if (!form) {
        return;
    }

    ev.preventDefault();

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
