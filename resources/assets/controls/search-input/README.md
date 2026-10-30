# Search Input

Renders a search input with clear input, loading state and search icon.

## Basic Usage

The field is a Bootstrap 6 adorned control: a `<label class="form-control form-adorn">` holding the search icon, the input and the clear button.

```html
<div data-control="search-input">
    <label class="form-control form-adorn">
        <span class="form-adorn-icon" aria-hidden="true">
            <i class="ph ph-magnifying-glass"></i>
        </span>
        <input
            placeholder="Search ..."
            type="text"
            name="search_input"
            value=""
            aria-label="Search ..."
            data-request="onSubmit"
            data-track-input
            data-load-indicator
            data-load-indicator-opaque
            class="form-ghost"
            autocomplete="off"
            data-search-input />
        <button
            class="clear-input-text"
            type="button"
            value=""
            style="display: none"
            aria-label="Clear"
            data-search-clear
        >
            <i class="ph ph-x" aria-hidden="true"></i>
        </button>
    </label>
</div>
```

The input carries its own `aria-label`, since the wrapping label would otherwise name it after the clear button.
