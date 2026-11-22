<?php namespace Larajax\Ui\Widgets\Lists;

use Larajax\Ui\Classes\ListColumn;
use Larajax\Ui\Classes\ListWidgetBase;
use Larajax\Ui\Classes\WidgetManager;
use October\Rain\Html\Helper as HtmlHelper;
use Illuminate\Support\Str;

/**
 * HasListWidgets concern
 */
trait HasListWidgets
{
    /**
     * @var ListWidgetBase[] listWidgets collection of the list widgets used in this list,
     * keyed by column name.
     */
    protected $listWidgets = [];

    /**
     * makeListColumnWidget returns the list widget that renders a column, made once for
     * each column, or null when the column type is a built-in type or not a list widget.
     */
    public function makeListColumnWidget(ListColumn $column): ?ListWidgetBase
    {
        if (isset($this->listWidgets[$column->columnName])) {
            return $this->listWidgets[$column->columnName];
        }

        if (method_exists($this, 'eval'. Str::studly((string) $column->type) .'TypeValue')) {
            return null;
        }

        $widgetClass = $this->resolveListWidgetClass($column->type);

        if (!$widgetClass) {
            return null;
        }

        $widgetConfig = $this->makeConfig($column->config);
        $widgetConfig->alias = $this->alias . Str::studly(HtmlHelper::nameToId($column->columnName));
        $widgetConfig->parentList = $this;

        return $this->listWidgets[$column->columnName] = new $widgetClass($this->controller, $column, $widgetConfig);
    }

    /**
     * processListWidgetColumns makes the list widget of each column that has one and binds
     * it to the controller, so its AJAX handlers can be reached.
     */
    protected function processListWidgetColumns(array $columns): void
    {
        foreach ($columns as $column) {
            $this->makeListColumnWidget($column)?->bindToController();
        }
    }

    /**
     * resolveListWidgetClass returns the list widget class registered for a column type,
     * or given as the type, or null when there is none.
     */
    protected function resolveListWidgetClass(?string $type): ?string
    {
        if (!$type) {
            return null;
        }

        $widgetClass = WidgetManager::instance()->resolveListWidget($type);

        if (!class_exists($widgetClass) || !is_subclass_of($widgetClass, ListWidgetBase::class)) {
            return null;
        }

        return $widgetClass;
    }

    /**
     * getListWidgets returns the list widgets made so far, keyed by column name.
     * @return ListWidgetBase[]
     */
    public function getListWidgets(): array
    {
        return $this->listWidgets;
    }

    /**
     * getListWidget returns the list widget of a column, once the list has made it.
     */
    public function getListWidget(string $columnName): ?ListWidgetBase
    {
        return $this->listWidgets[$columnName] ?? null;
    }
}
