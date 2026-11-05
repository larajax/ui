/*
 * A stand-in for the bundled SortableJS module. Test files share this one because Bun keeps the
 * first mocked shape of a module for the whole run, and each control keeps the first Sortable it loads.
 */

export const sortables = [];
export const selected = [];

export function resetFakeSortable() {
    sortables.length = 0;
    selected.length = 0;
}

// Records each instance so tests can play its callbacks the way a native drag fires them. The bundle
// comes with MultiDrag mounted, so its selection utils exist from the start and there is no mount():
// a control that mounted the plugin again would throw here, as it would on the real module
export const FakeSortable = {
    utils: {
        select(el) {
            if (!selected.includes(el)) {
                el.classList.add('sortable-selected');
                selected.push(el);
            }
        },
        deselect(el) {
            if (selected.includes(el)) {
                el.classList.remove('sortable-selected');
                selected.splice(selected.indexOf(el), 1);
            }
        }
    },
    create(element, options) {
        const sortable = {
            element,
            options,
            destroyed: false,
            option(name, value) {
                this.options[name] = value;
            },
            destroy() {
                this.destroyed = true;
            }
        };
        sortables.push(sortable);
        return sortable;
    }
};

export function FakeMultiDrag() {
    this.pluginName = 'multiDrag';
}

export const fakeSortableModule = {
    Sortable: FakeSortable,
    MultiDrag: FakeMultiDrag,
    default: FakeSortable
};
