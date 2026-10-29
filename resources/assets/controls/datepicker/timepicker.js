/*
 * Time picker
 *
 * A floating panel for time-only fields holding the time controls of Vanilla Calendar Pro's time
 * extension on their own: hour and minute inputs, an AM/PM button in twelve hour mode, and a slider
 * for each. The panel carries the calendar container's data-vc attributes, so Bootstrap's
 * [data-vc="calendar"] styles and the time-control styles in datepicker.time.css apply unchanged.
 *
 * The input opens the panel on click or focus, and Tab or ArrowDown moves into it. Escape, a press
 * outside or focus moving away closes it. A typed hour or minute outside the limits puts the shown
 * value back; in twelve hour mode a typed hour up to 12 keeps the AM/PM half and a larger one is read
 * as a 24 hour value. The time is held in 24 hour form whatever the display.
 *
 *     const picker = new TimePicker(input, {
 *         twelveHour: false,
 *         hoursOnly: false,
 *         onShow: (picker) => picker.setTime('14:30:00'),
 *         onHide: (picker) => {},
 *         onChangeTime: (picker) => picker.getTime(),
 *         position: (picker) => {}
 *     });
 *
 *     picker.show();
 *     picker.hide();
 *     picker.destroy();
 */
'use strict';

// Labels of the panel and its controls, worded as the calendar's time controls are
const LABELS = {
    panel: 'Time',
    time: 'Selecting a time',
    hour: 'Hours',
    minute: 'Minutes',
    hourRange: 'Slider for selecting hours',
    minuteRange: 'Slider for selecting minutes',
    keeping: 'Switch AM/PM, current position:'
};

const pad = (n) => String(n).padStart(2, '0');

export class TimePicker {
    constructor(input, options) {
        this.input = input;
        this.options = Object.assign({
            twelveHour: false,
            hoursOnly: false,
            onShow: null,
            onHide: null,
            onChangeTime: null,
            position: null
        }, options);

        // The selected time in 24 hour form, and the values each part may take
        this.hours = 0;
        this.minutes = 0;
        this.limits = {
            hour: [0, 23],
            minute: this.options.hoursOnly ? [0, 0] : [0, 59]
        };

        this.element = null;
        this.isRefocusing = false;

        this.onInputClick = this.onInputClick.bind(this);
        this.onInputFocus = this.onInputFocus.bind(this);
        this.onInputKeydown = this.onInputKeydown.bind(this);
        this.onPanelChange = this.onPanelChange.bind(this);
        this.onPanelInput = this.onPanelInput.bind(this);
        this.onPanelClick = this.onPanelClick.bind(this);
        this.onPanelHover = this.onPanelHover.bind(this);
        this.onDocumentKeydown = this.onDocumentKeydown.bind(this);
        this.onDocumentInteract = this.onDocumentInteract.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);

