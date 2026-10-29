/*
 * File upload form field control
 *
 * Data attributes:
 * - data-control="fileupload" - enables the file upload plugin
 * - data-unique-id="XXX" - an optional identifier for multiple uploaders on the same page, this value will
 *   appear in the postback variable called X_OCTOBER_FILEUPLOAD
 * - data-template - a Dropzone.js template to use for each item
 * - data-error-template - a popover template used to show an error
 * - data-error-icon - icon CSS classes to add to failed previews
 * - data-sort-handler - AJAX handler for sorting postbacks
 * - data-messages - the upload messages, as JSON
 *
 * JavaScript API:
 * jax.fetchControl(element, 'fileupload')
 *
 * Dependencies:
 * - Dropzone.js (vendor/dropzone/dropzone.esm.js)
 * - SortableJS (vendor/sortablejs/sortable.esm.js)
 */
'use strict';

import { Popover } from '../../controls/popover/popover.js';

// Messages shown by Dropzone when the field supplies none
const DEFAULT_MESSAGES = {
    maxFiles: 'You can not upload any more files.',
    invalidFileType: "You can't upload files of this type.",
    fileTooBig: 'File is too big ({{filesize}}MB). Max filesize: {{maxFilesize}}MB.',
    responseError: 'Server responded with {{statusCode}} code.',
    removeFile: 'Remove file'
};

// Dropzone and SortableJS are shared by every field, loaded on first use
let dependenciesPromise = null;

