import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { registerPhone } from '../resources/assets/formwidgets/phone/phone.js';
import { makeFakeJax } from './support/fake-control-jax.js';

let jax;

beforeAll(() => {
    jax = makeFakeJax();
    registerPhone(jax);
});

afterEach(() => {
    jax.disconnectAll();
    document.body.innerHTML = '';
});

// Renders a phone field the way the phone form widget partial does, and waits for the phone number rules
async function mountPhone({ value = '', defaultCountry = 'AU', countries = null, preferred = null } = {}) {
    document.body.innerHTML = `
        <form>
            <div class="field-phone" data-control="phone-input" data-default-country="${defaultCountry}"
                ${countries ? `data-countries='${JSON.stringify(countries)}'` : ''}
                ${preferred ? `data-preferred-countries='${JSON.stringify(preferred)}'` : ''}>
                <div class="form-control form-adorn">
                    <button type="button" class="combobox-toggle phone-country" data-bs-toggle="combobox" aria-expanded="false" data-phone-country>
                        <span class="flag-${defaultCountry.toLowerCase()}" aria-hidden="true" data-phone-flag></span>
                        <span aria-hidden="true" data-phone-dial-code></span>
                        <span class="visually-hidden">Country:</span>
                        <span class="combobox-value visually-hidden">${defaultCountry}</span>
                    </button>
                    <div class="menu phone-countries" role="listbox" data-phone-countries></div>
                    <input type="tel" id="phone" value="${value}" class="form-ghost" data-phone-input />
                </div>
                <input type="hidden" name="phone" value="${value}" data-phone-value />
            </div>
        </form>
    `;

    jax.connectAll();

    const element = document.querySelector('[data-control="phone-input"]');
    const control = jax.fetchControl(element, 'phone-input');
    await control.ready;

    const changes = [];
    document.addEventListener('change', (ev) => changes.push(`${ev.target.type}:${ev.target.value}`));

    const toggle = element.querySelector('[data-phone-country]');
    const menu = element.querySelector('[data-phone-countries]');

    return {
        control,
        changes,
        toggle,
        menu,
        input: element.querySelector('[data-phone-input]'),
        posted: () => element.querySelector('[name=phone]').value,
        picked: () => menu.querySelector('.menu-item.selected')?.dataset.bsValue,
        shown: () => `${toggle.querySelector('[data-phone-flag]').className} ${toggle.querySelector('[data-phone-dial-code]').textContent}`,
        item: (code) => menu.querySelector(`[data-bs-value="${code}"]`)
    };
}

function type(input, text) {
    input.focus();
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    input.value = input.value.slice(0, start) + text + input.value.slice(end);
    input.setSelectionRange(start + text.length, start + text.length);
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function leave(input) {
    input.dispatchEvent(new Event('blur'));
}

// Picks a country the way Bootstrap's combobox does: it marks the item selected, then fires its change event on the toggle
function pick(toggle, menu, code) {
    for (const element of menu.querySelectorAll('.menu-item')) {
        element.classList.toggle('selected', element.dataset.bsValue === code);
    }

    toggle.dispatchEvent(new Event('change.bs.combobox', { bubbles: true }));
}

function pressInMenu(target, key) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    target.dispatchEvent(event);

    return event;
}

