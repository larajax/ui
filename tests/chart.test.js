import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
    DATE_FORMATS,
    addToDate,
    diffDates,
    formatDate,
    parseDate,
    registerDateAdapter,
    startOfDate
} from '../resources/assets/controls/chart/chart-date-adapter.js';
import {
    PALETTE,
    chartLibrary,
    createLegend,
    getColor,
    hideTooltip,
    loadListValues,
    mergeOptions,
    readThemeColors,
    resolveColors,
    showTooltip,
    valueColors,
    withAlpha
} from '../resources/assets/controls/chart/chart-utils.js';
import { buildPieConfig, registerChartPie } from '../resources/assets/controls/chart/chart-pie.js';
import { buildBarConfig, registerChartBar } from '../resources/assets/controls/chart/chart-bar.js';
import {
    buildDataSet,
    buildLineConfig,
    readDataSets,
    registerChartLine,
    translateFlotOptions,
    weekendAreas
} from '../resources/assets/controls/chart/chart-line.js';
import { registerGoalMeter } from '../resources/assets/controls/chart/goal-meter.js';

const NOV_1 = Date.UTC(2026, 10, 1);
const DAY = 86400000;

// Reads data attribute values the way the framework's ControlBase does
function parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value !== '' && !isNaN(Number(value))) return Number(value);
    if ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'))) {
        try { return JSON.parse(value); } catch (e) { /* fall through */ }
    }
    return value;
}

function makeFakeJax() {
    const controls = new Map();

    class ControlBase {
        constructor(element, identifier) {
            this.element = element;
            this.identifier = identifier;
            // Read from the attributes, since happy-dom leaves empty values out of the dataset's entries
            this.config = Object.fromEntries(Array.from(element.attributes)
                .filter((attribute) => attribute.name.startsWith('data-'))
                .map((attribute) => [
                    attribute.name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
                    parseValue(attribute.value)
                ]));
            this.proxied = new Map();
        }

        proxy(method) {
            if (!this.proxied.has(method)) {
                this.proxied.set(method, method.bind(this));
            }
            return this.proxied.get(method);
        }

        listen(eventName, target, handler) {
            target.addEventListener(eventName, this.proxy(handler));
        }

        dispatch(eventName, { detail = {} } = {}) {
            const event = new CustomEvent(`${this.identifier}:${eventName}`, { detail, bubbles: true, cancelable: true });
            this.element.dispatchEvent(event);
            return event;
        }
    }

    return {
        controls,
        ControlBase,
        parseJSON: (json) => new Function(`return (${json});`)(),
        registerControl(id, control) {
            controls.set(id, control);
        }
    };
}

// Stands in for Chart.js, recording what each chart was drawn with
class FakeChart {
    static instances = [];

    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        this.data = config.data;
        this.options = config.options;
        this.updates = 0;
        this.destroyed = false;
        this.chartArea = { left: 40, right: 440, top: 10, bottom: 190 };
        this.scales = { x: { getValueForPixel: (pixel) => pixel * 1000 } };
        FakeChart.instances.push(this);
    }

    update() {
        this.updates++;
    }

    destroy() {
        this.destroyed = true;
    }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

let started = [];

function connect(html, id) {
    const jax = makeFakeJax();
    registerChartPie(jax);
    registerChartBar(jax);
    registerChartLine(jax);
    registerGoalMeter(jax);

    document.body.innerHTML = html;

    const element = document.querySelector(`[data-control="${id}"]`);
    const control = new (jax.controls.get(id))(element, id);
    control.init();
    control.connect();
    started.push(control);

    return control;
}

beforeEach(() => {
    FakeChart.instances = [];
    chartLibrary.promise = Promise.resolve(FakeChart);
});

afterEach(() => {
    started.forEach((control) => control.disconnect());
    started = [];
    chartLibrary.promise = null;
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    document.documentElement.lang = '';
});

