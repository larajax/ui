<?= $this->getParentFilter()->makePartial('chip', [
    'scope' => $scope,
    'active' => (bool) $scope->scopeValue,
    'label' => $this->getHeaderValue(),
    'valueLabel' => $this->getActiveValueLabel(),
    'valueMark' => $this->getActiveValueMark(),
]) ?>
