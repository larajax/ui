# Chart

Pie, bar and line charts drawn with [Chart.js](https://www.chartjs.org), and the goal meter for scoreboard items. Chart.js loads the first time a chart connects, so pages without charts never fetch it. The `Ui::pieChart()`, `Ui::barChart()` and `Ui::lineChart()` helpers write this markup, and a chart inside `Ui::scoreboard()` lays out as a scoreboard item.

## Pie Chart

The pie chart draws the values of its list as a ring, with an optional label in the center and a legend beside it. Each item is a label with its value in a `span`, and an optional `data-color`, or `data-value` when the span shows a formatted value.

```html
<div
    class="control-chart centered wrap-legend"
    data-control="chart-pie"
    data-size="200"
    data-center-text="114">
    <ul>
        <li data-color="#95b753">Published <span>84</span></li>
        <li data-color="#e5a91a">Drafts <span>12</span></li>
        <li>Deleted <span>18</span></li>
    </ul>
</div>
```

Values without a colour take one from the palette, in order, which is Bootstrap's colours. A colour can be any CSS colour, including a variable such as `var(--bs-success-base)`, which the chart reads as the page draws it. The **centered** class centers the ring above its legend and the **wrap-legend** class lays the legend out in a row.

| Attribute | Description |
|---|---|
| `data-size` | The size of the ring, the element's height by default |
| `data-center-text` | Text to display inside the ring |
| `data-chart-config` | Chart.js options as JSON, merged over the control's own |

## Bar Chart

The bar chart draws one bar per value of its list, from the same markup.

```html
<div
    class="control-chart wrap-legend"
    data-control="chart-bar"
    data-height="100"
    data-full-width="1">
    <ul>
        <li data-color="#95b753">Published <span>84</span></li>
        <li data-color="#e5a91a">Drafts <span>12</span></li>
    </ul>
</div>
```

| Attribute | Description |
|---|---|
| `data-height` | The height of the bars, the element's height by default |
| `data-full-width` | Spans the bars across the element's width, with the legend below |
| `data-gap` | A fixed gap between bars in pixels, a quarter of each bar's slot by default |
| `data-chart-config` | Chart.js options as JSON, merged over the control's own |

## Line Chart

The line chart draws data sets over a time axis, at the element's height. Each data set is a `span` with `data-chart="dataset"`, whose `data-set-data` lists the points as a timestamp in milliseconds and a value. Times show in UTC, so a point at midnight on the 1st shows on the 1st wherever the visitor is.

```html
<a href="#" id="reset-zoom" style="display: none">Reset zoom</a>

<div
    data-control="chart-line"
    data-zoomable
    data-reset-zoom-link="#reset-zoom"
    data-time-mode="weeks"
    data-chart-options="xaxis: {mode: 'time', minTickSize: [1, 'day']}"
    style="height: 200px">
    <span
        data-chart="dataset"
        data-set-name="Visits"
        data-set-color="#008dc9"
        data-set-data="[1477857082000, 400], [1477943482000, 380], [1478029882000, 340]">
    </span>
</div>
```

| Attribute | Description |
|---|---|
| `data-zoomable` | Zooms to the range a visitor drags across |
| `data-reset-zoom-link` | A selector for the link that resets the zoom, shown while zoomed |
| `data-time-mode` | `weeks` shades the weekends |
| `data-chart-options` | Flot style options, see below |
| `data-chart-config` | Chart.js options as JSON, merged over the control's own |

A data set's attributes are `data-set-name` (or `data-set-label`) for the legend, `data-set-color`, `data-set-data`, and its `data-set-lines` and `data-set-points` options as JSON, such as `{"fill": false}`.

Lines are smooth, without overshooting the points, and fill a fading area down to zero. Points show on hover, where the tooltip lists every data set's value at that date. `{"smooth": false}` in `data-set-lines` draws straight lines, and `{"show": true}` in `data-set-points` shows the points always, or `{"show": false}` never.

### Flot Style Options

`data-chart-options` takes the inside of a JavaScript object, as Flot did, and reads these keys:

| Key | Description |
|---|---|
| `xaxis.mode` | `time`, the default, or any other value for a plain number axis |
| `xaxis.minTickSize` | The smallest tick unit, such as `[1, 'day']` |
| `xaxis.tickSize` | The tick unit and step, such as `[2, 'month']` |
| `xaxis.timeformat` | The tick label format, a strftime pattern such as `%b %d` |
| `xaxis.min`, `xaxis.max`, `yaxis.min`, `yaxis.max` | The axis range |
| `xaxis.ticks`, `yaxis.ticks` | The most ticks to show |
| `yaxis.tickDecimals` | The decimal places of the value ticks |
| `legend.show` | `false` hides the legend |
| `series.lines` | `show`, `fill` (true or the opacity at the top of the fading area), `lineWidth` and `smooth` for every data set |
| `series.points` | `show` (always, rather than on hover), `radius`, `lineWidth` and `fillColor` for every data set |
| `grid.hoverable`, `tooltip` | `false` turns off the tooltip |
| `colors` | The colours of data sets that set none |

For anything else, use `data-chart-config` with [Chart.js options](https://www.chartjs.org/docs/latest/configuration/).

## Goal Meter

The goal meter adds a bar under a scoreboard item's figure that fills to a percentage, which screen readers read as a progress bar. The **goal-meter-inverse** class fills it in the negative colour, for a rate where higher is worse. The `--goal-meter-track`, `--goal-meter-fill` and `--goal-meter-inverse-fill` variables on `.title-value` set its colours.

```html
<div class="scoreboard-item title-value" data-control="goal-meter" data-value="88">
    <h4>Open rate</h4>
    <p>88%</p>
    <p class="description">37 posts remain</p>
</div>
```

## JavaScript API

```js
// The Chart.js instance of a pie, bar or line chart
jax.fetchControl(element, 'chart-line').chart

// Adds a data set to a line chart
jax.fetchControl(element, 'chart-line').addDataSet({ name: 'Orders', color: '#95b753', data: [[time, value]] })

// Resets a line chart's zoom
jax.fetchControl(element, 'chart-line').clearZoom()

// Fills a goal meter to a new percentage
jax.fetchControl(element, 'goal-meter').update(72)
```

### Events

Each chart dispatches `init` before it draws, with the Chart.js config in `event.detail.config` for a listener to change, and `ready` after, with the instance in `event.detail.chart`.

```js
element.addEventListener('chart-line:init', (event) => {
    event.detail.config.options.scales.y.beginAtZero = true;
});
```

## Styling

| Variable | Description |
|---|---|
| `--chart-color-1` to `--chart-color-12` | The palette, Bootstrap's blue, green, amber, red, violet, cyan, orange, pink, teal, lime, indigo and brown |
| `--chart-text-color` | Axis and legend text of a line chart |
| `--chart-grid-color` | Grid lines of a line chart |
| `--chart-track-color` | The ring behind a pie chart's values, the border colour by default |
| `--chart-markings-color` | The weekend shading of a line chart |
| `--chart-point-color` | The fill of a line chart's points |
| `--chart-legend-color`, `--chart-legend-value-color` | The legend of a pie or bar chart |
| `--chart-center-color` | A pie chart's center text |
| `--chart-selection-bg` | The range a visitor drags across to zoom |
| `--chart-hover-line-color` | The line down a line chart at the hovered date |

The charts read these when they draw, and again when the page switches between light and dark.

The tooltip is a card with its own variables on `#chart-tooltip`: `--chart-tooltip-bg`, `--chart-tooltip-color`, `--chart-tooltip-muted-color`, `--chart-tooltip-border` and `--chart-tooltip-shadow`.

Charts draw without animating for visitors whose system asks for reduced motion.
