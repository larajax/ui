import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { registerFilterWidget } from '../resources/assets/widgets/filter/filter.js';
import { registerInputTrigger } from '../resources/assets/controls/input-trigger/input-trigger-control.js';
import { Popover } from '../resources/assets/controls/popover/popover.js';
import { makeFakeJax, sleep } from './support/fake-control-jax.js';

let jax;

beforeAll(() => {
    jax = makeFakeJax();
    registerInputTrigger(jax);
    registerFilterWidget(jax);
});

afterEach(() => {
    Popover.hideActive();
    jax.disconnectAll();
    jax.requests = [];
    document.body.innerHTML = '';
});

const numberForm = `
    <div class="filter-box">
        <select name="Filter[condition]">
            <option value="equals" selected>is equal to</option>
            <option value="between">is between</option>
        </select>
        <div class="filter-facet" id="facet-single"
            data-trigger="[name='Filter[condition]']"
            data-trigger-action="hide"
            data-trigger-condition="value[between]"
            data-trigger-closest-parent="form">
            <input name="Filter[value]" value="5" />
        </div>
        <div class="filter-facet" id="facet-between"
            data-trigger="[name='Filter[condition]']"
            data-trigger-action="show"
            data-trigger-condition="value[between]"
            data-trigger-closest-parent="form">
            <input name="Filter[min]" value="" />
        </div>
        <button class="btn" data-filter-action="apply">Apply</button>
        <button class="btn" data-filter-action="clear">Clear</button>
    </div>
`;

function renderFilter(extraScopes = '') {
    document.body.innerHTML = `
        <div id="Filter" class="control-filter" data-control="filterwidget"
            data-popover-template="#Filter-popoverTemplate"
            data-update-handler="filter::onFilterUpdate"
            data-load-handler="filter::onLoadFilterForm">
            <div class="filter-group" id="Filter-scope-domain-group">
                <div class="filter-scope scope-dropdown" data-scope-name="domain">
                    <button type="button" class="combobox-toggle" data-bs-toggle="combobox">
                        <span aria-hidden="true" data-scope-mark></span>
                        <span class="combobox-value">All</span>
                    </button>
                    <div class="menu control-dropdown" role="listbox">
                        <button type="button" class="menu-item selected" role="option" data-bs-value=""><span class="menu-item-content"><span>All</span></span></button>
                        <button type="button" class="menu-item" role="option" data-bs-value="example.com"><i class="ph ph-globe" aria-hidden="true"></i><span class="menu-item-content"><span>example.com</span></span></button>
                    </div>
                </div>
            </div>
            <div class="filter-group" id="Filter-scope-id-group">
                <a href="javascript:;" class="filter-scope" data-scope-name="id">ID</a>
                <template data-scope-form>${numberForm}</template>
            </div>
            <div class="filter-group" id="Filter-scope-name-group">
                <a href="javascript:;" class="filter-scope" data-scope-name="name">Name</a>
            </div>
            ${extraScopes}
        </div>
        <script type="text/template" id="Filter-popoverTemplate">
            <form data-request-parent-form="#Filter">
                <input type="hidden" name="scopeName" value="{{ scopeName }}" />
                <div class="control-filter-popover control-filter-box-popover">
                    <div class="loading-indicator-container"><div class="loading-indicator size-small"><span></span></div></div>
                </div>
            </form>
        </script>
    `;

    return jax.connect('filterwidget', document.getElementById('Filter'));
}

// Stands in for the framework's render pass: render hooks mark controls, then the observer connects them
function bindRenderedControls() {
    addEventListener('render', () => jax.connectAll(), { once: true });
}

function openScope(name) {
    [...document.querySelectorAll('a.filter-scope')].find((el) => el.dataset.scopeName === name).click();
    return Popover.activeInstance;
}

// Picks a domain option as Bootstrap's combobox does, marking it selected and announcing the change from the toggle
function pickDomain(value) {
    const scope = document.querySelector('[data-scope-name="domain"]');

    scope.querySelectorAll('.menu-item').forEach((item) => item.classList.toggle('selected', item.dataset.bsValue === value));
    scope.querySelector('.combobox-toggle').dispatchEvent(new CustomEvent('change.bs.combobox', { bubbles: true }));
}

