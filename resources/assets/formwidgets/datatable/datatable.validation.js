/*
 * DataTable column validation, the rules of the column `validation` config:
 *
 *   required                                   the value must not be empty
 *   integer   allowNegative, min, max          whole numbers, positive unless allowNegative
 *   float     allowNegative, min, max          decimal numbers, positive unless allowNegative
 *   length    min, max                         text length
 *   regex     pattern, modifiers               text matching a regular expression
 *
 * Every rule takes `message`, and `requiredWith` to apply only when another column of the row has a value.
 * `min` and `max` are { value, message }. Empty values only fail `required`.
 */

/**
 * DEFAULT_MESSAGES are the English messages for rules without their own, replaced by translations passed to validateValue.
 */
export const DEFAULT_MESSAGES = {
    ruleRequired: 'The value should not be empty.',
    ruleInteger: 'The value should be an integer.',
    rulePositiveInteger: 'The value should be a positive integer',
    ruleFloat: 'The value should be a floating point number.',
    rulePositiveFloat: 'The value should be a positive floating point number',
    ruleMin: 'The value should not be less than :min',
    ruleMax: 'The value should not be more than :max',
    ruleMinLength: 'The string should not be shorter than :min',
    ruleMaxLength: 'The string should not be longer than :max',
    ruleRegex: 'Invalid value format.'
};

function textOf(value) {
    return value === null || value === undefined ? '' : String(value).trim();
}

function rowHasValue(rowData, column) {
    const value = rowData ? rowData[column] : undefined;

    if (typeof value === 'boolean') {
        return value;
    }

    return textOf(value).length > 0;
}

/**
 * makeMessage returns a default message by name with its :placeholders filled in.
 */
function makeMessage(messages, name, params = {}) {
    const text = messages[name] ?? DEFAULT_MESSAGES[name];

    return text.replace(/:(\w+)/g, (match, key) => (params[key] !== undefined ? String(params[key]) : match));
}

function checkRange(number, options, messages) {
    if (options.min !== undefined && number < options.min.value) {
        return options.min.message !== undefined ? options.min.message : makeMessage(messages, 'ruleMin', { min: options.min.value });
    }

    if (options.max !== undefined && number > options.max.value) {
        return options.max.message !== undefined ? options.max.message : makeMessage(messages, 'ruleMax', { max: options.max.value });
    }

    return null;
}

const RULES = {
    required(text, options, messages) {
        return text.length === 0 ? (options.message ?? makeMessage(messages, 'ruleRequired')) : null;
    },

    integer(text, options, messages) {
        if (!text.length) {
            return null;
        }

        if (!(options.allowNegative ? /^-?[0-9]*$/ : /^[0-9]*$/).test(text)) {
            return options.message ?? makeMessage(messages, options.allowNegative ? 'ruleInteger' : 'rulePositiveInteger');
        }

        return checkRange(parseInt(text, 10), options, messages);
    },

    float(text, options, messages) {
        if (!text.length) {
            return null;
        }

        if (!(options.allowNegative ? /^-?([0-9]+\.[0-9]+|[0-9]+)$/ : /^([0-9]+\.[0-9]+|[0-9]+)$/).test(text)) {
            return options.message ?? makeMessage(messages, options.allowNegative ? 'ruleFloat' : 'rulePositiveFloat');
        }

        return checkRange(parseFloat(text), options, messages);
    },

    length(text, options, messages) {
        if (!text.length) {
            return null;
        }

        if (options.min !== undefined && text.length < options.min.value) {
            return options.min.message ?? makeMessage(messages, 'ruleMinLength', { min: options.min.value });
        }

        if (options.max !== undefined && text.length > options.max.value) {
            return options.max.message ?? makeMessage(messages, 'ruleMaxLength', { max: options.max.value });
        }

        return null;
    },

    regex(text, options, messages) {
        if (!text.length || options.pattern === undefined) {
            return null;
        }

        return new RegExp(options.pattern, options.modifiers).test(text) ? null : (options.message ?? makeMessage(messages, 'ruleRegex'));
    }
};

/**
 * validateValue checks a value against a column's rules in order, returning the first message, or null when valid;
 * `messages` holds translations of DEFAULT_MESSAGES.
 */
export function validateValue(rules, value, rowData, messages = DEFAULT_MESSAGES) {
    const text = textOf(value);

    for (const [name, options] of Object.entries(rules || {})) {
        const check = RULES[name];
        const settings = options || {};

        if (!check || (settings.requiredWith !== undefined && !rowHasValue(rowData, settings.requiredWith))) {
            continue;
        }

        const message = check(text, settings, messages || DEFAULT_MESSAGES);
        if (message !== null) {
            return message;
        }
    }

    return null;
}

/**
 * hasRequiredRule tells whether empty values must be validated
 */
export function hasRequiredRule(rules) {
    return !!(rules && rules.required);
}
