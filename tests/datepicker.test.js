import { afterEach, beforeAll, describe, expect, setSystemTime, test } from 'bun:test';
import { loadCalendar, registerDatepicker } from '../resources/assets/controls/datepicker/datepicker.js';

function parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value !== '' && !isNaN(Number(value))) return Number(value);
    if (value.charAt(0) === '[') return JSON.parse(value);
    return value;
}

function makeFakeJax() {
    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = {};

            for (const attr of element.attributes) {
                if (attr.name.startsWith('data-')) {
                    const key = attr.name.slice(5).replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
                    this.config[key] = parseValue(attr.value);
                }
            }
        }

        // Supports listen(event, handler) and the delegated listen(event, selector, handler)
        listen(eventName, selectorOrHandler, handler) {
            if (typeof selectorOrHandler === 'string') {
                this.element.addEventListener(eventName, (ev) => {
                    if (ev.target.closest(selectorOrHandler)) {
                        handler.call(this, ev);
                    }
                });
            }
            else {
                this.element.addEventListener(eventName, selectorOrHandler.bind(this));
            }
        }
    }

    return {
        controls: new Map(),
        ControlBase,
        registerControl(id, control) {
            this.controls.set(id, control);
        }
    };
}

const sleep = (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));

let jax;
let connected = [];

beforeAll(async () => {
    jax = makeFakeJax();
    registerDatepicker(jax);

    // Loaded up front, so pickers bind their calendar as they connect
    await loadCalendar();
});

afterEach(() => {
    connected.forEach((control) => control.disconnect());
    connected = [];
    document.body.innerHTML = '';
    document.documentElement.removeAttribute('data-bs-theme');
});

// Renders a picker: a date facade, a time facade, or one facade for both in datetime mode
function connectPicker({ mode = 'datetime', attributes = '', value = '', dateAttributes = '' } = {}) {
    const date = mode !== 'time', time = mode === 'time';

    document.body.innerHTML = `<div data-control="datepicker" data-mode="${mode}" ${attributes}>${date ? `<input type="text" data-datepicker ${dateAttributes} />` : ''}${time ? '<input type="text" data-timepicker />' : ''}<input type="hidden" name="when" value="${value}" data-datetime-value /></div>`;

    const element = document.querySelector('[data-control="datepicker"]');
    const control = new (jax.controls.get('datepicker'))(element);
    control.init();
    control.connect();
    connected.push(control);

    return {
        control,
        element,
        dateFacade: element.querySelector('[data-datepicker]'),
        timeFacade: element.querySelector('[data-timepicker]'),
        locker: element.querySelector('[data-datetime-value]')
    };
}

function change(input, value) {
    input.value = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

// Opens the calendar, which shows on the next tick, and returns its element
async function openCalendar(control) {
    control.picker.show();
    await sleep();
    return control.picker.context.mainElement;
}

function clickDate(calendar, date) {
    calendar.querySelector(`[data-vc-date="${date}"] [data-vc-date-btn]`).click();
}

function slideTime(calendar, unit, value) {
    const range = calendar.querySelector(`[data-vc-time-range="${unit}"] input`);
    range.value = String(value);
    range.dispatchEvent(new Event('input', { bubbles: true }));
}

function isDateDisabled(calendar, date) {
    return calendar.querySelector(`[data-vc-date="${date}"]`).hasAttribute('data-vc-date-disabled');
}

function pressEscape(target) {
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
}

function pressKey(target, key, options = {}) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
    target.dispatchEvent(event);
    return event;
}

function pressPointer(target) {
    target.dispatchEvent(new Event('pointerdown', { bubbles: true }));
}

// Opens the time panel from its facade and returns the panel
function openTimePanel(control) {
    control.timeFacade.click();
    return control.timePicker.element;
}

function timeInput(root, unit) {
    return root.querySelector(`[data-vc-time-input="${unit}"] input`);
}

function timeRange(root, unit) {
    return root.querySelector(`[data-vc-time-range="${unit}"] input`);
}

// Lists the time controls' elements with the attributes that shape them, leaving out classes and values
function describeTimeControls(root) {
    const skipped = ['class', 'value', 'aria-label', 'data-vc-input-focus'];

    return Array.from(root.querySelector('[data-vc="time"]').querySelectorAll('*'), (element) => {
        const attributes = Array.from(element.attributes)
            .filter((attr) => !skipped.includes(attr.name))
            .map((attr) => attr.name + '=' + attr.value)
            .sort();

        return element.tagName.toLowerCase() + ' ' + attributes.join(' ');
    });
}

