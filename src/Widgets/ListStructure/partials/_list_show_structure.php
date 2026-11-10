<button
    type="button"
    class="list-show-structure"
    data-request="<?= $this->getEventHandler('onShowStructure') ?>"
>
    <?= \Larajax\Ui\Facades\Ui::icon('list.structure') ?>
    <span>
        <?= e($structureLinkLabel) ?>
    </span>
</button>
