<!-- Text -->
<?php if ($this->previewMode): ?>
    <?= $this->makePartial('adorn_before', ['field' => $field, 'tag' => 'span']) ?>
    <span class="<?= $field->hasAdornment() ? 'form-ghost' : 'form-control' ?>"><?= $field->value ? e($field->value) : '&nbsp;' ?></span>
    <?= $this->makePartial('adorn_after', ['field' => $field, 'tag' => 'span']) ?>
<?php else: ?>
    <?= $this->makePartial('adorn_before', ['field' => $field]) ?>
    <input
        type="text"
        name="<?= $field->getName() ?>"
        id="<?= $field->getId() ?>"
        value="<?= e($field->value) ?>"
        placeholder="<?= e(__($field->placeholder)) ?>"
        class="<?= $field->hasAdornment() ? 'form-ghost' : 'form-control' ?>"
        autocomplete="off"
        <?= $field->hasAttribute('maxlength') ? '' : 'maxlength="255"' ?>
        <?= $field->getAttributes() ?>
    />
    <?= $this->makePartial('adorn_after', ['field' => $field]) ?>
<?php endif ?>
