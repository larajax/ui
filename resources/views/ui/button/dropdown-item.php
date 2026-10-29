<?php
$label ??= '';
$handler ??= '';
$href ??= '';
$icon ??= null;
?>
<a <?= $attributes->merge(array_filter([
    'class' => 'menu-item',
    'role' => 'menuitem',
    'href' => $href ?: 'javascript:;',
    'data-request' => $handler ?: null,
])) ?>>
    <?php if ($icon): ?>
        <?= \Larajax\Ui\Facades\Ui::icon($icon) ?>
    <?php endif ?>
    <?= e($label) ?>
</a>
