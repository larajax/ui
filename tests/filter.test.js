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
                    <select><option value="">All</option><option value="example.com">example.com</option></select>
                </div>
            </div>
            <div class="filter-group" id="Filter-scope-id-group">
                <a href="javascript:;" class="filter-scope" data-scope-name="id">ID</a>
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

// The connect-time preload request
function preloadRequest() {
    return jax.requests.find((request) => request.options.data && request.options.data.preload);
}

// Stands in for the framework's render pass: render hooks mark controls, then the observer connects them
function bindRenderedControls() {
    addEventListener('render', () => jax.connectAll(), { once: true });
}

function openScope(name) {
    [...document.querySelectorAll('a.filter-scope')].find((el) => el.dataset.scopeName === name).click();
    return Popover.activeInstance;
}

describe('preloaded popover content', () => {
    test('connect requests every popover scope form through the update handler', () => {
        renderFilter();

        const request = preloadRequest();
        expect(request.handler).toBe('filter::onFilterUpdate');
        expect(request.options.data).toEqual({ preload: true });
        expect(typeof request.options.error).toBe('function');
    });

    test('a preloaded scope opens without a load request and initializes its controls', () => {
        renderFilter();
        preloadRequest().resolve({ popoverContent: { id: numberForm } });
        jax.requests = [];

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

    test('the scope name is escaped into the popover template', () => {
        renderFilter('<div class="filter-group"><a href="javascript:;" class="filter-scope" data-scope-name="a&quot;b">Odd</a></div>');
        preloadRequest().resolve({ popoverContent: {} });

        const popover = openScope('a"b');

        expect(popover.element.querySelector('[name="scopeName"]').value).toBe('a"b');
    });

    test('a scope without preloaded content loads it and caches it until the scope is applied', () => {
        renderFilter();
        preloadRequest().resolve({ popoverContent: {} });
        jax.requests = [];

        let popover = openScope('id');
        const load = jax.requests[0];
        expect(load.handler).toBe('filter::onLoadFilterForm');
        expect(load.element).toBe(popover.element.querySelector('form'));

        load.resolve({ result: numberForm });
        expect(popover.element.querySelector('#facet-between')).not.toBe(null);

        // Closing without applying keeps the cached form
        popover.hide();
        jax.requests = [];
        openScope('id');
        expect(jax.requests.length).toBe(0);

        // Applying forgets it
        Popover.activeInstance.element.querySelector('[data-filter-action="apply"]').click();
        jax.requests = [];
        openScope('id');
        expect(jax.requests.map((request) => request.handler)).toEqual(['filter::onLoadFilterForm']);
    });

    test('scopes rendered again by the server drop their preloaded content', () => {
        renderFilter();
        preloadRequest().resolve({ popoverContent: { id: numberForm, name: '<p>Names</p>' } });
        jax.requests = [];

        // A dependsOn reset patches the name scope group
        const group = document.getElementById('Filter-scope-name-group');
        group.innerHTML = '<a href="javascript:;" class="filter-scope" data-scope-name="name">Name</a>';
        jax.Events.dispatch('ajax:update', { target: group });

        openScope('name');
        expect(jax.requests.map((request) => request.handler)).toEqual(['filter::onLoadFilterForm']);

        jax.requests = [];
        openScope('id');
        expect(jax.requests.length).toBe(0);
    });
});

describe('condition triggers', () => {
    test('condition facets toggle through the input-trigger control', async () => {
        renderFilter();
        preloadRequest().resolve({ popoverContent: { id: numberForm } });

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
    test('popover apply submits the form values for the active scope and closes', () => {
        renderFilter();
        preloadRequest().resolve({ popoverContent: { id: numberForm } });
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

        const select = document.querySelector('[data-scope-name="domain"] select');
        select.value = 'example.com';
        select.dispatchEvent(new Event('change', { bubbles: true }));

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

    test('a checkbox scope submits its checked state and marks the scope active', () => {
        renderFilter(`
            <div class="filter-group" id="Filter-scope-verified-group">
                <div class="filter-scope scope-checkbox form-field" data-scope-name="verified">
                    <input class="check check-sm" type="checkbox" id="scopeVerified" />
                    <label for="scopeVerified">Verified</label>
                </div>
            </div>
        `);
        jax.requests = [];

        const scope = document.querySelector('[data-scope-name="verified"]');
        scope.querySelector('input').click();

        expect(jax.requests[0].options.data).toEqual({ value: true, scopeName: 'verified' });
        expect(scope.classList.contains('active')).toBe(true);
    });

    test('a press inside a date picker calendar keeps the scope popover open, a press elsewhere closes it', async () => {
        renderFilter();
        preloadRequest().resolve({ popoverContent: { id: numberForm } });

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
        preloadRequest().resolve({ popoverContent: { id: numberForm } });

        openScope('id');
        expect(Popover.activeInstance).not.toBe(null);

        const select = document.querySelector('[data-scope-name="domain"] select');
        select.value = 'example.com';
        select.dispatchEvent(new Event('change', { bubbles: true }));

        expect(Popover.activeInstance).toBe(null);
    });

    test('the page parameter resets with each update', () => {
        renderFilter();
        document.getElementById('Filter').dataset.pageName = 'usersPage';
        jax.disconnectAll();
        jax.connect('filterwidget', document.getElementById('Filter'));
        jax.requests = [];

        const select = document.querySelector('[data-scope-name="domain"] select');
        select.dispatchEvent(new Event('change', { bubbles: true }));

        expect(jax.requests[0].options.query).toEqual({ usersPage: null });
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
        preloadRequest().resolve({ popoverContent: { id: numberForm } });
        openScope('id');
        jax.requests = [];

        document.querySelector('[data-scope-name="code"] [data-filter-action="clear"]').click();

        expect(jax.requests[0].options.data).toEqual({ clearScope: true, scopeName: 'code' });
        expect(Popover.activeInstance).toBe(null);
    });
});