describe('popover content', () => {
    test('connect sends no request', () => {
        renderFilter();

        expect(jax.requests.length).toBe(0);
    });

    test('a scope opens with the form rendered alongside it, without a request, and initializes its controls', () => {
        renderFilter();

        let renders = 0;
        addEventListener('render', () => renders++, { once: true });

        const popover = openScope('id');

        expect(jax.requests.length).toBe(0);
        expect(popover.element.querySelector('#facet-single')).not.toBe(null);
        expect(popover.element.querySelector('form').dataset.requestParentForm).toBe('#Filter');
        expect(popover.element.querySelector('[name="scopeName"]').value).toBe('id');
        expect(document.querySelector('[data-scope-name="id"]').classList.contains('popover-highlight')).toBe(true);
        expect(renders).toBe(1);
    });

    test('closing and opening a scope again shows its form again, still without a request', () => {
        renderFilter();

        openScope('id').hide();
        const popover = openScope('id');

        expect(jax.requests.length).toBe(0);
        expect(popover.element.querySelector('#facet-between')).not.toBe(null);
    });

    test('the scope name is escaped into the popover template', () => {
        renderFilter('<div class="filter-group"><a href="javascript:;" class="filter-scope" data-scope-name="a&quot;b">Odd</a></div>');

        const popover = openScope('a"b');

        expect(popover.element.querySelector('[name="scopeName"]').value).toBe('a"b');
    });

    test('a form rendered again by the server is the one the next popover shows', () => {
        renderFilter();

        // An update re-renders the scope group with the form for the new value
        const group = document.getElementById('Filter-scope-id-group');
        group.innerHTML = '<a href="javascript:;" class="filter-scope" data-scope-name="id">ID</a><template data-scope-form><p id="updated-form">Updated</p></template>';
        jax.Events.dispatch('ajax:update', { target: group });

        const popover = openScope('id');

        expect(popover.element.querySelector('#updated-form')).not.toBe(null);
        expect(jax.requests.length).toBe(0);
    });

    test('a scope rendered without its form loads it through the load handler each time it opens', () => {
        renderFilter();

        let popover = openScope('name');
        const load = jax.requests[0];
        expect(load.handler).toBe('filter::onLoadFilterForm');
        expect(load.element).toBe(popover.element.querySelector('form'));

        load.resolve({ result: '<p id="names-form">Names</p>' });
        expect(popover.element.querySelector('#names-form')).not.toBe(null);

        popover.hide();
        jax.requests = [];
        openScope('name');
        expect(jax.requests.map((request) => request.handler)).toEqual(['filter::onLoadFilterForm']);
    });
});

describe('group options', () => {
    // A group scope form as the group filter widget renders it, with or without its first options
    function groupForm(options, search = '') {
        return `
            <div data-control="groupfilter" data-options-handler="groupFilter::onGetGroupOptions"
                ${options ? `data-options='${JSON.stringify(options)}'` : ''}>
                <input type="hidden" name="Filter[value]" value='["2"]' data-groupfilter-datalocker />
                <input type="text" name="search" value="${search}" />
                <ul data-groupfilter-active></ul>
                <ul data-groupfilter-available></ul>
            </div>
        `;
    }

    const names = (list) => [...document.querySelectorAll(`[data-groupfilter-${list}] li`)].map((li) => li.textContent);

    test('a group renders the options it was rendered with, without a request', () => {
        renderFilter(`<div class="filter-group"><a href="javascript:;" class="filter-scope" data-scope-name="tags">Tags</a><template data-scope-form>${groupForm({
            active: [{ id: '2', name: 'Lamps' }],
            available: [{ id: '1', name: 'Desks' }, { id: '2', name: 'Lamps' }]
        })}</template></div>`);

        openScope('tags');

        expect(jax.requests.length).toBe(0);
        expect(names('active')).toEqual(['Lamps']);
        expect(names('available')).toEqual(['Desks']);
    });

    test('a group rendered without its options asks for them', () => {
        renderFilter(`<div class="filter-group"><a href="javascript:;" class="filter-scope" data-scope-name="tags">Tags</a><template data-scope-form>${groupForm(null)}</template></div>`);

        openScope('tags');

        expect(jax.requests.map((request) => request.handler)).toEqual(['groupFilter::onGetGroupOptions']);

        jax.requests[0].resolve({ options: { active: [], available: [{ id: '1', name: 'Desks' }] } });
        expect(names('available')).toEqual(['Desks']);
    });

    test('opening a group puts the caret at the end of its search', () => {
        renderFilter(`<div class="filter-group"><a href="javascript:;" class="filter-scope" data-scope-name="tags">Tags</a><template data-scope-form>${groupForm({ active: [], available: [] }, 'lam')}</template></div>`);

        const search = openScope('tags').element.querySelector('input[name="search"]');

        expect(document.activeElement).toBe(search);
        expect([search.selectionStart, search.selectionEnd]).toEqual([3, 3]);
    });

    test('on a touch-only device a group leaves its search alone, so the keyboard does not cover the options', () => {
        const originalMatchMedia = window.matchMedia;
        window.matchMedia = (query) => ({ matches: query === '(pointer: coarse)' });

        try {
            renderFilter(`<div class="filter-group"><a href="javascript:;" class="filter-scope" data-scope-name="tags">Tags</a><template data-scope-form>${groupForm({ active: [], available: [] })}</template></div>`);

            const search = openScope('tags').element.querySelector('input[name="search"]');

            expect(document.activeElement).not.toBe(search);
        }
        finally {
            window.matchMedia = originalMatchMedia;
        }
    });

    test('group option buttons add and remove selections without applying, retaining keyboard focus', () => {
        renderFilter(`<div class="filter-group"><a href="javascript:;" class="filter-scope" data-scope-name="tags">Tags</a><template data-scope-form>${groupForm({
            active: [{ id: '2', name: 'Lamps' }],
            available: [{ id: '1', name: 'Desks' }, { id: '2', name: 'Lamps' }]
        })}</template></div>`);
        openScope('tags');

        const add = document.querySelector('[data-groupfilter-available] button');
        expect(add.getAttribute('aria-label')).toBe('Add Desks');
        add.focus();
        add.click();

        expect(names('active')).toEqual(['Lamps', 'Desks']);
        expect(names('available')).toEqual([]);
        expect(JSON.parse(document.querySelector('[data-groupfilter-datalocker]').value)).toEqual(['2', '1']);
        expect(document.activeElement.getAttribute('aria-label')).toBe('Remove Desks');
        document.activeElement.click();

        expect(names('active')).toEqual(['Lamps']);
        expect(names('available')).toEqual(['Desks']);
        expect(document.activeElement.getAttribute('aria-label')).toBe('Add Desks');
        expect(jax.requests.length).toBe(0);
    });

    test('search keeps selected chips visible and does not restore a locally removed selection', () => {
        renderFilter(`<div class="filter-group"><a href="javascript:;" class="filter-scope" data-scope-name="tags">Tags</a><template data-scope-form>${groupForm({
            active: [{ id: '2', name: 'Lamps' }],
            available: [{ id: '1', name: 'Desks' }, { id: '2', name: 'Lamps' }]
        })}</template></div>`);
        openScope('tags');
        document.querySelector('[data-groupfilter-available] button').click();

        const group = document.querySelector('[data-control="groupfilter"]');
        const searchResult = options => group.dispatchEvent(new CustomEvent('ajax:done', { bubbles: true, detail: { data: { options } } }));
        searchResult({ active: [], available: [{ id: '3', name: 'Tables' }] });

        expect(names('active')).toEqual(['Lamps', 'Desks']);
        expect(names('available')).toEqual(['Tables']);
        const remove = document.querySelector('[data-groupfilter-active] button');
        remove.focus();
        remove.click();
        expect(names('active')).toEqual(['Desks']);
        expect(names('available')).toEqual(['Tables']);
        expect(document.activeElement).toBe(group.querySelector('input[name="search"]'));

        searchResult({ active: [{ id: '2', name: 'Lamps' }], available: [{ id: '1', name: 'Desks' }, { id: '2', name: 'Lamps' }, { id: '3', name: 'Tables' }] });
        expect(names('active')).toEqual(['Desks']);
        expect(names('available')).toEqual(['Lamps', 'Tables']);
        expect(JSON.parse(group.querySelector('[data-groupfilter-datalocker]').value)).toEqual(['1']);
    });
});

