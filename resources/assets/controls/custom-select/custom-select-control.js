/*
 * Custom Select
 *
 * Turns a select into a searchable dropdown, or a multiple select into a tag input, built on Tom Select.
 * The select keeps its name and value and dispatches change, so forms read it as a plain select.
 *
 * Classes on the select:
 * - custom-select - enables the control
 * - select-no-search - a single select without the search box
 * - select-hide-selected - the dropdown leaves out the options already picked
 * - select-dropdown-auto-width - the dropdown sizes to its options, at least as wide as the field
 * - select-no-dropdown - a tag input without a dropdown, where typed text becomes a tag
 * - form-control-sm, form-control-lg - a smaller or larger select, with its dropdown to match
 *
 * Data attributes on the select:
 * - data-placeholder - a hint while nothing is picked, with a button that clears the choice
 * - data-allow-clear - the clear button without a placeholder
 * - data-handler - an AJAX handler that returns the options, see buildLoadSettings()
 * - data-minimum-input-length - how many characters to type before the handler runs
 * - data-ajax--delay - how long to wait after the last key press before asking, in milliseconds
 * - data-request-data - extra values sent with each request
 * - data-tags - the select accepts values of its own
 * - data-token-separators - characters, separated by |, that turn the typed text into a tag
 * - data-maximum-selection-length - the most options a multiple select takes
 * - data-close-on-select - false keeps the dropdown open after each pick of a multiple select
 * - data-dropdown-auto-width - as the select-dropdown-auto-width class
 * - data-minimum-results-for-search - fewer options than this hide the search box, Infinity for never
 * - data-sortable - tags reorder by dragging
 * - data-checkboxes - the options of a multiple select show checkboxes
 * - data-dropdown-header - a title row with a close button atop the dropdown
 * - data-optgroup-columns - option groups sit side by side as columns
 * - data-create-filter - a regular expression that typed tags must match
 * - data-create-on-blur - typed text becomes a tag when the field loses focus
 * - data-duplicates - the same tag can be picked more than once
 * - data-preload - the handler's options load when the field takes focus, before anything is typed
 * - data-search-fields - the option fields the search matches, comma separated
 * - data-select-on-tab - Tab picks the highlighted option
 * - data-language - the translation of the messages, such as de, loaded from languages/ unless the page
 *   has it already; the page's lang attribute when not given
 *
 * Data attributes on an option:
 * - data-status - a color, shown as a dot before the text
 * - data-icon - icon classes shown before the text
 * - data-image - an image address shown before the text
 *
 * JavaScript API:
 * jax.fetchControl(select, 'custom-select').focus()
 * jax.fetchControl(select, 'custom-select').refresh()
 * jax.fetchControl(select, 'custom-select').tomSelect
 */
'use strict';

import TomSelect from '../../vendor/tom-select/tom-select.esm.js';
import { createPopper } from '../../vendor/popperjs/popper.esm.js';
import { hasLanguage, loadLanguage, makeTranslator, pluralize, resolveLanguage } from '../../lang.js';

/**
 * DEFAULT_LANG are the default messages, see pluralize().
 */
export const DEFAULT_LANG = {
    noResults: 'No results found',
    searching: 'Searching…',
    loadingMore: 'Loading more results…',
    errorLoading: 'The results could not be loaded.',
    inputTooShort: 'Please enter :count or more characters',
    maximumSelected: {
        one: 'You can only select :count item',
        other: 'You can only select :count items'
    },
    removeItem: 'Remove item',
    removeAllItems: 'Remove all items'
};

/**
 * CustomTomSelect flags change events it dispatches itself.
 */
class CustomTomSelect extends TomSelect {
    onChange() {
        this.isDispatchingChange = true;

        try {
            super.onChange();
        }
        finally {
            this.isDispatchingChange = false;
        }
    }
}

// Inline cross icon, independent of the icon pack
const CROSS_ICON ='<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>';

