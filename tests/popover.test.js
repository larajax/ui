import { afterEach, describe, expect, test } from 'bun:test';
import { Popover, registerPopover } from '../resources/assets/controls/popover/popover.js';

const restores = [];

// Mirrors the framework's data attribute parsing, since happy-dom skips empty values when enumerating
function parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value !== '' && !isNaN(Number(value))) return Number(value);
    return value;
}

function readDataAttributes(element) {
    const config = {};

    for (const attr of element.attributes) {
        if (attr.name.startsWith('data-')) {
            const key = attr.name.slice(5).replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
            config[key] = parseValue(attr.value);
        }
    }

    return config;
}

function makeFakeJax() {
    const controls = new Map();

    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = readDataAttributes(element);
        }

        listen(eventName, handler) {
            this.element.addEventListener(eventName, handler.bind(this));
        }
    }

    return {
        controls,
        ControlBase,
        registerControl(id, control) {
            controls.set(id, control);
        }
    };
}

function findDescriptor(object, prop) {
    while (object) {
        const descriptor = Object.getOwnPropertyDescriptor(object, prop);
        if (descriptor) {
            return [object, descriptor];
        }
        object = Object.getPrototypeOf(object);
    }
}

function stubProperty(object, prop, value) {
    const original = Object.getOwnPropertyDescriptor(object, prop);
    Object.defineProperty(object, prop, { configurable: true, get: () => value });
    restores.push(() => original ? Object.defineProperty(object, prop, original) : delete object[prop]);
}

// Gives happy-dom a viewport, a trigger rectangle and a popover size so Popper has a layout to work with
function stubLayout(trigger, { viewport = [1024, 768], rect = [400, 300, 80, 30], size = [200, 100] } = {}) {
    stubProperty(document.documentElement, 'clientWidth', viewport[0]);
    stubProperty(document.documentElement, 'clientHeight', viewport[1]);

    const [left, top, width, height] = rect;
    trigger.getBoundingClientRect = () => ({
        x: left, y: top, left, top, width, height, right: left + width, bottom: top + height
    });

    [['offsetWidth', size[0]], ['offsetHeight', size[1]]].forEach(([prop, value]) => {
        const [owner, original] = findDescriptor(trigger, prop);
        Object.defineProperty(owner, prop, {
            configurable: true,
            get() {
                return this.classList && this.classList.contains('control-popover') ? value : original.get.call(this);
            }
        });
        restores.push(() => Object.defineProperty(owner, prop, original));
    });
}

function setUp(html = '<button id="trigger">Open</button>') {
    document.body.innerHTML = html;
    return document.getElementById('trigger');
}

function open(trigger, options = {}) {
    const popover = new Popover(trigger, Object.assign({ content: '<p>Hi</p>' }, options));
    popover.show();
    return popover;
}

// Outside click and Escape listeners bind on the next tick
const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
    Popover.hideActive();
    restores.splice(0).reverse().forEach((restore) => restore());
    document.body.innerHTML = '';
    document.body.className = '';
});

describe('popover placement', () => {
    test('defaults to below the trigger, offset along it and spaced by the arrow', () => {
        const trigger = setUp();
        stubLayout(trigger);

        const popover = open(trigger);

        expect(popover.element.classList.contains('placement-bottom')).toBe(true);
        expect(popover.popper.state.placement).toBe('bottom-start');
        expect(popover.element.style.left).toBe('415px');
        expect(popover.element.style.top).toBe('345px');
    });

    test('uses the preferred placement when it fits', () => {
        const trigger = setUp();
        stubLayout(trigger);

        for (const placement of ['top', 'left', 'right']) {
            const popover = open(trigger, { placement });

            expect(popover.element.classList.contains('placement-' + placement)).toBe(true);
            expect(popover.popper.state.placement).toBe(placement + '-start');
            popover.hide();
        }
    });

    test('tries top, bottom, left and right in turn when the preferred placement does not fit', () => {
        const trigger = setUp();
        stubLayout(trigger, { rect: [100, 20, 80, 30] });

        const popover = open(trigger, { placement: 'top' });

        expect(popover.element.classList.contains('placement-bottom')).toBe(true);
        expect(popover.element.classList.contains('placement-top')).toBe(false);
    });

    test('uses the fallback placement when nothing fits', () => {
        const trigger = setUp();
        stubLayout(trigger, { viewport: [250, 200], rect: [100, 80, 80, 30] });

        const popover = open(trigger, { placement: 'top', fallbackPlacement: 'left' });

        expect(popover.element.classList.contains('placement-left')).toBe(true);
        expect(popover.popper.state.placement).toBe('left-start');
    });

    test('an unknown placement falls back to bottom', () => {
        const trigger = setUp();
        stubLayout(trigger);

        const popover = open(trigger, { placement: 'sideways' });

        expect(popover.element.classList.contains('placement-bottom')).toBe(true);
    });

    test('offsetX overrides the offset for top and bottom placements', () => {
        const trigger = setUp();
        stubLayout(trigger);

        const popover = open(trigger, { offset: 40, offsetX: 0 });

        expect(popover.element.style.left).toBe('400px');
    });

    test('offsetY overrides the offset for left and right placements', () => {
        const trigger = setUp();
        stubLayout(trigger);

        const popover = open(trigger, { placement: 'right', offsetY: 5 });

        expect(popover.element.style.left).toBe('495px');
        expect(popover.element.style.top).toBe('305px');
    });

    test('center placement is fixed in the viewport without Popper', () => {
        const trigger = setUp();

        const popover = open(trigger, { placement: 'center' });

        expect(popover.popper).toBeNull();
        expect(popover.element.classList.contains('placement-center')).toBe(true);
        expect(popover.element.style.position).toBe('fixed');
    });

    test('the width option sets a fixed width', () => {
        const trigger = setUp();

        const popover = open(trigger, { width: 220 });

        expect(popover.element.style.width).toBe('220px');
    });
});

