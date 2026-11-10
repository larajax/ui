/*
 * Chart utilities
 *
 * Shared by the chart controls: the colour palette, the values and legend read from a chart's list,
 * the hover tooltip, the theme colours, and Chart.js, which loads on first use.
 */
'use strict';

import { registerDateAdapter } from './chart-date-adapter.js';

// The colours given to values and data sets that set none, read from --chart-color-1 onwards, with
// Bootstrap's blue, green, amber, red, violet, cyan, orange, pink, teal, lime, indigo and brown 500
// for a token that is unset
export const PALETTE = [
    '#0087fe', '#00b15a', '#ffa500', '#e62845', '#8e3de8', '#00b4f8',
    '#ff6800', '#e12871', '#00beb6', '#40ab00', '#7740ff', '#b76a32'
];

// The theme colours a chart reads from its element, with the colour used when a token is unset
const THEME_TOKENS = {
    text: ['--chart-text-color', '#545454'],
    grid: ['--chart-grid-color', 'rgba(0, 0, 0, 0.1)'],
    track: ['--chart-track-color', '#dee2e6'],
    markings: ['--chart-markings-color', 'rgba(0, 0, 0, 0.03)'],
    point: ['--chart-point-color', '#ffffff'],
    hover: ['--chart-hover-line-color', 'rgba(0, 0, 0, 0.2)']
};

// A colour a canvas draws as it is written, which needs no resolving
const PLAIN_COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i;

/**
 * chartLibrary holds the Chart.js import, which the controls share.
 */
export const chartLibrary = {
    promise: null,

    load() {
        return import('../../vendor/chartjs/chart.esm.js');
    }
};

/**
 * loadChart imports Chart.js on first use, with the date adapter and the pointer tooltip position, and resolves with the Chart class.
 */
export function loadChart() {
    if (!chartLibrary.promise) {
        chartLibrary.promise = chartLibrary.load().then((module) => {
            registerDateAdapter(module._adapters);

            if (module.Tooltip && module.Tooltip.positioners) {
                // Places the tooltip at the pointer, as the hover position
                module.Tooltip.positioners.pointer = (elements, eventPosition) => eventPosition
                    ? { x: eventPosition.x, y: eventPosition.y }
                    : false;
            }

            return module.Chart;
        });
    }

    return chartLibrary.promise;
}

/**
 * isFlagOn returns whether a flag attribute is on, which it is when present with no value or a true one.
 */
export function isFlagOn(value) {
    return value === '' || (value !== undefined && value !== null && value !== false && value !== 0 && value !== 'false');
}

/**
 * getColor returns the palette colour for a value's position, from the theme's palette when given one.
 */
export function getColor(index, palette = PALETTE) {
    const colors = palette && palette.length ? palette : PALETTE;

    return colors[index % colors.length];
}

/**
 * valueColors returns the colour of each value, its own or the next from the palette, resolved for a canvas.
 */
export function valueColors(element, values, palette) {
    return resolveColors(element, values.map((valueInfo, index) => valueInfo.color !== undefined ? valueInfo.color : getColor(index, palette)));
}

/**
 * loadListValues reads each item of a chart's list, its value from data-value or its span, and its data-color.
 */
export function loadListValues(list) {
    const result = {
        values: [],
        total: 0,
        max: 0
    };

    if (!list) {
        return result;
    }

    list.querySelectorAll(':scope > li').forEach((item) => {
        const span = item.querySelector('span');
        let value = item.dataset.value !== undefined && item.dataset.value !== ''
            ? parseFloat(item.dataset.value)
            : parseFloat(span ? span.textContent : '');

        if (isNaN(value)) {
            value = 0;
        }

        // Negative values present as positive in charts
        if (value < 0) {
            value = value * -1;
        }

        result.total += value;
        result.values.push({ value, color: item.dataset.color || undefined });
        result.max = Math.max(result.max, value);
    });

    return result;
}

/**
 * createLegend builds the legend table from a chart's list after it, with a colour indicator per row, and hides the list.
 */
