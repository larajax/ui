<?php
/**
 * Renders a button through the Ui factory: handler+popup → popup button,
 * handler → AJAX button, otherwise a plain (link) button.
 */
$args = [
    'label' => $button->label ? __($button->label) : '',
    'icon' => $button->icon ?: '',
    'hotkey' => $button->hotkey ?: '',
] + $this->getButtonTheme($button);

if ($button->handler) {
    $args['handler'] = $button->handler;
    $args['requestData'] = $this->getButtonRequestData($button);
}
elseif ($button->url) {
    $args['href'] = $this->getButtonUrl($button);
}

$args += $this->getButtonAttributes($button);
?>
<?php if ($button->handler && $button->popup): ?>
    <?= \Larajax\Ui\Facades\Ui::popupButton(...$args) ?>
<?php elseif ($button->handler): ?>
    <?= \Larajax\Ui\Facades\Ui::ajaxButton(...$args) ?>
<?php else: ?>
    <?= \Larajax\Ui\Facades\Ui::button(...$args) ?>
<?php endif ?>