describe('popover events', () => {
    test('fires showing, show, hiding and hide on the trigger in order', () => {
        const trigger = setUp();
        const fired = [];

        ['popover:showing', 'popover:show', 'popover:hiding', 'popover:hide'].forEach((name) => {
            trigger.addEventListener(name, (ev) => fired.push([name, ev.detail.popover, ev.detail.relatedTarget]));
        });

        const popover = open(trigger);
        const element = popover.element;
        popover.hide();

        expect(fired.map((item) => item[0])).toEqual(['popover:showing', 'popover:show', 'popover:hiding', 'popover:hide']);
        expect(fired.every((item) => item[1] === popover)).toBe(true);
        expect(fired[1][2]).toBe(element);
        expect(fired[0][2]).toBe(trigger);
    });

    test('cancelling showing keeps the popover closed', () => {
        const trigger = setUp();
        trigger.addEventListener('popover:showing', (ev) => ev.preventDefault());

        const popover = open(trigger);

        expect(popover.element).toBeNull();
        expect(document.querySelector('.control-popover')).toBeNull();
        expect(Popover.activeInstance).toBeNull();
        expect(document.body.classList.contains('popover-open')).toBe(false);
    });

    test('cancelling hiding keeps the popover open', () => {
        const trigger = setUp();
        let allowHide = false;
        trigger.addEventListener('popover:hiding', (ev) => {
            if (!allowHide) {
                ev.preventDefault();
            }
        });

        const popover = open(trigger);
        popover.hide();

        expect(document.querySelector('.control-popover')).not.toBeNull();

        allowHide = true;
        popover.hide();

        expect(document.querySelector('.control-popover')).toBeNull();
    });

    test('dispatching popover:close inside the popover closes it', () => {
        const trigger = setUp();
        const popover = open(trigger, { content: '<p><span id="inner">Hi</span></p>' });

        document.getElementById('inner').dispatchEvent(new CustomEvent('popover:close', { bubbles: true }));

        expect(popover.element).toBeNull();
        expect(document.querySelector('.control-popover')).toBeNull();
    });

    test('clicking a data-dismiss element closes it', () => {
        const trigger = setUp();
        let closed = 0;
        const popover = open(trigger, {
            content: '<button type="button" data-dismiss="popover"><span id="icon">x</span></button>',
            onClose: () => closed++
        });

        document.getElementById('icon').click();

        expect(popover.element).toBeNull();
        expect(closed).toBe(1);
    });
});