describe('chart date adapter', () => {
    test('formats times in UTC with strftime tokens', () => {
        const time = Date.UTC(2026, 10, 3, 14, 5, 9);

        expect(formatDate(time, '%Y-%m-%d %H:%M:%S')).toBe('2026-11-03 14:05:09');
        expect(formatDate(time, '%b %e, %y')).toBe('Nov  3, 26');
        expect(formatDate(time, '%I:%M %p, %a, Q%q, day %w')).toBe('02:05 pm, Tue, Q4, day 2');
        expect(formatDate(Date.UTC(2026, 0, 1, 0, 30), '%l %P')).toBe('12 AM');
        expect(formatDate(time, '%0m')).toBe('0m');
    });

    test('formats with Intl options and the page locale names', () => {
        expect(formatDate(NOV_1, { year: 'numeric', month: 'long' }, 'en')).toBe('November 2026');

        document.documentElement.lang = 'fr';
        expect(formatDate(NOV_1, '%b')).toBe(new Intl.DateTimeFormat('fr', { month: 'short', timeZone: 'UTC' }).format(NOV_1));
    });

    test('reads timestamps, dates and zoneless date strings as UTC', () => {
        expect(parseDate(NOV_1)).toBe(NOV_1);
        expect(parseDate(new Date(NOV_1))).toBe(NOV_1);
        expect(parseDate('2026-11-01')).toBe(NOV_1);
        expect(parseDate('2026-11-01 06:00')).toBe(NOV_1 + 6 * 3600000);
        expect(parseDate('2026-11-01T06:00:00+02:00')).toBe(NOV_1 + 4 * 3600000);
        expect(parseDate('not a date')).toBeNull();
        expect(parseDate(null)).toBeNull();
        expect(parseDate(NaN)).toBeNull();
    });

    test('finds the start of a unit, with weeks from Sunday or an ISO weekday', () => {
        // The 4th of November 2026 is a Wednesday
        const time = Date.UTC(2026, 10, 4, 15, 45, 30, 250);

        expect(startOfDate(time, 'second')).toBe(Date.UTC(2026, 10, 4, 15, 45, 30));
        expect(startOfDate(time, 'hour')).toBe(Date.UTC(2026, 10, 4, 15));
        expect(startOfDate(time, 'day')).toBe(Date.UTC(2026, 10, 4));
        expect(startOfDate(time, 'week')).toBe(Date.UTC(2026, 10, 1));
        expect(startOfDate(time, 'isoWeek', true)).toBe(Date.UTC(2026, 10, 2));
        expect(startOfDate(time, 'isoWeek', 7)).toBe(Date.UTC(2026, 10, 1));
        expect(startOfDate(time, 'month')).toBe(NOV_1);
        expect(startOfDate(time, 'quarter')).toBe(Date.UTC(2026, 9, 1));
        expect(startOfDate(time, 'year')).toBe(Date.UTC(2026, 0, 1));
    });

    test('adds and counts units by calendar month for months, quarters and years', () => {
        expect(addToDate(NOV_1, 2, 'day')).toBe(NOV_1 + 2 * DAY);
        expect(addToDate(NOV_1, 3, 'month')).toBe(Date.UTC(2027, 1, 1));
        expect(addToDate(NOV_1, 1, 'year')).toBe(Date.UTC(2027, 10, 1));

        expect(diffDates(NOV_1 + 3 * DAY, NOV_1, 'day')).toBe(3);
        expect(diffDates(Date.UTC(2027, 1, 1), NOV_1, 'month')).toBe(3);
        expect(diffDates(Date.UTC(2027, 0, 31), NOV_1, 'month')).toBe(2);
        expect(diffDates(Date.UTC(2028, 10, 1), NOV_1, 'year')).toBe(2);
    });

    test('overrides the Chart.js date adapter', () => {
        let methods = null;
        registerDateAdapter({ _date: { override: (overrides) => { methods = overrides; } } });

        expect(methods.formats()).toBe(DATE_FORMATS);
        expect(methods.parse('2026-11-01')).toBe(NOV_1);
        expect(methods.format(NOV_1, '%d %b')).toBe('01 Nov');
        expect(methods.endOf(NOV_1, 'day')).toBe(NOV_1 + DAY - 1);
    });
});

