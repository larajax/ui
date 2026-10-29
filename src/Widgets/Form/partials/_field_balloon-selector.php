<?php
    $emptyOption = $field->getConfig('allowEmpty');
    $fieldOptions = $field->options();
    $isLocked = $this->previewMode || $field->disabled || $field->readOnly;
?>
<!-- Balloon selector -->
<div
    id="<?= $field->getId() ?>"
    class="control-balloon-selector <?= $isLocked ? 'control-disabled' : '' ?>"
    data-control="balloon-selector"
    <?= $emptyOption ? 'data-selector-allow-empty' : '' ?>
    <?= $field->getAttributes() ?>
>
    <ul role="radiogroup">
        <?php foreach ($fieldOptions as $value => $text): ?>
            <?php $isSelected = $field->isSelected($value) ?>
            <li
                data-value="<?= e($value) ?>"
                role="radio"
                aria-checked="<?= $isSelected ? 'true' : 'false' ?>"
                <?= $isLocked ? 'aria-disabled="true"' : 'tabindex="0"' ?>
                class="<?= $isSelected ? 'active' : '' ?>"><?= $field->getDisplayValue($text) ?></li>
        <?php endforeach ?>
    </ul>

    <input
        type="hidden"
        name="<?= $field->getName() ?>"
        value="<?= e($field->value) ?>"
    />
</div>
