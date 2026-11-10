/*
 * Chart date adapter
 *
 * Gives Chart.js time scales their dates without a date library. Times are read and shown in UTC,
 * so a chart shows the times it was given whatever the visitor's timezone, and formats are strftime
 * patterns, such as "%b %d", or Intl.DateTimeFormat options. Month and day names follow <html lang>.
 *
 * Format tokens: %a day name, %b month name, %d day, %e space padded day, %H hours, %I 12 hour
 * hours, %l space padded 12 hour hours, %m month, %M minutes, %q quarter, %S seconds, %y two
 * digit year, %Y year, %p am or pm, %P AM or PM, %w day of the week as a number.
 */
'use strict';

const UNIT_MS = {
    millisecond: 1,
    second: 1000,
    minute: 60000,
    hour: 3600000,
    day: 86400000,
    week: 604800000
};

// The tick formats for each unit, which a chart's own displayFormats replace
export const DATE_FORMATS = {
    datetime: '%b %d, %Y %H:%M:%S',
    millisecond: '%H:%M:%S',
    second: '%H:%M:%S',
    minute: '%H:%M',
    hour: '%H:%M',
    day: '%b %d',
    week: '%b %d',
    month: '%b %Y',
    quarter: 'Q%q %Y',
    year: '%Y'
};

const nameCache = new Map();

// Returns the page locale from <html lang>, or undefined for the browser's own
function pageLocale() {
    const lang = (document.documentElement.getAttribute('lang') || '').trim().replace(/_/g, '-');
    if (!lang) {
        return undefined;
    }

    try {
        return Intl.getCanonicalLocales(lang)[0];
    }
    catch (ex) {
        return undefined;
    }
}

// Returns the short month and day names for a locale, from January and from Sunday
function localeNames(locale) {
    const key = locale || '';
    if (!nameCache.has(key)) {
        const months = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
        const days = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });

        nameCache.set(key, {
            months: Array.from({ length: 12 }, (_, month) => months.format(Date.UTC(2026, month, 1))),
            days: Array.from({ length: 7 }, (_, day) => days.format(Date.UTC(2026, 1, day + 1)))
        });
    }

    return nameCache.get(key);
}

const pad = (number, padding = '0') => (number < 10 ? padding + number : String(number));

/**
 * formatDate formats a time in UTC with a strftime pattern, or with Intl.DateTimeFormat options.
 */
export function formatDate(time, format, locale = pageLocale()) {
    const date = new Date(time);

    if (format && typeof format === 'object') {
        return new Intl.DateTimeFormat(locale, { ...format, timeZone: 'UTC' }).format(date);
    }

    const { months, days } = localeNames(locale);
    const hours = date.getUTCHours();
    const hours12 = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    let result = '';
    let escaped = false;

    for (const char of String(format || '')) {
        if (!escaped) {
            if (char === '%') {
                escaped = true;
            }
            else {
                result += char;
            }
            continue;
        }

        escaped = false;

        switch (char) {
            case 'a': result += days[date.getUTCDay()]; break;
            case 'b': result += months[date.getUTCMonth()]; break;
            case 'd': result += pad(date.getUTCDate()); break;
            case 'e': result += pad(date.getUTCDate(), ' '); break;
            case 'h':
            case 'H': result += pad(hours); break;
            case 'I': result += pad(hours12); break;
            case 'l': result += pad(hours12, ' '); break;
            case 'm': result += pad(date.getUTCMonth() + 1); break;
            case 'M': result += pad(date.getUTCMinutes()); break;
            case 'q': result += Math.floor(date.getUTCMonth() / 3) + 1; break;
            case 'S': result += pad(date.getUTCSeconds()); break;
            case 'y': result += pad(date.getUTCFullYear() % 100); break;
            case 'Y': result += date.getUTCFullYear(); break;
            case 'p': result += hours < 12 ? 'am' : 'pm'; break;
            case 'P': result += hours < 12 ? 'AM' : 'PM'; break;
            case 'w': result += date.getUTCDay(); break;
            default: result += char;
        }
    }

    return result;
}

/**
 * parseDate reads a timestamp, a Date or a date string as a UTC time, or returns null.
 */
export function parseDate(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value.getTime();
    }

    if (typeof value === 'number') {
        return isFinite(value) ? value : null;
    }

    let text = String(value).trim();

    // A date or date and time with no zone is read as UTC, as a date on its own already is
    if (/^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?)?$/.test(text)) {
        text = text.replace(' ', 'T') + (text.length > 10 ? 'Z' : '');
    }

    const time = Date.parse(text);

    return isNaN(time) ? null : time;
}

/**
 * startOfDate returns the start of the unit a time falls in, a week starting on Sunday, or on the
 * given ISO weekday for "isoWeek", where 1 is Monday.
 */
export function startOfDate(time, unit, weekday) {
    const date = new Date(time);

    switch (unit) {
        case 'millisecond':
            return time;
        case 'second':
            return Math.floor(time / 1000) * 1000;
        case 'minute':
            return Math.floor(time / 60000) * 60000;
        case 'hour':
            return Math.floor(time / 3600000) * 3600000;
        case 'day':
            return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        case 'week':
        case 'isoWeek': {
            const start = unit === 'isoWeek' ? (weekday === true || !weekday ? 1 : weekday) % 7 : 0;
            const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
            const offset = (date.getUTCDay() - start + 7) % 7;
            return day - offset * UNIT_MS.day;
        }
        case 'month':
            return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
        case 'quarter':
            return Date.UTC(date.getUTCFullYear(), Math.floor(date.getUTCMonth() / 3) * 3, 1);
        case 'year':
            return Date.UTC(date.getUTCFullYear(), 0, 1);
        default:
            return time;
    }
}

/**
 * addToDate adds an amount of a unit to a time, by calendar month for months, quarters and years.
 */
export function addToDate(time, amount, unit) {
    if (UNIT_MS[unit]) {
        return time + amount * UNIT_MS[unit];
    }

    const months = { month: 1, quarter: 3, year: 12 }[unit];
    if (!months) {
        return time;
    }

    const date = new Date(time);
    date.setUTCMonth(date.getUTCMonth() + amount * months);

    return date.getTime();
}

/**
 * diffDates returns how many of a unit lie between two times, whole calendar months for months,
 * quarters and years.
 */
export function diffDates(max, min, unit) {
    if (UNIT_MS[unit]) {
        return (max - min) / UNIT_MS[unit];
    }

    const months = { month: 1, quarter: 3, year: 12 }[unit];
    if (!months) {
        return 0;
    }

    const from = new Date(min);
    const to = new Date(max);
    let total = (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + to.getUTCMonth() - from.getUTCMonth();

    // A month only counts once its day and time are reached again
    if (total > 0 && addToDate(min, total, 'month') > max) {
        total--;
    }

    return Math.trunc(total / months);
}

/**
 * registerDateAdapter sets this adapter on the Chart.js adapters export.
 */
export function registerDateAdapter(adapters) {
    if (!adapters || !adapters._date) {
        return;
    }

    adapters._date.override({
        formats: () => DATE_FORMATS,
        parse: (value) => parseDate(value),
        format: (time, format) => formatDate(time, format),
        add: (time, amount, unit) => addToDate(time, amount, unit),
        diff: (max, min, unit) => diffDates(max, min, unit),
        startOf: (time, unit, weekday) => startOfDate(time, unit, weekday),
        endOf: (time, unit) => addToDate(startOfDate(time, unit), 1, unit) - 1
    });
}
