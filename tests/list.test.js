import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { registerListWidget } from '../resources/assets/widgets/list/list.js';
import { registerInputTrigger } from '../resources/assets/controls/input-trigger/input-trigger-control.js';
import { Popover } from '../resources/assets/controls/popover/popover.js';
import { makeFakeJax, sleep } from './support/fake-control-jax.js';

let jax;

beforeAll(() => {
    jax = makeFakeJax();
    registerInputTrigger(jax);
    registerListWidget(jax);
});

afterEach(() => {
    Popover.hideActive();
    jax.disconnectAll();
    jax.requests = [];
    document.body.innerHTML = '';
});

function row(value, checked = false) {
    return `<tr><td class="list-checkbox"><input type="checkbox" name="checked[]" value="${value}" ${checked ? 'checked' : ''} /></td><td>${value}</td></tr>`;
}

function renderList({ rows = ['1', '2', '3'], checked = [], locker = '[]', attributes = '', toolbar = '' } = {}) {
    document.body.innerHTML = `
        ${toolbar}
        <div class="list-widget" id="Lists">
            <div class="control-list" data-control="listwidget" ${attributes}>
                <div class="list-content">
                    <table class="table data">
                        <thead><tr><th class="list-checkbox"><input type="checkbox" /></th><th>Name</th></tr></thead>
                        <tbody>${rows.map((value) => row(value, checked.includes(value))).join('')}</tbody>
                    </table>
                </div>
                <input type="hidden" value='${locker}' data-list-datalocker-checked />
            </div>
        </div>
    `;

    return jax.connect('listwidget', document.querySelector('.control-list'));
}

const headCheckbox = () => document.querySelector('thead input[type="checkbox"]');
const bodyCheckboxes = () => [...document.querySelectorAll('tbody input[type="checkbox"]')];

