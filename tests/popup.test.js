import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { Popup, registerPopup } from '../resources/assets/controls/popup/popup.js';

function makeFakeJax() {
    class ControlBase {
        constructor(element) {
            this.element = element;
        }

        listen(eventName, handler) {
            this.element.addEventListener(eventName, handler.bind(this));
        }
    }

    return {
        controls: new Map(),
        requests: [],
        ControlBase,
        registerControl(id, control) {
            this.controls.set(id, control);
        },
        request(element, handler, options) {
            this.requests.push({ element, handler, options });
        },
        parseJSON(value) {
            return JSON.parse(value.replace(/([\w]+)\s*:/g, '"$1":'));
        },
        Events: {
            dispatch(name, { target = document, detail = {} } = {}) {
                target.dispatchEvent(new CustomEvent(name, { bubbles: true, cancelable: true, detail }));
            }
        }
    };
}

// A request context whose default actions resolve, like larajax's decorated promises
function makeContext() {
    const resolved = () => {
        const promise = Promise.resolve();
        promise.done = (fn) => { promise.then(fn); return promise; };
        return promise;
    };

    return { success: resolved, error: resolved };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// Escape reaches a modal dialog as a cancelable cancel event
function pressEscape(dialog) {
    const ev = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(ev);
    return ev;
}

// happy-dom lays nothing out, so the dialog box is empty and any point beside it is the backdrop
function clickBackdrop(dialog) {
    dialog.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 5, clientY: 5 }));
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 5, clientY: 5 }));
}

let jax;

beforeAll(() => {
    // happy-dom runs no scripts by default; the inline script test needs them
    window.happyDOM.settings.enableJavaScriptEvaluation = true;

    jax = makeFakeJax();
    registerPopup(jax);
});

afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.classList.remove('dialog-open');
    jax.requests = [];
});

describe('popup content', () => {
    test('opens supplied content in a modal dialog and registers the instance on its first div', () => {
        const popup = Popup.open({ content: '<div class="dialog-body" id="body">Hello</div>' });

        expect(popup.container.tagName).toBe('DIALOG');
        expect(popup.container.isConnected).toBe(true);
        expect(popup.container.open).toBe(true);
        expect([...popup.container.classList]).toEqual(expect.arrayContaining(['control-popup', 'dialog', 'show']));
        expect(document.documentElement.classList.contains('dialog-open')).toBe(true);
        expect(popup.content.textContent).toContain('Hello');
        expect(Popup.getInstance(document.getElementById('body'))).toBe(popup);
        expect(Popup.getInstance(popup.container)).toBe(popup);
    });

    test('takes its size from the content, mapped onto the Bootstrap dialog size', () => {
        const popup = Popup.open({ content: '<div data-popup-size="large">Sized</div>' });

        expect(popup.dialog.classList.contains('size-large')).toBe(true);
        expect(popup.dialog.classList.contains('dialog-lg')).toBe(true);
    });

    test('a content size replaces the size from the options', () => {
        const popup = Popup.open({ size: 'giant', content: '<div data-popup-size="tiny">Sized</div>' });

        expect(popup.dialog.classList.contains('dialog-sm')).toBe(true);
        expect(popup.dialog.classList.contains('size-tiny')).toBe(true);
        expect(popup.dialog.classList.contains('dialog-xl')).toBe(false);
        expect(popup.dialog.classList.contains('size-giant')).toBe(false);
    });

    test('a pixel size sets the dialog width', () => {
        const popup = Popup.open({ size: 650, content: '<div>Wide</div>' });

        expect(popup.dialog.classList.contains('size-650')).toBe(true);
        expect(popup.dialog.style.getPropertyValue('--bs-dialog-width')).toBe('650px');
    });

    test('passes keyboard and size options from data attributes', () => {
        document.body.innerHTML = '<a id="link" data-control="popup" data-keyboard="false" data-size="small"></a>';
        const popup = Popup.fromElement(document.getElementById('link'), { content: '<div>Hi</div>' });

        expect(popup.options.keyboard).toBe(false);
        expect(popup.container.getAttribute('closedby')).toBe('none');
        expect(popup.dialog.classList.contains('size-small')).toBe(true);
    });

    test('runs inline scripts in the loaded content', () => {
        window.popupScriptRan = false;
        Popup.open({ content: '<div><script>window.popupScriptRan = true;</script></div>' });

        expect(window.popupScriptRan).toBe(true);
    });
});

