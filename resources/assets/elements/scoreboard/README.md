# Scoreboard

A row of key figures a thin line apart, which scrolls sideways by dragging when it runs out of room, fading out at an edge with more to scroll to. `Ui::scoreboard()` writes the container and `Ui::scoreboardItem()`, `Ui::scoreboardThumbnail()`, `Ui::pieChart()` and `Ui::barChart()` write its items.

```php
<?php Ui::scoreboard()->slot() ?>
    <?= Ui::scoreboardItem(label: 'Orders', value: '1,284', comment: 'this month') ?>
    <?= Ui::scoreboardItem(label: 'Revenue', value: '$48,210', change: '14.9%', positive: true, sparkline: [36, 39, 42, 48]) ?>
    <?= Ui::scoreboardItem(label: 'Open rate', meter: 64, comment: '120 unread') ?>
    <?= Ui::pieChart(values: ['Published' => 84, 'Drafts' => 12]) ?>
<?php Ui::end() ?>
```

## Markup

```html
<div class="scoreboard">
    <div data-control="toolbar">
        <div class="scoreboard-item title-value">
            <h4>Weight</h4>
            <p>100</p>
            <p class="description">unit: kg</p>
        </div>

        <div class="scoreboard-item title-value">
            <h4>Comments</h4>
            <p class="positive">44</p>
            <p class="description">previous month: 32</p>
        </div>

        <div class="scoreboard-item title-value">
            <h4>Latest commenter</h4>
            <p><i class="ph ph-star"></i> John Smith</p>
            <p class="description">registered: yes</p>
        </div>
    </div>
</div>
```

### Figures

A `title-value` item holds an `h4` title, the figure in a `p`, and a `p.description` line. The components write the title as a `div.scoreboard-label` instead, which keeps a row of figures out of the page's headings.

| Class on the figure | Description |
|---|---|
| `positive` | A green arrow after the figure |
| `negative` | A red arrow after the figure |
| `success` | A green figure |
| `danger` | A red figure |

The figure can start with a marker: an icon (`<i class="ph ph-star"></i>`), a colour swatch (`<span class="scoreboard-colorpicker" style="--background-color: #95b753; --foreground-color: #95b753"></span>`) or a small image (`<img class="scoreboard-image" src="..." alt="">`).

### Component Markup

`Ui::scoreboardItem()` writes these parts as well:

| Markup | Description |
|---|---|
| `span.scoreboard-trend` | The change in a pill after the figure, with `is-positive` or `is-negative` for its tint and arrow |
| `span.scoreboard-unit` | A unit after the figure |
| `span.scoreboard-empty` | "No data" in place of a figure without a value |
| `svg.scoreboard-sparkline` | A small line of recent values under the figure, with a `path.scoreboard-sparkline-dot` on the latest, and `is-positive` or `is-negative` for its colour |
| `span.scoreboard-icon` | An icon in a tile beside the text, on an item with `has-icon`, tinted by `--scoreboard-icon-tint` with `is-tinted` |
| `a.scoreboard-link` | A link covering an item with `has-link` |
| `span.scoreboard-help` | An icon by the title that shows a tooltip from `data-tooltip-text` |

### Thumbnails

A `thumbnail-value` item shows an image, such as a product photo.

```html
<div class="scoreboard-item thumbnail-value">
    <img src="/images/lamp.jpg" alt="Desk lamp">
</div>
```

### Charts and Goal Meters

A pie or bar chart is a scoreboard item with the `control-chart` class, and the goal meter fills a bar beside a figure. See the [chart controls](../../controls/chart/README.md).

```html
<div class="scoreboard-item control-chart" data-control="chart-pie">
    <ul>
        <li data-color="#95b753">Published <span>84</span></li>
        <li data-color="#e5a91a">Drafts <span>12</span></li>
    </ul>
</div>

<div class="scoreboard-item title-value" data-control="goal-meter" data-value="88">
    <h4>Open rate</h4>
    <p>88%</p>
    <p class="description">37 unread</p>
</div>
```

## Styling

| Variable | Description |
|---|---|
| `--scoreboard-label-color` | The item titles |
| `--scoreboard-value-color` | The figures |
| `--scoreboard-description-color` | The description lines |
| `--scoreboard-divider-color` | The line between items |
| `--scoreboard-icon-color`, `--scoreboard-icon-bg` | An icon, and the tile behind it |
| `--scoreboard-positive-color`, `--scoreboard-positive-bg` | Up trends and green figures, and the pill behind an up trend |
| `--scoreboard-negative-color`, `--scoreboard-negative-bg` | Down trends and red figures, and the pill behind a down trend |
| `--scoreboard-trend-color`, `--scoreboard-trend-bg` | A change without a direction |
| `--scoreboard-sparkline-color` | A sparkline without a direction |
| `--scoreboard-unit-color`, `--scoreboard-empty-color` | A unit, and "No data", the title colour by default |
| `--scoreboard-link-color` | A linked item on hover |
| `--scoreboard-fade-size` | How far the row fades at an edge with more to scroll to |

The trend arrows come from the `scoreboard.up` and `scoreboard.down` icon keys.
