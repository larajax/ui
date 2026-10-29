/**
 * Mouse, keyboard and clipboard handling. Keys arrive at the editor textarea, which keeps focus while the
 * grid is active; a mouse press outside the grid commits any edit and clears the selection.
 */

function cellPosition(el) {
    return { row: Number(el.dataset.row), col: Number(el.dataset.col) };
}

/**
 * onKeyDown handles keys while the editor is open (commit, cancel, move) and while it is closed
 * (navigate, start editing, clear, undo).
 */
function onKeyDown(sheet, event) {
    if (!sheet.selection || event.isComposing || event.keyCode === 229) {
        return;
    }

    const command = (event.ctrlKey || event.metaKey) && !event.altKey;
    const { editor } = sheet;

    if (editor.isOpen()) {
        onEditorKeyDown(sheet, event, command);
        return;
    }

    // The host's own shortcuts come first
    if (typeof sheet.options.keyHandler === 'function' && sheet.options.keyHandler(event, sheet)) {
        event.preventDefault();
        return;
    }

    // Space, Enter, Delete and Backspace toggle or uncheck a selection starting on a checkbox
    if (!command && (event.key === ' ' || event.key === 'Enter') && sheet.changeCheckboxes(false)) {
        event.preventDefault();
        return;
    }

    if (!command && (event.key === 'Delete' || event.key === 'Backspace') && sheet.changeCheckboxes(true)) {
        event.preventDefault();
        return;
    }

    // A printable key starts editing with that character
    if (event.key.length === 1 && !command) {
        sheet.beginTyping();
        return;
    }

    const handled = onGridKeyDown(sheet, event, command);
    if (handled !== false) {
        event.preventDefault();
    }
}

function onEditorKeyDown(sheet, event, command) {
    const { editor } = sheet;

    // Alt+Down opens the native date or time picker
    if (event.altKey && event.key === 'ArrowDown' && sheet.picker.isAttached()) {
        event.preventDefault();
        sheet.openPicker();
        return;
    }

    // Up and Down move through an open option list
    if (sheet.optionList.isOpen() && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        sheet.moveOptionHighlight(event.key === 'ArrowDown' ? 1 : -1);
        return;
    }

    switch (event.key) {
        case 'Enter':
            event.preventDefault();
            if (command || event.altKey) {
                editor.insertLineBreak();
                return;
            }
            sheet.commitEditor();
            sheet.moveActive(event.shiftKey ? -1 : 1, 0);
            return;

        case 'Tab':
            event.preventDefault();
            sheet.commitEditor();
            sheet.moveActive(0, event.shiftKey ? -1 : 1);
            return;

        case 'Escape':
            event.preventDefault();
            sheet.cancelEditor();
            return;

        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            // Arrows move the caret when the edit started from the cell's value
            if (editor.mode === 'full') {
                return;
            }
            event.preventDefault();
            sheet.commitEditor();
            arrow(sheet, event.key, event.shiftKey);
            return;

        default:
            return;
    }
}

function arrow(sheet, key, extend) {
    const steps = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1]
    };
    const [rowStep, colStep] = steps[key];

    if (extend) {
        sheet.extendFocus(rowStep, colStep);
    }
    else {
        sheet.moveActive(rowStep, colStep);
    }
}

/**
 * onGridKeyDown handles a key with the editor closed, returning false when the key was not used.
 */
