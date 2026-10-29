<script type="text/template" data-item-menu-template>
    <?php if ($showDuplicate): ?>
        <a
            data-repeater-duplicate
            class="menu-item"
            role="menuitem"
            href="javascript:;"
            tabindex="-1">
            <?= \Larajax\Ui\Facades\Ui::icon('repeater.duplicate') ?>
            <?= __("Duplicate") ?>
        </a>
        <hr class="menu-divider">
    <?php endif ?>
    <a
        data-repeater-expand
        class="menu-item"
        role="menuitem"
        href="javascript:;"
        tabindex="-1">
        <?= \Larajax\Ui\Facades\Ui::icon('repeater.expand') ?>
        <?= __("Expand") ?>
    </a>
    <a
        data-repeater-collapse
        class="menu-item"
        role="menuitem"
        href="javascript:;"
        tabindex="-1">
        <?= \Larajax\Ui\Facades\Ui::icon('repeater.collapse') ?>
        <?= __("Collapse") ?>
    </a>
    <?php if ($showReorder): ?>
        <a
            data-repeater-move-up
            class="menu-item"
            role="menuitem"
            href="javascript:;"
            tabindex="-1">
            <?= \Larajax\Ui\Facades\Ui::icon('repeater.move_up') ?>
            <?= __("Move Up") ?>
        </a>
        <a
            data-repeater-move-down
            class="menu-item"
            role="menuitem"
            href="javascript:;"
            tabindex="-1">
            <?= \Larajax\Ui\Facades\Ui::icon('repeater.move_down') ?>
            <?= __("Move Down") ?>
        </a>
    <?php endif ?>
    <hr class="menu-divider">
    <a
        data-repeater-remove
        class="menu-item"
        role="menuitem"
        href="javascript:;"
        tabindex="-1">
        <?= \Larajax\Ui\Facades\Ui::icon('repeater.remove') ?>
        <?= __("Remove") ?>
    </a>
</script>
