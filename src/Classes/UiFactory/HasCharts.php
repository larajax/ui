<?php namespace Larajax\Ui\Classes\UiFactory;

use DateTimeImmutable;
use DateTimeInterface;
use DateTimeZone;
use Illuminate\Support\Arr;
use Larajax\Ui\Classes\ViewComponent;

/**
 * HasCharts
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
trait HasCharts
{
    /**
     * pieChart creates a pie chart component, which lays out as a scoreboard item inside a scoreboard.
     *
     * Values take the forms an options list does: a label and its value, a label and a [value, color] pair,
     * or a detailed definition with label, value and color keys.
     *
     * Usage:
     *     <?= Ui::pieChart(centerText: '114', values: [
     *         'Published' => [84, '#95b753'],
     *         'Drafts' => [12, '#e5a91a'],
     *         'Deleted' => 18,
     *     ]) ?>
     *
     * @param array $values Labels and their values
     * @param int|null $size Size of the ring in pixels, the item's height in a scoreboard and 200 elsewhere
     * @param string $centerText Text inside the ring
     * @param bool $centered Centers the ring above its legend
     * @param bool $wrapLegend Lays the legend out in a row
     * @param array $config Chart.js options merged over the chart's own
     */
    public static function pieChart(
        array $values = [],
        ?int $size = null,
        string $centerText = '',
        bool $centered = false,
        bool $wrapLegend = false,
        array $config = [],
        ...$attributes
    ): ViewComponent {
        $values = static::makeChartValues($values);

        return new ViewComponent('chart.pie-chart', compact(
            'values',
            'size',
            'centerText',
            'centered',
            'wrapLegend',
            'config'
        ), $attributes);
    }

    /**
     * barChart creates a bar chart component, which lays out as a scoreboard item inside a scoreboard.
     *
     * Usage:
     *     <?= Ui::barChart(height: 100, fullWidth: true, values: ['Published' => 84, 'Drafts' => 12]) ?>
     *
     * @param array $values Labels and their values, in the forms pieChart takes
     * @param int|null $height Height of the bars in pixels, the item's height in a scoreboard and 100 elsewhere
     * @param bool $fullWidth Spans the bars across the container
     * @param bool $wrapLegend Lays the legend out in a row
     * @param array $config Chart.js options merged over the chart's own
     */
    public static function barChart(
        array $values = [],
        ?int $height = null,
        bool $fullWidth = false,
        bool $wrapLegend = false,
        array $config = [],
        ...$attributes
    ): ViewComponent {
        $values = static::makeChartValues($values);

        return new ViewComponent('chart.bar-chart', compact(
            'values',
            'height',
            'fullWidth',
            'wrapLegend',
            'config'
        ), $attributes);
    }

    /**
     * lineChart creates a line chart component over a time axis, shown in UTC.
     *
     * Each data set is its points keyed by name, or a definition with label, color, data, and the lines and
     * points options. Points are [time, value] pairs, or values keyed by date, where a time is a timestamp in
     * milliseconds, a date string or a DateTimeInterface, whose own clock time is shown.
     *
     * Usage:
     *     <?= Ui::lineChart(height: 250, zoomable: true, datasets: [
     *         'Amount' => ['color' => '#008dc9', 'data' => ['2026-11-01' => 400, '2026-11-02' => 380]],
     *         'Units' => $unitsByDay,
     *     ]) ?>
     *
     * @param array $datasets Data sets keyed by name
     * @param int|string $height Height in pixels, or a CSS length
     * @param string $timeMode "weeks" shades the weekends
     * @param bool $zoomable Zooms to the range a visitor drags across
     * @param string $resetZoomLink Selector for the link that resets the zoom
     * @param array $config Chart.js options merged over the chart's own
     */
    public static function lineChart(
        array $datasets = [],
        int|string $height = 250,
        string $timeMode = '',
        bool $zoomable = false,
        string $resetZoomLink = '',
        array $config = [],
        ...$attributes
    ): ViewComponent {
        $datasets = static::makeChartDataSets($datasets);

        return new ViewComponent('chart.line-chart', compact(
            'datasets',
            'height',
            'timeMode',
            'zoomable',
            'resetZoomLink',
            'config'
        ), $attributes);
    }

    /**
     * statusList creates a status list component, whose items are captured with slot().
     *
     * Usage:
     *     <?php Ui::statusList()->slot() ?>
     *         <?= Ui::statusItem(label: 'Software is up to date', icon: 'ph ph-check', success: true) ?>
     *         <?= Ui::statusItem(label: 'System build', value: '313', icon: 'ph ph-info') ?>
     *     <?php Ui::end() ?>
     */
    public static function statusList(...$attributes): ViewComponent
    {
        return new ViewComponent('status-list', [], $attributes);
    }

    /**
     * statusItem creates a status list item, whose label markup on the right can be captured with slot().
     *
     * @param string $label Status text
     * @param string $value Label on the right
     * @param string $href Link URL, which makes the label on the right a link
     * @param string $icon Icon class shown in a circle before the text
     * @param bool $success Success styling
     * @param bool $warning Warning styling
     * @param bool $danger Danger styling
     * @param bool $primary Primary styling
     * @param bool $info Info styling
     * @param bool $muted Muted text
     */
    public static function statusItem(
        string $label = '',
        string $value = '',
        string $href = '',
        string $icon = '',
        bool $success = false,
        bool $warning = false,
        bool $danger = false,
        bool $primary = false,
        bool $info = false,
        bool $muted = false,
        ...$attributes
    ): ViewComponent {
        return new ViewComponent('status-list.status-item', compact(
            'label',
            'value',
            'href',
            'icon',
            'success',
            'warning',
            'danger',
            'primary',
            'info',
            'muted'
        ), $attributes);
    }

    /**
     * makeChartValues turns pie and bar chart values into a list of labels, values and colors.
     *
     * @return array<int, array{label: string, value: int|float, color: ?string}>
     */
    protected static function makeChartValues(array $values): array
    {
        $result = [];

        foreach ($values as $key => $definition) {
            $label = is_string($key) ? $key : '';
            $color = null;

            // Value as definition
            if (is_array($definition) && Arr::isAssoc($definition)) {
                $label = (string) ($definition['label'] ?? $label);
                $value = $definition['value'] ?? 0;
                $color = $definition['color'] ?? null;
            }
            // Value as [value, color]
            elseif (is_array($definition)) {
                $value = $definition[0] ?? 0;
                $color = $definition[1] ?? null;
            }
            else {
                $value = $definition;
            }

            $result[] = [
                'label' => $label,
                'value' => is_numeric($value) ? $value + 0 : 0,
                'color' => static::makeChartColor($color),
            ];
        }

        return $result;
    }

    /**
     * makeChartDataSets turns line chart data sets into a list of labels, colors, options and [timestamp, value] points.
     *
     * @return array<int, array{label: string, color: ?string, lines: ?array, points: ?array, data: array}>
     */
    protected static function makeChartDataSets(array $datasets): array
    {
        $result = [];

        foreach ($datasets as $key => $definition) {
            $isDefinition = is_array($definition) && array_key_exists('data', $definition);

            $result[] = [
                'label' => (string) ($isDefinition ? ($definition['label'] ?? $definition['name'] ?? '') : '') ?: (is_string($key) ? $key : ''),
                'color' => $isDefinition ? static::makeChartColor($definition['color'] ?? null) : null,
                'lines' => $isDefinition && is_array($definition['lines'] ?? null) ? $definition['lines'] : null,
                'points' => $isDefinition && is_array($definition['points'] ?? null) ? $definition['points'] : null,
                'data' => static::makeChartPoints($isDefinition ? $definition['data'] : $definition),
            ];
        }

        return $result;
    }

    /**
     * makeChartPoints turns [time, value] pairs, or values keyed by time, into [timestamp, value] points.
     *
     * @return array<int, array{0: int|float|null, 1: int|float|null}>
     */
    protected static function makeChartPoints(iterable $data): array
    {
        $points = [];

        foreach ($data as $key => $point) {
            if (is_array($point)) {
                $pair = array_values($point);
                $time = $pair[0] ?? null;
                $value = $pair[1] ?? null;
            }
            else {
                $time = $key;
                $value = $point;
            }

            $points[] = [static::makeChartTime($time), is_numeric($value) ? $value + 0 : null];
        }

        return $points;
    }

    /**
     * makeChartTime turns a time into a timestamp in milliseconds, reading a date's own clock time as UTC so the chart shows it as written.
     */
    protected static function makeChartTime(mixed $time): int|float|null
    {
        if (is_int($time) || is_float($time)) {
            return $time;
        }

        if (is_numeric($time)) {
            return $time + 0;
        }

        $utc = new DateTimeZone('UTC');

        try {
            $date = $time instanceof DateTimeInterface
                ? new DateTimeImmutable($time->format('Y-m-d H:i:s.u'), $utc)
                : new DateTimeImmutable((string) $time, $utc);
        }
        catch (\Exception $ex) {
            return null;
        }

        return (int) $date->format('Uv');
    }

    /**
     * makeChartColor returns a color when it is a valid one.
     */
    protected static function makeChartColor(mixed $color): ?string
    {
        if (!is_string($color) || $color === '' || !app('html')->isValidColor($color)) {
            return null;
        }

        return $color;
    }
}
