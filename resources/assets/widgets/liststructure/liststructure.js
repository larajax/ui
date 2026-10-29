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
 * Dependencies:
 * - SortableJS (vendor/sortablejs/sortable.esm.js)
 *
 * Tree node toggling posts through plain data-request attributes; this
 * control implements the drag reorder interaction on SortableJS.
 */
'use strict';

// SortableJS is shared by every list, loaded on first use
let sortablePromise = null;

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

            this.activeChildren = null;
            this.lastChildDiff = null;

            loadSortable().then((Sortable) => {
                // The list may have left the page while SortableJS loaded
                if (!this.tableBody) {
                    return;
                }

                this.bindSortable(Sortable);
            });

            this.listen('drag', this.onDragging);
            this.listen('mousemove', this.onDragging);
            this.listen('touchmove', this.onDragging);
            this.listen('pointermove', this.onDragging);

            // Captured because Sortable stops dragover at the table body, and Firefox drag events carry no position
            this.listen('dragover', this.onDragging, true);
        }

        bindSortable(Sortable) {
            const sortableOptions = {
                filter: '.no-sort',
                animation: 150,
                setData: (dataTransfer, dragEl) => {
                    this.dragGhost = dragEl.cloneNode(true);
                    this.dragGhost.classList.add('list-hidden-drag-ghost');
                    document.body.appendChild(this.dragGhost);
                    dataTransfer.setDragImage(this.dragGhost, 0, 0);
                },
                onStart: this.proxy(this.onDragStart),
                onChange: this.proxy(this.onChange),
                onEnd: this.proxy(this.onDragStop),
                onMove: this.proxy(this.onDragMove),

                // Auto scroll plugin
                forceAutoScrollFallback: true,
                scrollSensitivity: 60,
                scrollSpeed: 20
            };

            if (!this.toBool(this.config.dragRow)) {
                sortableOptions.handle = '.list-reorder-handle';
            }

            this.sortable = Sortable.create(this.tableBody, sortableOptions);
        }

        destroyReorder() {
            if (this.sortable) {
                this.sortable.destroy();
                this.sortable = null;
            }

            this.removeDragGhost();
            this.dragging = false;
            this.activeItem = null;
            this.activeClone = null;
            this.activeChildren = null;
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
            const item = evt.item;

            this.dragging = true;
            this.activeItem = item;
            this.activeClone = evt.clone;
            this.activeChildren = this.getChildren(item);
            this.dragStartX = this.getEventPageX(evt.originalEvent);
            this.tableBody.classList.add('tree-drag-mode');

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
            this.setTargetBoundary();
        }

        onChange(evt) {
            this.activeItem = evt.item;
            this.setTargetBoundary();
        }

        onDragStop(evt) {
            const item = evt.item,
                tableBody = this.tableBody,
                activeChildren = this.activeChildren || [];

            this.activeItem = null;
            this.activeClone = null;
            this.activeChildren = null;
            this.dragging = false;

            if (!tableBody) {
                return;
            }

            tableBody.classList.add('tree-drag-updated');
            tableBody.classList.remove('tree-drag-mode');

            this.removeDragGhost();

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

        onDragging(evt) {
            if (!this.dragging) {
                return;
            }

            // Native drag events without a pointer position report zero coordinates
            if ((evt.type === 'drag' || evt.type === 'dragover') && !evt.clientX && !evt.clientY) {
                return;
            }

            this.draggingX = this.getEventPageX(evt);

            this.setIndent();

            const cloneCell = this.activeClone && this.activeClone.querySelector('.list-cell-tree');
            if (cloneCell) {
                cloneCell.style.paddingLeft = '1px';
            }
        }

        removeDragGhost() {
            if (this.dragGhost) {
                this.dragGhost.remove();
                this.dragGhost = null;
            }
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
        // Helpers
        //

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

// loadSortable imports SortableJS once for every list on the page
function loadSortable() {
    if (!sortablePromise) {
        sortablePromise = import('../../vendor/sortablejs/sortable.esm.js')
            .then((sortable) => sortable.Sortable);
    }

    return sortablePromise;
}
