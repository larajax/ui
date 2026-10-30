<div class="control-search loading-indicator-container size-input-text">
    <div
        id="<?= $this->getId() ?>"
        data-control="search-input"
    >
        <label class="form-control form-adorn is-searchable <?= $cssClasses ?>">
            <span class="form-adorn-icon" aria-hidden="true">
                <?= \Larajax\Ui\Facades\Ui::icon('search.icon') ?>
            </span>
            <input
                placeholder="<?= e($placeholder) ?>"
                type="text"
                name="<?= $this->getName() ?>"
                value="<?= e($value) ?>"
                aria-label="<?= e($placeholder ?: __('Search')) ?>"
                data-request="<?= $this->getEventHandler('onSubmit') ?>"
                <?= !$searchOnEnter ? 'data-track-input' : '' ?>
                data-load-indicator
                data-load-indicator-opaque
                class="form-ghost"
                autocomplete="off"
                data-search-input />
            <button
                class="clear-input-text"
                type="button"
                value=""
                style="display:none"
                aria-label="<?= e(__('Clear')) ?>"
                data-search-clear
            >
                <?= \Larajax\Ui\Facades\Ui::icon('search.clear') ?>
            </button>
        </label>
    </div>
</div>
