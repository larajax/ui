/*
 * DatePicker control
 *
 * A jQuery-free date and time picker driving Pikaday (date) and the vanilla
 * Clockpicker fork (time) via their plain APIs. Each visible text input acts as
 * a facade; the final normalized value is written to a hidden data locker
 * (YYYY-MM-DD, HH:mm:ss, or "YYYY-MM-DD HH:mm:ss" when both are present).
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
 * - format - date display format (YYYY YY MMMM MMM MM M DD Do D dddd ddd, [literal]),
 *   defaults to the locale's numeric date, or YYYY-MM-DD
 * - minDate - earliest selectable date (ISO string)
 * - maxDate - latest selectable date (ISO string)
 * - yearRange - years either side in the year dropdown, or [lower, upper] (default 10)
 * - disableDays - weekday numbers (0 = Sunday) or YYYY-MM-DD dates that cannot be picked
 * - firstDay - first day of the week, 0 = Sunday, defaults to the locale's first day, or 0
 * - showWeekNumber - show an ISO week-number column
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

import Pikaday from '../../vendor/pikaday/pikaday.esm.js';
import { Clockpicker } from './clockpicker.js';

const DB_DATE_FORMAT = 'YYYY-MM-DD';

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

// Locale data built with Intl, cached by locale
const localeDataCache = new Map();

const pad = (n) => String(n).padStart(2, '0');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ordinal = (n) => {
    const suffixes = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
};

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

// Returns the calendar names, first day of the week, display format and Pikaday i18n for a locale.
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

    // The week starts on Sunday 1 January 2017, as Pikaday expects
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
        format: getLocaleDateFormat(locale, options),
        i18n: {
            previousMonth: 'Previous Month',
            nextMonth: 'Next Month',
            months,
            weekdays,
            weekdaysShort
        }
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
        }

        connect() {
            this.dateFacade = this.element.querySelector('[data-datepicker]');
            this.timeFacade = this.element.querySelector('[data-timepicker]');
            this.locker = this.element.querySelector('[data-datetime-value]');

            this.hasDate = !!this.dateFacade;
            this.hasTime = !!this.timeFacade;
            this.defaultTimeMidnight = this.element.hasAttribute('data-default-time-midnight');
            this.disabledDays = Array.isArray(this.config.disableDays) ? this.config.disableDays : [];

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
                    if (!dateEnabled && this.picker) {
                        this.destroyDatePicker();
                    }
                    else if (dateEnabled && !this.picker) {
                        this.initDatePicker();
                    }
                }

                if (this.hasTime) {
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

        initDatePicker() {
            const options = {
                field: this.dateFacade,
                format: this.getDateFormat(),
                yearRange: this.config.yearRange,
                firstDay: this.getFirstDay(),
                showWeekNumber: !!this.config.showWeekNumber,
                keyboardInput: false,
                toString: (date) => this.formatDate(date, this.getDateFormat()),
                parse: (value) => this.parseDate(value),
                disableDayFn: (date) => this.isDateDisabled(date),
                onSelect: () => this.onSetLockerValue(),
                onOpen: () => this.alignDatePicker()
            };

            if (this.localeData) {
                options.i18n = this.localeData.i18n;
            }

            const minDate = this.parseIsoDate(this.config.minDate);
            if (minDate) {
                options.minDate = minDate;
            }

            const maxDate = this.parseIsoDate(this.config.maxDate);
            if (maxDate) {
                options.maxDate = maxDate;
            }

            this.picker = new Pikaday(options);
        }

        destroyDatePicker() {
            if (this.picker) {
                this.picker.destroy();
                this.picker = null;
            }
        }

        isDateDisabled(date) {
            const compareDate = this.formatDate(date, DB_DATE_FORMAT);

            return this.disabledDays.some((disabledDay) => {
                return disabledDay === date.getDay() || disabledDay === compareDate;
            });
        }

        // Aligns the calendar to the right edge of the facade when it fits on screen.
        alignDatePicker() {
            const el = this.picker ? this.picker.el : null;
            if (!el || !this.dateFacade) {
                return;
            }

            const rect = this.dateFacade.getBoundingClientRect();
            if (rect.right - el.offsetWidth < 0) {
                return;
            }

            el.style.left = 'auto';
            el.style.right = (document.documentElement.clientWidth - rect.right - window.scrollX) + 'px';
        }

        // Returns the picked date as YYYY-MM-DD, or today when none is picked.
        getDatePickerValue() {
            let date = null;

            if (this.hasDate) {
                date = this.parseDate(this.dateFacade.value) || (this.picker ? this.picker.getDate() : null);
            }

            return date ? this.formatDate(date, DB_DATE_FORMAT) : this.getNow().date;
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

        //
        // Time picker
        //

        initTimePicker() {
            this.timePicker = new Clockpicker(this.timeFacade, {
                autoclose: true,
                placement: 'auto',
                align: 'right',
                twelvehour: !!this.config.twelveHour,
                afterDone: () => this.onSetLockerValue(),
                afterHourSelect: () => this.onAfterHourSelect()
            });
        }

        destroyTimePicker() {
            if (this.timePicker) {
                this.timePicker.remove();
                this.timePicker = null;
            }
        }

        // Completes the pick after the hour when only hours are selectable.
        onAfterHourSelect() {
            if (!this.config.hoursOnly || !this.timePicker) {
                return;
            }

            const hours = pad(this.timePicker.hours);

            this.timeFacade.value = this.config.twelveHour
                ? hours + ' ' + this.timePicker.amOrPm
                : hours;

            this.timePicker.hide();
            this.timeFacade.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Returns the picked time as HH:mm:ss, or midnight or the current time when none is picked.
        getTimePickerValue() {
            const value = this.hasTime ? this.formatTime(this.timeFacade.value) : '';
            if (value) {
                return value;
            }

            if (this.defaultTimeMidnight) {
                return '00:00:00';
            }

            return this.getNow().time;
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
            if (this.isBinding || this.isEmptying) {
                return;
            }

            if (!ev.target.value.trim()) {
                this.emptyValues();
            }
            else {
                this.onSetLockerValue();
            }
        }

        onSetLockerValue() {
            if (!this.locker) {
                return;
            }

            if (this.hasDate && this.hasTime) {
                this.locker.value = this.getDatePickerValue() + ' ' + this.getTimePickerValue();
            }
            else if (this.hasDate) {
                this.locker.value = this.getDatePickerValue();
            }
            else {
                this.locker.value = this.getTimePickerValue();
            }
        }

        // Loads the stored locker value into the facades on connect.
        syncFacadesFromLocker() {
            const { date, time } = this.splitLockerValue(this.locker ? this.locker.value : '');

            if (this.hasDate && date) {
                this.dateFacade.value = this.formatDate(this.parseIsoDate(date), this.getDateFormat());
            }

            if (this.hasTime && time) {
                this.timeFacade.value = this.formatTime(time, true);
            }
        }

        // Splits a stored value into its date and time parts, either may be missing.
        splitLockerValue(value) {
            const match = /^\s*(\d{4}-\d{2}-\d{2})?[T\s]*(\d{1,2}:\d{2}(?::\d{2})?)?/.exec(value || '');

            return {
                date: match && match[1] ? match[1] : null,
                time: match && match[2] ? match[2] : null
            };
        }

        emptyValues() {
            this.isEmptying = true;

            try {
                if (this.locker) {
                    this.locker.value = '';
                }
                if (this.hasDate) {
                    this.dateFacade.value = '';
                    if (this.picker) {
                        this.picker.setDate(null, true);
                    }
                }
                if (this.hasTime) {
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

                // Clockpicker expects "hh:mm AM/PM" in twelve hour mode
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
