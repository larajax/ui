<?php if ($field->hasAdornment()): ?>
<<?= $tag ?? 'label' ?> class="form-control form-adorn">
    <?php if ($field->prefixIcon): ?>
        <span class="form-adorn-icon" aria-hidden="true">
            <i class="<?= e($field->prefixIcon) ?>"></i>
        </span>
    <?php endif ?>
    <?php if ((string) $field->prefix !== ''): ?>
        <span class="form-adorn-text">
            <?= e(__($field->prefix)) ?>
        </span>
    <?php endif ?>
<?php endif ?>
