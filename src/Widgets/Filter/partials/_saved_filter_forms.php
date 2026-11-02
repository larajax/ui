<?php
    // The save and manage forms, which open in a popover from the filter menu button
    $savedSets = $this->getSavedFilterMenu();
?>
<template data-filter-save-form>
    <div class="filter-box">
        <?php /* A new name, or else a saved set to update, where choosing one clears the other */ ?>
        <div class="filter-facet">
            <div class="facet-item is-grow filter-saved-field">
                <label class="form-label" for="<?= $this->getId('savedName') ?>">
                    <?= __('New') ?>
                </label>
                <input
                    type="text"
                    id="<?= $this->getId('savedName') ?>"
                    name="savedFilterName"
                    class="form-control form-control-sm popup-allow-focus"
                    placeholder="<?= e(__('Name')) ?>"
                    maxlength="100"
                    pattern=".*\S.*"
                    required
                    autocomplete="off" />
            </div>
        </div>
        <?php if ($savedSets): ?>
            <div class="filter-facet">
                <div class="facet-item is-grow filter-saved-field">
                    <label class="form-label" for="<?= $this->getId('savedExisting') ?>">
                        <?= __('Existing') ?>
                    </label>
                    <select
                        id="<?= $this->getId('savedExisting') ?>"
                        name="savedFilterExisting"
                        class="form-control form-control-sm custom-select select-no-search">
                        <option value="">
                            <?= __('- Select -') ?>
                        </option>
                        <?php foreach (array_keys($savedSets) as $name): ?>
                            <option value="<?= e($name) ?>">
                                <?= e($name) ?>
                            </option>
                        <?php endforeach ?>
                    </select>
                </div>
            </div>
        <?php endif ?>
        <div class="filter-buttons">
            <div class="flex-grow-1"></div>
            <button
                type="submit"
                class="btn-solid theme-primary btn-sm"
                data-filter-action="save"
                data-label-save="<?= e(__('Save')) ?>"
                data-label-update="<?= e(__('Update')) ?>">
                <?= __('Save') ?>
            </button>
        </div>
    </div>
</template>
<?php if ($savedSets): ?>
    <template data-filter-manage-form>
        <div class="filter-box">
            <ul class="filter-saved-list">
                <?php foreach (array_keys($savedSets) as $name): ?>
                    <li>
                        <span class="filter-saved-name">
                            <?= e($name) ?>
                        </span>
                        <button
                            type="button"
                            class="btn-icon"
                            data-filter-action="delete-saved"
                            data-saved-name="<?= e($name) ?>"
                            aria-label="<?= e(__('Delete :name', ['name' => $name])) ?>">
                            <?= \Larajax\Ui\Facades\Ui::icon('filter.delete') ?>
                        </button>
                    </li>
                <?php endforeach ?>
            </ul>
        </div>
    </template>
<?php endif ?>
