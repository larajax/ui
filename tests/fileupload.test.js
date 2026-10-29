import { afterEach, beforeAll, describe, expect, mock, test } from 'bun:test';
import { fakeSortableModule, sortables, resetFakeSortable } from './support/fake-sortable.js';

const dropzones = [];
const requests = [];

// Stands in for Dropzone: emitting addedfile builds the preview from the template first, as Dropzone does
class FakeDropzone {
    constructor(element, options) {
        this.element = element;
        this.options = options;
        this.files = [];
        this.handlers = {};
        this.removed = [];
        this.calls = [];
        dropzones.push(this);
    }

    on(name, handler) {
        (this.handlers[name] = this.handlers[name] || []).push(handler);
    }

    emit(name, ...args) {
        if (name === 'addedfile') {
            const holder = document.createElement('div');
            holder.innerHTML = this.options.previewTemplate.trim();
            args[0].previewElement = holder.firstElementChild;
            args[0].previewElement.querySelector('[data-dz-name]').textContent = args[0].name;
            this.options.previewsContainer.appendChild(args[0].previewElement);
        }

        (this.handlers[name] || []).forEach((handler) => handler(...args));
    }

    removeFile(file) {
        this.removed.push(file);
        file.previewElement.remove();
    }

    removeAllFiles() { this.calls.push('removeAllFiles'); }
    _updateMaxFilesReachedClass() { this.calls.push('updateMaxFiles'); }
    destroy() { this.calls.push('destroy'); }
}

mock.module('../resources/assets/vendor/dropzone/dropzone.esm.js', () => ({ Dropzone: FakeDropzone }));
mock.module('../resources/assets/vendor/sortablejs/sortable.esm.js', () => fakeSortableModule);

const { registerFileUpload } = await import('../resources/assets/formwidgets/fileupload/fileupload.js');

function parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value !== '' && !isNaN(Number(value))) return Number(value);
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

        listen(eventName, selector, handler) {
            this.element.addEventListener(eventName, (ev) => {
                if (ev.target.closest(selector)) {
                    handler.call(this, ev);
                }
            });
        }
    }

    return {
        controls: new Map(),
        ControlBase,
        registerControl(id, control) {
            this.controls.set(id, control);
        },
        request(element, handler, options) {
            let resolve;
            const promise = new Promise((r) => { resolve = r; });
            requests.push({ element, handler, options, resolve: (data) => { resolve(data); options.complete && options.complete(); } });
            return promise;
        }
    };
}

let jax;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeAll(() => {
    jax = makeFakeJax();
    registerFileUpload(jax);
});

afterEach(() => {
    document.body.innerHTML = '';
    document.head.querySelectorAll('meta[name="csrf-token"]').forEach((meta) => meta.remove());
    dropzones.length = 0;
    resetFakeSortable();
    requests.length = 0;
});

const MESSAGES = { fileTooBig: 'Too big!', removeFile: 'Drop it' };

const field = ({ classes = 'is-multi is-sortable', attributes = '', files = '' } = {}) => `
    <form>
        <input type="text" name="title" value="Report">
        <div data-field-name="files">
            <div id="Form-files" class="field-fileupload ${classes}" data-control="fileupload"
                data-upload-handler="formFiles::onUpload" data-template="#files-template"
                data-error-template="#files-error-template" data-error-icon="ph ph-warning-circle"
                data-sort-handler="formFiles::onSortAttachments" data-max-filesize="10"
                data-messages='${JSON.stringify(MESSAGES)}' ${attributes}>
                <input type="hidden" name="files" value="">
                <div class="uploader-control-toolbar">
                    <a href="javascript:;" class="toolbar-upload-button"><span class="button-label">Upload</span></a>
                    <button type="button" class="toolbar-delete-selected" data-request-confirm="Are you sure?"
                        data-request="formFiles::onRemoveAttachment" disabled>
                        <span class="button-label">Delete Selected <span></span></span>
                    </button>
                </div>
                <div class="upload-files-container">${files}</div>
            </div>
        </div>
    </form>
    <script type="text/template" id="files-template">
        <div class="upload-object dz-preview">
            <div class="upload-checkbox"><input class="check check-sm" type="checkbox" data-record-selector></div>
            <div class="file-data-container"><div class="file-data-container-inner">
                <div class="icon-container"></div>
                <span data-dz-name></span><p class="size" data-dz-size></p>
                <p class="description" data-description></p>
                <div class="meta"><span data-dz-errormessage></span></div>
            </div></div>
        </div>
    </script>
    <script type="text/template" id="files-error-template">
        <p>{{errorMsg}}</p>
        <button type="button" data-dismiss="popover">Close</button>
        <button type="button" data-remove-file>Remove File</button>
    </script>
`;

