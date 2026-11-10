<?php
    // A relative period starts as the last 7 days until one is picked
    $isRelative = $scope->scopeValue && in_array($scope->condition, ['inLast', 'inNext'], true);
    $count = $isRelative ? (int) $scope->count : 7;
    $unit = $isRelative ? $scope->unit : 'days';
?>
<div class="facet-item">
    <input
        type="text"
        inputmode="numeric"
        name="Filter[count]"
        value="<?= $count ?>"
        class="form-control form-control-sm filter-count popup-allow-focus"
        aria-label="<?= e(__('Count')) ?>"
        autocomplete="off"
        data-control="number-input"
        data-min="1"
        data-step="1" />
</div>
<div class="facet-item is-grow">
    <select
        name="Filter[unit]"
        class="form-control form-control-sm custom-select select-no-search"
        aria-label="<?= e(__('Unit')) ?>">
        <?php foreach ($this->getUnitOptions() as $value => $label): ?>
            <option value="<?= $value ?>" <?= $unit === $value ? 'selected="selected"' : '' ?>><?= e($label) ?></option>
        <?php endforeach ?>
    </select>
</div>
