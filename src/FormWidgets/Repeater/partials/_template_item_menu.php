<script type="text/template" data-item-menu-template>
    <?php if ($showDuplicate): ?>
        <li role="presentation">
            <a
                data-repeater-duplicate
                role="menuitem"
                href="javascript:;"
                tabindex="-1">
                <?= \Larajax\Ui\Facades\Ui::icon('repeater.duplicate') ?>
                <?= __("Duplicate") ?>
            </a>
        </li>
        <li role="separator" class="divider"></li>
    <?php endif ?>
    <li role="presentation">
        <a
            data-repeater-expand
            role="menuitem"
            href="javascript:;"
            tabindex="-1">
            <?= \Larajax\Ui\Facades\Ui::icon('repeater.expand') ?>
            <?= __("Expand") ?>
        </a>
    </li>
    <li role="presentation">
        <a
            data-repeater-collapse
            role="menuitem"
            href="javascript:;"
            tabindex="-1">
            <?= \Larajax\Ui\Facades\Ui::icon('repeater.collapse') ?>
            <?= __("Collapse") ?>
        </a>
    </li>
    <?php if ($showReorder): ?>
        <li role="presentation">
            <a
                data-repeater-move-up
                role="menuitem"
                href="javascript:;"
                tabindex="-1">
                <?= \Larajax\Ui\Facades\Ui::icon('repeater.move_up') ?>
                <?= __("Move Up") ?>
            </a>
        </li>
        <li role="presentation">
            <a
                data-repeater-move-down
                role="menuitem"
                href="javascript:;"
                tabindex="-1">
                <?= \Larajax\Ui\Facades\Ui::icon('repeater.move_down') ?>
                <?= __("Move Down") ?>
            </a>
        </li>
    <?php endif ?>
    <li role="separator" class="divider"></li>
    <li role="presentation">
        <a
            data-repeater-remove
            role="menuitem"
            href="javascript:;"
            tabindex="-1">
            <?= \Larajax\Ui\Facades\Ui::icon('repeater.remove') ?>
            <?= __("Remove") ?>
        </a>
    </li>
</script>
