<?php
$label ??= '';
$primary ??= false;
$secondary ??= false;
$danger ??= false;
$outline ??= false;
$icon ??= null;
$handler ?? null;
$hotkey ??= '';
$requestData ??= [];

$variant = $outline ? 'btn-outline' : 'btn-solid';

if ($primary) {
    $classes = [$variant, 'theme-primary'];
}
elseif ($secondary) {
    $classes = [$variant, 'theme-secondary'];
}
elseif ($danger) {
    $classes = [$variant, 'theme-danger'];
}
elseif ($outline) {
    $classes = ['btn-outline', 'theme-secondary'];
}
else {
    $classes = ['btn'];
}

$requestDataStr = $requestData
    ? json_encode($requestData)
    : null;

include __DIR__.'/_hotkey.php';
?>
<button <?= $attributes->merge(array_filter([
    'class' => implode(' ', $classes),
    'type' => 'button',
    'data-request' => $handler,
    'data-request-data' => $requestDataStr,
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
