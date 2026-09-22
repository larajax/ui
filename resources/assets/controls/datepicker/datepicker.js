/*
 * DatePicker control
 *
 * A jQuery-free date picker driving Pikaday's plain constructor API. The
 * associated text input acts as a facade showing the display-formatted date;
 * the final normalized value (YYYY-MM-DD) is written to a hidden data locker.
 *
 * Data attributes:
 * - data-control="datepicker" - enables the plugin on the wrapper element
 * - data-datepicker - the visible facade input (text)
 * - data-datetime-value - the hidden locker input carrying the stored value
 *
 * Config (data-* on the wrapper, camelCased by the framework):
 * - format - display format string (Pikaday tokens, e.g. "DD MMM YYYY")
 * - minDate - earliest selectable date (ISO string)
 * - maxDate - latest selectable date (ISO string)
 * - yearRange - number of years shown in the year dropdown (default 10)
 * - firstDay - first day of the week, 0 = Sunday (default 0)
 * - showWeekNumber - show an ISO week-number column
 *
 * Standalone divergence from October's toolbox datepicker: timezone/locale
 * conversion (Moment.js) and the Clockpicker time picker are not ported. This
 * is date-only and stores the plain selected date; the backend overlay re-adds
 * timezone handling and time support where needed.
 */
'use strict';

import Pikaday from '../../vendor/pikaday/pikaday.esm.js';

const DB_DATE_FORMAT = 'YYYY-MM-DD';

jax.registerControl('datepicker', class extends jax.ControlBase {
    init() {
        this.config = Object.assign({
            format: null,
            minDate: null,
            maxDate: null,
            yearRange: 10,
            firstDay: 0,
            showWeekNumber: false
        }, this.config);

        this.picker = null;
    }

    connect() {
        this.facade = this.element.querySelector('[data-datepicker]');
        this.locker = this.element.querySelector('[data-datetime-value]');

        if (!this.facade) {
            return;
        }

        this.onFacadeChange = this.onFacadeChange.bind(this);
        this.facade.addEventListener('change', this.onFacadeChange);

        this.initPicker();
        this.syncFacadeFromLocker();
    }

    disconnect() {
        if (this.facade) {
            this.facade.removeEventListener('change', this.onFacadeChange);
        }

        if (this.picker) {
            this.picker.destroy();
            this.picker = null;
        }

        this.facade = null;
        this.locker = null;
    }

    initPicker() {
        const options = {
            field: this.facade,
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

    onFacadeChange() {
        if (!this.facade.value.trim()) {
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

        const date = this.picker ? this.picker.getDate() : null;
        this.locker.value = date ? this.formatDate(date, DB_DATE_FORMAT) : '';
    }

    // Loads the stored locker value into the picker and facade on connect.
    syncFacadeFromLocker() {
        const stored = this.locker ? this.locker.value : this.facade.value;
        if (!stored) {
            return;
        }

        const date = this.parseDate(stored);
        if (date && this.picker) {
            this.picker.setDate(date, true);
            this.facade.value = this.formatDate(date, this.getDateFormat());
        }
    }

    emptyValues() {
        if (this.locker) {
            this.locker.value = '';
        }
        this.facade.value = '';
        if (this.picker) {
            this.picker.setDate(null, true);
        }
    }

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