describe('phone input', () => {
    test('formats a national number as it is typed and posts it in the E.164 format', async () => {
        const { input, posted, shown } = await mountPhone();

        type(input, '0412345678');

        expect(input.value).toBe('0412 345 678');
        expect(posted()).toBe('+61412345678');
        expect(shown()).toBe('flag-au +61');
    });

    test('a number typed with a country code picks its country and shows nationally once left', async () => {
        const { input, posted, changes, picked, shown } = await mountPhone();

        type(input, '+442079460958');

        expect(input.value).toBe('+44 20 7946 0958');
        expect(picked()).toBe('GB');
        expect(shown()).toBe('flag-gb +44');

        leave(input);

        expect(input.value).toBe('020 7946 0958');
        expect(posted()).toBe('+442079460958');
        expect(changes).toEqual(['hidden:+442079460958']);
    });

    test('a stored number shows in the format of its own country without changing what posts', async () => {
        const { input, posted, changes, picked, toggle } = await mountPhone({ value: '+14155552671' });

        expect(input.value).toBe('(415) 555-2671');
        expect(picked()).toBe('US');
        expect(toggle.querySelector('.combobox-value').textContent).toBe('United States');

        input.focus();
        leave(input);

        expect(posted()).toBe('+14155552671');
        expect(changes).toEqual([]);
    });

    test('lists each country with its flag, name and calling code, the preferred ones first', async () => {
        const { menu, item, picked } = await mountPhone({ countries: ['NZ', 'GB', 'AU', 'US'], preferred: ['NZ', 'AU'] });
        const entries = [...menu.children].map((child) => child.tagName === 'HR' ? '---' : child.dataset.bsValue);

        expect(entries).toEqual(['NZ', 'AU', '---', 'GB', 'US']);
        expect(item('AU').querySelector('[class^="flag-"]').className).toBe('flag-au');
        expect(item('AU').querySelector('.menu-item-content > span').textContent).toBe('Australia');
        expect(item('AU').querySelector('.menu-item-description').textContent).toBe('+61');
        expect(item('AU').getAttribute('role')).toBe('option');
        expect(item('AU').getAttribute('aria-selected')).toBe('true');
        expect(picked()).toBe('AU');
    });

    test('a country without a flag of its own shows the flag it flies', async () => {
        const { item } = await mountPhone({ countries: ['AC', 'AU'] });

        expect(item('AC').querySelector('[class^="flag-"]').className).toBe('flag-sh');
    });

    test('the list keeps the country of a stored number even when it is not offered', async () => {
        const { menu, picked } = await mountPhone({ value: '+14155552671', countries: ['AU', 'NZ'] });

        expect([...menu.querySelectorAll('.menu-item')].map((element) => element.dataset.bsValue)).toEqual(['AU', 'NZ', 'US']);
        expect(picked()).toBe('US');
    });

    test('picking a country reads the digits typed so far as a number of that country', async () => {
        const { input, toggle, menu, posted, changes, shown } = await mountPhone();

        type(input, '2079460958');
        pick(toggle, menu, 'GB');

        expect(shown()).toBe('flag-gb +44');
        expect(input.value).toBe('020 7946 0958');
        expect(posted()).toBe('+442079460958');
        expect(changes).toContain('hidden:+442079460958');
    });

    test('typing in the open list moves to the first country whose name starts with the text, spaces included', async () => {
        const { menu, item } = await mountPhone({ countries: ['AE', 'GB', 'US', 'AU'] });
        item('AU').focus();

        for (const key of ['u', 'n', 'i', 't', 'e', 'd']) {
            pressInMenu(document.activeElement, key);
        }
        expect(document.activeElement).toBe(item('AE'));

        const space = pressInMenu(document.activeElement, ' ');
        expect(space.defaultPrevented).toBe(true);

        pressInMenu(document.activeElement, 'k');
        expect(document.activeElement).toBe(item('GB'));
        expect(menu.contains(document.activeElement)).toBe(true);
    });

    test('a space that does not continue a typed name is left to pick the focused country', async () => {
        const { item } = await mountPhone();
        item('AU').focus();

        expect(pressInMenu(item('AU'), ' ').defaultPrevented).toBe(false);
    });

    test('a number that cannot be valid is marked when left, and typing clears the mark', async () => {
        const { input, posted } = await mountPhone();

        type(input, '123');
        leave(input);

        expect(input.classList.contains('is-invalid')).toBe(true);
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(posted()).toBe('123');

        type(input, '4');
        expect(input.classList.contains('is-invalid')).toBe(false);
        expect(input.hasAttribute('aria-invalid')).toBe(false);
    });

    test('backspace after a space deletes the digit before it and keeps the caret there', async () => {
        const { input } = await mountPhone({ value: '+61412345678' });

        input.focus();
        input.setSelectionRange(5, 5);
        const event = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true });
        input.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(input.value.replace(/\D/g, '')).toBe('041345678');
        expect(input.value.slice(0, input.selectionStart).replace(/\D/g, '')).toBe('041');
    });

    test('a digit typed in the middle keeps the caret beside it', async () => {
        const { input } = await mountPhone();

        type(input, '041345678');
        input.setSelectionRange(3, 3);
        type(input, '2');

        expect(input.value).toBe('0412 345 678');
        expect(input.selectionStart).toBe(4);
    });

    test('setValue shows a number and announces it, and getValue reads the posted value', async () => {
        const { input, control, changes, shown } = await mountPhone();

        control.setValue('+6493030275');

        expect(input.value).toBe('09 303 0275');
        expect(shown()).toBe('flag-nz +64');
        expect(control.getValue()).toBe('+6493030275');
        expect(changes).toEqual(['hidden:+6493030275']);
    });

    test('a press on the field around the input puts the cursor in it', async () => {
        const { input } = await mountPhone();

        document.querySelector('.form-adorn').dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(document.activeElement).toBe(input);
    });
});

describe('phone link', () => {
    test('shows the default country nationally and other countries internationally', async () => {
        document.body.innerHTML = `
            <a href="tel:+61412345678" data-control="phone-input" data-phone-value="+61412345678" data-default-country="AU">+61412345678</a>
            <a href="tel:+442079460958" data-control="phone-input" data-phone-value="+442079460958" data-default-country="AU">+442079460958</a>
        `;
        jax.connectAll();

        const links = [...document.querySelectorAll('a')];
        await Promise.all(links.map((link) => jax.fetchControl(link, 'phone-input').ready));

        expect(links.map((link) => link.textContent)).toEqual(['0412 345 678', '+44 20 7946 0958']);
    });
});
