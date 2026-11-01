<?php
    $numberFormat = $field->getNumberFormat();
    $plainValue = \Larajax\Ui\Helpers\NumberFormat::toPlainString($field->value);
    $displayValue = $numberFormat ? \Larajax\Ui\Helpers\NumberFormat::format($plainValue, $numberFormat) : $plainValue;
    $isWholeNumber = $numberFormat && $numberFormat['decimals'] !== null
        ? $numberFormat['decimals'] === 0
        : is_numeric($field->step) && fmod((float) $field->step, 1.0) === 0.0;
?>
<!-- Number -->
<?php if ($this->previewMode): ?>
    <?= $this->makePartial('adorn_before', ['field' => $field, 'tag' => 'span']) ?>
    <span
        class="<?= $field->hasAdornment() ? 'form-ghost' : 'form-control' ?>"
        <?php if ($numberFormat): ?>
            data-control="number-input"
            data-number-format="<?= e(json_encode($numberFormat)) ?>"
            data-number-value="<?= e($plainValue) ?>"
        <?php endif ?>
    ><?= strlen($displayValue) ? e($displayValue) : '&nbsp;' ?></span>
    <?= $this->makePartial('adorn_after', ['field' => $field, 'tag' => 'span']) ?>
<?php else: ?>
    <?= $this->makePartial('adorn_before', ['field' => $field]) ?>
    <input
        type="text"
        inputmode="<?= $isWholeNumber ? 'numeric' : 'decimal' ?>"
        <?php if (!$numberFormat): ?>name="<?= $field->getName() ?>"<?php endif ?>
        id="<?= $field->getId() ?>"
        value="<?= e($displayValue) ?>"
        placeholder="<?= e(__($field->placeholder)) ?>"
        class="<?= $field->hasAdornment() ? 'form-ghost' : 'form-control' ?>"
        autocomplete="off"
        data-control="number-input"
        <?= $field->min !== null ? 'data-min="'.e($field->min).'"' : '' ?>
        <?= $field->max !== null ? 'data-max="'.e($field->max).'"' : '' ?>
        <?= $field->step !== null ? 'data-step="'.e($field->step).'"' : '' ?>
        <?php if ($numberFormat): ?>data-number-format="<?= e(json_encode($numberFormat)) ?>"<?php endif ?>
        <?= $field->hasAttribute('maxlength') ? '' : 'maxlength="255"' ?>
        <?= $field->getAttributes() ?>
    />
    <?php if ($numberFormat): ?>
        <input
            type="hidden"
            name="<?= $field->getName() ?>"
            value="<?= e($plainValue) ?>"
            data-number-value
            <?= $field->disabled ? 'disabled' : '' ?>
        />
    <?php endif ?>
    <?= $this->makePartial('adorn_after', ['field' => $field]) ?>
<?php endif ?>
