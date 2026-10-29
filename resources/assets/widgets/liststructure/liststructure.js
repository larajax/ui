/*
 * List structure widget control
 *
 * Data attributes:
 * - data-control="liststructurewidget" - enables the control
 * - data-reorder-handler - AJAX handler for reorder postbacks
 * - data-toggle-handler - AJAX handler for tree node toggling
 * - data-use-reorder / data-use-tree / data-drag-row
 * - data-include-sort-orders - include sort_orders in the postback
 * - data-indent-size - pixels per tree level
 * - data-max-depth - maximum nesting depth
 *
 * Tree node toggling posts through plain data-request attributes; this
 * control implements the drag reorder interaction with pointer events.
 */
'use strict';

/**
 * Pointer travel in pixels before a press becomes a drag.
 */
const DRAG_THRESHOLD = 4;

/**
 * Distance in pixels from a scrollable edge that starts auto scrolling.
 */
const SCROLL_SENSITIVITY = 60;

/**
 * Pixels scrolled on each auto scroll tick.
 */
const SCROLL_SPEED = 20;

/**
 * Milliseconds between auto scroll ticks.
 */
const SCROLL_INTERVAL = 24;

/**
 * isTouchEnabled returns true only for pure touch devices, false for hybrid devices like touch laptops.
 */
export function isTouchEnabled() {
    if (typeof window.matchMedia !== 'function') {
        return false;
    }

    return window.matchMedia('(pointer: coarse)').matches &&
        !window.matchMedia('(pointer: fine)').matches;
}

/**
 * getAutoScrollDirection returns 1, -1 or 0 for one axis when the pointer is near an edge that can still scroll.
 */
export function getAutoScrollDirection(pointer, start, end, scrollPos, clientSize, scrollSize, sensitivity) {
    const forward = Math.abs(end - pointer) <= sensitivity && scrollPos + clientSize < scrollSize;
    const backward = Math.abs(start - pointer) <= sensitivity && scrollPos > 0;

    return (forward ? 1 : 0) - (backward ? 1 : 0);
}

