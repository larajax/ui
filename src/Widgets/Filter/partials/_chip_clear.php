<button
    type="button"
    class="filter-chip-clear"
    data-filter-clear-scope
    aria-label="<?= e(__('Clear :filter filter', ['filter' => $label])) ?>">
    <?= \Larajax\Ui\Facades\Ui::icon('filter.remove', ['class' => 'filter-chip-icon']) ?>
</button>