export function createLegend(list) {
    const legend = document.createElement('div');
    const table = document.createElement('table');
    const indicators = [];

    legend.className = 'chart-legend';
    legend.appendChild(table);

    list.querySelectorAll(':scope > li').forEach((item) => {
        const label = item.cloneNode(true);
        label.querySelectorAll(':scope > *').forEach((child) => child.remove());

        const span = item.querySelector('span');
        const row = table.insertRow();
        const indicatorCell = row.insertCell();
        const labelCell = row.insertCell();
        const valueCell = row.insertCell();
        const indicator = document.createElement('i');

        indicatorCell.className = 'indicator';
        indicatorCell.appendChild(indicator);
        labelCell.innerHTML = label.innerHTML;
        valueCell.className = 'value';
        valueCell.innerHTML = span ? span.innerHTML : '';
        indicators.push(indicator);
    });

    list.after(legend);
    list.hidden = true;

    return { legend, indicators };
}

/**
 * getLegendLabel returns the label of a legend row.
 */
export function getLegendLabel(legend, index) {
    const row = legend.querySelectorAll('tr')[index];

    return row ? row.cells[1].innerHTML : '';
}

/**
 * showTooltip shows the chart tooltip below and to the right of a page position, kept inside the window.
 */
export function showTooltip(x, y, html) {
    hideTooltip();

    const tooltip = document.createElement('div');
    tooltip.id = 'chart-tooltip';
    tooltip.innerHTML = html;
    tooltip.style.visibility = 'hidden';
    document.body.appendChild(tooltip);

    x += 10;
    y += 10;

    const tooltipWidth = tooltip.offsetWidth;
    if ((x + tooltipWidth) > window.innerWidth) {
        x = window.innerWidth - tooltipWidth - 10;
    }

    tooltip.style.top = `${y}px`;
    tooltip.style.left = `${x}px`;
    tooltip.style.visibility = 'visible';
}

/**
 * hideTooltip removes the chart tooltip.
 */
export function hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

/**
 * escapeHtml escapes text for use in markup.
 */
export function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

/**
 * formatNumber formats a value with the grouping and decimals of the page locale, leaving anything else as it is.
 */
