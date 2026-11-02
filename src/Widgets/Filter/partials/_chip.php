<?php $isToggle = $isToggle ?? false ?>
<div class="filter-chip <?= $active ? 'active' : '' ?>">
    <?php if ($active): ?>
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
        <?php endif ?>
        <span class="filter-label"><?= e($label) ?></span>
        <?php if ($active): ?>
            <span class="filter-setting" title="<?= e($valueLabel) ?>">
                <span class="filter-value"><?= e($valueLabel) ?></span>
            </span>
        <?php endif ?>
    </<?= $isToggle ? 'button' : 'a' ?>>
</div>
