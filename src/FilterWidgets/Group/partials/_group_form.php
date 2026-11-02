<div
    class="filter-group-form"
    data-control="groupfilter"
    data-options-handler="<?= $this->getEventHandler('onGetGroupOptions') ?>"
    <?php if (isset($initialOptions)): ?>data-options="<?= e(json_encode($initialOptions)) ?>"<?php endif ?>
    data-add-icon="<?= e(\Larajax\Ui\Facades\Ui::iconClass('filter.item.add')) ?>"
    data-remove-icon="<?= e(\Larajax\Ui\Facades\Ui::iconClass('filter.item.remove')) ?>"
    data-add-label="<?= e(__('Add :name')) ?>"
    data-remove-label="<?= e(__('Remove :name')) ?>"
    role="group"
    aria-label="<?= e($this->getHeaderValue()) ?>"
>
    <input
        type="hidden"
        name="Filter[value]"
        value="<?= $scope->scopeValue && $scope->value ? e(json_encode(array_keys((array) $scope->value))) : '' ?>"
        data-groupfilter-datalocker />

    <div class="filter-group-body">
        <?php if ($scope->matchMode === 'toggle' || $scope->matchMode === true): ?>
            <?php /* Posts exclude while on, and nothing while off, which the group reads as include */ ?>
            <div class="filter-mode form-field mb-0">
                <div class="switch">
                    <input
                        type="checkbox"
                        role="switch"
                        switch
                        id="<?= $scope->getId('mode') ?>"
                        name="Filter[mode]"
                        value="exclude"
                        <?= $scope->mode === 'exclude' ? 'checked' : '' ?> />
                </div>
                <div class="form-field-content">
                    <label for="<?= $scope->getId('mode') ?>"><?= e(__('Exclude selected')) ?></label>
                </div>
            </div>
        <?php else: ?>
            <input type="hidden" name="Filter[mode]" value="<?= $scope->matchMode ?: 'include' ?>">
        <?php endif ?>

        <div class="filter-search loading-indicator-container size-input-text">
            <label class="form-control form-adorn">
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
        </div>
        <div class="filter-active-items">
            <ul data-groupfilter-active aria-label="<?= e(__('Selected options')) ?>"></ul>
        </div>
        <div class="filter-items">
            <ul
                data-groupfilter-available
                data-empty-label="<?= e(__('No available options')) ?>"
                aria-label="<?= e(__('Available options')) ?>"></ul>
        </div>
    </div>

    <div class="filter-buttons">
        <button type="button" class="btn-solid theme-secondary" data-filter-action="clear">
            <?= __('Clear') ?>
        </button>
        <div class="flex-grow-1"></div>
        <button type="button" class="btn-solid theme-primary" data-filter-action="apply">
            <?= __('Apply') ?>
        </button>
    </div>
</div>