describe('datepicker formatting', () => {
    test('formats and parses the supported date tokens', () => {
        const { control } = connectPicker();
        const date = new Date(2026, 9, 1);

        expect(control.formatDate(date, 'DD/MM/YYYY')).toBe('01/10/2026');
        expect(control.formatDate(date, 'dddd, Do MMMM YY')).toBe('Thursday, 1st October 26');
        expect(control.formatDate(date, '[Day] D [of] MMM')).toBe('Day 1 of Oct');

        expect(control.parseFormattedDate('01/10/2026', 'DD/MM/YYYY')).toEqual(date);
        expect(control.parseFormattedDate('Thursday, 1st October 26', 'dddd, Do MMMM YY')).toEqual(date);
        expect(control.parseFormattedDate('31/02/2026', 'DD/MM/YYYY')).toBeNull();
        expect(control.parseFormattedDate('2026-10-01', 'DD/MM/YYYY')).toBeNull();
    });

    test('a datetime facade shows the stored date in the display format followed by the time', () => {
        const { dateFacade, timeFacade } = connectPicker({
            attributes: 'data-format="DD MMM YYYY"',
            value: '2026-10-20 14:30:00'
        });

        expect(dateFacade.value).toBe('20 Oct 2026 14:30');
        expect(timeFacade).toBeNull();
    });

    test('a datetime facade shows twelve hour and hours only times', () => {
        expect(connectPicker({ attributes: 'data-twelve-hour="1"', value: '2026-10-20 14:30:00' }).dateFacade.value)
            .toBe('2026-10-20 02:30 PM');

        expect(connectPicker({ attributes: 'data-hours-only="1"', value: '2026-10-20 14:30:00' }).dateFacade.value)
            .toBe('2026-10-20 14:00');
    });

    test('a time-only picker reads the time from a full stored date and time', () => {
        const { timeFacade } = connectPicker({ mode: 'time', value: '2026-10-20 14:30:00' });

        expect(timeFacade.value).toBe('14:30');
    });

    test('hours only in twelve hour mode shows and stores the hour', () => {
        const { timeFacade, locker } = connectPicker({
            mode: 'time',
            attributes: 'data-hours-only="1" data-twelve-hour="1"',
            value: '14:00:00'
        });

        expect(timeFacade.value).toBe('02 PM');

        change(timeFacade, '09 AM');
        expect(locker.value).toBe('09:00:00');
    });
});

describe('datepicker locker', () => {
    test('typing a date and time into a datetime facade stores both and tidies the facade', () => {
        const { dateFacade, locker } = connectPicker();

        change(dateFacade, '2026-10-21 9:05 pm');

        expect(locker.value).toBe('2026-10-21 21:05:00');
        expect(dateFacade.value).toBe('2026-10-21 21:05');
    });

    test('typing only a date fills midnight when configured', () => {
        const { dateFacade, locker } = connectPicker({ attributes: 'data-default-time-midnight="1"' });

        change(dateFacade, '2026-10-21');

        expect(locker.value).toBe('2026-10-21 00:00:00');
        expect(dateFacade.value).toBe('2026-10-21 00:00');
    });

    test('typing only a date keeps the stored time', () => {
        const { dateFacade, locker } = connectPicker({ value: '2026-10-20 14:30:00' });

        change(dateFacade, '2026-10-22');

        expect(locker.value).toBe('2026-10-22 14:30:00');
    });

    test('typing only a time fills today as the date', () => {
        const { control, dateFacade, locker } = connectPicker();

        change(dateFacade, '09:15');

        expect(locker.value).toBe(control.formatDate(new Date(), 'YYYY-MM-DD') + ' 09:15:00');
    });

    test('clearing the facade empties the value and the calendar selection', async () => {
        const { control, dateFacade, locker } = connectPicker({ value: '2026-10-20 14:30:00' });

        change(dateFacade, '');

        expect(locker.value).toBe('');
        expect(dateFacade.value).toBe('');

        await openCalendar(control);
        expect(control.picker.context.selectedDates).toEqual([]);
    });

    test('a date-only picker stores just the date', () => {
        const { dateFacade, locker } = connectPicker({ mode: 'date', attributes: 'data-format="DD/MM/YYYY"' });

        change(dateFacade, '05/11/2026');

        expect(locker.value).toBe('2026-11-05');
    });
});

