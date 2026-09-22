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
 *
 * Config (data-* on the wrapper, camelCased by the framework):
 * - format - date display format string (Pikaday tokens, e.g. "DD MMM YYYY")
 * - minDate - earliest selectable date (ISO string)
 * - maxDate - latest selectable date (ISO string)
 * - yearRange - number of years shown in the year dropdown (default 10)
 * - firstDay - first day of the week, 0 = Sunday (default 0)
 * - showWeekNumber - show an ISO week-number column
 * - twelveHour - use a 12 hour AM/PM time picker
 *
 * Standalone divergence from October's toolbox datepicker: timezone/locale
 * conversion (Moment.js) is not ported, so values are stored as the plain
 * selected date/time; the backend overlay re-adds timezone handling.
 */
'use strict';

import Pikaday from '../../vendor/pikaday/pikaday.esm.js';
import { Clockpicker } from './clockpicker.js';

const DB_DATE_FORMAT = 'YYYY-MM-DD';
const DB_TIME_FORMAT = 'HH:mm:ss';

jax.registerControl('datepicker', class extends jax.ControlBase {
    init() {
        this.config = Object.assign({
            format: null,
            minDate: null,
            maxDate: null,
            yearRange: 10,
            firstDay: 0,
            showWeekNumber: false,
            twelveHour: false
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

        if (!this.hasDate && !this.hasTime) {
            return;
        }

        this.onFacadeChange = this.onFacadeChange.bind(this);

        this.syncFacadesFromLocker();

        if (this.hasDate) {
            this.initDatePicker();
            this.dateFacade.addEventListener('change', this.onFacadeChange);
        }

        if (this.hasTime) {
            this.initTimePicker();
            this.timeFacade.addEventListener('change', this.onFacadeChange);
        }
    }

    disconnect() {
        if (this.hasDate) {
            this.dateFacade.removeEventListener('change', this.onFacadeChange);
        }
        if (this.hasTime) {
            this.timeFacade.removeEventListener('change', this.onFacadeChange);
        }

        if (this.picker) {
            this.picker.destroy();
            this.picker = null;
        }
        if (this.timePicker) {
            this.timePicker.remove();
            this.timePicker = null;
        }

        this.dateFacade = null;
        this.timeFacade = null;
        this.locker = null;
    }

    //
    // Date picker
    //

    initDatePicker() {
        const options = {
            field: this.dateFacade,
            format: this.getDateFormat(),
            yearRange: this.config.yearRange,
            firstDay: Number(this.config.firstDay) || 0,
            showWeekNumber: !!this.config.showWeekNumber,
            keyboardInput: false,
            toString: (date) => this.formatDate(date, this.getDateFormat()),
            parse: (value) => this.parseDate(value),
            onSelect: () => this.onSetLockerValue()
        };

        if (this.config.minDate) {
            options.minDate = new Date(this.config.minDate);
        }

        if (this.config.maxDate) {
            options.maxDate = new Date(this.config.maxDate);
        }

        this.picker = new Pikaday(options);
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
            afterDone: () => this.onSetLockerValue()
        });
    }

    //
    // Locker
    //

    onFacadeChange() {
        const dateEmpty = !this.hasDate || !this.dateFacade.value.trim();
        const timeEmpty = !this.hasTime || !this.timeFacade.value.trim();

        if (dateEmpty && timeEmpty) {
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

        const parts = [];

        if (this.hasDate) {
            const date = this.picker ? this.picker.getDate() : null;
            parts.push(date ? this.formatDate(date, DB_DATE_FORMAT) : '');
        }

        if (this.hasTime) {
            parts.push(this.formatTime(this.timeFacade.value));
        }

        this.locker.value = parts.filter((part) => part).join(' ');
    }

    // Loads the stored locker value into the facades on connect.
    syncFacadesFromLocker() {
        const stored = this.locker ? this.locker.value : '';
        if (!stored) {
            return;
        }

        // Without a date facade the locker holds a bare time value
        let datePart = null,
            timePart = null;
        if (this.hasDate) {
            [datePart, timePart] = stored.split(' ');
        }
        else {
            timePart = stored;
        }

        if (this.hasDate && datePart) {
            const date = this.parseDate(datePart);
            if (date) {
                this.dateFacade.value = this.formatDate(date, this.getDateFormat());
            }
        }

        if (this.hasTime && timePart) {
            this.timeFacade.value = this.formatTime(timePart, true);
        }
    }

    emptyValues() {
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

    //
    // Formatting
    //

    getDateFormat() {
        return this.config.format || DB_DATE_FORMAT;
    }

    // Formats a Date using the supported Pikaday-style tokens.
    formatDate(date, format) {
        if (!(date instanceof Date) || isNaN(date)) {
            return '';
        }

        const pad = (n) => String(n).padStart(2, '0');
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        const tokens = {
            YYYY: date.getFullYear(),
            MMMM: months[date.getMonth()],
            MMM: months[date.getMonth()].slice(0, 3),
            MM: pad(date.getMonth() + 1),
            DD: pad(date.getDate())
        };

        return format.replace(/YYYY|MMMM|MMM|MM|DD/g, (match) => tokens[match]);
    }

    // Normalizes a time facade value to HH:mm:ss for storage, or to the display
    // HH:mm (forDisplay) shown in the facade.
    formatTime(value, forDisplay) {
        if (!value) {
            return '';
        }

        const twelve = /^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?\s*$/i.exec(value);
        if (!twelve) {
            return '';
        }

        let hours = Number(twelve[1]);
        const minutes = twelve[2],
            seconds = twelve[3] || '00',
            meridiem = twelve[4] ? twelve[4].toUpperCase() : null;

        if (meridiem === 'PM' && hours < 12) {
            hours += 12;
        }
        if (meridiem === 'AM' && hours === 12) {
            hours = 0;
        }

        const pad = (n) => String(n).padStart(2, '0');

        if (forDisplay) {
            // Clockpicker expects "hh:mm AM/PM" in twelve hour mode
            if (this.config.twelveHour) {
                const displayMeridiem = hours >= 12 ? 'PM' : 'AM',
                    displayHours = (hours % 12) || 12;
                return pad(displayHours) + ':' + minutes + ' ' + displayMeridiem;
            }
            return pad(hours) + ':' + minutes;
        }

        return pad(hours) + ':' + minutes + ':' + seconds;
    }

    // Parses an ISO (YYYY-MM-DD) or display-formatted value into a Date.
    parseDate(value) {
        if (!value) {
            return null;
        }

        const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
        if (iso) {
            return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
        }

        const parsed = new Date(value);
        return isNaN(parsed) ? null : parsed;
    }
});
