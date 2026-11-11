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
            this.listen('keydown', this.$input, this.onInputKeydown);
            this.listen('click', this.$clearBtn, this.clearInput);
            this.toggleClearButton();
        }

        disconnect() {
            this.element.classList.remove('control-search');
            this.element.classList.remove('size-input-text');
            this.element.classList.remove('loading-indicator-container');
        }

        // Empties the input and keeps focus.
        clearInput() {
            this.$input.value = '';
            this.toggleClearButton();
            this.$input.focus();

            if (this.$input.dataset.request) {
                jax.request(this.$input);
            }
            else {
                this.$input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        // Escape blurs a growable box to close it.
        onInputKeydown(ev) {
            if (ev.key === 'Escape' && this.$input.closest('.is-growable')) {
                this.$input.blur();
            }
        }

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

        // Marks the linked list updating while searching.
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

        // Finds the linked list each time, a search replaces it.
        linkedList() {
            const linkage = this.element.closest('[data-list-linkage]');
            const widget = linkage ? document.querySelector('#' + linkage.dataset.listLinkage + ' > .control-list') : null;

            return widget ? jax.fetchControl(widget, 'listwidget') : null;
        }
    });
}
