<?php
$label ??= '';
$handler ??= '';
$href ??= '';
$icon ??= '';
$popup ??= false;
$hotkey ??= '';
$requestData ??= [];
$toggleAttributes ??= [];

include __DIR__.'/_theme.php';

$buttonArgs = [
    'label' => $label,
    'icon' => (string) $icon,
    'hotkey' => $hotkey,
    'primary' => $primary ?? false,
    'secondary' => $secondary ?? false,
    'danger' => $danger ?? false,
    'success' => $success ?? false,
    'warning' => $warning ?? false,
    'info' => $info ?? false,
    'outline' => $outline,
] + $attributes->getAttributes();

$requestArgs = ['handler' => $handler, 'requestData' => $requestData];

$toggleBag = new \Illuminate\View\ComponentAttributeBag($toggleAttributes);
?>
<div class="btn-group split-button">
    <?php if ($handler && $popup): ?>
        <?= \Larajax\Ui\Facades\Ui::popupButton(...$requestArgs, ...$buttonArgs) ?>
    <?php elseif ($handler): ?>
        <?= \Larajax\Ui\Facades\Ui::ajaxButton(...$requestArgs, ...$buttonArgs) ?>
    <?php else: ?>
        <?= \Larajax\Ui\Facades\Ui::button(...['href' => $href], ...$buttonArgs) ?>
    <?php endif ?>
    <button <?= $toggleBag->merge([
        'class' => implode(' ', [...$classes, 'split-toggle']),
        'type' => 'button',
        'title' => __('More options'),
        'aria-label' => __('More options'),
        'data-bs-toggle' => 'menu',
        'data-bs-strategy' => 'fixed',
        'data-bs-placement' => 'bottom-end',
        'aria-expanded' => 'false',
    ]) ?>>
        <?= \Larajax\Ui\Facades\Ui::icon('dropdown.caret') ?>
    </button>
    <div class="menu control-dropdown" role="menu">
        <?= $slot ?>
    </div>
</div>
