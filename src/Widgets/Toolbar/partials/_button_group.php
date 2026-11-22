<?php
/**
 * Renders the items side by side as one button group.
 */
?>
<?php \Larajax\Ui\Facades\Ui::buttonGroup(...(array) $button->attributes)->slot() ?>
    <?php foreach ($this->getVisibleItems($button) as $item): ?>
        <?= $this->makePartial('button', ['button' => $item]) ?>
    <?php endforeach ?>
<?php \Larajax\Ui\Facades\Ui::end() ?>