function change(el) {
    el.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('checkboxes', () => {
    test('the head checkbox checks every row and dispatches change on the first body checkbox', () => {
        renderList();

        const seen = [];
        bodyCheckboxes().forEach((el) => el.addEventListener('change', () => seen.push(el.value)));

        headCheckbox().checked = true;
        change(headCheckbox());

        expect(bodyCheckboxes().every((el) => el.checked)).toBe(true);
        expect(seen).toEqual(['1']);
        expect([...document.querySelectorAll('tbody tr')].every((tr) => tr.classList.contains('active'))).toBe(true);
        expect(headCheckbox().indeterminate).toBe(false);
        expect(headCheckbox().checked).toBe(true);

        headCheckbox().checked = false;
        change(headCheckbox());

        expect(bodyCheckboxes().some((el) => el.checked)).toBe(false);
        expect(document.querySelectorAll('tbody tr.active').length).toBe(0);
        expect(headCheckbox().checked).toBe(false);
    });

    test('a partly checked body makes the head checkbox indeterminate', () => {
        renderList();

        const [first] = bodyCheckboxes();
        first.checked = true;
        change(first);

        expect(first.closest('tr').classList.contains('active')).toBe(true);
        expect(headCheckbox().indeterminate).toBe(true);
        expect(headCheckbox().checked).toBe(true);

        first.checked = false;
        change(first);

        expect(first.closest('tr').classList.contains('active')).toBe(false);
        expect(headCheckbox().indeterminate).toBe(false);
        expect(headCheckbox().checked).toBe(false);
    });

    test('rows checked on render are marked active', () => {
        renderList({ checked: ['2'] });

        expect(document.querySelectorAll('tbody tr.active').length).toBe(1);
        expect(headCheckbox().indeterminate).toBe(true);
    });

    test('the checkbox selector option limits which checkboxes count as rows', () => {
        document.body.innerHTML = `
            <div class="list-widget" id="Lists">
                <div class="control-list" data-control="listwidget" data-checkbox-selector=".row-pick">
                    <table>
                        <thead><tr><th><input type="checkbox" class="row-pick" /></th></tr></thead>
                        <tbody>
                            <tr><td><input type="checkbox" class="row-pick" value="a" /><input type="checkbox" class="other" value="x" checked /></td></tr>
                            <tr><td><input type="checkbox" class="row-pick" value="b" checked /></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const control = jax.connect('listwidget', document.querySelector('.control-list'));

        expect(control.getChecked()).toEqual(['b']);
        expect(control.getUnchecked()).toEqual(['a']);
    });
});

describe('checked values API', () => {
    test('toggleChecked flips the row checkbox through the control found from any element in the list', () => {
        renderList();

        const cell = document.querySelectorAll('tbody td')[3],
            control = jax.fetchControl(cell.closest('.control-list'), 'listwidget');

        let changed = 0;
        bodyCheckboxes()[1].addEventListener('change', () => changed++);

        control.toggleChecked(cell);

        expect(bodyCheckboxes()[1].checked).toBe(true);
        expect(changed).toBe(1);
        expect(control.getChecked()).toEqual(['2']);
    });

    test('getAllChecked merges the locker without the rows unchecked on this page', () => {
        const control = renderList({ checked: ['1'], locker: '["2","9"]' });

        expect(control.getAllChecked()).toEqual(['1', '9']);
    });

    test('requests inside the list carry every checked value', () => {
        renderList({ checked: ['3'], locker: '["7"]' });

        const context = { options: { data: {} } };
        jax.Events.dispatch('ajax:setup', { target: document.querySelector('tbody td'), detail: { context } });

        expect(context.options.data.allChecked).toEqual(['3', '7']);
    });
});

describe('checked trigger buttons', () => {
    const toolbar = `
        <div data-list-linkage="Lists">
            <button type="button" id="delete" data-list-checked-trigger data-list-checked-request>
                Delete <span data-list-checked-counter></span>
            </button>
        </div>
    `;

    function bindToolbar() {
        jax.Events.dispatch('render');
        jax.connectAll();
        return document.getElementById('delete');
    }

    test('render binds the button to the trigger API, disabled until rows are checked', async () => {
        renderList({ toolbar });
        const button = bindToolbar();

        expect(button.dataset.triggerAction).toBe('enable');
        expect(button.dataset.triggerCondition).toBe('checked');
        expect(button.dataset.trigger).toBe('#Lists > .control-list tbody .list-checkbox input[type=checkbox]');
        expect(button.dataset.control).toBe('input-trigger');
        expect(button.disabled).toBe(true);
        expect(button.classList.contains('control-disabled')).toBe(true);

        const disableEvents = [];
        button.addEventListener('trigger:disable', (ev) => disableEvents.push(ev.detail.status));

        const [first] = bodyCheckboxes();
        first.checked = true;
        change(first);
        await sleep(50);

        expect(button.disabled).toBe(false);
        expect(button.classList.contains('control-disabled')).toBe(false);
        expect(disableEvents).toEqual([false]);
        expect(button.querySelector('[data-list-checked-counter]').textContent).toBe('(1)');
    });

    test('checking every row from the head checkbox enables the button and counts all rows', async () => {
        renderList({ toolbar });
        const button = bindToolbar();

        headCheckbox().checked = true;
        change(headCheckbox());
        await sleep(50);

        expect(button.disabled).toBe(false);
        expect(button.querySelector('[data-list-checked-counter]').textContent).toBe('(3)');

        headCheckbox().checked = false;
        change(headCheckbox());
        await sleep(50);

        expect(button.disabled).toBe(true);
        expect(button.querySelector('[data-list-checked-counter]').textContent).toBe('');
    });

    test('later renders ask a bound button to re-evaluate instead of binding again', () => {
        renderList({ toolbar });
        const button = bindToolbar();

        let updates = 0;
        button.parentNode.addEventListener('trigger:update', () => updates++);

        // The connected trigger control stops the event, so nothing reaches the parent
        jax.Events.dispatch('render');
        expect(updates).toBe(0);
        expect(button.dataset.control).toBe('input-trigger');

        jax.disconnectAll();
        jax.Events.dispatch('render');
        expect(updates).toBe(1);
    });

    test('a button without a linked list is left alone', () => {
        document.body.innerHTML = '<button type="button" id="orphan" data-list-checked-trigger></button>';
        jax.Events.dispatch('render');

        const button = document.getElementById('orphan');
        expect(button.dataset.trigger).toBeUndefined();
        expect(button.dataset.control).toBeUndefined();
    });

    test('checked-request buttons send the checked values only when rows are checked', () => {
        renderList({ toolbar, checked: ['2', '3'] });

        const button = document.getElementById('delete'),
            context = { options: { data: {} } };

        jax.Events.dispatch('ajax:setup', { target: button, detail: { context } });
        expect(context.options.data.checked).toEqual(['2', '3']);

        bodyCheckboxes().forEach((el) => { el.checked = false; });

        const emptyContext = { options: { data: {} } };
        jax.Events.dispatch('ajax:setup', { target: button, detail: { context: emptyContext } });
        expect(emptyContext.options.data.checked).toBeUndefined();
    });
});

describe('page chooser', () => {
    test('closes its popover before requesting the chosen page', () => {
        renderList();
        document.body.insertAdjacentHTML('beforeend', '<a id="ListsPageChooser" href="javascript:;">...</a>');

        const chooser = document.getElementById('ListsPageChooser'),
            popover = new Popover(chooser, {
                content: '<form data-list-page-chooser data-chooser-id="ListsPageChooser" data-handler="list::onPaginate">'
                    + '<input type="number" name="page" value="4" data-chooser-input /><button type="submit">Go</button></form>'
            });

        popover.show();

        const form = popover.element.querySelector('form'),
            submitEvent = new Event('submit', { bubbles: true, cancelable: true });

        form.dispatchEvent(submitEvent);

        expect(submitEvent.defaultPrevented).toBe(true);
        expect(Popover.activeInstance).toBe(null);
        expect(form.isConnected).toBe(false);

        const request = jax.requests.at(-1);
        expect(request.element).toBe(chooser);
        expect(request.handler).toBe('list::onPaginate');
        expect(request.options).toEqual({ query: { page: '4' } });
    });

    test('the default page name travels as request data', () => {
        renderList();
        document.body.insertAdjacentHTML('beforeend', '<form data-list-page-chooser data-chooser-id="Lists" data-handler="list::onPaginate">'
            + '<input type="number" name="_page" value="2" data-chooser-input /></form>');

        document.querySelector('form[data-list-page-chooser]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        expect(jax.requests.at(-1).options).toEqual({ data: { _page: '2' } });
    });
});
