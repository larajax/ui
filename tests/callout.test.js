import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { registerCallout } from '../resources/assets/elements/callout/callout.js';

beforeAll(() => {
    registerCallout();
});

afterEach(() => {
    document.body.innerHTML = '';
});

function makeCallout(buttonAttributes = '') {
    document.body.innerHTML = `
        <div class="callout callout-warning" id="notice">
            <button type="button" class="btn-close" data-dismiss="callout" ${buttonAttributes}></button>
            <div class="header"><h3>Notice</h3></div>
        </div>
        <div class="callout callout-info" id="other"></div>`;

    return document.querySelector('[data-dismiss="callout"]');
}

describe('callout dismiss', () => {
    test('removes the callout containing the button', () => {
        makeCallout().click();

        expect(document.getElementById('notice')).toBeNull();
        expect(document.getElementById('other')).not.toBeNull();
    });

    test('closes the callout named by data-target', () => {
        makeCallout('data-target="#other"').click();

        expect(document.getElementById('other')).toBeNull();
        expect(document.getElementById('notice')).not.toBeNull();
    });

    test('dispatches callout:close and callout:closed', () => {
        const button = makeCallout();
        const callout = document.getElementById('notice');
        const events = [];
        callout.addEventListener('callout:close', () => events.push('close'));
        callout.addEventListener('callout:closed', () => events.push('closed'));

        button.click();

        expect(events).toEqual(['close', 'closed']);
    });

    test('cancelling callout:close keeps the callout', () => {
        const button = makeCallout();
        document.getElementById('notice').addEventListener('callout:close', (ev) => ev.preventDefault());

        button.click();

        expect(document.getElementById('notice')).not.toBeNull();
    });
});