describe('chart utilities', () => {
    test('reads list values from data-value or the span, as positive numbers', () => {
        document.body.innerHTML = `<ul>
            <li data-color="#ff0000">Published <span>84</span></li>
            <li data-value="12">Drafts <span>twelve</span></li>
            <li>Deleted <span>-18</span></li>
            <li>Unknown <span>n/a</span></li>
        </ul>`;

        const result = loadListValues(document.querySelector('ul'));

        expect(result.values).toEqual([
            { value: 84, color: '#ff0000' },
            { value: 12, color: undefined },
            { value: 18, color: undefined },
            { value: 0, color: undefined }
        ]);
        expect(result.total).toBe(114);
        expect(result.max).toBe(84);
    });

    test('builds the legend after the list and hides the list', () => {
        document.body.innerHTML = '<div><ul><li>Published <span><b>84</b></span></li><li>Drafts <span>12</span></li></ul></div>';
        const list = document.querySelector('ul');

        const { legend, indicators } = createLegend(list);

        expect(list.hidden).toBe(true);
        expect(list.nextElementSibling).toBe(legend);
        expect(legend.className).toBe('chart-legend');
        expect(indicators.length).toBe(2);

        const cells = legend.querySelectorAll('tr')[0].cells;
        expect(cells[0].className).toBe('indicator');
        expect(cells[1].innerHTML.trim()).toBe('Published');
        expect(cells[2].innerHTML).toBe('<b>84</b>');
    });

    test('cycles the palette, the theme one when given', () => {
        expect(getColor(0)).toBe('#0087fe');
        expect(getColor(1)).toBe('#00b15a');
        expect(getColor(12)).toBe('#0087fe');
        expect(getColor(3, ['a', 'b'])).toBe('b');
        expect(getColor(0, [])).toBe(PALETTE[0]);
    });

    test('reads the palette and theme colours from the chart tokens', () => {
        document.head.innerHTML = '<style>.chart { --chart-color-1: #123456; --chart-track-color: rgb(9, 9, 9); }</style>';
        document.body.innerHTML = '<div class="chart"></div>';
        const element = document.querySelector('.chart');

        const theme = readThemeColors(element);

        expect(theme.palette.length).toBe(12);
        expect(theme.palette[0]).toBe('#123456');
        expect(theme.palette[1]).toBe(PALETTE[1]);
        expect(theme.track).toBe('rgb(9, 9, 9)');
        expect(element.children.length).toBe(0);
    });

    test('resolves colours a canvas cannot read, and leaves the rest', () => {
        document.head.innerHTML = '<style>.chart { --brand: #123456; }</style>';
        document.body.innerHTML = '<div class="chart"></div>';
        const element = document.querySelector('.chart');

        expect(resolveColors(element, ['var(--brand)', '#fff', 'rgb(1, 2, 3)', undefined])).toEqual(['#123456', '#fff', 'rgb(1, 2, 3)', undefined]);
        expect(valueColors(element, [{ value: 1, color: 'var(--brand)' }, { value: 2 }], ['#aaaaaa', '#bbbbbb'])).toEqual(['#123456', '#bbbbbb']);
    });

    test('shows one tooltip at a time, inside the window', () => {
        showTooltip(20, 30, 'Drafts: <strong>12</strong>');
        showTooltip(25, 35, 'Published: <strong>84</strong>');

        const tooltips = document.querySelectorAll('#chart-tooltip');
        expect(tooltips.length).toBe(1);
        expect(tooltips[0].innerHTML).toBe('Published: <strong>84</strong>');
        expect(tooltips[0].style.left).toBe('35px');
        expect(tooltips[0].style.top).toBe('45px');

        hideTooltip();
        expect(document.getElementById('chart-tooltip')).toBeNull();
    });

    test('adds opacity to hex and rgb colours', () => {
        expect(withAlpha('#008dc9', 0.4)).toBe('rgba(0, 141, 201, 0.4)');
        expect(withAlpha('#fff', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
        expect(withAlpha('rgb(1, 2, 3)', 0.2)).toBe('rgba(1, 2, 3, 0.2)');
        expect(withAlpha('hsl(120, 50%, 40%)', 0.2)).toBe('hsla(120, 50%, 40%, 0.2)');
        expect(withAlpha('oklch(0.6 0.24 240)', 0.4)).toBe('oklch(0.6 0.24 240 / 0.4)');
        expect(withAlpha('oklch(0.6 0.24 240 / 0.9)', 0.4)).toBe('oklch(0.6 0.24 240 / 0.4)');
        expect(withAlpha('rgb(1 2 3)', 0.5)).toBe('rgb(1 2 3 / 0.5)');
        expect(withAlpha('color(srgb 0.1 0.2 0.3)', 0.5)).toBe('color(srgb 0.1 0.2 0.3 / 0.5)');
        expect(withAlpha('red', 0.2)).toBe('red');
    });

    test('deep merges options, replacing arrays', () => {
        const target = { scales: { x: { min: 1, ticks: { color: 'red' } } }, list: [1, 2] };

        mergeOptions(target, { scales: { x: { ticks: { stepSize: 2 } } }, list: [3] }, null);

        expect(target).toEqual({ scales: { x: { min: 1, ticks: { color: 'red', stepSize: 2 } } }, list: [3] });
    });
});

describe('pie chart', () => {
    const values = [{ value: 84 }, { value: 12 }, { value: 18 }];
    const colors = ['#a', '#b', '#c'];

    test('draws the values in reverse from the start angle, so they run counter-clockwise', () => {
        const config = buildPieConfig({ values, colors, label: (index) => `Label ${index}` });
        const dataset = config.data.datasets[0];

        expect(config.type).toBe('doughnut');
        expect(dataset.data).toEqual([18, 12, 84]);
        expect(dataset.backgroundColor).toEqual(['#c', '#b', '#a']);
        expect(config.options.rotation).toBe(45);
        expect(config.options.cutout).toBe('78%');
        expect(buildPieConfig({ values, colors, size: 76 }).options.cutout).toBe('70%');
        expect(config.options.animation.easing).toBe('easeOutQuart');
    });

    test('the ring has rounded values a little apart, which lighten on hover', () => {
        const dataset = buildPieConfig({ values: [{ value: 1 }, { value: 2 }], colors: ['#ff0000', '#00ff00'] }).data.datasets[0];

        expect(dataset.borderRadius).toBe(4);
        expect(dataset.spacing).toBe(2);
        expect(dataset.hoverOffset).toBe(4);
        expect(buildPieConfig({ values: [{ value: 1 }], colors: ['#a'] }).options.layout.padding).toBe(4);
        expect(dataset.hoverBackgroundColor).toEqual(['rgba(0, 255, 0, 0.85)', 'rgba(255, 0, 0, 0.85)']);

        expect(buildPieConfig({ values: [{ value: 1 }], colors: ['#ff0000'] }).data.datasets[0].spacing).toBe(0);
    });

    test('the track only draws when there is nothing to show', () => {
        const strokes = [];
        const ctx = { save() {}, restore() {}, beginPath() {}, arc() {}, stroke() { strokes.push(this.strokeStyle); } };
        const chart = {
            ctx,
            chartArea: { left: 0, right: 100, top: 0, bottom: 100 },
            getDatasetMeta: () => ({ controller: { outerRadius: 50, innerRadius: 39 } })
        };

        buildPieConfig({ values: [{ value: 3 }], colors: ['#a'], theme: { track: '#eeeeee' } }).plugins[0].beforeDatasetsDraw(chart);
        expect(strokes).toEqual([]);

        buildPieConfig({ values: [{ value: 0 }], colors: ['#a'], theme: { track: '#eeeeee' } }).plugins[0].beforeDatasetsDraw(chart);
        expect(strokes).toEqual(['#eeeeee']);
    });

    test('the tooltip names the hovered value from its legend label', () => {
        const config = buildPieConfig({ values, colors, label: (index) => ` Label ${index} ` });

        let html = null;
        document.body.innerHTML = '<canvas></canvas>';
        const chart = { canvas: document.querySelector('canvas') };
        const dataset = { backgroundColor: ['#123456', '#b', '#a'] };
        config.options.plugins.tooltip.external({ chart, tooltip: { opacity: 1, caretX: 0, caretY: 0, dataPoints: [{ dataIndex: 0, dataset }] } });
        html = document.getElementById('chart-tooltip').innerHTML;

        expect(html).toBe('<div class="chart-tooltip-row"><i style="background: #123456"></i><span>Label 2</span><strong>18</strong></div>');

        config.options.plugins.tooltip.external({ chart, tooltip: { opacity: 0 } });
        expect(document.getElementById('chart-tooltip')).toBeNull();
    });

    test('the control draws the ring, the legend and the center text', async () => {
        const control = connect(`<div class="control-chart" data-control="chart-pie" data-size="120" data-center-text="114"
            data-chart-config='{"plugins": {"legend": {"display": true}}}'>
            <ul><li data-color="#95b753">Published <span>84</span></li><li>Drafts <span>12</span></li></ul>
        </div>`, 'chart-pie');

        const events = [];
        control.element.addEventListener('chart-pie:init', (event) => events.push(['init', event.detail.config.type]));
        control.element.addEventListener('chart-pie:ready', (event) => events.push(['ready', event.detail.chart]));
        await flush();

        const box = control.element.querySelector(':scope > div.canvas');
        expect(box.style.width).toBe('120px');
        expect(box.querySelector('span.center').textContent).toBe('114');

        // The legend is cut off at the ring's size, and takes no more room than its rows
        const legend = control.element.querySelector('.chart-legend');
        expect(legend.style.maxHeight).toBe('120px');
        expect(legend.style.height).toBe('');
        expect(control.element.querySelector('ul').hidden).toBe(true);

        const indicators = control.element.querySelectorAll('.chart-legend i');
        expect(indicators[0].style.backgroundColor).toBe('#95b753');
        expect(indicators[1].style.backgroundColor).toBe('#00b15a');

        expect(FakeChart.instances.length).toBe(1);
        expect(control.chart).toBe(FakeChart.instances[0]);
        expect(control.chart.canvas).toBe(box.querySelector('canvas'));
        expect(control.chart.options.plugins.legend.display).toBe(true);
        expect(events).toEqual([['init', 'doughnut'], ['ready', control.chart]]);
    });

    test('colours from CSS variables resolve, and recolour when the theme switches', async () => {
        document.head.innerHTML = '<style>.chart { --brand: #123456; --chart-color-2: #222222; }</style>';
        const control = connect(`<div class="chart" data-control="chart-pie">
            <ul><li data-color="var(--brand)">A <span>1</span></li><li>B <span>2</span></li></ul>
        </div>`, 'chart-pie');
        await flush();

        // The ring runs in reverse, so B comes first
        expect(control.chart.config.data.datasets[0].backgroundColor).toEqual(['#222222', '#123456']);

        document.head.innerHTML = '<style>.chart { --brand: #654321; --chart-color-2: #333333; }</style>';
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        await flush();
        document.documentElement.removeAttribute('data-bs-theme');

        expect(control.chart.data.datasets[0].backgroundColor).toEqual(['#333333', '#654321']);
        expect(control.element.querySelectorAll('.chart-legend i')[0].style.backgroundColor).toBe('#654321');
        expect(control.chart.updates).toBeGreaterThan(0);
    });

    test('charts draw without moving for visitors who ask for less motion', async () => {
        const matchMedia = window.matchMedia;
        window.matchMedia = (query) => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            addEventListener() {},
            removeEventListener() {}
        });

        try {
            const control = connect('<div data-control="chart-pie"><ul><li>A <span>1</span></li></ul></div>', 'chart-pie');
            await flush();

            expect(control.chart.options.animation).toBe(false);
        }
        finally {
            window.matchMedia = matchMedia;
        }
    });

    test('the center text is text, not markup', async () => {
        const control = connect('<div data-control="chart-pie" data-center-text="&lt;b&gt;9&lt;/b&gt;"><ul><li>A <span>1</span></li></ul></div>', 'chart-pie');
        await flush();

        expect(control.element.querySelector('span.center').innerHTML).toBe('&lt;b&gt;9&lt;/b&gt;');
    });

    test('disconnecting puts the list back, and the chart draws again on reconnect', async () => {
        const control = connect('<div data-control="chart-pie"><ul><li>A <span>1</span></li></ul></div>', 'chart-pie');
        await flush();
        const first = control.chart;

        control.disconnect();
        expect(first.destroyed).toBe(true);
        expect(control.element.querySelector('div.canvas')).toBeNull();
        expect(control.element.querySelector('.chart-legend')).toBeNull();
        expect(control.element.querySelector('ul').hidden).toBe(false);

        control.connect();
        await flush();
        expect(control.chart).not.toBe(first);
        expect(control.element.querySelectorAll('div.canvas').length).toBe(1);
    });

    test('a chart that disconnects while Chart.js loads never draws', async () => {
        const control = connect('<div data-control="chart-pie"><ul><li>A <span>1</span></li></ul></div>', 'chart-pie');
        control.disconnect();
        started = [];
        await flush();

        expect(FakeChart.instances.length).toBe(0);
    });
});

