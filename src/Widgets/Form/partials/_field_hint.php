<?php
    $hintMode = $field->getConfig('mode');
    $hintComment = '';

    if ($field->comment) {
        $hintComment = $field->commentHtml
            ? '<p>'.trans($field->comment).'</p>'
            : Markdown::parse(e(__($field->comment)));
    }
?>
<?php Ui::callout(
    label: $field->label ? __($field->label) : '',
    comment: $hintComment,
    commentHtml: true,
    success: $hintMode === 'success',
    warning: $hintMode === 'warning',
    danger: $hintMode === 'danger',
)->slot() ?>
    <?php if ($field->path): ?>
        <?php
            $hintVars = [
                'formModel' => $formModel,
                'formField' => $field,
                'formValue' => $field->value,
                'model' => $formModel,
                'field' => $field,
                'value' => $field->value
            ];
        ?>
        <?= str_contains($field->path, '::')
            ? View::make($field->path, $hintVars)->render()
            : $this->controller->makePartial($field->path, $hintVars) ?>
    <?php endif ?>
<?php Ui::end() ?>
