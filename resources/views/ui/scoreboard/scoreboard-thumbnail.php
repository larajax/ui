<?php
$image ??= '';
$label ??= '';
?>
<div <?= $attributes->merge(['class' => 'scoreboard-item thumbnail-value']) ?>>
    <img src="<?= e($image) ?>" alt="<?= e($label) ?>" />
</div>
