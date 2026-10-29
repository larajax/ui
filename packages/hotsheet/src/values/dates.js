/**
 * Date and time text in the moment-style formats DataTable columns use (`YYYY-MM-DD`, `DD/MM/YYYY`, `HH:mm`
 * and so on). Typed text is read leniently, so `2026-7-8` or `9:05` are corrected to the column's format.
 *
 * Supported tokens: YYYY YY MMMM MMM MM M DD D HH H hh h mm m ss s A a. Anything else is literal text,
 * and text in [brackets] is always literal.
 */

const TOKEN = /\[[^\]]*\]|YYYY|YY|MMMM|MMM|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|A|a/g;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// A month name or its first three letters, for text the browser may read as a date
const MONTH_NAME = new RegExp(`\\b(?:${MONTHS.map((month) => month.slice(0, 3)).join('|')})`, 'i');

function pad(value, length = 2) {
    return String(value).padStart(length, '0');
}

function tokenize(format) {
    const parts = [];
    let last = 0;

    for (const match of format.matchAll(TOKEN)) {
        if (match.index > last) {
            parts.push({ literal: format.slice(last, match.index) });
        }
        parts.push(match[0].startsWith('[') ? { literal: match[0].slice(1, -1) } : { token: match[0] });
        last = match.index + match[0].length;
    }

    if (last < format.length) {
        parts.push({ literal: format.slice(last) });
    }

    return parts;
}

/**
 * formatParts writes date parts ({ year, month, day, hour, minute, second }) in a format.
 */
export function formatParts(parts, format) {
    const hour12 = parts.hour % 12 || 12;

    const values = {
        YYYY: pad(parts.year, 4),
        YY: pad(parts.year % 100),
        MMMM: MONTHS[parts.month - 1],
        MMM: MONTHS[parts.month - 1]?.slice(0, 3),
        MM: pad(parts.month),
        M: String(parts.month),
        DD: pad(parts.day),
        D: String(parts.day),
        HH: pad(parts.hour),
        H: String(parts.hour),
        hh: pad(hour12),
        h: String(hour12),
        mm: pad(parts.minute),
        m: String(parts.minute),
        ss: pad(parts.second),
        s: String(parts.second),
        A: parts.hour < 12 ? 'AM' : 'PM',
        a: parts.hour < 12 ? 'am' : 'pm'
    };

    return tokenize(format).map((part) => (part.literal !== undefined ? part.literal : values[part.token])).join('');
}

function tokenPattern(token) {
    switch (token) {
        case 'YYYY': return '(\\d{4})';
        case 'YY': return '(\\d{2})';
        case 'MMMM':
        case 'MMM': return '([A-Za-z]+)';
        case 'A':
        case 'a': return '([AaPp][Mm])';
        default: return '(\\d{1,2})';
    }
}

function escapeLiteral(text) {
    // Separators match any run of separator characters, so `7-8` reads in a `/` format too
    return text.replace(/[\s\-/.:,]+/g, '\u0000')
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\u0000/g, '[\\s\\-/.:,]+');
}

/**
 * parseText reads text in a format leniently (single digits, any separators), returning date parts or null.
 */
export function parseText(text, format, defaults = {}) {
    const parts = tokenize(format);
    const tokens = parts.filter((part) => part.token).map((part) => part.token);
    const pattern = parts.map((part) => (part.literal !== undefined ? escapeLiteral(part.literal) : tokenPattern(part.token))).join('');
    const match = new RegExp(`^\\s*${pattern}\\s*$`).exec(String(text));

    if (!match) {
        return null;
    }

    const result = { year: 1970, month: 1, day: 1, hour: 0, minute: 0, second: 0, ...defaults };
    let meridiem = null;

    tokens.forEach((token, index) => {
        const raw = match[index + 1];
        const number = Number(raw);

        switch (token) {
            case 'YYYY': result.year = number; break;
            case 'YY': result.year = 2000 + number; break;
            case 'MMMM':
            case 'MMM': result.month = MONTHS.findIndex((name) => name.toLowerCase().startsWith(raw.toLowerCase().slice(0, 3))) + 1; break;
            case 'MM':
            case 'M': result.month = number; break;
            case 'DD':
            case 'D': result.day = number; break;
            case 'HH':
            case 'H':
            case 'hh':
            case 'h': result.hour = number; break;
            case 'mm':
            case 'm': result.minute = number; break;
            case 'ss':
            case 's': result.second = number; break;
            case 'A':
            case 'a': meridiem = raw.toLowerCase(); break;
            default: break;
        }
    });

    if (meridiem === 'pm' && result.hour < 12) {
        result.hour += 12;
    }
    else if (meridiem === 'am' && result.hour === 12) {
        result.hour = 0;
    }

    return isValidParts(result) ? result : null;
}

function isValidParts(parts) {
    if (parts.month < 1 || parts.month > 12 || parts.day < 1 || parts.hour > 23 || parts.minute > 59 || parts.second > 59) {
        return false;
    }

    const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
    return date.getUTCMonth() === parts.month - 1 && date.getUTCDate() === parts.day;
}

/**
 * correctDate returns date text in the format, read from text in that format or any text the browser can
 * read as a date, or null when it isn't a date.
 */
export function correctDate(text, format) {
    const value = String(text);

    // ISO dates, and the date of ISO date times, are read directly, since the browser reads them in UTC or local time and can land on another day
    const isoDate = value.match(/^(\d{4}-\d{1,2}-\d{1,2})(?:[T ]|$)/);
    let parts = parseText(value, format) || (isoDate && parseText(isoDate[1], 'YYYY-M-D'));

    // Text naming a month and a year (like "March 4, 2026") goes to the browser, kept only when the day it reads appears in the text, so impossible dates aren't rolled over
    if (!parts && MONTH_NAME.test(value) && /\b\d{4}\b/.test(value)) {
        const parsed = new Date(value);
        const days = (value.match(/\b\d{1,2}\b/g) || []).map(Number);

        if (!isNaN(parsed.getTime()) && days.includes(parsed.getDate())) {
            parts = { year: parsed.getFullYear(), month: parsed.getMonth() + 1, day: parsed.getDate(), hour: 0, minute: 0, second: 0 };
        }
    }

    return parts ? formatParts(parts, format) : null;
}

/**
 * correctTime returns time text in the format, or null when the text isn't a time.
 */
export function correctTime(text, format) {
    const parts = parseText(text, format);
    return parts ? formatParts(parts, format) : null;
}

/**
 * isInFormat checks text is exactly what the format would write.
 */
export function isInFormat(text, format, read = correctDate) {
    return typeof text === 'string' && read(text, format) === text;
}

/**
 * toIsoDate and fromIsoDate convert between a column's format and the YYYY-MM-DD of a native date input.
 */
export function toIsoDate(text, format) {
    const parts = parseText(text, format);
    return parts ? formatParts(parts, 'YYYY-MM-DD') : '';
}

export function fromIsoDate(iso, format) {
    const parts = parseText(iso, 'YYYY-MM-DD');
    return parts ? formatParts(parts, format) : '';
}

export function toIsoTime(text, format) {
    const parts = parseText(text, format);
    return parts ? formatParts(parts, 'HH:mm') : '';
}

export function fromIsoTime(iso, format) {
    const parts = parseText(iso, 'HH:mm');
    return parts ? formatParts(parts, format) : '';
}
