<?php
    $numberFormat = $this->getNumberFormat();
    $hasAdornment = $this->hasAdornment();
    $plainValue = $scope->scopeValue ? \Larajax\Ui\Helpers\NumberFormat::toPlainString($scope->{$valueName}) : '';
    $displayValue = $numberFormat ? \Larajax\Ui\Helpers\NumberFormat::format($plainValue, $numberFormat) : $plainValue;
?>
<div class="<?= ($isGrow ?? false) ? 'facet-item is-grow' : 'facet-item' ?>">
    <?php if ($hasAdornment): ?>
        <label class="form-control form-control-sm form-adorn filter-number">
            <?php if ($scope->prefixIcon): ?>
                <span class="form-adorn-icon" aria-hidden="true">
                    <i class="<?= e($scope->prefixIcon) ?>"></i>
                </span>
            <?php endif ?>
            <?php if ((string) $scope->prefix !== ''): ?>
                <span class="form-adorn-text">
                    <?= e(__($scope->prefix)) ?>
                </span>
            <?php endif ?>
    <?php endif ?>
    <input
        type="text"
        inputmode="<?= $numberFormat && $numberFormat['decimals'] === 0 ? 'numeric' : 'decimal' ?>"
        <?php if (!$numberFormat): ?>name="Filter[<?= $valueName ?>]"<?php endif ?>
        value="<?= e($displayValue) ?>"
        class="<?= $hasAdornment ? 'form-ghost' : 'form-control form-control-sm filter-number' ?> popup-allow-focus"
        autocomplete="off"
        data-control="number-input"
        <?php if ($numberFormat): ?>data-number-format="<?= e(json_encode($numberFormat)) ?>"<?php endif ?> />
    <?php if ($numberFormat): ?>
        <input
            type="hidden"
            name="Filter[<?= $valueName ?>]"
            value="<?= e($plainValue) ?>"
            data-number-value />
    <?php endif ?>
    <?php if ($hasAdornment): ?>
            <?php if ((string) $scope->suffix !== ''): ?>
                <span class="form-adorn-text">
                    <?= e(__($scope->suffix)) ?>
                </span>
            <?php endif ?>
            <?php if ($scope->suffixIcon): ?>
                <span class="form-adorn-icon" aria-hidden="true">
                    <i class="<?= e($scope->suffixIcon) ?>"></i>
                </span>
            <?php endif ?>
        </label>
    <?php endif ?>
</div>
