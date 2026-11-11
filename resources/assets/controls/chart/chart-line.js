/*
 * Line chart control
 *
 * Draws the datasets inside the element as lines over a time axis, at the element's height.
 *
 *     <div data-control="chart-line" data-zoomable data-reset-zoom-link="#reset-zoom" style="height: 200px">
 *         <span
 *             data-chart="dataset"
 *             data-set-name="Visits"
 *             data-set-color="#008dc9"
 *             data-set-data="[1477857082000, 400], [1477943482000, 380]">
 *         </span>
 *     </div>
 *
 * Data attributes:
 * - data-control="chart-line" - enables the line chart control
 * - data-reset-zoom-link="#reset-zoom" - specifies a link to reset zoom
 * - data-zoomable - indicates that the chart is zoomable, by dragging across it
 * - data-time-mode="weeks" - with a time axis, shades the weekends
 * - data-chart-options="xaxis: {mode: 'time'}" - Flot style options, see translateFlotOptions for the keys read
 * - data-chart-config - optional, Chart.js options as JSON, merged over the control's own
 *
 * Data sets are defined with the SPAN elements inside the chart element: <span data-chart="dataset" data-set-data="[0,0],[1,19]">,
 * where each point is a timestamp in milliseconds and a value. A data set's other data-set-* attributes are its name or
 * label, its color, and its Flot "lines" and "points" options as JSON. Lines are smooth unless "lines" sets smooth to false,
 * and points show on hover unless "points" sets show to true, to show them always, or false, to never show them.
 *
 * Events:
 * - chart-line:init - before the chart draws, with the Chart.js config in detail.config, which a listener may change
 * - chart-line:ready - after the chart draws, with the Chart.js instance in detail.chart
 *
 * JavaScript API:
 * jax.fetchControl(element, 'chart-line').chart - the Chart.js instance
 * jax.fetchControl(element, 'chart-line').addDataSet({ name: 'Orders', color: '#95b753', data: [[time, value]] })
 * jax.fetchControl(element, 'chart-line').clearZoom()
 */
'use strict';

import { formatDate } from './chart-date-adapter.js';
import {
    PALETTE,
    createChart,
    destroyChart,
    escapeHtml,
    formatNumber,
    getColor,
    isFlagOn,
    mergeOptions,
    readThemeColors,
    resolveColors,
    tooltipOptions,
    tooltipRow,
    watchTheme,
    withAlpha
} from './chart-utils.js';

// Top opacity of the fading area under a line
const FILL_OPACITY = 0.28;

// The tooltip date format
const TOOLTIP_DATE_FORMAT = '%b %d, %Y';

const DAY = 86400000;

// Flot's time units, as Chart.js names them
const TIME_UNITS = {
    millisecond: 'millisecond',
    second: 'second',
    minute: 'minute',
    hour: 'hour',
    day: 'day',
    week: 'week',
    month: 'month',
    quarter: 'quarter',
    year: 'year'
};

/**
 * translateFlotOptions turns the Flot options a line chart reads into Chart.js settings: xaxis and yaxis mode, min, max,
 * minTickSize, tickSize, timeformat, ticks and tickDecimals, legend.show, series lines and points, grid.hoverable,
 * tooltip and colors. Other keys are ignored.
 */
export function translateFlotOptions(flot = {}) {
    const xaxis = flot.xaxis || {};
    const yaxis = flot.yaxis || {};
    const series = flot.series || {};
    const isTime = (xaxis.mode === undefined ? 'time' : xaxis.mode) === 'time';
    const x = { type: isTime ? 'time' : 'linear', time: {}, ticks: {} };
    const y = { ticks: {} };

    for (const [scale, axis] of [[x, xaxis], [y, yaxis]]) {
        if (typeof axis.min === 'number') {
            scale.min = axis.min;
        }
        if (typeof axis.max === 'number') {
            scale.max = axis.max;
        }
        if (typeof axis.ticks === 'number') {
            scale.ticks.maxTicksLimit = axis.ticks;
        }
        if (typeof axis.tickDecimals === 'number') {
            scale.ticks.precision = axis.tickDecimals;
        }
    }

    if (isTime) {
        if (Array.isArray(xaxis.minTickSize) && TIME_UNITS[xaxis.minTickSize[1]]) {
            x.time.minUnit = TIME_UNITS[xaxis.minTickSize[1]];
        }

        if (Array.isArray(xaxis.tickSize) && TIME_UNITS[xaxis.tickSize[1]]) {
            x.time.unit = TIME_UNITS[xaxis.tickSize[1]];
            x.ticks.stepSize = xaxis.tickSize[0];
        }

        if (typeof xaxis.timeformat === 'string') {
            x.time.displayFormats = Object.fromEntries(Object.keys(TIME_UNITS).map((unit) => [unit, xaxis.timeformat]));
        }
    }

    const lines = series.lines || {};
    const points = series.points || {};
    const legend = flot.legend || {};
    const grid = flot.grid || {};

    return {
        scales: { x, y },
        legend: legend.show !== false,
        tooltip: flot.tooltip !== false && grid.hoverable !== false,
        colors: Array.isArray(flot.colors) && flot.colors.length ? flot.colors : null,
        lines,
        points
    };
}