export function registerFileUpload(jax) {
    jax.registerControl('fileupload', class extends jax.ControlBase {
        init() {
            this.isLoaded = false;
            this.pendingCount = 0;

            if (this.config.isMulti === undefined) {
                this.config.isMulti = this.element.classList.contains('is-multi');
            }

            if (this.config.isPreview === undefined) {
                this.config.isPreview = this.element.classList.contains('is-preview');
            }

            if (this.config.isSortable === undefined) {
                this.config.isSortable = this.element.classList.contains('is-sortable');
            }

            this.uploaderOptions = {};
        }

        connect() {
            this.uploadButton = this.element.querySelector('.toolbar-upload-button');
            this.filesContainer = this.element.querySelector('.upload-files-container');
            this.fileObjects = new WeakMap();

            this.listen('click', '.upload-object.is-success .file-data-container-inner', this.onClickSuccessObject);
            this.listen('click', '.upload-object.is-error', this.onClickErrorObject);
            this.listen('click', '.toolbar-clear-file', this.onClearFileClick);
            this.listen('click', '.toolbar-delete-selected', this.onDeleteSelectedClick);
            this.listen('click', 'input[data-record-selector]', this.onClickCheckbox);
            this.listen('change', 'input[data-record-selector]', this.onSelectionChanged);

            loadDependencies().then(({ Dropzone, Sortable }) => {
                // The field may have left the page while the dependencies loaded
                if (!this.filesContainer) {
                    return;
                }

                this.bindUploader(Dropzone);

                if (this.config.isSortable) {
                    this.bindSortable(Sortable);
                }

                this.isLoaded = true;

                // External toolbar
                setTimeout(() => {
                    this.initToolbarExtensionPoint();
                    this.mountExternalToolbarEventBusEvents();
                    this.extendExternalToolbar();
                }, 0);
            });
        }

        disconnect() {
            this.unmountExternalToolbarEventBusEvents();

            if (this.dropzone) {
                this.dropzone.destroy();
            }

            if (this.sortable) {
                this.sortable.destroy();
            }

            if (this.errorPopover) {
                this.errorPopover.hide();
            }

            this.sortable = null;
            this.dropzone = null;
            this.errorPopover = null;
            this.uploadButton = null;
            this.filesContainer = null;
            this.fileObjects = null;
            this.uploaderOptions = null;
            this.toolbarExtensionPoint = null;
            this.externalToolbarEventBusObj = null;
            this.isLoaded = null;
        }

        //
        // External toolbar
        //

        initToolbarExtensionPoint() {
            const vueUtils = window.oc && window.oc.vueUtils;
            if (!this.config.externalToolbarBus || !vueUtils) {
                return;
            }

            const point = vueUtils.getToolbarExtensionPoint(
                this.config.externalToolbarBus,
                this.element,
                'both'
            );

            if (point) {
                this.toolbarExtensionPoint = point.state;
                this.externalToolbarEventBusObj = point.bus;
            }
        }

        mountExternalToolbarEventBusEvents() {
            if (!this.externalToolbarEventBusObj) {
                return;
            }

            this.externalToolbarEventBusObj.on('toolbarcmd', this.proxy(this.onToolbarExternalCommand));
            this.externalToolbarEventBusObj.on('extendapptoolbar', this.proxy(this.extendExternalToolbar));
        }

        unmountExternalToolbarEventBusEvents() {
            if (!this.externalToolbarEventBusObj) {
                return;
            }

            this.externalToolbarEventBusObj.off('toolbarcmd', this.proxy(this.onToolbarExternalCommand));
            this.externalToolbarEventBusObj.off('extendapptoolbar', this.proxy(this.extendExternalToolbar));
        }

        onToolbarExternalCommand(ev) {
            const cmdPrefix = 'fileupload-toolbar-';

            if (ev.command.substring(0, cmdPrefix.length) != cmdPrefix) {
                return;
            }

            const buttonClassName = ev.command.substring(cmdPrefix.length),
                button = this.element.querySelector('.uploader-control-toolbar [class="' + buttonClassName + '"]');

            if (button) {
                button.click(ev.ev);
            }
        }

        extendExternalToolbar() {
            if (!this.element || !this.element.getClientRects().length || !this.toolbarExtensionPoint) {
                return;
            }

            this.toolbarExtensionPoint.splice(0, this.toolbarExtensionPoint.length);

            this.toolbarExtensionPoint.push({
                type: 'separator'
            });

            this.element.querySelectorAll('.uploader-control-toolbar .backend-toolbar-button').forEach((button) => {
                const icon = button.querySelector('i'),
                    label = button.querySelector('.button-label');

                this.toolbarExtensionPoint.push({
                    type: 'button',
                    icon: icon ? icon.getAttribute('class') : '',
                    label: label ? label.textContent : '',
                    command: 'fileupload-toolbar-' + button.getAttribute('class'),
                    disabled: button.hasAttribute('disabled')
                });
            });
        }

        //
        // Uploading
        //

        bindUploader(Dropzone) {
            const messages = Object.assign({}, DEFAULT_MESSAGES, this.config.messages || {});

            this.uploaderOptions = {
                url: this.config.url || window.location.href,
                paramName: this.config.paramName || 'file_data',
                clickable: this.uploadButton,
                previewsContainer: this.filesContainer,
                hiddenInputContainer: this.element,
                maxFilesize: this.config.maxFilesize || 256,
                headers: {},
                timeout: 0
            };

            if (!this.config.isMulti) {
                this.uploaderOptions.maxFiles = 1;
            }
            else {
                this.uploaderOptions.maxFiles = this.config.maxFiles || null;
            }

            if (this.config.fileTypes) {
                this.uploaderOptions.acceptedFiles = this.config.fileTypes;
            }

            if (this.config.template) {
                const template = document.querySelector(this.config.template);
                if (template) {
                    this.uploaderOptions.previewTemplate = template.innerHTML;
                }
            }

            this.uploaderOptions.thumbnailWidth = this.config.thumbnailWidth
                ? this.config.thumbnailWidth : null;

            this.uploaderOptions.thumbnailHeight = this.config.thumbnailHeight
                ? this.config.thumbnailHeight : null;

            this.uploaderOptions.resize = this.proxy(this.onResizeFileInfo);

            // Locale
            this.uploaderOptions.dictMaxFilesExceeded = messages.maxFiles;
            this.uploaderOptions.dictInvalidFileType = messages.invalidFileType;
            this.uploaderOptions.dictFileTooBig = messages.fileTooBig;
            this.uploaderOptions.dictResponseError = messages.responseError;
            this.uploaderOptions.dictRemoveFile = messages.removeFile;

            // Add CSRF tokens to headers, from the meta tag or the XSRF-TOKEN cookie as larajax sends them
            const token = document.querySelector('meta[name="csrf-token"]');
            if (token && token.getAttribute('content')) {
                this.uploaderOptions.headers['X-CSRF-TOKEN'] = token.getAttribute('content');
            }

            const xsrfToken = readCookie('XSRF-TOKEN');
            if (xsrfToken) {
                this.uploaderOptions.headers['X-XSRF-TOKEN'] = xsrfToken;
            }

            this.dropzone = new Dropzone(this.element, this.uploaderOptions);

            this.dropzone.on('addedfile', this.proxy(this.onUploadAddedFile));
            this.dropzone.on('sending', this.proxy(this.onUploadSending));
            this.dropzone.on('success', this.proxy(this.onUploadSuccess));
            this.dropzone.on('error', this.proxy(this.onUploadError));
            this.dropzone.on('complete', this.proxy(this.onUploadComplete));

            this.dropzone.on('dragenter', this.proxy(this.onDragEnter));
            this.dropzone.on('dragover', this.proxy(this.onDragEnter));
            this.dropzone.on('dragleave', this.proxy(this.onDragEnd));
            this.dropzone.on('dragend', this.proxy(this.onDragEnd));
            this.dropzone.on('drop', this.proxy(this.onDragEnd));

            this.loadExistingFiles();
        }

        loadExistingFiles() {
            // Server files are already uploaded, so they never complete an upload
            this.isLoadingExisting = true;

            this.element.querySelectorAll('.server-file').forEach((element) => {
                const file = this.readServerFile(element);

                this.dropzone.files.push(file);
                this.dropzone.emit('addedfile', file);
                this.dropzone.emit('success', file, file);

                const description = file.previewElement.querySelector('[data-description]');
                if (description) {
                    description.textContent = file.description;
                }

                element.remove();
            });

            this.isLoadingExisting = false;
            this.dropzone._updateMaxFilesReachedClass();
        }

        // Reads a server file from its data attributes, as numbers and booleans where they hold them
        readServerFile(element) {
            const file = {};

            Object.entries(element.dataset).forEach(([key, value]) => {
                if (value === 'true' || value === 'false') {
                    file[key] = value === 'true';
                }
                else if (value !== '' && !isNaN(Number(value))) {
                    file[key] = Number(value);
                }
                else {
                    file[key] = value;
                }
            });

            return file;
        }

        onResizeFileInfo(file) {
            let info,
                targetWidth,
                targetHeight;

            if (!this.config.thumbnailWidth && !this.config.thumbnailHeight) {
                targetWidth = targetHeight = 100;
            }
            else if (this.config.thumbnailWidth) {
                targetWidth = this.config.thumbnailWidth;
                targetHeight = this.config.thumbnailWidth * file.height / file.width;
            }
            else if (this.config.thumbnailHeight) {
                targetWidth = this.config.thumbnailHeight * file.width / file.height;
                targetHeight = this.config.thumbnailHeight;
            }

            // drawImage(image, srcX, srcY, srcWidth, srcHeight, trgX, trgY, trgWidth, trgHeight) takes an image, clips it to
            // the rectangle (srcX, srcY, srcWidth, srcHeight), scales it to dimensions (trgWidth, trgHeight), and draws it
            // on the canvas at coordinates (trgX, trgY).
            info = {
                srcX: 0,
                srcY: 0,
                srcWidth: file.width,
                srcHeight: file.height,
                trgX: 0,
                trgY: 0,
                trgWidth: targetWidth,
                trgHeight: targetHeight
            };

            return info;
        }

        onUploadAddedFile(file) {
            if (!this.isLoadingExisting) {
                this.pendingCount++;
            }

            if (this.uploadButton) {
                this.uploadButton.blur();
            }

            const preview = file.previewElement,
                filesize = this.getFilesize(file);

            this.fileObjects.set(preview, file);

            // Change filesize format to match October\Rain\Filesystem\Filesystem::sizeToString() format
            const size = preview.querySelector('[data-dz-size]');
            if (size) {
                size.textContent = filesize.size + ' ' + filesize.units;
            }

            // Remove any exisiting objects for single variety
            if (!this.config.isMulti) {
                this.removeFileFromElement(siblingsOf(preview));
            }

            if (this.config.isMulti && this.isLoaded) {
                preview.scrollIntoView();
            }

            this.evalIsPopulated();
            this.updateDeleteSelectedState();
            this.extendExternalToolbar();
        }

        onUploadSending(file, xhr, formData) {
            this.addExtraFormData(formData);
            xhr.setRequestHeader('X-AJAX-HANDLER', this.config.uploadHandler);
        }

        onUploadSuccess(file, response) {
            const preview = file.previewElement,
                img = preview.querySelector('.image img');

            preview.classList.add('is-success');

            if (response && response.id) {
                preview.dataset.id = response.id;
                preview.dataset.path = response.path;

                if (img) {
                    img.setAttribute('src', response.thumb);
                }
            }

            this.triggerChange();
        }

        onUploadError(file, error, xhr) {
            const preview = file.previewElement;
            preview.classList.add('is-error');

            // A server error page arrives as HTML, so the message names its status code instead
            if (xhr && typeof error === 'string' && /^\s*</.test(error)) {
                const message = this.uploaderOptions.dictResponseError.replace('{{statusCode}}', xhr.status);
                preview.querySelectorAll('[data-dz-errormessage]').forEach((element) => {
                    element.textContent = message;
                });
            }

            // Add error icon to the icon container
            const iconContainer = preview.querySelector('.icon-container');
            if (iconContainer && !iconContainer.querySelector('.error-icon')) {
                const errorIcon = document.createElement('i');
                errorIcon.className = `${this.config.errorIcon || 'ph ph-warning'} error-icon`.trim();
                iconContainer.appendChild(errorIcon);
            }
        }

        onUploadComplete(file) {
            this.pendingCount--;

            if (this.pendingCount === 0) {
                this.onSortAttachments();
            }
        }

        onSelectionChanged(ev) {
            const object = ev.target.closest('.upload-object');
            if (object) {
                object.classList.toggle('selected', ev.target.checked);
            }

            this.updateDeleteSelectedState();
            this.extendExternalToolbar();
        }

        onClickCheckbox(ev) {
            if (jax.checkboxRangeRegisterClick) {
                jax.checkboxRangeRegisterClick(ev, '.upload-object', 'input[data-record-selector]');
            }
        }

        /*
         * Trigger change event, the form widget listens for it on the field
         */
        triggerChange() {
            if (this.element) {
                this.element.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        addExtraFormData(formData) {
            if (this.config.extraData) {
                Object.entries(this.config.extraData).forEach(([name, value]) => {
                    formData.append(name, value);
                });
            }

            // Form fields as text, leaving out file inputs such as the uploader's own
            const form = this.element.closest('form');
            if (form) {
                for (const [name, value] of new FormData(form)) {
                    if (typeof value === 'string') {
                        formData.append(name, value);
                    }
                }
            }
        }

        removeFileFromElement(elements) {
            elements.forEach((element) => {
                const file = this.fileObjects.get(element);

                if (file) {
                    this.dropzone.removeFile(file);
                }
                else {
                    element.remove();
                }
            });
        }

        //
        // Sorting
        //

        bindSortable(Sortable) {
            this.dragging = false;

            this.sortable = Sortable.create(this.filesContainer, {
                animation: 150,
                draggable: 'div.upload-object.is-success',
                handle: '.drag-handle',
                onStart: this.proxy(this.onDragStart),
                onEnd: this.proxy(this.onDragStop),

                // Auto scroll plugin
                forceAutoScrollFallback: true,
                scrollSensitivity: 60,
                scrollSpeed: 20
            });
        }

        onDragStart(evt) {
            this.dragging = true;
        }

        onDragStop(evt) {
            this.dragging = false;

            this.onSortAttachments();
        }

        onSortAttachments() {
            if (!this.config.sortHandler) {
                return;
            }

            // Build an object of ID:ORDER
            const orderData = {};

            this.element.querySelectorAll('.upload-object.is-success').forEach((element, index) => {
                orderData[element.dataset.id] = index + 1;
            });

            // Already sorting, queue the request
            if (this.sorting) {
                this.sortAgain = true;
                return;
            }

            this.sorting = true;

            jax.request(this.element, this.config.sortHandler, {
                data: { sortOrder: orderData },
                complete: () => {
                    this.sorting = false;

                    // Capture the final state
                    if (this.sortAgain && this.element) {
                        this.sortAgain = false;
                        this.onSortAttachments();
                    }
                }
            });
        }

        //
        // User interaction
        //

        onClearFileClick(ev) {
            const button = ev.target.closest('.toolbar-clear-file'),
                currentObject = this.filesContainer.querySelector('.upload-object');

            ev.stopPropagation();
            ev.preventDefault();

            confirmMessage(button.getAttribute('data-request-confirm')).then((isConfirm) => {
                if (isConfirm && currentObject) {
                    this.removeObjectInternal(button, currentObject);
                }
            });
        }

        onDeleteSelectedClick(ev) {
            const button = ev.target.closest('.toolbar-delete-selected'),
                currentObjects = [...this.filesContainer.querySelectorAll('.upload-object')]
                    .filter((object) => object.querySelector('input[data-record-selector]:checked'));

            ev.stopPropagation();
            ev.preventDefault();

            confirmMessage(button.getAttribute('data-request-confirm')).then((isConfirm) => {
                if (!isConfirm) {
                    return;
                }

                currentObjects.forEach((object) => object.classList.add('is-loading'));
                currentObjects.forEach((object) => this.removeObjectInternal(button, object));
            });
        }

        removeObjectInternal(button, currentObject) {
            const objectId = currentObject.dataset.id;

            if (!objectId) {
                this.removeFileFromElement([currentObject]);
                this.afterRemoveObject();
                return;
            }

            currentObject.classList.add('is-loading');

            jax.request(button.closest('form') || this.element, button.getAttribute('data-request'), {
                data: {
                    file_id: objectId
                },
                complete: () => {
                    currentObject.classList.remove('is-loading');
                }
            }).then(() => {
                if (!this.dropzone) {
                    return;
                }

                this.removeFileFromElement([currentObject]);
                this.afterRemoveObject();
            });
        }

        afterRemoveObject() {
            this.evalIsPopulated();
            this.updateDeleteSelectedState();
            this.extendExternalToolbar();
            this.triggerChange();
        }

        onClickSuccessObject(ev) {
            if (ev.target.closest('.meta')) return;
            if (ev.target.closest('.upload-checkbox')) return;

            const target = ev.target.closest('.upload-object');
            if (target && target.dataset.path) {
                window.open(target.dataset.path);
            }
        }

        onClickErrorObject(ev) {
            const target = ev.target.closest('.upload-object'),
                errorElement = target.querySelector('[data-dz-errormessage]'),
                errorMsg = errorElement ? errorElement.textContent : '',
                template = document.querySelector(this.config.errorTemplate);

            // Remove any existing objects for single variety
            if (!this.config.isMulti) {
                this.removeFileFromElement(siblingsOf(target));
            }

            if (!template) {
                return;
            }

            const popover = this.errorPopover = new Popover(target, {
                content: renderTemplate(template.innerHTML, { errorMsg }),
                modal: true,
                highlightModalTarget: true,
                placement: 'top',
                fallbackPlacement: 'left',
                containerClass: 'popover-danger',
                onClose: () => {
                    if (this.errorPopover === popover) {
                        this.errorPopover = null;
                    }
                }
            });

            popover.show();

            if (!popover.element) {
                return;
            }

            popover.element.addEventListener('click', (event) => {
                if (event.target.closest('[data-remove-file]')) {
                    popover.hide();
                    this.removeFileFromElement([target]);
                    this.evalIsPopulated();
                    this.updateDeleteSelectedState();
                    this.extendExternalToolbar();
                }
            });
        }

        //
        // Helpers
        //

        evalIsPopulated() {
            const isPopulated = !!this.filesContainer.querySelector('.upload-object');
            this.element.classList.toggle('is-populated', isPopulated);

            // Reset maxFiles counter
            if (!isPopulated) {
                this.dropzone.removeAllFiles();
            }

            const uploadLabel = this.uploadButton ? this.uploadButton.querySelector('span.button-label') : null;
            if (uploadLabel && uploadLabel.getAttribute('data-upload-label')) {
                uploadLabel.textContent = isPopulated
                    ? uploadLabel.getAttribute('data-replace-label')
                    : uploadLabel.getAttribute('data-upload-label');
            }
        }

        updateDeleteSelectedState() {
            let enabled = false;
            const selectedCount = this.element.querySelectorAll('input[data-record-selector]:checked').length;

            if (this.element.classList.contains('is-populated')) {
                enabled = selectedCount > 0;
            }

            const button = this.element.querySelector('.toolbar-delete-selected');
            if (!button) {
                return;
            }

            const counter = button.querySelector('.button-label > span');

            button.disabled = !enabled;

            if (counter) {
                counter.textContent = enabled ? '(' + selectedCount + ')' : '';
            }
        }

        onDragEnter() {
            if (this.dragging) {
                return;
            }

            this.element.classList.add('file-drag-over');
        }

        onDragEnd() {
            if (this.dragging) {
                return;
            }

            this.element.classList.remove('file-drag-over');
        }

        /*
         * Replicates the formatting of October\Rain\Filesystem\Filesystem::sizeToString(). This method will return
         * an object with the file size amount and the unit used as `size` and `units` respectively.
         */
        getFilesize(file) {
            const formatter = new Intl.NumberFormat('en', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            let size = 0,
                units = 'bytes';

            if (file.size >= 1073741824) {
                size = formatter.format(file.size / 1073741824);
                units = 'GB';
            }
            else if (file.size >= 1048576) {
                size = formatter.format(file.size / 1048576);
                units = 'MB';
            }
            else if (file.size >= 1024) {
                size = formatter.format(file.size / 1024);
                units = 'KB';
            }
            else if (file.size > 1) {
                size = file.size;
                units = 'bytes';
            }
            else if (file.size == 1) {
                size = 1;
                units = 'byte';
            }

            return {
                size: size,
                units: units
            };
        }
    });

    function loadDependencies() {
        if (!dependenciesPromise) {
            dependenciesPromise = Promise.all([
                import('../../vendor/dropzone/dropzone.esm.js'),
                import('../../vendor/sortablejs/sortable.esm.js')
            ]).then(([dropzone, sortable]) => ({
                Dropzone: dropzone.Dropzone,
                Sortable: sortable.Sortable
            }));
        }

        return dependenciesPromise;
    }

    // Asks to confirm through larajax's confirm event, so a page's own dialog can answer,
    // falling back to the browser prompt
    function confirmMessage(message) {
        return new Promise((resolve) => {
            if (!message) {
                resolve(true);
                return;
            }

            const event = new CustomEvent('ajax:confirm-message', {
                cancelable: true,
                detail: {
                    message,
                    promise: { resolve: () => resolve(true), reject: () => resolve(false) }
                }
            });

            window.dispatchEvent(event);

            if (!event.defaultPrevented) {
                resolve(window.confirm(message));
            }
        });
    }
}

function readCookie(name) {
    const prefix = name + '=';
    const cookie = document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
    return cookie ? decodeURIComponent(cookie.substring(prefix.length)) : null;
}

function siblingsOf(element) {
    return [...element.parentNode.children].filter((child) => child !== element);
}

// Fills {{name}} placeholders with escaped values
function renderTemplate(template, values) {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => escapeHtml(values[name] ?? ''));
}

function escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = String(value);
    return element.innerHTML;
}
