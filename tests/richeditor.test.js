import { afterEach, beforeAll, describe, expect, mock, test } from 'bun:test';
import { readFileSync } from 'fs';
import { defaultLang } from '../packages/richarea/src/lang.js';
import { defaultIcons } from '../packages/richarea/src/icons.js';

const mounted = [];

class FakeRichArea {
    constructor(element, options) {
        this.element = element;
        this.options = options;
        this.listeners = {};
        this.destroyed = false;
        mounted.push(this);
    }

    on(name, callback) {
        this.listeners[name] = callback;
        return this;
    }

    destroy() {
        this.destroyed = true;
    }
}

mock.module('../resources/assets/vendor/richarea/richarea.js', () => ({
    RichArea: FakeRichArea,
    defaultOptions: {
        content: '',
        placeholder: '',
        readOnly: false,
        useLineBreaks: false,
        toolbarButtons: [],
        buttons: {},
        hooks: {},
        icons: {},
        lang: {},
        paragraphStyles: {},
        imageResize: true
    }
}));

const { registerRichEditor } = await import('../resources/assets/formwidgets/richeditor/richeditor.js');
const { richEditor } = await import('../resources/assets/formwidgets/richeditor/richeditor-api.js');

function parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    const first = value.charAt(0);
    if (first === '{' || first === '[') return JSON.parse(value);
    return value;
}

function makeFakeJax() {
    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = {};

            for (const attr of element.attributes) {
                if (attr.name.startsWith('data-')) {
                    const key = attr.name.slice(5).replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
                    this.config[key] = parseValue(attr.value);
                }
            }
        }

        proxy(handler) {
            return handler.bind(this);
        }
    }

    return {
        controls: new Map(),
        requests: [],
        respond: null,
        ControlBase,
        registerControl(id, control) {
            this.controls.set(id, control);
        },
        request(element, handler, options) {
            this.requests.push({ element, handler, options });
            return this.respond ? this.respond(options) : new Promise(() => {});
        }
    };
}

let jax;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeAll(() => {
    jax = makeFakeJax();
    registerRichEditor(jax);
});

afterEach(() => {
    document.body.innerHTML = '';
    mounted.length = 0;
    richEditor.buttons = {};
    richEditor.hooks = {};
    jax.requests.length = 0;
    jax.respond = null;
});

async function connect(html) {
    document.body.innerHTML = html;
    const element = document.querySelector('[data-control="richeditor"]');
    const control = new (jax.controls.get('richeditor'))(element);
    control.init();
    control.connect();
    await flush();
    return { element, control };
}

const field = (attributes = '') => `
    <div class="field-richeditor size-large" data-control="richeditor" ${attributes}>
        <textarea data-richeditor-textarea name="content" placeholder="Write something" style="display: none">&lt;p&gt;Hello&lt;/p&gt;</textarea>
    </div>
`;

