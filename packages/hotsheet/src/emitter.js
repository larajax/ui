/**
 * Emitter is a minimal event emitter; `on` returns a function that removes the listener.
 */
export class Emitter {
    constructor() {
        this.listeners = new Map();
    }

    on(name, listener) {
        if (!this.listeners.has(name)) {
            this.listeners.set(name, new Set());
        }

        this.listeners.get(name).add(listener);
        return () => this.off(name, listener);
    }

    off(name, listener) {
        this.listeners.get(name)?.delete(listener);
    }

    emit(name, payload) {
        for (const listener of this.listeners.get(name) || []) {
            listener(payload);
        }
    }

    clearListeners() {
        this.listeners.clear();
    }
}
