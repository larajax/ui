<?php
    $activeCount = $this->getActiveScopeCount($scopes ?? []);
?>
<div
    class="filter-group filter-setup">
    <a href="javascript:;"
        class="filter-action"
        data-bs-toggle="menu"
        aria-expanded="false"
        title="<?= __("Filter Setup") ?>">
        <?= \Larajax\Ui\Facades\Ui::icon('filter.menu') ?>
        <span class="visually-hidden"><?= e(__("Filter Setup")) ?></span>
        <span class="filter-count" data-filter-count <?= $activeCount ? '' : 'hidden' ?>>
            <span data-filter-count-value><?= $activeCount ?></span>
            <span class="visually-hidden"><?= e(__("active")) ?></span>
        </span>
    </a>
    <div class="menu control-dropdown" role="menu" id="<?= $this->getId('setupMenu') ?>">
        <?= $this->makePartial('filter_menu_items') ?>
    </div>
    <?php if ($this->savedFilters): ?>
        <div id="<?= $this->getId('savedForms') ?>" hidden>
            <?= $this->makePartial('saved_filter_forms') ?>
        </div>
    <?php endif ?>
</div>