/**
 * optionMark returns the dot, icon or image before an option's text.
 */
export function optionMark(data, escape, isChip = false) {
    if (data.status) {
        const dot = `<span class="select-status status-indicator" style="background:${escape(data.status)}"></span>`;
        return isChip ? `<span class="chip-icon">${dot}</span>` : dot;
    }

    if (data.icon) {
        const icon = `<i class="select-icon ${escape(data.icon)}" aria-hidden="true"></i>`;
        return isChip ? `<span class="chip-icon">${icon}</span>` : icon;
    }

    if (data.image) {
        return `<img class="${isChip ? 'chip-img' : 'select-image'}" src="${escape(data.image)}" alt="">`;
    }

    return '';
}

/**
 * normalizeResults turns a handler response into options and groups.
 */
export function normalizeResults(data) {
    const results = (data && (data.result || data.results)) || [];
    const options = [];
    const optgroups = [];

    const addOption = (item, group) => {
        const option = Object.assign({}, item, { value: String(item.id), text: String(item.text ?? '') });
        delete option.id;
        delete option.selected;

        if (group !== undefined) {
            option.optgroup = group;
        }

        options.push(option);
    };

    if (Array.isArray(results) && results[0] && typeof results[0] === 'object') {
        results.forEach((item, index) => {
            if (Array.isArray(item.children)) {
                const group = 'group-' + index;
                optgroups.push({ value: group, label: String(item.text ?? ''), disabled: !!item.disabled });
                item.children.forEach((child) => addOption(child, group));
                return;
            }

            addOption(item);
        });
    }
    else {
        Object.keys(results).forEach((key) => addOption({ id: key, text: results[key] }));
    }

    return { options, optgroups, more: !!(data && data.pagination && data.pagination.more) };
}