/**
 * readDataSets reads the dataset spans, with camelCased data-set-* keys.
 */
export function readDataSets(element) {
    return Array.from(element.querySelectorAll(':scope > [data-chart="dataset"]')).map((span) => {
        const dataSet = {};

        for (const [key, value] of Object.entries(span.dataset)) {
            if (!key.startsWith('set') || key.length === 3) {
                continue;
            }

            const name = key.charAt(3).toLowerCase() + key.slice(4);
            dataSet[name] = name === 'data' ? parsePoints(value) : parseSetValue(value);
        }

        return dataSet;
    });
}

// Reads points written as "[x, y], [x, y]", or a JSON array of them
function parsePoints(value) {
    const text = String(value || '').trim();
    if (!text) {
        return [];
    }

    try {
        const parsed = JSON.parse(text.startsWith('[[') ? text : `[${text}]`);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch (ex) {
        throw new Error(`Error parsing the data-set-data attribute value. ${ex}`);
    }
}

// Reads a data-set-* value, JSON when it is an object or array
function parseSetValue(value) {
    const text = String(value).trim();
    if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
        try {
            return JSON.parse(text);
        }
        catch (ex) {
            return value;
        }
    }

    return value;
}

/**
 * buildDataSet turns a Flot style data set into a Chart.js line data set.
 */
export function buildDataSet(dataSet, index, defaults, theme = {}) {
    const color = dataSet.color || getColor(index, defaults.colors || theme.palette || PALETTE);
    const lines = Object.assign({}, defaults.lines, dataSet.lines);
    const points = Object.assign({}, defaults.points, dataSet.points);
    const fill = lines.fill === undefined ? true : lines.fill;
    const opacity = typeof fill === 'number' ? fill : FILL_OPACITY;
    const radius = typeof points.radius === 'number' ? points.radius : 3;

    const result = {
        label: dataSet.label !== undefined ? String(dataSet.label) : (dataSet.name !== undefined ? String(dataSet.name) : ''),
        data: Array.isArray(dataSet.data) ? dataSet.data : [],
        borderColor: color,
        hoverBorderColor: color,
        backgroundColor: fill === false ? withAlpha(color, opacity) : fadingFill(color, opacity),
        fill: fill === false ? false : 'origin',
        showLine: lines.show !== false,
        borderWidth: typeof lines.lineWidth === 'number' ? lines.lineWidth : 2,
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
        pointStyle: 'circle',
        pointRadius: points.show === true ? radius : 0,
        pointHoverRadius: points.show === false ? 0 : Math.max(radius, 4),
        pointHitRadius: 10,
        pointBorderWidth: typeof points.lineWidth === 'number' ? points.lineWidth : 2,
        pointBorderColor: color,
        pointBackgroundColor: points.show === true ? (points.fillColor || theme.point || '#ffffff') : color,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: theme.point || '#ffffff',
        pointHoverBorderWidth: 2
    };

    // Straight lines when smooth is off
    if (lines.smooth === false) {
        result.cubicInterpolationMode = 'default';
        result.tension = 0;
    }

    return result;
}

/**
 * fadingFill returns an area fill fading from the colour to clear.
 */
export function fadingFill(color, opacity) {
    let cache = null;

    return (context) => {
        const chart = context.chart;
        const area = chart && chart.chartArea;
        if (!area || !chart.ctx) {
            return withAlpha(color, opacity);
        }

        if (!cache || cache.top !== area.top || cache.bottom !== area.bottom) {
            const gradient = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
            gradient.addColorStop(0, withAlpha(color, opacity));
            gradient.addColorStop(1, withAlpha(color, 0));
            cache = { top: area.top, bottom: area.bottom, gradient };
        }

        return cache.gradient;
    };
}

/**
 * weekendAreas returns UTC weekend ranges within a time range.
 */
export function weekendAreas(min, max) {
    const areas = [];
    const date = new Date(min);

    // Go to the first Saturday
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 1) % 7));
    date.setUTCHours(0, 0, 0, 0);

    let from = date.getTime();
    do {
        areas.push({ from, to: from + 2 * DAY });
        from += 7 * DAY;
    } while (from < max);

    return areas;
}

