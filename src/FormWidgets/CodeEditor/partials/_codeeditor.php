<?php
    $toolbarButtons = [
        ['command' => 'undo', 'icon' => 'codeeditor.undo', 'label' => __('Undo'), 'hotkey' => 'Ctrl+Z'],
        ['command' => 'redo', 'icon' => 'codeeditor.redo', 'label' => __('Redo'), 'hotkey' => 'Ctrl+Y'],
        '|',
        ['command' => 'search', 'icon' => 'codeeditor.search', 'label' => __('Find'), 'hotkey' => 'Ctrl+F'],
        ['command' => 'replace', 'icon' => 'codeeditor.replace', 'label' => __('Replace'), 'hotkey' => 'Ctrl+H'],
        '|',
        ['command' => 'format', 'icon' => 'codeeditor.format', 'label' => __('Format Code'), 'hotkey' => 'Shift+Alt+F'],
        ['command' => 'wrap', 'icon' => 'codeeditor.wrap', 'label' => __('Word Wrap'), 'hotkey' => 'Alt+Z'],
        '|',
        ['command' => 'fullscreen', 'icon' => 'codeeditor.fullscreen', 'label' => __('Fullscreen'), 'hotkey' => 'Ctrl+Shift+F'],
    ];
?>
<?php if ($this->previewMode): ?>
    <div class="form-control">
        <pre><?= e($value) ?></pre>
    </div>
<?php else: ?>
    <div
        id="<?= $this->getId() ?>"
        class="field-codeeditor size-<?= $size ?> <?= $stretch ? 'is-stretch' : '' ?>"
        data-control="codeeditor"
        data-font-size="<?= e($fontSize) ?>"
        data-word-wrap="<?= e($wordWrap) ?>"
        data-code-folding="<?= e($codeFolding) ?>"
        data-auto-close-tags="<?= $autoClosing ? 'true' : 'false' ?>"
        data-tab-size="<?= e($tabSize) ?>"
        data-theme="<?= e($theme) ?>"
        data-show-invisibles="<?= $showInvisibles ? 'true' : 'false' ?>"
        data-autocompletion="<?= e($autocompletion) ?>"
        data-enable-snippets="<?= $enableSnippets ? 'true' : 'false' ?>"
        data-display-indent-guides="<?= $displayIndentGuides ? 'true' : 'false' ?>"
        data-show-print-margin="<?= $showPrintMargin ? 'true' : 'false' ?>"
        data-highlight-active-line="<?= $highlightActiveLine ? 'true' : 'false' ?>"
        data-use-soft-tabs="<?= $useSoftTabs ? 'true' : 'false' ?>"
        data-show-gutter="<?= $showGutter ? 'true' : 'false' ?>"
        data-read-only="<?= $readOnly ? 'true' : 'false' ?>"
        data-language="<?= e($language) ?>"
        data-margin="<?= e($margin) ?>"
        <?= $this->formField->getAttributes() ?>>
        <div class="editor-toolbar" role="toolbar" aria-label="<?= e(__('Code editor toolbar')) ?>">
            <?php foreach ($toolbarButtons as $button): ?>
                <?php if ($button === '|'): ?>
                    <span class="editor-toolbar-separator" aria-hidden="true"></span>
                <?php else: ?>
                    <button
                        type="button"
                        class="editor-toolbar-button"
                        data-editor-command="<?= $button['command'] ?>"
                        title="<?= e($button['label'].' ('.$button['hotkey'].')') ?>"
                        aria-label="<?= e($button['label']) ?>">
                        <?php if ($button['command'] === 'fullscreen'): ?>
                            <?= \Larajax\Ui\Facades\Ui::icon('codeeditor.fullscreen', ['class' => 'editor-toolbar-icon-enter']) ?>
                            <?= \Larajax\Ui\Facades\Ui::icon('codeeditor.exitFullscreen', ['class' => 'editor-toolbar-icon-exit']) ?>
                        <?php else: ?>
                            <?= \Larajax\Ui\Facades\Ui::icon($button['icon']) ?>
                        <?php endif ?>
                    </button>
                <?php endif ?>
            <?php endforeach ?>
            <span class="editor-toolbar-language" data-editor-language>
                <?= e($language) ?>
            </span>
        </div>
        <textarea name="<?= $name ?>" id="<?= $this->getId('textarea') ?>"><?= e($value) ?></textarea>
    </div>
<?php endif ?>
