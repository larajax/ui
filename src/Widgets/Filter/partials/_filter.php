<div
    id="<?= $this->getId() ?>"
    class="control-filter <?= $cssClasses ?>"
    data-control="filterwidget"
    data-popover-template="#<?= $this->getId('popoverTemplate') ?>"
    data-update-handler="<?= $this->getEventHandler('onFilterUpdate') ?>"
    data-load-handler="<?= $this->getEventHandler('onLoadFilterForm') ?>"
    <?php if ($pageName !== '_page'): ?>data-page-name="<?= $pageName ?>"<?php endif ?>
    <?php if ($listWidgetId): ?>data-list-linkage="<?= e($listWidgetId) ?>"<?php endif ?>
    <?php if ($this->savedFilters): ?>
        data-save-handler="<?= $this->getEventHandler('onSaveFilters') ?>"
        data-apply-saved-handler="<?= $this->getEventHandler('onApplySavedFilters') ?>"
        data-delete-saved-handler="<?= $this->getEventHandler('onDeleteSavedFilters') ?>"
    <?php endif ?>
>
    <?= $this->makePartial('filter-container') ?>
</div>

<!-- Popover Template -->
<?= $this->makePartial('popover_template') ?>
