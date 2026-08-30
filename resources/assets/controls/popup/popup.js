/*
 * Popup control
 *
 * A modal dialog whose content loads from an AJAX handler. Built on the
 * Bootstrap 5 Modal, which is a prerequisite. The handler should return the
 * inner modal markup (header/body/footer), which is injected into the
 * `.modal-content` element.
 *
 * Programmatic API:
 *
 *     import { Popup } from './controls/popup/popup.js';
 *
 *     Popup.open({
 *         handler: 'list::onLoadSetup',
 *         extraData: { foo: 1 },
 *         size: 'large',
 *         sourceElement: buttonEl
 *     });
 *
 * Declarative API:
 * - data-control="popup" - opens a popup when the element is clicked
 * - data-handler - AJAX handler that returns the popup contents
 * - data-request-data - extra request data, October attribute syntax
 * - data-size - popup size: small, large, huge, giant
 *
 * Elements inside the popup carrying data-dismiss="popup" close it.
 */
'use strict';

const SIZE_CLASSES = {
    small: 'modal-sm',
    tiny: 'modal-sm',
    large: 'modal-lg',
    huge: 'modal-xl',
    giant: 'modal-xl'
};

export class Popup {
    /**
     * open builds the modal shell, shows it, and loads the handler contents
     */
    static open(options = {}) {
        if (!window.bootstrap || !window.bootstrap.Modal) {
            console.error('[larajax.ui] The popup control requires the Bootstrap 5 bundle to be loaded.');
            return null;
        }

        const modal = document.createElement('div');
        modal.className = 'modal fade control-popup';
        modal.tabIndex = -1;

        const sizeClass = SIZE_CLASSES[options.size] || '';
        modal.innerHTML =
            '<div class="modal-dialog ' + sizeClass + '">' +
                '<div class="modal-content">' +
                    '<div class="modal-body">' +
                        '<span class="control-popup-loading"></span>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(modal);

        const instance = new bootstrap.Modal(modal);
        instance.show();

        // Remove from the DOM once fully hidden
        modal.addEventListener('hidden.bs.modal', function() {
            instance.dispose();
            modal.remove();
        });

        // Dismiss elements inside the loaded content
        modal.addEventListener('click', function(ev) {
            if (ev.target.closest('[data-dismiss="popup"]')) {
                ev.preventDefault();
                instance.hide();
            }
        });

        // Load the contents
        if (options.handler) {
            jax.request(options.sourceElement || modal, options.handler, {
                data: options.extraData || {},
                success: function(data) {
                    if (typeof data.result === 'string') {
                        modal.querySelector('.modal-content').innerHTML = data.result;
                    }
                }
            });
        }

        return modal;
    }
}

/*
 * Declarative binding: opens a popup from the clicked element's data attributes
 */
jax.registerControl('popup', class extends jax.ControlBase {
    connect() {
        this.listen('click', this.onClick);
    }

    onClick(ev) {
        ev.preventDefault();

        Popup.open({
            handler: this.config.handler,
            size: this.config.size,
            extraData: this.parseRequestData(),
            sourceElement: this.element
        });
    }

    parseRequestData() {
        const raw = this.element.dataset.requestData || '';
        if (!raw) {
            return {};
        }

        try {
            return jax.parseJSON(raw.trim().startsWith('{') ? raw : '{' + raw + '}');
        }
        catch (e) {
            return {};
        }
    }
});
