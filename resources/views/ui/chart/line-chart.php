<?php
$datasets ??= [];
$height ??= 250;
$timeMode ??= '';
$zoomable ??= false;
$resetZoomLink ??= '';
$config ??= [];

$heightStyle = is_numeric($height) ? "{$height}px" : (string) $height;
?>
<div <?= $attributes->merge(array_filter([
    'data-control' => 'chart-line',
    'data-zoomable' => $zoomable ? '1' : null,
    'data-reset-zoom-link' => $resetZoomLink !== '' ? $resetZoomLink : null,
    'data-time-mode' => $timeMode !== '' ? $timeMode : null,
    'data-chart-config' => $config ? json_encode($config) : null,
    'style' => "height: {$heightStyle}",
], fn ($value) => $value !== null)) ?>>
    <?php foreach ($datasets as $dataset): ?>
        <span <?= (new \Illuminate\View\ComponentAttributeBag)->merge(array_filter([
            'data-chart' => 'dataset',
            'data-set-name' => $dataset['label'] !== '' ? $dataset['label'] : null,
            'data-set-color' => $dataset['color'],
            'data-set-lines' => $dataset['lines'] ? json_encode($dataset['lines']) : null,
            'data-set-points' => $dataset['points'] ? json_encode($dataset['points']) : null,
            'data-set-data' => implode(',', array_map('json_encode', $dataset['data'])),
        ], fn ($value) => $value !== null)) ?>></span>
    <?php endforeach ?>
</div>