function onGridKeyDown(sheet, event, command) {
    const { anchor } = sheet.selection;
    const lastRow = sheet.getRowCount() - 1;
    const lastCol = sheet.getColumnCount() - 1;

    const jumpTo = (row, col) => {
        if (event.shiftKey) {
            sheet.select(anchor.row, anchor.col, row, col);
        }
        else {
            sheet.select(row, col);
        }
    };

    switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            arrow(sheet, event.key, event.shiftKey);
            return true;

        case 'Tab':
            sheet.moveActive(0, event.shiftKey ? -1 : 1);
            return true;

        case 'Enter':
            if (!sheet.openEditor('full') && !sheet.isCellEditable(anchor.row, anchor.col)) {
                sheet.moveActive(event.shiftKey ? -1 : 1, 0);
            }
            return true;

        case 'F2':
            sheet.openEditor('full');
            return true;

        case 'Delete':
        case 'Backspace':
            sheet.clearSelection();
            return true;

        case 'Home':
            jumpTo(command ? 0 : anchor.row, command ? anchor.col : 0);
            return true;

        case 'End':
            jumpTo(command ? lastRow : anchor.row, command ? anchor.col : lastCol);
            return true;

        case 'PageUp':
            sheet.moveActive(-sheet.countVisibleRows(), 0);
            return true;

        case 'PageDown':
            sheet.moveActive(sheet.countVisibleRows(), 0);
            return true;

        // With nothing to cancel, Escape carries on to the page, so a dialog holding the grid can close
        case 'Escape':
            return false;

        default:
            break;
    }

    if (command) {
        switch (event.key.toLowerCase()) {
            case 'a':
                sheet.selectAll();
                return true;

            case 'z':
                if (event.shiftKey) {
                    sheet.redo();
                }
                else {
                    sheet.undo();
                }
                return true;

            case 'y':
                sheet.redo();
                return true;

            default:
                break;
        }
    }

    return false;
}

// How far a drag past the grid's edge scrolls it for each movement of the pointer
const DRAG_SCROLL_Y = 20;
const DRAG_SCROLL_X = 50;

// How far a finger may wander before a touch counts as a drag, and how long a press lasts before it opens
// the context menu
const TOUCH_SLOP = 8;
const LONG_PRESS_MS = 550;

/**
 * bindInput attaches the grid's listeners and returns a function that removes them.
 */
