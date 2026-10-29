# Dropdown

Styles Bootstrap 6 menus with the library look. The behavior comes from Bootstrap's own menu data API (`data-bs-toggle="menu"`), loaded from the Bootstrap bundle on the page, so this control is CSS only.

## Basic Usage

Put the toggle and its `.menu` side by side, and add `control-dropdown` to the menu. Bootstrap finds the menu next to the toggle, so no `data-bs-target` or wrapper is needed.

```html
<button type="button" class="btn-solid theme-primary" data-bs-toggle="menu" aria-expanded="false">
    Menu
</button>
<div class="menu control-dropdown" role="menu">
    <a class="menu-item" role="menuitem" href="#">
        Option 1
    </a>
    <hr class="menu-divider">
    <a class="menu-item" role="menuitem" href="#">
        Option 2
    </a>
</div>
```

Items must be direct children of the `.menu`, because Bootstrap's keyboard navigation only looks there. Disable an item with the `disabled` class.

### Placement

Set `data-bs-placement` on the toggle, for example `bottom-end` to align the menu with the toggle's right edge.

```html
<a href="#" data-bs-toggle="menu" data-bs-placement="bottom-end" aria-expanded="false">
    Menu
</a>
```

### Overflow Containers

For a menu inside an `overflow: hidden` or scrolling container, add `data-bs-strategy="fixed"` to the toggle so the menu is positioned against the viewport. `Ui::dropdownButton()` does this.

```html
<button type="button" class="btn-solid theme-secondary" data-bs-toggle="menu" data-bs-strategy="fixed" aria-expanded="false">
    Menu
</button>
```

### Body Container

`data-bs-container="body"` on the toggle moves the menu to `<body>` while it is open. Avoid it inside a modal `<dialog>`, because the moved menu renders beneath the dialog's top layer. A menu left in place inside the dialog works.

## Events

Bootstrap dispatches `show.bs.menu`, `shown.bs.menu`, `hide.bs.menu` and `hidden.bs.menu` on the toggle. `shown` and `hidden` fire after the menu's CSS transition, so use `show` to change a menu's items before it opens.

## Styling

| Selector | Description |
|---|---|
| `.menu.control-dropdown` | Menu with a light border, 4px corners, no padding and 14px text, set through Bootstrap's `--bs-menu-*` variables |
| `> .menu-item` | Item colors from `--oc-dropdown-hover-bg`, `--oc-dropdown-hover-color` and `--oc-dropdown-active-bg` |
| `> .menu-item > i` | Muted icon that takes the item color on hover |
| `--oc-zindex-dropdown` | Menu z-index (`--bs-menu-zindex`) |
