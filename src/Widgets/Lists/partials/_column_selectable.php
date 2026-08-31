<?php
if (is_array($value)) {
    $selectedValues = array_map(function ($value) use ($fieldOptions) {
        return $fieldOptions[$value] ?? $value;
    }, $value);
}
else {
    $selectedValues = array_key_exists($value, $fieldOptions) ? [$fieldOptions[$value]] :  [];
}

$isComplex = is_array(array_first($selectedValues));
?>
<?php if ($isComplex): ?>
    <?php foreach ($selectedValues as $selectedValue): ?>
        <?php
            $selectedValueIcon = (string) ($selectedValue[1] ?? '');
            $selectedValueIsImage = str_contains($selectedValueIcon, '/') ||
                preg_match('/\.(png|jpe?g|gif|svg|webp)$/i', $selectedValueIcon);
        ?>
        <span class="list-selectable">
            <?php if (Html::isValidColor($selectedValueIcon)): ?>
                <span class="status-indicator" style="background:<?= e($selectedValueIcon) ?>"></span>
            <?php elseif ($selectedValueIsImage): ?>
                <img src="<?= e($selectedValueIcon) ?>" alt="" />
            <?php else: ?>
                <?= \Larajax\Ui\Facades\Ui::icon($selectedValueIcon) ?>
            <?php endif ?>
            <?= $column->getDisplayValue($selectedValue[0]) ?>
        </span>
    <?php endforeach ?>
<?php else: ?>
    <?= e(implode(', ', $column->valueTrans
        ? Arr::trans($selectedValues)
        : $selectedValues
    )) ?>
<?php endif ?>