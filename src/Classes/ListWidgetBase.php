<?php namespace Larajax\Ui\Classes;

use October\Contracts\Database\AttachmentInterface;

/**
 * ListWidgetBase class contains widgets that render the cells of a list column. A list
 * makes one instance for each column, then calls renderValue() for each row.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
abstract class ListWidgetBase extends WidgetBase
{
    /**
     * @var ListColumn column object containing general column information.
     */
    protected $column;

    /**
     * @var string columnName contains the raw column name
     */
    protected $columnName;

    /**
     * @var \Larajax\Ui\Widgets\Lists parentList that contains this column
     */
    protected $parentList = null;

    /**
     * __construct
     * @param Controller $controller
     * @param ListColumn $column
     * @param array $configuration
     */
    public function __construct($controller, $column, $configuration = [])
    {
        $this->column = $column;
        $this->columnName = $column->columnName;

        $this->controller = $controller;
        $this->config = $configuration;

        $alias = is_object($configuration)
            ? ($configuration->alias ?? null)
            : ($configuration['alias'] ?? null);

        if ($alias) {
            $this->alias = $alias;
        }

        $this->register();

        $this->fillFromConfig([
            'parentList',
        ]);
    }

    /**
     * columnDefaults returns options a column of this type takes unless it sets them,
     * such as `sortable: false` for a column with no value of its own.
     */
    public static function columnDefaults(): array
    {
        return [];
    }

    /**
     * renderValue returns the markup of the cell for a record, given the column value.
     * @param \Illuminate\Database\Eloquent\Model $record
     * @param mixed $value
     * @return string
     */
    abstract public function renderValue($record, $value);

    /**
     * getColumn returns the column this widget renders.
     */
    public function getColumn(): ListColumn
    {
        return $this->column;
    }

    /**
     * getParentList retrieves the list that contains this column.
     * @return \Larajax\Ui\Widgets\Lists|null
     */
    public function getParentList()
    {
        return $this->parentList;
    }

    /**
     * getAttachmentsFromValue returns the file models of a column value holding one file
     * model or a collection of them.
     */
    protected function getAttachmentsFromValue($value): array
    {
        if ($this->isAttachmentValue($value)) {
            return [$value];
        }

        if ($value instanceof \Illuminate\Support\Collection && $value->every(fn ($item) => $this->isAttachmentValue($item))) {
            return $value->all();
        }

        return [];
    }

    /**
     * isAttachmentValue returns true when a value is a file model with the methods of
     * the attachment contract.
     */
    protected function isAttachmentValue($value): bool
    {
        return is_object($value) && app('model.inspector')->isInstanceOf($value, AttachmentInterface::class);
    }
}
