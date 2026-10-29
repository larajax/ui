<?php namespace Larajax\Ui\FormWidgets;

use Lang;
use Response;
use League\Csv\Info as CsvInfo;
use League\Csv\Reader as CsvReader;
use League\Csv\Writer as CsvWriter;
use Larajax\Ui\Classes\FormWidgetBase;

/**
 * DataTable renders a table field.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class DataTable extends FormWidgetBase
{
    //
    // Object Properties
    //

    /**
     * @inheritDoc
     */
    protected $defaultAlias = 'datatable';

    /**
     * @var array Processed columns
     */
    protected $processedColumns = [];

    /**
     * @var array Columns requiring AJAX options
     */
    protected $ajaxColumns = [];

    /**
     * @var array Column dependencies
     */
    protected $columnDependencies = [];

    /**
     * @inheritDoc
     */
    public function init()
    {
        $this->processColumns();
    }

    /**
     * @inheritDoc
     */
    public function render()
    {
        $this->prepareVars();

        return $this->makePartial('datatable');
    }

    /**
     * prepareVars for display
     */
    public function prepareVars()
    {
        $this->vars['name'] = $this->getFieldName();
        $this->vars['value'] = $this->getLoadValue() ?: [];
        $this->vars['columns'] = $this->processedColumns;
        $this->vars['ajaxColumns'] = $this->ajaxColumns;
        $this->vars['columnDependencies'] = $this->columnDependencies;
        $this->vars['hotOptions'] = $this->buildOptions();
        $this->vars['adding'] = $this->getFieldConfig('adding', true);
        $this->vars['deleting'] = $this->getFieldConfig('deleting', true);
        $this->vars['toolbar'] = $this->getFieldConfig('toolbar', true);
        $this->vars['searching'] = $this->getFieldConfig('searching', false);
        $this->vars['csvExport'] = $this->getFieldConfig('csvExport', false);
        $this->vars['csvImport'] = $this->getFieldConfig('csvImport', false);
        $this->vars['requireValid'] = $this->getFieldConfig('requireValid', false);
        $this->vars['lang'] = $this->getTableLang();
    }

    /**
     * getFieldConfig reads an option from the form field config with a fallback
     * to the widget config, supporting standalone makeFormWidget instances.
     */
    protected function getFieldConfig(string $name, $default = null)
    {
        $value = $this->formField->getConfig($name);

        if ($value === null) {
            $value = $this->getConfig($name, $default);
        }

        return $value;
    }

    /**
     * getTableLang returns the translated table strings, keyed like the control's English defaults.
     */
    protected function getTableLang(): array
    {
        $strings = [
            'noData' => 'No data',
            'insertRowAbove' => 'Insert row above',
            'insertRowBelow' => 'Insert row below',
            'removeRow' => 'Remove row',
            'undo' => 'Undo',
            'redo' => 'Redo',
            'freezeColumn' => 'Freeze column',
            'unfreezeColumn' => 'Unfreeze column',
            'invalidValue' => 'The value is not valid.',
            'chooseDate' => 'Choose a date',
            'chooseTime' => 'Choose a time',
        ];

        return array_map(function ($text) {
            $translated = __($text);
            return is_string($translated) ? $translated : $text;
        }, $strings);
    }

    //
    // Column Processing
    //

    /**
     * processColumns processes column definitions into the grid format
     */
    protected function processColumns()
    {
        $columns = $this->getFieldConfig('columns', []);

        foreach ($columns as $columnName => $config) {
            $config = (array) $config;
            $column = $this->buildColumn($columnName, $config);
            $this->processedColumns[] = $column;

            if ($this->columnNeedsAjax($config)) {
                $this->ajaxColumns[] = $columnName;
            }

            if (isset($config['dependsOn'])) {
                $this->columnDependencies[$columnName] = $config['dependsOn'];
            }
        }
    }

    /**
     * buildColumn builds a single column config for the grid
     */
    protected function buildColumn(string $name, array $config): array
    {
        $column = [
            'data' => $name,
            'title' => isset($config['title']) ? Lang::get($config['title']) : $name,
            'readOnly' => $config['readOnly'] ?? false,
        ];

        if (isset($config['width'])) {
            // Percentages stay as given and resolve against the field width, other widths are pixels
            $width = trim((string) $config['width']);
            $column['width'] = str_ends_with($width, '%') ? $width : (int) str_replace('px', '', $width);
        }

        if (!empty($config['ellipsis'])) {
            $column['textEllipsis'] = true;
        }

        if (!empty($config['wrap'])) {
            $column['wordWrap'] = true;
            $column['textEllipsis'] = false;
        }

        $type = $config['type'] ?? 'string';
        $column = array_merge($column, $this->getTypeConfig($type, $config));

        if (isset($config['validation'])) {
            $column['_validation'] = $config['validation'];
        }

        return $column;
    }

    /**
     * getTypeConfig maps DataTable column types to grid cell types
     */
    protected function getTypeConfig(string $type, array $config): array
    {
        switch ($type) {
            case 'checkbox':
                // Checked and unchecked values are stored as the integers 1 and 0.
                return [
                    'type' => 'checkbox',
                    'checkedTemplate' => 1,
                    'uncheckedTemplate' => 0,
                ];

            case 'dropdown':
                // Strict picker: full list always shown, must pick one option.
                $typeConfig = [
                    'type' => 'dropdown',
                    'strict' => true,
                    'filter' => false,
                ];
                if (isset($config['options']) && is_array($config['options'])) {
                    $typeConfig['source'] = $this->buildOptionSource($config['options']);
                }
                return $typeConfig;

            case 'autocomplete':
                // Filter-as-you-type with free-text entry allowed.
                $typeConfig = [
                    'type' => 'autocomplete',
                    'strict' => false,
                    'filter' => true,
                ];
                if (isset($config['options']) && is_array($config['options'])) {
                    $typeConfig['source'] = $this->buildOptionSource($config['options']);
                }
                return $typeConfig;

            case 'date':
                return [
                    'type' => 'date',
                    'dateFormat' => $config['dateFormat'] ?? 'YYYY-MM-DD',
                    'correctFormat' => true,
                ];

            case 'time':
                return [
                    'type' => 'time',
                    'timeFormat' => $config['timeFormat'] ?? 'HH:mm',
                    'correctFormat' => true,
                ];

            case 'numeric':
                return ['type' => 'numeric'];

            default:
                return ['type' => 'text'];
        }
    }

    /**
     * columnNeedsAjax determines if a column needs AJAX-loaded options
     */
    protected function columnNeedsAjax(array $config): bool
    {
        $type = $config['type'] ?? 'string';
        if (!in_array($type, ['dropdown', 'autocomplete'])) {
            return false;
        }

        return !isset($config['options']) || is_string($config['options']);
    }

    /**
     * buildOptionSource converts a YAML {key: label} options map into the grid's {key, value} option source format.
     */
    protected function buildOptionSource(array $options): array
    {
        $source = [];
        foreach ($options as $key => $value) {
            $source[] = ['key' => $key, 'value' => $value];
        }
        return $source;
    }

    /**
     * buildOptions builds the global grid configuration
     */
    protected function buildOptions(): array
    {
        $sorting = $this->getFieldConfig('sorting', false);
        $reorderRows = $this->getFieldConfig('reorderRows', false);
        $reorderColumns = $this->getFieldConfig('reorderColumns', false);
        $searching = $this->getFieldConfig('searching', false);
        $height = $this->getFieldConfig('height', false);
        $placeholder = $this->getFieldConfig('placeholder', false);

        $options = [
            'rowHeaders' => $reorderRows,
            'manualColumnResize' => true,
            'manualRowMove' => $reorderRows,
            'manualColumnMove' => $reorderColumns,
            'manualColumnFreeze' => $reorderColumns,
            'columnSorting' => $sorting,
            'stretchH' => 'fit',
            'wordWrap' => false,
            'textEllipsis' => true,
            'preventOverflow' => 'horizontal',
            'autoWrapRow' => true,
            'autoWrapCol' => true,
            'undo' => true,
            'rowHeights' => 30,
            'height' => $height ?: 'auto',
            'search' => $searching,
        ];

        if ($placeholder) {
            $options['emptyDataState'] = ['message' => ['title' => Lang::get($placeholder)]];
        } else {
            $options['minRows'] = 1;
        }

        if (!$this->getFieldConfig('multiSelect', true)) {
            $options['selectionMode'] = 'single';
            $options['fillHandle'] = false;
        }

        return $options;
    }

    //
    // AJAX Handlers
    //

    /**
     * onGetDropdownOptions handles AJAX requests for dropdown/autocomplete options
     */
    public function onGetDropdownOptions()
    {
        $column = post('column');
        $rowData = post('rowData', []);

        $methodName = 'get' . studly_case($this->fieldName) . 'DataTableOptions';

        if ($this->objectMethodExists($this->model, $methodName)) {
            return ['options' => $this->model->$methodName($column, $rowData)];
        }

        if ($this->objectMethodExists($this->model, 'getDataTableOptions')) {
            return ['options' => $this->model->getDataTableOptions($this->fieldName, $column, $rowData)];
        }

        return ['options' => []];
    }

    /**
     * onExportCsv downloads the posted rows as CSV, with the column titles as the header row
     */
    public function onExportCsv()
    {
        $rows = json_decode(post('tableData'), true) ?: [];

        $csv = CsvWriter::createFromString();
        $csv->setOutputBOM(CsvWriter::BOM_UTF8);
        $csv->insertOne(array_map([$this, 'neutralizeCsvFormula'], array_column($this->processedColumns, 'title')));

        foreach ($rows as $row) {
            $csv->insertOne(array_map(function ($column) use ($row) {
                $value = $row[$column['data']] ?? null;
                return $this->neutralizeCsvFormula(is_array($value) ? json_encode($value) : $value);
            }, $this->processedColumns));
        }

        $fileName = preg_replace('/[^A-Za-z0-9_-]+/', '_', $this->fieldName) ?: 'datatable';

        return Response::make($csv->toString(), 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="'.$fileName.'.csv"',
        ]);
    }

    /**
     * onImportCsv reads posted CSV text into rows keyed by column, matching the header row to column
     * titles or names, or using the column order when the first row is not a header
     */
    public function onImportCsv()
    {
        $reader = CsvReader::createFromString((string) post('csvData'));

        $delimiters = CsvInfo::getDelimiterStats($reader, [',', ';', "\t"], 10);
        arsort($delimiters);
        $reader->setDelimiter((string) array_key_first($delimiters) ?: ',');

        $records = iterator_to_array($reader->getRecords(), false);
        $columnMap = $this->getCsvHeaderColumnMap($records[0] ?? []);

        if ($columnMap) {
            array_shift($records);
        }
        else {
            $columnMap = array_column($this->processedColumns, 'data');
        }

        $rows = [];
        foreach ($records as $record) {
            $row = [];
            foreach ($columnMap as $index => $columnName) {
                $row[$columnName] = $record[$index] ?? null;
            }

            if (array_filter($row, fn ($value) => $value !== null && $value !== '')) {
                $rows[] = $row;
            }
        }

        return ['rows' => $rows];
    }

    /**
     * getCsvHeaderColumnMap maps CSV header positions to column names by title or name,
     * returning an empty array when no header cell matches a column
     */
    protected function getCsvHeaderColumnMap(array $header): array
    {
        $lookup = [];
        foreach ($this->processedColumns as $column) {
            $lookup[mb_strtolower(trim($column['title']))] = $column['data'];
            $lookup[mb_strtolower(trim($column['data']))] = $column['data'];
        }

        $map = [];
        foreach ($header as $index => $cell) {
            $key = mb_strtolower(trim((string) $cell));
            if (isset($lookup[$key])) {
                $map[$index] = $lookup[$key];
            }
        }

        return $map;
    }

    /**
     * neutralizeCsvFormula prepends an apostrophe to values a spreadsheet would read as a formula
     */
    protected function neutralizeCsvFormula($value)
    {
        if (is_string($value) && strlen($value) && in_array($value[0], ['=', '+', '-', '@', "\t", "\r"], true)) {
            return "'" . $value;
        }

        return $value;
    }

    /**
     * objectMethodExists is an internal helper for method existence checks.
     */
    protected function objectMethodExists($object, $method): bool
    {
        if (method_exists($object, 'methodExists')) {
            return $object->methodExists($method);
        }

        return method_exists($object, $method);
    }

    //
    // Data Handling
    //

    /**
     * @inheritDoc
     */
    public function getLoadValue()
    {
        return (array) parent::getLoadValue();
    }

    /**
     * @inheritDoc
     */
    public function getSaveValue($value)
    {
        return json_decode($value, true) ?: [];
    }
}
