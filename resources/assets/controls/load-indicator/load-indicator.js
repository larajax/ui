/*
 * The loading indicator.
 *
 * The load indicator DIV is injected inside its container. The container should have
 * the relative position (use the loading-indicator-container class for it).
 *
 * JavaScript API:
 *
 * LoadIndicator.show(element, { text: 'Saving...', opaque: true }) - display the indicator in a solid (opaque) state
 * LoadIndicator.show(element, { centered: true }) - display the indicator aligned in the center horizontally
 * LoadIndicator.show(element, { size: 'small' }) - display the indicator in small size
 * LoadIndicator.show(element, { text: 'Saving...' }) - display the indicator in a transparent state
 * LoadIndicator.hide(element) - hide the indicator
 *
 * Data attributes, on an element that sends an AJAX request:
 * - data-load-indicator - shows the indicator, with this text, in the closest loading-indicator-container while the request runs
 * - data-load-indicator-opaque - shows it in the solid state
 * - data-load-indicator-centered - centers it horizontally
 * - data-load-indicator-size - its size, such as small
 */
'use strict';

// Load indicator instances keyed by container element
const instances = new WeakMap();

export class LoadIndicator
{
    static DEFAULTS = {
        text: ''
    };

    constructor(element, options) {
        this.el = element;
        this.options = options || {};
        this.tally = 0;
        this.show();
    }

    hide() {
        this.tally--;

        if (this.tally <= 0) {
            this.el.querySelectorAll('div.loading-indicator').forEach((indicator) => indicator.remove());
            this.el.classList.remove('in-progress');
        }
    }

    show(options) {
        if (options) {
            this.options = options;
        }

        this.hide();

        var indicator = document.createElement('div'),
            text = document.createElement('div');

        indicator.className = 'loading-indicator';
        text.textContent = this.options.text || '';
        indicator.append(text, document.createElement('span'));

        if (this.options.opaque !== undefined) {
            indicator.classList.add('is-opaque');
        }
        if (this.options.centered !== undefined) {
            indicator.classList.add('indicator-center');
        }
        if (this.options.size === 'small') {
            indicator.classList.add('size-small');
        }

        this.el.prepend(indicator);
        this.el.classList.add('in-progress');

        this.tally++;
    }

    dispose() {
        instances.delete(this.el);
        this.el = null;
    }

    static show(element, options) {
        var config = Object.assign({}, LoadIndicator.DEFAULTS, options),
            instance = instances.get(element);

        if (instance) {
            instance.show(config);
            return instance;
        }

        instance = new LoadIndicator(element, config);
        instances.set(element, instance);
        return instance;
    }

    static hide(element) {
        var instance = instances.get(element);
        if (instance) {
            instance.hide();
        }
    }

    static getInstance(element) {
        return instances.get(element) || null;
    }
}

/**
 * registerLoadIndicator shows the indicator for elements with data-load-indicator while their AJAX requests run.
 */
export function registerLoadIndicator() {
    document.addEventListener('ajax:promise', (ev) => {
        const element = indicatorElementFor(ev);
        const container = element && element.closest('.loading-indicator-container');
        if (!container) {
            return;
        }

        const options = {
            opaque: element.dataset.loadIndicatorOpaque,
            centered: element.dataset.loadIndicatorCentered,
            size: element.dataset.loadIndicatorSize
        };

        if (element.dataset.loadIndicator) {
            options.text = element.dataset.loadIndicator;
        }

        LoadIndicator.show(container, options);
    });

    const onRequestEnd = (ev) => {
        const element = indicatorElementFor(ev);
        const container = element && element.closest('.loading-indicator-container');

        if (container) {
            LoadIndicator.hide(container);
        }
    };

    document.addEventListener('ajax:done', onRequestEnd);
    document.addEventListener('ajax:fail', onRequestEnd);
}

// The element that sent the request, when it asks for a load indicator
function indicatorElementFor(ev) {
    return ev.target instanceof Element && ev.target.matches('[data-load-indicator]') ? ev.target : null;
}
