/*
 * DatePicker control
 *
 * A date and time picker driving Vanilla Calendar Pro (the calendar inside Bootstrap 6's
 * Datepicker, so Bootstrap's [data-vc] styles theme it), and a time panel (timepicker.js)
 * showing the calendar's time controls on their own for time facades. The visible text input
 * acts as a facade; the final normalized value is written to a hidden data locker (YYYY-MM-DD,
 * HH:mm:ss, or "YYYY-MM-DD HH:mm:ss" when both are present). In datetime mode the date facade
 * holds the date and the time, and the calendar carries the time controls.
 *
 * Data attributes:
 * - data-control="datepicker" - enables the plugin on the wrapper element
 * - data-datepicker - the visible date facade input (text)
 * - data-timepicker - the visible time facade input (text)
 * - data-datetime-value - the hidden locker input carrying the stored value
 * - data-default-time-midnight - fill a missing time with 00:00 instead of the current time
 * - data-ignore-timezone - set when the value is not converted to the user's timezone
 *
 * Config (data-* on the wrapper, camelCased by the framework):
 * - mode - date, datetime or time, defaults to the facades found
 * - format - date display format (YYYY YY MMMM MMM MM M DD Do D dddd ddd, [literal]),
 *   defaults to the locale's numeric date, or YYYY-MM-DD
 * - minDate - earliest selectable date (ISO string)
 * - maxDate - latest selectable date (ISO string)
 * - yearRange - years either side in the year view, or [lower, upper] (default 10)
 * - disableDays - weekday numbers (0 = Sunday) or YYYY-MM-DD dates that cannot be picked
 * - firstDay - first day of the week, 0 = Sunday, defaults to the locale's first day, or 0
 * - showWeekNumber - show a week-number column
 * - twelveHour - use a 12 hour AM/PM time picker
 * - hoursOnly - pick the hour only, minutes are stored as 00
 * - timezone - timezone of the displayed values, used for the current date and time fills
 *
 * Events:
 * - trigger:disable - rechecks the readonly/disabled state and binds or unbinds the pickers
 *
 * The server renders and reads values in the user's timezone, so the control
 * never converts them. Date-only and time-only fields store just their part.
 *
 * The page locale (<html lang>) sets the default format, the first day of the
 * week and the calendar names, built with Intl. English keeps the defaults.
 */
'use strict';

import { TimePicker } from './timepicker.js';
import { mountParentFor, mountOrigin } from '../popup/dialog-mount.js';

const DB_DATE_FORMAT = 'YYYY-MM-DD';

// Bootstrap's Datepicker closes this long after a date is picked
const HIDE_DELAY = 100;

// Gap between the facade and a calendar or time panel opened above it
const PICKER_GAP = 4;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ENGLISH_NAMES = {
    months: MONTHS,
    monthsShort: MONTHS.map((name) => name.slice(0, 3)),
    weekdays: WEEKDAYS,
    weekdaysShort: WEEKDAYS.map((name) => name.slice(0, 3))
};

const DATE_TOKENS = /\[[^\]]*\]|YYYY|YY|MMMM|MMM|MM|M|dddd|ddd|DD|Do|D/g;

const NAME_PATTERN = '[\\p{L}\\p{M}]+\\.?';

const TOKEN_PATTERNS = {
    YYYY: '\\d{4}',
    YY: '\\d{2}',
    MMMM: NAME_PATTERN,
    MMM: NAME_PATTERN,
    MM: '\\d{2}',
    M: '\\d{1,2}',
    dddd: NAME_PATTERN,
    ddd: NAME_PATTERN,
    DD: '\\d{2}',
    Do: '\\d{1,2}(?:st|nd|rd|th)',
    D: '\\d{1,2}'
};

// A time at the end of a datetime facade, such as 14:30, 14:30:15 or 02:30 PM
const TIME_SUFFIX = /(?:^|\s)(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?|\d{1,2}\s*[AP]M)\s*$/i;

// Locale data built with Intl, cached by locale
const localeDataCache = new Map();

// The calendar module, once loaded
let calendarModule = null;
let calendarPromise = null;

const pad = (n) => String(n).padStart(2, '0');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ordinal = (n) => {
    const suffixes = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
};

/**
 * loadCalendar imports Vanilla Calendar Pro on first use and resolves with its exports.
 */