describe('datepicker calendar', () => {
    test('picking a date in a date-only calendar stores it, closes the calendar and announces the change', async () => {
        const { control, dateFacade, locker } = connectPicker({ mode: 'date', value: '2026-10-20' });
        let changes = 0;
        dateFacade.addEventListener('change', () => changes++);

        const calendar = await openCalendar(control);
        expect(calendar.querySelector('[data-vc="time"]')).toBeNull();

        clickDate(calendar, '2026-10-22');
        expect(locker.value).toBe('2026-10-22');
        expect(dateFacade.value).toBe('2026-10-22');

        await sleep(150);
        expect(control.picker.context.isShowInInputMode).toBe(false);
        expect(changes).toBe(1);
        expect(locker.value).toBe('2026-10-22');
    });

    test('picking a date in a datetime calendar keeps the stored time and leaves it open for the time', async () => {
        const { control, dateFacade, locker } = connectPicker({ value: '2026-10-20 14:30:00' });

        const calendar = await openCalendar(control);
        expect(calendar.querySelector('[data-vc-time-input="hour"] input').value).toBe('14');
        expect(calendar.querySelector('[data-vc-time-input="minute"] input').value).toBe('30');

        clickDate(calendar, '2026-10-22');
        await sleep(150);

        expect(locker.value).toBe('2026-10-22 14:30:00');
        expect(dateFacade.value).toBe('2026-10-22 14:30');
        expect(control.picker.context.isShowInInputMode).toBe(true);
    });

    test('the time controls change the stored time', async () => {
        const { control, dateFacade, locker } = connectPicker({ value: '2026-10-20 14:30:00' });

        const calendar = await openCalendar(control);
        slideTime(calendar, 'hour', 9);
        slideTime(calendar, 'minute', 5);

        expect(locker.value).toBe('2026-10-20 09:05:00');
        expect(dateFacade.value).toBe('2026-10-20 09:05');
    });

    test('twelve hour time controls store a 24 hour time', async () => {
        const { control, locker } = connectPicker({ attributes: 'data-twelve-hour="1"', value: '2026-10-20 14:30:00' });

        const calendar = await openCalendar(control);
        expect(calendar.querySelector('[data-vc-time="keeping"]').textContent).toBe('PM');

        calendar.querySelector('[data-vc-time="keeping"]').click();
        expect(locker.value).toBe('2026-10-20 02:30:00');
    });

    test('hours only fixes the minutes at 00', async () => {
        const { control, locker } = connectPicker({ attributes: 'data-hours-only="1"', value: '2026-10-20 14:30:00' });

        const calendar = await openCalendar(control);
        const minutes = calendar.querySelector('[data-vc-time-range="minute"] input');
        expect(minutes.min).toBe('0');
        expect(minutes.max).toBe('0');

        slideTime(calendar, 'hour', 9);
        expect(locker.value).toBe('2026-10-20 09:00:00');
    });

    test('a value typed while the calendar is closed shows when it opens', async () => {
        const { control, dateFacade } = connectPicker({ value: '2026-10-20 14:30:00' });

        change(dateFacade, '2027-03-04 08:15');
        const calendar = await openCalendar(control);

        expect(control.picker.context.selectedDates).toEqual(['2027-03-04']);
        expect(control.picker.context.selectedMonth).toBe(2);
        expect(control.picker.context.selectedYear).toBe(2027);
        expect(calendar.querySelector('[data-vc-time-input="hour"] input').value).toBe('08');
    });

    test('the calendar copies the page theme, as Bootstrap does', async () => {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        const { control } = connectPicker({ mode: 'date' });

        const calendar = await openCalendar(control);

        expect(calendar.getAttribute('data-vc')).toBe('calendar');
        expect(calendar.hasAttribute('data-vc-input')).toBe(true);
        expect(calendar.getAttribute('data-bs-theme')).toBe('dark');
    });
});

