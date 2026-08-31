<?php
    $tooltip = is_array($field->tooltip) ? $field->tooltip : ['title' => $field->tooltip];
    $tooltipIsHtml = $tooltip['isHtml'] ?? false;
    $tooltipPlacement = $tooltip['placement'] ?? 'top';
    $tooltipIcon = \Larajax\Ui\Facades\Ui::iconClass($tooltip['icon'] ?? 'tooltip.info');
    $tooltipTitle = $tooltipIsHtml ? $this->getFieldTooltipValue($field) : e($this->getFieldTooltipValue($field));
?>
<span class="field-tooltip">
    <i class="<?= e($tooltipIcon) ?>"
        data-bs-toggle="tooltip"
        data-bs-placement="<?= $tooltipPlacement ?>"
        <?= $tooltipIsHtml ? 'data-bs-html="true"' : '' ?>
        data-bs-title="<?= $tooltipTitle ?>"
    ></i>
</span>
