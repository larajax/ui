import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { registerLoadIndicator } from '../resources/assets/controls/load-indicator/load-indicator.js';

beforeAll(() => {
    registerLoadIndicator();
});

afterEach(() => {
    document.body.innerHTML = '';
});

// Fires a request event the way the framework does, on the element that sent the request
function fire(element, name) {
    element.dispatchEvent(new CustomEvent(name, { bubbles: true }));
}

// Renders a pagination link inside its loading indicator container, as the list pagination partial does
function mountLink(attributes = 'data-load-indicator="Loading..."') {
    document.body.innerHTML = `
        <nav class="list-pagination-links loading-indicator-container size-small">
            <a href="javascript:;" class="page-link" data-request="list::onPaginate" ${attributes}>Next</a>
        </nav>
    `;

    return {
        container: document.querySelector('nav'),
        link: document.querySelector('a')
    };
}

describe('load indicator data attributes', () => {
    test('a request from an element with data-load-indicator shows its text in the closest container', () => {
        const { container, link } = mountLink();

        fire(link, 'ajax:promise');

        const indicator = container.querySelector('.loading-indicator');
        expect(indicator).not.toBeNull();
        expect(indicator.querySelector('div').textContent).toBe('Loading...');
        expect(indicator.querySelector('span')).not.toBeNull();
        expect(container.classList.contains('in-progress')).toBe(true);
    });

    test('the indicator goes once the request is done or has failed', () => {
        for (const end of ['ajax:done', 'ajax:fail']) {
            const { container, link } = mountLink();

            fire(link, 'ajax:promise');
            fire(link, end);

            expect(container.querySelector('.loading-indicator')).toBeNull();
            expect(container.classList.contains('in-progress')).toBe(false);
        }
    });

    test('the opaque, centered and size attributes set the indicator options', () => {
        const { container, link } = mountLink('data-load-indicator data-load-indicator-opaque data-load-indicator-centered data-load-indicator-size="small"');

        fire(link, 'ajax:promise');

        const indicator = container.querySelector('.loading-indicator');
        expect([...indicator.classList]).toEqual(['loading-indicator', 'is-opaque', 'indicator-center', 'size-small']);
        expect(indicator.querySelector('div').textContent).toBe('');
    });

    test('elements without the attribute, or without a container, show nothing', () => {
        const { container, link } = mountLink('');
        fire(link, 'ajax:promise');
        expect(container.querySelector('.loading-indicator')).toBeNull();

        document.body.innerHTML = '<a href="javascript:;" data-load-indicator="Loading...">Next</a>';
        fire(document.querySelector('a'), 'ajax:promise');
        expect(document.querySelector('.loading-indicator')).toBeNull();
    });
});
