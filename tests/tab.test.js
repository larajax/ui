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

        // Supports listen(event, handler), listen(event, selector, handler) and listen(event, element, handler)
        listen(eventName, targetOrHandler, handler) {
            let target = this.element,
                callback;

            if (typeof targetOrHandler === 'string') {
                callback = (ev) => {
                    const match = ev.target.closest && ev.target.closest(targetOrHandler);
                    if (match && this.element.contains(match)) {
                        handler.call(this, ev);
                    }
                };
            }
            else if (targetOrHandler instanceof Element) {
                target = targetOrHandler;
                callback = handler.bind(this);
            }
            else {
                callback = targetOrHandler.bind(this);
            }

            target.addEventListener(eventName, callback);
            this.listeners.push([target, eventName, callback]);
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
    test('sets up pane ids, targets, title wrappers and close buttons', () => {
        const { element, tabs, panes } = connectTabs();
        const anchor = tabs()[0].querySelector('a');

        expect(panes()[0].id).toStartWith('tabs');
        expect(anchor.dataset.target).toBe('#' + panes()[0].id);
        expect(anchor.querySelector(':scope > span.title > span').textContent).toBe('One');
        expect(tabs().every((li) => li.querySelector(':scope > span.tab-close'))).toBe(true);
        expect(element.classList.contains('has-tabs')).toBe(true);
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

    test('a closable config sets the closable attribute', () => {
        document.body.innerHTML = `<div class="control-tabs" data-control="tab">${TABS_MARKUP}</div>`;
        const element = document.querySelector('.control-tabs');
        const control = new (jax.controls.get('tab'))(element);

        control.config.closable = true;
        control.init();

        expect(element.hasAttribute('data-closable')).toBe(true);
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

    test('identifiers and titles can be updated', () => {
        const { control, tabs } = connectTabs();

        control.updateIdentifier(tabs()[0], 'first');
        expect(control.findByIdentifier('first')).toBe(tabs()[0]);

        control.updateTitle(tabs()[0], 'Renamed');
        expect(tabs()[0].querySelector('span.title').textContent).toBe('Renamed');
    });
});

describe('dynamic tabs', () => {
    test('addTab adds an active tab with its identifier, classes and scripts', () => {
        const evaluation = window.happyDOM.settings.enableJavaScriptEvaluation;
        window.happyDOM.settings.enableJavaScriptEvaluation = true;

        try {
            const { control, tabs, panes } = connectTabs('data-pane-classes="pane-padded" data-title-as-file-names="true" data-max-title-symbols="6"');

            control.addTab('folder/file.txt', '<p>Hello</p><script>window.tabScriptRan = true;</script>', 'new-tab', 'custom-tab extra');

            const li = tabs()[3],
                anchor = li.querySelector('a'),
                pane = panes()[3];

            expect(li.dataset.tabId).toBe('new-tab');
            expect(li.classList.contains('active')).toBe(true);
            expect(pane.classList.contains('active')).toBe(true);
            expect(pane.classList.contains('pane-padded')).toBe(true);
            expect(anchor.classList.contains('custom-tab')).toBe(true);
            expect(anchor.classList.contains('extra')).toBe(true);
            expect(anchor.getAttribute('title')).toBe('folder/file.txt');
            expect(anchor.textContent).toBe('...le.txt');
            expect(anchor.dataset.target).toBe('#' + pane.id);
            expect(pane.querySelector('p').textContent).toBe('Hello');
            expect(window.tabScriptRan).toBe(true);
        }
        finally {
            window.happyDOM.settings.enableJavaScriptEvaluation = evaluation;
            delete window.tabScriptRan;
        }
    });

    test('updateTab replaces the title and content', () => {
        const { control, tabs, panes } = connectTabs();

        control.updateTab(tabs()[1], 'Second', '<p>Updated</p>');

        expect(tabs()[1].querySelector('span.title > span').textContent).toBe('Second');
        expect(panes()[1].textContent).toBe('Updated');
    });
});

describe('closable tabs', () => {
    test('the close button closes its tab and shows the previous one', () => {
        const { element, tabs, panes } = connectTabs('data-closable');
        const events = [];

        element.addEventListener('tab:before-close', (ev) => events.push(['before-close', ev.detail.relatedTarget]));
        element.addEventListener('tab:closed', (ev) => events.push(['closed', ev.detail.tab]));

        tabs()[1].querySelector('a').click();
        const closedTab = tabs()[1],
            closedPane = panes()[1];

        closedTab.querySelector('span.tab-close').click();

        expect(tabs().length).toBe(2);
        expect(closedTab.isConnected).toBe(false);
        expect(closedPane.isConnected).toBe(false);
        expect(tabs()[0].classList.contains('active')).toBe(true);
        expect(events).toEqual([['before-close', closedPane], ['closed', closedTab]]);
    });

    test('closing the first active tab shows the new first tab', () => {
        const { control, tabs } = connectTabs('data-closable');

        control.closeTab(tabs()[0]);

        expect(tabs()[0].querySelector('a').textContent.trim()).toBe('Two');
        expect(tabs()[0].classList.contains('active')).toBe(true);
    });

    test('tab:before-close can cancel closing', () => {
        const { element, tabs } = connectTabs('data-closable');

        element.addEventListener('tab:before-close', (ev) => ev.preventDefault());
        tabs()[2].querySelector('span.tab-close').click();

        expect(tabs().length).toBe(3);
    });

    test('a modified tab asks for confirmation unless forced', () => {
        const { control, tabs } = connectTabs('data-closable data-close-confirmation="Discard changes?"');
        const originalConfirm = window.confirm,
            asked = [];

        window.confirm = (message) => {
            asked.push(message);
            return false;
        };

        try {
            control.modifyTab(tabs()[2]);
            expect(tabs()[2].hasAttribute('data-modified')).toBe(true);
            expect(control.panes()[2].hasAttribute('data-modified')).toBe(true);

            control.closeTab(tabs()[2]);
            expect(asked).toEqual(['Discard changes?']);
            expect(tabs().length).toBe(3);

            jax.Events.dispatch('tab:close', { target: tabs()[2], detail: { force: true } });
            expect(asked.length).toBe(1);
            expect(tabs().length).toBe(2);
        }
        finally {
            window.confirm = originalConfirm;
        }
    });

    test('tab events from inside a pane act on its tab', () => {
        const { tabs, panes } = connectTabs('data-closable');
        const inside = document.getElementById('inside-two');

        jax.Events.dispatch('tab:modified', { target: inside });
        expect(tabs()[1].hasAttribute('data-modified')).toBe(true);

        jax.Events.dispatch('tab:unmodified', { target: inside });
        expect(tabs()[1].hasAttribute('data-modified')).toBe(false);
        expect(panes()[1].hasAttribute('data-modified')).toBe(false);

        jax.Events.dispatch('tab:close', { target: inside });
        expect(tabs().map((li) => li.querySelector('a').textContent.trim())).toEqual(['One', 'Three']);
    });

    test('a middle click closes a tab with an identifier', () => {
        const { tabs } = connectTabs('data-closable');

        tabs()[2].querySelector('a').dispatchEvent(new MouseEvent('mousedown', { button: 1, bubbles: true }));
        expect(tabs().length).toBe(2);

        tabs()[1].querySelector('a').dispatchEvent(new MouseEvent('mousedown', { button: 1, bubbles: true }));
        expect(tabs().length).toBe(2);
    });

    test('closing every tab dispatches tab:after-all-closed and drops has-tabs', () => {
        const { control, element } = connectTabs('data-closable');
        let allClosed = 0;

        element.addEventListener('tab:after-all-closed', () => allClosed++);

        control.closeTab();
        control.closeTab();
        control.closeTab();

        expect(control.tabs().length).toBe(0);
        expect(allClosed).toBe(1);
        expect(element.classList.contains('has-tabs')).toBe(false);
    });

    test('a nested tab control closes its own tabs only', () => {
        document.body.innerHTML = `<div class="control-tabs" data-control="tab" data-closable id="outer">
            <ul class="nav nav-tabs"><li class="active"><a href="#a">A</a></li><li><a href="#b">B</a></li></ul>
            <div class="tab-content"><div class="tab-pane active">
                <div class="control-tabs" data-control="tab" data-closable id="inner">${TABS_MARKUP}</div>
            </div><div class="tab-pane">B</div></div>
        </div>`;

        const outer = connectControl(document.getElementById('outer')),
            inner = connectControl(document.getElementById('inner'));

        jax.Events.dispatch('tab:close', { target: document.getElementById('inside-two') });
        inner.tabs()[0].querySelector('span.tab-close').click();

        expect(inner.tabs().map((li) => li.querySelector('a').textContent.trim())).toEqual(['Three']);
        expect(outer.tabs().length).toBe(2);
    });
});
