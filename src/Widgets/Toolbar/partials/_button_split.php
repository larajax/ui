<?php
/**
 * Renders a button that runs its own action beside a caret that opens a menu of its
 * items. A checked split button disables both halves until rows are checked.
 */
$args = [
    'label' => $button->label ? __($button->label) : '',
    'icon' => $button->icon ?: '',
    'hotkey' => $button->hotkey ?: '',
    'popup' => (bool) $button->popup,
] + $this->getButtonTheme($button);

if ($button->handler) {
    $args['handler'] = $button->handler;
    $args['requestData'] = $this->getButtonRequestData($button);
}
else {
    $args['href'] = $this->getButtonUrl($button);
}

$toggleAttributes = [];

if ($button->checked) {
    $toggleAttributes['data-list-checked-trigger'] = $button->checked === 'single' ? 'single' : 'true';
}

if ($this->isButtonDisabled($button)) {
    $toggleAttributes['disabled'] = true;
}

$args['toggleAttributes'] = $toggleAttributes;
$args += $this->getButtonAttributes($button);
?>
<?php \Larajax\Ui\Facades\Ui::splitButton(...$args)->slot() ?>
    <?php foreach ($this->getVisibleItems($button) as $item): ?>
        <?= $this->makePartial('menu_item', ['item' => $item, 'inChecked' => (bool) $button->checked]) ?>
    <?php endforeach ?>
<?php \Larajax\Ui\Facades\Ui::end() ?>