describe('popup closing', () => {
    test('a data-dismiss element closes and removes the popup', () => {
        const popup = Popup.open({ content: '<div><button id="close" data-dismiss="popup">Close</button></div>' });
        const container = popup.container;

        document.getElementById('close').click();

        expect(container.open).toBe(false);
        expect(container.isConnected).toBe(false);
        expect(Popup.getInstance(container)).toBe(null);
        expect(document.documentElement.classList.contains('dialog-open')).toBe(false);
    });

    test('popup:close dispatched from inside the content closes it', () => {
        const popup = Popup.open({ content: '<div><span id="inner">Inner</span></div>' });
        const container = popup.container;

        document.getElementById('inner').dispatchEvent(new CustomEvent('popup:close', { bubbles: true }));

        expect(container.isConnected).toBe(false);
    });

    test('a locked popup does not hide', () => {
        const popup = Popup.open({ content: '<div>Locked</div>' });
        popup.lock(true);
        popup.hide();

        expect(popup.container.isConnected).toBe(true);
        expect(popup.container.open).toBe(true);
    });

    test('dispatches the show, shown, hide and hidden events on the trigger element', () => {
        document.body.innerHTML = '<a id="link"></a>';
        const link = document.getElementById('link');
        const events = [];
        ['popup:show', 'popup:shown', 'popup:hide', 'popup:hidden'].forEach((name) => link.addEventListener(name, () => events.push(name)));

        const popup = Popup.fromElement(link, { content: '<div>Hi</div>' });
        popup.hide();

        expect(events).toEqual(['popup:show', 'popup:shown', 'popup:hide', 'popup:hide', 'popup:hidden']);
        expect(Popup.getInstance(link)).toBe(null);
    });

    test('popup:shown also reaches the first content div', () => {
        const targets = [];
        const onShown = (ev) => targets.push(ev.target.id);
        document.addEventListener('popup:shown', onShown);

        Popup.open({ content: '<div id="first">Hi</div>' });
        document.removeEventListener('popup:shown', onShown);

        expect(targets).toContain('first');
    });

    test('Escape cancels the native close and hides the popup', () => {
        const popup = Popup.open({ content: '<div>Hi</div>' });
        const container = popup.container;

        const ev = pressEscape(container);

        expect(ev.defaultPrevented).toBe(true);
        expect(container.isConnected).toBe(false);
    });

    test('Escape leaves a popup without keyboard closing open', () => {
        const popup = Popup.open({ keyboard: false, content: '<div>Hi</div>' });

        const ev = pressEscape(popup.container);

        expect(ev.defaultPrevented).toBe(true);
        expect(popup.container.open).toBe(true);
    });

    test('a backdrop click leaves the popup open by default', () => {
        const popup = Popup.open({ content: '<div>Hi</div>' });

        clickBackdrop(popup.container);

        expect(popup.container.open).toBe(true);
    });

    test('a backdrop click closes the popup when the backdrop option allows it', () => {
        const popup = Popup.open({ backdrop: true, content: '<div>Hi</div>' });
        const container = popup.container;

        clickBackdrop(container);

        expect(container.isConnected).toBe(false);
    });

    test('a click that starts inside the popup is not a backdrop click', () => {
        const popup = Popup.open({ backdrop: true, content: '<div id="inner">Hi</div>' });

        document.getElementById('inner').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        popup.container.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 5, clientY: 5 }));

        expect(popup.container.open).toBe(true);
    });

    test('a dialog the browser closes on its own closes the popup', () => {
        document.body.innerHTML = '<a id="link"></a>';
        const link = document.getElementById('link');
        let hidden = false;
        link.addEventListener('popup:hidden', () => { hidden = true; });

        const popup = Popup.fromElement(link, { content: '<div>Hi</div>' });
        const container = popup.container;
        container.close();

        expect(hidden).toBe(true);
        expect(container.isConnected).toBe(false);
    });

    test('visible(false) closes the dialog without destroying the popup', () => {
        const popup = Popup.open({ content: '<div>Hi</div>' });

        popup.visible(false);

        expect(popup.container.open).toBe(false);
        expect(popup.container.isConnected).toBe(true);
        expect(popup.isOpen).toBe(true);

        popup.visible(true);

        expect(popup.container.open).toBe(true);
        expect(popup.container.classList.contains('show')).toBe(true);
    });
});