/**
 * buildLineConfig returns the Chart.js config for a line chart.
 */
export function buildLineConfig({ dataSets = [], flotOptions = {}, timeMode = null, theme = {} }) {
    const translated = translateFlotOptions(flotOptions);
    const isTime = translated.scales.x.type === 'time';
    const tickFont = { family: theme.font, size: 12 };

    // Faint dashed lines across the chart are the only grid
    const scales = mergeOptions({
        x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: theme.text, font: tickFont, maxRotation: 0, autoSkipPadding: 16 }
        },
        y: {
            grid: { color: theme.grid, drawTicks: false },
            border: { display: false, dash: [4, 4] },
            ticks: { color: theme.text, font: tickFont, padding: 8, maxTicksLimit: 5 }
        }
    }, translated.scales);

    if (isTime) {
        scales.x.time.tooltipFormat = TOOLTIP_DATE_FORMAT;
    }

    const plugins = [];

    if (isTime && timeMode === 'weeks') {
        plugins.push({
            id: 'weekendAreas',
            // Shades the weekends behind the lines
            beforeDatasetsDraw(chart) {
                const scale = chart.scales.x;
                const { top, bottom, left, right } = chart.chartArea;
                const ctx = chart.ctx;

                ctx.save();
                ctx.fillStyle = theme.markings || 'rgba(0, 0, 0, 0.02)';

                for (const area of weekendAreas(scale.min, scale.max)) {
                    const start = Math.max(scale.getPixelForValue(area.from), left);
                    const end = Math.min(scale.getPixelForValue(area.to), right);
                    if (end > start) {
                        ctx.fillRect(start, top, end - start, bottom - top);
                    }
                }

                ctx.restore();
            }
        });
    }

    plugins.push({
        id: 'hoverLine',
        // Faint hover line behind the lines
        beforeDatasetsDraw(chart) {
            const active = chart.getActiveElements();
            if (!active.length) {
                return;
            }

            const x = active[0].element.x;
            const { top, bottom } = chart.chartArea;
            const ctx = chart.ctx;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.lineWidth = 1;
            ctx.strokeStyle = theme.hover || 'rgba(0, 0, 0, 0.2)';
            ctx.stroke();
            ctx.restore();
        }
    });

    return {
        type: 'line',
        data: {
            datasets: dataSets.map((dataSet, index) => buildDataSet(dataSet, index, translated, theme))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: { mode: 'index', intersect: false },
            elements: {
                line: { cubicInterpolationMode: 'monotone' }
            },
            scales,
            plugins: {
                legend: {
                    display: translated.legend,
                    align: 'start',
                    labels: {
                        color: theme.text,
                        font: tickFont,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 6,
                        boxHeight: 6,
                        padding: 16,
                        // Data sets without a name stay out of the legend
                        filter: (item) => item.text !== ''
                    }
                },
                tooltip: translated.tooltip
                    ? tooltipOptions((points) => {
                        const x = points[0].parsed.x;
                        const title = isTime ? formatDate(x, TOOLTIP_DATE_FORMAT) : formatNumber(x);

                        return `<div class="chart-tooltip-title">${escapeHtml(title)}</div>`
                            + points.map((point) => tooltipRow(point.dataset.borderColor, point.dataset.label ? escapeHtml(point.dataset.label) : '', point.parsed.y)).join('');
                    })
                    : { enabled: false }
            }
        },
        plugins
    };
}

