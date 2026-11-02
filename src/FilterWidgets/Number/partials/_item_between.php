<div class="facet-item">
    <input
        name="Filter[min]"
        type="number"
        value="<?= $scope->scopeValue ? e($scope->min) : '' ?>"
        class="form-control form-control-sm popup-allow-focus w-90"
        autocomplete="off" />
</div>
<div class="facet-item">
    <span><?= __('and') ?></span>
</div>
<div class="facet-item">
    <input
        name="Filter[max]"
        type="number"
        value="<?= $scope->scopeValue ? e($scope->max) : '' ?>"
        class="form-control form-control-sm popup-allow-focus w-90"
        autocomplete="off" />
</div>
