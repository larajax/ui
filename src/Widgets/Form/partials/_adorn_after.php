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
    <?php if ($field->isRevealable() && !$this->previewMode): ?>
        <button
            type="button"
            class="btn-icon"
            aria-label="<?= e(__('Show password')) ?>"
            aria-pressed="false"
            aria-controls="<?= $field->getId() ?>"
            data-control="password-reveal"
            data-icon-show="<?= e(\Larajax\Ui\Facades\Ui::iconClass('password.show')) ?>"
            data-icon-hide="<?= e(\Larajax\Ui\Facades\Ui::iconClass('password.hide')) ?>"
            <?= $field->disabled || $field->readOnly ? 'disabled' : '' ?>
        >
            <?= \Larajax\Ui\Facades\Ui::icon('password.show', ['data-reveal-icon' => '']) ?>
        </button>
    <?php endif ?>
</<?= $tag ?? 'label' ?>>
<?php endif ?>
