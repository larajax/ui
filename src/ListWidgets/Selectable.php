<?php namespace Larajax\Ui\ListWidgets;

use Larajax\Ui\Classes\FormField;
use Larajax\Ui\Classes\ListWidgetBase;

/**
 * Selectable renders the label of a stored option, for values picked from a
 * 'dropdown', 'radio', 'selector' or similar form field, with an icon, image or color
 * when the option has one.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Selectable extends ListWidgetBase
{
    /**
     * renderValue renders the option labels of a record's value.
     */
    public function renderValue($record, $value)
    {
        return $this->makePartial('selectable', [
            'fieldOptions' => $this->getFieldOptions($record),
            'column' => $this->column,
            'value' => $value
        ]);
    }

    /**
     * getFieldOptions returns the options of the column: from `options`, a preset, or a
     * model method that may depend on the record.
     */
    protected function getFieldOptions($record): array
    {
        $column = $this->column;

        $fieldOptions = $column->optionsPreset
            ? 'preset:' . $column->optionsPreset
            : ($column->optionsMethod ?: $column->options);

        if (is_array($fieldOptions)) {
            return $fieldOptions;
        }

        $formField = new FormField([
            'fieldName' => $column->columnName,
            'label' => $column->label
        ]);

        $list = $this->getParentList();

        $model = $list->isColumnRelated($column)
            ? app('model.inspector')->makeRelation($list->model, $column->relation)
            : $list->model;

        return $formField->getOptionsFromModel(
            $model,
            $fieldOptions,
            $record
        );
    }
}
