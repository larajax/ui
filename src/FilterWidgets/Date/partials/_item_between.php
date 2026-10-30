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
                name="Filter[afterRaw]"
                value="<?= e($scope->afterRaw) ?>"
                class="form-ghost popup-allow-focus"
                autocomplete="off"
                data-datepicker />
        </label>
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
        <?php if ($scope->firstDay !== null && $scope->firstDay !== ''): ?>data-first-day="<?= e($scope->firstDay) ?>"<?php endif ?>
        data-year-range="<?= e($scope->yearRange) ?>"
        data-show-week-number="<?= $scope->showWeekNumber ? 'true' : 'false' ?>">
        <label class="form-control form-control-sm form-adorn form-adorn-end w-120">
            <span class="form-adorn-icon" aria-hidden="true">
                <?= \Larajax\Ui\Facades\Ui::icon('datepicker.date') ?>
            </span>
            <input
                type="text"
                name="Filter[beforeRaw]"
                value="<?= e($scope->beforeRaw) ?>"
                class="form-ghost popup-allow-focus"
                autocomplete="off"
                data-datepicker />
        </label>
        <input
            type="hidden"
            name="Filter[before]"
            id="<?= $scope->getId('before') ?>"
            value="<?= e($scope->before) ?>"
            data-datetime-value />
    </div>
</div>
