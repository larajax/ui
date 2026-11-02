<?php
    $activeValue = $scope->scopeValue !== null ? (int) $scope->value : 0;
    $active = $activeValue === 1 || $activeValue === 2;
    $label = $this->getHeaderValue($scope);

    // Each state's mark and the words only assistive tech reads, where the second condition is the true one
    $states = [
        0 => ['mark' => '', 'text' => __('Any')],
        2 => ['mark' => \Larajax\Ui\Facades\Ui::icon('filter.yes', ['class' => 'filter-mark']), 'text' => __('Yes')],
        1 => ['mark' => \Larajax\Ui\Facades\Ui::icon('filter.no', ['class' => 'filter-mark']), 'text' => __('No')],
    ];
?>
<div
    class="filter-scope filter-chip scope-switch <?= $active ? 'active' : '' ?>"
    data-scope-name="<?= e($scope->scopeName) ?>">
    <?php if ($active): ?>
        <?= $this->makePartial('chip_clear', ['label' => $label]) ?>
    <?php endif ?>
    <button
        type="button"
        id="<?= $scope->getId() ?>"
        class="combobox-toggle"
        data-bs-toggle="combobox"
        data-bs-strategy="fixed"
        aria-haspopup="listbox"
        aria-expanded="false"
    >
        <?php if (!$active): ?>
            <?= \Larajax\Ui\Facades\Ui::icon('filter.add', ['class' => 'filter-chip-icon']) ?>
        <?php endif ?>
        <span class="filter-label"><?= e($label) ?></span>
        <span class="filter-setting">
            <span aria-hidden="true" data-scope-mark><?= $active ? $states[$activeValue]['mark'] : '' ?></span>
            <span class="combobox-value visually-hidden"><?= $active ? e($states[$activeValue]['text']) : '' ?></span>
        </span>
    </button>
    <div class="menu control-dropdown" role="listbox">
        <?php foreach ($states as $value => $state): ?>
            <?php $isSelected = $value === $activeValue ?>
            <button
                type="button"
                class="menu-item <?= $isSelected ? 'selected' : '' ?>"
                role="option"
                aria-selected="<?= $isSelected ? 'true' : 'false' ?>"
                <?php if ($value): ?>aria-label="<?= e($label.': '.$state['text']) ?>"<?php endif ?>
                data-bs-value="<?= $value ?>"
            >
                <?= $state['mark'] ?>
                <span class="menu-item-content">
                    <?php if ($value): ?>
                        <span class="visually-hidden"><?= e($state['text']) ?></span>
                        <span><?= e($label) ?></span>
                    <?php else: ?>
                        <span><?= e($state['text']) ?></span>
                    <?php endif ?>
                </span>
            </button>
        <?php endforeach ?>
    </div>
</div>
