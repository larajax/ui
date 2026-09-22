/*
 * The trigger API
 *
 * Element events (dispatch on the trigger element):
 * - trigger:update - re-evaluate the trigger condition
 *
 * Events dispatched by the control:
 * - trigger:after-update, trigger:complete, trigger:hide, trigger:disable,
 *   trigger:fill, trigger:empty
 */
'use strict';

var windowResizeTimer;

const NON_VALUE_INPUTS = 'input[type=checkbox], input[type=radio], input[type=button], input[type=submit]';

jax.registerControl('input-trigger', class extends jax.ControlBase {
    init() {
        if (this.config.triggerCondition === false) {
            throw new Error('Trigger condition is not specified.');
        }

        if (this.config.trigger === false) {
            throw new Error('Trigger selector is not specified.');
        }

        if (this.config.triggerAction === false) {
            throw new Error('Trigger action is not specified.');
        }

        this.triggerSelector = this.config.trigger;
        this.triggerAction = this.config.triggerAction;
        this.triggerCondition = this.config.triggerCondition;

        if (this.config.triggerCondition.indexOf('value') == 0) {
            var match = this.config.triggerCondition.match(/\[([^\]]*)\]/g);
            this.triggerCondition = 'value';
            this.triggerConditionValue = match ? match.map(m => m.slice(1, -1)) : [""];
        }

        this.conditionValid = this.triggerCondition == 'checked' ||
            this.triggerCondition == 'unchecked' ||
            this.triggerCondition == 'value';
    }

    connect() {
        this.initTriggerParent();
        this.initState();

        this.listen('trigger:update', this.onUpdatedExternally);
        if (this.conditionValid) {
            jax.Events.on(document, 'change', this.proxy(this.onDocumentChange));
        }
    }

    disconnect() {
        if (this.conditionValid) {
            jax.Events.off(document, 'change', this.proxy(this.onDocumentChange));
        }

        this.triggerParent = null;

        if (this.changeDebounceTimeoutId !== null) {
            clearTimeout(this.changeDebounceTimeoutId);
        }
    }

    initState() {
        this.changeDebounceTimeoutId = null;

        if (jax.changeMonitor) {
            jax.changeMonitor.disable();
        }

        this.onConditionChanged();

        if (jax.changeMonitor) {
            jax.changeMonitor.enable();
        }
    }

    initTriggerParent() {
        this.triggerParent = undefined;
        if (this.config.triggerClosestParent !== undefined) {
            var closestParentElements = this.config.triggerClosestParent.split(',');
            for (var i = 0; i < closestParentElements.length; i++) {
                var triggerElement = this.element.closest(closestParentElements[i]);
                if (triggerElement) {
                    this.triggerParent = triggerElement;
                    break;
                }
            }
        }
    }

    // Finds the trigger source elements within the closest parent scope
    findTriggers(extraSelector) {
        var scope = this.triggerParent || document,
            selector = extraSelector ? this.triggerSelector + extraSelector : this.triggerSelector;

        try {
            return [...scope.querySelectorAll(selector)];
        }
        catch (e) {
            return [];
        }
    }

    onDocumentChange(ev) {
        if (ev.target.matches && ev.target.matches(this.triggerSelector)) {
            this.onConditionChangedDebounce();
        }
    }

    onUpdatedExternally(ev) {
        ev.stopPropagation();
        this.onConditionChanged();
    }

    onConditionChangedDebounce() {
        if (this.changeDebounceTimeoutId !== null) {
            clearTimeout(this.changeDebounceTimeoutId);
        }

        this.changeDebounceTimeoutId = setTimeout(() => this.onConditionChanged(), 30);
    }

    onConditionChanged() {
        if (this.triggerCondition == 'checked') {
            this.updateTarget(!!this.findTriggers(':checked').length);
        }
        else if (this.triggerCondition == 'unchecked') {
            this.updateTarget(!this.findTriggers(':checked').length);
        }
        else if (this.triggerCondition == 'value') {
            var triggered = false;

            var triggers = this.findTriggers().filter((el) => !el.matches(NON_VALUE_INPUTS));

            if (!triggers.length) {
                triggers = this.findTriggers().filter((el) => el.matches('input[type=checkbox]:checked, input[type=radio]:checked'));
            }

            var self = this;
            triggers.some(function(el) {
                var triggerValue = el.matches('select[multiple]')
                        ? [...el.selectedOptions].map((option) => option.value)
                        : el.value,
                    valueArray = Array.isArray(triggerValue) ? triggerValue : [triggerValue];

                if (valueArray.length === 0) {
                    valueArray = [''];
                }

                valueArray.some(function(val) {
                    triggered = self.matchWildcardConditions(val, self.triggerConditionValue);
                    return triggered;
                });

                return triggered;
            });

            this.updateTarget(triggered);
        }
    }

    // matchWildcardConditions handles multiple trigger condition values
    matchWildcardConditions(value, conditionArr) {
        var matchFound = false;
        conditionArr.forEach((condition) => {
            if (!matchFound && this.matchWildcardString(value, condition)) {
                matchFound = true;
            }
        });
        return matchFound;
    }

    // matchWildcardString matches a value (MyString) to a condition (My*)
    matchWildcardString(value, condition) {
        if(condition === "*") {
            return !!value;
        }
        var escapeRegex = (value) => value.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        return new RegExp("^" + condition.split("*").map(escapeRegex).join(".*") + "$").test(value);
    }

    updateTarget(status) {
        var actions = this.triggerAction.split('|');

        actions.forEach((action) => {
            this.updateTargetAction(action, status);
        });

        jax.Events.dispatch('trigger:after-update', { target: this.element, status: status });

        this.finishUpdate();
    }

    finishUpdate() {
        if (windowResizeTimer !== undefined) {
            window.clearTimeout(windowResizeTimer);
        }

        windowResizeTimer = setTimeout(function() {
            jax.Events.dispatch('trigger:complete');
            window.dispatchEvent(new Event('resize'));
        }, 1);
    }

    updateTargetAction(action, status) {
        var el = this.element;

        if (action == 'show') {
            el.classList.toggle('oc-hide', !status);
            jax.Events.dispatch('trigger:hide', { target: el, status: !status });
        }
        else if (action == 'hide') {
            el.classList.toggle('oc-hide', status);
            jax.Events.dispatch('trigger:hide', { target: el, detail: { status: status } });
        }
        else if (action == 'enable') {
            el.disabled = !status;
            el.classList.toggle('control-disabled', !status);
            jax.Events.dispatch('trigger:disable', { target: el, detail: { status: !status } });
        }
        else if (action == 'disable') {
            el.disabled = status;
            el.classList.toggle('control-disabled', status);
            jax.Events.dispatch('trigger:disable', { target: el, detail: { status: status } });
        }
        else if (action.indexOf('fill') == 0 && status) {
            var fillMatch = action.match(/[^[\]]+(?=])/g),
                fillValue = fillMatch ? fillMatch[0] : '1';

            if (!el.matches(NON_VALUE_INPUTS)) {
                el.value = fillValue;
            }

            if (el.matches('input[type=checkbox], input[type=radio]')) {
                el.checked = true;
            }

            jax.Events.dispatch('trigger:fill', { target: el, detail: { fillValue: fillValue } });
            jax.Events.dispatch('change', { target: el });
        }
        else if (action == 'empty' && status) {
            if (!el.matches(NON_VALUE_INPUTS)) {
                el.value = '';
            }

            if (el.matches('input[type=checkbox], input[type=radio]')) {
                el.checked = false;
            }

            jax.Events.dispatch('trigger:empty', { target: el });
            jax.Events.dispatch('change', { target: el });
        }

        if (action == 'show' || action == 'hide') {
            this.fixButtonClasses();
        }
    }

    fixButtonClasses() {
        var group = this.element.closest('.btn-group');

        if (group && this.element === group.lastElementChild) {
            var prev = this.element.previousElementSibling;
            if (prev) {
                prev.classList.toggle('last', this.element.classList.contains('oc-hide'));
            }
        }
    }
});

// CUSTOM RENDERER
// ============================

addEventListener('render', function() {
    document.querySelectorAll('[data-trigger]:not([data-control~="input-trigger"])').forEach(function(element) {
        element.dataset.control = ((element.dataset.control || '') + ' input-trigger').trim();
    });
});
