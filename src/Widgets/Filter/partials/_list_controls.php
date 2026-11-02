<?php if ($search || $setupHandler): ?>
    <div class="filter-list-controls">
        <?php if ($search): ?>
            <div class="filter-search">
                <?= $search ?>
            </div>
        <?php endif ?>
        <?php if ($setupHandler): ?>
            <a href="javascript:;"
                class="filter-action filter-list-setup"
                title="<?= e(__('List Setup')) ?>"
                aria-label="<?= e(__('List Setup')) ?>"
                data-control="popup"
                data-handler="<?= e($setupHandler) ?>"><?= \Larajax\Ui\Facades\Ui::icon('list.setup') ?></a>
        <?php endif ?>
    </div>
<?php endif ?>
