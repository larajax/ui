<?php
    $emptyOption = $scope->emptyOption;
    $activeValue = $scope->scopeValue !== null ? $scope->value : null;
    $active = $activeValue !== null && $activeValue !== '';
    $label = $this->getHeaderValue($scope);
    $flatOptions = $emptyOption ? ['' => __($emptyOption)] + $scope->options() : $scope->options();
    $scopeOptions = $scope->asOptionsDefinition($flatOptions);

    $activeKey = array_key_exists((string) $activeValue, $scopeOptions)
        ? (string) $activeValue
        : null;

    // The colour, image or icon shown before an option's label
    $optionMark = function ($option) {
        if ($option->color) {
            return '<span class="status-indicator" style="background: '.e($option->color).'" aria-hidden="true"></span>';
        }

        if ($option->image) {
            return '<img class="select-image" src="'.e($option->image).'" alt="" />';
        }

        if ($option->icon) {
            return '<i class="'.e($option->icon).'" aria-hidden="true"></i>';
        }

        return '';
    };
?>
<div
    class="filter-scope filter-chip scope-dropdown <?= $active ? 'active' : '' ?>"
    data-scope-name="<?= $scope->scopeName ?>">
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
            <span aria-hidden="true" data-scope-mark><?= $activeKey !== null ? $optionMark($scopeOptions[$activeKey]) : '' ?></span>
            <span class="combobox-value filter-value">
                <?= $activeKey !== null ? e(__($scopeOptions[$activeKey]->label)) : e($activeValue) ?>
            </span>
        </span>
    </button>
    <div class="menu control-dropdown" role="listbox">
        <?php foreach ($scopeOptions as $value => $option): ?>
            <?php $isSelected = (string) $value === $activeKey ?>
            <button
                type="button"
                class="menu-item <?= $isSelected ? 'selected' : '' ?>"
                role="option"
                aria-selected="<?= $isSelected ? 'true' : 'false' ?>"
                data-bs-value="<?= e($value) ?>"
            >
                <?= $optionMark($option) ?>
                <span class="menu-item-content">
                    <span>
                        <?= e(__($option->label)) ?>
                    </span>
                </span>
            </button>
        <?php endforeach ?>
    </div>
</div>
