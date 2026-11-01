<!-- Number -->
<?php if ($this->previewMode): ?>
    <?= $this->makePartial('adorn_before', ['field' => $field, 'tag' => 'span']) ?>
    <span class="<?= $field->hasAdornment() ? 'form-ghost' : 'form-control' ?>"><?= ($field->value || (string) $field->value === '0') ? e($field->value) : '&nbsp;' ?></span>
    <?= $this->makePartial('adorn_after', ['field' => $field, 'tag' => 'span']) ?>
<?php else: ?>
    <?= $this->makePartial('adorn_before', ['field' => $field]) ?>
    <input
        type="number"
        step="<?= $field->step ?: 'any' ?>"
        name="<?= $field->getName() ?>"
        id="<?= $field->getId() ?>"
        value="<?= e($field->value) ?>"
        placeholder="<?= e(__($field->placeholder)) ?>"
        class="<?= $field->hasAdornment() ? 'form-ghost' : 'form-control' ?> <?= $field->step === null ? 'input-no-spinner' : '' ?>"
        autocomplete="off"
        <?= $field->min !== null ? 'min="' . $field->min . '"' : '' ?>
        <?= $field->max !== null ? 'max="' . $field->max . '"' : '' ?>
        <?= $field->hasAttribute('pattern') ? '' : 'pattern="-?\d+(\.\d+)?"' ?>
        <?= $field->hasAttribute('maxlength') ? '' : 'maxlength="255"' ?>
        <?= $field->getAttributes() ?>
    />
    <?= $this->makePartial('adorn_after', ['field' => $field]) ?>
<?php endif ?>
