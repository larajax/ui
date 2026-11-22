<?php
/**
 * Renders an item of a menu: a host partial, a divider, a header, a submenu of its own
 * items or a menu item. Items of a checked menu send the checked rows, and a `type`
 * colors the item with its theme class.
 */
$inChecked ??= false;

$attributes = $this->getButtonAttributes($item, $inChecked, false);

if ($item->type && $item->type !== 'default') {
    $attributes['class'] = trim(($attributes['class'] ?? '').' theme-'.$item->type);
}
?>
<?php if ($item->partial): ?>
    <?= $this->controller->makePartial($item->partial, ['button' => $item, 'toolbar' => $this]) ?>
<?php elseif ($item->isDivider()): ?>
    <?= \Larajax\Ui\Facades\Ui::dropdownDivider() ?>
<?php elseif ($item->isHeader()): ?>
    <?= \Larajax\Ui\Facades\Ui::dropdownHeader(label: __($item->header)) ?>
<?php elseif ($item->hasItems()): ?>
    <?php \Larajax\Ui\Facades\Ui::dropdownItem(label: $item->label ? __($item->label) : '', icon: $item->icon ?: '')->slot() ?>
        <?php foreach ($this->getVisibleItems($item) as $child): ?>
            <?= $this->makePartial('menu_item', ['item' => $child, 'inChecked' => $inChecked || $item->checked]) ?>
        <?php endforeach ?>
    <?php \Larajax\Ui\Facades\Ui::end() ?>
<?php else: ?>
    <?= \Larajax\Ui\Facades\Ui::dropdownItem(...[
        'label' => $item->label ? __($item->label) : '',
        'icon' => $item->icon ?: '',
        'handler' => $item->handler ?: '',
        'href' => $item->handler ? '' : $this->getButtonUrl($item),
        'popup' => (bool) $item->popup,
        'requestData' => (array) $item->requestData,
        'hotkey' => $item->hotkey ?: '',
        'selected' => $this->isButtonActive($item),
        'disabled' => $this->isButtonDisabled($item),
    ] + $attributes) ?>
<?php endif ?>
