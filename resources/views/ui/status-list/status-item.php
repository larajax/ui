<?php
$label ??= '';
$value ??= '';
$href ??= '';
$icon ??= '';
$success ??= false;
$warning ??= false;
$danger ??= false;
$primary ??= false;
$info ??= false;
$muted ??= false;

if ($success) {
    $type = 'success';
}
elseif ($warning) {
    $type = 'warning';
}
elseif ($danger) {
    $type = 'danger';
}
elseif ($primary) {
    $type = 'primary';
}
elseif ($info) {
    $type = 'info';
}
else {
    $type = null;
}

$textType = $type ?: ($muted ? 'muted' : null);
$valueHtml = trim((string) $slot);
?>
<li<?= $attributes->isNotEmpty() ? ' '.$attributes : '' ?>>
    <?php if ($icon !== ''): ?>
        <span class="<?= trim('status-icon '.$type) ?>">
            <?= \Larajax\Ui\Facades\Ui::icon($icon) ?>
        </span>
    <?php endif ?>
    <span class="<?= trim('status-text '.$textType) ?>">
        <?= e($label) ?>
    </span>
    <?php if ($valueHtml !== ''): ?>
        <span class="status-label">
            <?= $valueHtml ?>
        </span>
    <?php elseif ($href !== ''): ?>
        <a href="<?= e($href) ?>" class="status-label link">
            <?= e($value) ?>
        </a>
    <?php elseif ($value !== ''): ?>
        <span class="status-label">
            <?= e($value) ?>
        </span>
    <?php endif ?>
</li>
