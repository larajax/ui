<?php
    $activeValue = $scope->scopeValue !== null ? $scope->value : null;
?>
<div
    class="filter-scope scope-checkbox form-field"
    data-scope-name="<?= $scope->scopeName ?>">
    <input class="check check-sm" type="checkbox" id="<?= $scope->getId() ?>" <?= $activeValue ? 'checked' : '' ?> />
    <label for="<?= $scope->getId() ?>">
        <?= e($this->getHeaderValue($scope)) ?>
    </label>
</div>
