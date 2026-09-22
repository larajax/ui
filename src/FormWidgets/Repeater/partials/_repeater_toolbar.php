<div class="field-repeater-toolbar">
    <?php if ($useGroups): ?>
        <button
            type="button"
            data-repeater-cmd="add-group"
            data-attach-loading>
            <?= \Larajax\Ui\Facades\Ui::icon('repeater.add') ?>
            <?= e(__($prompt)) ?>
        </button>
    <?php else: ?>
        <button
            type="button"
            data-repeater-cmd="add"
            data-request="<?= $this->getEventHandler('onAddItem') ?>"
            data-attach-loading>
            <?= \Larajax\Ui\Facades\Ui::icon('repeater.add') ?>
            <?= e(__($prompt)) ?>
        </button>
    <?php endif ?>
</div>
