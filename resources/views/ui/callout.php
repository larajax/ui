<?php
$label ??= '';
$comment ??= '';
$commentHtml ??= false;
$success ??= false;
$warning ??= false;
$danger ??= false;
$icon ??= true;

if ($success) {
    $type = 'success';
}
elseif ($warning) {
    $type = 'warning';
}
elseif ($danger) {
    $type = 'danger';
}
else {
    $type = 'info';
}

$body = trim((string) $slot);
$action = trim((string) ($slots['action'] ?? ''));
$hasHeader = $label !== '' || $comment !== '';
$hasCustomIcon = is_string($icon) && $icon !== '';
$iconKey = $hasCustomIcon ? $icon : ($icon ? 'callout.'.$type : null);

$classes = ['callout', 'fade', 'show', 'callout-'.$type];

if (!$iconKey || !$hasHeader) {
    $classes[] = 'no-icon';
}

if ($hasCustomIcon) {
    $classes[] = 'has-custom-icon';
}

if ($label === '') {
    $classes[] = 'no-title';
}

if ($comment === '') {
    $classes[] = 'no-subheader';
}
?>
<div <?= $attributes->merge(['class' => implode(' ', $classes)]) ?>>
    <?php if ($action !== ''): ?>
        <div class="action">
            <?= $action ?>
        </div>
    <?php endif ?>
    <?php if ($hasHeader): ?>
        <div class="header">
            <?php if ($iconKey): ?>
                <div class="custom-icon">
                    <?= \Larajax\Ui\Facades\Ui::icon($iconKey) ?>
                </div>
            <?php endif ?>
            <?php if ($label !== ''): ?>
                <h3>
                    <?= e($label) ?>
                </h3>
            <?php endif ?>
            <?php if ($comment !== '' && $commentHtml): ?>
                <?= $comment ?>
            <?php elseif ($comment !== ''): ?>
                <p>
                    <?= e($comment) ?>
                </p>
            <?php endif ?>
        </div>
    <?php endif ?>
    <?php if ($body !== ''): ?>
        <div class="content">
            <?= $body ?>
        </div>
    <?php endif ?>
</div>
