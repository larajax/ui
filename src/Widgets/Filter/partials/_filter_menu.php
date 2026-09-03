<div
    class="filter-group filter-setup dropdown">
    <a href="javascript:;"
        data-bs-toggle="dropdown"
        title="<?= __("Filter Setup") ?>">
        <span><?= \Larajax\Ui\Facades\Ui::icon('filter.menu') ?></span>
    </a>
    <ul class="dropdown-menu control-dropdown" role="menu">
        <li role="presentation">
            <a
                data-filter-clear
                role="menuitem"
                href="javascript:;"
                data-request="<?= $this->getEventHandler('onFilterClearAll') ?>"
                data-stripe-load-indicator
                tabindex="-1">
                <?= \Larajax\Ui\Facades\Ui::icon('filter.clear') ?>
                <?= __("Clear Filters") ?>
            </a>
        </li>
    </ul>
</div>
