<?php namespace Larajax\Ui\FilterWidgets;

use Illuminate\Support\Facades\DB as Db;
use Larajax\Ui\Helpers\Sql;
use Illuminate\Support\Facades\Date as DateFacade;
use Larajax\Ui\Classes\FilterWidgetBase;
use Larajax\Ui\Helpers\DateTime as DateTimeHelper;
use Exception;
use Larajax\Ui\Helpers\Input;

/**
 * Date filter
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Date extends FilterWidgetBase
{
    const CONDITION_IN_LAST = 'inLast';
    const CONDITION_IN_NEXT = 'inNext';
    const CONDITION_EQUALS = 'equals';
    const CONDITION_NOT_EQUALS = 'notEquals';
    const CONDITION_BETWEEN = 'between';
    const CONDITION_BEFORE = 'before';
    const CONDITION_AFTER = 'after';

    /**
     * @var array<int, string> units a relative condition counts in
     */
    const UNITS = ['days', 'weeks', 'months', 'years'];

    /**
     * init
     */
    public function init()
    {
        $scope = $this->filterScope;

        if (!$scope->conditions) {
            $scope->conditions = [
                self::CONDITION_IN_LAST => true,
                self::CONDITION_IN_NEXT => true,
                self::CONDITION_EQUALS => true,
                self::CONDITION_BETWEEN => true,
                self::CONDITION_AFTER => true,
                self::CONDITION_BEFORE => true,
                self::CONDITION_EMPTY => true,
                self::CONDITION_NOT_EMPTY => true,
            ];
        }

        if (!$scope->minDate) {
            $scope->minDate = '1970-01-01';
        }

        if (!$scope->maxDate) {
            $scope->maxDate = '2199-12-31';
        }

        if (!$scope->yearRange) {
            $scope->yearRange = 10;
        }

        if ($scope->useTimezone === null) {
            $scope->useTimezone = true;
        }
    }

    /**
     * @inheritDoc
     */
    public function render()
    {
        $this->prepareVars();
        return $this->makePartial('date');
    }

    /**
     * renderForm the form to use for filtering
     */
    public function renderForm()
    {
        $this->prepareVars();
        return $this->makePartial('date_form');
    }

    /**
     * prepareVars for display
     */
    public function prepareVars()
    {
        $this->vars['scope'] = $this->filterScope;
    }

    /**
     * getActiveValueLabel uses the date picker's display values.
     */
    public function getActiveValueLabel(): string
    {
        $scope = $this->filterScope;
        $value = (string) ($scope->valueRaw ?: $scope->value);

        return match ($scope->condition) {
            self::CONDITION_BETWEEN => ($scope->afterRaw ?: $scope->after).' – '.($scope->beforeRaw ?: $scope->before),
            self::CONDITION_IN_LAST, self::CONDITION_IN_NEXT => $this->getRelativeLabel(),
            self::CONDITION_NOT_EQUALS => '≠ '.$value,
            self::CONDITION_AFTER => '≥ '.$value,
            self::CONDITION_BEFORE => '≤ '.$value,
            self::CONDITION_EMPTY => __('Empty'),
            self::CONDITION_NOT_EMPTY => __('Not empty'),
            default => $value,
        };
    }

    /**
     * getRelativeLabel names the period of an in the last or in the next condition, such as Last 7 days.
     */
    protected function getRelativeLabel(): string
    {
        $scope = $this->filterScope;
        $count = (int) $scope->count;
        $isNext = $scope->condition === self::CONDITION_IN_NEXT;

        $choice = match ($scope->unit) {
            'weeks' => $isNext ? 'Next :count week|Next :count weeks' : 'Last :count week|Last :count weeks',
            'months' => $isNext ? 'Next :count month|Next :count months' : 'Last :count month|Last :count months',
            'years' => $isNext ? 'Next :count year|Next :count years' : 'Last :count year|Last :count years',
            default => $isNext ? 'Next :count day|Next :count days' : 'Last :count day|Last :count days',
        };

        return trans_choice($choice, $count, ['count' => $count]);
    }

    /**
     * getUnitOptions returns the units a relative condition counts in, with their labels.
     *
     * @return array<string, string>
     */
    public function getUnitOptions(): array
    {
        return [
            'days' => __('days'),
            'weeks' => __('weeks'),
            'months' => __('months'),
            'years' => __('years'),
        ];
    }

    /**
     * getActiveValue
     */
    public function getActiveValue()
    {
        if (Input::post('clearScope')) {
            return null;
        }

        $value = Input::post('Filter');
        $condition = Input::post('Filter[condition]');

        if ($this->isEmptyCondition($condition)) {
            return ['condition' => $condition];
        }

        // A relative condition keeps its count and unit, so a saved filter moves with the days
        if ($condition === self::CONDITION_IN_LAST || $condition === self::CONDITION_IN_NEXT) {
            $count = (int) Input::post('Filter[count]');
            $unit = Input::post('Filter[unit]');

            if ($count < 1 || !in_array($unit, self::UNITS, true)) {
                return null;
            }

            return ['condition' => $condition, 'count' => min($count, 9999), 'unit' => $unit];
        }

        if ($condition === self::CONDITION_BETWEEN) {
            if (!$this->hasPostValue('beforeRaw') && !$this->hasPostValue('afterRaw')) {
                return null;
            }

            if (!$this->hasPostValue('beforeRaw')) {
                $value['value'] = Input::post('Filter[after]');
                $value['valueRaw'] = Input::post('Filter[afterRaw]');
                $value['condition'] = self::CONDITION_AFTER;
            }
            elseif (!$this->hasPostValue('afterRaw')) {
                $value['value'] = Input::post('Filter[before]');
                $value['valueRaw'] = Input::post('Filter[beforeRaw]');
                $value['condition'] = self::CONDITION_BEFORE;
            }
        }
        else {
            if (!$this->hasPostValue('valueRaw')) {
                return null;
            }
        }

        return $value;
    }

    /**
     * applyScopeToQuery
     */
    public function applyScopeToQuery($query)
    {
        $scope = $this->filterScope;

        // Scope
        if ($scope->modelScope) {
            $scope->applyScopeMethodToQuery($query);
            return;
        }

        // Condition
        $scopeConditions = (array) $scope->conditions;
        $activeCondition = $scope->condition;

        // A relative condition is the range from its first day to its last
        [$after, $before] = $this->isRelativeCondition($activeCondition)
            ? $this->getRelativeDays()
            : [$scope->after, $scope->before];

        // Raw SQL query
        $sqlCondition = $scopeConditions[$activeCondition] ?? null;
        if (is_string($sqlCondition)) {
            // @deprecated adapt legacy format
            $sqlCondition = str_replace(["':filtered'", "':value'", "':valueDate'", "':after'", "':afterDate'", "':before'", "':beforeDate'"], [':value', ':value', ':valueDate', ':after', ':afterDate', ':before', ':beforeDate'], $sqlCondition);

            $query->whereRaw(Sql::parse($sqlCondition, [
                'value' => $this->parseDate($scope->value),
                'valueDate' => $this->parseDate($scope->value, ['isDateOnly' => true]),
                'after' => $this->parseDate($after),
                'afterDate' => $this->parseDate($after, ['isDateOnly' => true]),
                'before' => $this->parseDate($before),
                'beforeDate' => $this->parseDate($before, ['isDateOnly' => true]),
            ]));
            return;
        }

        // Default query, where each picked day counts whole
        if ($activeCondition === self::CONDITION_EMPTY) {
            $query->whereNull($this->valueFrom);
            return;
        }

        if ($activeCondition === self::CONDITION_NOT_EMPTY) {
            $query->whereNotNull($this->valueFrom);
            return;
        }

        if ($activeCondition === self::CONDITION_EQUALS) {
            $query
                ->where($this->valueFrom, '>=', $this->parseDate($scope->value, ['returnObject' => true]))
                ->where($this->valueFrom, '<=', $this->parseDate($scope->value, ['returnObject' => true, 'isEndOfDay' => true]));
            return;
        }

        if ($activeCondition === self::CONDITION_NOT_EQUALS) {
            $query
                ->where(function($query) use ($scope) {
                    $query
                        ->where($this->valueFrom, '>', $this->parseDate($scope->value, ['returnObject' => true, 'isEndOfDay' => true]))
                        ->orWhere($this->valueFrom, '<', $this->parseDate($scope->value, ['returnObject' => true]));
                });
            return;
        }

        if ($activeCondition === self::CONDITION_BETWEEN || $this->isRelativeCondition($activeCondition)) {
            $query
                ->where($this->valueFrom, '>=', $this->parseDate($after, ['returnObject' => true]))
                ->where($this->valueFrom, '<=', $this->parseDate($before, ['returnObject' => true, 'isEndOfDay' => true]));
            return;
        }

        if ($activeCondition === self::CONDITION_AFTER) {
            $query->where($this->valueFrom, '>=', $this->parseDate($scope->value, ['returnObject' => true]));
            return;
        }

        if ($activeCondition === self::CONDITION_BEFORE) {
            $query->where($this->valueFrom, '<=', $this->parseDate($scope->value, ['returnObject' => true, 'isEndOfDay' => true]));
            return;
        }
    }

    /**
     * isRelativeCondition returns true for the conditions that count days back or forward from today.
     */
    protected function isRelativeCondition($condition): bool
    {
        return $condition === self::CONDITION_IN_LAST || $condition === self::CONDITION_IN_NEXT;
    }

    /**
     * getRelativeDays returns the first and last day of a relative condition's period, today included, in the viewer's timezone when the scope uses it.
     *
     * @return array{0: string, 1: string}
     */
    public function getRelativeDays(): array
    {
        $scope = $this->filterScope;
        $timezone = $scope->useTimezone ? DateTimeHelper::userTimezone() : null;
        $today = DateFacade::now($timezone)->startOfDay();
        $count = max(1, (int) $scope->count);
        $sign = $scope->condition === self::CONDITION_IN_NEXT ? 1 : -1;

        $end = match ($scope->unit) {
            'weeks' => $today->copy()->addWeeks($sign * $count),
            'months' => $today->copy()->addMonthsNoOverflow($sign * $count),
            'years' => $today->copy()->addYearsNoOverflow($sign * $count),
            default => $today->copy()->addDays($sign * $count),
        };

        // The period ends a day short, since today is its first or last day
        $days = $sign > 0
            ? [$today, $end->subDay()]
            : [$end->addDay(), $today];

        return [$days[0]->format('Y-m-d'), $days[1]->format('Y-m-d')];
    }

    /**
     * parseDate for SQL
     */
    public function parseDate($value, array $options = [])
    {
        extract(array_merge([
            'isDateOnly' => false,
            'isEndOfDay' => false,
            'returnObject' => false,
        ], $options));

        // Picked dates are days in the viewer's timezone
        $timezone = $this->filterScope->useTimezone ? DateTimeHelper::userTimezone() : null;

        try {
            if (is_int($value)) {
                $date = DateFacade::createFromTimestamp($value);
            }
            elseif (strtolower($value) === 'now') {
                $date = DateFacade::now($timezone)->startOfDay();
            }
            else {
                $date = DateFacade::parse($value, $timezone);
            }

            if ($isEndOfDay) {
                $date = $date->copy()->endOfDay();
            }

            if ($timezone && !$isDateOnly) {
                $date = $date->copy()->setTimezone(DateTimeHelper::appTimezone());
            }

            if ($returnObject) {
                return $date;
            }

            if ($isDateOnly) {
                return $date->format('Y-m-d');
            }

            return $date->format('Y-m-d H:i:s');
        }
        catch (Exception $ex) {
            if ($returnObject) {
                return $value;
            }

            return Db::getPdo()->quote($value);
        }
    }

    /**
     * getConditionLang
     */
    public function getConditionLang($condition)
    {
        switch ($condition) {
            case self::CONDITION_IN_LAST:
                return __('is in the last');

            case self::CONDITION_IN_NEXT:
                return __('is in the next');

            case self::CONDITION_EQUALS:
                return __('is on');

            case self::CONDITION_NOT_EQUALS:
                return __('is not on');

            case self::CONDITION_BETWEEN:
                return __('is between');

            case self::CONDITION_BEFORE:
                return __('is before or on');

            case self::CONDITION_AFTER:
                return __('is on or after');

            case self::CONDITION_EMPTY:
                return __('is empty');

            case self::CONDITION_NOT_EMPTY:
                return __('is not empty');
        }
    }
}
