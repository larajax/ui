<?php
    $activeValue = $scope->scopeValue !== null ? $scope->value : null;
    $filterName = $this->getHeaderValue($scope);
    $options = [
        0 => __('Show All'),
        2 => __('Include :filter', ['filter' => $filterName]),
        1 => __('Exclude :filter', ['filter' => $filterName]),
    ];
?>
<div class="filter-box">
    <div class="filter-facet">
        <div class="facet-item is-grow d-flex flex-column gap-2">
            <?php foreach ($options as $value => $label): ?>
                <div class="form-field mb-0">
                    <input
                        class="radio radio-sm"
                        type="radio"
                        id="<?= $scope->getId('value-'.$value) ?>"
                        name="value"
                        value="<?= $value ?>"
                        <?= (int) $activeValue === $value ? 'checked' : '' ?> />
                    <div class="form-field-content">
                        <label for="<?= $scope->getId('value-'.$value) ?>"><?= e($label) ?></label>
                    </div>
                </div>
            <?php endforeach ?>
        </div>
    </div>
    <?= $this->makePartial('popover_buttons') ?>
</div>
