<div
    data-control="groupfilter"
    data-options-handler="<?= $this->getEventHandler('onGetGroupOptions') ?>"
    data-add-icon="<?= e(\Larajax\Ui\Facades\Ui::iconClass('filter.item.add')) ?>"
    data-remove-icon="<?= e(\Larajax\Ui\Facades\Ui::iconClass('filter.item.remove')) ?>"
>
    <input
        type="hidden"
        name="Filter[value]"
        value="<?= $scope->value ? e(json_encode(array_keys((array) $scope->value))) : '' ?>"
        data-groupfilter-datalocker />

    <?php if ($scope->matchMode === 'toggle' || $scope->matchMode === true): ?>
        <div class="filter-mode">
            <label><input type="radio" name="Filter[mode]" value="include" <?= !$scope->mode || $scope->mode === 'include' ? 'checked' : '' ?> /> <?= __("Includes") ?></label>
            <label><input type="radio" name="Filter[mode]" value="exclude" <?= $scope->mode === 'exclude' ? 'checked' : '' ?> /> <?= __("Excludes") ?></label>
        </div>
    <?php else: ?>
        <input type="hidden" name="Filter[mode]" value="<?= $scope->matchMode ?: 'include' ?>">
    <?php endif ?>

    <div class="filter-search loading-indicator-container size-input-text">
        <label class="form-control form-control-sm form-adorn">
            <span class="form-adorn-icon" aria-hidden="true">
                <?= \Larajax\Ui\Facades\Ui::icon('search.icon') ?>
            </span>
            <input
                type="text"
                name="search"
                autocomplete="off"
                placeholder="<?= e(__('Search...')) ?>"
                aria-label="<?= e(__('Search...')) ?>"
                class="filter-search-input form-ghost popup-allow-focus"
                data-request="<?= $this->getEventHandler('onGetGroupOptions') ?>"
                data-load-indicator-opaque
                data-load-indicator
                data-track-input />
        </label>
        <div class="filter-active-items">
            <ul data-groupfilter-active></ul>
        </div>
        <div class="filter-items">
            <ul data-groupfilter-available></ul>
        </div>
        <div class="filter-buttons">
            <button class="btn-solid theme-primary btn-sm" data-filter-action="apply">
                <?= __("Apply") ?>
            </button>
            <div class="flex-grow-1"></div>
            <button class="btn-solid theme-secondary btn-sm" data-filter-action="clear">
                <?= __("Clear") ?>
            </button>
        </div>
    </div>
</div>
