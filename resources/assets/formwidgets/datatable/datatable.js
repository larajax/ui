/*
 * DataTable control
 *
 * Edits a list of row objects in a grid. The rows are kept as JSON in the hidden input named by
 * data-data-locker, updated on every change (which fires a change event on it) and before each AJAX request
 * the form sends.
 *
 * Data attributes:
 * - data-control="datatable" - enables the control on an element
 * - data-columns - the column definitions, as JSON
 * - data-hot-options - the grid options, as JSON
 * - data-ajax-columns - columns whose options come from the onGetDropdownOptions handler, as JSON
 * - data-column-dependencies - columns whose values reset when another column (or any of a list) changes, as JSON
 * - data-data-locker - selector of the hidden input holding the rows
 * - data-alias - the widget alias, prefixing its AJAX handlers
 * - data-adding, data-deleting - whether rows may be added and removed
 * - data-require-valid - blocks saving while a filled row has an invalid cell
 * - data-lang - translated labels, as JSON, see DEFAULT_LANG
 *
 * Child elements:
 * - [data-hot-container] - holds the grid
 * - [data-table-add], [data-table-delete], [data-table-export], [data-table-import] - toolbar buttons
 * - [data-table-import-file] - the file input behind the import button
 * - [data-table-search] - the search input
 *
 * Shortcuts: Alt+A adds a row below the selection, Alt+Shift+A above it, Alt+D deletes the selected row.
 *
 * Events:
 * - datatable:new-row - fired on the element for each row added, with the row object as detail.row, so
 *   default values can be set on it
 *
 * JavaScript API:
 * jax.fetchControl(element, 'datatable').hot - the Hotsheet sheet
 *
 * Dependencies:
 * - Hotsheet (vendor/hotsheet/hotsheet.js)
 */
'use strict';

import { Sheet } from '../../vendor/hotsheet/hotsheet.js';
import { validateValue, hasRequiredRule } from './datatable.validation.js';

const COLUMN_TYPES = ['text', 'numeric', 'checkbox', 'dropdown', 'autocomplete', 'date', 'time'];

// English labels, replaced by any given in data-lang; the grid's own strings pass through to it
const DEFAULT_LANG = {
    noData: 'No data',
    insertRowAbove: 'Insert row above',
    insertRowBelow: 'Insert row below',
    removeRow: 'Remove row',
    undo: 'Undo',
    redo: 'Redo',
    freezeColumn: 'Freeze column',
    unfreezeColumn: 'Unfreeze column',
    invalidValue: 'The value is not valid.'
};