describe('popover closing toggles', () => {
    test('Escape closes the popover', async () => {
        const trigger = setUp();
        const popover = open(trigger);
        await nextTick();

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        expect(popover.element).toBeNull();
    });

    test('Escape is cancelled so an enclosing dialog stays open', async () => {
        const trigger = setUp('<dialog open><button id="trigger">Open</button></dialog>');
        const popover = open(trigger);
        await nextTick();

        const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
        trigger.dispatchEvent(ev);

        expect(popover.element).toBeNull();
        expect(ev.defaultPrevented).toBe(true);
    });

    test('closeOnEsc false ignores Escape', async () => {
        const trigger = setUp();
        const popover = open(trigger, { closeOnEsc: false });
        await nextTick();

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        expect(popover.element).not.toBeNull();
    });

    test('a page click outside closes it, clicks inside or on the trigger do not', async () => {
        const trigger = setUp('<button id="trigger">Open</button><div id="outside"></div>');
        const popover = open(trigger, { content: '<p id="inside">Hi</p>' });
        await nextTick();

        document.getElementById('inside').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        trigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(popover.element).not.toBeNull();

        document.getElementById('outside').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(popover.element).toBeNull();
    });

    test('the opening interaction cannot close it', () => {
        const trigger = setUp('<button id="trigger">Open</button><div id="outside"></div>');
        const popover = open(trigger);

        document.getElementById('outside').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(popover.element).not.toBeNull();
    });

    test('closeOnPageClick false ignores page clicks', async () => {
        const trigger = setUp('<button id="trigger">Open</button><div id="outside"></div>');
        const popover = open(trigger, { closeOnPageClick: false });
        await nextTick();

        document.getElementById('outside').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(popover.element).not.toBeNull();
    });

    test('onCheckDocumentClickTarget can keep it open', async () => {
        const trigger = setUp('<button id="trigger">Open</button><div id="outside" class="keep"></div>');
        const popover = open(trigger, { onCheckDocumentClickTarget: (target) => target.classList.contains('keep') });
        await nextTick();

        document.getElementById('outside').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(popover.element).not.toBeNull();
    });

    test('opening a popover closes the active one', () => {
        const trigger = setUp('<button id="trigger">Open</button><button id="other">Other</button>');
        const first = open(trigger);
        const second = open(document.getElementById('other'));

        expect(first.element).toBeNull();
        expect(Popover.activeInstance).toBe(second);
        expect(document.querySelectorAll('.control-popover').length).toBe(1);
    });
});

describe('popover content', () => {
    test('a content function is called with the trigger as this and the popover as argument', () => {
        const trigger = setUp();
        let received = null;

        const popover = open(trigger, {
            content: function(instance) {
                received = instance;
                return '<p class="from-fn">' + this.id + '</p>';
            }
        });

        expect(received).toBe(popover);
        expect(popover.element.querySelector('.from-fn').textContent).toBe('trigger');
    });

    test('contentFrom copies the HTML of another element', () => {
        const trigger = setUp('<button id="trigger">Open</button><script type="text/template" id="tpl"><p class="from-tpl">Tpl</p></script>');

        const popover = open(trigger, { content: null, contentFrom: '#tpl' });

        expect(popover.element.querySelector('.from-tpl').textContent).toBe('Tpl');
    });

    test('without content it shows a loading state until setContent', () => {
        const trigger = setUp();
        const popover = open(trigger, { content: null });

        expect(popover.element.querySelector('.control-popover-loading')).not.toBeNull();

        popover.setContent('<p class="loaded">Done</p>');
        expect(popover.element.querySelector('.control-popover-loading')).toBeNull();
        expect(popover.element.querySelector('.loaded')).not.toBeNull();

        const node = document.createElement('em');
        popover.setContent(node);
        expect(popover.getContainer().querySelector('em')).toBe(node);
    });

    test('content sits in a wrapper inside the container', () => {
        const trigger = setUp();
        const popover = open(trigger);

        expect(popover.element.firstElementChild.tagName).toBe('DIV');
        expect(popover.element.firstElementChild.querySelector('p').textContent).toBe('Hi');
    });

    test('focuses an autofocus element', () => {
        const trigger = setUp();
        const popover = open(trigger, { content: '<input data-popover-autofocus />' });

        expect(document.activeElement).toBe(popover.element.querySelector('input'));
    });
});

describe('popover page state', () => {
    test('marks the body while open', () => {
        const trigger = setUp();
        const popover = open(trigger);

        expect(document.body.classList.contains('popover-open')).toBe(true);

        popover.hide();

        expect(document.body.classList.contains('popover-open')).toBe(false);
    });

    test('applies containerClass and extraClass', () => {
        const trigger = setUp();
        const popover = open(trigger, { containerClass: 'popover-danger wide', extraClass: 'my-popover' });

        expect([...popover.element.classList]).toEqual(expect.arrayContaining(['control-popover', 'popover-danger', 'wide', 'my-popover']));
    });

    test('accepts a container selector', () => {
        const trigger = setUp('<button id="trigger">Open</button><div id="holder"></div>');
        const popover = open(trigger, { container: '#holder' });

        expect(popover.element.parentElement.id).toBe('holder');
    });
});

