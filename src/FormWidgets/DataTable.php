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
        $value = $this->getLoadValue() ?: [];
        $readOnly = $this->isReadOnly();

        $this->vars['name'] = $this->getFieldName();
        $this->vars['value'] = $value;
        $this->vars['columns'] = $this->processedColumns;
        $this->vars['ajaxColumns'] = $this->ajaxColumns;
        $this->vars['columnDependencies'] = $this->columnDependencies;
        $this->vars['preloadedOptions'] = $this->getPreloadedOptions($value);
        $this->vars['hotOptions'] = $this->buildOptions();
        $this->vars['readOnly'] = $readOnly;
        $this->vars['disabled'] = $this->previewMode || $this->formField->disabled;
        $this->vars['adding'] = !$readOnly && $this->getFieldConfig('adding', true);
        $this->vars['deleting'] = !$readOnly && $this->getFieldConfig('deleting', true);
        $this->vars['searching'] = $this->getFieldConfig('searching', false);
        $this->vars['csvExport'] = $this->getFieldConfig('csvExport', false);
        $this->vars['csvImport'] = !$readOnly && $this->getFieldConfig('csvImport', false);
        $this->vars['requireValid'] = !$readOnly && $this->getFieldConfig('requireValid', false);
        $this->vars['lang'] = $this->getTableLang();

        // The toolbar shows only when it holds a button or the search box
        $this->vars['toolbar'] = $this->getFieldConfig('toolbar', true) && (
            $this->vars['adding'] || $this->vars['deleting'] || $this->vars['csvExport'] || $this->vars['csvImport'] || $this->vars['searching']
        );
    }

    /**
     * isReadOnly tells whether the table only shows its rows, in preview mode or when the field is read-only or disabled.
     */
    protected function isReadOnly(): bool
    {
        return $this->previewMode || $this->formField->readOnly || $this->formField->disabled;
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
            'ruleRequired' => 'The value should not be empty.',
            'ruleInteger' => 'The value should be an integer.',
            'rulePositiveInteger' => 'The value should be a positive integer',
            'ruleFloat' => 'The value should be a floating point number.',
            'rulePositiveFloat' => 'The value should be a positive floating point number',
            'ruleMin' => 'The value should not be less than :min',
            'ruleMax' => 'The value should not be more than :max',
            'ruleMinLength' => 'The string should not be shorter than :min',
            'ruleMaxLength' => 'The string should not be longer than :max',
            'ruleRegex' => 'Invalid value format.',
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

        return ['options' => $this->getColumnOptions(is_string($column) ? $column : null, is_array($rowData) ? $rowData : [])];
    }

    /**
     * getColumnOptions asks the model for a column's options given the row's values, through the field's own method or the generic one.
     */
    protected function getColumnOptions(?string $column, array $rowData): mixed
    {
        $methodName = 'get' . studly_case($this->fieldName) . 'DataTableOptions';

        if ($this->objectMethodExists($this->model, $methodName)) {
            return $this->model->$methodName($column, $rowData);
        }

        if ($this->objectMethodExists($this->model, 'getDataTableOptions')) {
            return $this->model->getDataTableOptions($this->fieldName, $column, $rowData);
        }

        return [];
    }

    /**
     * getPreloadedOptions resolves each AJAX column's options once for every set of dependency values in the
     * loaded rows, so saved keys show their labels without a request per row.
     *
     * @return array<string, array<int, array{values: object, options: mixed}>>
     */
    protected function getPreloadedOptions(array $rows): array
    {
        $preloaded = [];

        foreach ($this->ajaxColumns as $columnName) {
            $dependsOn = array_values((array) ($this->columnDependencies[$columnName] ?? []));
            $groups = [];

            foreach ($rows as $row) {
                $rowData = $this->getRowData($row);

                // Rows with no value in the column or what it depends on have nothing to label
                $hasValue = array_filter(array_merge([$columnName], $dependsOn), fn ($key) => !in_array($rowData[$key] ?? null, [null, ''], true));
                if (!$hasValue) {
                    continue;
                }

                $values = [];
                foreach ($dependsOn as $key) {
                    $values[$key] = $rowData[$key] ?? null;
                }

                $groupKey = json_encode(array_values($values));
                if (!isset($groups[$groupKey])) {
                    $groups[$groupKey] = ['values' => (object) $values, 'options' => $this->getColumnOptions($columnName, $rowData)];
                }
            }

            if ($groups) {
                $preloaded[$columnName] = array_values($groups);
            }
        }

        return $preloaded;
    }

    /**
     * getRowData returns a saved row's values for every column, as the control sends them with an options request.
     */
    protected function getRowData(mixed $row): array
    {
        $row = (array) $row;
        $rowData = [];

        foreach ($this->processedColumns as $column) {
            $rowData[$column['data']] = $row[$column['data']] ?? null;
        }

        return $rowData;
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
