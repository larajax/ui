<?php
$label ??= '';
$primary ??= false;
$secondary ??= false;
$danger ??= false;
$icon ??= null;
$handler ?? null;
$hotkey ??= '';
$requestData ??= [];

if ($primary) {
    $classes = ['btn-solid', 'theme-primary'];
}
elseif ($secondary) {
    $classes = ['btn-solid', 'theme-secondary'];
}
elseif ($danger) {
    $classes = ['btn-solid', 'theme-danger'];
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
