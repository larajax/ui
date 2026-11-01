<!-- Password -->
<?php if ($this->previewMode): ?>
    <?= $this->makePartial('adorn_before', ['field' => $field, 'tag' => 'span']) ?>
    <div class="<?= $field->hasAdornment() ? 'form-ghost' : 'form-control' ?>">********</div>
    <?= $this->makePartial('adorn_after', ['field' => $field, 'tag' => 'span']) ?>
<?php else: ?>
    <?= $this->makePartial('adorn_before', ['field' => $field]) ?>
    <input
        type="password"
        name="<?= $field->getName() ?>"
        id="<?= $field->getId() ?>"
        value=""
        placeholder="<?= e(__($field->placeholder)) ?>"
        class="<?= $field->hasAdornment() ? 'form-ghost' : 'form-control' ?>"
        autocomplete="off"
        <?= $field->hasAttribute('maxlength') ? '' : 'maxlength="255"' ?>
        <?= $field->getAttributes() ?>
    />
    <?= $this->makePartial('adorn_after', ['field' => $field]) ?>
<?php endif ?>
