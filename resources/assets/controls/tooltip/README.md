# Tooltip

Shows a small tooltip for any element with a `data-tooltip-text` attribute. The control listens on the document, so elements added after the page loads need no setup. The `Ui::button()`, `Ui::ajaxButton()`, `Ui::popupButton()` and `Ui::iconButton()` helpers set these attributes when they have a `hotkey`, and the tooltip then lists the shortcut after the label.

## Basic Usage

```html
<button
    type="button"
    class="btn-solid theme-primary"
    data-hotkey="ctrl+s, cmd+s"
    data-tooltip-text="Save"
    data-tooltip-hotkey="⌃S, ⌘S"
    data-tooltip-position="top">
    Save
</button>
```

The tooltip shows after 300ms of hovering and hides when the pointer leaves, on any click or key press, and before an AJAX update. Inside a modal dialog it mounts in the dialog, so it shows above the backdrop.

For field and column tooltips, the library uses Bootstrap's own tooltip (`data-bs-toggle="tooltip"`).

### Data Attributes

| Attribute | Description |
|---|---|
| `data-tooltip-text` | The tooltip text |
| `data-tooltip-hotkey` | Comma separated hotkey labels, each shown as a key after the text |
| `data-tooltip-position` | `top` places the tooltip above the element, otherwise it goes below |

## JavaScript API

```js
jax.tooltips.clear()
```

Hides the tooltip and cancels one that is waiting to show.

## Styling

| Property | Description |
|---|---|
| `--tooltip-bg` / `--tooltip-color` | Tooltip colors |
| `--tooltip-hotkey-bg` / `--tooltip-hotkey-color` | Hotkey key colors |
| `--oc-zindex-tooltip` | Stacking order |