const serverFile = (id, name) => `<div class="server-file" data-id="${id}" data-path="/storage/${name}"
    data-thumb="/storage/thumb-${name}" data-name="${name}" data-description="About ${name}" data-size="2048"
    data-accepted="true"></div>`;

async function connect(options) {
    document.body.innerHTML = field(options);
    const element = document.querySelector('[data-control="fileupload"]');
    const control = new (jax.controls.get('fileupload'))(element);
    control.init();
    control.connect();
    await flush();
    return { element, control, dropzone: dropzones[dropzones.length - 1] };
}

function addUpload(dropzone, name, size = 512) {
    const file = { name, size };
    dropzone.emit('addedfile', file);
    return file;
}

describe('file upload', () => {
    test('binds Dropzone to the field with its options and messages', async () => {
        const meta = document.createElement('meta');
        meta.name = 'csrf-token';
        meta.content = 'token-123';
        document.head.appendChild(meta);

        const { element, dropzone } = await connect({ attributes: 'data-file-types=".jpg,.png" data-max-files="3"' });

        expect(dropzone.element).toBe(element);
        expect(dropzone.options).toMatchObject({
            paramName: 'file_data',
            clickable: element.querySelector('.toolbar-upload-button'),
            previewsContainer: element.querySelector('.upload-files-container'),
            hiddenInputContainer: element,
            maxFilesize: 10,
            maxFiles: 3,
            acceptedFiles: '.jpg,.png',
            headers: { 'X-CSRF-TOKEN': 'token-123' },
            dictFileTooBig: 'Too big!',
            dictRemoveFile: 'Drop it',
            dictMaxFilesExceeded: 'You can not upload any more files.'
        });
        expect(dropzone.options.previewTemplate).toContain('upload-object');
    });

    test('sends the XSRF-TOKEN cookie as larajax does when the page has no token meta tag', async () => {
        document.cookie = 'XSRF-TOKEN=abc%3D123';

        try {
            const { dropzone } = await connect();

            expect(dropzone.options.headers).toEqual({ 'X-XSRF-TOKEN': 'abc=123' });
        }
        finally {
            document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    });

    test('a server error page shows its status code instead of the page', async () => {
        const { dropzone } = await connect();
        const file = addUpload(dropzone, 'photo.jpg');
        const message = file.previewElement.querySelector('[data-dz-errormessage]');
        message.textContent = '<!DOCTYPE html><title>Page Expired</title>';

        dropzone.emit('error', file, message.textContent, { status: 419 });
        expect(message.textContent).toBe('Server responded with 419 code.');

        message.textContent = 'File is too big.';
        dropzone.emit('error', file, 'File is too big.', { status: 400 });
        expect(message.textContent).toBe('File is too big.');
    });

    test('a single file field takes one file', async () => {
        const { dropzone } = await connect({ classes: '' });

        expect(dropzone.options.maxFiles).toBe(1);
    });

    test('shows the files already on the server', async () => {
        const { element, control, dropzone } = await connect({ files: serverFile(7, 'report.pdf') + serverFile(8, 'notes.txt') });
        const objects = element.querySelectorAll('.upload-object');

        expect(objects.length).toBe(2);
        expect(objects[0].classList.contains('is-success')).toBe(true);
        expect(objects[0].dataset.id).toBe('7');
        expect(objects[0].dataset.path).toBe('/storage/report.pdf');
        expect(objects[0].querySelector('[data-description]').textContent).toBe('About report.pdf');
        expect(objects[0].querySelector('[data-dz-size]').textContent).toBe('2.00 KB');
        expect(element.querySelector('.server-file')).toBeNull();
        expect(element.classList.contains('is-populated')).toBe(true);
        expect(dropzone.files.length).toBe(2);
        expect(dropzone.calls).toContain('updateMaxFiles');
        expect(control.pendingCount).toBe(0);
    });

    test('sends the form fields, extra data and handler with each upload', async () => {
        const { dropzone } = await connect({ attributes: `data-extra-data='{"folder":"docs"}'` });
        const file = addUpload(dropzone, 'photo.jpg');
        const formData = new FormData();
        const headers = {};

        dropzone.emit('sending', file, { setRequestHeader: (name, value) => { headers[name] = value; } }, formData);

        expect(formData.get('folder')).toBe('docs');
        expect(formData.get('title')).toBe('Report');
        expect(formData.has('files')).toBe(true);
        expect(headers['X-AJAX-HANDLER']).toBe('formFiles::onUpload');
    });

    test('a finished upload is marked, announced and sorted', async () => {
        const { element, dropzone } = await connect({ files: serverFile(7, 'report.pdf') });
        const changes = [];
        element.closest('[data-field-name]').addEventListener('change', () => changes.push(true));

        const file = addUpload(dropzone, 'photo.jpg');
        dropzone.emit('success', file, { id: 9, path: '/storage/photo.jpg', thumb: '/storage/thumb.jpg' });

        expect(file.previewElement.classList.contains('is-success')).toBe(true);
        expect(file.previewElement.dataset.id).toBe('9');
        expect(changes).toEqual([true]);
        expect(requests).toEqual([]);

        dropzone.emit('complete', file);

        expect(requests.length).toBe(1);
        expect(requests[0].handler).toBe('formFiles::onSortAttachments');
        expect(requests[0].options.data).toEqual({ sortOrder: { 7: 1, 9: 2 } });
    });

    test('a sort while another is running goes out once it finishes', async () => {
        const { control } = await connect({ files: serverFile(7, 'report.pdf') });

        control.onSortAttachments();
        control.onSortAttachments();
        expect(requests.length).toBe(1);

        requests[0].resolve({});
        expect(requests.length).toBe(2);
    });

    test('a single file field replaces its file', async () => {
        const { dropzone } = await connect({ classes: '', files: serverFile(7, 'report.pdf') });
        const first = dropzone.files[0];

        addUpload(dropzone, 'photo.jpg');

        expect(dropzone.removed).toEqual([first]);
    });

    test('a failed upload is marked with the error icon', async () => {
        const { dropzone } = await connect();
        const file = addUpload(dropzone, 'huge.zip');

        dropzone.emit('error', file, 'Too big!');

        expect(file.previewElement.classList.contains('is-error')).toBe(true);
        expect(file.previewElement.querySelector('.icon-container .error-icon').className).toBe('ph ph-warning-circle error-icon');
    });

    test('checking files enables delete with a count', async () => {
        const { element } = await connect({ files: serverFile(7, 'a.pdf') + serverFile(8, 'b.pdf') });
        const checkbox = element.querySelector('input[data-record-selector]');
        const button = element.querySelector('.toolbar-delete-selected');

        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));

        expect(checkbox.closest('.upload-object').classList.contains('selected')).toBe(true);
        expect(button.disabled).toBe(false);
        expect(button.querySelector('.button-label > span').textContent).toBe('(1)');
    });

    test('delete selected confirms once, then removes each file on the server', async () => {
        const { element, dropzone } = await connect({ files: serverFile(7, 'a.pdf') + serverFile(8, 'b.pdf') + serverFile(9, 'c.pdf') });
        const confirmations = [];
        const onConfirm = (ev) => {
            ev.preventDefault();
            confirmations.push(ev.detail.message);
            ev.detail.promise.resolve();
        };
        window.addEventListener('ajax:confirm-message', onConfirm);

        try {
            const checkboxes = element.querySelectorAll('input[data-record-selector]');
            checkboxes[0].checked = true;
            checkboxes[2].checked = true;
            element.querySelector('.toolbar-delete-selected').disabled = false;
            element.querySelector('.toolbar-delete-selected').click();
            await flush();

            expect(confirmations).toEqual(['Are you sure?']);
            expect(requests.map((request) => [request.handler, request.options.data.file_id])).toEqual([
                ['formFiles::onRemoveAttachment', '7'],
                ['formFiles::onRemoveAttachment', '9']
            ]);
            expect(requests[0].element).toBe(element.closest('form'));

            requests.forEach((request) => request.resolve({}));
            await flush();

            expect(dropzone.removed.map((file) => file.id)).toEqual([7, 9]);
            expect(element.querySelectorAll('.upload-object.is-loading').length).toBe(0);
        }
        finally {
            window.removeEventListener('ajax:confirm-message', onConfirm);
        }
    });

    test('a declined confirmation removes nothing', async () => {
        const { element } = await connect({ files: serverFile(7, 'a.pdf') });
        const originalConfirm = window.confirm;
        window.confirm = () => false;

        try {
            element.querySelector('input[data-record-selector]').checked = true;
            element.querySelector('.toolbar-delete-selected').disabled = false;
            element.querySelector('.toolbar-delete-selected').click();
            await flush();

            expect(requests).toEqual([]);
        }
        finally {
            window.confirm = originalConfirm;
        }
    });

    test('clicking an uploaded file opens it, but not from its checkbox', async () => {
        const { element } = await connect({ files: serverFile(7, 'a.pdf') });
        const opened = [];
        const originalOpen = window.open;
        window.open = (url) => opened.push(url);

        try {
            element.querySelector('[data-dz-name]').click();
            element.querySelector('.meta').click();
            expect(opened).toEqual(['/storage/a.pdf']);
        }
        finally {
            window.open = originalOpen;
        }
    });

    test('clicking a failed upload explains the error and can remove the file', async () => {
        const { element, dropzone } = await connect();
        const file = addUpload(dropzone, 'huge.zip');
        file.previewElement.querySelector('[data-dz-errormessage]').textContent = 'Too <big>';
        dropzone.emit('error', file, 'Too big!');

        file.previewElement.querySelector('.icon-container').click();

        const popover = document.querySelector('.control-popover.popover-danger');
        expect(popover.querySelector('p').textContent).toBe('Too <big>');

        popover.querySelector('[data-remove-file]').click();

        expect(dropzone.removed).toEqual([file]);
        expect(document.querySelector('.control-popover')).toBeNull();
        expect(element.classList.contains('is-populated')).toBe(false);
    });

    test('the error popover is a modal above the file and its close button keeps the file', async () => {
        const { dropzone } = await connect();
        const file = addUpload(dropzone, 'huge.zip');
        dropzone.emit('error', file, 'Too big!');

        file.previewElement.querySelector('.icon-container').click();

        const popover = document.querySelector('.control-popover.popover-danger');
        expect(document.querySelector('.popover-overlay').classList.contains('show')).toBe(true);
        expect(file.previewElement.classList.contains('popover-highlight')).toBe(true);

        popover.querySelector('[data-dismiss="popover"]').click();

        expect(document.querySelector('.control-popover')).toBeNull();
        expect(document.querySelector('.popover-overlay')).toBeNull();
        expect(file.previewElement.classList.contains('popover-highlight')).toBe(false);
        expect(dropzone.removed).toEqual([]);
    });

    test('sorting is bound to the drag handles of uploaded files', async () => {
        const { element } = await connect();

        expect(sortables[0].element).toBe(element.querySelector('.upload-files-container'));
        expect(sortables[0].options).toMatchObject({ draggable: 'div.upload-object.is-success', handle: '.drag-handle' });
    });

    test('dragging files over the field highlights it, unless reordering', async () => {
        const { element, dropzone } = await connect();

        dropzone.emit('dragenter');
        expect(element.classList.contains('file-drag-over')).toBe(true);
        dropzone.emit('drop');
        expect(element.classList.contains('file-drag-over')).toBe(false);

        sortables[0].options.onStart();
        dropzone.emit('dragenter');
        expect(element.classList.contains('file-drag-over')).toBe(false);
    });

    test('thumbnails keep their proportions from either dimension', async () => {
        const { control } = await connect({ attributes: 'data-thumbnail-height="50"' });

        expect(control.onResizeFileInfo({ width: 200, height: 100 })).toMatchObject({ trgWidth: 100, trgHeight: 50 });
    });

    test('formats sizes like the server', async () => {
        const { control } = await connect();

        expect(control.getFilesize({ size: 1 })).toEqual({ size: 1, units: 'byte' });
        expect(control.getFilesize({ size: 1536 })).toEqual({ size: '1.50', units: 'KB' });
        expect(control.getFilesize({ size: 3 * 1048576 })).toEqual({ size: '3.00', units: 'MB' });
    });

    test('tears Dropzone and sorting down on disconnect', async () => {
        const { control, dropzone } = await connect();

        control.disconnect();

        expect(dropzone.calls).toContain('destroy');
        expect(sortables[0].destroyed).toBe(true);
    });

    test('skips binding when the field left the page before the dependencies loaded', async () => {
        document.body.innerHTML = field();
        const element = document.querySelector('[data-control="fileupload"]');
        const control = new (jax.controls.get('fileupload'))(element);
        control.init();
        control.connect();
        control.disconnect();
        await flush();

        expect(dropzones.length).toBe(0);
    });
});