export function formatNumber(value) {
    if (typeof value !== 'number' || !isFinite(value)) {
        return value;
    }

    const lang = (document.documentElement.getAttribute('lang') || '').trim().replace(/_/g, '-');

    try {
        return value.toLocaleString(lang || undefined, { maximumFractionDigits: 2 });
    }
    catch (ex) {
        return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
}

/**
 * tooltipRow returns a tooltip line with a colour dot, a label in markup and the value.
 */
export function tooltipRow(color, labelHtml, value) {
    return '<div class="chart-tooltip-row">'
        + `<i style="background: ${escapeHtml(color || 'transparent')}"></i>`
        + (labelHtml ? `<span>${labelHtml}</span>` : '')
        + `<strong>${escapeHtml(formatNumber(value))}</strong>`
        + '</div>';
}

/**
 * tooltipOptions returns the Chart.js tooltip settings that show the chart tooltip at the pointer, with the content a callback returns for the hovered points.
 */
export function tooltipOptions(content) {
    return {
        enabled: false,
        position: 'pointer',
        external({ chart, tooltip }) {
            if (!tooltip || tooltip.opacity === 0 || !tooltip.dataPoints || !tooltip.dataPoints.length) {
                hideTooltip();
                return;
            }

            const rect = chart.canvas.getBoundingClientRect();
            showTooltip(
                rect.left + window.scrollX + tooltip.caretX,
                rect.top + window.scrollY + tooltip.caretY,
                content(tooltip.dataPoints)
            );
        }
    };
}

/**
 * readThemeColors resolves the chart colour tokens and the palette on an element to colours a canvas can draw.
 */
export function readThemeColors(element) {
    const colors = {};
    const resolve = makeColorResolver(element);

    for (const [name, [token, fallback]] of Object.entries(THEME_TOKENS)) {
        colors[name] = resolve(`var(${token}, ${fallback})`, fallback);
    }

    colors.palette = PALETTE.map((fallback, index) => resolve(`var(--chart-color-${index + 1}, ${fallback})`, fallback));
    resolve.done();

    const font = window.getComputedStyle ? window.getComputedStyle(element).fontFamily : '';
    colors.font = font || undefined;

    return colors;
}

/**
 * resolveColors turns colours a canvas cannot draw as written, such as var(--bs-success-base), into the colours they compute to on an element.
 */
export function resolveColors(element, colors) {
    const resolve = makeColorResolver(element);
    const resolved = colors.map((color) => (color && !PLAIN_COLOR.test(String(color).trim()) ? resolve(color, color) : color));
    resolve.done();

    return resolved;
}

// Returns a function that computes a colour through a hidden element, so CSS variables and theme functions resolve as the page draws them
function makeColorResolver(element) {
    let probe = null;

    const resolve = (value, fallback) => {
        if (!probe) {
            probe = document.createElement('span');
            probe.hidden = true;
            element.appendChild(probe);
        }

        probe.style.color = '';
        probe.style.color = value;

        const color = probe.style.color && window.getComputedStyle ? window.getComputedStyle(probe).color : '';

        return color && !color.includes('var(') ? color : fallback;
    };

    resolve.done = () => {
        if (probe) {
            probe.remove();
            probe = null;
        }
    };

    return resolve;
}

/**
 * watchTheme calls back when the page switches between light and dark, and returns a function that stops watching.
 */
export function watchTheme(callback) {
    const observer = new MutationObserver(() => callback());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme', 'class'] });

    const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    if (media && media.addEventListener) {
        media.addEventListener('change', callback);
    }

    return () => {
        observer.disconnect();
        if (media && media.removeEventListener) {
            media.removeEventListener('change', callback);
        }
    };
}

/**
 * withAlpha returns a colour at an opacity, for hex colours and the rgb, hsl, oklch, oklab, lab, lch and color() functions, or the colour as it is in another format.
 */
export function withAlpha(color, alpha) {
    const text = String(color || '').trim();
    let match = text.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);

    if (match) {
        let hex = match[1];
        if (hex.length <= 4) {
            hex = hex.split('').map((digit) => digit + digit).join('');
        }

        const [red, green, blue] = [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));

        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }

    match = text.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
    if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
    }

    match = text.match(/^hsla?\(\s*([^,]+),\s*([^,]+),\s*([^,)]+)/i);
    if (match) {
        return `hsla(${match[1].trim()}, ${match[2].trim()}, ${match[3].trim()}, ${alpha})`;
    }

    // Space separated functions take the opacity after a slash, replacing one already there
    match = text.match(/^(rgba?|hsla?|hwb|oklch|oklab|lch|lab|color)\(([^)]*)\)$/i);
    if (match) {
        return `${match[1].toLowerCase()}(${match[2].split('/')[0].trim()} / ${alpha})`;
    }

    return text;
}

/**
 * mergeOptions deep merges plain objects into a target, replacing arrays and other values.
 */
export function mergeOptions(target, ...sources) {
    for (const source of sources) {
        if (!isPlainObject(source)) {
            continue;
        }

        for (const [key, value] of Object.entries(source)) {
            if (isPlainObject(value)) {
                target[key] = mergeOptions(isPlainObject(target[key]) ? target[key] : {}, value);
            }
            else {
                target[key] = value;
            }
        }
    }

    return target;
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * createChart loads Chart.js and draws a chart for a control, dispatching "init" with the config first, which listeners may change, and "ready" with the chart after.
 */
export function createChart(control, canvas, config) {
    const ticket = control.chartTicket = (control.chartTicket || 0) + 1;

    return loadChart().then((Chart) => {
        // The control disconnected, or drew again, while Chart.js loaded
        if (ticket !== control.chartTicket || !canvas.isConnected) {
            return null;
        }

        // Charts draw without moving for visitors who ask for less motion
        if (prefersReducedMotion()) {
            config.options.animation = false;
        }

        mergeOptions(config.options, control.config.chartConfig);
        control.dispatch('init', { detail: { config } });

        control.chart = new Chart(canvas, config);
        control.dispatch('ready', { detail: { chart: control.chart } });

        return control.chart;
    });
}

/**
 * prefersReducedMotion returns whether the visitor asked for less motion.
 */
export function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

/**
 * destroyChart removes a control's chart and stops a pending one from drawing.
 */
export function destroyChart(control) {
    control.chartTicket = (control.chartTicket || 0) + 1;

    if (control.chart) {
        control.chart.destroy();
        control.chart = null;
    }

    hideTooltip();
}
