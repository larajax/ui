import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { registerInputHotkey } from '../resources/assets/controls/input-hotkey/hotkey-control.js';
import { makeFakeJax } from './support/fake-control-jax.js';

let jax;

beforeAll(() => {
    jax = makeFakeJax();
    jax.Events = {
        on: (target, eventName, handler) => target.addEventListener(eventName, handler),
        off: (target, eventName, handler) => target.removeEventListener(eventName, handler)
    };
    registerInputHotkey(jax);
});

afterEach(() => {
    jax.disconnectAll();
    document.body.innerHTML = '';
});

// Gives an element a layout size, since happy-dom lays nothing out
function setSize(element, size) {
    Object.defineProperty(element, 'offsetWidth', { configurable: true, value: size });
    Object.defineProperty(element, 'offsetHeight', { configurable: true, value: size });
}

// Renders a menu item with a hotkey inside a closed menu, returning a count of its clicks
function mountMenuItem({ toggleShown = true, itemClass = 'menu-item' } = {}) {
    document.body.innerHTML = `
        <div class="btn-group">
            <button id="toggle" data-bs-toggle="menu">Actions</button>
            <div class="menu">
                <a id="item" class="${itemClass}" href="javascript:;" data-control="input-hotkey" data-hotkey="shift+x">Export</a>
            </div>
        </div>
    `;

    setSize(document.getElementById('toggle'), toggleShown ? 20 : 0);

    let clicks = 0;
    document.getElementById('item').addEventListener('click', () => clicks++);

    jax.connectAll();

    return () => clicks;
}

function pressShiftX() {
    document.documentElement.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 88, which: 88, shiftKey: true, bubbles: true }));
}

describe('hotkeys on menu items', () => {
    test('an item in a closed menu clicks while its toggle is shown', () => {
        const clicks = mountMenuItem();
        pressShiftX();
        expect(clicks()).toBe(1);
    });

    test('an item in a closed menu waits while its toggle is hidden', () => {
        const clicks = mountMenuItem({ toggleShown: false });
        pressShiftX();
        expect(clicks()).toBe(0);
    });

    test('a disabled item does not click', () => {
        const clicks = mountMenuItem({ itemClass: 'menu-item control-disabled' });
        pressShiftX();
        expect(clicks()).toBe(0);
    });
});
