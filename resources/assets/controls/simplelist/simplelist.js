/*
 * Simple list control
 *
 * Data attributes:
 * - data-control="simplelist" - enables the control on a .control-simplelist element
 *
 * A list with the is-sortable class reorders its items by dragging their .drag-handle,
 * so the inputs inside post in the new order, as the list setup form does with its
 * column order.
 *
 * Dependencies:
 * - SortableJS (vendor/sortablejs/sortable.esm.js)
 */
'use strict';

// SortableJS is shared by every simple list, loaded on first use
let sortablePromise = null;

export function registerSimpleList(jax) {
    jax.registerControl('simplelist', class extends jax.ControlBase {
        connect() {
            this.listElement = this.element.querySelector(':scope > ul');

            if (!this.listElement || !this.element.classList.contains('is-sortable')) {
                return;
            }

            loadSortable().then((Sortable) => {
                // The list may have left the page while SortableJS loaded
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

// loadSortable imports SortableJS once for every simple list on the page
function loadSortable() {
    if (!sortablePromise) {
        sortablePromise = import('../../vendor/sortablejs/sortable.esm.js')
            .then((sortable) => sortable.Sortable);
    }

    return sortablePromise;
}
