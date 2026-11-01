# Password Reveal

A toggle button that shows and hides the value of a password input.

## Basic Usage

The button sits at the end of a Bootstrap 6 adorned field, after the password input. `aria-controls` names the input; without it, the control uses the input in the button's adorned field.

```html
<label class="form-control form-adorn">
    <input
        type="password"
        name="password"
        id="password"
        class="form-ghost"
        autocomplete="off" />
    <button
        type="button"
        class="btn-icon"
        aria-label="Show password"
        aria-pressed="false"
        aria-controls="password"
        data-control="password-reveal"
        data-icon-show="ph ph-eye"
        data-icon-hide="ph ph-eye-slash"
    >
        <i class="ph ph-eye" aria-hidden="true" data-reveal-icon></i>
    </button>
</label>
```

A password form field renders this markup unless its `revealable` option is `false`.

## Behavior

- A click switches the input between `password` and `text`, sets `aria-pressed` and swaps the `data-reveal-icon` element from the show icon to the hide icon.
- The label stays "Show password" while `aria-pressed` reports whether the value shows.
- While the input has focus, a mouse press and release on the button leave focus and the caret in the input, so typing carries on. From the keyboard, focus stays on the button.
- Submitting the input's form hides the value again, so the browser saves it as a password rather than as text it might suggest in other fields.
- The browser's own reveal button (`::-ms-reveal`) is hidden in a field that has this button.

## Data Attributes

- `data-control="password-reveal"`: enables the control on the button.
- `aria-controls`: id of the password input.
- `data-icon-show`: icon classes shown while the value is hidden.
- `data-icon-hide`: icon classes shown while the value shows.

## JavaScript API

```js
const control = jax.fetchControl(button, 'password-reveal');

control.show();
control.hide();
control.toggle();
control.isShown();
```
