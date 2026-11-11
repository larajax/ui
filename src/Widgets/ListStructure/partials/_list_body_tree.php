<?php if ($childCount): ?>
    <div class="nolink">
        <a
            href="javascript:;"
            class="tree-expand-collapse <?= $expanded ? 'is-expanded' : '' ?> nolink"
            data-stripe-load-indicator
            data-request="<?= $this->getEventHandler('onToggleTreeNode') ?>"
            data-request-data="node_id: '<?= $record->getKey() ?>', status: <?= $expanded ? 1 : 0 ?>"
            title="<?= e(__($expanded ? 'Collapse' : 'Expand')) ?>">
            <span><?= \Larajax\Ui\Facades\Ui::icon('list.tree.expand', ['class' => 'tree-icon-expand']) ?><?= \Larajax\Ui\Facades\Ui::icon('list.tree.collapse', ['class' => 'tree-icon-collapse']) ?></span>
        </a>
    </div>
<?php endif ?>
