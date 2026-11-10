/*
 * Bar chart control
 *
 * Draws the values of the list inside the element as bars, with a legend beside them. Each item is a
 * label with its value in a span, and an optional data-color.
 *
 *     <div class="control-chart wrap-legend" data-control="chart-bar" data-height="100" data-full-width="1">
 *         <ul>
 *             <li data-color="#95b753">Published <span>84</span></li>
 *             <li>Drafts <span>12</span></li>
 *         </ul>
 *     </div>
 *
 * Data attributes:
 * - data-control="chart-bar" - enables the bar chart control
 * - data-height="200" - optional, height of the graph, the element's height by default
 * - data-full-width="1" - optional, determines whether the chart should use the full width of the container
 * - data-gap="2" - optional, a fixed gap between bars in pixels, a quarter of each bar's slot by default
 * - data-chart-config - optional, Chart.js options as JSON, merged over the control's own
 *
 * Events:
 * - chart-bar:init - before the chart draws, with the Chart.js config in detail.config, which a listener may change
 * - chart-bar:ready - after the chart draws, with the Chart.js instance in detail.chart
 *
 * JavaScript API:
 * jax.fetchControl(element, 'chart-bar').chart - the Chart.js instance
 */
'use strict';

import {
    createChart,
    createLegend,
    destroyChart,
    getLegendLabel,
    isFlagOn,
    loadListValues,
    readThemeColors,
    tooltipOptions,
    tooltipRow,
    valueColors,
    watchTheme,
    withAlpha
} from './chart-utils.js';

// The share of each bar's slot the bar fills, leaving the rest as the gap
const BAR_SHARE = 0.75;

// The opacity of a hovered bar
const HOVER_OPACITY = 0.85;

/**
 * buildBarConfig returns the Chart.js config for one bar per value, rounded at the top and scaled to the largest value, with a gap in pixels when given one.
 */
export function buildBarConfig({ values, colors, max, gap, label = (index) => String(index) }) {
    const hasFixedGap = typeof gap === 'number' && gap >= 0;

    const dataset = {
        data: values.map((valueInfo) => valueInfo.value),
        backgroundColor: colors,
        hoverBackgroundColor: colors.map((color) => withAlpha(color, HOVER_OPACITY)),
        borderRadius: 4,
        borderSkipped: 'start',
        barPercentage: hasFixedGap ? 1 : BAR_SHARE,
        categoryPercentage: 1
    };

    // A clear border on either side leaves a fixed gap between bars at any width
    if (hasFixedGap) {
        Object.assign(dataset, {
            borderColor: 'transparent',
            hoverBorderColor: 'transparent',
            borderWidth: { left: gap / 2, right: gap / 2, top: 0, bottom: 0 }
        });
    }

    return {
        type: 'bar',
        data: {
            labels: values.map((_, index) => label(index)),
            datasets: [dataset]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 700,
                easing: 'easeOutQuart'
            },
            layout: { padding: 0 },
            scales: {
                x: { display: false },
                y: { display: false, min: 0, max: max || 1 }
            },
            plugins: {
                legend: { display: false },
                // The dataset holds the current colours, which change with the theme
                tooltip: tooltipOptions(([point]) => tooltipRow(point.dataset.backgroundColor[point.dataIndex], label(point.dataIndex).trim(), values[point.dataIndex].value))
            }
        }
    };
}

export function registerChartBar(jax) {
    jax.registerControl('chart-bar', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({
                gap: undefined,
                height: undefined,
                fullWidth: undefined
            }, this.config);
        }

        connect() {
            // Canvas already drawn
            if (this.element.querySelector(':scope > div.canvas')) {
                return;
            }

            this.buildChart();
            this.stopWatchingTheme = watchTheme(this.proxy(this.onThemeChange));
        }

        disconnect() {
            if (this.stopWatchingTheme) {
                this.stopWatchingTheme();
                this.stopWatchingTheme = null;
            }

            destroyChart(this);

            // Puts the list back, so the chart draws again when the element reconnects
            if (this.canvasBox) {
                this.canvasBox.remove();
                this.legend.remove();
                this.list.hidden = false;
                this.element.classList.remove('full-width');
            }

            this.canvasBox = null;
            this.legend = null;
            this.list = null;
            this.values = null;
            this.indicators = null;
        }

        isFullWidth() {
            return isFlagOn(this.config.fullWidth);
        }

        buildChart() {
            this.list = this.element.querySelector(':scope > ul');
            if (!this.list) {
                return;
            }

            const size = this.size = this.element.offsetHeight || 100;
            const values = this.values = loadListValues(this.list);
            const { legend, indicators } = createLegend(this.list);
            const isFullWidth = this.isFullWidth();
            const chartHeight = this.config.height !== undefined ? this.config.height : size;
            const colors = valueColors(this.element, values.values, readThemeColors(this.element).palette);

            this.legend = legend;
            this.indicators = indicators;
            this.canvasBox = document.createElement('div');
            this.canvasBox.className = 'canvas';
            this.canvasBox.style.height = `${chartHeight}px`;
            this.canvasBox.style.width = isFullWidth ? '100%' : `${size}px`;

            const canvas = document.createElement('canvas');
            this.canvasBox.appendChild(canvas);
            this.element.prepend(this.canvasBox);
            this.element.classList.toggle('full-width', isFullWidth);

            indicators.forEach((indicator, index) => {
                indicator.style.backgroundColor = colors[index];
            });

            createChart(this, canvas, buildBarConfig({
                values: values.values,
                colors,
                max: values.max,
                gap: this.config.gap,
                label: (index) => getLegendLabel(legend, index)
            }));
        }

        // The values take the palette again, which may differ between light and dark
        onThemeChange() {
            if (!this.chart) {
                return;
            }

            const colors = valueColors(this.element, this.values.values, readThemeColors(this.element).palette);
            const dataset = this.chart.data.datasets[0];
            dataset.backgroundColor = colors;
            dataset.hoverBackgroundColor = colors.map((color) => withAlpha(color, HOVER_OPACITY));

            this.indicators.forEach((indicator, index) => {
                indicator.style.backgroundColor = colors[index];
            });

            this.chart.update('none');
        }
    });
}
