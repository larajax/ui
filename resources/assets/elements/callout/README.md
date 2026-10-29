# Callout

A highlighted message block in four types: `callout-info`, `callout-success`, `callout-warning` and `callout-danger`. `Ui::callout()` renders this markup, and so does the form's `hint` field.

```html
<div class="callout fade show callout-warning has-custom-icon">
    <div class="header">
        <div class="custom-icon">
            <i class="ph ph-warning" aria-hidden="true"></i>
        </div>
        <h3>Trial ending</h3>
        <p>Your trial ends in 3 days.</p>
    </div>
    <div class="content">
        <p>Add a payment method to keep your projects.</p>
    </div>
</div>
```

The icon is an icon pack class inside `.custom-icon`. `Ui::callout()` uses the pack's `callout.info`, `callout.success`, `callout.warning` or `callout.danger` key unless `->icon()` names another icon, and `->icon(false)` leaves it out.

## Modifiers

| Class | Description |
|---|---|
| `no-icon` | No icon, the text starts at the left edge |
| `no-title` | The callout has content but no header |
| `no-subheader` | The header has a title but no comment |
| `is-flush` | No bottom margin or bottom corners, to sit on top of another panel |

## Styling

| Property | Description |
|---|---|
| `--callout-bg` | Background of the header and content, set per type with `light-dark()` |
| `--callout-icon-color` | Icon color, set per type |
| `--callout-color` | Text color |
| `--callout-radius` | Corner radius |
