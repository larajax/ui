import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { registerTab } from '../resources/assets/controls/tab/tab.js';

function parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value !== '' && !isNaN(Number(value))) return Number(value);
    return value;
}

// Reads data attributes like ControlBase, since happy-dom skips empty values when enumerating dataset
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
    const controls = new Map(),
        instances = new Map();

    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = readDataAttributes(element);
            this.listeners = [];
        }

        // Supports listen(event, handler), the only form the tab control uses
        listen(eventName, handler) {
            const callback = handler.bind(this);

            this.element.addEventListener(eventName, callback);
            this.listeners.push([this.element, eventName, callback]);
        }

        forgetAll() {
            this.listeners.forEach(([target, eventName, callback]) => target.removeEventListener(eventName, callback));
            this.listeners = [];
        }
    }

    return {
        controls,
        instances,
        ControlBase,
        turbo: false,
        visits: [],
        Events: {
            dispatch(eventName, { target = document, detail = {}, bubbles = true, cancelable = true } = {}) {
                const event = new CustomEvent(eventName, { detail, bubbles, cancelable });
                target.dispatchEvent(event);
                return event;
            }
        },
        registerControl(id, control) {
            controls.set(id, control);
        },
        fetchControl(element) {
            return instances.get(element) || null;
        },
        useTurbo() {
            return this.turbo;
        },
        visit(url, options) {
            this.visits.push([url, options]);
        }
    };
}

const TABS_MARKUP = `
    <ul class="nav nav-tabs">
        <li class="active"><a href="#one">One</a></li>
        <li><a href="#two">Two</a></li>
        <li data-tab-id="third"><a href="#three">Three</a></li>
    </ul>
    <div class="tab-content">
        <div class="tab-pane active">Pane one</div>
        <div class="tab-pane"><input id="field-two" /><span id="inside-two">Pane two</span></div>
        <div class="tab-pane">Pane three</div>
    </div>`;

let jax;

beforeAll(() => {
    jax = makeFakeJax();
    registerTab(jax);
});

afterEach(() => {
    jax.instances.forEach((control) => {
        control.disconnect();
        control.forgetAll();
    });
    jax.instances.clear();
    jax.turbo = false;
    jax.visits = [];
    document.body.innerHTML = '';
});

function connectControl(element) {
    const control = new (jax.controls.get('tab'))(element);
    control.init();
    control.connect();
    jax.instances.set(element, control);
    return control;
}

function connectTabs(attributes = '') {
    document.body.innerHTML = `<div class="control-tabs" data-control="tab" ${attributes}>${TABS_MARKUP}</div>`;

    const element = document.querySelector('[data-control~="tab"]'),
        control = connectControl(element);

    return {
        control,
        element,
        tabs: () => [...element.querySelectorAll(':scope > ul > li')],
        panes: () => [...element.querySelectorAll(':scope > .tab-content > .tab-pane')]
    };
}

function activeIndex(control) {
    return control.tabs().findIndex((li) => li.classList.contains('active'));
}

describe('tab setup', () => {
    test('sets up pane ids, targets and title wrappers', () => {
        const { tabs, panes } = connectTabs();
        const anchor = tabs()[0].querySelector('a');

        expect(panes()[0].id).toStartWith('tabs');
        expect(anchor.dataset.target).toBe('#' + panes()[0].id);
        expect(anchor.querySelector(':scope > span.title > span').textContent).toBe('One');
    });

    test('nested tab controls get distinct pane ids', () => {
        document.body.innerHTML = `<div class="control-tabs" data-control="tab" id="outer">
            <ul class="nav nav-tabs"><li class="active"><a href="#a">A</a></li></ul>
            <div class="tab-content"><div class="tab-pane active">
                <div class="control-tabs" data-control="tab" id="inner">${TABS_MARKUP}</div>
            </div></div>
        </div>`;

        const outer = connectControl(document.getElementById('outer')),
            inner = connectControl(document.getElementById('inner'));

        expect(outer.panes()[0].id).not.toBe(inner.panes()[0].id);
    });

    test('the nav scrolls with drag scroll, disposed on disconnect', () => {
        const { control, element } = connectTabs();

        expect(control.dragScroll.el).toBe(element.querySelector('ul.nav-tabs'));
        expect(control.dragScroll.scrollClassContainer).toBe(element);

        control.disconnect();
        expect(control.dragScroll).toBeNull();
    });
});

describe('tab shown', () => {
    beforeEach(() => {
        window.happyDOM.setURL('http://localhost/users/1/edit');
    });

    test('showing a tab dispatches the relayout signal and tab:shown', () => {
        const { tabs } = connectTabs();
        const counts = { render: 0, resize: 0 },
            shown = [],
            onRender = () => counts.render++,
            onResize = () => counts.resize++,
            onShown = (ev) => shown.push(ev.target.textContent.trim());

        addEventListener('render', onRender);
        addEventListener('resize', onResize);
        document.addEventListener('tab:shown', onShown);

        try {
            tabs()[1].querySelector('a').click();

            expect(counts.render).toBe(1);
            expect(counts.resize).toBe(1);
            expect(shown).toEqual(['Two']);
        }
        finally {
            removeEventListener('render', onRender);
            removeEventListener('resize', onResize);
            document.removeEventListener('tab:shown', onShown);
        }
    });

    test('data-tab-url replaces the address, through a Turbo swap when Turbo is on', () => {
        const { tabs } = connectTabs();
        tabs()[1].querySelector('a').dataset.tabUrl = '/mail/layouts';
        tabs()[2].querySelector('a').dataset.tabUrl = '/mail/partials';

        tabs()[1].querySelector('a').click();
        expect(location.pathname).toBe('/mail/layouts');
        expect(jax.visits).toEqual([]);

        jax.turbo = true;
        tabs()[2].querySelector('a').click();
        expect(jax.visits).toEqual([['/mail/partials', { action: 'swap', scroll: false }]]);
    });

    test('a linkable control reflects the tab hash, except when showing an invalid field', () => {
        const { control, tabs } = connectTabs('data-linkable');

        tabs()[2].querySelector('a').click();
        expect(location.hash).toBe('#three');

        expect(control.goToInvalidElement(document.getElementById('field-two'))).toBe(true);
        expect(tabs()[1].classList.contains('active')).toBe(true);
        expect(location.hash).toBe('#three');
    });
});

describe('tab navigation', () => {
    test('goTo, prev and next move by identifier and position', () => {
        const { control } = connectTabs();

        expect(control.goTo('third')).toBe(true);
        expect(activeIndex(control)).toBe(2);
        expect(control.goTo('missing')).toBe(false);

        control.prev();
        expect(activeIndex(control)).toBe(1);

        control.next();
        control.next();
        expect(activeIndex(control)).toBe(2);

        control.goToIndex(0);
        control.prev();
        expect(activeIndex(control)).toBe(0);
    });

    test('goToPane and goToElement show the pane containing an element', () => {
        const { control, panes } = connectTabs();

        expect(control.goToElement(document.getElementById('inside-two'))).toBe(true);
        expect(activeIndex(control)).toBe(1);

        expect(control.goToPane(panes()[2])).toBe(true);
        expect(activeIndex(control)).toBe(2);
        expect(control.findTabFromPane(panes()[2])).toBe(control.tabs()[2].querySelector('a'));
        expect(control.findPaneFromTab(control.tabs()[2])).toBe(panes()[2]);
    });
});
