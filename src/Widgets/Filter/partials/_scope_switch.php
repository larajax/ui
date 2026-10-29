<?php
    $activeValue = $scope->scopeValue !== null ? $scope->value : $scope->default;
?>
<div
    class="filter-scope form-field is-indeterminate"
    data-scope-name="<?= $scope->scopeName ?>">
    <input class="check check-sm" type="checkbox" id="<?= $scope->getId() ?>" data-checked="<?= $activeValue ?: '0' ?>" />
    <label for="<?= $scope->getId() ?>">
        <?= e($this->getHeaderValue($scope)) ?>
    </label>
</div>
