# Select

### Select

Custom select control, a searchable dropdown built on Tom Select. A multiple select becomes a tag input.

    <select class="form-control custom-select">
        <option selected="selected" value="2">Approved</option>
        <option value="3">Deleted</option>
        <option value="1">New</option>
    </select>

The select keeps its name and value, and dispatches `change` when the choice changes, so forms read it as a plain select. Setting the select's value from a script and dispatching `change` updates the field too.

## Sizes

### Small size

    <div class="form-group form-group-sm">
        <select class="form-control custom-select">
            <option value="1" selected="selected">One</option>
            <option value="2">Two</option>
        </select>
    </div>

### Large size

    <div class="form-group form-group-lg">
        <select class="form-control custom-select">
            <option value="1" selected="selected">One</option>
            <option value="2">Two</option>
        </select>
    </div>

The `form-control-sm` and `form-control-lg` classes on the select size it the same way.

## Options

### Disable search

Add the `select-no-search` CSS class to disable searching.

    <div class="form-group">
        <select class="form-control custom-select select-no-search">
            <option value="1" selected="selected">One</option>
            <option value="2" selected="selected">Two</option>
        </select>
    </div>

### Classes

Class | Description
------------- | -------------
**select-no-search** | a single select without its search box.
**select-hide-selected** | the dropdown of a multiple select leaves out the options already picked.
**select-dropdown-auto-width** | the dropdown sizes to its options, at least as wide as the field.
**select-no-dropdown** | a tag input without a dropdown, where typed text becomes a tag.

### Data attributes

Attribute | Description
------------- | -------------
**data-placeholder** | a hint while nothing is picked, with a button that clears the choice.
**data-allow-clear** | the clear button without a placeholder.
**data-tags** | the select accepts values of its own, typed and confirmed with Enter.
**data-token-separators** | characters, separated by `\|`, that turn the typed text into a tag.
**data-maximum-selection-length** | the most options a multiple select takes.
**data-close-on-select** | `false` keeps the dropdown open after each pick of a multiple select.
**data-minimum-results-for-search** | fewer options than this hide the search box, `Infinity` for never.
**data-sortable** | tags reorder by dragging, and post in that order.
**data-checkboxes** | the options of a multiple select show checkboxes.
**data-dropdown-header** | a title row with a close button atop the dropdown.
**data-optgroup-columns** | option groups sit side by side as columns.
**data-create-filter** | a regular expression that typed tags must match.
**data-create-on-blur** | typed text becomes a tag when the field loses focus.
**data-duplicates** | the same tag can be picked more than once.
**data-search-fields** | the option fields the search matches, comma separated.
**data-select-on-tab** | Tab picks the highlighted option.
**data-language** | the translation of the messages, such as `de`; the page's `lang` attribute when not given.

An `<option>` can carry a `data-status` color, shown as a dot, a `data-icon` with icon classes, or a `data-image` address, shown before its text.

## JavaScript API

```js
const control = jax.fetchControl(select, 'custom-select');

control.focus();
control.refresh();
control.tomSelect;
```

`focus()` moves the keyboard focus to the field without opening its dropdown, as tabbing to it would. `refresh()` reads the select's options and value again, without a change event. `tomSelect` is the Tom Select instance, for its own API.

## Option groups

Use the `optgroup` element to create option groups.

    <select class="form-control custom-select">
        <option value="1">Please select an option</option>
        <option value="2">Ungrouped option</option>
        <optgroup label="Option Group">
            <option value="3">Grouped option</option>
            <option value="4">Another option</option>
            <option value="4">Third option</option>
        </optgroup>
    </select>

## AJAX search

Use the `data-handler` attribute to source the select options from an AJAX handler.

    <select
        class="form-control custom-select"
        data-handler="onGetOptions"
        data-minimum-input-length="2"
        data-ajax--delay="300"
        data-request-data="foo: 'bar'"
    ></select>

The control sends the search text as `term` (and `q`), and `page` from the second page on. The handler returns the matching options as `id` and `text` pairs.

    public function onGetOptions()
    {
        return [
            'results' => [
                [
                    'id' => 1,
                    'text' => 'Foo'
                ],
                [
                    'id' => 2,
                    'text' => 'Bar'
                ]
                ...
            ]
        ];
    }

Or a more full-featured example:

    public function onGetOptions()
    {
        return [
            'results' => [
                [
                    'id' => 1,
                    'text' => 'Foo',
                    'disabled' => true
                ],
                [
                    'id' => 2,
                    'text' => 'Bar',
                    'icon' => 'ph ph-star'
                ],
                [
                    'text' => 'Group',
                    'children' => [
                        [
                            'id' => 3,
                            'text' => 'Child 1'
                        ],
                        [
                            'id' => 4,
                            'text' => 'Child 2'
                        ]
                        ...
                    ]
                ]
                ...
            ],
            'pagination' => [
                'more' => true
            ]
        ];
    }

An item with `children` is an option group, and each item can set `status`, `icon` or `image` as the option data attributes do. `pagination.more` makes the dropdown ask for the next page as the visitor scrolls. `data-preload` asks for the first page when the field takes focus, before anything is typed.

The results array can be assigned to either the `result` or `results` key. As an alternative, results can also be provided as an associative array (also assigned to either key). Due to the fact that JavaScript does not guarantee the order of object properties, we suggest the method above for defining results.

    public function onGetOptions()
    {
        $results = [
            'key' => 'value',
            ...
        ];

        return ['result' => $results];
    }
