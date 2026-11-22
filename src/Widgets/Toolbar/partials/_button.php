<?php
/**
 * Renders a single toolbar button definition, dispatched on its configuration to the
 * partial that draws it: a host partial, a divider, a group, a split button, a dropdown
 * or a plain button.
 */
?>
<?php if ($button->partial): ?>
    <?= $this->controller->makePartial($button->partial, ['button' => $button, 'toolbar' => $this]) ?>
<?php elseif ($button->isDivider()): ?>
    <span class="toolbar-divider"></span>
<?php elseif ($button->isGroup()): ?>
    <?= $this->makePartial('button_group', ['button' => $button]) ?>
<?php elseif ($button->isSplit()): ?>
    <?= $this->makePartial('button_split', ['button' => $button]) ?>
<?php elseif ($button->isDropdown()): ?>
    <?= $this->makePartial('button_dropdown', ['button' => $button]) ?>
<?php else: ?>
    <?= $this->makePartial('button_single', ['button' => $button]) ?>
<?php endif ?>
