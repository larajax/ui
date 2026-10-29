/**
 * Default English strings, hosts pass translated overrides through the lang option.
 */
export const defaultLang = {
    // The button that opens the browser's date or time picker on an edited cell
    chooseDate: 'Choose a date',
    chooseTime: 'Choose a time'
};

/**
 * makeTranslator returns a lookup for strings, preferring the host's overrides to the defaults.
 */
export function makeTranslator(overrides) {
    const strings = { ...defaultLang, ...(overrides || {}) };

    return (key, fallback) => {
        if (strings[key] !== undefined) {
            return strings[key];
        }

        return fallback !== undefined ? fallback : key;
    };
}