describe('condition triggers', () => {
    test('condition facets toggle through the input-trigger control', async () => {
        renderFilter();

        bindRenderedControls();
        const popover = openScope('id'),
            single = popover.element.querySelector('#facet-single'),
            between = popover.element.querySelector('#facet-between');

        expect(single.dataset.control).toBe('input-trigger');
        expect(between.dataset.control).toBe('input-trigger');
        expect(single.classList.contains('oc-hide')).toBe(false);
        expect(between.classList.contains('oc-hide')).toBe(true);

        const select = popover.element.querySelector('select[name="Filter[condition]"]');
        select.value = 'between';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(50);

        expect(single.classList.contains('oc-hide')).toBe(true);
        expect(between.classList.contains('oc-hide')).toBe(false);
    });
});

describe('scope updates', () => {
    test.each(['popover', 'dropdown'])('a %s chip cross clears only that scope without opening it', (type) => {
        const scope = type === 'dropdown'
            ? '<div class="filter-scope scope-dropdown" data-scope-name="status"><button class="combobox-toggle">Status</button></div>'
            : '<a href="javascript:;" class="filter-scope" data-scope-name="status">Status</a>';
        renderFilter(`<div class="filter-group"><div class="filter-chip active"><button type="button" data-filter-clear-scope><i id="clear-chip-icon"></i></button>${scope}</div></div>`);
        openScope('id');

        document.getElementById('clear-chip-icon').click();

        expect(jax.requests.length).toBe(1);
        expect(jax.requests[0].options.data).toEqual({ scopeName: 'status', clearScope: true });
        expect(Popover.activeInstance).toBe(null);
    });

    test('popover apply submits the form values for the active scope and closes', () => {
        renderFilter();
        jax.requests = [];

        const popover = openScope('id');
        popover.element.querySelector('[data-filter-action="apply"]').click();

        const request = jax.requests[0];
        expect(request.handler).toBe('filter::onFilterUpdate');
        expect(request.element).toBe(document.getElementById('Filter'));
        expect(request.options.data).toEqual({
            scopeName: 'id',
            'Filter[condition]': 'equals',
            'Filter[value]': '5',
            'Filter[min]': ''
        });
        expect(Popover.activeInstance).toBe(null);
        expect(document.querySelector('.popover-highlight')).toBe(null);
    });

    test('a successful update dispatches filter-scope:change on the scope rendered after it', () => {
        renderFilter();
        jax.requests = [];

        const filter = document.getElementById('Filter'),
            seen = [];

        filter.addEventListener('filter-scope:change', (ev) => seen.push(ev.target));

        pickDomain('example.com');

        const request = jax.requests[0];
        expect(request.options.data).toEqual({ value: 'example.com', scopeName: 'domain' });
        expect(filter.classList.contains('is-loading')).toBe(true);
        expect(seen.length).toBe(0);

        // The server renders the scope again before the request settles
        document.getElementById('Filter-scope-domain-group').innerHTML = '<div class="filter-scope scope-dropdown" data-scope-name="domain"></div>';
        request.resolve({});

        expect(filter.classList.contains('is-loading')).toBe(false);
        expect(seen).toEqual([document.querySelector('[data-scope-name="domain"]')]);
    });

    test('a press inside a date picker calendar keeps the scope popover open, a press elsewhere closes it', async () => {
        renderFilter();

        openScope('id');
        await sleep(0);

        document.body.insertAdjacentHTML('beforeend', '<div data-vc="calendar" data-vc-input><div data-vc="dates"><button id="calendar-day" type="button" data-vc-date-btn></button></div></div><p id="outside"></p>');

        document.getElementById('calendar-day').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect(Popover.activeInstance).not.toBe(null);

        document.getElementById('outside').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect(Popover.activeInstance).toBe(null);
    });

    test('changing a dropdown scope closes an open scope popover', () => {
        renderFilter();

        openScope('id');
        expect(Popover.activeInstance).not.toBe(null);

        pickDomain('example.com');

        expect(Popover.activeInstance).toBe(null);
    });

    test('picking a dropdown option copies its mark beside the label, leaving the label to the combobox', () => {
        renderFilter();

        pickDomain('example.com');

        const mark = document.querySelector('[data-scope-name="domain"] [data-scope-mark]');
        expect(mark.innerHTML).toBe('<i class="ph ph-globe" aria-hidden="true"></i>');
        expect(document.querySelector('[data-scope-name="domain"] .combobox-value').textContent).toBe('All');

        pickDomain('');

        expect(mark.childNodes.length).toBe(0);
        expect(jax.requests.map((request) => request.options.data.value)).toEqual(['example.com', '']);
    });

    test('opening a dropdown scope focuses its picked option', async () => {
        renderFilter();

        const scope = document.querySelector('[data-scope-name="domain"]');
        pickDomain('example.com');
        scope.querySelector('.combobox-toggle').focus();

        scope.querySelector('.combobox-toggle').dispatchEvent(new CustomEvent('shown.bs.combobox', { bubbles: true }));
        await sleep(50);

        expect(document.activeElement).toBe(scope.querySelector('.menu-item[data-bs-value="example.com"]'));
    });

    test('a combobox change from outside the dropdown scopes is left alone', () => {
        renderFilter('<div class="filter-group"><button type="button" id="other-toggle" class="combobox-toggle"></button></div>');
        jax.requests = [];

        document.getElementById('other-toggle').dispatchEvent(new CustomEvent('change.bs.combobox', { bubbles: true }));

        expect(jax.requests.length).toBe(0);
    });

    test('the page parameter resets with each update', () => {
        renderFilter();
        document.getElementById('Filter').dataset.pageName = 'usersPage';
        jax.disconnectAll();
        jax.connect('filterwidget', document.getElementById('Filter'));
        jax.requests = [];

        pickDomain('');

        expect(jax.requests[0].options.query).toEqual({ usersPage: null });
    });
});

