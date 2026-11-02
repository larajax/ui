<?php
    $activeValue = $scope->scopeValue !== null ? $scope->value : null;
?>
<?= $this->makePartial('chip', [
    'scope' => $scope,
    'scopeClass' => 'scope-switch',
    'active' => (bool) $activeValue,
    'label' => $this->getHeaderValue($scope),
    'valueLabel' => (int) $activeValue === 2 ? __('Include') : __('Exclude'),
]) ?>
<template data-scope-form><?= $this->renderScopeFormElement($scope) ?></template>
