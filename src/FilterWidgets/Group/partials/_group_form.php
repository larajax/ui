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

        <?= \Larajax\Ui\Facades\Ui::searchInput(
            name: 'search',
            placeholder: __('Search...'),
            class: 'form-control-sm',
            outerClass: 'filter-search',
            inputClass: 'filter-search-input popup-allow-focus',
            handler: $this->getEventHandler('onGetGroupOptions'),
        ) ?>
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
        <button type="button" class="btn-solid theme-secondary btn-sm" data-filter-action="clear">
            <?= __('Clear') ?>
        </button>
        <div class="flex-grow-1"></div>
        <button type="button" class="btn-solid theme-primary btn-sm" data-filter-action="apply">
            <?= __('Apply') ?>
        </button>
    </div>
</div>