describe('bar chart', () => {
    test('draws one rounded bar per value, scaled to the largest value, with a gap of a quarter of its slot', () => {
        const config = buildBarConfig({ values: [{ value: 3 }, { value: 9 }], colors: ['#ff0000', '#b'], max: 9 });
        const dataset = config.data.datasets[0];

        expect(config.type).toBe('bar');
        expect(dataset.data).toEqual([3, 9]);
        expect(dataset.borderRadius).toBe(4);
        expect(dataset.borderSkipped).toBe('start');
        expect(dataset.barPercentage).toBe(0.75);
        expect(dataset.borderWidth).toBeUndefined();
        expect(dataset.hoverBackgroundColor[0]).toBe('rgba(255, 0, 0, 0.85)');
        expect(config.options.scales.y).toEqual({ display: false, min: 0, max: 9 });
        expect(config.options.scales.x.display).toBe(false);
        expect(config.options.animation.easing).toBe('easeOutQuart');
    });

    test('a gap in pixels leaves a clear border either side of each bar', () => {
        const dataset = buildBarConfig({ values: [{ value: 3 }], colors: ['#a'], max: 3, gap: 4 }).data.datasets[0];

        expect(dataset.barPercentage).toBe(1);
        expect(dataset.borderWidth).toEqual({ left: 2, right: 2, top: 0, bottom: 0 });
        expect(dataset.borderColor).toBe('transparent');
    });

    test('a chart of zeros still has a scale', () => {
        const config = buildBarConfig({ values: [{ value: 0 }], colors: ['#a'], max: 0 });

        expect(config.options.scales.y.max).toBe(1);
    });

    test('the control sizes the canvas and spans the width when asked', async () => {
        const control = connect(`<div class="control-chart" data-control="chart-bar" data-height="80" data-full-width="1">
            <ul><li>A <span>1</span></li><li>B <span>2</span></li></ul>
        </div>`, 'chart-bar');
        await flush();

        const box = control.element.querySelector('div.canvas');
        expect(box.style.height).toBe('80px');
        expect(box.style.width).toBe('100%');
        expect(control.element.classList.contains('full-width')).toBe(true);
        expect(control.chart.config.type).toBe('bar');

        control.disconnect();
        expect(control.element.classList.contains('full-width')).toBe(false);
    });
});

