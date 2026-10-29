import { closeHistory } from '@tiptap/pm/history';
import { normalizeHtml } from './html/normalizer.js';
import { insertionChain } from './commands/helpers.js';

/**
 * RichAreaFacade is the engine neutral editor surface passed to registered button
 * callbacks, native holds the TipTap editor for anything beyond it.
 */
export class RichAreaFacade {
    constructor(richArea) {
        this.richArea = richArea;
        this.native = richArea.editor;
        this.engine = 'tiptap';
    }

    insertHtml(html) {
        insertionChain(this.native).insertContent(normalizeHtml(html)).run();
    }

    insertElement(element) {
        const node = element && element.jquery ? element.get(0) : element;
        if (node) {
            this.insertHtml(node.outerHTML);
        }
    }

    insertUiBlock(node) {
        this.insertElement(node);
    }

    getContent() {
        return this.richArea.getContent();
    }

    setContent(html) {
        this.richArea.setContent(html, { emitChange: true, undoable: true });
    }

    saveSelection() {
        this.richArea.saveSelection();
    }

    restoreSelection() {
        this.richArea.restoreSelection();
    }

    focus() {
        this.richArea.focus();
    }

    saveUndoStep() {
        this.native.view.dispatch(closeHistory(this.native.state.tr));
    }
}
