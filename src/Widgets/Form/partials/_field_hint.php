<?php
    $callout = Ui::callout($field->path ? function () use ($field, $formModel) {
        $vars = [
            'formModel' => $formModel,
            'formField' => $field,
            'formValue' => $field->value,
            'model' => $formModel,
            'field' => $field,
            'value' => $field->value
        ];

        return str_contains($field->path, '::')
            ? View::make($field->path, $vars)->render()
            : $this->controller->makePartial($field->path, $vars);
    } : null);

    if ($field->label) {
        $callout->label(e(__($field->label)));
    }

    if ($field->comment) {
        $callout->commentHtml(
            $field->commentHtml
                ? '<p>'.trans($field->comment).'</p>'
                : Markdown::parse(e(__($field->comment)))
        );
    }

    switch ($field->getConfig('mode')) {
        case 'success':
            $callout->success();
            break;
        case 'danger':
            $callout->danger();
            break;
        case 'warning':
            $callout->warning();
            break;
        case 'tip':
        case 'info':
        default:
            $callout->tip();
            break;
    }
?>
<?= $callout ?>