describe('active scope ordering', () => {
    const names = ['alpha', 'beta', 'gamma', 'delta'];

    function scopeMarkup(name, active = false) {
        return `<button type="button" class="filter-scope scope-checkbox ${active ? 'active' : ''}" data-scope-name="${name}">${name}</button>`;
    }

    function groupsMarkup(active = [], order = names) {
        return order.map(name => `<div class="filter-group" data-filter-order="${names.indexOf(name) * 100}">${scopeMarkup(name, active.includes(name))}</div>`).join('');
    }

    function renderOrderedFilter(active = [], order = names) {
        const control = renderFilter(`<div class="filter-scroll"><div class="filter-scopes">${groupsMarkup(active, order)}</div></div>`);
        return { control, scrollable: document.querySelector('.filter-scopes') };
    }

    function scopeOrder() {
        return [...document.querySelectorAll('.filter-scopes > .filter-group > .filter-scope')].map(el => el.dataset.scopeName);
    }

    function updateScope(name, active) {
        const scope = document.querySelector(`.filter-scopes [data-scope-name="${name}"]`);
        scope.click();
        scope.parentNode.innerHTML = scopeMarkup(name, active);
        jax.requests.at(-1).resolve();
    }

    test('restored active scopes lead in configured order, followed by inactive scopes', () => {
        renderOrderedFilter(['alpha', 'gamma'], ['gamma', 'alpha', 'delta', 'beta']);

        expect(scopeOrder()).toEqual(['alpha', 'gamma', 'beta', 'delta']);
        expect(jax.requests.length).toBe(0);
    });

    test('applying a rightmost scope moves it first and scrolls back after a successful response', () => {
        const { scrollable } = renderOrderedFilter();
        scrollable.scrollLeft = 200;
        const scope = document.querySelector('[data-scope-name="delta"]');
        scope.click();

        expect(scopeOrder()).toEqual(names);
        expect(scrollable.scrollLeft).toBe(200);

        scope.parentNode.innerHTML = scopeMarkup('delta', true);
        jax.requests[0].resolve();

        expect(scopeOrder()).toEqual(['delta', 'alpha', 'beta', 'gamma']);
        expect(scrollable.scrollLeft).toBe(0);
    });

    test('clearing scopes restores their configured place among inactive scopes', () => {
        const { scrollable } = renderOrderedFilter(['gamma', 'delta']);
        scrollable.scrollLeft = 200;
        updateScope('gamma', false);
        expect(scopeOrder()).toEqual(['delta', 'alpha', 'beta', 'gamma']);
        expect(scrollable.scrollLeft).toBe(0);

        updateScope('delta', false);
        expect(scopeOrder()).toEqual(names);
    });

    test('another active scope remains in order and the newly applied scope is revealed', () => {
        const { scrollable } = renderOrderedFilter(['gamma']);
        Object.defineProperty(document.querySelector('[data-scope-name="gamma"]').parentNode, 'offsetLeft', { value: 40 });
        Object.defineProperty(document.querySelector('[data-scope-name="delta"]').parentNode, 'offsetLeft', { value: 180 });

        updateScope('delta', true);

        expect(scopeOrder()).toEqual(['gamma', 'delta', 'alpha', 'beta']);
        expect(scrollable.scrollLeft).toBe(140);
    });

    test('replacing the full filter container rebinds and orders the new scopes', () => {
        const { control, scrollable } = renderOrderedFilter(['gamma']);
        document.getElementById('Filter').innerHTML = `<div class="filter-scroll"><div class="filter-scopes">${groupsMarkup(['beta', 'delta'])}</div></div>`;
        jax.Events.dispatch('ajax:update', { target: document.getElementById('Filter') });

        expect(control.scrollable).not.toBe(scrollable);
        expect(scopeOrder()).toEqual(['beta', 'delta', 'alpha', 'gamma']);
    });
});