describe('rich editor control', () => {
    test('mounts the editor with the field value and the default toolbar', async () => {
        const { element, control } = await connect(field());

        expect(mounted.length).toBe(1);
        expect(control.richArea).toBe(mounted[0]);
        expect(mounted[0].element).toBe(element);
        expect(mounted[0].options).toMatchObject({
            content: '<p>Hello</p>',
            placeholder: 'Write something',
            readOnly: false,
            useLineBreaks: false,
            toolbarButtons: richEditor.defaultButtons
        });
    });

    test('passes the field configuration through', async () => {
        await connect(field('data-toolbar-buttons="bold,italic,|,html" data-read-only="true" data-use-line-breaks="true"'));

        expect(mounted[0].options).toMatchObject({
            readOnly: true,
            useLineBreaks: true,
            toolbarButtons: ['bold', 'italic', '|', 'html']
        });
    });

    test('accepts known editor options and ignores reserved or unknown ones', async () => {
        await connect(field(`data-editor-options='{"paragraphStyles":{"lead":"Lead"},"imageResize":false,"content":"<p>Nope</p>","hooks":{},"unknownThing":1}'`));

        const options = mounted[0].options;
        expect(options.paragraphStyles).toEqual({ lead: 'Lead' });
        expect(options.imageResize).toBe(false);
        expect(options.content).toBe('<p>Hello</p>');
        expect(options.hooks).toBe(richEditor.hooks);
        expect('unknownThing' in options).toBe(false);
    });

    test('ignores an empty editor options list', async () => {
        await connect(field(`data-editor-options='[]'`));

        expect(mounted[0].options.content).toBe('<p>Hello</p>');
    });

    test('shares the page buttons and hooks with the editor', async () => {
        const uploadFile = async () => '/storage/file.jpg';
        richEditor.registerButton('insertThing', { label: 'Thing', toolbar: 'end' });
        richEditor.hooks.uploadFile = uploadFile;

        await connect(field());

        const options = mounted[0].options;
        expect(options.buttons.insertThing.label).toBe('Thing');
        expect(options.hooks.uploadFile).toBe(uploadFile);
        expect(options.toolbarButtons[options.toolbarButtons.length - 1]).toBe('insertThing');
    });

    test('writes changes to the textarea and announces them', async () => {
        const { element } = await connect(field());
        const textarea = element.querySelector('textarea');
        const events = [];
        element.addEventListener('change', (ev) => events.push(ev.target));

        mounted[0].listeners.change('<p>Changed</p>');

        expect(textarea.value).toBe('<p>Changed</p>');
        expect(events).toEqual([textarea]);
    });

    test('destroys the editor on disconnect', async () => {
        const { control } = await connect(field());

        control.disconnect();

        expect(mounted[0].destroyed).toBe(true);
        expect(control.richArea).toBeNull();
    });

    test('skips mounting when the field left the page before the editor loaded', async () => {
        document.body.innerHTML = field();
        const element = document.querySelector('[data-control="richeditor"]');
        const control = new (jax.controls.get('richeditor'))(element);
        control.init();
        control.connect();
        control.disconnect();
        await flush();

        expect(mounted.length).toBe(0);
    });
});

describe('rich editor icons and strings', () => {
    test('passes the field icons and strings, editor options taking precedence', async () => {
        await connect(field(`data-icons='{"bold":"bi bi-type-bold","italic":"bi bi-type-italic"}' data-lang='{"bold":"Gras","italic":"Italique"}' data-editor-options='{"icons":{"italic":"my-italic"},"lang":{"italic":"Penché"}}'`));

        const options = mounted[0].options;
        expect(options.icons).toEqual({ bold: 'bi bi-type-bold', italic: 'my-italic' });
        expect(options.lang).toEqual({ bold: 'Gras', italic: 'Penché' });
    });

    test('ignores empty icon and string lists', async () => {
        await connect(field(`data-icons='[]' data-lang='[]'`));

        expect(mounted[0].options.icons).toEqual({});
        expect(mounted[0].options.lang).toEqual({});
    });

    test('lists the same strings and icons as the editor defaults', () => {
        const php = readFileSync(new URL('../src/FormWidgets/RichEditor.php', import.meta.url), 'utf8');
        const block = (start) => php.slice(php.indexOf(start), php.indexOf('];', php.indexOf(start)));

        const strings = {};
        for (const match of block('$strings = [').matchAll(/'(\w+)' => '((?:[^'\\]|\\.)*)'/g)) {
            strings[match[1]] = match[2].replace(/\\(.)/g, '$1');
        }
        expect(strings).toEqual(defaultLang);

        const names = Array.from(block('$names = [').matchAll(/'(\w+)'/g), (match) => match[1]);
        expect(names).toEqual(Object.keys(defaultIcons));

        ['Phosphor', 'Bootstrap', 'October'].forEach((pack) => {
            const source = readFileSync(new URL('../src/Classes/Icons/' + pack + 'IconPack.php', import.meta.url), 'utf8');
            const icons = {};

            for (const match of source.matchAll(/'richeditor\.(\w+)' => '([^']+)'/g)) {
                icons[match[1]] = match[2];
            }

            expect(Object.keys(icons)).toEqual(names);

            if (pack === 'Phosphor') {
                expect(icons).toEqual(defaultIcons);
            }
        });
    });
});

