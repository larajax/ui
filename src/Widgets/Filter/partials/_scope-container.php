<div
    class="filter-group <?= e($scope->cssClass) ?>"
    data-filter-order="<?= e($scope->order) ?>"
    id="<?= $scope->getId('group') ?>"><?=
    /* Must be on the same line for :empty selector */
    trim($this->makePartial('scope', ['scope' => $scope]))
?></div>