describe('datepicker options', () => {
    test('minDate and maxDate disable the days outside them', async () => {
        const { control } = connectPicker({
            mode: 'date',
            attributes: 'data-min-date="2026-10-05 00:00:00" data-max-date="2026-10-25"',
            value: '2026-10-20'
        });

        const calendar = await openCalendar(control);

        expect(isDateDisabled(calendar, '2026-10-04')).toBe(true);
        expect(isDateDisabled(calendar, '2026-10-05')).toBe(false);
        expect(isDateDisabled(calendar, '2026-10-25')).toBe(false);
        expect(isDateDisabled(calendar, '2026-10-26')).toBe(true);
    });

    test('disableDays blocks weekdays and explicit dates', async () => {
        const { control } = connectPicker({ mode: 'date', attributes: `data-disable-days='[0,"2026-10-21"]'`, value: '2026-10-20' });

        const calendar = await openCalendar(control);

        expect(isDateDisabled(calendar, '2026-10-18')).toBe(true);
        expect(isDateDisabled(calendar, '2026-10-21')).toBe(true);
        expect(isDateDisabled(calendar, '2026-10-22')).toBe(false);
    });

    test('an array yearRange limits the years in the year view', async () => {
        const { control } = connectPicker({ mode: 'date', attributes: 'data-year-range="[2020,2030]"', value: '2026-10-20' });

        const calendar = await openCalendar(control);
        calendar.querySelector('[data-vc="year"]').click();

        expect(calendar.querySelector('[data-vc-years-year="2019"]').disabled).toBe(true);
        expect(calendar.querySelector('[data-vc-years-year="2020"]').disabled).toBe(false);
        expect(calendar.querySelector('[data-vc-years-year="2030"]').disabled).toBe(false);
        expect(calendar.querySelector('[data-vc-years-year="2031"]').disabled).toBe(true);
    });

    test('showWeekNumber adds the week number column', async () => {
        const { control } = connectPicker({ mode: 'date', attributes: 'data-show-week-number="true"', value: '2026-10-20' });

        const calendar = await openCalendar(control);

        expect(calendar.querySelector('[data-vc-week="numbers"]')).not.toBeNull();
        expect(calendar.querySelectorAll('[data-vc-week-number]').length).toBeGreaterThan(3);
    });

    test('a readonly facade is not bound until a trigger enables it, and unbinding keeps the facade', () => {
        const { control, dateFacade, element } = connectPicker({ mode: 'date', dateAttributes: 'readonly' });

        expect(control.picker).toBeNull();

        dateFacade.removeAttribute('readonly');
        element.dispatchEvent(new CustomEvent('trigger:disable', { bubbles: true }));
        expect(control.picker).not.toBeNull();
        expect(dateFacade.getAttribute('aria-haspopup')).toBe('dialog');

        dateFacade.disabled = true;
        element.dispatchEvent(new CustomEvent('trigger:disable', { bubbles: true }));
        expect(control.picker).toBeNull();
        expect(element.querySelector('[data-datepicker]')).toBe(dateFacade);
        expect(dateFacade.disabled).toBe(true);
        expect(dateFacade.hasAttribute('aria-haspopup')).toBe(false);
    });
});

