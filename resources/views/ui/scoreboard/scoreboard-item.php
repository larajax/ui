<?php
// A value of null means there is no data, where an empty one leaves the figure blank
$hasNoValue = !isset($value);

$label ??= '';
$value ??= '';
$unit ??= '';
$comment ??= '';
$icon ??= '';
$color ??= '';
$image ??= '';
$positive ??= false;
$negative ??= false;
$change ??= '';
$sparkline ??= null;
$success ??= false;
$danger ??= false;
$meter ??= null;
$inverse ??= false;
$href ??= '';
$tooltip ??= '';

$valueHtml = trim((string) $slot);
$commentHtml = trim((string) ($slots['comment'] ?? ''));

$hasNoData = false;

if ($valueHtml === '') {
    $valueText = (string) $value;
    if ($valueText === '' && $meter !== null) {
        $valueText = $meter.'%';
    }

    $hasNoData = $valueText === '' && $hasNoValue;
    $valueHtml = $hasNoData
        ? '<span class="scoreboard-empty">'.e(__('No data')).'</span>'
        : e($valueText);
}

if ($commentHtml === '' && $comment !== '') {
    $commentHtml = e($comment);
}

// The figure keeps its color for a trend, which shows beside it instead
if ($success) {
    $valueClass = 'success';
}
elseif ($danger) {
    $valueClass = 'danger';
}
else {
    $valueClass = null;
}

// The arrow follows the direction, and the tint whether that is good, which inverse turns around
if ($positive) {
    $direction = 'up';
}
elseif ($negative) {
    $direction = 'down';
}
else {
    $direction = null;
}

if ($direction !== null) {
    $trend = ($direction === 'up') !== (bool) $inverse ? 'positive' : 'negative';
}
else {
    $trend = null;
}

$changeText = (string) $change;
$hasTrend = !$hasNoData && ($direction !== null || $changeText !== '');

// The color sits in a style attribute, so it must be a plain color value
$hasColor = $color !== '' && app('html')->isValidColor($color) && !preg_match('/[;{}<>"\'\\\\]/', $color);

$linkUrl = $href !== '' ? app('larajax.ui')->url($href) : '';

$classes = ['scoreboard-item', 'title-value'];
$meterAttributes = [];

if ($icon !== '') {
    $classes[] = 'has-icon';
}

if ($linkUrl !== '') {
    $classes[] = 'has-link';
}

if ($meter !== null) {
    $meterAttributes = ['data-control' => 'goal-meter', 'data-value' => $meter];

    if ($inverse) {
        $classes[] = 'goal-meter-inverse';
    }
}
?>
<div <?= $attributes->merge(['class' => implode(' ', $classes)] + $meterAttributes) ?>>
    <?php if ($icon !== ''): ?>
        <span class="scoreboard-icon<?= $hasColor ? ' is-tinted' : '' ?>"<?= $hasColor ? ' style="--scoreboard-icon-tint: '.e($color).'"' : '' ?>>
            <?= \Larajax\Ui\Facades\Ui::icon($icon) ?>
        </span>
        <div class="scoreboard-body">
    <?php endif ?>
    <?php if ($label !== '' || $tooltip !== ''): ?>
        <div class="scoreboard-label">
            <?= e($label) ?>
            <?php if ($tooltip !== ''): ?>
                <span class="scoreboard-help" data-tooltip-text="<?= e($tooltip) ?>" data-tooltip-position="top" tabindex="0" aria-label="<?= e($tooltip) ?>">
                    <?= \Larajax\Ui\Facades\Ui::icon('tooltip.info') ?>
                </span>
            <?php endif ?>
        </div>
    <?php endif ?>
    <p<?= $valueClass ? ' class="'.$valueClass.'"' : '' ?>>
        <?php if ($icon === '' && $hasColor): ?>
            <span class="scoreboard-colorpicker" style="--background-color: <?= e($color) ?>; --foreground-color: <?= e($color) ?>"></span>
        <?php elseif ($icon === '' && $image !== ''): ?>
            <img class="scoreboard-image" src="<?= e($image) ?>" alt="" />
        <?php endif ?>
        <?= $valueHtml ?>
        <?php if ($unit !== '' && !$hasNoData): ?>
            <span class="scoreboard-unit"><?= e($unit) ?></span>
        <?php endif ?>
        <?php if ($hasTrend): ?>
            <span class="scoreboard-trend<?= $trend ? ' is-'.$trend : '' ?>">
                <?php if ($direction === 'up'): ?>
                    <?= \Larajax\Ui\Facades\Ui::icon('scoreboard.up') ?>
                    <span class="visually-hidden"><?= e(__('Increased')) ?></span>
                <?php elseif ($direction === 'down'): ?>
                    <?= \Larajax\Ui\Facades\Ui::icon('scoreboard.down') ?>
                    <span class="visually-hidden"><?= e(__('Decreased')) ?></span>
                <?php endif ?>
                <?= e($changeText) ?>
            </span>
        <?php endif ?>
    </p>
    <?php if ($sparkline): ?>
        <svg class="scoreboard-sparkline<?= $trend ? ' is-'.$trend : '' ?>" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="<?= e($sparkline['area']) ?>" />
            <polyline points="<?= e($sparkline['line']) ?>" />
            <path class="scoreboard-sparkline-dot" d="M<?= e($sparkline['last'][0]) ?>,<?= e($sparkline['last'][1]) ?>h0" />
        </svg>
    <?php endif ?>
    <?php if ($commentHtml !== ''): ?>
        <p class="description">
            <?= $commentHtml ?>
        </p>
    <?php endif ?>
    <?php if ($icon !== ''): ?>
        </div>
    <?php endif ?>
    <?php if ($linkUrl !== ''): ?>
        <a class="scoreboard-link" href="<?= e($linkUrl) ?>" aria-label="<?= e($label !== '' ? $label : (string) $value) ?>"></a>
    <?php endif ?>
</div>