describe('line chart', () => {
    test('translates the Flot options it reads', () => {
        const translated = translateFlotOptions({
            xaxis: { mode: 'time', minTickSize: [1, 'day'], timeformat: '%d/%m', min: 5, ticks: 4 },
            yaxis: { max: 100, tickDecimals: 0 },
            legend: { show: false },
            series: { lines: { fill: false }, points: { show: false } },
            colors: ['#111111']
        });

        expect(translated.scales.x.type).toBe('time');
        expect(translated.scales.x.time.minUnit).toBe('day');
        expect(translated.scales.x.time.displayFormats.day).toBe('%d/%m');
        expect(translated.scales.x.min).toBe(5);
        expect(translated.scales.x.ticks.maxTicksLimit).toBe(4);
        expect(translated.scales.y.max).toBe(100);
        expect(translated.scales.y.ticks.precision).toBe(0);
        expect(translated.legend).toBe(false);
        expect(translated.tooltip).toBe(true);
        expect(translated.colors).toEqual(['#111111']);
        expect(translateFlotOptions({}).colors).toBeNull();
        expect(translated.lines).toEqual({ fill: false });
    });

    test('a time axis is the default, and tickSize fixes the unit and step', () => {
        expect(translateFlotOptions({}).scales.x.type).toBe('time');
        expect(translateFlotOptions({ xaxis: { mode: null } }).scales.x.type).toBe('linear');

        const x = translateFlotOptions({ xaxis: { tickSize: [2, 'month'] } }).scales.x;
        expect(x.time.unit).toBe('month');
        expect(x.ticks.stepSize).toBe(2);

        expect(translateFlotOptions({ grid: { hoverable: false } }).tooltip).toBe(false);
        expect(translateFlotOptions({ tooltip: false }).tooltip).toBe(false);
    });

    test('reads the dataset spans and their points', () => {
        document.body.innerHTML = `<div>
            <span data-chart="dataset" data-set-name="Visits" data-set-color="#008dc9" data-set-data="[1, 400], [2, 380]"></span>
            <span data-chart="dataset" data-set-data="[3, 9]" data-set-lines='{"fill": false}'></span>
            <span data-chart="dataset" data-set-data="[[4, 1], [5, 2]]"></span>
            <span data-set-data="[6, 1]"></span>
        </div>`;

        expect(readDataSets(document.querySelector('div'))).toEqual([
            { name: 'Visits', color: '#008dc9', data: [[1, 400], [2, 380]] },
            { data: [[3, 9]], lines: { fill: false } },
            { data: [[4, 1], [5, 2]] }
        ]);
    });

    test('builds a filled line with points on hover, named from the data set', () => {
        const defaults = translateFlotOptions({});
        const dataSet = buildDataSet({ name: 'Visits', color: '#008dc9', data: [[1, 2]] }, 0, defaults, { point: '#fff' });

        expect(dataSet.label).toBe('Visits');
        expect(dataSet.borderColor).toBe('#008dc9');
        expect(dataSet.fill).toBe('origin');
        expect(dataSet.pointRadius).toBe(0);
        expect(dataSet.pointHoverRadius).toBe(4);
        expect(dataSet.pointBackgroundColor).toBe('#008dc9');
        expect(dataSet.pointHoverBorderColor).toBe('#fff');
        expect(dataSet.cubicInterpolationMode).toBeUndefined();

        // Before the chart lays out, the fill is the colour at the top's opacity
        expect(dataSet.backgroundColor({ chart: {} })).toBe('rgba(0, 141, 201, 0.28)');

        const shown = buildDataSet({ data: [], points: { show: true, fillColor: '#eeeeee' }, lines: { smooth: false } }, 0, defaults, { point: '#fff' });
        expect(shown.pointRadius).toBe(3);
        expect(shown.pointBackgroundColor).toBe('#eeeeee');
        expect(shown.cubicInterpolationMode).toBe('default');
        expect(shown.tension).toBe(0);

        const plain = buildDataSet({ data: [], lines: { fill: false, lineWidth: 1 }, points: { show: false } }, 1, defaults);
        expect(plain.fill).toBe(false);
        expect(plain.borderWidth).toBe(1);
        expect(plain.pointRadius).toBe(0);
        expect(plain.pointHoverRadius).toBe(0);
        expect(plain.backgroundColor).toBe('rgba(0, 177, 90, 0.28)');
        expect(plain.borderColor).toBe('#00b15a');

        const themed = buildDataSet({ data: [] }, 1, defaults, { palette: ['#aaaaaa', '#bbbbbb'] });
        expect(themed.borderColor).toBe('#bbbbbb');

        const flotColors = buildDataSet({ data: [] }, 0, translateFlotOptions({ colors: ['#111111'] }), { palette: ['#aaaaaa'] });
        expect(flotColors.borderColor).toBe('#111111');
        expect(plain.label).toBe('');
    });

    test('shades the weekends only with a time axis in weeks mode', () => {
        // The 4th of November 2026 is a Wednesday, so the first weekend begins on Saturday the 31st of October
        const areas = weekendAreas(Date.UTC(2026, 10, 4), Date.UTC(2026, 10, 12));
        expect(areas[0]).toEqual({ from: Date.UTC(2026, 9, 31), to: Date.UTC(2026, 10, 2) });
        expect(areas[1].from).toBe(Date.UTC(2026, 10, 7));

        const pluginIds = (config) => config.plugins.map((plugin) => plugin.id);
        expect(pluginIds(buildLineConfig({ timeMode: 'weeks' }))).toEqual(['weekendAreas', 'hoverLine']);
        expect(pluginIds(buildLineConfig({}))).toEqual(['hoverLine']);
        expect(pluginIds(buildLineConfig({ timeMode: 'weeks', flotOptions: { xaxis: { mode: 'linear' } } }))).toEqual(['hoverLine']);
    });

    test('lines are smooth over a light grid of dashed lines across, with the values of every data set on hover', () => {
        const options = buildLineConfig({ theme: { grid: '#dddddd' } }).options;

        expect(options.elements.line.cubicInterpolationMode).toBe('monotone');
        expect(options.interaction).toEqual({ mode: 'index', intersect: false });
        expect(options.scales.x.grid.display).toBe(false);
        expect(options.scales.y.grid.color).toBe('#dddddd');
        expect(options.scales.y.border.dash).toEqual([4, 4]);
        expect(options.scales.y.ticks.maxTicksLimit).toBe(5);
        expect(options.plugins.legend.labels.usePointStyle).toBe(true);
        expect(options.plugins.legend.align).toBe('start');

        // Flot options still win over the defaults
        expect(buildLineConfig({ flotOptions: { yaxis: { ticks: 8 } } }).options.scales.y.ticks.maxTicksLimit).toBe(8);
    });

    test('the hover line draws at the hovered point', () => {
        const lines = [];
        const ctx = {
            save() {}, restore() {}, beginPath() {}, lineTo() {}, stroke() {},
            moveTo(x, y) { lines.push([x, y, this.strokeStyle]); }
        };
        const plugin = buildLineConfig({ theme: { hover: '#999999' } }).plugins[0];
        const chart = { ctx, chartArea: { top: 5, bottom: 95 }, getActiveElements: () => [] };

        plugin.beforeDatasetsDraw(chart);
        expect(lines).toEqual([]);

        chart.getActiveElements = () => [{ element: { x: 42 } }];
        plugin.beforeDatasetsDraw(chart);
        expect(lines).toEqual([[42, 5, undefined]]);
        expect(ctx.strokeStyle).toBe('#999999');
    });

    test('the tooltip shows the date and each data set\'s value', () => {
        const config = buildLineConfig({ dataSets: [{ data: [[NOV_1, 400]] }] });
        document.body.innerHTML = '<canvas></canvas>';

        config.options.plugins.tooltip.external({
            chart: { canvas: document.querySelector('canvas') },
            tooltip: {
                opacity: 1,
                caretX: 0,
                caretY: 0,
                dataPoints: [
                    { parsed: { x: NOV_1, y: 1284.5 }, dataset: { label: '<b>Visits</b>', borderColor: '#0087fe' } },
                    { parsed: { x: NOV_1, y: 12 }, dataset: { label: '', borderColor: '#00b15a' } }
                ]
            }
        });

        expect(document.getElementById('chart-tooltip').innerHTML).toBe(
            '<div class="chart-tooltip-title">Nov 01, 2026</div>'
            + '<div class="chart-tooltip-row"><i style="background: #0087fe"></i><span>&lt;b&gt;Visits&lt;/b&gt;</span><strong>1,284.5</strong></div>'
            + '<div class="chart-tooltip-row"><i style="background: #00b15a"></i><strong>12</strong></div>'
        );
        expect(config.options.scales.x.time.tooltipFormat).toBe('%b %d, %Y');
    });

    test('the control draws its data sets with the Flot options and Chart.js config', async () => {
        const control = connect(`<div data-control="chart-line" style="height: 200px"
            data-chart-options="xaxis: {mode: 'time', minTickSize: [1, 'day']}"
            data-chart-config='{"scales": {"y": {"beginAtZero": true}}}'>
            <span data-chart="dataset" data-set-name="Amount" data-set-data="[1, 2], [3, 4]"></span>
        </div>`, 'chart-line');
        await flush();

        const chart = control.chart;
        expect(chart.canvas.parentElement.className).toBe('chart-canvas');
        expect(chart.config.data.datasets[0].label).toBe('Amount');
        expect(chart.options.scales.x.time.minUnit).toBe('day');
        expect(chart.options.scales.y.beginAtZero).toBe(true);

        control.addDataSet({ name: 'Units', data: [[1, 1]] });
        await flush();
        expect(chart.destroyed).toBe(true);
        expect(control.chart.config.data.datasets.map((dataSet) => dataSet.label)).toEqual(['Amount', 'Units']);
    });

    test('zooming shows the reset link, which restores the range', async () => {
        const control = connect(`<a id="reset-zoom" style="display: none">Reset</a>
            <div data-control="chart-line" data-zoomable data-reset-zoom-link="#reset-zoom">
                <span data-chart="dataset" data-set-data="[1, 2]"></span>
            </div>`, 'chart-line');
        await flush();

        const link = document.getElementById('reset-zoom');
        control.zoomTo(100, 200);
        expect(control.chart.options.scales.x.min).toBe(100);
        expect(control.chart.options.scales.x.max).toBe(200);
        expect(link.style.display).toBe('');

        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        expect(control.chart.options.scales.x.min).toBeUndefined();
        expect(control.chart.options.scales.x.max).toBeUndefined();
        expect(link.style.display).toBe('none');
    });

    test('dragging across the chart zooms to the range it covers', async () => {
        const control = connect(`<div data-control="chart-line" data-zoomable>
            <span data-chart="dataset" data-set-data="[1, 2]"></span>
        </div>`, 'chart-line');
        await flush();

        const canvas = control.canvas;
        canvas.dispatchEvent(new PointerEvent('pointerdown', { button: 0, clientX: 100, bubbles: true }));
        expect(control.canvasBox.querySelector('.chart-selection')).not.toBeNull();

        document.dispatchEvent(new PointerEvent('pointermove', { clientX: 300 }));
        document.dispatchEvent(new PointerEvent('pointerup', { clientX: 300 }));

        expect(control.canvasBox.querySelector('.chart-selection')).toBeNull();
        expect(control.chart.options.scales.x.min).toBe(100000);
        expect(control.chart.options.scales.x.max).toBe(300000);
    });

    test('options that are not Flot style syntax throw a clear error', () => {
        expect(() => connect('<div data-control="chart-line" data-chart-options="xaxis: {"></div>', 'chart-line'))
            .toThrow('Error parsing the data-chart-options attribute value.');
        started = [];
    });
});

