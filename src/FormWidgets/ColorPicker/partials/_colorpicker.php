<?php
    $isLocked = $this->previewMode || $readOnly || $disabled;
?>
<div
    id="<?= $this->getId() ?>"
    class="field-colorpicker <?= $isLocked ? 'disabled' : '' ?>"
    <?php if (!$isLocked): ?>
        data-control="colorpicker"
        data-swatches="<?= e(json_encode($swatches)) ?>"
        <?php if ($swatchesOnly): ?>data-swatches-only="true"<?php endif ?>
        <?php if ($showAlpha): ?>data-show-alpha="true"<?php endif ?>
        <?php if ($allowEmpty): ?>data-allow-empty="true"<?php endif ?>
    <?php endif ?>
    <?= $this->formField->getAttributes() ?>>

    <div class="clr-field" style="color: <?= e($value) ?>">
        <button
            type="button"
            aria-label="<?= e(__("Open Color Picker")) ?>"
            <?= $isLocked ? 'disabled' : '' ?>></button>
        <input
            type="text"
            class="form-control"
            id="<?= $this->getId('input') ?>"
            name="<?= $name ?>"
            value="<?= e($value) ?>"
            autocomplete="off"
            spellcheck="false"
            <?php if (!$isLocked): ?>data-colorpicker-input<?php endif ?>
            <?php if ($this->previewMode || $disabled): ?>disabled<?php elseif ($readOnly): ?>readonly<?php endif ?> />
    </div>
</div>
