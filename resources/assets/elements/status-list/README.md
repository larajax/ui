# Status List

A list of statuses, each with an icon, its text and a label or link on the right. `Ui::statusList()` and `Ui::statusItem()` write this markup.

```html
<div class="control-status-list">
    <ul>
        <li>
            <span class="status-icon success"><i class="ph ph-check"></i></span>
            <span class="status-text success">Software is up to date</span>
            <a href="#" class="status-label link">Update</a>
        </li>

        <li>
            <span class="status-icon warning"><i class="ph ph-warning"></i></span>
            <span class="status-text warning">Some issues need attention</span>
            <a href="#" class="status-label link">View</a>
        </li>

        <li>
            <span class="status-icon"><i class="ph ph-info"></i></span>
            <span class="status-text">System build</span>
            <span class="status-label">313</span>
        </li>
    </ul>
</div>
```

The **success**, **warning**, **danger**, **primary** and **info** classes colour the icon and the text, and **muted** greys the text. The **link** class on the icon leaves it without a background.

## Styling

| Variable | Description |
|---|---|
| `--status-list-color` | The text and link colour |
| `--status-list-hover-color` | A hovered link |
| `--status-list-border-color` | The line between items |
| `--status-list-icon-bg`, `--status-list-icon-color` | An icon without a status class |
