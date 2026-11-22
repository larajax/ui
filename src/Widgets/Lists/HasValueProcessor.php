<?php namespace Larajax\Ui\Widgets\Lists;

use Illuminate\Support\Str;
use Carbon\Carbon;
use Larajax\Ui\Helpers\DateTime as DateTimeHelper;
use October\Rain\Exception\ApplicationException;

/**
 * HasValueProcessor concern
 */
trait HasValueProcessor
{

    //
    // Value processing
    //

    /**
     * evalCustomListType processes a custom list types registered by plugins and the app.
     */
    protected function evalCustomListType($type, $record, $column, $value)
    {
        $customMessage = '';
        if ($type === 'relation') {
            $customMessage = 'Type: relation is not supported, instead use the relation property to specify a relationship to pull the value from and set the type to the type of the value expected.';
        }

        throw new ApplicationException(sprintf('List column type "%s" could not be found. %s', $type, $customMessage));
    }

    /**
     * evalTextTypeValue as text and escape the value
     * @return string
     */
    protected function evalTextTypeValue($record, $column, $value)
    {
        if (is_array($value) && count($value) === count($value, COUNT_RECURSIVE)) {
            $value = implode(', ', $value);
        }

        if (is_string($column->format) && !empty($column->format)) {
            $value = sprintf($column->format, $value);
        }

        return htmlentities((string) $value, ENT_QUOTES, 'UTF-8', false);
    }

    /**
     * evalNumberTypeValue process as number, proxy to text but uses different styling
     * @return string
     */
    protected function evalNumberTypeValue($record, $column, $value)
    {
        return $this->evalTextTypeValue($record, $column, $value);
    }

    /**
     * evalSummaryTypeValue will limit a value by words
     */
    protected function evalSummaryTypeValue($record, $column, $value)
    {
        $config = $column->config;
        $endChars = isset($config['endChars']) ? $config['endChars'] : '...';
        $limitChars = isset($config['limitChars']) ? $config['limitChars'] : 40;
        $limitWords = isset($config['limitWords']) ? $config['limitWords'] : null;

        // Handle null values
        if ($value === null) {
            return null;
        }

        // Collapse spacing for inline nodes that will get stripped
        // "Welcome <img />, User" should read "Welcome, User"
        $result = $value;
        $result = str_replace(' <', '<', $result);

        // Add natural spacing between HTML nodes
        $result = str_replace("><", '> <', $result);

        // Strip HTML
        $result = $original = trim(app('html')->strip($result));

        // Nothing left
        if (!strlen($result)) {
            return $result;
        }

        // Limit by chars and estimate word count
        if (!$limitWords) {
            $result = Str::limit($result, $limitChars, '');
            $limitWords = substr_count($result, ' ') + 1;
        }

        // Strip HTML, limit to words
        $result = Str::words($result, $limitWords, '');

        // Add end suffix where original differs
        if (mb_strlen($result) !== mb_strlen($original)) {
            $result .= $endChars;
        }

        return $result;
    }

    /**
     * evalDatetimeTypeValue as a datetime value
     */
    protected function evalDatetimeTypeValue($record, $column, $value)
    {
        if ($value === null) {
            return null;
        }

        $dateTime = $this->validateDateTimeValue($value, $column, true);

        if ($column->format !== null) {
            $value = $dateTime->format($column->format);
        }
        else {
            $value = $dateTime->toDayDateTimeString();
        }

        return $value;
    }

    /**
     * evalTimeTypeValue as a time value
     */
    protected function evalTimeTypeValue($record, $column, $value)
    {
        if ($value === null) {
            return null;
        }

        $dateTime = $this->validateDateTimeValue($value, $column, false);

        $format = $column->format ?? 'g:i A';

        $value = $dateTime->format($format);

        return $value;
    }

    /**
     * evalDateTypeValue as a date value
     */
    protected function evalDateTypeValue($record, $column, $value)
    {
        if ($value === null) {
            return null;
        }

        $dateTime = $this->validateDateTimeValue($value, $column, false);

        if ($column->format !== null) {
            $value = $dateTime->format($column->format);
        }
        else {
            $value = $dateTime->toFormattedDateString();
        }

        return $value;
    }

    /**
     * evalTimesinceTypeValue as diff for humans (1 min ago)
     */
    protected function evalTimesinceTypeValue($record, $column, $value)
    {
        if ($value === null) {
            return null;
        }

        $dateTime = $this->validateDateTimeValue($value, $column);

        return DateTimeHelper::timeSince($dateTime);
    }

    /**
     * evalTimetenseTypeValue as time as current tense (Today at 0:00)
     */
    protected function evalTimetenseTypeValue($record, $column, $value)
    {
        if ($value === null) {
            return null;
        }

        $dateTime = $this->validateDateTimeValue($value, $column, true);

        return DateTimeHelper::timeTense($dateTime);
    }

    /**
     * evalPartialTypeValue as partial reference
     */
    protected function evalPartialTypeValue($record, $column, $value)
    {
        return $this->makePartial('column_partial', [
            'record' => $record,
            'column' => $column,
            'value' => $value
        ]);
    }

    /**
     * evalColorPickerTypeValue as background color, to be seen at list
     */
    protected function evalColorPickerTypeValue($record, $column, $value)
    {
        return $this->makePartial('column_colorpicker', [
            'value' => $value
        ]);
    }

    /**
     * validateDateTimeValue column type, converted to the viewer's timezone when the column uses it (`$useTimezone` is the type's default).
     */
    protected function validateDateTimeValue($value, $column, $useTimezone = false)
    {
        $value = DateTimeHelper::makeCarbon($value, false);

        if (!$value instanceof Carbon) {
            throw new ApplicationException(sprintf(
                'List column value "%s" is not a valid date time object.',
                $column->columnName
            ));
        }

        if ($this->getColumnTimezonePreference($column, $useTimezone)) {
            $value = DateTimeHelper::toUserTimezone($value);
        }

        return $value;
    }
}
