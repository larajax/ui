/*
 * A stand-in for the bundled Monaco module. Test files share this one because the Monaco loader
 * keeps the first module it loads for the rest of the run.
 */

export const editors = [];
export const calls = [];
export const emmetCalls = [];

// Editor support the fake reports, toggled per test
export const support = { canUndo: false, canRedo: false, format: false };

export function resetFakeMonaco() {
    editors.length = 0;
    calls.length = 0;
    Object.assign(support, { canUndo: false, canRedo: false, format: false });
}

export class FakeModel {
    constructor(value, language) {
        this.value = value;
        this.language = language;
        this.eol = null;
        this.disposed = false;
    }

    getLanguageId() { return this.language; }
    canUndo() { return support.canUndo; }
    canRedo() { return support.canRedo; }
    setEOL(eol) { this.eol = eol; }
    dispose() { this.disposed = true; }
}

export class FakeEditor {
    constructor(container, options) {
        this.container = container;
        this.options = options;
        this.model = new FakeModel(options.value, options.language);
        this.listeners = {};
        this.commands = [];
        this.contextKeys = {};
        this.disposed = false;
        editors.push(this);
    }

    onDidChangeModelContent(callback) { this.listeners.change = callback; }
    onDidFocusEditorText(callback) { this.listeners.focus = callback; }
    onDidBlurEditorText(callback) { this.listeners.blur = callback; }
    addCommand(keybinding, handler, context) { this.commands.push({ keybinding, handler, context }); }

    createContextKey(name, value) {
        const key = { value, set: (next) => { key.value = next; } };
        this.contextKeys[name] = key;
        return key;
    }

    getModel() { return this.model; }
    getValue() { return this.model.value; }

    setValue(value) {
        this.model.value = value;
        this.listeners.change();
    }

    getAction(id) {
        return {
            run: () => calls.push(['action', id]),
            isSupported: () => id !== 'editor.action.formatDocument' || support.format
        };
    }

    trigger(source, id) { calls.push(['trigger', id]); }
    updateOptions(options) { calls.push(['updateOptions', options]); }
    hasTextFocus() { return false; }
    layout() { calls.push(['layout']); }
    focus() { calls.push(['focus']); }
    dispose() { this.disposed = true; }
}

export const fakeMonaco = {
    KeyMod: { CtrlCmd: 2048, Shift: 1024, Alt: 512 },
    KeyCode: { KeyF: 36, KeyZ: 56, Escape: 9 },
    editor: {
        EndOfLineSequence: { LF: 0, CRLF: 1 },
        create: (container, options) => new FakeEditor(container, options),
        setTheme: (theme) => calls.push(['setTheme', theme])
    },
    languages: {
        getLanguages: () => [
            { id: 'php', aliases: ['PHP', 'php'] },
            { id: 'plaintext', aliases: ['Plain Text', 'text'] }
        ]
    },
    emmetHTML: (monaco, languages) => emmetCalls.push(['emmetHTML', languages]),
    emmetCSS: (monaco, languages) => emmetCalls.push(['emmetCSS', languages])
};
