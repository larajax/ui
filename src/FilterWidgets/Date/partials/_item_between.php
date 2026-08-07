<?php /* Amber uses native date inputs instead of October's Pikaday date picker */ ?>
<div class="facet-item">
    <input
        type="date"
        name="Filter[afterRaw]"
        value="<?= e($scope->afterRaw) ?>"
        class="form-control form-control-sm popup-allow-focus w-120"
        autocomplete="off"
        data-datepicker
        data-datepicker-target="<?= $scope->getId('after') ?>" />
    <input
        type="hidden"
        name="Filter[after]"
        id="<?= $scope->getId('after') ?>"
        value="<?= e($scope->after) ?>"
        />
</div>
<div class="facet-item">
    <span><?= __('and') ?></span>
</div>
<div class="facet-item">
    <input
        type="date"
        name="Filter[beforeRaw]"
        value="<?= e($scope->beforeRaw) ?>"
        class="form-control form-control-sm popup-allow-focus w-120"
        autocomplete="off"
        data-datepicker
        data-datepicker-target="<?= $scope->getId('before') ?>" />
    <input
        type="hidden"
        name="Filter[before]"
        id="<?= $scope->getId('before') ?>"
        value="<?= e($scope->before) ?>"
        />
</div>
