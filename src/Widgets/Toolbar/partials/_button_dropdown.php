<?php
/**
 * Renders a button that opens a menu of its items. A checked dropdown waits for checked
 * rows, and its items send them. At the end of the toolbar, the menu lines up with the
 * button's right edge.
 */
$args = [
    'label' => $button->label ? __($button->label) : '',
    'icon' => $button->icon ?: '',
    'caret' => $button->caret ?? true,
] + $this->getButtonTheme($button) + $this->getButtonAttributes($button);

if ($button->align === 'end') {
    $args['data-bs-placement'] ??= 'bottom-end';
}
?>
<?php \Larajax\Ui\Facades\Ui::dropdownButton(...$args)->slot() ?>
    <?php foreach ($this->getVisibleItems($button) as $item): ?>
        <?= $this->makePartial('menu_item', ['item' => $item, 'inChecked' => (bool) $button->checked]) ?>
    <?php endforeach ?>
<?php \Larajax\Ui\Facades\Ui::end() ?>