describe('popover overlay', () => {
    test('a modal popover shows an overlay next to it and removes it on close', () => {
        const trigger = setUp('<dialog open><button id="trigger">Open</button></dialog>');
        const popover = open(trigger, { modal: true });
        const overlay = document.querySelector('.popover-overlay');

        expect(overlay.classList.contains('show')).toBe(true);
        expect(overlay.parentElement).toBe(popover.element.parentElement);
        expect(overlay.nextElementSibling).toBe(popover.element);

        popover.hide();

        expect(document.querySelector('.popover-overlay')).toBeNull();
    });

    test('a regular popover keeps its overlay hidden', () => {
        const trigger = setUp();
        open(trigger);

        expect(document.querySelector('.popover-overlay').classList.contains('show')).toBe(false);
    });

    test('clicking the overlay closes the popover', async () => {
        const trigger = setUp();
        const popover = open(trigger, { modal: true });
        await nextTick();

        document.querySelector('.popover-overlay').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(popover.element).toBeNull();
    });

    test('highlightModalTarget raises the trigger until closed', () => {
        const trigger = setUp();
        const popover = open(trigger, { modal: true, highlightModalTarget: true });

        expect(trigger.classList.contains('popover-highlight')).toBe(true);

        popover.hide();

        expect(trigger.classList.contains('popover-highlight')).toBe(false);
    });
});

describe('popover animation', () => {
    test('useAnimation fades and removes the popover once the transition ends', () => {
        const trigger = setUp();
        const hidden = [];
        trigger.addEventListener('popover:hide', () => hidden.push(true));

        const popover = open(trigger, { useAnimation: true });
        const element = popover.element;

        expect(element.classList.contains('fade')).toBe(true);
        expect(element.classList.contains('show')).toBe(true);

        popover.hide();

        expect(element.classList.contains('show')).toBe(false);
        expect(element.isConnected).toBe(true);
        expect(hidden.length).toBe(0);

        element.dispatchEvent(new Event('transitionend'));

        expect(element.isConnected).toBe(false);
        expect(hidden.length).toBe(1);
    });

    test('showing again while fading out replaces the old element', () => {
        const trigger = setUp();
        const popover = open(trigger, { useAnimation: true });
        const fading = popover.element;

        popover.hide();
        popover.show();

        expect(fading.isConnected).toBe(false);
        expect(document.querySelectorAll('.control-popover').length).toBe(1);
        expect(Popover.activeInstance).toBe(popover);
        expect(document.body.classList.contains('popover-open')).toBe(true);
    });

    test('a fading popover is still removed when no transition runs', async () => {
        const trigger = setUp();
        const popover = open(trigger, { useAnimation: true });
        const element = popover.element;

        popover.hide();
        await new Promise((resolve) => setTimeout(resolve, 400));

        expect(element.isConnected).toBe(false);
    });
});

describe('popover control', () => {
    function connect(html) {
        const jax = makeFakeJax();
        registerPopover(jax);
        document.body.innerHTML = html;

        const element = document.querySelector('[data-control="popover"]');
        const control = new (jax.controls.get('popover'))(element);
        control.init();
        control.connect();

        return { element, control };
    }

    test('toggles a popover configured from data attributes', () => {
        const { element, control } = connect(`
            <a href="#" data-control="popover" data-content-from="#tpl" data-placement="top" data-width="200" data-container-class="popover-danger">Open</a>
            <script type="text/template" id="tpl"><div class="popover-body"><input data-popover-autofocus /></div></script>
        `);
        stubLayout(element);

        element.click();

        const container = document.querySelector('.control-popover');
        expect(container.querySelector('.popover-body')).not.toBeNull();
        expect(container.classList.contains('placement-top')).toBe(true);
        expect(container.classList.contains('popover-danger')).toBe(true);
        expect(container.style.width).toBe('200px');
        expect(document.activeElement).toBe(container.querySelector('input'));

        element.click();

        expect(document.querySelector('.control-popover')).toBeNull();
        expect(control.popover.element).toBeNull();
    });

    test('takes inline content from data-content', () => {
        const { element } = connect('<a href="#" data-control="popover" data-content="I am a popover">Open</a>');

        element.click();

        expect(document.querySelector('.control-popover').textContent).toBe('I am a popover');
    });

    test('disconnecting closes the popover', () => {
        const { element, control } = connect('<a href="#" data-control="popover" data-content="Hi">Open</a>');

        element.click();
        control.disconnect();

        expect(document.querySelector('.control-popover')).toBeNull();
    });
});
