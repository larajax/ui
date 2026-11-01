<?php
    $emptyOption = $scope->emptyOption;
    $activeValue = $scope->scopeValue !== null ? $scope->value : $scope->default;
    $flatOptions = $emptyOption ? ['' => __($emptyOption)] + $scope->options() : $scope->options();
    $scopeOptions = $scope->asOptionsDefinition($flatOptions);

    // Without a match the first option shows, as a select would show it
    $firstKey = array_key_first($scopeOptions);
    $activeKey = array_key_exists((string) $activeValue, $scopeOptions)
        ? (string) $activeValue
        : ($firstKey === null ? null : (string) $firstKey);

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
    class="filter-scope scope-dropdown"
    data-scope-name="<?= $scope->scopeName ?>">
    <button
        type="button"
        id="<?= $scope->getId() ?>"
        class="combobox-toggle"
        data-bs-toggle="combobox"
        data-bs-strategy="fixed"
        aria-haspopup="listbox"
        aria-expanded="false"
    >
        <span class="visually-hidden">
            <?= e(__($scope->label)) ?>:
        </span>
        <span aria-hidden="true" data-scope-mark><?= $activeKey !== null ? $optionMark($scopeOptions[$activeKey]) : '' ?></span>
        <span class="combobox-value">
            <?= $activeKey !== null ? e(__($scopeOptions[$activeKey]->label)) : '' ?>
        </span>
        <?= \Larajax\Ui\Facades\Ui::icon('filter.caret', ['class' => 'combobox-caret']) ?>
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