export function registerCustomSelect(jax) {
    jax.registerControl('custom-select', class extends jax.ControlBase {
        connect() {
            this.tomSelect = null;
            this.popper = null;

            // Remove the copy of the control left by a previous disconnect
            this.destroyPlaceholder();

            // A translation the page has not bundled loads first
            const language = this.element.dataset.language;
            if (!hasLanguage(language)) {
                loadLanguage(language).then(() => {
                    if (this.element.isConnected && !this.tomSelect) {
                        this.start();
                    }
                });
                return;
            }

            this.start();
        }

        disconnect() {
            this.clonePlaceholder();

            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }

            this.element.removeEventListener('change', this.proxy(this.onSelectChange));
            this.element.removeEventListener('focus', this.proxy(this.onSelectFocus));

            this.destroyPopper();

            if (this.tomSelect) {
                this.tomSelect.destroy();
                this.tomSelect = null;
            }
        }

        start() {
            const language = this.element.dataset.language || document.documentElement.lang;
            this.translate = makeTranslator('customselect', DEFAULT_LANG, { language });
            this.pluralLanguage = resolveLanguage(language) || 'en';

            this.settings = this.buildSettings();
            this.tomSelect = new CustomTomSelect(this.element, this.settings);

            this.bindTomSelect();
        }

        // focus focuses the field without opening the dropdown
        focus() {
            if (this.element.disabled) {
                return;
            }

            if (!this.tomSelect) {
                this.element.focus();
                return;
            }

            this.tomSelect.focus();
        }

        // refresh resyncs from the select without a change event
        refresh() {
            if (this.tomSelect) {
                this.tomSelect.sync();
            }
        }

        buildSettings() {
            const select = this.element;
            const data = select.dataset;
            const classes = select.classList;
            const isMultiple = select.multiple;
            const separators = this.tokenSeparators = data.tokenSeparators ? data.tokenSeparators.split('|').filter((separator) => separator !== '') : [];
            const isTags = separators.length > 0 || isTrue(data.tags);
            const noDropdown = classes.contains('select-no-dropdown');
            const placeholder = data.placeholder || null;
            const plugins = {};

            const settings = {
                plugins,
                maxOptions: null,
                maxItems: isMultiple ? (toNumber(data.maximumSelectionLength) || null) : 1,
                hideSelected: isMultiple && classes.contains('select-hide-selected'),
                closeAfterSelect: data.closeOnSelect !== 'false' && data.closeAfterSelect !== 'false',
                openOnFocus: false,
                allowEmptyOption: !placeholder,
                placeholder,
                hidePlaceholder: true,
                persist: false,
                // First separator makes a tag, otherwise only Enter does
                delimiter: separators.length ? separators[0] : '',
                duplicates: isTrue(data.duplicates),
                selectOnTab: isTrue(data.selectOnTab),
                searchField: data.searchFields ? data.searchFields.split(',').map((field) => field.trim()) : ['text'],
                // Mount inside a dialog, the page outside is inert
                dropdownParent: select.closest('dialog') || 'body',
                render: this.buildRender()
            };

            // Single select search box sits in the dropdown
            if (!isMultiple) {
                if (this.hasSearch()) {
                    plugins.dropdown_input = {};
                }
                else {
                    settings.controlInput = null;
                }
            }

            if (placeholder || isTrue(data.allowClear)) {
                if (!isTags || !isMultiple) {
                    plugins.clear_button = {
                        title: this.translate('removeAllItems'),
                        html: (options) => `<div class="${options.className}" title="${escapeHtml(options.title)}">${CROSS_ICON}</div>`
                    };
                }
            }

            if (isMultiple) {
                plugins.remove_button = {
                    title: this.translate('removeItem'),
                    className: 'chip-dismiss',
                    html: (options) => {
                        const button = document.createElement('button');
                        button.type = 'button';
                        button.className = options.className;
                        button.title = options.title;
                        button.tabIndex = -1;
                        button.setAttribute('aria-label', options.title);
                        button.innerHTML = CROSS_ICON;
                        return button;
                    }
                };
            }

            if (isTrue(data.sortable) && isMultiple) {
                plugins.drag_drop = {};
            }

            if (isTrue(data.checkboxes) && isMultiple) {
                plugins.checkbox_options = {};
            }

            if (data.dropdownHeader) {
                plugins.dropdown_header = {
                    title: data.dropdownHeader,
                    html: (options) => `<div class="${options.headerClass}"><div class="${options.titleRowClass}"><span class="${options.labelClass}">${escapeHtml(options.title)}</span><a class="${options.closeClass}" href="javascript:void(0)">${CROSS_ICON}</a></div></div>`
                };
            }

            if (isTrue(data.optgroupColumns)) {
                plugins.optgroup_columns = {};
            }

            if (isTags) {
                settings.create = true;
                settings.createOnBlur = noDropdown || isTrue(data.createOnBlur);

                if (data.createFilter) {
                    settings.createFilter = data.createFilter;
                }

                if (separators.length) {
                    settings.splitOn = new RegExp('[' + separators.map(escapeRegExp).join('') + ']');
                }
            }

            if (data.handler) {
                this.buildLoadSettings(settings, data.handler);
            }

            return settings;
        }

        // hasSearch tells whether a single select shows its search box
        hasSearch() {
            const select = this.element;

            if (select.classList.contains('select-no-search')) {
                return false;
            }

            const minimum = select.dataset.minimumResultsForSearch;
            if (minimum === 'Infinity') {
                return false;
            }

            if (minimum !== undefined && !select.dataset.handler) {
                return select.querySelectorAll('option').length >= toNumber(minimum);
            }

            return true;
        }

        buildRender() {
            const t = (key) => escapeHtml(this.translate(key));
            const isMultiple = this.element.multiple;

            return {
                option: (data, escape) => `<div>${optionMark(data, escape)}<span class="select-text">${escape(data.text)}</span></div>`,

                item: (data, escape) => isMultiple
                    ? `<div class="chip">${optionMark(data, escape, true)}<span class="chip-label">${escape(data.text)}</span></div>`
                    : `<div>${optionMark(data, escape)}<span class="select-text">${escape(data.text)}</span></div>`,

                optgroup_header: (data, escape) => `<div class="optgroup-header">${escape(data.label)}</div>`,

                // A new tag reads as the text typed, as the other options read
                option_create: (data, escape) => `<div class="create">${escape(data.input)}</div>`,

                no_results: () => `<div class="no-results">${this.loadFailed ? t('errorLoading') : t('noResults')}</div>`,

                loading: () => `<div class="loading">${t('searching')}</div>`,

                not_loading: (data) => {
                    const remaining = this.minimumInputLength - (data.input || '').length;
                    if (!this.element.dataset.handler || remaining <= 0) {
                        return null;
                    }

                    return `<div class="no-results">${escapeHtml(pluralize(this.translate('inputTooShort'), remaining, this.pluralLanguage))}</div>`;
                },

                loading_more: () => `<div class="loading-more-results">${t('loadingMore')}</div>`,

                no_more_results: () => null
            };
        }

        /**
         * buildLoadSettings loads options from the AJAX handler on typing.
         * Sends term, q, _type and page; expects results and pagination.more.
         */
        buildLoadSettings(settings, handler) {
            const select = this.element;
            const delay = toNumber(select.getAttribute('data-ajax--delay'));

            this.minimumInputLength = toNumber(select.dataset.minimumInputLength) || 0;

            Object.assign(settings, {
                loadThrottle: delay || 0,
                // The handler searched already, so every option it returns matches
                score: () => () => 1,
                shouldLoad: (query) => query.length >= this.minimumInputLength,
                preload: isTrue(select.dataset.preload) || this.minimumInputLength === 0 ? 'focus' : false,
                firstUrl: () => 1,
                load: (query, callback) => this.loadOptions(handler, query, callback)
            });

            settings.plugins.virtual_scroll = {};
        }

        loadOptions(handler, query, callback) {
            const page = this.tomSelect.getUrl(query);
            const params = { term: query, q: query, _type: page > 1 ? 'query:append' : 'query' };

            if (page > 1) {
                params.page = page;
            }

            this.loadFailed = false;

            const request = jax.request(this.element, handler, { data: params });

            request.done((data) => {
                const { options, optgroups, more } = normalizeResults(data);

                if (more) {
                    this.tomSelect.setNextUrl(query, page + 1);
                }

                callback(options, optgroups);
            });

            request.fail(() => {
                this.loadFailed = true;
                callback();
            });
        }

        bindTomSelect() {
            const ts = this.tomSelect;
            const select = this.element;

            ts.wrapper.classList.remove('form-control', 'custom-select');
            ts.control.classList.add(select.multiple ? 'chip-input' : 'form-control');

            if (!select.multiple) {
                ts.control.classList.add('form-control-caret');
            }

            // Size from the select or its input group
            const size = ['sm', 'lg'].find((name) => select.classList.contains('form-control-' + name) || select.closest(`.form-group-${name}, .input-group-${name}`));
            if (size) {
                ts.control.classList.add('form-control-' + size);
                ts.dropdown.classList.add('select-dropdown-' + size);
            }

            if (select.multiple) {
                ts.control_input.classList.add('form-ghost');
            }

            // No search box, so the field shows the placeholder
            if (!select.multiple && ts.settings.controlInput === null && ts.settings.placeholder) {
                ts.control.dataset.placeholder = ts.settings.placeholder;
            }

            ['select-hide-selected', 'select-no-dropdown', 'select-dropdown-auto-width'].forEach((name) => {
                if (select.classList.contains(name)) {
                    ts.dropdown.classList.add(name);
                }
            });

            if (isTrue(select.dataset.dropdownAutoWidth)) {
                ts.dropdown.classList.add('select-dropdown-auto-width');
            }

            // Contain presses and keep focus, except in the search box
            ts.dropdown.addEventListener('mousedown', (ev) => {
                ev.stopPropagation();

                if (ev.target !== ts.control_input) {
                    ev.preventDefault();
                }
            });

            // Position with Popper
            ts.positionDropdown = () => this.positionDropdown();
            ts.on('dropdown_close', () => this.destroyPopper());

            // Click toggles the dropdown, keyboard focus leaves it shut
            const onClick = ts.onClick;
            ts.hook('instead', 'onClick', () => {
                const wasOpen = ts.isOpen;
                onClick.call(ts);

                if (!wasOpen && !ts.isOpen && !ts.isLocked) {
                    ts.open();
                }
            });

            if (!select.multiple && ts.settings.controlInput !== null) {
                this.bindTypeToSearch();
            }

            if (select.multiple && !ts.settings.hideSelected && !ts.settings.duplicates) {
                this.bindToggleOnSelect();
            }

            if (ts.settings.maxItems && select.multiple) {
                this.bindMaximumNotice();
            }

            if (ts.settings.create && this.tokenSeparators.length > 1) {
                this.bindExtraSeparators();
            }

            this.element.addEventListener('change', this.proxy(this.onSelectChange));
            this.element.addEventListener('focus', this.proxy(this.onSelectFocus));

            // Follow the select's disabled state
            this.observer = new MutationObserver(() => {
                if (select.disabled) {
                    ts.disable();
                }
                else {
                    ts.enable();
                }
            });
            this.observer.observe(select, { attributes: true, attributeFilter: ['disabled'] });
        }

        // Typing on a closed single select opens it and searches
        bindTypeToSearch() {
            const ts = this.tomSelect;

            ts.control.addEventListener('keydown', (ev) => {
                if (ts.isOpen || ts.isLocked || ev.ctrlKey || ev.metaKey || ev.altKey) {
                    return;
                }

                if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    ts.open();
                    return;
                }

                if (ev.key.length === 1) {
                    ev.preventDefault();
                    ts.open();
                    ts.control_input.value = ev.key;
                    ts.control_input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        }

        // Picking a picked option removes it
        bindToggleOnSelect() {
            const ts = this.tomSelect;
            const onOptionSelect = ts.onOptionSelect;

            ts.hook('instead', 'onOptionSelect', (ev, option) => {
                const value = option && option.dataset.value;

                if (value !== undefined && ts.items.includes(value)) {
                    ts.removeItem(value);
                    ts.refreshOptions(false);

                    if (ts.settings.closeAfterSelect) {
                        ts.close();
                    }

                    return;
                }

                return onOptionSelect.call(ts, ev, option);
            });
        }

        // A full multiple select explains its limit in place of the dropdown
        bindMaximumNotice() {
            const ts = this.tomSelect;
            const open = ts.open;

            ts.hook('instead', 'open', () => {
                if (ts.isFull() && !ts.isLocked) {
                    this.showNotice(pluralize(this.translate('maximumSelected'), ts.settings.maxItems, this.pluralLanguage));
                    return;
                }

                return open.call(ts);
            });

            ts.on('item_remove', () => this.hideNotice());
            ts.on('blur', () => this.hideNotice());
        }

        // Notice sits outside the options, which Tom Select rerenders
        showNotice(message) {
            const ts = this.tomSelect;

            if (!this.notice) {
                this.notice = document.createElement('div');
                this.notice.className = 'no-results select-notice';
                ts.dropdown.prepend(this.notice);
            }

            this.notice.textContent = message;
            ts.dropdown.classList.add('is-notice');
            ts.dropdown.style.display = 'block';
            ts.dropdown.style.visibility = 'visible';
            this.positionDropdown();
        }

        hideNotice() {
            if (!this.notice) {
                return;
            }

            this.notice.remove();
            this.notice = null;
            this.tomSelect.dropdown.classList.remove('is-notice');
            this.tomSelect.dropdown.style.display = 'none';
            this.destroyPopper();
        }

        // Extra separators also make tags
        bindExtraSeparators() {
            const ts = this.tomSelect;
            const separators = this.tokenSeparators.slice(1);

            ts.control_input.addEventListener('keydown', (ev) => {
                if (separators.includes(ev.key) && ts.control_input.value.trim() !== '') {
                    ev.preventDefault();
                    ts.createItem();
                }
            });
        }

        // Sync outside changes to the select
        onSelectChange() {
            const ts = this.tomSelect;
            if (!ts || ts.isDispatchingChange) {
                return;
            }

            const selected = Array.from(this.element.selectedOptions).map((option) => option.value);
            const current = [].concat(ts.getValue()).filter((value) => value !== '');

            if (selected.filter((value) => value !== '').join('\u0000') !== current.join('\u0000')) {
                ts.sync();
            }
        }

        // Forward focus on the hidden select to the field
        onSelectFocus() {
            this.focus();
        }

        positionDropdown() {
            const ts = this.tomSelect;
            if (!ts) {
                return;
            }

            if (this.popper) {
                this.popper.update();
                return;
            }

            const autoWidth = ts.dropdown.classList.contains('select-dropdown-auto-width');

            // Gap of 0.375rem in the root font size
            const gap = parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.375 || 6;

            this.popper = createPopper(ts.control, ts.dropdown, {
                placement: 'bottom-start',
                modifiers: [
                    { name: 'offset', options: { offset: [0, gap] } },
                    { name: 'flip', options: { fallbackPlacements: ['top-start'] } },
                    {
                        name: 'matchFieldWidth',
                        enabled: true,
                        phase: 'beforeWrite',
                        requires: ['computeStyles'],
                        fn: ({ state }) => {
                            state.styles.popper[autoWidth ? 'minWidth' : 'width'] = state.rects.reference.width + 'px';
                        }
                    },
                    {
                        name: 'placementClass',
                        enabled: true,
                        phase: 'write',
                        fn: ({ state }) => {
                            const above = state.placement.startsWith('top');
                            ts.wrapper.classList.toggle('dropdown-above', above);
                            ts.wrapper.classList.toggle('dropdown-below', !above);
                        }
                    }
                ]
            });

            this.popper.forceUpdate();
        }

        destroyPopper() {
            if (this.popper) {
                this.popper.destroy();
                this.popper = null;
            }

            if (this.tomSelect) {
                this.tomSelect.wrapper.classList.remove('dropdown-above', 'dropdown-below');
            }
        }

        destroyPlaceholder() {
            const artefact = this.element && this.element.nextElementSibling;
            if (artefact && artefact.matches('.ts-wrapper.is-placeholder')) {
                artefact.remove();
            }
        }

        // Stand-in copy while markup swaps, so the form doesn't jump
        clonePlaceholder() {
            const wrapper = this.tomSelect && this.tomSelect.wrapper;
            if (!wrapper || !wrapper.isConnected) {
                return;
            }

            const copy = wrapper.cloneNode(true);
            copy.classList.add('is-placeholder');
            copy.removeAttribute('id');
            wrapper.after(copy);
            this.element.style.display = 'none';
        }
    });

    // Bind select.custom-select on render
    addEventListener('render', function() {
        document.querySelectorAll('select.custom-select:not([data-control~="custom-select"])').forEach(function(element) {
            element.dataset.control = ((element.dataset.control || '') + ' custom-select').trim();
        });
    });
}

function isTrue(value) {
    return value !== undefined && value !== 'false' && value !== '0';
}

function toNumber(value) {
    const number = parseFloat(value);
    return Number.isFinite(number) ? number : 0;
}

function escapeHtml(text) {
    return String(text ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[char]);
}

function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
}
