<?php
    $savedSets = $this->savedFilters ? $this->getSavedFilterMenu() : [];
?>
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
<?php if ($this->savedFilters): ?>
    <hr class="menu-divider">
    <a
        data-filter-save
        class="menu-item"
        role="menuitem"
        href="javascript:;"
        tabindex="-1">
        <?= \Larajax\Ui\Facades\Ui::icon('filter.save') ?>
        <?= __("Save Filters...") ?>
    </a>
    <?php if ($savedSets): ?>
        <div class="submenu">
            <a
                class="menu-item"
                role="menuitem"
                href="javascript:;"
                aria-haspopup="true"
                aria-expanded="false"
                tabindex="-1">
                <?= \Larajax\Ui\Facades\Ui::icon('filter.saved') ?>
                <?= __("Saved Filters") ?>
            </a>
            <div class="menu control-dropdown" role="menu">
                <?php foreach ($savedSets as $name => $isActive): ?>
                    <a
                        data-filter-saved="<?= e($name) ?>"
                        class="menu-item"
                        role="menuitemradio"
                        aria-checked="<?= $isActive ? 'true' : 'false' ?>"
                        href="javascript:;"
                        tabindex="-1">
                        <?= \Larajax\Ui\Facades\Ui::icon('filter.yes', ['class' => 'filter-mark'.($isActive ? '' : ' invisible')]) ?>
                        <?= e($name) ?>
                    </a>
                <?php endforeach ?>
                <hr class="menu-divider">
                <a
                    data-filter-manage-saved
                    class="menu-item"
                    role="menuitem"
                    href="javascript:;"
                    tabindex="-1">
                    <?= \Larajax\Ui\Facades\Ui::icon('filter.delete') ?>
                    <?= __("Manage...") ?>
                </a>
            </div>
        </div>
    <?php endif ?>
<?php endif ?>
