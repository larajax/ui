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
            value="<?= e($scope->valueRaw) ?>"
            class="form-control form-control-sm popup-allow-focus w-120"
            autocomplete="off"
            data-datepicker />
        <input
            type="hidden"
            name="Filter[value]"
            id="<?= $scope->getId('value') ?>"
            value="<?= e($scope->value) ?>"
            data-datetime-value />
    </div>
</div>
