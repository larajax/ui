/*
 * Pie chart control
 *
 * Draws the values of the list inside the element as a ring, with a legend beside it. Each item is a
 * label with its value in a span, and an optional data-color.
 *
 *     <div class="control-chart" data-control="chart-pie" data-size="200" data-center-text="114">
 *         <ul>
 *             <li data-color="#95b753">Published <span>84</span></li>
 *             <li>Drafts <span>12</span></li>
 *         </ul>
 *     </div>
 *
 * Data attributes:
 * - data-control="chart-pie" - enables the pie chart control
 * - data-size="200" - optional, size of the graph, the element's height by default
 * - data-center-text - text to display inside the graph
 * - data-chart-config - optional, Chart.js options as JSON, merged over the control's own
 *
 * Events:
 * - chart-pie:init - before the chart draws, with the Chart.js config in detail.config, which a listener may change
 * - chart-pie:ready - after the chart draws, with the Chart.js instance in detail.chart
 *
 * JavaScript API:
 * jax.fetchControl(element, 'chart-pie').chart - the Chart.js instance
 */
'use strict';

import {
    createChart,
    createLegend,
    destroyChart,
    getLegendLabel,
    loadListValues,
    readThemeColors,
    tooltipOptions,
    tooltipRow,
    valueColors,
    watchTheme,
    withAlpha
} from './chart-utils.js';

// Hole size as a share of radius, smaller for small rings
const CUTOUT = '78%';
const SMALL_CUTOUT = '70%';
const SMALL_SIZE = 120;

// The opacity of a hovered value
const HOVER_OPACITY = 0.85;

// Hover lift distance, which the ring leaves room for
const HOVER_OFFSET = 4;

/**
 * buildPieConfig returns the config for a counter-clockwise ring.
 */
export function buildPieConfig({ values, colors, startAngle = 45, size = 200, theme = {}, label = (index) => String(index) }) {
    // Reverse values to run counter-clockwise
    const order = values.map((_, index) => index).reverse();
    const ringColors = order.map((index) => colors[index]);
    const total = values.reduce((sum, valueInfo) => sum + valueInfo.value, 0);

    return {
        type: 'doughnut',
        data: {
            labels: order.map((index) => label(index)),
            datasets: [{
                data: order.map((index) => values[index].value),
                backgroundColor: ringColors,
                hoverBackgroundColor: ringColors.map((color) => withAlpha(color, HOVER_OPACITY)),
                borderWidth: 0,
                borderRadius: 4,
                spacing: values.length > 1 ? 2 : 0,
                hoverOffset: HOVER_OFFSET
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: size < SMALL_SIZE ? SMALL_CUTOUT : CUTOUT,
            layout: { padding: HOVER_OFFSET },
            rotation: 90 - startAngle,
            animation: {
                duration: 700,
                easing: 'easeOutQuart',
                animateRotate: true,
                animateScale: false
            },
            plugins: {
                legend: { display: false },
                tooltip: tooltipOptions(([point]) => {
                    const index = order[point.dataIndex];
                    // The dataset holds the current colours, which change with the theme
                    return tooltipRow(point.dataset.backgroundColor[point.dataIndex], label(index).trim(), values[index].value);
                })
            }
        },
        plugins: [{
            id: 'pieTrack',
            // Empty ring keeps the chart's shape
            beforeDatasetsDraw(chart) {
                const meta = chart.getDatasetMeta(0);
                const controller = meta && meta.controller;
                if (total > 0 || !controller || !controller.outerRadius) {
                    return;
                }

                const { left, right, top, bottom } = chart.chartArea;
                const ctx = chart.ctx;
                const outer = controller.outerRadius;
                const inner = controller.innerRadius;

                ctx.save();
                ctx.beginPath();
                ctx.arc((left + right) / 2, (top + bottom) / 2, inner + (outer - inner) / 2, 0, Math.PI * 2);
                ctx.lineWidth = Math.max(outer - inner - 0.5, 0);
                ctx.strokeStyle = theme.track || '#dee2e6';
                ctx.stroke();
                ctx.restore();
            }
        }]
    };
}

export function registerChartPie(jax) {
    jax.registerControl('chart-pie', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({
                size: undefined,
                centerText: undefined,
                startAngle: 45
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

            // Restore the list so the chart redraws on reconnect
            if (this.canvasBox) {
                this.canvasBox.remove();
                this.legend.remove();
                this.list.hidden = false;
            }

            this.canvasBox = null;
            this.legend = null;
            this.list = null;
            this.theme = null;
            this.values = null;
            this.indicators = null;
        }

        buildChart() {
            this.list = this.element.querySelector(':scope > ul');
            if (!this.list) {
                return;
            }

            const size = this.size = this.config.size !== undefined ? this.config.size : (this.element.offsetHeight || 200);
            const values = this.values = loadListValues(this.list);
            const { legend, indicators } = createLegend(this.list);

            this.theme = readThemeColors(this.element);
            this.legend = legend;
            this.indicators = indicators;

            const colors = valueColors(this.element, values.values, this.theme.palette);
            this.canvasBox = document.createElement('div');
            this.canvasBox.className = 'canvas';
            this.canvasBox.style.width = `${size}px`;
            this.canvasBox.style.height = `${size}px`;

            const canvas = document.createElement('canvas');
            this.canvasBox.appendChild(canvas);

            if (this.config.centerText !== undefined && this.config.centerText !== '') {
                const center = document.createElement('span');
                center.className = 'center';
                center.textContent = this.config.centerText;
                this.canvasBox.appendChild(center);
            }

            this.element.prepend(this.canvasBox);

            // Truncate legends past 3 items
            legend.style.maxHeight = `${size}px`;
            legend.style.overflow = 'hidden';

            indicators.forEach((indicator, index) => {
                indicator.style.backgroundColor = colors[index];
            });

            createChart(this, canvas, buildPieConfig({
                values: values.values,
                colors,
                startAngle: this.config.startAngle,
                size,
                theme: this.theme,
                label: (index) => getLegendLabel(legend, index)
            }));
        }

        // Recolour the track and values for the theme
        onThemeChange() {
            if (!this.chart) {
                return;
            }

            Object.assign(this.theme, readThemeColors(this.element));

            const colors = valueColors(this.element, this.values.values, this.theme.palette);
            const ringColors = colors.slice().reverse();
            const dataset = this.chart.data.datasets[0];
            dataset.backgroundColor = ringColors;
            dataset.hoverBackgroundColor = ringColors.map((color) => withAlpha(color, HOVER_OPACITY));

            this.indicators.forEach((indicator, index) => {
                indicator.style.backgroundColor = colors[index];
            });

            this.chart.update('none');
        }
    });
}