export function loadCalendar() {
    if (!calendarPromise) {
        calendarPromise = import('../../vendor/vanilla-calendar-pro/vanilla-calendar-pro.esm.js').then((module) => {
            calendarModule = module;
            return module;
        });
    }

    return calendarPromise;
}

// Returns the page locale from <html lang>, or null when it is missing, invalid or English.
function getPageLocale() {
    const lang = (document.documentElement.getAttribute('lang') || '').trim().replace(/_/g, '-');
    if (!lang) {
        return null;
    }

    let locale;
    try {
        locale = Intl.getCanonicalLocales(lang)[0];
    }
    catch (ex) {
        return null;
    }

    if (!locale || locale.split('-')[0].toLowerCase() === 'en') {
        return null;
    }

    return locale;
}

// Returns the calendar names, first day of the week and display format for a locale.
function getLocaleData(locale) {
    if (!localeDataCache.has(locale)) {
        let data = null;

        try {
            data = makeLocaleData(locale);
        }
        catch (ex) {
            // Intl does not support the locale, use the defaults
        }

        localeDataCache.set(locale, data);
    }

    return localeDataCache.get(locale);
}

function makeLocaleData(locale) {
    const options = { timeZone: 'UTC', calendar: 'gregory', numberingSystem: 'latn' },
        longMonth = new Intl.DateTimeFormat(locale, { ...options, month: 'long' }),
        shortMonth = new Intl.DateTimeFormat(locale, { ...options, month: 'short' }),
        longWeekday = new Intl.DateTimeFormat(locale, { ...options, weekday: 'long' }),
        shortWeekday = new Intl.DateTimeFormat(locale, { ...options, weekday: 'short' }),
        months = [],
        monthsShort = [],
        weekdays = [],
        weekdaysShort = [];

    for (let month = 0; month < 12; month++) {
        const date = new Date(Date.UTC(2017, month, 15));
        months.push(longMonth.format(date));
        monthsShort.push(shortMonth.format(date));
    }

    // The week starts on Sunday 1 January 2017, matching Date.getDay()
    for (let day = 0; day < 7; day++) {
        const date = new Date(Date.UTC(2017, 0, 1 + day));
        weekdays.push(longWeekday.format(date));
        weekdaysShort.push(shortWeekday.format(date));
    }

    return {
        months,
        monthsShort,
        weekdays,
        weekdaysShort,
        firstDay: getLocaleFirstDay(locale),
        format: getLocaleDateFormat(locale, options)
    };
}

// Returns the locale's first day of the week (0 = Sunday), or null when the browser cannot tell.
function getLocaleFirstDay(locale) {
    try {
        const intlLocale = new Intl.Locale(locale),
            weekInfo = typeof intlLocale.getWeekInfo === 'function' ? intlLocale.getWeekInfo() : intlLocale.weekInfo;

        if (weekInfo && weekInfo.firstDay) {
            return weekInfo.firstDay % 7;
        }
    }
    catch (ex) {
        // Intl.Locale is not supported
    }

    return null;
}

// Builds a display format such as DD.MM.YYYY from the locale's numeric date, or null when it cannot.
function getLocaleDateFormat(locale, options) {
    const formatter = new Intl.DateTimeFormat(locale, { ...options, year: 'numeric', month: 'numeric', day: 'numeric' }),
        found = new Set();

    let format = '';

    // A single digit day and month show whether the locale pads them
    for (const { type, value } of formatter.formatToParts(new Date(Date.UTC(2034, 2, 4)))) {
        if (type === 'literal') {
            const literal = value.replace(/\p{Cf}/gu, '');
            format += /\p{L}/u.test(literal) ? '[' + literal + ']' : literal;
            continue;
        }

        if (!/^\d+$/.test(value) || found.has(type)) {
            return null;
        }

        if (type === 'day') {
            format += value.length > 1 ? 'DD' : 'D';
        }
        else if (type === 'month') {
            format += value.length > 1 ? 'MM' : 'M';
        }
        else if (type === 'year') {
            format += value.length > 2 ? 'YYYY' : 'YY';
        }
        else {
            return null;
        }

        found.add(type);
    }

    return found.size === 3 ? format : null;
}

