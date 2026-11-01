<?php
    $emptyOption = $field->getConfig('allowEmpty');
    $fieldOptions = $field->options();
    $isDisabled = $this->previewMode || $field->disabled;
    $isReadOnly = !$isDisabled && $field->readOnly;
?>
<!-- Balloon selector -->
<div
    id="<?= $field->getId() ?>"
    data-control="balloon-selector"
    <?= $emptyOption ? 'data-selector-allow-empty' : '' ?>
    <?= $field->getAttributes() ?>
>
    <input
        type="hidden"
        name="<?= $field->getName() ?>"
        value=""
        <?= $isDisabled ? 'disabled' : '' ?>
    />
    <div
        class="btn-group"
        role="radiogroup"
        <?php if ($field->label): ?>aria-label="<?= e(__($field->label)) ?>"<?php endif ?>
        <?= $isReadOnly ? 'aria-readonly="true"' : '' ?>
    >
        <?php foreach ($fieldOptions as $value => $text): ?>
            <label class="btn-check btn-outline theme-primary">
                <input
                    type="radio"
                    name="<?= $field->getName() ?>"
                    value="<?= e($value) ?>"
                    autocomplete="off"
                    <?= $field->isSelected($value) ? 'checked' : '' ?>
                    <?= $isDisabled ? 'disabled' : '' ?>
                />
                <?= $field->getDisplayValue($text) ?>
            </label>
        <?php endforeach ?>
    </div>
</div>
