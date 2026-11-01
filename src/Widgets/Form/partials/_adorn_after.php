<?php if ($field->hasAdornment()): ?>
    <?php if ((string) $field->suffix !== ''): ?>
        <span class="form-adorn-text">
            <?= e(__($field->suffix)) ?>
        </span>
    <?php endif ?>
    <?php if ($field->suffixIcon): ?>
        <span class="form-adorn-icon" aria-hidden="true">
            <i class="<?= e($field->suffixIcon) ?>"></i>
        </span>
    <?php endif ?>
</<?= $tag ?? 'label' ?>>
<?php endif ?>
