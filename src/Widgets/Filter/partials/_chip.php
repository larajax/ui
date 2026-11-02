<?php
    // A toggle chip shows its state with its own icon, so it has no clear button or value
    $isToggle = $isToggle ?? false;
    $showValue = $active && !$isToggle;
?>
<div class="filter-chip <?= $active ? 'active' : '' ?>">
    <?php if ($showValue): ?>
        <?= $this->makePartial('chip_clear', ['label' => $label]) ?>
    <?php endif ?>
    <<?= $isToggle ? 'button' : 'a' ?>
        <?php if ($isToggle): ?>
            type="button"
            aria-pressed="<?= $active ? 'true' : 'false' ?>"
        <?php else: ?>
            href="javascript:;"
        <?php endif ?>
        class="filter-scope <?= $scopeClass ?? '' ?> <?= $active ? 'active' : '' ?>"
        data-scope-name="<?= e($scope->scopeName) ?>">
        <?php if (!$active): ?>
            <?= \Larajax\Ui\Facades\Ui::icon('filter.add', ['class' => 'filter-chip-icon']) ?>
        <?php elseif ($isToggle): ?>
            <?= \Larajax\Ui\Facades\Ui::icon('filter.yes', ['class' => 'filter-chip-icon filter-mark']) ?>
        <?php endif ?>
        <span class="filter-label"><?= e($label) ?></span>
        <?php if ($showValue): ?>
            <span class="filter-setting" title="<?= e($valueLabel) ?>">
                <?= $valueMark ?? '' ?>
                <span class="filter-value"><?= e($valueLabel) ?></span>
            </span>
        <?php endif ?>
    </<?= $isToggle ? 'button' : 'a' ?>>
</div>
