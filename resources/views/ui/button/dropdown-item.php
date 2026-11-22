<?php
$label ??= '';
$handler ??= '';
$href ??= '';
$icon ??= null;
$popup ??= false;
$requestData ??= [];
$hotkey ??= '';
$selected ??= false;
$disabled ??= false;

$requestDataStr = $handler && $requestData
    ? json_encode($requestData)
    : null;

include __DIR__.'/_hotkey.php';

$classes = array_filter([
    'menu-item',
    $selected ? 'selected' : null,
    $disabled ? 'disabled' : null,
]);
?>
<?php if (trim($slot) !== ''): ?>
    <div class="submenu">
        <a <?= $attributes->merge(array_filter([
            'class' => implode(' ', $classes),
            'role' => 'menuitem',
            'href' => 'javascript:;',
            'aria-haspopup' => 'true',
            'aria-disabled' => $disabled ? 'true' : null,
        ])) ?>>
            <?php if ($icon): ?>
                <?= \Larajax\Ui\Facades\Ui::icon($icon) ?>
            <?php endif ?>
            <?= e($label) ?>
        </a>
        <div class="menu control-dropdown" role="menu">
            <?= $slot ?>
        </div>
    </div>
<?php else: ?>
    <a <?= $attributes->merge(array_filter([
        'class' => implode(' ', $classes),
        'role' => 'menuitem',
        'href' => $href ?: 'javascript:;',
        'aria-disabled' => $disabled ? 'true' : null,
        'aria-current' => $selected ? 'true' : null,
        'data-request' => $handler && !$popup ? $handler : null,
        'data-control' => $handler && $popup ? 'popup' : null,
        'data-handler' => $handler && $popup ? $handler : null,
        'data-request-data' => $requestDataStr,
        'data-hotkey' => $hotkeyStr ?: null,
    ])) ?>>
        <?php if ($icon): ?>
            <?= \Larajax\Ui\Facades\Ui::icon($icon) ?>
        <?php endif ?>
        <?= e($label) ?>
        <?php if ($tooltipHotkey): ?>
            <kbd class="menu-item-hotkey"><?= e($tooltipHotkey) ?></kbd>
        <?php endif ?>
        <?php if ($selected): ?>
            <?= \Larajax\Ui\Facades\Ui::icon('dropdown.check', ['class' => 'menu-item-check']) ?>
        <?php endif ?>
    </a>
<?php endif ?>
