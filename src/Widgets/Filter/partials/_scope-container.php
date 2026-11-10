<div
    class="filter-group <?= e($scope->cssClass) ?>"
    id="<?= $scope->getId('group') ?>"><?=
    /* Must be on the same line for :empty selector */
    trim($this->makePartial('scope', ['scope' => $scope]))
?></div>
