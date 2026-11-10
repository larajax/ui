<?php namespace Larajax\Ui\Classes\UiFactory;

use Larajax\Ui\Classes\ViewComponent;

/**
 * HasScoreboards
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
trait HasScoreboards
{
    /**
     * scoreboard creates a scoreboard component, a row of key figures that scrolls sideways by dragging, whose items are captured with slot().
     *
     * Usage:
     *     <?php Ui::scoreboard()->slot() ?>
     *         <?= Ui::scoreboardItem(label: 'Orders', value: '1,284', comment: 'this month') ?>
     *         <?= Ui::pieChart(values: ['Published' => 84, 'Drafts' => 12]) ?>
     *     <?php Ui::end() ?>
     */
    public static function scoreboard(...$attributes): ViewComponent
    {
        return new ViewComponent('scoreboard', [], $attributes);
    }

    /**
     * scoreboardItem creates a scoreboard figure, whose value markup can be captured with slot() and whose comment markup is the "comment" slot.
     *
     * Usage:
     *     <?= Ui::scoreboardItem(label: 'Revenue', value: '$48,210', change: '14.9%', positive: true, sparkline: [32, 35, 41, 48]) ?>
     *     <?= Ui::scoreboardItem(label: 'Response time', value: 312, unit: 'ms', compare: [312, 340], inverse: true) ?>
     *
     *     <?php Ui::scoreboardItem(label: 'Customer')->slot() ?>
     *         <a href="/customers/7">Jane Doe</a>
     *     <?php Ui::slot('comment') ?>
     *         Email: <a href="mailto:jane@example.com">jane@example.com</a>
     *     <?php Ui::end() ?>
     *
     * @param string $label Title above the figure
     * @param string|int|float|null $value The figure, where null shows that there is no data
     * @param string $unit Unit shown smaller after the figure, such as "ms"
     * @param string $comment Text under the figure
     * @param string $icon Icon class shown in a tile beside the text, tinted by the color when there is one
     * @param string $color Color of a swatch shown before the figure, or of the icon tile
     * @param string $image Image URL shown before the figure
     * @param bool $positive An up trend, a green arrow beside the figure
     * @param bool $negative A down trend, a red arrow beside the figure
     * @param string|int|float $change The change shown with the trend arrow, such as "14.9%"
     * @param array $compare The current and previous values, which give the change and trend when neither is set
     * @param array $sparkline Recent values drawn as a small line under the figure
     * @param bool $success Green figure
     * @param bool $danger Red figure
     * @param int|float|null $meter Percentage that adds a goal meter, and the figure when there is no value
     * @param bool $inverse For a figure where higher is worse, a rise is red and a fall green, and the goal meter fills in red
     * @param string $href Link URL, which makes the whole item a link
     * @param string $tooltip Text explaining the figure, shown from an icon beside the title
     */
    public static function scoreboardItem(
        string $label = '',
        string|int|float|null $value = '',
        string $unit = '',
        string $comment = '',
        string $icon = '',
        string $color = '',
        string $image = '',
        bool $positive = false,
        bool $negative = false,
        string|int|float $change = '',
        array $compare = [],
        array $sparkline = [],
        bool $success = false,
        bool $danger = false,
        int|float|null $meter = null,
        bool $inverse = false,
        string $href = '',
        string $tooltip = '',
        ...$attributes
    ): ViewComponent {
        $sparkline = static::makeSparkline($sparkline);

        // The change and trend come from comparing values when neither is set
        if ($compare && $change === '' && !$positive && !$negative) {
            [$change, $positive, $negative] = static::makeComparison($compare);
        }

        return new ViewComponent('scoreboard.scoreboard-item', compact(
            'label',
            'value',
            'unit',
            'comment',
            'icon',
            'color',
            'image',
            'positive',
            'negative',
            'change',
            'sparkline',
            'success',
            'danger',
            'meter',
            'inverse',
            'href',
            'tooltip'
        ), $attributes);
    }

    /**
     * scoreboardThumbnail creates a scoreboard item that shows an image, such as a product photo.
     *
     * Usage:
     *     <?= Ui::scoreboardThumbnail(image: $product->thumbUrl, label: $product->name) ?>
     *
     * @param string $image Image URL
     * @param string $label Text alternative of the image
     */
    public static function scoreboardThumbnail(
        string $image = '',
        string $label = '',
        ...$attributes
    ): ViewComponent {
        return new ViewComponent('scoreboard.scoreboard-thumbnail', compact(
            'image',
            'label'
        ), $attributes);
    }

    /**
     * makeComparison returns the change from a previous value to the current one as a percentage, and whether it rose or fell.
     *
     * @return array{0: string, 1: bool, 2: bool}
     */
    protected static function makeComparison(array $compare): array
    {
        [$current, $previous] = array_values($compare) + [null, null];

        if (!is_numeric($current) || !is_numeric($previous)) {
            return ['', false, false];
        }

        $difference = $current - $previous;

        // A change from nothing has no percentage, only a direction
        $change = $previous == 0 ? '' : static::formatPercent(abs($difference) / abs($previous) * 100);

        return [$change, $difference > 0, $difference < 0];
    }

    /**
     * formatPercent formats a percentage with one decimal place, leaving off a decimal of zero.
     */
    protected static function formatPercent(float $percent): string
    {
        $text = number_format($percent, 1);

        return (str_ends_with($text, '.0') ? substr($text, 0, -2) : $text).'%';
    }

    /**
     * makeSparkline turns recent values into the points of a sparkline 100 wide and 24 tall, scaled between the lowest and highest value, with the last point for its end dot.
     *
     * @return array{line: string, area: string, last: array{0: float, 1: float}}|null
     */
    protected static function makeSparkline(array $values): ?array
    {
        $values = array_values(array_map(fn ($value) => $value + 0, array_filter($values, 'is_numeric')));

        if (count($values) < 2) {
            return null;
        }

        $min = min($values);
        $range = max($values) - $min;
        $last = count($values) - 1;
        $points = [];

        foreach ($values as $index => $value) {
            // A flat line sits in the middle, others keep a pixel from the top and bottom
            $y = $range == 0 ? 12 : 1 + (1 - ($value - $min) / $range) * 22;
            $points[] = round($index / $last * 100, 2).','.round($y, 2);
        }

        $line = implode(' ', $points);

        return ['line' => $line, 'area' => "0,24 {$line} 100,24", 'last' => explode(',', end($points))];
    }
}
