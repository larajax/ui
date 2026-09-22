/*
 * Search Input
 */
'use strict';

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

    clearInput() {
        this.$input.value = '';
        this.toggleClearButton();

        if (this.$input.dataset.request) {
            jax.request(this.$input);
        }
    }

    toggleClearButton() {
        if (this.$input.value) {
            this.$clearBtn.style.display = 'block';
        }
        else {
            this.$clearBtn.style.display = 'none';
        }
    }

    // @todo this should be moved to the list widget
    linkToListWidget(ev) {
        const linkage = this.element.closest('[data-list-linkage]');
        if (!linkage) {
            return;
        }

        const widget = document.querySelector('#' + linkage.dataset.listLinkage + ' > .control-list');
        const control = widget ? jax.fetchControl(widget, 'listwidget') : null;
        if (!control) {
            return;
        }

        ev.detail.context.options.data.allChecked = control.getAllChecked();
    }
});
