<?php
$label ??= '';
$href ??= '';
$icon ??= null;
$hotkey ??= '';

include __DIR__.'/button/_theme.php';

include __DIR__.'/button/_hotkey.php';
?>
<?php if ($href): ?>
    <a
        <?= $attributes->merge(array_filter([
            'href' => $href,
            'class' => implode(' ', $classes),
            'type' => 'button',
            'data-hotkey' => $hotkeyStr ?: null,
            'data-tooltip-text' => $hotkeyStr ? $label : null,
            'data-tooltip-hotkey' => $tooltipHotkey ?: null,
            'data-tooltip-position' => $hotkeyStr ? 'top' : null,
        ])) ?>>
        <?php if ($icon): ?>
            <?= \Larajax\Ui\Facades\Ui::icon($icon) ?>
        <?php endif ?>
        <?= e($label) ?>
    </a>
<?php else: ?>
    <button <?= $attributes->merge(array_filter([
        'class' => implode(' ', $classes),
        'type' => 'button',
        'data-hotkey' => $hotkeyStr ?: null,
        'data-tooltip-text' => $hotkeyStr ? $label : null,
        'data-tooltip-hotkey' => $tooltipHotkey ?: null,
        'data-tooltip-position' => $hotkeyStr ? 'top' : null,
    ])) ?>>
        <?php if ($icon): ?>
            <?= \Larajax\Ui\Facades\Ui::icon($icon) ?>
        <?php endif ?>
        <?= e($label) ?>
    </button>
<?php endif ?>
