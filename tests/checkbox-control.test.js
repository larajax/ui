import { beforeEach, describe, expect, test } from 'bun:test';
import { registerCheckbox } from '../resources/assets/controls/checkbox/checkbox-control.js';
import { registerFilterWidget } from '../resources/assets/widgets/filter/filter.js';

function makeFakeJax() {
    const controls = new Map();
    const requests = [];

    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = { ...element.dataset };
        }

        listen(eventName, targetOrHandler, handler) {
            if (targetOrHandler instanceof Element) {
                targetOrHandler.addEventListener(eventName, handler.bind(this));
            }
            else {
                this.element.addEventListener(eventName, targetOrHandler.bind(this));
            }
        }
    }

    return {
        controls,
        requests,
        ControlBase,
        registerControl(id, control) {
            controls.set(id, control);
        },
        request(element, handler, options) {
            requests.push({ handler, data: { ...options.data } });
            return { always(callback) { callback(); } };
        },
    };
}

function connectControl(jax, id, element) {
    const control = new (jax.controls.get(id))(element);
    control.init?.();
    control.connect();
    return control;
}

function renderSwitch(dataChecked) {
    const attr = dataChecked === undefined ? '' : ` data-checked="${dataChecked}"`;

    document.body.innerHTML = `
        <div class="control-filter" data-update-handler="onFilterUpdate">
            <div class="filter-scope form-check is-indeterminate" data-scope-name="is_approved">
                <input class="form-check-input" type="checkbox" id="scopeApproved"${attr} />
                <label class="form-check-label" for="scopeApproved">Approved</label>
            </div>
        </div>
    `;

    return {
        filter: document.querySelector('.control-filter'),
        scope: document.querySelector('.filter-scope'),
        input: document.querySelector('input'),
    };
}

function stateOf(input) {
    return {
        state: input.dataset.checked,
        indeterminate: input.indeterminate,
        checked: input.checked,
    };
}

describe('checkbox control', () => {
    let jax;

    beforeEach(() => {
        jax = makeFakeJax();
        registerCheckbox(jax);
    });

    test('applies the initial state from data-checked', () => {
        const { scope, input } = renderSwitch(1);
        connectControl(jax, 'checkbox', scope);

        expect(stateOf(input)).toEqual({ state: '1', indeterminate: true, checked: false });
    });

    test('falls back to the checked attribute without data-checked', () => {
        const { scope, input } = renderSwitch();
        input.checked = true;
        connectControl(jax, 'checkbox', scope);

        expect(stateOf(input)).toEqual({ state: '2', indeterminate: false, checked: true });
    });

    test('clicking cycles unchecked, indeterminate, checked', () => {
        const { scope, input } = renderSwitch(0);
        connectControl(jax, 'checkbox', scope);

        input.click();
        expect(stateOf(input)).toEqual({ state: '1', indeterminate: true, checked: false });

        input.click();
        expect(stateOf(input)).toEqual({ state: '2', indeterminate: false, checked: true });

        input.click();
        expect(stateOf(input)).toEqual({ state: '0', indeterminate: false, checked: false });
    });

    test('clicking a checked input without data-checked unchecks it', () => {
        const { scope, input } = renderSwitch();
        input.checked = true;
        connectControl(jax, 'checkbox', scope);

        input.click();
        expect(stateOf(input)).toEqual({ state: '0', indeterminate: false, checked: false });
    });

    test('change listeners read the advanced state', () => {
        const { scope, input } = renderSwitch(0);
        connectControl(jax, 'checkbox', scope);

        const seen = [];
        input.addEventListener('change', () => seen.push(input.dataset.checked));

        input.click();
        input.click();
        input.click();

        expect(seen).toEqual(['1', '2', '0']);
    });
});

describe('filter switch scope', () => {
    let jax;

    beforeEach(() => {
        jax = makeFakeJax();
        registerCheckbox(jax);
        registerFilterWidget(jax);
    });

    test('leaves the initial visual state to the checkbox control', () => {
        const { filter, scope, input } = renderSwitch(1);
        connectControl(jax, 'checkbox', scope);
        connectControl(jax, 'filterwidget', filter);

        expect(stateOf(input)).toEqual({ state: '1', indeterminate: true, checked: false });
        expect(scope.classList.contains('active')).toBe(true);
    });

    test('submits the checkbox control state once per click', () => {
        const { filter, scope, input } = renderSwitch(0);
        connectControl(jax, 'checkbox', scope);
        connectControl(jax, 'filterwidget', filter);

        input.click();
        input.click();
        input.click();

        expect(jax.requests.map((request) => request.data)).toEqual([
            { value: 1, scopeName: 'is_approved' },
            { value: 2, scopeName: 'is_approved' },
            { value: 0, scopeName: 'is_approved' },
        ]);
        expect(stateOf(input)).toEqual({ state: '0', indeterminate: false, checked: false });
        expect(scope.classList.contains('active')).toBe(false);
    });
});