describe('datepicker time panel', () => {
    test('the time panel holds the calendar time controls on their own, in a calendar container', async () => {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        const { control, timeFacade } = connectPicker({ mode: 'time', value: '14:30:00' });

        expect(timeFacade.getAttribute('aria-haspopup')).toBe('dialog');

        const panel = openTimePanel(control);
        expect(panel.parentElement).toBe(document.body);
        expect(panel.getAttribute('data-vc')).toBe('calendar');
        expect(panel.hasAttribute('data-vc-input')).toBe(true);
        expect(panel.getAttribute('role')).toBe('dialog');
        expect(panel.getAttribute('data-bs-theme')).toBe('dark');
        expect(panel.dataset.vcPosition).toBe('bottom');
        expect(panel.children.length).toBe(1);
        expect(panel.firstElementChild.getAttribute('data-vc')).toBe('time');
        expect(panel.querySelector('[data-vc="header"], [data-vc="dates"]')).toBeNull();

        expect(timeInput(panel, 'hour').value).toBe('14');
        expect(timeInput(panel, 'minute').value).toBe('30');
        expect(timeRange(panel, 'hour').value).toBe('14');
        expect(timeRange(panel, 'minute').value).toBe('30');
        expect(panel.querySelector('[data-vc-time="keeping"]')).toBeNull();

        // The datetime calendar renders the same controls
        const datetime = connectPicker({ value: '2026-10-20 14:30:00' });
        const calendar = await openCalendar(datetime.control);
        expect(describeTimeControls(panel)).toHaveLength(10);
        expect(describeTimeControls(panel)).toEqual(describeTimeControls(calendar));
    });

    test('twelve hour and hours only panels match the calendar time controls', async () => {
        for (const attributes of ['data-twelve-hour="1"', 'data-hours-only="1"', 'data-twelve-hour="1" data-hours-only="1"']) {
            const time = connectPicker({ mode: 'time', attributes, value: '14:30:00' });
            const datetime = connectPicker({ attributes, value: '2026-10-20 14:30:00' });

            const panel = openTimePanel(time.control);
            const calendar = await openCalendar(datetime.control);

            expect(describeTimeControls(panel)).toEqual(describeTimeControls(calendar));
            expect(timeInput(panel, 'hour').value).toBe(timeInput(calendar, 'hour').value);
            expect(timeInput(panel, 'minute').value).toBe(timeInput(calendar, 'minute').value);
            time.control.timePicker.hide();
        }
    });

    test('a typed hour or minute stores the time, and one out of range puts the shown value back', () => {
        const { control, timeFacade, locker } = connectPicker({ mode: 'time', value: '14:30:00' });
        const panel = openTimePanel(control);

        change(timeInput(panel, 'hour'), '9');
        expect(locker.value).toBe('09:30:00');
        expect(timeFacade.value).toBe('09:30');
        expect(timeInput(panel, 'hour').value).toBe('09');
        expect(timeRange(panel, 'hour').value).toBe('9');

        change(timeInput(panel, 'minute'), '75');
        expect(timeInput(panel, 'minute').value).toBe('30');

        change(timeInput(panel, 'hour'), '24');
        expect(timeInput(panel, 'hour').value).toBe('09');

        change(timeInput(panel, 'hour'), 'ab');
        expect(timeInput(panel, 'hour').value).toBe('09');
        expect(locker.value).toBe('09:30:00');
    });

    test('the sliders store the time', () => {
        const { control, timeFacade, locker } = connectPicker({ mode: 'time', value: '14:30:00' });
        const panel = openTimePanel(control);

        slideTime(panel, 'hour', 7);
        slideTime(panel, 'minute', 5);

        expect(locker.value).toBe('07:05:00');
        expect(timeFacade.value).toBe('07:05');
        expect(timeInput(panel, 'hour').value).toBe('07');
        expect(timeInput(panel, 'minute').value).toBe('05');
    });

    test('twelve hour mode shows the twelve hour time, and AM/PM moves it into the other half of the day', () => {
        const { control, timeFacade, locker } = connectPicker({ mode: 'time', attributes: 'data-twelve-hour="1"', value: '14:30:00' });
        const panel = openTimePanel(control);
        const keeping = panel.querySelector('[data-vc-time="keeping"]');

        expect(timeFacade.value).toBe('02:30 PM');
        expect(timeInput(panel, 'hour').value).toBe('02');
        expect(timeRange(panel, 'hour').value).toBe('14');
        expect(keeping.textContent).toBe('PM');

        keeping.click();
        expect(locker.value).toBe('02:30:00');
        expect(timeFacade.value).toBe('02:30 AM');
        expect(keeping.textContent).toBe('AM');
        expect(keeping.getAttribute('aria-label')).toBe('Switch AM/PM, current position: AM');

        // A typed hour up to 12 keeps the half, a larger one is a 24 hour value
        change(timeInput(panel, 'hour'), '12');
        expect(locker.value).toBe('00:30:00');
        expect(timeInput(panel, 'hour').value).toBe('12');

        change(timeInput(panel, 'hour'), '13');
        expect(locker.value).toBe('13:30:00');
        expect(timeInput(panel, 'hour').value).toBe('01');
        expect(keeping.textContent).toBe('PM');

        slideTime(panel, 'hour', 0);
        expect(locker.value).toBe('00:30:00');
        expect(timeInput(panel, 'hour').value).toBe('12');
        expect(keeping.textContent).toBe('AM');
    });

    test('hours only fixes the minutes at 00', () => {
        const { control, timeFacade, locker } = connectPicker({ mode: 'time', attributes: 'data-hours-only="1"', value: '14:00:00' });
        const panel = openTimePanel(control);

        expect(timeRange(panel, 'minute').min).toBe('0');
        expect(timeRange(panel, 'minute').max).toBe('0');

        change(timeInput(panel, 'minute'), '30');
        expect(timeInput(panel, 'minute').value).toBe('00');
        expect(locker.value).toBe('14:00:00');

        slideTime(panel, 'hour', 9);
        expect(locker.value).toBe('09:00:00');
        expect(timeFacade.value).toBe('09');
    });

    test('the panel fires change when it closes with a new value, as the calendar does', () => {
        const { control, timeFacade } = connectPicker({ mode: 'time', value: '14:30:00' });
        let changes = 0;
        timeFacade.addEventListener('change', () => changes++);

        const panel = openTimePanel(control);
        slideTime(panel, 'hour', 9);
        expect(changes).toBe(0);

        pressPointer(document.body);
        expect(control.timePicker.isShown).toBe(false);
        expect(panel.isConnected).toBe(false);
        expect(changes).toBe(1);

        // Opening and closing without a change announces nothing
        openTimePanel(control);
        pressPointer(document.body);
        expect(changes).toBe(1);
    });

    test('a press or focus outside closes the panel, a press inside it or on the facade does not', () => {
        const { control, timeFacade, element } = connectPicker({ mode: 'time' });
        const other = document.createElement('input');
        element.after(other);

        const panel = openTimePanel(control);
        pressPointer(timeInput(panel, 'minute'));
        pressPointer(timeFacade);
        expect(control.timePicker.isShown).toBe(true);

        pressPointer(document.body);
        expect(control.timePicker.isShown).toBe(false);

        openTimePanel(control);
        other.focus();
        expect(control.timePicker.isShown).toBe(false);
    });

    test('focus opens the panel, and Tab or ArrowDown move from the facade into it', () => {
        const { control, timeFacade } = connectPicker({ mode: 'time', value: '14:30:00' });

        timeFacade.focus();
        expect(control.timePicker.isShown).toBe(true);

        const tab = pressKey(timeFacade, 'Tab');
        expect(tab.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(timeInput(control.timePicker.element, 'hour'));

        // Shift+Tab is left to the browser
        expect(pressKey(timeFacade, 'Tab', { shiftKey: true }).defaultPrevented).toBe(false);

        control.timePicker.hide();
        timeFacade.focus();
        control.timePicker.hide();

        // ArrowDown opens the closed panel as well
        pressKey(timeFacade, 'ArrowDown');
        expect(control.timePicker.isShown).toBe(true);
        expect(document.activeElement).toBe(timeInput(control.timePicker.element, 'hour'));
    });

    test('a time typed into the facade while the panel is open shows in it and is announced once', () => {
        const { control, timeFacade, locker } = connectPicker({ mode: 'time', value: '14:30:00' });
        let changes = 0;
        timeFacade.addEventListener('change', () => changes++);

        const panel = openTimePanel(control);
        change(timeFacade, '8:15');

        expect(locker.value).toBe('08:15:00');
        expect(timeFacade.value).toBe('08:15');
        expect(timeInput(panel, 'hour').value).toBe('08');
        expect(timeInput(panel, 'minute').value).toBe('15');

        pressPointer(document.body);
        expect(changes).toBe(1);
    });

    test('clearing the facade empties the value, and the panel then opens on the default time without storing it', () => {
        const { control, timeFacade, locker } = connectPicker({
            mode: 'time',
            attributes: 'data-default-time-midnight="1"',
            value: '14:30:00'
        });

        change(timeFacade, '');
        expect(locker.value).toBe('');
        expect(timeFacade.value).toBe('');

        const panel = openTimePanel(control);
        expect(timeInput(panel, 'hour').value).toBe('00');
        expect(timeInput(panel, 'minute').value).toBe('00');
        expect(locker.value).toBe('');

        slideTime(panel, 'minute', 15);
        expect(locker.value).toBe('00:15:00');
    });

    test('a readonly time facade is not bound until a trigger enables it', () => {
        document.body.innerHTML = '<div data-control="datepicker" data-mode="time"><input type="text" data-timepicker readonly /><input type="hidden" value="" data-datetime-value /></div>';

        const element = document.querySelector('[data-control="datepicker"]');
        const control = new (jax.controls.get('datepicker'))(element);
        control.init();
        control.connect();
        connected.push(control);

        expect(control.timePicker).toBeNull();

        control.timeFacade.removeAttribute('readonly');
        element.dispatchEvent(new CustomEvent('trigger:disable', { bubbles: true }));
        expect(control.timePicker).not.toBeNull();

        control.timeFacade.disabled = true;
        element.dispatchEvent(new CustomEvent('trigger:disable', { bubbles: true }));
        expect(control.timePicker).toBeNull();
        expect(control.timeFacade.hasAttribute('aria-haspopup')).toBe(false);
    });
});

describe('datepicker mounting', () => {
    test('the calendar and the time panel stay on the body outside a dialog', async () => {
        const date = connectPicker({ mode: 'date' });
        const calendar = await openCalendar(date.control);
        expect(calendar.parentElement).toBe(document.body);

        const time = connectPicker({ mode: 'time' });
        expect(openTimePanel(time.control).parentElement).toBe(document.body);
    });

    test('the calendar and the time panel mount inside an enclosing dialog, outside the inert page', async () => {
        const date = connectPicker({ mode: 'date' });
        const dialog = document.createElement('dialog');
        document.body.appendChild(dialog);
        dialog.appendChild(date.element);
        dialog.showModal();

        const calendar = await openCalendar(date.control);
        expect(calendar.parentElement).toBe(dialog);
        expect(calendar.dataset.vcPosition).toBe('bottom');

        const time = connectPicker({ mode: 'time' });
        document.body.appendChild(dialog);
        dialog.appendChild(time.element);

        const panel = openTimePanel(time.control);
        expect(panel.parentElement).toBe(dialog);
        expect(panel.dataset.vcPosition).toBe('bottom');
    });

    test('an open calendar or time panel is removed with the control', async () => {
        const date = connectPicker({ mode: 'date' });
        const calendar = await openCalendar(date.control);
        date.control.disconnect();
        expect(calendar.isConnected).toBe(false);

        const time = connectPicker({ mode: 'time' });
        const panel = openTimePanel(time.control);
        time.control.disconnect();
        expect(panel.isConnected).toBe(false);
        expect(time.timeFacade.hasAttribute('aria-haspopup')).toBe(false);
    });
});

describe('datepicker keyboard and visibility', () => {
    test('Escape closes an open calendar and cancels the key, so an enclosing dialog or popover stays open', async () => {
        const { control, dateFacade } = connectPicker({ mode: 'date' });
        let reachedWindow = 0;
        const onWindowKeydown = () => reachedWindow++;
        window.addEventListener('keydown', onWindowKeydown);

        try {
            await openCalendar(control);
            const event = pressEscape(dateFacade);

            expect(event.defaultPrevented).toBe(true);
            expect(control.picker.context.isShowInInputMode).toBe(false);
            expect(reachedWindow).toBe(0);

            // With the calendar closed, Escape is left for the dialog
            expect(pressEscape(dateFacade).defaultPrevented).toBe(false);
            expect(reachedWindow).toBe(1);
        }
        finally {
            window.removeEventListener('keydown', onWindowKeydown);
        }
    });

    test('Escape closes an open time panel and cancels the key, so an enclosing dialog or popover stays open', () => {
        const { control, timeFacade, locker } = connectPicker({ mode: 'time', value: '14:30:00' });
        let reachedWindow = 0;
        const onWindowKeydown = () => reachedWindow++;
        window.addEventListener('keydown', onWindowKeydown);

        try {
            const panel = openTimePanel(control);
            const minute = timeInput(panel, 'minute');
            minute.focus();

            const event = pressEscape(minute);

            expect(event.defaultPrevented).toBe(true);
            expect(control.timePicker.isShown).toBe(false);
            expect(panel.isConnected).toBe(false);
            expect(reachedWindow).toBe(0);

            // Focus goes back to the facade without opening the panel again
            expect(document.activeElement).toBe(timeFacade);
            expect(control.timePicker.isShown).toBe(false);
            expect(locker.value).toBe('14:30:00');

            // With the panel closed, Escape is left for the dialog
            expect(pressEscape(timeFacade).defaultPrevented).toBe(false);
            expect(reachedWindow).toBe(1);
        }
        finally {
            window.removeEventListener('keydown', onWindowKeydown);
        }
    });
});

describe('datepicker timezone', () => {
    afterEach(() => {
        setSystemTime();
    });

    test('fills the current date and time from the configured timezone clock', () => {
        setSystemTime(new Date('2026-10-20T14:30:15Z'));

        const first = connectPicker({ attributes: 'data-timezone="Australia/Sydney"' });
        change(first.dateFacade, '09:15');
        expect(first.locker.value).toBe('2026-10-21 09:15:00');

        const second = connectPicker({ attributes: 'data-timezone="America/New_York"' });
        change(second.dateFacade, '2026-10-22');
        expect(second.locker.value).toBe('2026-10-22 10:30:15');
    });

    test('an empty datetime calendar opens on the timezone date and time, which a picked date takes', async () => {
        setSystemTime(new Date('2026-10-20T14:30:15Z'));

        const { control, locker } = connectPicker({ attributes: 'data-timezone="Australia/Sydney"' });
        const calendar = await openCalendar(control);

        expect(control.picker.context.dateToday).toBe('2026-10-21');
        expect(calendar.querySelector('[data-vc-time-input="hour"] input').value).toBe('01');

        clickDate(calendar, '2026-10-23');
        expect(locker.value).toBe('2026-10-23 01:30:00');
    });

    test('an empty time panel opens on the timezone time, which a change stores', () => {
        setSystemTime(new Date('2026-10-20T14:30:15Z'));

        const { control, locker } = connectPicker({ mode: 'time', attributes: 'data-timezone="Australia/Sydney"' });
        const panel = openTimePanel(control);

        expect(timeInput(panel, 'hour').value).toBe('01');
        expect(timeInput(panel, 'minute').value).toBe('30');
        expect(locker.value).toBe('');

        slideTime(panel, 'minute', 45);
        expect(locker.value).toBe('01:45:00');
    });

    test('an unknown timezone falls back to the browser clock', () => {
        const { control } = connectPicker({ attributes: 'data-timezone="Mars/Olympus"' });

        expect(control.getNow().date).toBe(control.formatDate(new Date(), 'YYYY-MM-DD'));
    });
});

describe('datepicker locale', () => {
    afterEach(() => {
        document.documentElement.removeAttribute('lang');
    });

    test('the page locale sets the default format, first day and calendar names', async () => {
        document.documentElement.setAttribute('lang', 'de');

        const { control, dateFacade, locker } = connectPicker({ value: '2026-03-04 14:30:00' });

        expect(dateFacade.value).toBe('4.3.2026 14:30');
        expect(control.picker.firstWeekday).toBe(1);
        expect(control.picker.locale).toBe('de');

        const calendar = await openCalendar(control);
        expect(calendar.querySelector('[data-vc="month"]').textContent).toBe('März');
        expect(calendar.querySelector('[data-vc-week-day]').textContent).toBe('Mo');

        change(dateFacade, '5.11.2026 14:30');
        expect(locker.value).toBe('2026-11-05 14:30:00');
    });

    test('an underscore locale with text in its date keeps the text as a literal', () => {
        document.documentElement.setAttribute('lang', 'bg_BG');

        const { control, dateFacade, locker } = connectPicker({ mode: 'date', value: '2026-03-04' });

        expect(control.getDateFormat()).toBe('D.MM.YYYY[ г.]');
        expect(dateFacade.value).toBe('4.03.2026 г.');

        change(dateFacade, '5.11.2026 г.');
        expect(locker.value).toBe('2026-11-05');
    });

    test('month and weekday tokens use the locale names', () => {
        document.documentElement.setAttribute('lang', 'fr');

        const { control } = connectPicker({ attributes: 'data-format="ddd D MMM YYYY"' });
        const date = new Date(2026, 1, 4);

        expect(control.formatDate(date, 'ddd D MMM YYYY')).toBe('mer. 4 févr. 2026');
        expect(control.formatDate(date, 'D MMMM YYYY')).toBe('4 février 2026');
        expect(control.parseFormattedDate('mer. 4 févr. 2026', 'ddd D MMM YYYY')).toEqual(date);
        expect(control.parseFormattedDate('4 FÉVRIER 2026', 'D MMMM YYYY')).toEqual(date);
    });

    test('an explicit format and first day win over the locale', async () => {
        document.documentElement.setAttribute('lang', 'de');

        const { control, dateFacade, locker } = connectPicker({
            mode: 'date',
            attributes: 'data-format="DD MMMM YYYY" data-first-day="0"',
            value: '2026-03-04'
        });

        expect(dateFacade.value).toBe('04 März 2026');
        expect(control.picker.firstWeekday).toBe(0);

        const calendar = await openCalendar(control);
        expect(calendar.querySelector('[data-vc-week-day]').textContent).toBe('So');

        change(dateFacade, '05 November 2026');
        expect(locker.value).toBe('2026-11-05');
    });

    test('English, a missing lang or an invalid lang keep the defaults', () => {
        for (const lang of ['en', 'en-GB', null, 'not a locale!']) {
            if (lang) {
                document.documentElement.setAttribute('lang', lang);
            }
            else {
                document.documentElement.removeAttribute('lang');
            }

            const { control, dateFacade } = connectPicker({ mode: 'date', value: '2026-03-04' });

            expect(dateFacade.value).toBe('2026-03-04');
            expect(control.picker.firstWeekday).toBe(0);
            expect(control.picker.locale).toBe('en');
            expect(control.formatDate(new Date(2026, 1, 4), 'ddd D MMM')).toBe('Wed 4 Feb');
        }
    });
});
