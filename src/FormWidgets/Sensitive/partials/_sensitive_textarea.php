<div
    data-control="sensitive"
    data-sensitive-clean="true"
    data-display-mode="<?= e($displayMode) ?>"
    data-reveal-handler="<?= $this->getEventHandler('onShowValue') ?>"
    data-icon-show="<?= e(\Larajax\Ui\Facades\Ui::iconClass('sensitive.show')) ?>"
    data-icon-hide="<?= e(\Larajax\Ui\Facades\Ui::iconClass('sensitive.hide')) ?>"
    <?php if ($hideOnTabChange): ?>data-hide-on-tab-change="true"<?php endif ?>
>
    <div class="loading-indicator-container size-form-field">

        <textarea
            class="form-control field-textarea size-<?= $this->formField->size ?>"
            <?php if ($this->previewMode): ?>disabled="disabled"<?php endif ?>
            <?= !$hasValue ? 'style="display: none"' : '' ?>
            data-sensitive-facade
        ><?= str_repeat('&bull;', strlen($hiddenPlaceholder)) ?></textarea>

        <textarea
            name="<?= $this->getFieldName() ?>"
            id="<?= $this->getId() ?>"
            placeholder="<?= e(__($this->formField->placeholder)) ?>"
            class="form-control field-textarea size-<?= $this->formField->size ?>"
            <?php if ($this->previewMode): ?>disabled="disabled"<?php endif ?>
            autocomplete="off"
            <?= $hasValue ? 'style="display: none"' : '' ?>
            data-sensitive-input
        ><?= $hasValue ? $hiddenPlaceholder : '' ?></textarea>

        <div class="mt-2">
            <?php if ($allowCopy): ?>
                <a
                    href="javascript:;"
                    class="input-group-addon btn btn-secondary"
                    data-sensitive-copy>
                    <?= \Larajax\Ui\Facades\Ui::icon('sensitive.copy') ?> <?= __("Copy to Clipboard") ?>
                </a>
            <?php endif ?>
            <a
                href="javascript:;"
                class="input-group-addon btn btn-secondary"
                data-sensitive-toggle>
                <?= \Larajax\Ui\Facades\Ui::icon('sensitive.show', ['data-sensitive-icon' => '']) ?> <?= __("Reveal Contents") ?>
            </a>
        </div>
        <div class="loading-indicator oc-hide" data-sensitive-loader>
            <span class="p-4"></span>
        </div>
    </div>
</div>
