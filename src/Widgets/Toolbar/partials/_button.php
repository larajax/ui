<?php
/**
 * Renders a single toolbar button definition through the Ui factory, dispatched
 * on its configuration: handler+popup → popup button, handler → AJAX button,
 * otherwise a plain (link) button.
 */
$attributes = (array) $button->attributes;

if ($button->confirm) {
    $attributes['data-request-confirm'] = __($button->confirm);
}

// Link the button to the checked rows of the bound list widget
if ($button->checked) {
    $attributes['data-list-checked-trigger'] = true;
    if ($button->handler) {
        $attributes['data-list-checked-request'] = true;
    }
}

$args = [
    'label' => $button->label ? __($button->label) : '',
    'icon' => $button->icon ?: '',
    'primary' => $button->type === 'primary',
    'secondary' => $button->type === 'secondary',
    'danger' => $button->type === 'danger',
    'hotkey' => $button->hotkey ?: '',
];

if ($button->handler) {
    $args['handler'] = $button->handler;
    $args['requestData'] = (array) $button->requestData;
}
elseif ($button->url) {
    $args['href'] = url($button->url);
}

$args += $attributes;
?>
<?php if ($button->handler && $button->popup): ?>
    <?= \Larajax\Ui\Facades\Ui::popupButton(...$args) ?>
<?php elseif ($button->handler): ?>
    <?= \Larajax\Ui\Facades\Ui::ajaxButton(...$args) ?>
<?php else: ?>
    <?= \Larajax\Ui\Facades\Ui::button(...$args) ?>
<?php endif ?>
