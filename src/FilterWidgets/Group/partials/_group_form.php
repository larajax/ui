<div
    data-control="groupfilter"
    data-options-handler="<?= $this->getEventHandler('onGetGroupOptions') ?>"
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

    <div class="filter-search search-input-container loading-indicator-container size-input-text">
        <input
            type="text"
            name="search"
            autocomplete="off"
            placeholder="<?= e(__('Search...')) ?>"
            class="filter-search-input form-control form-control-sm popup-allow-focus"
            data-request="<?= $this->getEventHandler('onGetGroupOptions') ?>"
            data-load-indicator-opaque
            data-load-indicator
            data-track-input />
        <div class="filter-active-items">
            <ul data-groupfilter-active></ul>
        </div>
        <div class="filter-items">
            <ul data-groupfilter-available></ul>
        </div>
        <div class="filter-buttons">
            <button class="btn btn-sm btn-primary" data-filter-action="apply">
                <?= __("Apply") ?>
            </button>
            <div class="flex-grow-1"></div>
            <button class="btn btn-sm btn-secondary" data-filter-action="clear">
                <?= __("Clear") ?>
            </button>
        </div>
    </div>
</div>
