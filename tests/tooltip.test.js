import { afterEach, describe, expect, test } from 'bun:test';
import { Tooltips, registerTooltip } from '../resources/assets/controls/tooltip/tooltip.js';

const disposables = [];

function makeTooltips() {
    const tooltips = new Tooltips();
    tooltips.listen();
    disposables.push(tooltips);
    return tooltips;
}

function makeButton(attributes = {}, parent = document.body) {
    const button = document.createElement('button');

    for (const [name, value] of Object.entries(attributes)) {
        button.setAttribute(name, value);
    }

    parent.appendChild(button);
    return button;
}

// Gives the element a layout box, since happy-dom does no layout.
function placeAt(element, rect) {
    element.getBoundingClientRect = () => ({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.left + rect.width,
        bottom: rect.top + rect.height
    });
}

function hover(element) {
    element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
}

function leave(element) {
    element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Returns the instance's tooltip while it shows, so instances registered by other test files never interfere.
function visibleTooltip(tooltips) {
    const tooltip = tooltips.tooltipElement;

    return tooltip && tooltip.isConnected && !tooltip.classList.contains('tooltip-hidden') && !tooltip.classList.contains('tooltip-invisible')
        ? tooltip
        : null;
}

afterEach(() => {
    disposables.splice(0).forEach((tooltips) => tooltips.dispose());
    document.body.replaceChildren();
});

describe('tooltip', () => {
    test('hovering an element shows its text and hotkeys after the delay', async () => {
        const tooltips = makeTooltips();
        const button = makeButton({ 'data-tooltip-text': 'Save', 'data-tooltip-hotkey': '⌃S, ⌘S' });

        hover(button);
        expect(visibleTooltip(tooltips)).toBeNull();

        await wait(350);

        const tooltip = visibleTooltip(tooltips);
        expect(tooltip).not.toBeNull();
        expect(tooltip.classList.contains('control-tooltip')).toBe(true);
        expect(tooltip.getAttribute('role')).toBe('tooltip');
        expect(tooltip.querySelector('.tooltip-text').textContent).toBe('Save');
        expect([...tooltip.querySelectorAll('.tooltip-hotkey i')].map((key) => key.textContent)).toEqual(['⌃S', '⌘S']);
    });

    test('the text is set as text, not markup', async () => {
        const tooltips = makeTooltips();
        const button = makeButton({ 'data-tooltip-text': '<b>Bold</b>' });

        hover(button);
        await wait(350);

        const text = visibleTooltip(tooltips).querySelector('.tooltip-text');
        expect(text.textContent).toBe('<b>Bold</b>');
        expect(text.querySelector('b')).toBeNull();
    });

    test('leaving the element hides the tooltip', async () => {
        const tooltips = makeTooltips();
        const button = makeButton({ 'data-tooltip-text': 'Save' });

        hover(button);
        await wait(350);
        expect(visibleTooltip(tooltips)).not.toBeNull();

        leave(button);
        expect(visibleTooltip(tooltips)).toBeNull();

        await wait(200);
        expect(tooltips.tooltipElement.classList.contains('tooltip-hidden')).toBe(true);
    });

    test('a key press before the delay cancels the tooltip', async () => {
        const tooltips = makeTooltips();
        const button = makeButton({ 'data-tooltip-text': 'Save' });

        hover(button);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
        await wait(350);

        expect(visibleTooltip(tooltips)).toBeNull();
    });

    test('elements without tooltip text show nothing', async () => {
        const tooltips = makeTooltips();
        const button = makeButton({ title: 'Plain title' });

        hover(button);
        await wait(350);

        expect(tooltips.tooltipElement).toBeNull();
    });

    test('the top position places the tooltip above the element, otherwise below', async () => {
        const tooltips = makeTooltips();
        const above = makeButton({ 'data-tooltip-text': 'Above', 'data-tooltip-position': 'top' });
        const below = makeButton({ 'data-tooltip-text': 'Below' });
        placeAt(above, { left: 100, top: 200, width: 80, height: 30 });
        placeAt(below, { left: 100, top: 200, width: 80, height: 30 });

        hover(above);
        await wait(350);
        expect(parseInt(visibleTooltip(tooltips).style.top)).toBeLessThan(200);

        leave(above);
        hover(below);
        await wait(350);
        expect(parseInt(visibleTooltip(tooltips).style.top)).toBeGreaterThanOrEqual(230);
    });

    test('an element inside a dialog mounts the tooltip in the dialog', async () => {
        const tooltips = makeTooltips();
        const dialog = document.createElement('dialog');
        document.body.appendChild(dialog);
        const button = makeButton({ 'data-tooltip-text': 'In a dialog' }, dialog);

        hover(button);
        await wait(350);

        expect(visibleTooltip(tooltips).parentNode).toBe(dialog);
    });

    test('an AJAX update removes the tooltip', async () => {
        const tooltips = makeTooltips();
        const button = makeButton({ 'data-tooltip-text': 'Save' });

        hover(button);
        await wait(350);
        expect(visibleTooltip(tooltips)).not.toBeNull();

        window.dispatchEvent(new Event('ajax:before-update'));
        expect(tooltips.tooltipElement).toBeNull();
        expect(button.isConnected).toBe(true);
    });

    test('registering adds the clear helper to the framework instance', () => {
        const jax = {};
        registerTooltip(jax);

        expect(typeof jax.tooltips.clear).toBe('function');
        expect(() => jax.tooltips.clear()).not.toThrow();
    });
});
