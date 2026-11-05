<?php if ($this->previewMode || $readOnly || $disabled): ?>
    <div class="form-control"><?= $safeMode ? \Larajax\Ui\Helpers\Markdown::parseSafe($value) : \Larajax\Ui\Helpers\Markdown::parse(e($value)) ?></div>
    <?php if (!$this->previewMode && $readOnly && !$disabled): ?>
        <textarea name="<?= $name ?>" id="<?= $this->getId('textarea') ?>" hidden><?= e($value) ?></textarea>
    <?php endif ?>
<?php else: ?>
    <div
        id="<?= $this->getId() ?>"
        class="field-markdowneditor size-<?= $size ?> <?= $stretch ? 'is-stretch' : '' ?>"
        data-control="markdowneditor"
        data-view-mode="<?= e($mode) ?>"
        data-safe-mode="<?= $safeMode ? 'true' : 'false' ?>"
        data-size="<?= e($size) ?>"
        <?php if ($externalToolbar): ?>data-external-toolbar="true"<?php endif ?>
        <?php if ($language): ?>data-language="<?= e($language) ?>"<?php endif ?>
        data-toolbar-buttons="<?= e(json_encode($toolbarButtons)) ?>">
        <textarea
            name="<?= $name ?>"
            id="<?= $this->getId('textarea') ?>"
            placeholder="<?= e(__($this->formField->placeholder)) ?>"
        ><?= e($value) ?></textarea>
    </div>
<?php endif ?>
