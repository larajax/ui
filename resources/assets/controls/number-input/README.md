# Number Input

Keeps a text input to a number, and can show it with group separators and fixed decimals while the plain number posts.

## Basic Usage

A text input with `inputmode` opens the number keypad on phones. Without a format, the input carries the name and the plain number.

```html
<input
    type="text"
    inputmode="decimal"
    name="price"
    value="89.5"
    class="form-control"
    data-control="number-input"
    data-min="0"
    data-step="0.01" />
```

## Display Format

With `data-number-format`, the input shows the formatted number and has no name. The hidden input after it, marked `data-number-value`, carries the name and the plain number.

```html
<input
    type="text"
    inputmode="decimal"
    value="1,250,000.00"
    class="form-control"
    data-control="number-input"
    data-number-format='{"locale":"en","decimals":2,"grouping":true}' />
<input type="hidden" name="annual_revenue" value="1250000" data-number-value />
```

The format options are:

- `locale`: the locale whose decimal and group separators and group sizes the browser uses, such as `de-DE` or `en-IN`.
- `decimals`: a fixed number of decimal places, padded or rounded when the input loses focus. Without it, decimals show as typed. With `0`, no decimal point can be typed.
- `grouping`: `false` leaves out the group separators.

An element that only shows a number, such as a preview, takes the same format and the plain number in `data-number-value`, and the control writes the formatted number as its text.

## Behavior

- Characters that are not part of a number are dropped as they are typed. A point or comma that is not the locale's group separator is read as the decimal point.
- Separators are placed as you type, and the caret stays beside the same digit. Backspace after a separator, or Delete before one, removes the digit beyond it.
- A minus sign is accepted unless `data-min` is zero or more.
- Arrow Up and Arrow Down add or take away `data-step`, default 1, within the range.
- When an edited input loses focus, the value is held to `data-min` and `data-max` and padded or rounded to the fixed decimals. An input that was not edited keeps its stored value.
- A change event fires from the input that posts: the input itself without a format, or the hidden input with one.
- The trigger API's `fill` and `empty` actions settle the shown text, and `disable` disables the hidden input along with the shown one.

## Data Attributes

- `data-control="number-input"`: enables the control on a text input, or on an element that only shows a number.
- `data-min`, `data-max`: the range.
- `data-step`: what the arrow keys add or take away.
- `data-number-format`: the JSON display format.
- `data-number-value`: marks the hidden input that posts, or holds the number an element shows.

## JavaScript API

```js
const control = jax.fetchControl(input, 'number-input');

control.getValue();             // '1250000.5'
control.setValue('1500.5');     // shows 1,500.50 and fires a change event
```
