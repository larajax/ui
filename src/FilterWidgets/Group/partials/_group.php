<a
    href="javascript:;"
    class="filter-scope <?= $scope->scopeValue ? 'active' : '' ?>"
    data-scope-name="<?= $scope->scopeName ?>"
>
    <span class="filter-label"><?= e($this->getHeaderValue()) ?></span>
    <?php if ($scope->scopeValue): ?>
        <span class="filter-setting"><?= count((array) $scope->value) ?></span>
    <?php endif ?>
    <?= \Larajax\Ui\Facades\Ui::icon('filter.caret', ['class' => 'filter-caret']) ?>
</a>
