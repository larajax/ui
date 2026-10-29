<?php
$label ??= '';
$primary ??= false;
$secondary ??= false;
$caret ??= true;
$icon ??= null;

if ($primary) {
    $classes = ['btn-solid', 'theme-primary'];
}
elseif ($secondary) {
    $classes = ['btn-solid', 'theme-secondary'];
}
else {
    $classes = ['btn'];
}
?>
<div class="btn-group">
    <button <?= $attributes->merge(array_filter([
        'class' => implode(' ', $classes),
        'type' => 'button',
        'data-bs-toggle' => 'menu',
        'data-bs-strategy' => 'fixed',
        'aria-expanded' => 'false',
    ])) ?>>
        <?php if ($icon): ?>
            <?= \Larajax\Ui\Facades\Ui::icon($icon) ?>
            <?= e($label) ?>
        <?php else: ?>
            <?= e($label) ?>
        <?php endif ?>
        <?php if ($caret): ?>
            <?= \Larajax\Ui\Facades\Ui::icon('dropdown.caret') ?>
        <?php endif ?>
    </button>
    <div class="menu control-dropdown" role="menu">
        <?= $slot ?>
    </div>
</div>
