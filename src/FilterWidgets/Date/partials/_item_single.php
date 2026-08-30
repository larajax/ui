<?php /* Larajax UI uses a native date input instead of October's Pikaday date picker */ ?>
<div class="facet-item">
    <input
        type="date"
        name="Filter[valueRaw]"
        value="<?= e($scope->valueRaw) ?>"
        class="form-control form-control-sm popup-allow-focus w-120"
        autocomplete="off"
        data-datepicker
        data-datepicker-target="<?= $scope->getId('value') ?>" />
    <input
        type="hidden"
        name="Filter[value]"
        id="<?= $scope->getId('value') ?>"
        value="<?= e($scope->value) ?>"
    />
</div>
