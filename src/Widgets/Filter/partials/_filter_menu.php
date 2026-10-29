<div
    class="filter-group filter-setup">
    <a href="javascript:;"
        data-bs-toggle="menu"
        aria-expanded="false"
        title="<?= __("Filter Setup") ?>">
        <span><?= \Larajax\Ui\Facades\Ui::icon('filter.menu') ?></span>
    </a>
    <div class="menu control-dropdown" role="menu">
        <a
            data-filter-clear
            class="menu-item"
            role="menuitem"
            href="javascript:;"
            data-request="<?= $this->getEventHandler('onFilterClearAll') ?>"
            data-stripe-load-indicator
            tabindex="-1">
            <?= \Larajax\Ui\Facades\Ui::icon('filter.clear') ?>
            <?= __("Clear Filters") ?>
        </a>
    </div>
</div>
