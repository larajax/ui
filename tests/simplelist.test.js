import { afterEach, describe, expect, mock, test } from 'bun:test';
import { fakeSortableModule, sortables, resetFakeSortable } from './support/fake-sortable.js';

mock.module('../resources/assets/vendor/sortablejs/sortable.esm.js', () => fakeSortableModule);

const { registerSimpleList } = await import('../resources/assets/controls/simplelist/simplelist.js');

function makeFakeJax() {
    const controls = new Map();

    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = {};
        }
    }

    return {
        controls,
        ControlBase,
        registerControl(id, control) {
            controls.set(id, control);
        }
    };
}

// Builds a setup style list whose items each hold a drag handle and an ordered hidden input
function makeList(className, names) {
    const element = document.createElement('div');
    element.className = className;
    element.innerHTML = '<ul>' + names.map((name) => (
        '<li><span class="drag-handle"></span><input type="hidden" name="column_order[]" value="' + name + '"></li>'
    )).join('') + '</ul>';
    document.body.appendChild(element);
    return element;
}

// Waits for the lazily loaded SortableJS promise to settle
async function flush() {
    await new Promise((resolve) => setTimeout(resolve, 0));
}

function connectControl(element) {
    const jax = makeFakeJax();
    registerSimpleList(jax);

    const Control = jax.controls.get('simplelist');
    const control = new Control(element);
    control.connect();
    return control;
}

describe('simplelist control', () => {
    afterEach(() => {
        resetFakeSortable();
        document.body.innerHTML = '';
    });

    test('a sortable list drags its items by the handle', async () => {
        const element = makeList('control-simplelist is-sortable', ['title', 'status']);

        connectControl(element);
        await flush();

        expect(sortables.length).toBe(1);
        expect(sortables[0].element).toBe(element.querySelector('ul'));
        expect(sortables[0].options.handle).toBe('.drag-handle');
    });

    test('a list without the sortable class stays static', async () => {
        const element = makeList('control-simplelist', ['title']);

        connectControl(element);
        await flush();

        expect(sortables.length).toBe(0);
    });

    test('disconnecting destroys the sortable', async () => {
        const element = makeList('control-simplelist is-sortable', ['title']);

        const control = connectControl(element);
        await flush();
        control.disconnect();

        expect(sortables[0].destroyed).toBe(true);
    });

    test('a list removed before the library loads binds nothing', async () => {
        const element = makeList('control-simplelist is-sortable', ['title']);

        const control = connectControl(element);
        control.disconnect();
        await flush();

        expect(sortables.length).toBe(0);
    });
});
