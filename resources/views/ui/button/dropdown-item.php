<?php
$label ??= '';
$handler ??= '';
$href ??= '';
$icon ??= null;
?>
<li>
    <a <?= $attributes->merge(array_filter([
        'href' => $href ?: 'javascript:;',
        'data-request' => $handler ?: null,
    ])) ?>>
        <?php if ($icon): ?>
            <?= \Larajax\Ui\Facades\Ui::icon($icon) ?>
        <?php endif ?>
        <?= e($label) ?>
    </a>
</li>