describe('rich editor built-in upload', () => {
    test('posts uploads to the field handler when the page sets no upload hook', async () => {
        jax.respond = () => Promise.resolve({ url: '/storage/uploads/richeditor/abc.png' });
        const { element } = await connect(field('data-upload-handler="formNotes::onUploadFile"'));

        const hooks = mounted[0].options.hooks;
        expect(hooks).not.toBe(richEditor.hooks);

        const file = new File(['x'], 'photo.png', { type: 'image/png' });
        const url = await hooks.uploadFile(file, { type: 'image' });

        expect(url).toBe('/storage/uploads/richeditor/abc.png');
        expect(jax.requests.length).toBe(1);

        const { element: requestElement, handler, options } = jax.requests[0];
        expect(requestElement).toBe(element);
        expect(handler).toBe('formNotes::onUploadFile');
        expect(options.files).toBe(true);
        expect(options.data.file_data).toBe(file);
        expect(options.data.file_type).toBe('image');
        expect(typeof options.handleErrorMessage).toBe('function');
    });

    test('marks uploads for file links', async () => {
        jax.respond = () => Promise.resolve({ url: '/storage/uploads/richeditor/abc.pdf' });
        await connect(field('data-upload-handler="formNotes::onUploadFile"'));

        await mounted[0].options.hooks.uploadFile(new File(['x'], 'notes.pdf'), { type: 'file' });

        expect(jax.requests[0].options.data.file_type).toBe('file');
    });

    test('rejects with the server message when the upload fails', async () => {
        jax.respond = () => Promise.reject({ $env: { getMessage: () => 'The file field must be a file of type: jpg.' } });
        await connect(field('data-upload-handler="formNotes::onUploadFile"'));

        const upload = mounted[0].options.hooks.uploadFile(new File(['x'], 'page.html'), { type: 'image' });

        await expect(upload).rejects.toThrow('The file field must be a file of type: jpg.');
    });

    test('leaves out server error pages from the failure message', async () => {
        jax.respond = () => Promise.reject('<!DOCTYPE html><html>Server Error</html>');
        await connect(field('data-upload-handler="formNotes::onUploadFile"'));

        const upload = mounted[0].options.hooks.uploadFile(new File(['x'], 'photo.png'), { type: 'image' });

        await expect(upload).rejects.toThrow(/^$/);
    });

    test('prefers the page upload hook', async () => {
        const uploadFile = async () => '/media/photo.png';
        richEditor.hooks.uploadFile = uploadFile;

        await connect(field('data-upload-handler="formNotes::onUploadFile"'));

        expect(mounted[0].options.hooks).toBe(richEditor.hooks);
        expect(mounted[0].options.hooks.uploadFile).toBe(uploadFile);
    });

    test('keeps the page hooks without an upload handler', async () => {
        await connect(field());

        expect(mounted[0].options.hooks).toBe(richEditor.hooks);
        expect(mounted[0].options.hooks.uploadFile).toBeUndefined();
    });
});

describe('rich editor api', () => {
    test('uses field buttons verbatim', () => {
        richEditor.registerButton('insertThing', { toolbar: 'end' });

        expect(richEditor.resolveButtons({ fieldButtons: 'bold, italic' })).toEqual(['bold', 'italic']);
    });

    test('places registered buttons in the default list', () => {
        richEditor.registerButton('first', { toolbar: 'start' });
        richEditor.registerButton('afterBold', { toolbar: { after: 'bold' }, separator: 'both' });
        richEditor.registerButton('unplaced', {});

        const buttons = richEditor.resolveButtons();

        expect(buttons[0]).toBe('first');
        expect(buttons.slice(buttons.indexOf('bold'), buttons.indexOf('bold') + 4)).toEqual(['bold', '|', 'afterBold', '|']);
        expect(buttons).not.toContain('unplaced');
        expect(richEditor.defaultButtons).not.toContain('first');
    });
});