describe('checkbox chips', () => {
    // A checkbox chip as its partial renders it, with a check in place of the plus while it is on
    function scopeMarkup(active = false) {
        return `<div class="filter-chip ${active ? 'active' : ''}">
            <button type="button" class="filter-scope scope-checkbox ${active ? 'active' : ''}"
                data-scope-name="verified" aria-pressed="${active}"><i class="ph ${active ? 'ph-check' : 'ph-plus-circle'}" aria-hidden="true"></i><span>Verified</span></button>
        </div>`;
    }

    test.each([false, true])('clicking a checkbox chip with active=%s toggles it directly', (active) => {
        renderFilter(`<div class="filter-group">${scopeMarkup(active)}</div>`);
        openScope('id');
        document.querySelector('[data-scope-name="verified"] span').click();

        expect(jax.requests.length).toBe(1);
        expect(jax.requests[0].options.data).toEqual({ scopeName: 'verified', value: active ? 0 : 1 });
        expect(Popover.activeInstance).toBe(null);
    });

    test('a second click uses the state returned by the server to toggle off', () => {
        renderFilter(`<div class="filter-group" id="checkbox-group">${scopeMarkup()}</div>`);
        document.querySelector('[data-scope-name="verified"]').click();
        document.getElementById('checkbox-group').innerHTML = scopeMarkup(true);
        jax.requests[0].resolve();
        jax.requests = [];
        document.querySelector('[data-scope-name="verified"]').click();

        expect(jax.requests.length).toBe(1);
        expect(jax.requests[0].options.data).toEqual({ scopeName: 'verified', value: 0 });
        expect(Popover.activeInstance).toBe(null);
    });
});