export function registerDatepicker(jax) {
    jax.registerControl('datepicker', class extends jax.ControlBase {
        init() {
            // A first day missing from the markup falls back to the locale's
            this.hasFirstDay = this.config.firstDay !== undefined && this.config.firstDay !== null && this.config.firstDay !== '';

            this.config = Object.assign({
                mode: null,
                format: null,
                minDate: null,
                maxDate: null,
                yearRange: 10,
                disableDays: null,
                firstDay: 0,
                showWeekNumber: false,
                twelveHour: false,
                hoursOnly: false,
                timezone: null
            }, this.config);

            this.picker = null;
            this.timePicker = null;
            this.isDatePickerBound = false;
            this.onDocumentKeydown = this.onDocumentKeydown.bind(this);
            this.onWindowResize = this.onWindowResize.bind(this);
        }

        connect() {
            this.dateFacade = this.element.querySelector('[data-datepicker]');
            this.timeFacade = this.element.querySelector('[data-timepicker]');
            this.locker = this.element.querySelector('[data-datetime-value]');

            // A datetime field with one facade picks the time in the calendar
            this.hasCalendarTime = !!this.dateFacade && !this.timeFacade && this.config.mode === 'datetime';
            this.hasDate = !!this.dateFacade;
            this.hasTime = !!this.timeFacade || this.hasCalendarTime;
            this.defaultTimeMidnight = this.element.hasAttribute('data-default-time-midnight');

            if (!this.hasDate && !this.hasTime) {
                return;
            }

            this.initRegion();
            this.syncFacadesFromLocker();
            this.checkPickerStates();

            this.listen('change', '[data-datepicker], [data-timepicker]', this.onFacadeChange);
            this.listen('trigger:disable', this.checkPickerStates);
        }

        disconnect() {
            this.destroyDatePicker();
            this.destroyTimePicker();

            this.dateFacade = null;
            this.timeFacade = null;
            this.locker = null;
        }

        // Binds a picker to each editable facade and unbinds readonly or disabled ones.
        checkPickerStates() {
            if (jax.changeMonitor) {
                jax.changeMonitor.disable();
            }

            this.isBinding = true;

            try {
                if (this.hasDate) {
                    const dateEnabled = this.isFacadeEnabled(this.dateFacade);
                    if (!dateEnabled && this.isDatePickerBound) {
                        this.destroyDatePicker();
                    }
                    else if (dateEnabled && !this.isDatePickerBound) {
                        this.initDatePicker();
                    }
                }

                if (this.timeFacade) {
                    const timeEnabled = this.isFacadeEnabled(this.timeFacade);
                    if (!timeEnabled && this.timePicker) {
                        this.destroyTimePicker();
                    }
                    else if (timeEnabled && !this.timePicker) {
                        this.initTimePicker();
                    }
                }
            }
            finally {
                this.isBinding = false;

                if (jax.changeMonitor) {
                    jax.changeMonitor.enable();
                }
            }
        }

        isFacadeEnabled(input) {
            return !input.hasAttribute('readonly') && !input.disabled;
        }

        //
        // Date picker
        //

        // Binds the calendar, loading it first when no other picker has.
        initDatePicker() {
            this.isDatePickerBound = true;

            if (calendarModule) {
                this.createCalendar(calendarModule);
                return;
            }

            loadCalendar().then((module) => {
                if (this.isDatePickerBound && !this.picker && this.dateFacade) {
                    this.createCalendar(module);
                }
            });
        }

        // Creates the calendar in input mode with the options Bootstrap's Datepicker uses, so its styles apply.
        createCalendar({ Calendar, time, weeks }) {
            const theme = this.getTheme(),
                disabled = this.getDisabledDays();

            const options = {
                extensions: [time, weeks],
                inputMode: true,
                positionToInput: 'left',
                type: 'default',
                selectionDatesMode: 'single',
                enableDateToggle: false,
                firstWeekday: this.getFirstDay(),
                locale: this.locale || 'en',
                selectedTheme: !theme || theme === 'auto' ? 'system' : theme,
                themeAttrDetect: '[data-bs-theme]',
                enableWeekNumbers: !!this.config.showWeekNumber,
                disableWeekdays: disabled.weekdays,
                disableDates: disabled.dates,
                onInit: (calendar) => this.onCalendarInit(calendar),
                onShow: (calendar) => this.onCalendarShow(calendar),
                onHide: () => this.onCalendarHide(),
                onClickDate: (calendar) => this.onCalendarDate(calendar),
                onChangeTime: (calendar, event, isError) => this.onCalendarTime(calendar, isError),
                onCreateYearEls: (calendar, cell) => this.limitYear(calendar, cell),
                ...this.getCalendarState()
            };

            const minDate = this.parseIsoDate(this.config.minDate);
            if (minDate) {
                options.dateMin = this.formatDate(minDate, DB_DATE_FORMAT);
            }

            const maxDate = this.parseIsoDate(this.config.maxDate);
            if (maxDate) {
                options.dateMax = this.formatDate(maxDate, DB_DATE_FORMAT);
            }

            if (this.hasCalendarTime) {
                options.selectionTimeMode = this.config.twelveHour ? 12 : 24;

                if (this.config.hoursOnly) {
                    options.timeMinMinute = 0;
                    options.timeMaxMinute = 0;
                }
            }

            this.picker = new Calendar(this.dateFacade, options);
            this.picker.init();
        }

        destroyDatePicker() {
            this.isDatePickerBound = false;
            this.unbindCalendarEvents();
            clearTimeout(this.hideTimer);

            if (!this.picker) {
                return;
            }

            // The calendar would swap the facade for a copy taken when it was created, so it stays in place
            const facade = this.picker.context.inputElement;
            if (facade) {
                facade.replaceWith = () => {};
            }

            try {
                this.picker.destroy();
            }
            finally {
                if (facade) {
                    delete facade.replaceWith;
                    facade.removeAttribute('aria-haspopup');
                }

                this.picker = null;
            }
        }

        // Returns the calendar's selected date, shown month and time from the stored value.
        getCalendarState() {
            const { date, time } = this.splitLockerValue(this.locker ? this.locker.value : ''),
                now = this.getNow(),
                shown = this.parseIsoDate(date || now.date);

            const state = {
                dateToday: now.date,
                selectedDates: date ? [date] : [],
                selectedMonth: shown.getMonth(),
                selectedYear: shown.getFullYear()
            };

            if (this.hasCalendarTime) {
                state.selectedTime = this.formatCalendarTime(time || this.getDefaultTime());
            }

            return state;
        }

        // Moves a new calendar into an enclosing dialog and gives it the page theme.
        onCalendarInit(calendar) {
            this.mountPicker(calendar.context.mainElement, this.dateFacade);
            this.syncPickerTheme(calendar.context.mainElement);
        }

        // Loads the stored value into the calendar and positions it beside the facade.
        onCalendarShow(calendar) {
            this.valueOnShow = this.locker ? this.locker.value : '';

            calendar.set(this.getCalendarState());
            this.mountPicker(calendar.context.mainElement, this.dateFacade);
            this.syncPickerTheme(calendar.context.mainElement);
            this.positionCalendar();

            document.addEventListener('keydown', this.onDocumentKeydown, true);
            window.addEventListener('resize', this.onWindowResize);
        }

        // Announces a value picked while the calendar was open, as a typed value would.
        onCalendarHide() {
            this.unbindCalendarEvents();
            this.announceChange(this.dateFacade, this.valueOnShow);
        }

        unbindCalendarEvents() {
            document.removeEventListener('keydown', this.onDocumentKeydown, true);
            window.removeEventListener('resize', this.onWindowResize);
        }

        // Stores a clicked date, keeping the stored time, and closes a date-only calendar.
        onCalendarDate(calendar) {
            const date = calendar.context.selectedDates[0];
            if (!date) {
                return;
            }

            const stored = this.splitLockerValue(this.locker ? this.locker.value : '');
            let time = null;

            if (this.hasCalendarTime) {
                time = stored.time || this.readCalendarTime(calendar);
            }
            else if (this.hasTime) {
                time = stored.time || this.getDefaultTime();
            }

            this.setValue(date, time);

            if (!this.hasCalendarTime) {
                clearTimeout(this.hideTimer);
                this.hideTimer = setTimeout(() => this.picker && this.picker.hide(), HIDE_DELAY);
            }
        }

        // Stores a changed time, with the stored date or today when none is picked.
        onCalendarTime(calendar, isError) {
            if (isError) {
                return;
            }

            const stored = this.splitLockerValue(this.locker ? this.locker.value : '');

            this.setValue(
                stored.date || calendar.context.selectedDates[0] || this.getNow().date,
                this.readCalendarTime(calendar)
            );
        }

        // Escape closes the calendar, and cancelling the key keeps an enclosing dialog or popover open.
        onDocumentKeydown(ev) {
            if (ev.key !== 'Escape' || !this.picker || !this.picker.context.isShowInInputMode) {
                return;
            }

            ev.preventDefault();
            ev.stopPropagation();
            this.picker.hide();
        }

        onWindowResize() {
            this.positionCalendar();
        }

        // A picker mounts on the body, but the page outside an open modal dialog is inert.
        mountPicker(element, facade) {
            const parent = mountParentFor(facade);

            if (element && element.parentNode !== parent) {
                parent.appendChild(element);
            }
        }

        // Copies the theme around the facade onto a picker, as Bootstrap's Datepicker does.
        syncPickerTheme(element) {
            if (!element) {
                return;
            }

            const theme = this.getTheme();

            if (theme) {
                element.setAttribute('data-bs-theme', theme);
            }
            else {
                element.removeAttribute('data-bs-theme');
            }
        }

        getTheme() {
            const facade = this.dateFacade || this.timeFacade,
                themed = facade ? facade.closest('[data-bs-theme]') : null;

            return themed ? themed.getAttribute('data-bs-theme') : null;
        }

        positionCalendar() {
            const element = this.picker ? this.picker.context.mainElement : null;

            // Until the calendar first opens its main element is the facade itself
            if (element !== this.dateFacade) {
                this.positionPicker(element, this.dateFacade);
            }
        }

        // Places a picker below its facade, or above when only that fits, right-aligned when it fits on screen.
        positionPicker(element, facade) {
            if (!element || !facade) {
                return;
            }

            const rect = facade.getBoundingClientRect(),
                width = element.offsetWidth,
                height = element.offsetHeight,
                viewportWidth = document.documentElement.clientWidth,
                viewportHeight = document.documentElement.clientHeight,
                above = rect.top - height - PICKER_GAP >= 0 && rect.bottom + height + PICKER_GAP > viewportHeight;

            let left = rect.right - width >= 0 ? rect.right - width : rect.left;
            left = Math.max(0, Math.min(left, viewportWidth - width));

            // Bootstrap's margin spaces a picker below the facade
            const top = above ? rect.top - height - PICKER_GAP : rect.bottom;

            // Viewport positions become positions inside the parent the picker is mounted in
            const origin = mountOrigin(element.parentNode);

            element.dataset.vcPosition = above ? 'top' : 'bottom';
            element.style.left = (left + window.scrollX - origin.left) + 'px';
            element.style.top = (top + window.scrollY - origin.top) + 'px';
        }

        // Disables the years outside the year range in the year view.
        limitYear(calendar, cell) {
            const button = cell.querySelector('[data-vc-years-year]');
            if (!button) {
                return;
            }

            const [lower, upper] = this.getYearRange(calendar.context.selectedYear),
                year = Number(button.dataset.vcYearsYear);

            if (year < lower || year > upper) {
                button.disabled = true;
                button.tabIndex = -1;
                button.setAttribute('aria-disabled', 'true');
            }
        }

        // Returns the [lower, upper] years selectable around a year.
        getYearRange(year) {
            const range = this.config.yearRange;

            if (Array.isArray(range) && range.length === 2) {
                return [Number(range[0]), Number(range[1])];
            }

            const span = Math.abs(parseInt(range, 10)) || 10;

            return [year - span, year + span];
        }

        // Splits disableDays into weekday numbers and YYYY-MM-DD dates.
        getDisabledDays() {
            const days = Array.isArray(this.config.disableDays) ? this.config.disableDays : [],
                weekdays = [],
                dates = [];

            for (const day of days) {
                if (/^\d{4}-\d{2}-\d{2}$/.test(String(day))) {
                    dates.push(String(day));
                }
                else if (/^[0-6]$/.test(String(day))) {
                    weekdays.push(Number(day));
                }
            }

            return { weekdays, dates };
        }

        getDateFormat() {
            let format = DB_DATE_FORMAT;

            if (this.config.format) {
                format = this.config.format;
            }
            else if (this.localeData && this.localeData.format) {
                format = this.localeData.format;
            }

            return format;
        }

        // Returns the configured first day of the week, otherwise the locale's.
        getFirstDay() {
            if (!this.hasFirstDay && this.localeData && this.localeData.firstDay !== null) {
                return this.localeData.firstDay;
            }

            return Number(this.config.firstDay) || 0;
        }

        // Returns the calendar's time as HH:mm:ss.
        readCalendarTime(calendar) {
            const { selectedHours, selectedMinutes, selectedKeeping } = calendar.context;

            return this.formatTime(selectedHours + ':' + selectedMinutes + (selectedKeeping ? ' ' + selectedKeeping : ''));
        }

        // Formats an HH:mm:ss time as the calendar and the datetime facade show it (14:30 or 02:30 PM).
        formatCalendarTime(time) {
            const [hours, minutes] = time.split(':').map(Number),
                displayMinutes = this.config.hoursOnly ? '00' : pad(minutes || 0);

            if (this.config.twelveHour) {
                return pad((hours % 12) || 12) + ':' + displayMinutes + ' ' + (hours >= 12 ? 'PM' : 'AM');
            }

            return pad(hours) + ':' + displayMinutes;
        }

        //
        // Time picker
        //

        // Binds the time panel, which shows the calendar's time controls on their own.
        initTimePicker() {
            this.timePicker = new TimePicker(this.timeFacade, {
                twelveHour: !!this.config.twelveHour,
                hoursOnly: !!this.config.hoursOnly,
                onShow: (picker) => this.onTimePickerShow(picker),
                onHide: () => this.onTimePickerHide(),
                onChangeTime: (picker) => this.onTimePickerTime(picker),
                position: (picker) => this.positionPicker(picker.element, this.timeFacade)
            });
        }

        destroyTimePicker() {
            if (this.timePicker) {
                this.timePicker.destroy();
                this.timePicker = null;
            }
        }

        // Loads the stored time into the panel, moves it into an enclosing dialog and gives it the page theme.
        onTimePickerShow(picker) {
            this.timeValueOnShow = this.locker ? this.locker.value : '';

            this.loadTimePicker(picker);
            this.mountPicker(picker.element, this.timeFacade);
            this.syncPickerTheme(picker.element);
        }

        // Announces a time picked while the panel was open, as the calendar does.
        onTimePickerHide() {
            this.announceChange(this.timeFacade, this.timeValueOnShow);
        }

        // Stores a changed time, with the stored date or today when the field also has a date.
        onTimePickerTime(picker) {
            const stored = this.splitLockerValue(this.locker ? this.locker.value : '');

            this.setValue(this.hasDate ? stored.date || this.getNow().date : null, picker.getTime());
        }

        // Shows the stored time in the panel, or midnight or the current time when there is none.
        loadTimePicker(picker) {
            const { time } = this.splitLockerValue(this.locker ? this.locker.value : '');

            picker.setTime(time || this.getDefaultTime());
        }

        // Returns midnight or the current time as HH:mm:ss, for a value picked without a time.
        getDefaultTime() {
            return this.defaultTimeMidnight ? '00:00:00' : this.getNow().time;
        }

        // Returns the current date (YYYY-MM-DD) and time (HH:mm:ss) in the configured timezone, or the browser's own.
        getNow() {
            const now = new Date();

            if (this.config.timezone) {
                try {
                    const parts = {};
                    const formatter = new Intl.DateTimeFormat('en-US', {
                        timeZone: this.config.timezone,
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hourCycle: 'h23'
                    });

                    for (const part of formatter.formatToParts(now)) {
                        parts[part.type] = part.value;
                    }

                    return {
                        date: parts.year + '-' + parts.month + '-' + parts.day,
                        time: parts.hour + ':' + parts.minute + ':' + parts.second
                    };
                }
                catch (ex) {
                    // Unknown timezone, use the browser's
                }
            }

            return {
                date: this.formatDate(now, DB_DATE_FORMAT),
                time: pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds())
            };
        }

        //
        // Locker
        //

        onFacadeChange(ev) {
            if (this.isBinding || this.isEmptying || this.isNotifying) {
                return;
            }

            if (!ev.target.value.trim()) {
                this.emptyValues();
            }
            else {
                this.onSetLockerValue();
            }

            // An open time panel shows the typed value, whose change the facade has already announced
            if (this.timePicker && this.timePicker.isShown) {
                this.timeValueOnShow = this.locker ? this.locker.value : '';
                this.loadTimePicker(this.timePicker);
            }
        }

        // Fires change on a facade when the stored value moved while its picker was open, as a typed value would.
        announceChange(facade, valueOnShow) {
            if (!this.locker || !facade || this.locker.value === valueOnShow) {
                return;
            }

            this.isNotifying = true;

            try {
                facade.dispatchEvent(new Event('change', { bubbles: true }));
            }
            finally {
                this.isNotifying = false;
            }
        }

        // Stores the typed value, keeping the stored part a facade does not hold or parse.
        onSetLockerValue() {
            if (!this.locker) {
                return;
            }

            const typed = this.readFacades(),
                stored = this.splitLockerValue(this.locker.value);

            this.setValue(
                this.hasDate ? typed.date || stored.date || this.getNow().date : null,
                this.hasTime ? typed.time || stored.time || this.getDefaultTime() : null
            );
        }

        // Writes the date and time parts to the locker and shows them in the facades.
        setValue(date, time) {
            if (this.locker) {
                this.locker.value = [date, time].filter(Boolean).join(' ');
            }

            if (this.dateFacade && date) {
                this.dateFacade.value = this.formatFacadeDate(date, time);
            }

            if (this.timeFacade && time) {
                this.timeFacade.value = this.formatTime(time, true);
            }
        }

        // Reads the date (YYYY-MM-DD) and time (HH:mm:ss) typed into the facades, null when missing or invalid.
        readFacades() {
            let date = null,
                time = null;

            if (this.dateFacade) {
                let value = this.dateFacade.value;

                if (this.hasCalendarTime) {
                    const match = TIME_SUFFIX.exec(value);
                    if (match) {
                        time = this.formatTime(match[1]) || null;
                        value = value.slice(0, match.index);
                    }
                }

                const parsed = this.parseDate(value.trim());
                date = parsed ? this.formatDate(parsed, DB_DATE_FORMAT) : null;
            }

            if (this.timeFacade) {
                time = this.formatTime(this.timeFacade.value) || null;
            }

            return { date, time };
        }

        // Loads the stored locker value into the facades on connect.
        syncFacadesFromLocker() {
            const { date, time } = this.splitLockerValue(this.locker ? this.locker.value : '');

            if (this.dateFacade && date) {
                this.dateFacade.value = this.formatFacadeDate(date, time);
            }

            if (this.timeFacade && time) {
                this.timeFacade.value = this.formatTime(time, true);
            }
        }

        // Formats a stored date for the date facade, followed by the time in datetime mode.
        formatFacadeDate(date, time) {
            const value = this.formatDate(this.parseIsoDate(date), this.getDateFormat());

            return this.hasCalendarTime && time ? value + ' ' + this.formatCalendarTime(time) : value;
        }

        // Splits a stored value into its date and time parts, either may be missing.
        splitLockerValue(value) {
            const match = /^\s*(\d{4}-\d{2}-\d{2})?[T\s]*(\d{1,2}:\d{2}(?::\d{2})?)?/.exec(value || '');

            return {
                date: match && match[1] ? match[1] : null,
                time: match && match[2] ? this.formatTime(match[2]) || null : null
            };
        }

        emptyValues() {
            this.isEmptying = true;

            try {
                if (this.locker) {
                    this.locker.value = '';
                }
                if (this.dateFacade) {
                    this.dateFacade.value = '';
                }
                if (this.timeFacade) {
                    this.timeFacade.value = '';
                }
            }
            finally {
                this.isEmptying = false;
            }
        }

        //
        // Formatting
        //

        // Formats a Date using the supported date tokens.
        formatDate(date, format) {
            if (!(date instanceof Date) || isNaN(date)) {
                return '';
            }

            const names = this.getCalendarNames();

            return format.replace(DATE_TOKENS, (token) => {
                switch (token) {
                    case 'YYYY': return String(date.getFullYear());
                    case 'YY': return pad(date.getFullYear() % 100);
                    case 'MMMM': return names.months[date.getMonth()];
                    case 'MMM': return names.monthsShort[date.getMonth()];
                    case 'MM': return pad(date.getMonth() + 1);
                    case 'M': return String(date.getMonth() + 1);
                    case 'dddd': return names.weekdays[date.getDay()];
                    case 'ddd': return names.weekdaysShort[date.getDay()];
                    case 'DD': return pad(date.getDate());
                    case 'Do': return ordinal(date.getDate());
                    case 'D': return String(date.getDate());
                    default: return token.slice(1, -1);
                }
            });
        }

        // Parses a display-formatted value into a Date, falling back to ISO (YYYY-MM-DD).
        parseDate(value) {
            if (!value) {
                return null;
            }

            return this.parseFormattedDate(value, this.getDateFormat()) || this.parseIsoDate(value);
        }

        // Parses a value written in the given format, rejecting impossible dates like 31 Feb.
        parseFormattedDate(value, format) {
            const fields = [];
            let pattern = '',
                lastIndex = 0;

            for (const match of format.matchAll(DATE_TOKENS)) {
                const token = match[0];
                pattern += escapeRegExp(format.slice(lastIndex, match.index));
                lastIndex = match.index + token.length;

                if (token.charAt(0) === '[') {
                    pattern += escapeRegExp(token.slice(1, -1));
                    continue;
                }

                pattern += '(' + TOKEN_PATTERNS[token] + ')';
                fields.push(token);
            }

            pattern += escapeRegExp(format.slice(lastIndex));

            const result = new RegExp('^\\s*' + pattern + '\\s*$', 'iu').exec(value);
            if (!result) {
                return null;
            }

            let year = new Date().getFullYear(),
                month = 0,
                day = 1;

            for (const [index, token] of fields.entries()) {
                const part = result[index + 1];

                if (token === 'YYYY') {
                    year = Number(part);
                }
                else if (token === 'YY') {
                    year = Number(part) + (Number(part) > 68 ? 1900 : 2000);
                }
                else if (token === 'MMMM' || token === 'MMM') {
                    month = this.findMonthIndex(part);
                }
                else if (token === 'MM' || token === 'M') {
                    month = Number(part) - 1;
                }
                else if (token === 'DD' || token === 'D' || token === 'Do') {
                    day = parseInt(part, 10);
                }
            }

            const date = new Date(year, month, day);

            if (month < 0 || date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
                return null;
            }

            return date;
        }

        // Finds a month by its full or short name, then by its first three letters.
        findMonthIndex(name) {
            const names = this.getCalendarNames(),
                normalize = (value) => value.toLowerCase().replace(/\.$/, ''),
                value = normalize(name);

            let index = names.months.findIndex((month) => normalize(month) === value);

            if (index === -1) {
                index = names.monthsShort.findIndex((month) => normalize(month) === value);
            }

            if (index === -1) {
                index = names.months.findIndex((month) => normalize(month).slice(0, 3) === value.slice(0, 3));
            }

            return index;
        }

        // Returns the month and weekday names of the page locale, or English.
        getCalendarNames() {
            return this.localeData || ENGLISH_NAMES;
        }

        // Reads the page locale for the default format, the first day of the week and the calendar names.
        initRegion() {
            this.locale = getPageLocale();
            this.localeData = this.locale ? getLocaleData(this.locale) : null;
        }

        // Parses the date part of an ISO value as a local date.
        parseIsoDate(value) {
            const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
            if (!iso) {
                return null;
            }

            return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
        }

        // Normalizes a time facade value to HH:mm:ss for storage, or to the facade display
        // format (forDisplay) for the twelve hour and hours only modes.
        formatTime(value, forDisplay) {
            if (!value) {
                return '';
            }

            const match = /^\s*(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?\s*$/i.exec(value);
            if (!match) {
                return '';
            }

            let hours = Number(match[1]);
            const minutes = match[2] || '00',
                seconds = match[3] || '00',
                meridiem = match[4] ? match[4].toUpperCase() : null;

            if (meridiem === 'PM' && hours < 12) {
                hours += 12;
            }
            if (meridiem === 'AM' && hours === 12) {
                hours = 0;
            }

            if (hours > 23 || Number(minutes) > 59 || Number(seconds) > 59) {
                return '';
            }

            if (forDisplay) {
                const displayMinutes = this.config.hoursOnly ? '' : ':' + minutes;

                // The time facade shows "hh:mm AM" in twelve hour mode
                if (this.config.twelveHour) {
                    const displayMeridiem = hours >= 12 ? 'PM' : 'AM',
                        displayHours = (hours % 12) || 12;
                    return pad(displayHours) + displayMinutes + ' ' + displayMeridiem;
                }

                return pad(hours) + displayMinutes;
            }

            return pad(hours) + ':' + minutes + ':' + seconds;
        }
    });
}