export function registerDataTable(jax) {
    jax.registerControl('datatable', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({
                columns: [],
                hotOptions: {},
                ajaxColumns: [],
                columnDependencies: {},
                alias: '',
                dataLocker: null,
                lang: {}
            }, this.config);

            this.lang = Object.assign({}, DEFAULT_LANG, this.config.lang);
            this.hot = null;
            this.optionCache = {};
        }

        connect() {
            this.containerEl = this.element.querySelector('[data-hot-container]');
            this.dataInputEl = this.element.querySelector(this.config.dataLocker);

            this.initSheet();
            this.bindToolbar();
            this.bindFormSubmit();
            this.syncToHiddenInput();
        }

        disconnect() {
            if (this.hot) {
                this.hot.destroy();
                this.hot = null;
            }

            this.formEl = null;
            this.containerEl = null;
            this.dataInputEl = null;
        }

        initSheet() {
            var self = this;
            var options = this.config.hotOptions || {};
            var lockerData = this.getLockerData();
            var hasPlaceholder = !!options.emptyDataState;

            this.lastSelectedRow = null;

            this.hot = new Sheet(this.containerEl, {
                columns: this.buildColumns(),
                rows: lockerData.length ? lockerData : (hasPlaceholder ? [] : [{}]),
                rowHeaders: !!options.rowHeaders,
                height: typeof options.height === 'number' ? options.height : 'auto',
                rowHeight: options.rowHeights || 30,
                wrapNavigation: options.autoWrapRow !== false,
                decimalSeparator: this.getDecimalSeparator(),
                minRows: options.minRows || 0,
                undo: options.undo !== false,
                multiSelect: options.selectionMode !== 'single',
                rowMove: !!options.manualRowMove,
                sorting: !!options.columnSorting,
                columnMove: !!options.manualColumnMove,
                columnResize: options.manualColumnResize !== false,
                emptyState: hasPlaceholder ? this.getEmptyState(options.emptyDataState) : null,
                contextMenu: function(sheet, cell) {
                    return self.buildContextMenu(sheet, cell);
                },
                keyHandler: function(event, sheet) {
                    return self.onShortcut(event, sheet);
                },
                checkboxClass: 'check check-sm',
                striped: true,
                lang: this.config.lang
            });

            // New rows can be given default values by listening for datatable:new-row and setting detail.row keys
            this.hot.on('beforeInsertRows', function(event) {
                event.rows.forEach(function(row) {
                    self.element.dispatchEvent(new CustomEvent('datatable:new-row', { bubbles: true, detail: { row: row } }));
                });
            });

            this.hot.on('beforeChange', function(event) {
                self.onBeforeChange(event.changes);
            });

            this.hot.on('change', function(event) {
                self.onChange(event.changes, event.source);
            });

            this.hot.on('select', function(event) {
                if (event.selection) {
                    self.lastSelectedRow = event.selection.anchor.row;
                }
            });
        }

        /**
         * buildColumns maps the widget's column definitions onto Hotsheet columns.
         */
        buildColumns() {
            var self = this;
            var options = this.config.hotOptions || {};

            return this.config.columns.map(function(col) {
                var column = {
                    key: col.data,
                    title: col.title,
                    type: COLUMN_TYPES.indexOf(col.type) !== -1 ? col.type : 'text',
                    width: col.width || null,
                    readOnly: !!col.readOnly,
                    wrap: col.wordWrap === true || (col.wordWrap === undefined && options.wordWrap === true),
                    checkedValue: col.checkedTemplate !== undefined ? col.checkedTemplate : true,
                    uncheckedValue: col.uncheckedTemplate !== undefined ? col.uncheckedTemplate : false
                };

                if (col.type === 'dropdown' || col.type === 'autocomplete') {
                    column.filter = !!col.filter;
                    column.strict = !!col.strict;
                    column.options = self.config.ajaxColumns.indexOf(col.data) !== -1
                        ? function(request) { return self.loadOptions(col.data, request.rowData); }
                        : (col.source || []).map(function(item) { return { key: item.key, label: item.value }; });
                }

                if (col.type === 'date' && col.dateFormat) {
                    column.dateFormat = col.dateFormat;
                }

                if (col.type === 'time' && col.timeFormat) {
                    column.timeFormat = col.timeFormat;
                }

                if (col.correctFormat !== undefined) {
                    column.correctFormat = !!col.correctFormat;
                }

                if (col._validation) {
                    column.validator = function(value, column, rowData) {
                        var message = validateValue(col._validation, value, rowData);
                        return message === null ? true : message;
                    };

                    // Empty cells skip validators unless they are not allowed to be empty
                    if (hasRequiredRule(col._validation)) {
                        column.allowEmpty = false;
                    }
                }

                return column;
            });
        }

        /**
         * loadOptions asks the model for a remote column's options, given the row's values, cached per row values.
         */
        loadOptions(column, rowObject) {
            var self = this;
            var rowData = {};

            this.config.columns.forEach(function(col) {
                var value = rowObject ? rowObject[col.data] : null;
                rowData[col.data] = value === undefined ? null : value;
            });

            // The promise is cached, so requests for the same row values while one is loading share it
            var cacheKey = column + ':' + JSON.stringify(rowData);
            if (!this.optionCache[cacheKey]) {
                this.optionCache[cacheKey] = new Promise(function(resolve) {
                    jax.request(self.element, self.config.alias + '::onGetDropdownOptions', {
                        data: { column: column, rowData: rowData },
                        success: function(response) {
                            var options = response.options || {};
                            resolve(Array.isArray(options)
                                ? options.map(function(label) { return { key: label, label: label }; })
                                : Object.keys(options).map(function(key) { return { key: key, label: options[key] }; }));
                        },
                        error: function(data, code, xhr) {
                            // A failed request is asked again next time, and still shows its error
                            delete self.optionCache[cacheKey];
                            resolve([]);
                            return this.error(data, code, xhr);
                        }
                    });
                });
            }

            return this.optionCache[cacheKey];
        }

        /**
         * clearOptionCache forgets a column's loaded options, after a column it depends on changes.
         */
        clearOptionCache(column) {
            var self = this;

            Object.keys(this.optionCache).forEach(function(cacheKey) {
                if (cacheKey.indexOf(column + ':') === 0) {
                    delete self.optionCache[cacheKey];
                }
            });
        }

        /**
         * getDecimalSeparator returns the decimal separator of the backend locale, used to read typed numbers.
         */
        getDecimalSeparator() {
            var meta = document.querySelector('meta[name="backend-locale"]');
            var locale = (meta && meta.content) || document.documentElement.lang || undefined;

            try {
                var decimal = new Intl.NumberFormat(locale).formatToParts(1.5).find(function(part) {
                    return part.type === 'decimal';
                });

                return decimal ? decimal.value : '.';
            }
            catch (e) {
                return '.';
            }
        }

        /**
         * getEmptyState reads the placeholder message, given as true, { message: {...} } or the message itself.
         */
        getEmptyState(setting) {
            var message = setting && setting.message ? setting.message : setting;

            if (!message || message === true) {
                return { title: this.lang.noData };
            }

            return { title: message.title, description: message.description };
        }

        /**
         * buildContextMenu returns the right click menu: inserting and removing rows when allowed, undo and redo,
         * and freezing columns when columns can be reordered.
         */
        buildContextMenu(sheet, cell) {
            var options = this.config.hotOptions || {};
            var selection = sheet.getSelection();
            var top = Math.min(selection.anchor.row, selection.focus.row);
            var bottom = Math.max(selection.anchor.row, selection.focus.row);
            var items = [];

            if (this.config.adding !== false) {
                items.push({ label: this.lang.insertRowAbove, action: function() { sheet.insertRows(top, 1); } });
                items.push({ label: this.lang.insertRowBelow, action: function() { sheet.insertRows(bottom + 1, 1); } });
            }

            if (this.config.deleting !== false) {
                items.push({ label: this.lang.removeRow, action: function() { sheet.removeRows(top, bottom - top + 1); } });
            }

            items.push({ label: this.lang.undo, disabled: !sheet.canUndo(), action: function() { sheet.undo(); } });
            items.push({ label: this.lang.redo, disabled: !sheet.canRedo(), action: function() { sheet.redo(); } });

            if (options.manualColumnFreeze) {
                if (sheet.isColumnFrozen(cell.col)) {
                    items.push({ label: this.lang.unfreezeColumn, action: function() { sheet.unfreezeColumn(cell.col); } });
                }
                else {
                    items.push({ label: this.lang.freezeColumn, action: function() { sheet.freezeColumn(cell.col); } });
                }
            }

            return items;
        }

        getColumnConfig(key) {
            return this.config.columns.find(function(col) {
                return col.data === key;
            });
        }

        /**
         * onShortcut handles Alt+A (add a row below), Alt+Shift+A (add a row above) and Alt+D (delete the row),
         * by the physical key so Option on macOS works too; disallowed ones are still kept from the grid.
         */
        onShortcut(event, sheet) {
            var selection = sheet.getSelection();
            var isAdd = event.code === 'KeyA';
            var isDelete = event.code === 'KeyD';

            if (!selection || !event.altKey || event.ctrlKey || event.metaKey || (!isAdd && !isDelete)) {
                return false;
            }

            var row = selection.anchor.row;

            if (isAdd && this.config.adding !== false) {
                var index = event.shiftKey ? row : row + 1;
                sheet.insertRows(index, 1);
                sheet.select(index, 0);
            }

            if (isDelete && this.config.deleting !== false) {
                var col = selection.anchor.col;
                sheet.removeRows(row, 1);
                if (sheet.getRowCount()) {
                    sheet.select(Math.min(row, sheet.getRowCount() - 1), col);
                }
            }

            return true;
        }

        /**
         * findInvalidCell checks every cell that would be saved, returning the first that breaks its column's
         * rules as { row, col, message } in visual positions, or null.
         */
        findInvalidCell() {
            var sheet = this.hot;
            var columns = sheet.getColumns();

            for (var row = 0; row < sheet.getRowCount(); row++) {
                var rowData = sheet.getRowData(row);

                // Rows without values are dropped on save, so they aren't checked
                if (!this.rowHasValues(rowData)) {
                    continue;
                }

                for (var col = 0; col < columns.length; col++) {
                    var config = this.getColumnConfig(columns[col].key);
                    var message = config && config._validation ? validateValue(config._validation, rowData[config.data], rowData) : null;

                    if (message === null && sheet.isInvalid(row, col)) {
                        message = sheet.getInvalidMessage(row, col) || this.lang.invalidValue;
                    }

                    if (message !== null) {
                        return { row: row, col: col, message: message };
                    }
                }
            }

            return null;
        }

        rowHasValues(row) {
            return Object.keys(row).some(function(key) {
                return row[key] !== null && row[key] !== '' && row[key] !== undefined;
            });
        }

        /**
         * isSaveRequest tells whether a request saves the form, the requests requireValid blocks.
         */
        isSaveRequest(handler) {
            var formHandler = this.formEl ? this.formEl.getAttribute('data-request') : null;
            return !!handler && (handler === formHandler || handler === 'onSave' || /::onSave$/.test(handler));
        }

        /**
         * onBeforeChange stores checkbox text from pastes and fills as the column's checked or unchecked value,
         * and resets the columns that depend on a changed one.
         */
        onBeforeChange(changes) {
            var self = this;

            changes.forEach(function(change) {
                var column = self.getColumnConfig(change.key);
                if (column && column.type === 'checkbox') {
                    change.value = self.normalizeCheckboxValue(column, change.value);
                }
            });

            this.addDependentResets(changes);
        }

        /**
         * addDependentResets clears the columns that depend on a changed column within the same change, so one
         * undo puts both back; a dependent the change sets itself, as a paste or import does, is left alone.
         */
        addDependentResets(changes) {
            var deps = this.config.columnDependencies || {};
            var dependents = Object.keys(deps);

            // Resets join the list as it is read, so a chain of dependencies clears in turn
            for (var i = 0; i < changes.length; i++) {
                var change = changes[i];

                for (var d = 0; d < dependents.length; d++) {
                    var depCol = dependents[d];
                    if ([].concat(deps[depCol]).indexOf(change.key) === -1) {
                        continue;
                    }

                    this.clearOptionCache(depCol);

                    var value = change.rowData[depCol];
                    var isSetToo = changes.some(function(other) {
                        return other.rowData === change.rowData && other.key === depCol;
                    });

                    if (!isSetToo && value !== null && value !== undefined && value !== '') {
                        changes.push({ row: change.row, rowData: change.rowData, key: depCol, value: null, cancel: false });
                    }
                }
            }
        }

        normalizeCheckboxValue(column, value) {
            if (value === null || value === undefined || value === column.checkedTemplate || value === column.uncheckedTemplate) {
                return value;
            }

            var text = String(value).trim().toLowerCase();

            if (text === String(column.checkedTemplate) || ['true', 'yes', 'on', 'y', 'x'].indexOf(text) !== -1) {
                return column.checkedTemplate;
            }

            if (text === String(column.uncheckedTemplate) || ['false', 'no', 'off', 'n'].indexOf(text) !== -1) {
                return column.uncheckedTemplate;
            }

            return value;
        }

        /**
         * onChange saves the rows and lets the form know, for unsaved change warnings and fields that depend on it.
         */
        onChange() {
            this.syncToHiddenInput();
            this.dataInputEl.dispatchEvent(new Event('change', { bubbles: true }));
        }

        /**
         * getLockerData reads the saved rows; a saved list with gaps in its keys arrives as an object.
         */
        getLockerData() {
            try {
                var data = JSON.parse(this.dataInputEl.value);
                return Array.isArray(data) ? data : (data && typeof data === 'object' ? Object.values(data) : []);
            }
            catch (e) {
                return [];
            }
        }

        syncToHiddenInput() {
            var self = this;

            this.dataInputEl.value = JSON.stringify(this.hot.getRows().filter(function(row) {
                return self.rowHasValues(row);
            }));
        }

        bindToolbar() {
            var self = this;

            this.listen('click', '[data-table-add]', function() {
                self.hot.insertRows(self.hot.getRowCount(), 1);
            });

            this.listen('click', '[data-table-delete]', function() {
                var selection = self.hot.getSelection();
                var row = selection ? selection.anchor.row : self.lastSelectedRow;
                if (row === null || row === undefined) {
                    row = self.hot.getRowCount() - 1;
                }
                if (row >= 0) {
                    self.hot.removeRows(row, 1);
                    self.lastSelectedRow = null;
                }
            });

            this.listen('input', '[data-table-search]', function(ev) {
                self.hot.search(ev.target.value);
            });

            this.listen('click', '[data-table-export]', function() {
                self.syncToHiddenInput();
                jax.request(self.element, self.config.alias + '::onExportCsv', {
                    data: { tableData: self.dataInputEl.value }
                });
            });

            this.listen('click', '[data-table-import]', function() {
                var fileInput = self.element.querySelector('[data-table-import-file]');
                fileInput.value = '';
                fileInput.click();
            });

            this.listen('change', '[data-table-import-file]', function(ev) {
                var file = ev.target.files && ev.target.files[0];
                if (file) {
                    file.text().then(function(text) {
                        self.importCsv(text);
                    });
                }
            });
        }

        /**
         * importCsv sends CSV text to the server, which matches its columns, and appends the returned rows.
         */
        importCsv(text) {
            var self = this;

            jax.request(this.element, this.config.alias + '::onImportCsv', {
                data: { csvData: text },
                success: function(response) {
                    if (self.hot) {
                        self.appendRows(response.rows || []);
                    }
                }
            });
        }

        /**
         * appendRows writes rows keyed by column after the last row with a value, adding rows as needed.
         */
        appendRows(rows) {
            var sheet = this.hot;
            var columns = sheet.getColumns();
            var startRow = 0;

            if (!rows.length) {
                return;
            }

            for (var row = sheet.getRowCount() - 1; row >= 0; row--) {
                var hasValue = columns.some(function(column, col) {
                    var value = sheet.getValue(row, col);
                    return value !== null && value !== '' && value !== undefined;
                });

                if (hasValue) {
                    startRow = row + 1;
                    break;
                }
            }

            sheet.writeValues(startRow, 0, rows.map(function(rowData) {
                return columns.map(function(column) {
                    return rowData[column.key] !== undefined ? rowData[column.key] : null;
                });
            }), 'import');
        }

        bindFormSubmit() {
            this.formEl = this.element.closest('form');
            if (this.formEl) {
                // Requests bubble ajax:setup through the form before it is serialized
                this.listen('ajax:setup', this.formEl, this.onBeforeFormSubmit);
            }
        }

        onBeforeFormSubmit(event) {
            var handler = event.detail && event.detail.context && event.detail.context.handler;

            // Requests the form sends take the typed value; the control's own, like option loads, leave the editor open
            if (this.hot.isEditing() && !(handler && handler.indexOf(this.config.alias + '::') === 0)) {
                this.hot.commitEditor();
            }

            this.syncToHiddenInput();

            if (!this.config.requireValid || !this.isSaveRequest(handler)) {
                return;
            }

            // With requireValid, a save stops at the first invalid cell, which is flagged, selected and explained
            var invalid = this.findInvalidCell();
            if (invalid) {
                event.preventDefault();
                this.hot.markInvalid(invalid.row, invalid.col, invalid.message);
                this.hot.select(invalid.row, invalid.col);
                jax.flashMsg({ message: invalid.message, type: 'error', interval: 5 });
            }
        }
    });
}
