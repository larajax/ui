<?php
    $tooltip = is_array($column->tooltip) ? $column->tooltip : ['title' => $column->tooltip];
    $tooltipIsHtml = $tooltip['isHtml'] ?? false;
    $tooltipPlacement = $tooltip['placement'] ?? 'top';
    $tooltipIcon = \Larajax\Ui\Facades\Ui::iconClass($tooltip['icon'] ?? 'tooltip.info');
    $tooltipTitle = $tooltipIsHtml ? $this->getHeaderTooltipValue($column) : e($this->getHeaderTooltipValue($column));
?>
<div class="list-tooltip">
    <i class="<?= e($tooltipIcon) ?>"
        data-bs-toggle="tooltip"
        data-bs-placement="<?= $tooltipPlacement ?>"
        <?= $tooltipIsHtml ? 'data-bs-html="true"' : '' ?>
        data-bs-title="<?= $tooltipTitle ?>"
    ></i>
</div>
