/*
 * Sensitive field widget plugin
 *
 * Data attributes:
 * - data-control="sensitive" - enables the plugin on an element
 * - data-reveal-handler - AJAX handler that returns the stored value
 * - data-hide-on-tab-change - hides a revealed value when the browser tab is hidden
 * - data-display-mode - text or textarea
 * - data-icon-show / data-icon-hide - icon classes for the reveal toggle
 *
 * JavaScript API:
 * jax.fetchControl(element, 'sensitive')
 */
'use strict';

export function registerSensitive(jax) {
    jax.registerControl('sensitive', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({
                readOnly: false,
                disabled: false,
                revealHandler: null,
                hideOnTabChange: false,
                displayMode: 'text',
                iconShow: '',
                iconHide: ''
            }, this.config);
        }

        connect() {
            this.clean = !!this.config.sensitiveClean;
            this.hidden = true;

            this.input = this.element.querySelector('[data-sensitive-input]');
            this.icon = this.element.querySelector('[data-sensitive-icon]');
            this.loader = this.element.querySelector('[data-sensitive-loader]');
            this.facade = this.element.querySelector('[data-sensitive-facade]');

            this.listen('keydown', '[data-sensitive-input]', this.onInput);
            this.listen('click', '[data-sensitive-toggle]', this.onToggle);
            this.listen('click', '[data-sensitive-copy]', this.onCopy);

            if (this.config.hideOnTabChange) {
                document.addEventListener('visibilitychange', this.proxy(this.onTabChange));
            }
        }

        disconnect() {
            if (this.config.hideOnTabChange) {
                document.removeEventListener('visibilitychange', this.proxy(this.onTabChange));
            }

            this.input = null;
            this.icon = null;
            this.loader = null;
            this.facade = null;
        }

        onInput() {
            if (this.clean) {
                this.clean = false;
                this.input.value = '';
            }

            return true;
        }

        onToggle() {
            if (this.input.value !== '' && this.clean) {
                this.reveal();
            }
            else {
                this.toggleVisibility();
            }

            return true;
        }

        onTabChange() {
            if (document.hidden && !this.hidden) {
                this.toggleVisibility();
            }
        }

        onCopy() {
            const isHidden = this.hidden,
                isDisabled = this.input.disabled;

            const copyValue = () => {
                if (isDisabled) {
                    this.input.disabled = false;
                }
                if (this.hidden) {
                    this.toggleVisibility();
                }

                this.input.focus();
                this.input.select();

                try {
                    document.execCommand('copy');
                }
                catch (err) {
                }

                this.input.blur();

                if (isDisabled) {
                    this.input.disabled = true;
                }

                if (isHidden) {
                    this.toggleVisibility();
                }
            };

            if (this.input.value !== '' && this.clean) {
                this.reveal(copyValue);
            }
            else {
                copyValue();
            }
        }

        toggleVisibility() {
            if (this.config.displayMode === 'textarea') {
                toggleDisplay(this.facade);
                toggleDisplay(this.input);
            }
            else {
                this.input.setAttribute('type', this.hidden ? 'text' : 'password');
            }

            if (this.icon) {
                swapClasses(this.icon, this.hidden ? this.config.iconShow : this.config.iconHide, this.hidden ? this.config.iconHide : this.config.iconShow);
            }

            this.hidden = !this.hidden;
        }

        reveal(callback) {
            const self = this;

            if (this.icon) {
                this.icon.style.visibility = 'hidden';
            }
            this.loader.classList.remove('oc-hide');

            jax.request(this.input, this.config.revealHandler, {
                success: function(data) {
                    self.input.value = data.value;
                    self.clean = false;

                    if (self.icon) {
                        self.icon.style.visibility = 'visible';
                    }
                    self.loader.classList.add('oc-hide');

                    self.toggleVisibility();

                    if (callback) {
                        callback();
                    }
                }
            });
        }
    });

    function toggleDisplay(element) {
        if (element) {
            element.style.display = element.style.display === 'none' ? '' : 'none';
        }
    }

    function swapClasses(element, from, to) {
        String(from).split(' ').filter(Boolean).forEach((name) => element.classList.remove(name));
        String(to).split(' ').filter(Boolean).forEach((name) => element.classList.add(name));
    }
}