export function bindInput(sheet) {
    const root = sheet.element;
    const { textarea } = sheet.editor;
    let dragging = null;
    let movingRows = [];
    let movingCols = [];
    let resizing = null;
    let filling = null;

    // Dragging past the edge of the grid's scroll box scrolls it a step for each movement of the pointer
    // outside, measured against the box as it was when the drag started
    let scrollBounds = null;

    const dragScroll = (event) => {
        const { scroller } = sheet.elements;

        if (event.clientY < scrollBounds.top) {
            scroller.scrollTop -= DRAG_SCROLL_Y;
        }
        else if (event.clientY > scrollBounds.bottom) {
            scroller.scrollTop += DRAG_SCROLL_Y;
        }

        if (event.clientX < scrollBounds.left) {
            scroller.scrollLeft -= DRAG_SCROLL_X;
        }
        else if (event.clientX > scrollBounds.right) {
            scroller.scrollLeft += DRAG_SCROLL_X;
        }
    };

    // Without multiSelect a header press selects one cell, so the header that made that selection is kept for moving
    let pickedHeader = null;

    const isPickedRow = (selection, row) => sheet.options.multiSelect
        ? isWholeRows(selection, sheet.getColumnCount() - 1) && isInside(selection, row, 0)
        : pickedHeader?.row === row && selection.anchor.row === row && selection.anchor.col === 0;

    const isPickedColumn = (selection, col) => sheet.options.multiSelect
        ? isWholeColumns(selection, sheet.getRowCount() - 1) && isInside(selection, 0, col)
        : pickedHeader?.col === col && selection.anchor.row === 0 && selection.anchor.col === col;

    const dropLine = document.createElement('div');
    dropLine.className = 'hotsheet-drop-line';
    dropLine.hidden = true;
    sheet.elements.table.append(dropLine);

    // A resize remembers the column's own width, so cancelling it puts back a width shared with other columns
    const startResize = (headerEl, startX) => {
        const col = Number(headerEl.dataset.col);
        return { col, startX, startWidth: headerEl.offsetWidth, originalWidth: sheet.getColumns()[col]?.width ?? null };
    };

    const onMouseDown = (event) => {
        if (event.target === textarea || (event.button !== 0 && event.button !== 2)) {
            return;
        }

        // The square on the selection's corner starts a fill
        if (event.target.classList.contains('hotsheet-fill-handle')) {
            if (event.button === 0) {
                event.preventDefault();
                sheet.commitEditor();
                filling = null;
                dragging = 'fill';
                scrollBounds = sheet.elements.scroller.getBoundingClientRect();
                sheet.editor.focus();
            }
            return;
        }

        const cellEl = event.target.closest('.hotsheet-cell');
        const rowHeaderEl = event.target.closest('.hotsheet-row-header');
        const headerEl = event.target.closest('.hotsheet-header');

        if (!cellEl && !rowHeaderEl && !headerEl) {
            return;
        }

        event.preventDefault();
        sheet.commitEditor();

        // The handle on a header's right edge resizes its column without selecting anything
        if (event.target.classList.contains('hotsheet-resizer') && event.button === 0) {
            resizing = startResize(headerEl, event.clientX);
            root.classList.add('is-resizing');
            dragging = 'resize';
            return;
        }

        const selection = sheet.getSelection();
        const lastRow = sheet.getRowCount() - 1;
        const lastCol = sheet.getColumnCount() - 1;

        if (cellEl) {
            const { row, col } = cellPosition(cellEl);

            if (event.button === 2 && selection && isInside(selection, row, col)) {
                // A right click inside the selection keeps it for the context menu
            }
            else if (event.shiftKey && selection) {
                sheet.select(selection.anchor.row, selection.anchor.col, row, col, { notify: false });
            }
            else {
                sheet.select(row, col, row, col, { notify: false });
            }

            pickedHeader = null;
            dragging = event.button === 0 ? 'cells' : null;
        }
        else if (rowHeaderEl) {
            const row = Number(rowHeaderEl.dataset.row);

            // Pressing a row header inside a selection of whole rows starts moving them
            if (event.button === 0 && sheet.canMoveRows() && selection && isPickedRow(selection, row)) {
                const top = Math.min(selection.anchor.row, selection.focus.row);
                const bottom = Math.max(selection.anchor.row, selection.focus.row);
                movingRows = Array.from({ length: bottom - top + 1 }, (_, i) => top + i);
                dragging = 'move';
            }
            else {
                sheet.select(row, 0, row, lastCol, { scroll: false, notify: false });
                pickedHeader = { row };
                dragging = event.button === 0 ? 'rows' : null;
            }
        }
        else if (headerEl) {
            const col = Number(headerEl.dataset.col);
            const onLabel = event.target.classList.contains('hotsheet-header-label');

            // Pressing a header inside a selection of whole columns (away from its label) starts moving them
            if (event.button === 0 && !onLabel && sheet.options.columnMove && selection && isPickedColumn(selection, col)) {
                const left = Math.min(selection.anchor.col, selection.focus.col);
                const right = Math.max(selection.anchor.col, selection.focus.col);
                movingCols = Array.from({ length: right - left + 1 }, (_, i) => left + i);
                dragging = 'moveColumns';
            }
            else {
                sheet.select(0, col, lastRow, col, { scroll: false, notify: false });
                pickedHeader = { col };
                dragging = event.button === 0 ? 'columns' : null;

                if (onLabel && event.button === 0 && sheet.options.sorting) {
                    dragging = null;
                    sheet.cycleSort(col);
                }
            }
        }

        sheet.editor.focus();
        scrollBounds = dragging ? sheet.elements.scroller.getBoundingClientRect() : null;

        if (!dragging) {
            sheet.emit('select', { selection: sheet.getSelection() });
        }
    };

    /**
     * extendDrag follows a drag over an element: the selection grows over cells and headers, and the fill
     * area over cells.
     */
    const extendDrag = (target) => {
        if (!dragging || !sheet.selection || !target) {
            return;
        }

        const { anchor } = sheet.selection;
        const lastRow = sheet.getRowCount() - 1;
        const lastCol = sheet.getColumnCount() - 1;

        if (dragging === 'cells') {
            const cellEl = target.closest('.hotsheet-cell');
            if (cellEl) {
                const { row, col } = cellPosition(cellEl);
                sheet.select(anchor.row, anchor.col, row, col, { scroll: false, notify: false });
            }
        }
        else if (dragging === 'fill') {
            const cellEl = target.closest('.hotsheet-cell');
            if (cellEl) {
                const { row, col } = cellPosition(cellEl);
                filling = sheet.fillArea(row, col);
                sheet.showFillArea(filling);
            }
        }
        else if (dragging === 'rows') {
            const headerEl = target.closest('.hotsheet-row-header');
            if (headerEl) {
                sheet.select(anchor.row, 0, Number(headerEl.dataset.row), lastCol, { scroll: false, notify: false });
            }
        }
        else if (dragging === 'columns') {
            const headerEl = target.closest('.hotsheet-header');
            if (headerEl) {
                sheet.select(0, anchor.col, lastRow, Number(headerEl.dataset.col), { scroll: false, notify: false });
            }
        }
    };

    const onMouseOver = (event) => extendDrag(event.target);

    /**
     * dropGap returns the gap between rows nearest the pointer, 0 being before the first row.
     */
    const dropGap = (clientY) => sheet.rowGapAt(clientY);

    /**
     * columnGap returns the gap between columns nearest the pointer, 0 being before the first column.
     */
    const columnGap = (clientX) => {
        for (let col = 0; col < sheet.getColumnCount(); col++) {
            const rect = sheet.getHeaderElement(col).getBoundingClientRect();
            if (clientX < rect.left + rect.width / 2) {
                return col;
            }
        }
        return sheet.getColumnCount();
    };

    const onMouseMove = (event) => {
        if (dragging && scrollBounds) {
            dragScroll(event);
        }

        if (dragging === 'resize') {
            sheet.resizeColumn(resizing.col, resizing.startWidth + event.clientX - resizing.startX);
        }
        else if (dragging === 'move') {
            const gap = dropGap(event.clientY);
            const rowEl = sheet.getRowElement(gap) || sheet.getRowElement(gap - 1);
            dropLine.classList.remove('is-vertical');
            dropLine.style.left = '';
            dropLine.hidden = false;
            dropLine.style.top = `${gap < sheet.getRowCount() ? rowEl.offsetTop : rowEl.offsetTop + rowEl.offsetHeight}px`;
        }
        else if (dragging === 'moveColumns') {
            const gap = columnGap(event.clientX);
            const headerEl = sheet.getHeaderElement(gap) || sheet.getHeaderElement(gap - 1);
            dropLine.classList.add('is-vertical');
            dropLine.style.top = '';
            dropLine.hidden = false;
            dropLine.style.left = `${gap < sheet.getColumnCount() ? headerEl.offsetLeft : headerEl.offsetLeft + headerEl.offsetWidth}px`;
        }
    };

    const onMouseUp = (event) => {
        scrollBounds = null;

        if (dragging === 'resize') {
            dragging = null;
            root.classList.remove('is-resizing');
            return;
        }

        if (dragging === 'move') {
            dragging = null;
            dropLine.hidden = true;

            // Dropping the rows back in their place, or a press without a drag, moves nothing
            const gap = dropGap(event.clientY);
            if (gap < movingRows[0] || gap > movingRows[movingRows.length - 1] + 1) {
                sheet.moveRows(movingRows, gap);
            }

            pickedHeader = { row: sheet.getActiveCell()?.row };
            return;
        }

        if (dragging === 'moveColumns') {
            dragging = null;
            dropLine.hidden = true;
            sheet.moveColumns(movingCols, columnGap(event.clientX));
            pickedHeader = { col: sheet.getActiveCell()?.col };
            return;
        }

        if (dragging === 'fill') {
            dragging = null;
            sheet.showFillArea(null);
            sheet.fill(filling);
            filling = null;
            return;
        }

        if (dragging) {
            dragging = null;
            sheet.emit('select', { selection: sheet.getSelection() });
        }
    };

    const onContextMenu = (event) => {
        // A long press already opened the menu
        if (touch?.longPressed) {
            event.preventDefault();
            return;
        }

        if (event.target.closest('.hotsheet-cell, .hotsheet-row-header') && sheet.openContextMenu(event.clientX, event.clientY)) {
            event.preventDefault();
        }
    };

    // Touch. Taps arrive as the mouse events browsers make from them, so selecting, checkboxes, sorting and
    // double taps work as clicks do. Finger drags are followed here: from the selected cell (selecting a
    // range), the fill handle, the row headers of a selection (moving rows) and a selected column's resizer,
    // which don't scroll (touch-action: none); anywhere else a finger scrolls. Tapping the selected cell again
    // edits it, and a long press opens the context menu.
    let touch = null;
    let editOnTap = null;

    const onTouchPointerDown = (event) => {
        if (event.pointerType !== 'touch' || !event.isPrimary) {
            return;
        }

        const { target } = event;
        const cellEl = target.closest('.hotsheet-cell');
        const rowHeaderEl = target.closest('.hotsheet-row-header');
        const selection = sheet.getSelection();
        let kind = null;

        if (target.classList.contains('hotsheet-fill-handle') && sheet.canFill()) {
            kind = 'fill';
        }
        else if (target.classList.contains('hotsheet-resizer')) {
            kind = 'resize';
        }
        else if (cellEl?.classList.contains('is-active') && sheet.options.multiSelect) {
            kind = 'cells';
        }
        else if (rowHeaderEl && sheet.canMoveRows() && selection && isPickedRow(selection, Number(rowHeaderEl.dataset.row))) {
            kind = 'move';
        }

        touch = {
            x: event.clientX,
            y: event.clientY,
            target,
            kind,
            cellEl,
            rowHeaderEl,
            wasActive: !!cellEl?.classList.contains('is-active'),
            moved: false,
            longPressed: false,
            timer: cellEl || rowHeaderEl ? setTimeout(onLongPress, LONG_PRESS_MS) : null
        };
    };

    const onLongPress = () => {
        touch.longPressed = true;
        const selection = sheet.getSelection();

        // The menu acts on what was pressed, selecting it first unless it is already selected
        if (touch.cellEl) {
            const { row, col } = cellPosition(touch.cellEl);
            if (!selection || !isInside(selection, row, col)) {
                sheet.select(row, col);
            }
        }
        else if (touch.rowHeaderEl) {
            const row = Number(touch.rowHeaderEl.dataset.row);
            if (!selection || !isInside(selection, row, 0)) {
                sheet.select(row, 0, row, sheet.getColumnCount() - 1, { scroll: false });
            }
        }

        sheet.openContextMenu(touch.x, touch.y);
    };

    /**
     * startTouchDrag begins a finger drag the way a mouse press on the same element would.
     */
    const startTouchDrag = () => {
        sheet.commitEditor();

        if (touch.kind === 'fill') {
            filling = null;
            dragging = 'fill';
        }
        else if (touch.kind === 'resize') {
            resizing = startResize(touch.target.closest('.hotsheet-header'), touch.x);
            root.classList.add('is-resizing');
            dragging = 'resize';
            return;
        }
        else if (touch.kind === 'move') {
            const { anchor, focus } = sheet.getSelection();
            const top = Math.min(anchor.row, focus.row);
            movingRows = Array.from({ length: Math.max(anchor.row, focus.row) - top + 1 }, (_, i) => top + i);
            dragging = 'move';
        }
        else {
            dragging = 'cells';
        }

        scrollBounds = sheet.elements.scroller.getBoundingClientRect();
    };

    const onTouchPointerMove = (event) => {
        if (event.pointerType !== 'touch' || !touch) {
            return;
        }

        if (!touch.moved && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > TOUCH_SLOP) {
            touch.moved = true;
            clearTimeout(touch.timer);

            if (touch.kind) {
                startTouchDrag();
            }
        }

        if (touch.moved && dragging) {
            onMouseMove(event);
            extendDrag(document.elementFromPoint(event.clientX, event.clientY));
        }
    };

    const onTouchPointerUp = (event) => {
        if (event.pointerType !== 'touch' || !touch) {
            return;
        }

        clearTimeout(touch.timer);

        // A cancelled touch drops its drag rather than completing it
        if (event.type === 'pointercancel') {
            abortDrag();
            touch = null;
            return;
        }

        if (dragging && touch.moved) {
            onMouseUp(event);
        }
        else if (!touch.moved && !touch.longPressed && touch.wasActive) {
            editOnTap = touch.cellEl;
        }
    };

    const abortDrag = () => {
        dragging = null;
        filling = null;
        scrollBounds = null;
        dropLine.hidden = true;
        sheet.showFillArea(null);
        root.classList.remove('is-resizing');
    };

    /**
     * onDocumentKeyDown lets Escape cancel a drag wherever focus is: a fill, move or resize is dropped and the
     * column width put back, while a selection drag keeps the cells reached so far.
     */
    const onDocumentKeyDown = (event) => {
        if (event.key !== 'Escape' || !dragging) {
            return;
        }

        event.preventDefault();

        const isSelecting = dragging === 'cells' || dragging === 'rows' || dragging === 'columns';
        if (dragging === 'resize') {
            sheet.resizeColumn(resizing.col, resizing.originalWidth);
        }

        abortDrag();

        if (isSelecting) {
            sheet.emit('select', { selection: sheet.getSelection() });
        }
    };

    // After a long press the browser would still turn the touch into a click, which is cancelled here
    const onTouchEnd = (event) => {
        if (touch?.longPressed) {
            event.preventDefault();
        }
        touch = null;
    };

    const onDoubleClick = (event) => {
        if (event.target.classList.contains('hotsheet-fill-handle')) {
            sheet.fillDown();
            return;
        }

        const cellEl = event.target.closest('.hotsheet-cell');
        if (!cellEl || event.target === textarea) {
            return;
        }

        const { row, col } = cellPosition(cellEl);
        sheet.select(row, col, row, col, { scroll: false, notify: false });

        // A checkbox has no editor: double clicking beside the box toggles it (the box itself already toggled)
        if (!sheet.openEditor('full') && !event.target.classList.contains('hotsheet-checkbox')) {
            sheet.toggleCell(row, col);
        }
    };

    const onDocumentMouseDown = (event) => {
        if (!root.contains(event.target) && sheet.selection) {
            sheet.commitEditor();
            sheet.deselect();
        }
    };

    const onCompositionStart = () => {
        if (!sheet.editor.isOpen()) {
            sheet.beginTyping();
        }
    };

    const onEditorInput = () => {
        if (sheet.editor.isOpen()) {
            sheet.updateOptions();
        }
    };

    // Checkboxes change through the data, so the native toggle is cancelled and the cell re-rendered. Every
    // click toggles, as with any checkbox, since quick clicks and a double click can't be told apart.
    const onClick = (event) => {
        if (event.target.classList.contains('hotsheet-checkbox')) {
            event.preventDefault();
            const { row, col } = cellPosition(event.target.closest('.hotsheet-cell'));
            sheet.toggleCell(row, col);
        }
        else if (event.target === sheet.picker.button) {
            sheet.openPicker();
        }
        else if (editOnTap && event.target.closest('.hotsheet-cell') === editOnTap && sheet.openEditor('full')) {
            sheet.editor.refocus();
        }

        editOnTap = null;
    };

    const onCopy = (event) => {
        if (sheet.editor.isOpen() || !sheet.selection) {
            return;
        }

        event.preventDefault();
        event.clipboardData.setData('text/plain', sheet.copyText());

        if (event.type === 'cut') {
            sheet.clearSelection('cut');
        }
    };

    const onPaste = (event) => {
        if (sheet.editor.isOpen() || !sheet.selection) {
            return;
        }

        event.preventDefault();
        sheet.paste(event.clipboardData.getData('text/plain'));
    };

    const onTextareaKeyDown = (event) => onKeyDown(sheet, event);

    // Scrolling (the grid, the page or any parent) and resizing can bring undrawn rows into view and move the
    // selection's corner without a repaint, so both are checked once per frame
    let viewFrame = null;
    const onViewChange = () => {
        if (viewFrame === null) {
            viewFrame = requestAnimationFrame(() => {
                viewFrame = null;
                sheet.updateWindow();
                sheet.placeFillHandle();
            });
        }
    };
    const resizeObserver = new ResizeObserver(onViewChange);

    root.addEventListener('mousedown', onMouseDown);
    root.addEventListener('mouseover', onMouseOver);
    root.addEventListener('dblclick', onDoubleClick);
    root.addEventListener('click', onClick);
    root.addEventListener('contextmenu', onContextMenu);
    root.addEventListener('pointerdown', onTouchPointerDown);
    root.addEventListener('touchend', onTouchEnd, { passive: false });
    document.addEventListener('pointermove', onTouchPointerMove);
    document.addEventListener('pointerup', onTouchPointerUp);
    document.addEventListener('pointercancel', onTouchPointerUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousedown', onDocumentMouseDown, true);
    document.addEventListener('keydown', onDocumentKeyDown, true);
    textarea.addEventListener('keydown', onTextareaKeyDown);
    textarea.addEventListener('input', onEditorInput);
    textarea.addEventListener('compositionstart', onCompositionStart);
    textarea.addEventListener('copy', onCopy);
    textarea.addEventListener('cut', onCopy);
    textarea.addEventListener('paste', onPaste);
    document.addEventListener('scroll', onViewChange, { capture: true, passive: true });
    window.addEventListener('resize', onViewChange);
    resizeObserver.observe(sheet.elements.table);

    return () => {
        root.removeEventListener('mousedown', onMouseDown);
        root.removeEventListener('mouseover', onMouseOver);
        root.removeEventListener('dblclick', onDoubleClick);
        root.removeEventListener('click', onClick);
        root.removeEventListener('contextmenu', onContextMenu);
        root.removeEventListener('pointerdown', onTouchPointerDown);
        root.removeEventListener('touchend', onTouchEnd);
        document.removeEventListener('pointermove', onTouchPointerMove);
        document.removeEventListener('pointerup', onTouchPointerUp);
        document.removeEventListener('pointercancel', onTouchPointerUp);
        clearTimeout(touch?.timer);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        dropLine.remove();
        document.removeEventListener('mousedown', onDocumentMouseDown, true);
        document.removeEventListener('keydown', onDocumentKeyDown, true);
        textarea.removeEventListener('keydown', onTextareaKeyDown);
        textarea.removeEventListener('input', onEditorInput);
        textarea.removeEventListener('compositionstart', onCompositionStart);
        textarea.removeEventListener('copy', onCopy);
        textarea.removeEventListener('cut', onCopy);
        textarea.removeEventListener('paste', onPaste);
        document.removeEventListener('scroll', onViewChange, { capture: true });
        window.removeEventListener('resize', onViewChange);
        resizeObserver.disconnect();
        cancelAnimationFrame(viewFrame);
    };
}

function isWholeColumns(selection, lastRow) {
    return Math.min(selection.anchor.row, selection.focus.row) === 0 && Math.max(selection.anchor.row, selection.focus.row) === lastRow;
}

function isWholeRows(selection, lastCol) {
    return Math.min(selection.anchor.col, selection.focus.col) === 0 && Math.max(selection.anchor.col, selection.focus.col) === lastCol;
}

function isInside(selection, row, col) {
    const top = Math.min(selection.anchor.row, selection.focus.row);
    const bottom = Math.max(selection.anchor.row, selection.focus.row);
    const left = Math.min(selection.anchor.col, selection.focus.col);
    const right = Math.max(selection.anchor.col, selection.focus.col);

    return row >= top && row <= bottom && col >= left && col <= right;
}
