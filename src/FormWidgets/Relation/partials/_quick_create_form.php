<div id="<?= $this->getId('quickCreatePopup') ?>">
    <?= Form::ajax($this->getEventHandler('onQuickCreateRecord'), [
        'data-popup-load-indicator' => true,
        'data-request-success' => "this.dispatchEvent(new CustomEvent('popup:close', { bubbles: true }))",
    ]) ?>
        <input type="hidden" name="_relation_quick_create" value="1" />

        <div class="dialog-header">
            <h4 class="dialog-title">
                <?= e(__($quickCreateTitle)) ?>
            </h4>
            <button type="button" class="btn-close" data-dismiss="popup" aria-label="<?= __("Close") ?>"></button>
        </div>

        <div class="dialog-body">
            <?= $quickCreateFormWidget->render() ?>
        </div>

        <div class="dialog-footer">
            <button type="submit" class="btn-solid theme-primary">
                <?= __("Create") ?>
            </button>
            <span class="button-text">
                <span class="button-separator"><?= __("or") ?></span>
                <a href="javascript:;" class="btn-link p-0" data-dismiss="popup">
                    <?= __("Cancel") ?>
                </a>
            </span>
        </div>
    <?= Form::close() ?>
</div>
