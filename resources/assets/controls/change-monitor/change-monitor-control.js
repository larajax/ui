/*
 * The form change monitor API.
 *
 * Element events (dispatch on the monitored element):
 * - change-monitor:unchange - reset the changed state
 * - change-monitor:pause / change-monitor:resume - suspend and resume monitoring
 * - change-monitor:pause-unload / change-monitor:resume-unload - suspend and resume the unload warning
 *
 * Events dispatched by the control:
 * - change-monitor:ready, change-monitor:changed, change-monitor:unchanged
 */
'use strict';

const INPUT_SELECTOR = 'input:not(.ace_search_field):not([data-search-input]), textarea:not(.ace_text-input)';

class ChangeMonitorControl extends jax.ControlBase {
    // Static property for global disable state
    static globallyDisabled = false;

    static disable() {
        ChangeMonitorControl.globallyDisabled = true;
    }

    static enable() {
        ChangeMonitorControl.globallyDisabled = false;
    }

    init() {
        this.paused = false;
        this.oldValues = new WeakMap();
    }

    connect() {
        this.listen('change', this.onChange);
        this.listen('change-monitor:unchange', this.unchange);
        this.listen('click', '[data-change-monitor-commit]', this.unchange);
        this.listen('ajax:done', this.onAjaxDone);
        this.listen('change-monitor:pause', this.pause);
        this.listen('change-monitor:resume', this.resume);
        this.listen('change-monitor:pause-unload', this.pauseUnloadListener);
        this.listen('change-monitor:resume-unload', this.resumeUnloadListener);
        this.listen('keyup', this.onInputEvent);
        this.listen('input', this.onInputEvent);
        this.listen('paste', this.onInputEvent);

        this.element.querySelectorAll('input:not([type=hidden]):not(.ace_search_field):not([data-search-input]), textarea:not(.ace_text-input)').forEach((el) => {
            this.oldValues.set(el, el.value);
        });

        jax.Events.on(window, 'beforeunload', this.proxy(this.onBeforeUnload));
        addEventListener('page:before-visit', this.proxy(this.onBeforeUnloadTurbo));

        jax.Events.dispatch('change-monitor:ready', { target: this.element });
    }

    disconnect() {
        jax.Events.off(window, 'beforeunload', this.proxy(this.onBeforeUnload));
        removeEventListener('page:before-visit', this.proxy(this.onBeforeUnloadTurbo));

        this.oldValues = null;
    }

    onAjaxDone(ev) {
        if (ev.target.closest('[data-change-monitor-commit]')) {
            this.unchange();
        }
    }

    onChange(ev, inputChange) {
        if (this.paused || ChangeMonitorControl.globallyDisabled) {
            return;
        }

        if (ev && ev.target.className === 'ace_search_field') {
            return;
        }

        if (!inputChange) {
            const type = ev && ev.target.getAttribute && ev.target.getAttribute('type');
            if (type === 'text' || type === 'password') {
                return;
            }
        }

        if (!this.element.classList.contains('oc-data-changed')) {
            jax.Events.dispatch('change-monitor:changed', { target: this.element });
            this.element.classList.add('oc-data-changed');
        }
    }

    unchange() {
        if (this.paused || ChangeMonitorControl.globallyDisabled) {
            return;
        }

        if (this.element.classList.contains('oc-data-changed')) {
            jax.Events.dispatch('change-monitor:unchanged', { target: this.element });
            this.element.classList.remove('oc-data-changed');
        }
    }

    onInputEvent(ev) {
        if (this.paused || ChangeMonitorControl.globallyDisabled) {
            return;
        }

        const el = ev.target;
        if (!el.matches(INPUT_SELECTOR)) {
            return;
        }

        if (this.oldValues.get(el) !== el.value) {
            this.oldValues.set(el, el.value);
            this.onChange(ev, true);
        }
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    pauseUnloadListener() {
        this.unloadListenerPaused = true;
    }

    resumeUnloadListener() {
        this.unloadListenerPaused = false;
    }

    shouldWarn() {
        return document.documentElement.contains(this.element) &&
            this.element.classList.contains('oc-data-changed') &&
            !this.unloadListenerPaused;
    }

    onBeforeUnload(event) {
        if (this.shouldWarn()) {
            event.preventDefault();
            return event.returnValue = '';
        }
    }

    // Disable PJAX to fallback to the browser unload event
    onBeforeUnloadTurbo(event) {
        const { url, action } = event.detail;
        if (this.shouldWarn() && action === 'advance') {
            event.preventDefault();
            location.assign(url);
        }
    }
}

jax.registerControl('change-monitor', ChangeMonitorControl);

// Instances
jax.changeMonitor = ChangeMonitorControl;

// CUSTOM RENDERER
// ============================

addEventListener('render', function() {
    document.querySelectorAll('[data-change-monitor]:not([data-control~="change-monitor"])').forEach(function(element) {
        element.dataset.control = ((element.dataset.control || '') + ' change-monitor').trim();
    });
});
