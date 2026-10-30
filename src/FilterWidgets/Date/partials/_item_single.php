<div class="facet-item">
    <div
        data-control="datepicker"
        data-min-date="<?= e($scope->minDate) ?>"
        data-max-date="<?= e($scope->maxDate) ?>"
        <?php if ($scope->firstDay !== null && $scope->firstDay !== ''): ?>data-first-day="<?= e($scope->firstDay) ?>"<?php endif ?>
        data-year-range="<?= e($scope->yearRange) ?>"
        data-show-week-number="<?= $scope->showWeekNumber ? 'true' : 'false' ?>">
        <label class="form-control form-control-sm form-adorn form-adorn-end w-120">
            <span class="form-adorn-icon" aria-hidden="true">
                <?= \Larajax\Ui\Facades\Ui::icon('datepicker.date') ?>
            </span>
            <input
                type="text"
                name="Filter[valueRaw]"
                value="<?= e($scope->valueRaw) ?>"
                class="form-ghost popup-allow-focus"
                autocomplete="off"
                data-datepicker />
        </label>
        <input
            type="hidden"
            name="Filter[value]"
            id="<?= $scope->getId('value') ?>"
            value="<?= e($scope->value) ?>"
            data-datetime-value />
    </div>
</div>