describe('popup handler requests', () => {
    test('requests the handler from the trigger with the extra data, then shows the result', async () => {
        document.body.innerHTML = '<a id="link" data-handler="onLoadForm" data-extra-data="file_id: 5"></a>';
        const link = document.getElementById('link');

        const popup = Popup.fromElement(link);
        const request = jax.requests[0];

        expect(request.element).toBe(link);
        expect(request.handler).toBe('onLoadForm');
        expect(request.options.data).toEqual({ file_id: 5 });

        request.options.success.call(makeContext(), { result: '<div id="loaded">Loaded</div>' }, 200, null);
        await flush();

        expect(popup.content.querySelector('#loaded')).not.toBe(null);
        expect(popup.container.open).toBe(true);
    });

    test('a loading backdrop covers the page until the content arrives', async () => {
        document.body.innerHTML = '<a id="link" data-handler="onLoadForm"></a>';
        const popup = Popup.fromElement(document.getElementById('link'));

        const backdrop = document.querySelector('.popup-backdrop');
        expect(backdrop.parentElement).toBe(document.body);
        expect(backdrop.classList.contains('popup-backdrop-clear')).toBe(false);
        expect(backdrop.querySelector('.popup-loading-indicator')).not.toBe(null);
        expect(popup.container.isConnected).toBe(false);

        jax.requests[0].options.success.call(makeContext(), { result: '<div>Loaded</div>' }, 200, null);
        await flush();

        expect(document.querySelector('.popup-backdrop')).toBe(null);
        expect(popup.container.open).toBe(true);
    });

    test('a popup loading from inside another popup puts its backdrop in that dialog', () => {
        const outer = Popup.open({ content: '<div><a id="inner-trigger" data-handler="onLoadInner"></a></div>' });

        Popup.fromElement(document.getElementById('inner-trigger'));

        expect(outer.container.querySelector(':scope > .popup-backdrop')).not.toBe(null);
    });

    test('a load indicator request hides the popup while it runs', () => {
        const popup = Popup.open({ content: '<div><button id="save" data-request="onSave" data-popup-load-indicator>Save</button></div>' });
        const button = document.getElementById('save');

        button.dispatchEvent(new CustomEvent('ajax:promise', { bubbles: true, detail: { context: { handler: 'onSave' } } }));
        expect(popup.container.classList.contains('show')).toBe(false);
        expect(popup.container.querySelector('.popup-backdrop.popup-backdrop-clear')).not.toBe(null);

        button.dispatchEvent(new CustomEvent('ajax:fail', { bubbles: true, detail: { context: { handler: 'onSave' } } }));
        expect(popup.container.classList.contains('show')).toBe(true);
        expect(popup.content.classList.contains('popup-shaking')).toBe(true);
    });
});

describe('popup stacker', () => {
    test('pushes the earlier popup back when another opens over it', () => {
        const first = Popup.open({ content: '<div>First</div>' });
        Popup.open({ content: '<div>Second</div>' });

        expect(first.container.style.transform).toContain('scale(.9)');
        expect(jax.popupStacker.getFirstPopup().textContent).toContain('Second');
    });

    test('leaves the stacking order to the top layer', () => {
        const first = Popup.open({ content: '<div>First</div>' });
        const second = Popup.open({ content: '<div>Second</div>' });

        expect(first.container.style.zIndex).toBe('');
        expect(second.container.style.zIndex).toBe('');
    });

    test('pulls the earlier popup forward when the top one closes', () => {
        const first = Popup.open({ content: '<div>First</div>' });
        const second = Popup.open({ content: '<div>Second</div>' });

        second.hide();

        expect(first.content.style.transform).toBe('');
        expect(jax.popupStacker.getFirstPopup()).toBe(first.container);
    });
});

describe('popup bindToPopups', () => {
    test('passes the variables on to popups opened inside a bound popup', () => {
        document.body.innerHTML = '<div id="container"><a id="outer-trigger"></a></div>';
        Popup.bindToPopups('#container', { file_id: 7 });

        const outer = Popup.fromElement(document.getElementById('outer-trigger'), {
            content: '<div><form id="outer-form"><a id="inner-trigger"></a></form></div>'
        });

        expect(outer.container.querySelectorAll('#outer-form input[name="file_id"]')).toHaveLength(1);
        expect(outer.container.querySelector('#outer-form input[name="file_id"]').value).toBe('7');

        const inner = Popup.fromElement(outer.container.querySelector('#inner-trigger'), {
            content: '<div><form id="inner-form"></form></div>'
        });

        expect(inner.container.querySelectorAll('#inner-form input[name="file_id"]')).toHaveLength(1);
        expect(outer.container.querySelectorAll('#outer-form input[name="file_id"]')).toHaveLength(1);
    });
});