describe('primary scope tabs', () => {
    function tabsMarkup(value = '') {
        return `<div class="filter-scope scope-tabs nav" data-scope-name="status" role="group" aria-label="Status">
            ${[['', 'All statuses'], ['open', 'Open'], ['0', 'Draft']].map(([key, label]) => `<button type="button" class="nav-link ${key === value ? 'active' : ''}" data-filter-tab-value="${key}" aria-pressed="${key === value}"><span>${label}</span></button>`).join('')}
        </div>`;
    }

    function renderTabs() {
        const control = renderFilter('<div class="filter-scroll"><div class="filter-scopes"><div class="filter-group"><button class="filter-scope" data-scope-name="secondary">Secondary</button></div></div></div>');
        control.element.insertAdjacentHTML('afterbegin', `<div class="filter-row filter-primary"><div class="filter-group" id="status-group">${tabsMarkup()}</div></div>`);
        control.config.pageName = 'projectsPage';
        return control;
    }

    test.each(['open', '', '0'])('a primary tab submits its value %s once and resets pagination', (value) => {
        renderTabs();
        openScope('id');
        document.querySelector(`[data-filter-tab-value="${value}"] span`).click();

        expect(jax.requests.length).toBe(1);
        expect(jax.requests[0].options.data).toEqual({ scopeName: 'status', value });
        expect(jax.requests[0].options.query).toEqual({ projectsPage: null });
        expect(Popover.activeInstance).toBe(null);
    });

    test('a successful tab update restores focus to the rendered selection and preserves secondary scroll', () => {
        const control = renderTabs();
        control.scrollable.scrollLeft = 120;
        const tab = document.querySelector('[data-filter-tab-value="open"]');
        tab.focus();
        tab.click();

        document.getElementById('status-group').innerHTML = tabsMarkup('open');
        let changes = 0;
        document.getElementById('status-group').addEventListener('filter-scope:change', () => changes++);
        jax.requests[0].resolve();

        expect(document.activeElement).toBe(document.querySelector('[data-filter-tab-value="open"]'));
        expect(document.activeElement.getAttribute('aria-pressed')).toBe('true');
        expect(control.scrollable.scrollLeft).toBe(120);
        expect(changes).toBe(1);
    });

    test('a secondary update keeps primary tabs in their configured order without taking focus', () => {
        const control = renderTabs();
        const secondary = document.querySelector('[data-scope-name="secondary"]');
        secondary.focus();
        control.submitUpdate(secondary, { value: 1 });
        secondary.classList.add('active');
        jax.requests[0].resolve();

        expect([...document.querySelectorAll('[data-filter-tab-value]')].map(tab => tab.dataset.filterTabValue)).toEqual(['', 'open', '0']);
        expect(document.activeElement).toBe(secondary);
        expect(document.querySelector('.filter-primary .scope-tabs')).not.toBe(null);
    });

    test('tabs wider than their row drag scroll in their group, which brings the picked tab into view when they render again', async () => {
        renderFilter(`<div class="filter-row filter-primary"><div class="filter-group" id="status-group">${tabsMarkup()}</div></div>`);
        const group = document.getElementById('status-group');

        // A row narrower than its tabs, measured as a browser lays it out
        Object.defineProperties(group, {
            clientWidth: { configurable: true, value: 300 },
            offsetWidth: { configurable: true, value: 300 },
            scrollWidth: { configurable: true, value: 1000 }
        });

        group.innerHTML = tabsMarkup('0');
        Object.defineProperties(group.querySelector('[data-filter-tab-value="0"]'), {
            offsetLeft: { configurable: true, value: 800 },
            offsetWidth: { configurable: true, value: 120 }
        });
        jax.Events.dispatch('ajax:update', { target: group });
        await sleep(50);

        expect(group.scrollLeft).toBe(620);
        expect(group.parentNode.classList.contains('scroll-before')).toBe(true);
        expect(group.parentNode.classList.contains('scroll-after')).toBe(true);
    });
});

describe('switch menus', () => {
    // The three states as the switch partial renders them: Any, then a check and a cross beside the label
    const states = [[0, '', 'Any'], [2, '<i class="ph ph-check" aria-hidden="true"></i>', 'Published'], [1, '<i class="ph ph-x" aria-hidden="true"></i>', 'Published']];

    function switchMarkup(value = 0) {
        const mark = states.find(([state]) => state === value)[1];

        return `<div class="filter-group" id="published-group">
            <div class="filter-scope filter-chip scope-switch ${value ? 'active' : ''}" data-scope-name="published">
                ${value ? '<button type="button" class="filter-chip-clear" data-filter-clear-scope>Clear</button>' : ''}
                <button type="button" class="combobox-toggle" data-bs-toggle="combobox">
                    <span class="filter-label">Published</span>
                    <span class="filter-setting"><span aria-hidden="true" data-scope-mark>${mark}</span><span class="combobox-value visually-hidden"></span></span>
                </button>
                <div class="menu control-dropdown" role="listbox">
                    ${states.map(([state, icon, label]) => `<button type="button" class="menu-item ${state === value ? 'selected' : ''}" role="option" data-bs-value="${state}">${icon}<span class="menu-item-content"><span>${label}</span></span></button>`).join('')}
                </div>
            </div>
        </div>`;
    }

    // Picks a state as Bootstrap's combobox does, marking it selected and announcing the change from the toggle
    function pickSwitch(value) {
        const scope = document.querySelector('[data-scope-name="published"]');

        scope.querySelectorAll('.menu-item').forEach((item) => item.classList.toggle('selected', item.dataset.bsValue === String(value)));
        scope.querySelector('.combobox-toggle').dispatchEvent(new CustomEvent('change.bs.combobox', { bubbles: true }));
    }

    const mark = () => document.querySelector('[data-scope-name="published"] [data-scope-mark]');

    test.each([[2, 'ph ph-check'], [1, 'ph ph-x']])('picking state %i submits it at once and shows its mark beside the label', (value, icon) => {
        renderFilter(switchMarkup());
        openScope('id');

        pickSwitch(value);

        expect(jax.requests.map((request) => request.options.data)).toEqual([{ scopeName: 'published', value: String(value) }]);
        expect(mark().querySelector('i').className).toBe(icon);
        expect(Popover.activeInstance).toBe(null);
    });

    test('picking Any submits no filter and clears the mark', () => {
        renderFilter(switchMarkup(2));

        pickSwitch(0);

        expect(jax.requests[0].options.data).toEqual({ scopeName: 'published', value: '0' });
        expect(mark().childNodes.length).toBe(0);
    });

    test('the cross on an active switch chip clears it', () => {
        renderFilter(switchMarkup(1));

        document.querySelector('[data-filter-clear-scope]').click();

        expect(jax.requests.map((request) => request.options.data)).toEqual([{ scopeName: 'published', clearScope: true }]);
    });

    test('opening the menu focuses the picked state', async () => {
        renderFilter(switchMarkup(1));

        document.querySelector('[data-scope-name="published"] .combobox-toggle').dispatchEvent(new CustomEvent('shown.bs.combobox', { bubbles: true }));
        await sleep(50);

        expect(document.activeElement).toBe(document.querySelector('[data-scope-name="published"] .menu-item[data-bs-value="1"]'));
    });
});