export function registerChartLine(jax) {
    jax.registerControl('chart-line', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({
                chartOptions: '',
                timeMode: null,
                zoomable: false,
                resetZoomLink: null
            }, this.config);
        }

        connect() {
            this.flotOptions = this.parseChartOptions();
            this.fullDataSet = readDataSets(this.element);
            this.resetZoomLink = this.config.resetZoomLink ? document.querySelector(this.config.resetZoomLink) : null;

            this.canvasBox = document.createElement('div');
            this.canvasBox.className = 'chart-canvas';
            this.canvas = document.createElement('canvas');
            this.canvasBox.appendChild(this.canvas);
            this.element.appendChild(this.canvasBox);

            // Bind events
            if (this.resetZoomLink) {
                this.listen('click', this.resetZoomLink, this.onResetZoomClick);
            }

            if (isFlagOn(this.config.zoomable)) {
                this.listen('pointerdown', this.canvas, this.onSelectStart);
            }

            this.stopWatchingTheme = watchTheme(this.proxy(this.rebuildChart));
            this.rebuildChart();
        }

        disconnect() {
            if (this.stopWatchingTheme) {
                this.stopWatchingTheme();
                this.stopWatchingTheme = null;
            }

            this.onSelectEnd();
            destroyChart(this);

            if (this.canvasBox) {
                this.canvasBox.remove();
            }

            this.canvasBox = null;
            this.canvas = null;
            this.resetZoomLink = null;
        }

        parseChartOptions() {
            const options = this.config.chartOptions;
            if (!options) {
                return {};
            }

            if (typeof options === 'object') {
                return options;
            }

            try {
                return jax.parseJSON(`{${options}}`);
            }
            catch (e) {
                throw new Error(`Error parsing the data-chart-options attribute value. ${e}`);
            }
        }

        addDataSet(dataSet) {
            this.fullDataSet.push(dataSet);
            this.rebuildChart();
        }

        rebuildChart() {
            if (!this.canvas) {
                return;
            }

            destroyChart(this);

            // Resolve CSS variables, which a canvas cannot read
            const dataSets = this.fullDataSet.map((dataSet) => dataSet.color
                ? { ...dataSet, color: resolveColors(this.element, [dataSet.color])[0] }
                : dataSet);

            const flotOptions = Array.isArray(this.flotOptions.colors)
                ? { ...this.flotOptions, colors: resolveColors(this.element, this.flotOptions.colors) }
                : this.flotOptions;

            createChart(this, this.canvas, buildLineConfig({
                dataSets,
                flotOptions,
                timeMode: this.config.timeMode,
                theme: readThemeColors(this.element)
            })).then(() => {
                this.zoomRange = null;
            });
        }

        clearZoom() {
            if (this.chart && this.zoomRange) {
                const scale = this.chart.options.scales.x;
                scale.min = this.zoomRange.min;
                scale.max = this.zoomRange.max;
                this.zoomRange = null;
                this.chart.update();
            }

            if (this.resetZoomLink) {
                this.resetZoomLink.style.display = 'none';
            }
        }

        zoomTo(min, max) {
            if (!this.chart) {
                return;
            }

            const scale = this.chart.options.scales.x;
            if (!this.zoomRange) {
                this.zoomRange = { min: scale.min, max: scale.max };
            }

            scale.min = min;
            scale.max = max;
            this.chart.update();

            if (this.resetZoomLink) {
                this.resetZoomLink.style.display = '';
                this.resetZoomLink.hidden = false;
            }
        }

        onResetZoomClick(event) {
            event.preventDefault();
            this.clearZoom();
        }

        // Drag-select zooms to the range on release
        onSelectStart(event) {
            if (!this.chart || event.button !== 0) {
                return;
            }

            const area = this.chart.chartArea;
            const x = this.pointerX(event);
            if (x < area.left || x > area.right) {
                return;
            }

            event.preventDefault();
            this.selection = { start: x, end: x };
            this.selectionBox = document.createElement('div');
            this.selectionBox.className = 'chart-selection';
            this.selectionBox.style.top = `${area.top}px`;
            this.selectionBox.style.height = `${area.bottom - area.top}px`;
            this.canvasBox.appendChild(this.selectionBox);
            this.updateSelectionBox();

            document.addEventListener('pointermove', this.proxy(this.onSelectMove));
            document.addEventListener('pointerup', this.proxy(this.onSelectRelease));
        }

        onSelectMove(event) {
            if (!this.selection) {
                return;
            }

            const area = this.chart.chartArea;
            this.selection.end = Math.min(Math.max(this.pointerX(event), area.left), area.right);
            this.updateSelectionBox();
        }

        onSelectRelease() {
            const selection = this.selection;
            this.onSelectEnd();

            if (!selection || !this.chart || Math.abs(selection.end - selection.start) < 5) {
                return;
            }

            const scale = this.chart.scales.x;
            const from = scale.getValueForPixel(Math.min(selection.start, selection.end));
            const to = scale.getValueForPixel(Math.max(selection.start, selection.end));
            this.zoomTo(from, to);
        }

        onSelectEnd() {
            document.removeEventListener('pointermove', this.proxy(this.onSelectMove));
            document.removeEventListener('pointerup', this.proxy(this.onSelectRelease));

            if (this.selectionBox) {
                this.selectionBox.remove();
            }

            this.selection = null;
            this.selectionBox = null;
        }

        updateSelectionBox() {
            const left = Math.min(this.selection.start, this.selection.end);
            this.selectionBox.style.left = `${left}px`;
            this.selectionBox.style.width = `${Math.abs(this.selection.end - this.selection.start)}px`;
        }

        // Returns the pointer's position across the canvas
        pointerX(event) {
            return event.clientX - this.canvas.getBoundingClientRect().left;
        }
    });
}
