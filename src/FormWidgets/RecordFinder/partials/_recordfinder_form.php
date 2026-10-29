<div id="<?= $this->getId('popup') ?>" class="recordfinder-popup">
    <?= Form::open([
        'data-request-parent-form' => "#{$this->getId()}"
    ]) ?>
        <input type="hidden" name="recordfinder_flag" value="1" />

        <div class="dialog-header">
            <h4 class="dialog-title">
                <?= e(__($title)) ?>
            </h4>
            <button type="button" class="btn-close" data-dismiss="popup" aria-label="<?= __("Close") ?>"></button>
        </div>

        <div class="recordfinder-list list-flush">
            <?php if ($searchWidget): ?>
                <?= $searchWidget->render() ?>
            <?php endif ?>
            <?php if ($filterWidget): ?>
                <?= $filterWidget->render() ?>
            <?php endif ?>
            <?= $listWidget->render() ?>
        </div>

        <div class="dialog-footer">
            <button
                type="button"
                class="btn-solid theme-secondary me-auto"
                data-dismiss="popup">
                <?= __("Close") ?>
            </button>
            <?php if ($listWidget->showSetup): ?>
                <button
                    class="btn-solid theme-secondary btn-circle ms-auto"
                    title="<?= __("List Setup") ?>"
                    data-handler="<?= $listWidget->getEventHandler('onLoadSetup') ?>"
                    data-control="popup"
                    type="button">
                        <?= \Larajax\Ui\Facades\Ui::icon('list.setup') ?>
                </button>
            <?php endif ?>
        </div>
    <?= Form::close() ?>
</div>

<script>
    setTimeout(
        function(){ var input = document.querySelector('#<?= $this->getId('popup') ?> input.form-control'); if (input) { input.focus(); } },
        310
    )
</script>