export function registerListStructureWidget(jax) {
    jax.registerControl('liststructurewidget', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({
                reorderHandler: null,
                toggleHandler: null,
                useReorder: false,
                useTree: false,
                dragRow: true,
                includeSortOrders: false,
                indentSize: 18,
                maxDepth: null
            }, this.config);

            if (isTouchEnabled()) {
                this.config.dragRow = false;
            }

            this.pointer = null;
            this.onPointerMove = this.onPointerMove.bind(this);
            this.onPointerUp = this.onPointerUp.bind(this);
            this.onAutoScroll = this.onAutoScroll.bind(this);
        }

        connect() {
            this.tableBody = this.element.querySelector('table > tbody');

            if (this.toBool(this.config.useReorder)) {
                this.initReorder();
            }
        }

        disconnect() {
            if (this.toBool(this.config.useReorder)) {
                this.destroyReorder();
            }

            this.tableBody = null;
        }

        initReorder() {
            this.dragging = false;

            this.dragBoundary = {};
            this.dragStartX = 0;
            this.draggingX = 0;

            this.activeItem = null;
            this.activeChildren = null;
            this.lastChildDiff = null;

            this.listen('pointerdown', this.onPointerDown);

            // Capture phase so row links never see the click that ends a drag
            this.listen('click', this.onClickCapture, true);
        }

        destroyReorder() {
            this.stopAutoScroll();
            this.removePointerListeners();
            this.pointer = null;
            this.dragging = false;
            this.activeItem = null;
            this.activeChildren = null;
        }

        //
        // Pointer tracking
        //

        onPointerDown(ev) {
            if (ev.button !== 0 || ev.isPrimary === false || this.pointer || !this.tableBody) {
                return;
            }

            // Filtered elements never start a drag
            const filtered = ev.target.closest('.no-sort');
            if (filtered && this.tableBody.contains(filtered)) {
                return;
            }

            const handle = ev.target.closest('.list-reorder-handle');
            let row = null;

            if (handle) {
                row = handle.closest('tr[data-tree-id]');
            }
            else if (this.toBool(this.config.dragRow)) {
                // Avoid starting a drag from interactive elements
                if (ev.target.closest('a, input, select, textarea, button, label')) {
                    return;
                }
                row = ev.target.closest('tr[data-tree-id]');
            }

            if (!row || row.parentNode !== this.tableBody) {
                return;
            }

            this.pointer = {
                row: row,
                originalEvent: ev,
                startX: ev.clientX,
                startY: ev.clientY,
                clientX: ev.clientX,
                clientY: ev.clientY,
                suppressClick: false
            };

            window.addEventListener('pointermove', this.onPointerMove);
            window.addEventListener('pointerup', this.onPointerUp);
            window.addEventListener('pointercancel', this.onPointerUp);

            ev.preventDefault();
        }

        onPointerMove(ev) {
            const pointer = this.pointer;
            if (!pointer) {
                return;
            }

            // Require a small threshold before entering drag mode, so clicks
            // and row links keep working
            if (!this.dragging) {
                if (Math.abs(ev.clientX - pointer.startX) < DRAG_THRESHOLD &&
                    Math.abs(ev.clientY - pointer.startY) < DRAG_THRESHOLD
                ) {
                    return;
                }

                this.onDragStart(pointer.originalEvent);
            }

            pointer.suppressClick = true;
            pointer.clientX = ev.clientX;
            pointer.clientY = ev.clientY;

            this.onDragOver(ev.clientY);
            this.onDragging(ev);
            this.updateAutoScroll();
        }

        onPointerUp() {
            this.removePointerListeners();
            this.stopAutoScroll();

            if (!this.pointer) {
                return;
            }

            if (!this.dragging) {
                this.pointer = null;
                return;
            }

            this.onDragStop();

            // Keep click suppression until after the click event fires
            setTimeout(() => {
                this.pointer = null;
            }, 0);
        }

        onClickCapture(ev) {
            if (this.pointer && this.pointer.suppressClick) {
                ev.stopPropagation();
                ev.preventDefault();
            }
        }

        removePointerListeners() {
            window.removeEventListener('pointermove', this.onPointerMove);
            window.removeEventListener('pointerup', this.onPointerUp);
            window.removeEventListener('pointercancel', this.onPointerUp);
        }

        //
        // Drag lifecycle
        //

        onDragMove(evt) {
            const item = evt.related;

            if (evt.willInsertAfter && !this.canInsertAfter(item)) {
                return false;
            }

            if (!evt.willInsertAfter && !this.canInsertBefore(item)) {
                return false;
            }
        }

        onDragStart(evt) {
            const item = this.pointer.row;

            this.dragging = true;
            this.activeItem = item;
            this.activeChildren = this.getChildren(item);
            this.dragStartX = this.getEventPageX(evt);
            this.tableBody.classList.add('tree-drag-mode');
            item.classList.add('sortable-chosen');

            const currentDepth = this.getTreeLevel(item);
            let lastChildDiff = 0;

            this.activeChildren.forEach((child) => {
                child.style.display = 'none';

                const childDiff = this.getTreeLevel(child) - currentDepth;
                if (childDiff > lastChildDiff) {
                    lastChildDiff = childDiff;
                }
            });

            this.lastChildDiff = lastChildDiff;
            this.scrollContainers = this.getScrollContainers();
            this.setTargetBoundary();
        }

        onDragOver(clientY) {
            const item = this.activeItem,
                target = this.rowFromPoint(clientY);

            if (!target) {
                return;
            }

            const rect = target.getBoundingClientRect(),
                willInsertAfter = clientY >= rect.top + rect.height / 2,
                neighbour = willInsertAfter ? target.nextElementSibling : target.previousElementSibling;

            // Already in place
            if (neighbour === item) {
                return;
            }

            if (this.onDragMove({ related: target, willInsertAfter: willInsertAfter }) === false) {
                return;
            }

            if (willInsertAfter) {
                target.after(item);
            }
            else {
                target.before(item);
            }

            this.onChange();
        }

        onChange() {
            this.setTargetBoundary();
        }

        onDragStop() {
            const item = this.activeItem,
                tableBody = this.tableBody,
                activeChildren = this.activeChildren || [];

            this.activeItem = null;
            this.activeChildren = null;
            this.scrollContainers = null;
            this.dragging = false;

            if (!tableBody || !item) {
                return;
            }

            tableBody.classList.add('tree-drag-updated');
            tableBody.classList.remove('tree-drag-mode');
            item.classList.remove('sortable-chosen');

            const currentLevel = this.getTreeLevel(item),
                proposedLevel = item.dataset.treeLevelProposed !== undefined
                    ? parseInt(item.dataset.treeLevelProposed)
                    : currentLevel,
                levelDistance = currentLevel - proposedLevel;

            item.dataset.treeLevel = proposedLevel;
            delete item.dataset.treeLevelProposed;

            // Bring children along for the ride
            activeChildren.forEach((child) => {
                const childLevel = this.getTreeLevel(child);

                child.style.display = '';
                item.after(child);
                this.setIndentOnItem(child, childLevel - levelDistance);
            });

            // Post back data to server
            const postData = this.getMovePostData(item, proposedLevel);

            if (this.toBool(this.config.includeSortOrders)) {
                postData.sort_orders = this.getRecordSortData();
            }

            jax.request(this.element, this.config.reorderHandler, {
                data: postData
            })
                .finally(() => tableBody.classList.remove('tree-drag-updated'))
                .catch(() => {});
        }

        onDragging(ev) {
            if (!this.dragging) {
                return;
            }

            this.draggingX = this.getEventPageX(ev);

            this.setIndent();
        }

        //
        // Move data
        //

        getMovePostData(row, proposedLevel) {
            const data = {
                record_id: row.dataset.treeId
            };

            // Find next row
            let next = row.nextElementSibling;
            while (next) {
                const level = this.getTreeLevel(next);
                if (level === proposedLevel) {
                    data.next_id = next.dataset.treeId;
                    break;
                }
                if (level < proposedLevel) {
                    break;
                }
                next = next.nextElementSibling;
            }

            // Find previous row
            let prev = row.previousElementSibling;
            while (prev) {
                const level = this.getTreeLevel(prev);
                if (level === proposedLevel) {
                    data.previous_id = prev.dataset.treeId;
                    break;
                }
                if (level < proposedLevel) {
                    break;
                }
                prev = prev.previousElementSibling;
            }

            // Find parent row
            prev = row.previousElementSibling;
            while (prev) {
                const level = this.getTreeLevel(prev);
                if (level < proposedLevel) {
                    data.parent_id = prev.dataset.treeId;
                    break;
                }
                prev = prev.previousElementSibling;
            }

            return data;
        }

        getRecordSortData() {
            return [...this.tableBody.querySelectorAll('tr[data-tree-id]')]
                .map((row) => row.dataset.treeId);
        }

        //
        // Tree structure
        //

        getChildren(row) {
            const children = [],
                targetLevel = this.getTreeLevel(row);

            let next = row.nextElementSibling;
            while (next) {
                const currentLevel = this.getTreeLevel(next);
                if (currentLevel > targetLevel) {
                    children.unshift(next);
                }

                if (currentLevel <= targetLevel) {
                    break;
                }

                next = next.nextElementSibling;
            }

            return children;
        }

        setTargetBoundary() {
            const item = this.activeItem;
            this.dragBoundary = this.getIndentBoundaries(this.getPrevRow(item), this.getNextRow(item));
        }

        canInsertBefore(item) {
            return this.getIndentBoundaries(this.getPrevRow(item), item, true) !== false;
        }

        canInsertAfter(item) {
            return this.getIndentBoundaries(item, this.getNextRow(item), true) !== false;
        }

        getIndentBoundaries(prevRow, nextRow, isMaxCheck) {
            let minLevel = 0,
                maxLevel = 0;

            if (nextRow && this.isRowVisible(nextRow)) {
                minLevel = this.getTreeLevel(nextRow);
            }

            if (prevRow && this.isRowVisible(prevRow)) {
                maxLevel = this.getTreeLevel(prevRow) + 1;

                // A collapsed parent cannot take new children
                if (prevRow.dataset.treeExpanded !== 'true' && parseInt(prevRow.dataset.treeChildren)) {
                    maxLevel--;
                }
            }

            const maxDepth = this.getMaxDepth();
            if (maxDepth !== null) {
                if (minLevel !== 0 && minLevel + this.lastChildDiff > maxDepth) {
                    if (isMaxCheck) {
                        return false;
                    }

                    maxLevel = maxDepth - this.lastChildDiff;
                    if (minLevel > maxLevel) {
                        minLevel = maxLevel;
                    }
                }

                if (maxLevel + this.lastChildDiff > maxDepth) {
                    maxLevel = maxDepth - this.lastChildDiff;
                    if (maxLevel < minLevel) {
                        maxLevel = minLevel;
                    }
                }
            }

            return {
                min: minLevel,
                max: maxLevel
            };
        }

        getMaxDepth() {
            if (!this.config.maxDepth) {
                return null;
            }

            // Reflected as maximum allowed levels
            return parseInt(this.config.maxDepth) - 1;
        }

        //
        // Indentation
        //

        setIndent() {
            const currentLevel = this.getTreeLevel(this.activeItem),
                distanceFromStart = this.draggingX - this.dragStartX,
                indentDistance = Math.round(distanceFromStart / this.config.indentSize);

            let proposedLevel = currentLevel + indentDistance;

            if (proposedLevel < this.dragBoundary.min) {
                proposedLevel = this.dragBoundary.min;
            }
            else if (proposedLevel > this.dragBoundary.max) {
                proposedLevel = this.dragBoundary.max;
            }

            this.setIndentOnItem(this.activeItem, proposedLevel, true);
        }

        setIndentOnItem(item, indentLevel, isProposal) {
            if (isProposal) {
                item.dataset.treeLevelProposed = indentLevel;
            }
            else {
                item.dataset.treeLevel = indentLevel;
            }

            const treeCell = [...item.children].find((cell) => cell.classList.contains('list-cell-tree'));
            if (treeCell) {
                treeCell.style.paddingLeft = this.getIndentStartSize(indentLevel) + 'px';
            }
        }

        getIndentStartSize(treeLevel) {
            return (treeLevel * this.config.indentSize) +
                (this.toBool(this.config.useTree) ? 15 : 0) +
                (this.toBool(this.config.useReorder) ? 0 : 15);
        }

        //
        // Auto scroll
        //

        getScrollContainers() {
            const windowScroller = document.scrollingElement || document.documentElement,
                containers = [];

            let el = this.element;
            while (el && el !== document.body && el !== windowScroller) {
                const style = getComputedStyle(el);
                if (/auto|scroll/.test(style.overflowX + ' ' + style.overflowY)) {
                    containers.push(el);
                }
                el = el.parentElement;
            }

            containers.push(windowScroller);

            return containers;
        }

        getAutoScrollVelocity(container) {
            const pointer = this.pointer,
                isWindow = container === (document.scrollingElement || document.documentElement),
                style = getComputedStyle(container),
                rect = isWindow
                    ? { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight }
                    : container.getBoundingClientRect();

            const canScroll = (overflow) => isWindow
                ? overflow !== 'hidden' && overflow !== 'clip'
                : overflow === 'auto' || overflow === 'scroll';

            return {
                x: canScroll(style.overflowX)
                    ? getAutoScrollDirection(pointer.clientX, rect.left, rect.right, container.scrollLeft, container.clientWidth, container.scrollWidth, SCROLL_SENSITIVITY)
                    : 0,
                y: canScroll(style.overflowY)
                    ? getAutoScrollDirection(pointer.clientY, rect.top, rect.bottom, container.scrollTop, container.clientHeight, container.scrollHeight, SCROLL_SENSITIVITY)
                    : 0
            };
        }

        updateAutoScroll() {
            const isScrolling = (this.scrollContainers || []).some((container) => {
                const velocity = this.getAutoScrollVelocity(container);
                return velocity.x !== 0 || velocity.y !== 0;
            });

            if (!isScrolling) {
                this.stopAutoScroll();
                return;
            }

            if (!this.autoScrollTimer) {
                this.autoScrollTimer = setInterval(this.onAutoScroll, SCROLL_INTERVAL);
            }
        }

        onAutoScroll() {
            if (!this.dragging || !this.pointer) {
                this.stopAutoScroll();
                return;
            }

            let isScrolled = false;

            (this.scrollContainers || []).forEach((container) => {
                const velocity = this.getAutoScrollVelocity(container);
                if (velocity.x !== 0 || velocity.y !== 0) {
                    container.scrollLeft += velocity.x * SCROLL_SPEED;
                    container.scrollTop += velocity.y * SCROLL_SPEED;
                    isScrolled = true;
                }
            });

            if (!isScrolled) {
                this.stopAutoScroll();
                return;
            }

            // Rows moved under a still pointer, so place the dragged row again
            this.onDragOver(this.pointer.clientY);
            this.setIndent();
        }

        stopAutoScroll() {
            if (this.autoScrollTimer) {
                clearInterval(this.autoScrollTimer);
                this.autoScrollTimer = null;
            }
        }

        //
        // Helpers
        //

        rowFromPoint(clientY) {
            for (const row of this.tableBody.children) {
                if (row === this.activeItem || !row.dataset.treeId || !this.isRowVisible(row)) {
                    continue;
                }
                const rect = row.getBoundingClientRect();
                if (clientY >= rect.top && clientY <= rect.bottom) {
                    return row;
                }
            }
            return null;
        }

        getPrevRow(row) {
            return this.getSiblingRow(row, 'previousElementSibling');
        }

        getNextRow(row) {
            return this.getSiblingRow(row, 'nextElementSibling');
        }

        getSiblingRow(row, property) {
            let el = row[property];
            while (el && (el === this.activeItem || !this.isRowVisible(el) || !el.dataset.treeId)) {
                el = el[property];
            }
            return el;
        }

        isRowVisible(row) {
            return row.style.display !== 'none';
        }

        getTreeLevel(row) {
            return parseInt(row.dataset.treeLevel) || 0;
        }

        getEventPageX(evt) {
            return evt.pageX || (evt.touches && evt.touches[0].pageX) || 0;
        }

        toBool(value) {
            return value === true || value === 'true' || value === '1' || value === 1;
        }
    });
}
