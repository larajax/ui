<?php
    // A label named like a language file, such as "Validation", translates to the whole file, so it stays as written
    $transLabel = function ($label) {
        $translated = __($label);

        return is_string($translated) ? $translated : (string) $label;
    };

    $activeValue = $scope->scopeValue !== null ? $scope->value : null;
    $activeKey = $activeValue === null || $activeValue === '' ? '' : (string) $activeValue;
    $flatOptions = $scope->options();
    if ($scope->emptyOption) {
        $flatOptions = ['' => $transLabel($scope->emptyOption)] + $flatOptions;
    }
    elseif (!array_key_exists('', $flatOptions)) {
        $flatOptions = ['' => __('All')] + $flatOptions;
    }
    if ($activeKey !== '' && !array_key_exists($activeKey, $flatOptions)) {
        $flatOptions[$activeKey] = $activeValue;
    }
    $scopeOptions = $scope->asOptionsDefinition($flatOptions);
?>
<div
    class="filter-scope scope-tabs nav"
    data-scope-name="<?= e($scope->scopeName) ?>"
    role="group"
    aria-label="<?= e($this->getHeaderValue($scope)) ?>">
    <?php foreach ($scopeOptions as $value => $option): ?>
        <?php $selected = (string) $value === $activeKey ?>
        <button
            type="button"
            class="nav-link <?= $selected ? 'active' : '' ?>"
            data-filter-tab-value="<?= e($value) ?>"
            aria-pressed="<?= $selected ? 'true' : 'false' ?>">
            <?php if ($option->color): ?>
                <span class="status-indicator" style="background: <?= e($option->color) ?>" aria-hidden="true"></span>
            <?php elseif ($option->image): ?>
                <img class="select-image" src="<?= e($option->image) ?>" alt="" />
            <?php elseif ($option->icon): ?>
                <i class="<?= e($option->icon) ?>" aria-hidden="true"></i>
            <?php endif ?>
            <span><?= e($transLabel($option->label)) ?></span>
        </button>
    <?php endforeach ?>
</div>
