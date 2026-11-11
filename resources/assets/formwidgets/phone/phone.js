/*
 * Phone input
 *
 * A phone number field with a country picker: the number is formatted as it is typed, a number typed with
 * a country code picks its country, and a hidden input posts the number in the international E.164 format.
 * The picker is Bootstrap's combobox, listing each country with its flag and calling code. The phone number
 * rules load on first use.
 *
 * Data attributes:
 * - data-control="phone-input" - enables the control on the field, or on a link that only shows a number
 * - data-default-country - two letter country for numbers typed without a country code, else the browser's region
 * - data-countries - JSON list of the two letter countries the picker offers, else every country
 * - data-preferred-countries - JSON list of the countries shown first in the picker
 * - data-phone-value - on a link that only shows a number, the number in the E.164 format
 *
 * JavaScript API:
 * jax.fetchControl(element, 'phone-input').getValue()
 * jax.fetchControl(element, 'phone-input').setValue('+61412345678')
 */
'use strict';

// The phone number rules are shared by every field, loaded on first use
let libraryPromise = null;

// Countries without a flag of their own use the flag they fly
const FLAG_ALIASES = { AC: 'sh', TA: 'sh' };

export function registerPhone(jax) {
    jax.registerControl('phone-input', class extends jax.ControlBase {
        init() {
            this.defaultCountry = (this.element.dataset.defaultCountry || browserRegion()).toUpperCase();
            this.allowedCountries = readCountries(this.element.dataset.countries);
            this.preferredCountries = readCountries(this.element.dataset.preferredCountries) || [];
            this.country = this.defaultCountry;
            this.typeahead = '';
        }

        connect() {
            this.input = this.element.querySelector('[data-phone-input]');
            this.valueInput = this.element.querySelector('input[data-phone-value]');
            this.toggle = this.element.querySelector('[data-phone-country]');
            this.menu = this.element.querySelector('[data-phone-countries]');
            this.isConnected = true;

            if (this.input) {
                this.listen('input', this.input, this.onInput);
                this.listen('keydown', this.input, this.onKeydown);
                this.listen('blur', this.input, this.onBlur);
                this.listen('click', this.onClick);

                // Native listeners, as these names look namespaced to listen()
                this.toggle.addEventListener('change.bs.combobox', this.proxy(this.onCountryPicked));
                this.toggle.addEventListener('shown.bs.combobox', this.proxy(this.onMenuShown));

                // Capture phase, so a space continues a typed country name
                this.menu.addEventListener('keydown', this.proxy(this.onMenuKeydown), true);
            }

            this.ready = loadLibrary().then((library) => {
                if (!this.isConnected) {
                    return;
                }

                this.library = library;

                if (this.input) {
                    this.showValue(this.valueInput.value);
                    this.committedValue = this.valueInput.value;
                }
                else {
                    this.showLink();
                }
            });
        }

        disconnect() {
            if (this.toggle) {
                this.toggle.removeEventListener('change.bs.combobox', this.proxy(this.onCountryPicked));
                this.toggle.removeEventListener('shown.bs.combobox', this.proxy(this.onMenuShown));
                this.menu.removeEventListener('keydown', this.proxy(this.onMenuKeydown), true);
            }

            clearTimeout(this.typeaheadTimer);
            this.isConnected = false;
            this.input = null;
            this.valueInput = null;
            this.toggle = null;
            this.menu = null;
        }

        getValue() {
            return this.valueInput ? this.valueInput.value : this.element.dataset.phoneValue || '';
        }

        // Shows and posts an E.164 number, announcing the change
        setValue(value) {
            this.valueInput.value = value || '';
            this.markInvalid(false);
            this.isEdited = false;

            if (this.library) {
                this.showValue(this.valueInput.value);
            }

            this.commit();
        }

        onInput(ev) {
            if (!this.library || ev.isComposing) {
                return;
            }

            this.reformat(this.input.value, this.input.selectionStart ?? this.input.value.length);
        }

        // Deleting a separator deletes the digit beyond it
        onKeydown(ev) {
            if (!this.library || this.input.readOnly || this.input.disabled) {
                return;
            }

            const { selectionStart: start, selectionEnd: end, value } = this.input;
            if (start !== end) {
                return;
            }

            if (ev.key === 'Backspace' && start > 0 && !isDialable(value[start - 1])) {
                const index = findDialable(value, start - 1, -1);
                if (index !== -1) {
                    ev.preventDefault();
                    this.reformat(value.slice(0, index) + value.slice(index + 1), index);
                }
            }
            else if (ev.key === 'Delete' && start < value.length && !isDialable(value[start])) {
                const index = findDialable(value, start, 1);
                if (index !== -1) {
                    ev.preventDefault();
                    this.reformat(value.slice(0, index) + value.slice(index + 1), start);
                }
            }
        }

        onBlur() {
            if (this.library && this.isEdited) {
                this.settle();
                this.commit();
            }
        }

        // Reads the typed national digits as the picked country's number
        onCountryPicked() {
            const item = this.menu.querySelector('.menu-item.selected');
            if (!this.library || !item) {
                return;
            }

            const typed = dialable(this.input.value);
            const previous = typed ? this.library.parsePhoneNumberFromString(typed, this.country) : null;
            const national = previous ? previous.nationalNumber : typed.replace('+', '');

            this.setCountry(item.dataset.bsValue);

            if (national) {
                this.reformat(national, national.length);
                this.settle();
                this.commit();
            }

            // Refocus the number after the combobox focuses its toggle
            requestAnimationFrame(() => this.input && this.input.focus());
        }

        // Focus the picked country once the list opens
        onMenuShown() {
            requestAnimationFrame(() => {
                const item = this.menu && this.menu.querySelector('.menu-item.selected');
                if (item) {
                    item.focus();
                }
            });
        }

        // Typeahead: jump to the first country matching the typed text
        onMenuKeydown(ev) {
            if (ev.key.length !== 1 || ev.ctrlKey || ev.metaKey || ev.altKey || (ev.key === ' ' && !this.typeahead)) {
                return;
            }

            if (ev.key === ' ') {
                ev.stopPropagation();
            }

            clearTimeout(this.typeaheadTimer);
            this.typeahead += ev.key.toLocaleLowerCase();
            this.typeaheadTimer = setTimeout(() => {
                this.typeahead = '';
            }, 700);

            const item = [...this.menu.querySelectorAll('.menu-item')]
                .find((element) => element.dataset.name.startsWith(this.typeahead));

            ev.preventDefault();

            if (item) {
                item.focus();
            }
        }

        // Clicking the field around the input focuses it
        onClick(ev) {
            if (!ev.target.closest('button, input, a, .menu') && ev.target.closest('.form-adorn')) {
                this.input.focus();
            }
        }

        // Formats the typed number, keeping the caret by the same digit
        reformat(text, caret) {
            const typed = dialable(text);
            const isInternational = typed.startsWith('+');
            const formatter = new this.library.AsYouType(isInternational ? undefined : this.country);
            const display = typed ? formatter.input(typed) : '';

            if (isInternational && formatter.getCountry()) {
                this.setCountry(formatter.getCountry());
            }

            this.input.value = display;

            if (document.activeElement === this.input) {
                const position = positionAfter(display, dialable(text.slice(0, caret)).length);
                this.input.setSelectionRange(position, position);
            }

            const number = formatter.getNumber();
            this.valueInput.value = number && number.isPossible() ? number.number : typed;
            this.markInvalid(false);
            this.isEdited = true;
        }

        // Format or flag the number once editing ends
        settle() {
            const typed = dialable(this.input.value);
            this.isEdited = false;

            if (!typed) {
                this.valueInput.value = '';
                return;
            }

            const number = this.library.parsePhoneNumberFromString(typed, this.country);

            if (number && number.isPossible()) {
                if (number.country) {
                    this.setCountry(number.country);
                }

                this.input.value = number.country ? number.formatNational() : number.formatInternational();
                this.valueInput.value = number.number;
            }
            else {
                this.valueInput.value = typed;
                this.markInvalid(true);
            }
        }

        // Shows a stored number in its national format
        showValue(value) {
            const number = value ? this.library.parsePhoneNumberFromString(value, this.defaultCountry) : null;

            if (number && number.country) {
                this.country = number.country;
            }

            this.fillCountries();
            this.setCountry(this.country);

            if (value) {
                this.input.value = number
                    ? (number.country ? number.formatNational() : number.formatInternational())
                    : value;
            }
        }

        // Shows the number in a link, national for the default country
        showLink() {
            const value = this.element.dataset.phoneValue || '';
            const number = value ? this.library.parsePhoneNumberFromString(value, this.defaultCountry) : null;

            if (number) {
                this.element.textContent = number.country === this.defaultCountry
                    ? number.formatNational()
                    : number.formatInternational();
            }
        }

        // Lists the countries with flags and codes, preferred first
        fillCountries() {
            const { getCountries, getCountryCallingCode } = this.library;
            const supported = getCountries();
            const codes = (this.allowedCountries || supported).filter((code) => supported.includes(code));

            if (supported.includes(this.country) && !codes.includes(this.country)) {
                codes.push(this.country);
            }

            const nameOf = regionNames();
            const preferred = this.preferredCountries.filter((code) => codes.includes(code));
            const others = codes
                .filter((code) => !preferred.includes(code))
                .sort((a, b) => nameOf(a).localeCompare(nameOf(b)));

            const item = (code) => {
                const element = document.createElement('button');
                element.type = 'button';
                element.className = 'menu-item';
                element.setAttribute('role', 'option');
                element.setAttribute('aria-selected', 'false');
                element.dataset.bsValue = code;
                element.dataset.name = nameOf(code).toLocaleLowerCase();

                const flag = document.createElement('span');
                flag.className = flagClass(code);
                flag.setAttribute('aria-hidden', 'true');

                const content = document.createElement('span');
                content.className = 'menu-item-content';

                const name = document.createElement('span');
                name.textContent = nameOf(code);

                const callingCode = document.createElement('span');
                callingCode.className = 'menu-item-description';
                callingCode.textContent = `+${getCountryCallingCode(code)}`;

                content.append(name, callingCode);
                element.append(flag, content);

                return element;
            };

            const divider = () => {
                const element = document.createElement('hr');
                element.className = 'menu-divider';
                return element;
            };

            const separator = preferred.length && others.length ? [divider()] : [];
            this.menu.replaceChildren(...preferred.map(item), ...separator, ...others.map(item));
        }

        // Shows the country on the picker and marks it in the list
        setCountry(code) {
            if (!code || !this.library.getCountries().includes(code)) {
                return;
            }

            this.country = code;

            if (!this.toggle) {
                return;
            }

            this.toggle.querySelector('[data-phone-flag]').className = flagClass(code);
            this.toggle.querySelector('[data-phone-dial-code]').textContent = `+${this.library.getCountryCallingCode(code)}`;

            for (const element of this.menu.querySelectorAll('.menu-item')) {
                const isSelected = element.dataset.bsValue === code;
                element.classList.toggle('selected', isSelected);
                element.setAttribute('aria-selected', isSelected ? 'true' : 'false');

                if (isSelected) {
                    this.toggle.querySelector('.combobox-value').textContent = element.querySelector('.menu-item-content > span').textContent;
                }
            }
        }

        markInvalid(isInvalid) {
            this.input.classList.toggle('is-invalid', isInvalid);

            if (isInvalid) {
                this.input.setAttribute('aria-invalid', 'true');
            }
            else {
                this.input.removeAttribute('aria-invalid');
            }
        }

        // Announces a changed posted value
        commit() {
            if (this.valueInput.value === this.committedValue) {
                return;
            }

            this.committedValue = this.valueInput.value;
            this.valueInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

function loadLibrary() {
    if (!libraryPromise) {
        libraryPromise = import('../../vendor/libphonenumber/libphonenumber.esm.js');
    }

    return libraryPromise;
}

function flagClass(code) {
    return 'flag-' + (FLAG_ALIASES[code] || code.toLowerCase());
}

// The browser's region, such as AU for en-AU
function browserRegion() {
    try {
        const locale = new Intl.Locale(navigator.language || 'en');

        return locale.region || locale.maximize().region || 'US';
    }
    catch (e) {
        return 'US';
    }
}

function regionNames() {
    let names = null;

    try {
        names = new Intl.DisplayNames([document.documentElement.lang || navigator.language || 'en', 'en'], { type: 'region' });
    }
    catch (e) {
    }

    return (code) => (names && names.of(code)) || code;
}

function readCountries(json) {
    if (!json) {
        return null;
    }

    try {
        const list = typeof json === 'string' ? JSON.parse(json) : json;

        return Array.isArray(list) ? list.map((code) => String(code).toUpperCase()) : null;
    }
    catch (e) {
        return null;
    }
}

// The leading plus and digits of typed text
function dialable(text) {
    return (/^\s*\+/.test(text) ? '+' : '') + text.replace(/\D/g, '');
}

function isDialable(char) {
    return char === '+' || (char >= '0' && char <= '9');
}

function findDialable(text, from, direction) {
    for (let i = from; i >= 0 && i < text.length; i += direction) {
        if (isDialable(text[i])) {
            return i;
        }
    }

    return -1;
}

// The position just after the given number of dialable characters
function positionAfter(text, count) {
    if (count <= 0) {
        return 0;
    }

    let seen = 0;
    for (let i = 0; i < text.length; i++) {
        if (isDialable(text[i]) && ++seen === count) {
            return i + 1;
        }
    }

    return text.length;
}
