# Popups

Displays a modal popup on a native `<dialog>`, opened with `showModal()` and styled with Bootstrap 6's dialog classes. It needs no Bootstrap JavaScript.

## Remote popups

Content for the popup can be loaded remotely using an AJAX request. Use the `data-handler` attribute to populate a popup with the contents of an AJAX handler.

```html
<a
    data-control="popup"
    data-handler="onLoadContent"
    href="javascript:;"
    class="btn btn-primary btn-lg">
    Launch Ajax Form
</a>
```

Using the `data-ajax` attribute you can refer to an external file or URL directly.

```html
<a
    data-control="popup"
    data-ajax="popup-content.htm"
    href="javascript:;"
    class="btn btn-primary btn-lg">
    Launch Ajax Form
</a>
```

The partial for your rendered popup should follow this structure, using Bootstrap's dialog classes:

```html
<div class="dialog-header">
    <h4 class="dialog-title">
        Send email
    </h4>
    <button type="button" class="btn-close" data-dismiss="popup" aria-label="Close"></button>
</div>
<div class="dialog-body">
    <!-- Any popup content goes here -->
</div>
<div class="dialog-footer">
    <button
        type="submit"
        class="btn btn-primary"
        data-request="onSend"
        data-popup-load-indicator>
        Send
    </button>
    <button
        type="button"
        class="btn btn-default"
        data-dismiss="popup">
        Close
    </button>
</div>
```

The content is placed directly inside the `<dialog class="control-popup dialog">` element. A `dialog-body` without a header or footer can add `dialog-no-header` or `dialog-no-footer` for even padding.

A `data-popup-size` attribute on the first element, or on any element inside the content, sets the popup size from the response.

## Sizes

Sizes with a Bootstrap counterpart use its dialog class, the others set the dialog width. Every size also adds a `size-*` class to the dialog.

| Size | Width |
|---|---|
| `tiny` | `dialog-sm` |
| `small` | 400px |
| (none) | Bootstrap's default |
| `large` | `dialog-lg` |
| `huge` | 900px |
| `giant` | `dialog-xl` |
| `fullscreen` | `dialog-fullscreen` |
| `adaptive` | the window width less 100px, full width on small screens |
| `auto` | fits the content |
| a number such as `600` | that many pixels |

`adaptiveHeight` stretches the popup to the window height less 100px.

## API documentation

### Options

- `handler` - AJAX handler name
- `ajax` - URL to load the content from
- `content` - content HTML string, DOM node or callback
- `extraData` - extra request data, an object or `key: value` string
- `size` - popup size, see the table above
- `keyboard` - allow the popup to be closed with the Escape key (default `true`); when `false`, Escape bounces the popup
- `backdrop` - what a click on the backdrop does: `'static'` bounces the popup (default), `true` closes it, `false` ignores the click
- `adaptiveHeight` - stretch the popup to the window height
- `zIndex` - accepted for compatibility and ignored, since the browser's top layer stacks open dialogs

### Data attributes

- `data-control="popup"` - enables the popup on click
- `data-ajax="popup-content.htm"` - ajax content to load
- `data-handler="onLoadContent"` - AJAX handler name
- `data-keyboard="false"` - disallow closing the popup with the Escape key
- `data-backdrop="true"` - close the popup when the backdrop is clicked
- `data-extra-data="file_id: 1"` - extra request data (the element's `data-request-data` is merged as well)
- `data-size="large"` - popup size
- `data-dismiss="popup"` - inside a popup, closes it when clicked
- `data-popup-load-indicator` - inside a popup, on an element with `data-request`, hides the popup behind the loading indicator while that request runs, and shakes it on failure

### JavaScript API

```js
import { Popup } from 'larajax-ui';

Popup.open({ ajax: 'popup-content.htm' });
Popup.open({ handler: 'onLoadSomePopup', extraData: { id: 3 } });

// Create or reload the popup for a trigger element
Popup.fromElement(link, { handler: 'onLoadSomePopup' });

// Call a method on an open popup, from its trigger, its container or the first div of its content
Popup.getInstance(element).hide();
Popup.fromElement(element, 'lock', true);
```

The class is also available as `jax.popup`. Instance methods: `show()`, `hide()`, `reload()`, `toggle()`, `lock(bool)`, `visible(bool)`, `setLoading(bool)`, `setShake()`, `hideLoading()`. The instance's `container`, `dialog` and `content` all refer to the `<dialog>` element.

- `jax.popup.bindToPopups(container, vars)` - adds the variables as hidden inputs to the form of any popup opened from inside the container
- `jax.popup.focusFirstInput(container)` - focuses the first input when nothing has an `autofocus` attribute

### Events

Dispatched on the trigger element and on the first div of the popup content. `event.detail` holds `popup`, `trigger` and `modal`, which is the `<dialog>` element.

| Event | Description |
|---|---|
| `popup:show` | The content was placed and the popup is showing |
| `popup:shown` | The show transition finished |
| `popup:hide` | The popup is closing |
| `popup:hidden` | The popup closed and was removed |
| `popup:complete` | The handler content loaded |
| `popup:error` | The handler request failed |
| `popup:toggle` | `toggle()` was called |
| `popup:download` | The handler responded with a file download |

Dispatch `popup:close` on the popup or any element inside it to close it.

```js
element.dispatchEvent(new CustomEvent('popup:close', { bubbles: true }));
```

`popup:show` is also dispatched on the document when a popup starts opening. Closing ends with the dialog's native `close` event, after the `hiding` transition.

## Loading backdrop

While the content loads, a `.popup-backdrop` with a loading indicator dims the page. It is shown as a manual popover so it renders in the top layer, above any open dialog, and it sits inside the dialog the popup was opened from. When the popup opens, its dialog's own `::backdrop` takes over. A `data-popup-load-indicator` request shows the indicator again inside the open popup, over a clear backdrop.

## The top layer

An open modal dialog renders in the browser's top layer and makes the rest of the page inert, so anything appended to `document.body` renders below the popup and cannot be clicked. Floating UI opened from inside a popup mounts inside the enclosing `<dialog>` instead: the popover control, Select2 dropdowns, the date and time pickers, the color picker and the rich editor's panels and bubbles. The helpers in `dialog-mount.js` return the mount parent and convert page coordinates into it.

A popup normally lets its content overflow, so menus and pickers inside are not clipped. When the content is taller than the window allows, the dialog gets `popup-scrollable` and scrolls as a whole.

## Popup stacker

`jax.popupStacker` pushes open popups back, scaled and offset, when another popup opens over them, and pulls the next one forward when the top popup closes. The browser's top layer already stacks the dialogs in the order they open, so the stacker only moves them and sets no z-index. It reacts to the document-level `popup:show` and to the dialog's native `close` event. `jax.popupStacker.getFirstPopup()` returns the topmost open popup.
