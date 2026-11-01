/*
 * Search Input
 */
'use strict';

export function registerSearchInput(jax) {
    jax.registerControl('search-input', class extends jax.ControlBase {
        init() {
            this.$form = this.element.closest('form');
            this.$triggerEl = this.$form ? this.$form : this.element;
            this.$input = this.element.querySelector('[data-search-input]');
            this.$clearBtn = this.element.querySelector('[data-search-clear]');
            this.extraData = null;
        }

        connect() {
            this.element.classList.add('control-search');
            this.element.classList.add('size-input-text');
            this.element.classList.add('loading-indicator-container');
            this.listen('ajax:setup', this.linkToListWidget);
            this.listen('ajax:promise', this.onSearchRequest);
            this.listen('ajax:always', this.onSearchRequestEnd);
            this.listen('ajax:request-complete', this.$triggerEl, this.toggleClearButton);
            this.listen('input', this.$input, this.toggleClearButton);
            this.listen('click', this.$clearBtn, this.clearInput);
            this.toggleClearButton();
        }

        disconnect() {
            this.element.classList.remove('control-search');
            this.element.classList.remove('size-input-text');
            this.element.classList.remove('loading-indicator-container');
        }

        // Empties the input and gives it focus, which would otherwise be lost with the hidden button.
        clearInput() {
            this.$input.value = '';
            this.toggleClearButton();
            this.$input.focus();

            if (this.$input.dataset.request) {
                jax.request(this.$input);
            }
        }

        // Shows the clear button while the input holds text, leaving its display to the stylesheet.
        toggleClearButton() {
            if (this.$input.value) {
                this.$clearBtn.style.display = '';
            }
            else {
                this.$clearBtn.style.display = 'none';
            }
        }

        // @todo this should be moved to the list widget
        linkToListWidget(ev) {
            const control = this.linkedList();
            if (!control) {
                return;
            }

            ev.detail.context.options.data.allChecked = control.getAllChecked();
        }

        // Marks the linked list as updating while a search redraws it, where a newer search aborts the last one without it ending.
        onSearchRequest() {
            this.setListUpdating(true);
        }

        onSearchRequestEnd() {
            this.setListUpdating(false);
        }

        setListUpdating(isUpdating) {
            const control = this.linkedList();

            if (control && control.setUpdating) {
                control.setUpdating(isUpdating);
            }
        }

        // Finds the list control named by the enclosing [data-list-linkage], each time since a search replaces it.
        linkedList() {
            const linkage = this.element.closest('[data-list-linkage]');
            const widget = linkage ? document.querySelector('#' + linkage.dataset.listLinkage + ' > .control-list') : null;

            return widget ? jax.fetchControl(widget, 'listwidget') : null;
        }
    });
}