describe('goal meter', () => {
    test('adds the meter under the figure, then fills it', async () => {
        const control = connect(`<div class="scoreboard-item title-value" data-control="goal-meter" data-value="88">
            <h4>Open rate</h4><p>88%</p><p class="description">120 unread</p>
        </div>`, 'goal-meter');

        const indicator = control.element.querySelector('span.goal-meter-indicator');
        expect(indicator.previousElementSibling.tagName).toBe('P');
        expect(indicator.nextElementSibling.className).toBe('description');
        expect(indicator.firstElementChild.textContent).toBe('88%');
        expect(indicator.firstElementChild.style.width).toBe('');
        expect(indicator.getAttribute('role')).toBe('progressbar');
        expect(indicator.getAttribute('aria-valuenow')).toBe('0');

        await new Promise((resolve) => setTimeout(resolve, 250));
        expect(indicator.firstElementChild.style.width).toBe('88%');
        expect(indicator.getAttribute('aria-valuenow')).toBe('88');

        control.update(40);
        expect(indicator.firstElementChild.style.width).toBe('40%');

        control.update(140);
        expect(indicator.firstElementChild.style.width).toBe('100%');
    });

    test('disconnecting takes the meter out', () => {
        const control = connect('<div data-control="goal-meter"><p>50%</p></div>', 'goal-meter');

        control.disconnect();
        started = [];

        expect(control.element.querySelector('span.goal-meter-indicator')).toBeNull();
    });
});
