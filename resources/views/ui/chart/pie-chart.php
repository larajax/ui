<?php
$values ??= [];
$size ??= null;
$centerText ??= '';
$centered ??= false;
$wrapLegend ??= false;
$config ??= [];

// A chart inside a scoreboard lays out as one of its items
$inScoreboard = \Larajax\Ui\Classes\ViewComponent::current()?->getName() === 'scoreboard';

$classes = array_filter([
    $inScoreboard ? 'scoreboard-item' : null,
    'control-chart',
    $centered ? 'centered' : null,
    $wrapLegend ? 'wrap-legend' : null,
]);
?>
<div <?= $attributes->merge(array_filter([
    'class' => implode(' ', $classes),
    'data-control' => 'chart-pie',
    'data-size' => $size ?? ($inScoreboard ? null : 200),
    'data-center-text' => $centerText !== '' ? $centerText : null,
    'data-chart-config' => $config ? json_encode($config) : null,
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
