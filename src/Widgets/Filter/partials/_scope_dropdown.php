<?php
    // A label named like a language file, such as "Validation", translates to the whole file, so it stays as written
    $transLabel = function ($label) {
        $translated = __($label);

        return is_string($translated) ? $translated : (string) $label;
    };

    $emptyOption = $scope->emptyOption;
    $activeValue = $scope->scopeValue !== null ? $scope->value : null;
    $active = $activeValue !== null && $activeValue !== '';
    $label = $this->getHeaderValue($scope);
    $flatOptions = $emptyOption ? ['' => $transLabel($emptyOption)] + $scope->options() : $scope->options();
    $scopeOptions = $scope->asOptionsDefinition($flatOptions);

    $activeKey = array_key_exists((string) $activeValue, $scopeOptions)
        ? (string) $activeValue
        : null;

    // The search box shows when asked for, or with no setting once the list is longer than ten options
    $showSearch = $scope->search === null
        ? count($scopeOptions) > 10
        : (bool) $scope->search;

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
        <?php if ($showSearch): ?>data-bs-search-normalize="true"<?php endif ?>
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
                <?= $activeKey !== null ? e($transLabel($scopeOptions[$activeKey]->label)) : e($activeValue) ?>
            </span>
        </span>
    </button>
    <div class="menu control-dropdown" role="listbox">
        <?php if ($showSearch): ?>
            <?= \Larajax\Ui\Facades\Ui::searchInput(
                placeholder: __('Search...'),
                class: 'form-control-sm',
                outerClass: 'filter-search combobox-search',
                inputClass: 'combobox-search-input',
            ) ?>
        <?php endif ?>
        <div class="combobox-options">
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
                        <?= e($transLabel($option->label)) ?>
                    </span>
                </span>
            </button>
        <?php endforeach ?>
        <?php if ($showSearch): ?>
            <div class="combobox-no-results d-none">
                <?= e(__('No results')) ?>
            </div>
        <?php endif ?>
        </div>
    </div>
</div>