describe('saved filters', () => {
    // The filter menu as its partials render it, with one saved set and the save and manage forms beside it
    function renderSavedFilters() {
        renderFilter(`<div class="filter-group filter-setup">
            <a href="javascript:;" class="filter-action" data-bs-toggle="menu">Menu</a>
            <div class="menu control-dropdown" role="menu">
                <a data-filter-save class="menu-item" href="javascript:;">Save Filters...</a>
                <div class="submenu">
                    <a class="menu-item" href="javascript:;">Saved Filters</a>
                    <div class="menu control-dropdown" role="menu">
                        <a data-filter-saved="Open &amp; recent" class="menu-item" href="javascript:;">Open &amp; recent</a>
                        <a data-filter-manage-saved class="menu-item" href="javascript:;">Manage...</a>
                    </div>
                </div>
            </div>
            <div hidden>
                <template data-filter-save-form>
                    <div class="filter-box">
                        <input type="text" name="savedFilterName" required />
                        <select name="savedFilterExisting">
                            <option value="">- Select -</option>
                            <option value="Big">Big</option>
                            <option value="Open &amp; recent">Open &amp; recent</option>
                        </select>
                        <button type="submit" data-filter-action="save" data-label-save="Save" data-label-update="Update">Save</button>
                    </div>
                </template>
                <template data-filter-manage-form>
                    <ul class="filter-saved-list">
                        <li><span>Big</span><button type="button" data-filter-action="delete-saved" data-saved-name="Big">Delete</button></li>
                        <li><span>Open &amp; recent</span><button type="button" data-filter-action="delete-saved" data-saved-name="Open &amp; recent">Delete</button></li>
                    </ul>
                </template>
            </div>
        </div>`);

        const filter = document.getElementById('Filter');
        Object.assign(filter.dataset, {
            saveHandler: 'filter::onSaveFilters',
            applySavedHandler: 'filter::onApplySavedFilters',
            deleteSavedHandler: 'filter::onDeleteSavedFilters',
            pageName: 'postsPage'
        });

        jax.disconnectAll();
        jax.connect('filterwidget', filter);
        jax.requests = [];

        return filter;
    }

    const click = (selector) => document.querySelector(selector).click();

    test('Save Filters opens the save form below the menu button with the name focused', async () => {
        renderSavedFilters();

        click('[data-filter-save]');
        await sleep(50);

        const popover = Popover.activeInstance;
        expect(popover).not.toBe(null);
        expect(document.querySelector('.filter-setup > [data-bs-toggle="menu"]').classList.contains('popover-highlight')).toBe(true);
        expect(document.activeElement).toBe(popover.element.querySelector('[name="savedFilterName"]'));
        expect(jax.requests.length).toBe(0);
    });

    test('submitting the save form posts the trimmed name and closes the form', () => {
        renderSavedFilters();
        click('[data-filter-save]');

        const form = Popover.activeInstance.element.querySelector('form');
        form.querySelector('[name="savedFilterName"]').value = '  Open invoices ';
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        expect(jax.requests.map((request) => [request.handler, request.options.data])).toEqual([
            ['filter::onSaveFilters', { savedFilterName: 'Open invoices' }]
        ]);
        expect(Popover.activeInstance).toBe(null);
    });

    // The save form fields, and helpers that use them as a visitor does
    function saveForm() {
        const form = Popover.activeInstance.element.querySelector('form'),
            input = form.querySelector('[name="savedFilterName"]'),
            select = form.querySelector('[name="savedFilterExisting"]');

        return {
            form,
            input,
            select,
            button: form.querySelector('[data-filter-action="save"]'),
            type: (value) => {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            },
            pick: (value) => {
                select.value = value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
            },
            submit: () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        };
    }

    test('picking an existing set clears the new name, turns Save into Update and saves under that set', () => {
        renderSavedFilters();
        click('[data-filter-save]');
        const { input, button, type, pick, submit } = saveForm();

        type('Draft name');
        pick('Open & recent');

        expect(input.value).toBe('');
        expect(input.required).toBe(false);
        expect(button.textContent).toBe('Update');

        submit();
        expect(jax.requests.map((request) => request.options.data)).toEqual([{ savedFilterName: 'Open & recent' }]);
        expect(Popover.activeInstance).toBe(null);
    });

    test('typing a new name resets the picked set and turns Update back into Save', () => {
        renderSavedFilters();
        click('[data-filter-save]');
        const { input, select, button, type, pick, submit } = saveForm();

        let selectChanges = 0;
        select.addEventListener('change', () => selectChanges++);

        pick('Big');
        type('Bigger');

        expect(select.value).toBe('');
        expect(selectChanges).toBe(2);
        expect(input.required).toBe(true);
        expect(button.textContent).toBe('Save');

        submit();
        expect(jax.requests.map((request) => request.options.data)).toEqual([{ savedFilterName: 'Bigger' }]);
    });

    test('a blank name saves nothing and keeps the form open', () => {
        renderSavedFilters();
        click('[data-filter-save]');

        const form = Popover.activeInstance.element.querySelector('form');
        form.querySelector('[name="savedFilterName"]').value = '   ';
        const submit = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submit);

        expect(submit.defaultPrevented).toBe(true);
        expect(jax.requests.length).toBe(0);
        expect(Popover.activeInstance).not.toBe(null);
    });

    test('a saved set applies by name, resets the page and shows the list updating until it ends', () => {
        const filter = renderSavedFilters();

        click('[data-filter-saved]');

        const request = jax.requests[0];
        expect(request.handler).toBe('filter::onApplySavedFilters');
        expect(request.options.data).toEqual({ savedFilterName: 'Open & recent' });
        expect(request.options.query).toEqual({ postsPage: null });
        expect(filter.classList.contains('is-loading')).toBe(true);

        request.resolve({});
        expect(filter.classList.contains('is-loading')).toBe(false);
    });

    test('deleting from the manage form removes each row as it goes and closes after the last', async () => {
        renderSavedFilters();
        click('[data-filter-manage-saved]');
        await sleep(50);

        const popover = Popover.activeInstance;
        expect(document.activeElement).toBe(popover.element.querySelector('[data-saved-name="Big"]'));

        popover.element.querySelector('[data-saved-name="Big"]').click();
        expect(popover.element.querySelectorAll('.filter-saved-list li').length).toBe(1);
        expect(Popover.activeInstance).toBe(popover);
        expect(document.activeElement).toBe(popover.element.querySelector('[data-saved-name="Open & recent"]'));

        popover.element.querySelector('[data-saved-name="Open & recent"]').click();
        expect(Popover.activeInstance).toBe(null);

        expect(jax.requests.map((request) => [request.handler, request.options.data])).toEqual([
            ['filter::onDeleteSavedFilters', { savedFilterName: 'Big' }],
            ['filter::onDeleteSavedFilters', { savedFilterName: 'Open & recent' }]
        ]);
    });
});

