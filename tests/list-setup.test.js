import { afterEach, describe, expect, mock, test } from 'bun:test';
import { fakeSortableModule, sortables, resetFakeSortable } from './support/fake-sortable.js';

mock.module('../resources/assets/vendor/sortablejs/sortable.esm.js', () => fakeSortableModule);

const { registerListSetupColumns } = await import('../resources/assets/widgets/list/list.js');

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

// Builds the setup form's column list, each item with a drag handle and an ordered hidden input
function makeColumns(names) {
    const element = document.createElement('div');
    element.className = 'list-setup-columns';
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
    registerListSetupColumns(jax);

    const Control = jax.controls.get('list-setup-columns');
    const control = new Control(element);
    control.connect();
    return control;
}

describe('list setup columns', () => {
    afterEach(() => {
        resetFakeSortable();
        document.body.innerHTML = '';
    });

    test('the columns drag by their handle', async () => {
        const element = makeColumns(['title', 'status']);

        connectControl(element);
        await flush();

        expect(sortables.length).toBe(1);
        expect(sortables[0].element).toBe(element.querySelector('ul'));
        expect(sortables[0].options.handle).toBe('.drag-handle');
    });

    test('disconnecting destroys the sortable', async () => {
        const control = connectControl(makeColumns(['title']));
        await flush();
        control.disconnect();

        expect(sortables[0].destroyed).toBe(true);
    });

    test('a form closed before the library loads binds nothing', async () => {
        const control = connectControl(makeColumns(['title']));
        control.disconnect();
        await flush();

        expect(sortables.length).toBe(0);
    });
});
