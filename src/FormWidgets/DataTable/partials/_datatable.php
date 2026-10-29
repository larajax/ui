<div
    id="<?= $this->getId() ?>"
    class="field-datatable"
    data-control="datatable"
    data-alias="<?= $this->alias ?>"
    data-columns='<?= e(json_encode($columns)) ?>'
    data-data-locker="#<?= $this->getId('input') ?>"
    data-hot-options='<?= e(json_encode($hotOptions)) ?>'
    data-ajax-columns='<?= e(json_encode($ajaxColumns)) ?>'
    data-column-dependencies='<?= e(json_encode($columnDependencies)) ?>'
    data-preloaded-options='<?= e(json_encode((object) $preloadedOptions)) ?>'
    data-read-only="<?= $readOnly ? 'true' : 'false' ?>"
    data-adding="<?= $adding ? 'true' : 'false' ?>"
    data-deleting="<?= $deleting ? 'true' : 'false' ?>"
    data-require-valid="<?= $requireValid ? 'true' : 'false' ?>"
    data-lang='<?= e(json_encode((object) $lang)) ?>'
>
    <?php if ($toolbar): ?>
    <div class="toolbar" data-table-toolbar>
        <?php if ($adding): ?>
            <button type="button" class="backend-toolbar-button control-button" data-table-add>
                <?= \Larajax\Ui\Facades\Ui::icon('datatable.add') ?>
                <span class="button-label"><?= e(__('Insert Row')) ?></span>
            </button>
        <?php endif ?>
        <?php if ($deleting): ?>
            <button type="button" class="backend-toolbar-button control-button" data-table-delete>
                <?= \Larajax\Ui\Facades\Ui::icon('datatable.delete') ?>
                <span class="button-label"><?= e(__('Delete Row')) ?></span>
            </button>
        <?php endif ?>
        <?php if ($csvExport): ?>
            <button type="button" class="backend-toolbar-button control-button" data-table-export>
                <?= \Larajax\Ui\Facades\Ui::icon('datatable.export') ?>
                <span class="button-label"><?= e(__('Export')) ?></span>
            </button>
        <?php endif ?>
        <?php if ($csvImport): ?>
            <button type="button" class="backend-toolbar-button control-button" data-table-import>
                <?= \Larajax\Ui\Facades\Ui::icon('datatable.import') ?>
                <span class="button-label"><?= e(__('Import')) ?></span>
            </button>
            <input type="file" hidden accept=".csv,text/csv" data-table-import-file />
        <?php endif ?>
        <?php if ($searching): ?>
            <div class="toolbar-search">
                <input type="text" class="form-control" placeholder="<?= e(__('Search...')) ?>" data-table-search>
            </div>
        <?php endif ?>
    </div>
    <?php endif ?>

    <div data-hot-container></div>

    <input type="hidden" id="<?= $this->getId('input') ?>" name="<?= $name ?>" value="<?= e(json_encode($value)) ?>" <?= $disabled ? 'disabled' : '' ?> />
</div>
