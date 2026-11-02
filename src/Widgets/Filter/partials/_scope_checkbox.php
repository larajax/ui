<?php
    $activeValue = $scope->scopeValue !== null ? $scope->value : null;
?>
<?= $this->makePartial('chip', [
    'scope' => $scope,
    'scopeClass' => 'scope-checkbox',
    'isToggle' => true,
    'active' => (bool) $activeValue,
    'label' => $this->getHeaderValue($scope),
]) ?>
