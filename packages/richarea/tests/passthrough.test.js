import { afterEach, describe, expect, test } from 'bun:test';
import { RichArea } from '../src/richarea.js';

/*
 * HTML kept without the editor's tools, configured like the backend's editor settings defaults
 */

const SETTINGS = {
    allowTags: 'a, abbr, address, article, aside, b, blockquote, br, button, cite, code, dd, del, details, div, dl, dt, em, '
        + 'figure, footer, form, h1, h2, h3, h4, h5, h6, header, hr, i, iframe, img, input, ins, kbd, label, li, main, mark, nav, '
        + 'ol, p, pre, q, section, select, small, span, strong, sub, summary, sup, table, tbody, td, th, thead, time, tr, u, ul',
    allowAttrs: '',
    allowEmptyTags: 'textarea, a, i, iframe, object, video, style, script, .icon, .bi, .fa',
    noWrapTags: 'figure, script, style',
    removeTags: 'script, style'
};

const editors = [];

function roundTrip(content, options = SETTINGS) {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const richArea = new RichArea(element, { ...options, content });
    editors.push(richArea);

    return richArea.getContent();
}

afterEach(() => {
    editors.splice(0).forEach((richArea) => richArea.destroy());
    document.body.innerHTML = '';
});

describe('html passthrough', () => {
    test('is off unless tags are allowed', () => {
        expect(roundTrip('<div class="row"><p>Text</p></div>', {})).toBe('<p>Text</p>');
    });

    test('keeps containers around blocks with their attributes', () => {
        const html = '<section class="hero" data-id="5"><div class="row"><p>Text</p></div></section>';

        expect(roundTrip(html)).toBe(html);
    });

    test('keeps text directly inside a container, without adding a paragraph', () => {
        const html = '<div class="lead">Hello <strong>there</strong></div>';

        expect(roundTrip(html)).toBe(html);
    });

    test('keeps inline elements and attributes the editor has no tools for', () => {
        const html = '<p>Press <kbd>Ctrl</kbd>, <abbr title="HyperText">HTML</abbr> and <span class="hint" data-tip="x">this</span></p>';

        expect(roundTrip(html)).toBe(html);
    });

    test('keeps empty icon elements', () => {
        const html = '<p><i class="icon-star"></i> Rated</p>';

        expect(roundTrip(html)).toBe(html);
    });

    test('keeps forms whole', () => {
        const html = '<form action="/search"><input name="q"><button type="submit">Go</button></form>';

        expect(roundTrip(html)).toBe(html);
    });

    test('removes listed tags with what they hold', () => {
        expect(roundTrip('<p>Text</p><script>alert(1)</script><style>p { color: red; }</style>')).toBe('<p>Text</p>');
    });

    test('keeps other attributes of the elements the editor has tools for', () => {
        const html = roundTrip('<p style="margin-top: 2em; text-align: center" data-note="1">Text</p><a href="/x" data-track="nav">Link</a>');

        expect(html).toContain('data-note="1"');
        expect(html).toContain('margin-top: 2em');
        expect(html.match(/text-align/g)).toHaveLength(1);
        expect(html).toContain('data-track="nav"');
    });

    // Event handler attributes are any starting with "on", a made up one here since the simulated DOM compiles real ones
    test('keeps only the allowed attributes when they are listed, and never event handlers', () => {
        const html = roundTrip('<div class="box" title="Box" data-x="1">Text</div>', { ...SETTINGS, allowAttrs: 'class, data-*' });

        expect(html).toBe('<div class="box" data-x="1">Text</div>');
        expect(roundTrip('<div onmadeup="alert(1)">Text</div>')).toBe('<div>Text</div>');
    });

    test('leaves snippets to the snippet nodes and keeps extra image attributes', () => {
        const html = roundTrip('<figure data-snippet="weather" data-name="Weather"></figure><p><img src="/a.jpg" style="float: left" data-id="3"></p>');

        expect(html).toContain('<figure data-snippet="weather"');
        expect(html).toContain('data-id="3"');
        expect(html).toContain('float: left');
    });

    test('keeps allowed html edited in the source view', () => {
        const element = document.createElement('div');
        document.body.appendChild(element);
        const richArea = new RichArea(element, { ...SETTINGS, content: '<p>Text</p>' });
        editors.push(richArea);

        richArea.sourceView.activate();
        richArea.sourceView.adapter.setValue('<div class="card"><p>Edited</p></div>');
        richArea.sourceView.deactivate();

        expect(richArea.getContent()).toBe('<div class="card"><p>Edited</p></div>');
    });

    test('still drops tags that are not allowed', () => {
        expect(roundTrip('<article><p>Text</p></article>', { ...SETTINGS, allowTags: 'p, div' })).toBe('<p>Text</p>');
    });
});
