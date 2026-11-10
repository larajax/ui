<?php
$values ??= [];
$height ??= null;
$fullWidth ??= false;
$wrapLegend ??= false;
$config ??= [];

// A chart inside a scoreboard lays out as one of its items
$inScoreboard = \Larajax\Ui\Classes\ViewComponent::current()?->getName() === 'scoreboard';

$classes = array_filter([
    $inScoreboard ? 'scoreboard-item' : null,
    'control-chart',
    $wrapLegend ? 'wrap-legend' : null,
]);

// Outside a scoreboard the element has no height of its own, so the bars set it
$height ??= $inScoreboard ? null : 100;
?>
<div <?= $attributes->merge(array_filter([
    'class' => implode(' ', $classes),
    'data-control' => 'chart-bar',
    'data-height' => $height,
    'data-full-width' => $fullWidth ? '1' : null,
    'data-chart-config' => $config ? json_encode($config) : null,
    'style' => !$inScoreboard && !$fullWidth ? "height: {$height}px" : null,
], fn ($value) => $value !== null)) ?>>
    <ul>
        <?php foreach ($values as $item): ?>
            <li<?= $item['color'] ? ' data-color="'.e($item['color']).'"' : '' ?>>
                <?= e($item['label']) ?>
                <span><?= e($item['value']) ?></span>
            </li>
        <?php endforeach ?>
    </ul>
</div>