describe('inline scopes', () => {
    const inlineScope = `
        <div class="filter-group" id="Filter-scope-code-group">
            <div class="filter-scope scope-inline" data-scope-name="code">
                <input type="text" name="Filter[value]" value="abc" />
                <button type="button" data-filter-action="apply">Apply</button>
                <button type="button" data-filter-action="clear">Clear</button>
            </div>
        </div>
    `;

    test('apply submits the values inside the scope', () => {
        renderFilter(inlineScope);
        jax.requests = [];

        document.querySelector('[data-scope-name="code"] [data-filter-action="apply"]').click();

        expect(jax.requests.length).toBe(1);
        expect(jax.requests[0].handler).toBe('filter::onFilterUpdate');
        expect(jax.requests[0].options.data).toEqual({ 'Filter[value]': 'abc', scopeName: 'code' });
    });

    test('clear resets the scope and closes an open popover', () => {
        renderFilter(inlineScope);
        openScope('id');
        jax.requests = [];

        document.querySelector('[data-scope-name="code"] [data-filter-action="clear"]').click();

        expect(jax.requests[0].options.data).toEqual({ clearScope: true, scopeName: 'code' });
        expect(Popover.activeInstance).toBe(null);
    });
});

describe('linked list', () => {
    // A stand-in list control that records what the filter asks of it, since the list widget's own state has its own tests
    beforeAll(() => {
        jax.registerControl('listwidget', class extends jax.ControlBase {
            setUpdating(isUpdating) {
                this.element.classList.toggle('is-updating', isUpdating);

                if (isUpdating) {
                    this.element.setAttribute('aria-busy', 'true');
                }
                else {
                    this.element.removeAttribute('aria-busy');
                }
            }
        });
    });

    // Renders a list for the filter to link to, as the list widget's container and control
    function renderList() {
        document.body.insertAdjacentHTML('beforeend', `
            <div class="list-widget" id="Lists">
                <div class="control-list" data-control="listwidget">
                    <div class="list-content"><table class="table data"><tbody><tr><td>Row</td></tr></tbody></table></div>
                </div>
            </div>
        `);

        return jax.connect('listwidget', document.querySelector('#Lists > .control-list'));
    }

    const changeDomain = () => pickDomain('example.com');

    test('a scope update marks the linked list as updating until the request ends', () => {
        renderFilter();
        document.getElementById('Filter').dataset.listLinkage = 'Lists';
        renderList();
        jax.requests = [];

        const list = document.querySelector('#Lists > .control-list');
        changeDomain();

        expect(list.classList.contains('is-updating')).toBe(true);
        expect(list.getAttribute('aria-busy')).toBe('true');

        jax.requests[0].resolve();

        expect(list.classList.contains('is-updating')).toBe(false);
        expect(list.hasAttribute('aria-busy')).toBe(false);
    });

    test('a filter without a linked list leaves lists alone', () => {
        renderFilter();
        renderList();
        jax.requests = [];

        changeDomain();

        expect(document.querySelector('#Lists > .control-list').classList.contains('is-updating')).toBe(false);
    });
});
