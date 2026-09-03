<?php
$label ??= '';
$primary ??= false;
$secondary ??= false;
$caret ??= true;
$icon ??= null;

$classes = ['btn'];
if ($caret) $classes[] = 'dropdown-toggle';
if ($primary) $classes[] = 'btn-primary';
elseif ($secondary) $classes[] = 'btn-secondary';
?>
<div class="dropdown dropdown-fixed">
    <button <?= $attributes->merge(array_filter([
        'class' => implode(' ', $classes),
        'type' => 'button',
        'data-bs-toggle' => 'dropdown',
    ])) ?>>
        <?php if ($icon): ?>
            <?= \Larajax\Ui\Facades\Ui::icon($icon) ?>
            <?= e($label) ?>
        <?php else: ?>
            <?= e($label) ?>
        <?php endif ?>
    </button>
    <ul class="dropdown-menu control-dropdown">
        <?= $slot ?>
    </ul>
</div>