        input.setAttribute('aria-haspopup', 'dialog');
        input.addEventListener('click', this.onInputClick);
        input.addEventListener('focus', this.onInputFocus);
        input.addEventListener('keydown', this.onInputKeydown);
    }

    get isShown() {
        return this.element !== null;
    }

    // Opens the panel on the body, where onShow can move it, then places it.
    show() {
        if (this.element) {
            return;
        }

        const element = document.createElement('div');
        element.dataset.vc = 'calendar';
        element.dataset.vcInput = '';
        element.setAttribute('role', 'dialog');
        element.setAttribute('aria-label', LABELS.panel);
        element.tabIndex = -1;

        element.addEventListener('change', this.onPanelChange);
        element.addEventListener('input', this.onPanelInput);
        element.addEventListener('click', this.onPanelClick);
        element.addEventListener('mouseover', this.onPanelHover);
        element.addEventListener('mouseout', this.onPanelHover);

        this.element = element;
        this.render();
        document.body.appendChild(element);

        this.raise('onShow');
        this.raise('position');

        document.addEventListener('keydown', this.onDocumentKeydown, true);
        document.addEventListener('pointerdown', this.onDocumentInteract, true);
        document.addEventListener('focusin', this.onDocumentInteract, true);
        window.addEventListener('resize', this.onWindowResize);
    }

    // Closes the panel, applying a value still being typed in it first.
    hide() {
        if (!this.element) {
            return;
        }

        const active = document.activeElement;
        if (active && active !== this.element && this.element.contains(active)) {
            active.blur();
        }

        this.removePanel();
        this.raise('onHide');
    }

    destroy() {
        this.removePanel();

        this.input.removeEventListener('click', this.onInputClick);
        this.input.removeEventListener('focus', this.onInputFocus);
        this.input.removeEventListener('keydown', this.onInputKeydown);
        this.input.removeAttribute('aria-haspopup');
    }

    removePanel() {
        if (!this.element) {
            return;
        }

        document.removeEventListener('keydown', this.onDocumentKeydown, true);
        document.removeEventListener('pointerdown', this.onDocumentInteract, true);
        document.removeEventListener('focusin', this.onDocumentInteract, true);
        window.removeEventListener('resize', this.onWindowResize);

        this.element.remove();
        this.element = null;
    }

    // Selects an HH:mm or HH:mm:ss time, held inside the limits, without announcing it.
    setTime(time) {
        const [hours, minutes] = String(time).split(':').map(Number);

        this.hours = this.clamp('hour', hours);
        this.minutes = this.clamp('minute', minutes);

        if (this.element) {
            this.update();
        }
    }

    // Returns the selected time as HH:mm:ss.
    getTime() {
        return pad(this.hours) + ':' + pad(this.minutes) + ':00';
    }

    //
    // Rendering
    //

    // Renders the time controls with the markup of Vanilla Calendar Pro's time extension.
    render() {
        const keeping = this.getKeeping();

        this.element.innerHTML = `
            <div data-vc="time" role="group" aria-label="${LABELS.time}">
                <div data-vc-time="content">
                    ${this.renderInput('hour', this.getDisplayHours())}
                    ${this.renderInput('minute', pad(this.minutes))}
                    ${this.options.twelveHour ? `<button type="button" aria-label="${LABELS.keeping} ${keeping}" data-vc-time="keeping">${keeping}</button>` : ''}
                </div>
                <div data-vc-time="ranges">
                    ${this.renderRange('hour', this.hours)}
                    ${this.renderRange('minute', this.minutes)}
                </div>
            </div>
        `.trim();
    }

    renderInput(unit, value) {
        return `<div data-vc-time-input="${unit}"><input type="text" name="${unit}" maxlength="2" aria-label="${LABELS[unit]}" value="${value}"></div>`;
    }

    renderRange(unit, value) {
        const [min, max] = this.limits[unit];

        return `<div data-vc-time-range="${unit}"><input type="range" min="${min}" max="${max}" step="1" aria-label="${LABELS[unit + 'Range']}" value="${value}"></div>`;
    }

    // Shows the selected time in the inputs, the sliders and the AM/PM button.
    update() {
        const keeping = this.getKeeping(),
            button = this.element.querySelector('[data-vc-time="keeping"]');

        this.getControl('input', 'hour').value = this.getDisplayHours();
        this.getControl('input', 'minute').value = pad(this.minutes);
        this.getControl('range', 'hour').value = String(this.hours);
        this.getControl('range', 'minute').value = String(this.minutes);

        if (button) {
            button.textContent = keeping;
            button.setAttribute('aria-label', LABELS.keeping + ' ' + keeping);
        }
    }

    // Returns the hour or minute text input (input) or slider (range).
    getControl(kind, unit) {
        return this.element.querySelector(`[data-vc-time-${kind}="${unit}"] input`);
    }

    getDisplayHours() {
        return pad(this.options.twelveHour ? (this.hours % 12) || 12 : this.hours);
    }

    getKeeping() {
        return this.hours >= 12 ? 'PM' : 'AM';
    }

    //
    // Selection
    //

    // Selects a time inside the limits and announces it, otherwise shows the selected time again.
    select(hours, minutes) {
        if (this.isAllowed('hour', hours) && this.isAllowed('minute', minutes)) {
            this.hours = hours;
            this.minutes = minutes;
            this.update();
            this.raise('onChangeTime');
        }
        else {
            this.update();
        }
    }

    isAllowed(unit, value) {
        const [min, max] = this.limits[unit];

        return Number.isInteger(value) && value >= min && value <= max;
    }

    clamp(unit, value) {
        const [min, max] = this.limits[unit];

        return Math.min(max, Math.max(min, Math.trunc(value) || 0));
    }

    // Applies a typed hour or minute when the input commits it.
    onPanelChange(ev) {
        const wrapper = ev.target.closest('[data-vc-time-input]');
        if (!wrapper) {
            return;
        }

        const value = /^\s*\d{1,2}\s*$/.test(ev.target.value) ? Number(ev.target.value) : NaN;

        if (wrapper.dataset.vcTimeInput === 'minute') {
            this.select(this.hours, value);
            return;
        }

        // A twelve hour value up to 12 keeps the AM/PM half shown on the button
        const hours = this.options.twelveHour && value <= 12
            ? (value % 12) + (this.hours >= 12 ? 12 : 0)
            : value;

        this.select(hours, this.minutes);
    }

    // Applies a slider value as it moves.
    onPanelInput(ev) {
        const wrapper = ev.target.closest('[data-vc-time-range]');
        if (!wrapper) {
            return;
        }

        const value = Number(ev.target.value);

        if (wrapper.dataset.vcTimeRange === 'hour') {
            this.select(value, this.minutes);
        }
        else {
            this.select(this.hours, value);
        }
    }

    // The AM/PM button moves the time into the other half of the day.
    onPanelClick(ev) {
        if (ev.target.closest('[data-vc-time="keeping"]')) {
            this.select((this.hours + 12) % 24, this.minutes);
        }
    }

    // Hovering a slider highlights the input it sets, as the calendar's time controls do.
    onPanelHover(ev) {
        const range = ev.target.matches('[data-vc-time-range] input') ? ev.target.parentNode : null;

        if (range) {
            this.getControl('input', range.dataset.vcTimeRange).toggleAttribute('data-vc-input-focus', ev.type === 'mouseover');
        }
    }

    //
    // Opening and closing
    //

    onInputClick() {
        this.show();
    }

    onInputFocus() {
        if (!this.isRefocusing) {
            this.show();
        }
    }

    // Tab moves from the input into the open panel, and ArrowDown also opens it first.
    onInputKeydown(ev) {
        if (ev.shiftKey || ev.altKey || ev.ctrlKey || ev.metaKey) {
            return;
        }

        if (ev.key === 'ArrowDown') {
            this.show();
        }
        else if (ev.key !== 'Tab' || !this.element) {
            return;
        }

        ev.preventDefault();
        this.getControl('input', 'hour').focus();
    }

    // Escape closes the panel, and cancelling the key keeps an enclosing dialog or popover open.
    onDocumentKeydown(ev) {
        if (ev.key !== 'Escape') {
            return;
        }

        const hadFocus = this.element.contains(document.activeElement);

        ev.preventDefault();
        ev.stopPropagation();
        this.hide();

        // Focus goes back to the input without opening the panel again
        if (hadFocus) {
            this.isRefocusing = true;

            try {
                this.input.focus();
            }
            finally {
                this.isRefocusing = false;
            }
        }
    }

    // A press or focus outside the panel and its input closes the panel.
    onDocumentInteract(ev) {
        if (ev.target !== this.input && !this.element.contains(ev.target)) {
            this.hide();
        }
    }

    onWindowResize() {
        this.raise('position');
    }

    raise(name) {
        if (typeof this.options[name] === 'function') {
            this.options[name](this);
        }
    }
}
