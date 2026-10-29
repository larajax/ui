<!-- Rich Editor -->
<?php if ($this->previewMode): ?>
    <div class="form-control"><?= $safeMode ? Html::clean((string) $value) : $value ?></div>
<?php else: ?>
    <div
        id="<?= $this->getId() ?>"
        class="field-richeditor size-<?= $size ?> <?= $stretch ? 'is-stretch' : '' ?>"
        <?php if ($useLineBreaks): ?>data-use-line-breaks="true"<?php endif ?>
        <?php if ($readOnly): ?>data-read-only="true"<?php endif ?>
        <?php if ($toolbarButtons): ?>data-toolbar-buttons="<?= e(implode(',', $toolbarButtons)) ?>"<?php endif ?>
        <?php if (isset($editorOptions)): ?>data-editor-options="<?= e(json_encode($editorOptions)) ?>"<?php endif ?>
        <?php if ($uploadHandler): ?>data-upload-handler="<?= e($uploadHandler) ?>"<?php endif ?>
        data-icons="<?= e(json_encode((object) $icons)) ?>"
        data-lang="<?= e(json_encode((object) $lang)) ?>"
        data-control="richeditor">
            <textarea
                data-richeditor-textarea
                placeholder="<?= e(__($field->placeholder)) ?>"
                name="<?= $name ?>"
                id="<?= $this->getId('textarea') ?>"
                style="display: none"
            ><?= e($value) ?></textarea>
    </div>
<?php endif ?>
