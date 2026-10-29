/*
 * A fake framework instance for widget tests: controls connect when connectAll()
 * runs (standing in for the mutation observer), requests resolve on demand and
 * events are plain bubbling CustomEvents.
 */

// Reads data attributes like a browser's dataset, since happy-dom skips empty values when enumerating
function readDataAttributes(element) {
    const config = {};

    for (const attr of element.attributes) {
        if (attr.name.startsWith('data-')) {
            const key = attr.name.slice(5).replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
            config[key] = attr.value;
        }
    }

    return config;
}

export function makeFakeJax() {
    const controls = new Map();
    const instances = new Map();

    class ControlBase {
        constructor(element) {
            this.element = element;
            this.config = readDataAttributes(element);
            this.proxied = new Map();
            this.bound = [];
        }

        proxy(method) {
            if (!this.proxied.has(method)) {
                this.proxied.set(method, method.bind(this));
            }
            return this.proxied.get(method);
        }

        listen(eventName, targetOrHandler, handler) {
            const target = targetOrHandler instanceof Element ? targetOrHandler : this.element,
                callback = this.proxy(targetOrHandler instanceof Element ? handler : targetOrHandler);

            target.addEventListener(eventName, callback);
            this.bound.push([target, eventName, callback]);
        }

        forgetAll() {
            this.bound.forEach(([target, eventName, callback]) => target.removeEventListener(eventName, callback));
            this.bound = [];
        }
    }

    const jax = {
        controls,
        requests: [],
        ControlBase,

        registerControl(id, control) {
            controls.set(id, control);
        },

        // Connects every registered control named in a data-control attribute that is not connected yet
        connectAll() {
            document.querySelectorAll('[data-control]').forEach((element) => {
                element.dataset.control.split(' ').forEach((id) => {
                    if (controls.has(id)) {
                        jax.connect(id, element);
                    }
                });
            });
        },

        connect(id, element) {
            let byId = instances.get(element);
            if (!byId) {
                byId = new Map();
                instances.set(element, byId);
            }

            if (byId.has(id)) {
                return byId.get(id);
            }

            const control = new (controls.get(id))(element);
            control.init();
            control.connect();
            byId.set(id, control);
            return control;
        },

        disconnectAll() {
            instances.forEach((byId) => {
                byId.forEach((control) => {
                    control.disconnect();
                    control.forgetAll();
                });
            });
            instances.clear();
        },

        fetchControl(element, id) {
            const byId = element ? instances.get(element) : null;
            return byId ? byId.get(id) || null : null;
        },

        // Records the request; resolve(data) runs success, then always and done callbacks
        request(element, handler, options = {}) {
            const alwaysCallbacks = [],
                doneCallbacks = [];

            const promise = {
                always(fn) { alwaysCallbacks.push(fn); return promise; },
                done(fn) { doneCallbacks.push(fn); return promise; }
            };

            jax.requests.push({
                element,
                handler,
                options,
                resolve(data = {}) {
                    if (options.success) {
                        options.success.call({}, data);
                    }
                    alwaysCallbacks.forEach((fn) => fn());
                    doneCallbacks.forEach((fn) => fn(data));
                }
            });

            return promise;
        },

        // Flat serializer covering named inputs, checked boxes and selects
        values(container) {
            const result = {};
            container.querySelectorAll('input, select, textarea').forEach((field) => {
                if (!field.name || field.disabled) {
                    return;
                }
                if ((field.type === 'checkbox' || field.type === 'radio') && !field.checked) {
                    return;
                }
                result[field.name] = field.value;
            });
            return result;
        },

        checkboxRangeRegisterClick() {},

        Events: {
            on(target, eventName, handler) {
                target.addEventListener(eventName, handler);
            },
            off(target, eventName, handler) {
                target.removeEventListener(eventName, handler);
            },
            dispatch(eventName, { target = document, detail = {} } = {}) {
                const event = new CustomEvent(eventName, { bubbles: true, cancelable: true, detail });
                target.dispatchEvent(event);
                return event;
            }
        }
    };

    return jax;
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
