<?php
    $toolbarButtons = [
        ['name' => 'bold', 'icon' => 'bold', 'title' => __('Bold')],
        ['name' => 'italic', 'icon' => 'italic', 'title' => __('Italic')],
        ['name' => 'strikethrough', 'icon' => 'strikethrough', 'title' => __('Strikethrough')],
        ['name' => 'heading-1', 'icon' => 'heading1', 'title' => __('Header 1')],
        ['name' => 'heading-2', 'icon' => 'heading2', 'title' => __('Header 2')],
        ['name' => 'heading-3', 'icon' => 'heading3', 'title' => __('Header 3')],
        '|',
        ['name' => 'code', 'icon' => 'codeBlock', 'title' => __('Code')],
        ['name' => 'quote', 'icon' => 'quote', 'title' => __('Quote')],
        ['name' => 'unordered-list', 'icon' => 'unorderedList', 'title' => __('Unordered List')],
        ['name' => 'ordered-list', 'icon' => 'orderedList', 'title' => __('Ordered List')],
        ['name' => 'clean-block', 'icon' => 'cleanBlock', 'title' => __('Clean Block')],
        '|',
        ['name' => 'link', 'icon' => 'link', 'title' => __('Link')],
        ['name' => 'image', 'icon' => 'image', 'title' => __('Image')],
        ['name' => 'table', 'icon' => 'table', 'title' => __('Table')],
        ['name' => 'horizontal-rule', 'icon' => 'horizontalRule', 'title' => __('Insert Horizontal Rule')],
        '|',
        ['name' => 'preview', 'icon' => 'preview', 'title' => __('Preview')],
        ['name' => 'side-by-side', 'icon' => 'sideBySide', 'title' => __('Side by Side')],
        ['name' => 'fullscreen', 'icon' => 'fullscreen', 'title' => __('Full Screen')],
    ];

    $toolbar = array_map(function ($button) {
        if (!is_array($button)) {
            return $button;
        }

        return [
            'name' => $button['name'],
            'title' => $button['title'],
            'icon' => (string) \Larajax\Ui\Facades\Ui::icon('markdowneditor.'.$button['icon'])
        ];
    }, $toolbarButtons);
?>
<?php if ($this->previewMode || $readOnly || $disabled): ?>
    <div class="form-control"><?= $safeMode ? Markdown::parseSafe($value) : Markdown::parse(e($value)) ?></div>
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
        data-toolbar-buttons="<?= e(json_encode($toolbar)) ?>">
        <textarea
            name="<?= $name ?>"
            id="<?= $this->getId('textarea') ?>"
            placeholder="<?= e(__($this->formField->placeholder)) ?>"
        ><?= e($value) ?></textarea>
    </div>
<?php endif ?>
