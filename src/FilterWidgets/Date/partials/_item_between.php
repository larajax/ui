<div class="facet-item">
    <div
        data-control="datepicker"
        data-min-date="<?= e($scope->minDate) ?>"
        data-max-date="<?= e($scope->maxDate) ?>"
        data-first-day="<?= e($scope->firstDay) ?>"
        data-year-range="<?= e($scope->yearRange) ?>"
        data-show-week-number="<?= $scope->showWeekNumber ? 'true' : 'false' ?>">
        <input
            type="text"
            value="<?= e($scope->afterRaw) ?>"
            class="form-control form-control-sm popup-allow-focus w-120"
            autocomplete="off"
            data-datepicker />
        <input
            type="hidden"
            name="Filter[after]"
            id="<?= $scope->getId('after') ?>"
            value="<?= e($scope->after) ?>"
            data-datetime-value />
    </div>
</div>
<div class="facet-item">
    <span><?= __('and') ?></span>
</div>
<div class="facet-item">
    <div
        data-control="datepicker"
        data-min-date="<?= e($scope->minDate) ?>"
        data-max-date="<?= e($scope->maxDate) ?>"
        data-first-day="<?= e($scope->firstDay) ?>"
        data-year-range="<?= e($scope->yearRange) ?>"
        data-show-week-number="<?= $scope->showWeekNumber ? 'true' : 'false' ?>">
        <input
            type="text"
            value="<?= e($scope->beforeRaw) ?>"
            class="form-control form-control-sm popup-allow-focus w-120"
            autocomplete="off"
            data-datepicker />
        <input
            type="hidden"
            name="Filter[before]"
            id="<?= $scope->getId('before') ?>"
            value="<?= e($scope->before) ?>"
            data-datetime-value />
    </div>
</div>
