<?php namespace Larajax\Ui\FilterWidgets;

use Db;
use DbDongle;
use Larajax\Ui\Classes\FilterWidgetBase;
use Larajax\Ui\Helpers\NumberFormat;

/**
 * Number filter
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Number extends FilterWidgetBase
{
    const CONDITION_EQUALS = 'equals';
    const CONDITION_BETWEEN = 'between';
    const CONDITION_GREATER = 'greater';
    const CONDITION_LESSER = 'lesser';

    /**
     * init
     */
    public function init()
    {
        $scope = $this->filterScope;

        if (!$scope->conditions) {
            $scope->conditions = [
                self::CONDITION_EQUALS => true,
                self::CONDITION_BETWEEN => true,
                self::CONDITION_GREATER => true,
                self::CONDITION_LESSER => true
            ];
        }
    }

    /**
     * @inheritDoc
     */
    public function render()
    {
        $this->prepareVars();
        return $this->makePartial('number');
    }

    /**
     * renderForm the form to use for filtering
     */
    public function renderForm()
    {
        $this->prepareVars();
        return $this->makePartial('number_form');
    }

    /**
     * prepareVars for display
     */
    public function prepareVars()
    {
        $this->vars['scope'] = $this->filterScope;
    }

    /**
     * getActiveValueLabel shows the selected number or range.
     */
    public function getActiveValueLabel(): string
    {
        $scope = $this->filterScope;
        if ($scope->condition === self::CONDITION_BETWEEN) {
            return $this->getDisplayValue($scope->min).' – '.$this->getDisplayValue($scope->max);
        }

        $operator = match ($scope->condition) {
            self::CONDITION_GREATER => '≥ ',
            self::CONDITION_LESSER => '≤ ',
            default => '',
        };

        return $operator.$this->getDisplayValue($scope->value);
    }

    /**
     * getNumberFormat returns how the scope shows its numbers, or null when it shows them as typed.
     *
     * @return array{locale: string, decimals: int|null, grouping: bool}|null
     */
    public function getNumberFormat(): ?array
    {
        return NumberFormat::resolve($this->filterScope->format);
    }

    /**
     * hasAdornment returns true when the scope shows text or an icon inside its inputs.
     */
    public function hasAdornment(): bool
    {
        foreach (['prefix', 'suffix', 'prefixIcon', 'suffixIcon'] as $option) {
            if ((string) $this->filterScope->{$option} !== '') {
                return true;
            }
        }

        return false;
    }

    /**
     * getDisplayValue returns a number as the chip shows it, in the scope's format and between its prefix and suffix text.
     */
    public function getDisplayValue(mixed $value): string
    {
        $scope = $this->filterScope;
        $display = NumberFormat::toPlainString($value);

        if ($numberFormat = $this->getNumberFormat()) {
            $display = NumberFormat::format($display, $numberFormat);
        }

        // A word such as USD stands apart from the number, while a symbol such as $ or % joins it
        $prefix = (string) $scope->prefix !== '' ? (string) __($scope->prefix) : '';
        if ($prefix !== '') {
            $display = $prefix.(preg_match('/[\p{L}\p{N}]$/u', $prefix) ? ' ' : '').$display;
        }

        $suffix = (string) $scope->suffix !== '' ? (string) __($scope->suffix) : '';
        if ($suffix !== '') {
            $display .= (preg_match('/^[\p{L}\p{N}]/u', $suffix) ? ' ' : '').$suffix;
        }

        return $display;
    }

    /**
     * getActiveValue
     */
    public function getActiveValue()
    {
        if (post('clearScope')) {
            return null;
        }

        $value = post('Filter');
        $condition = post('Filter[condition]');

        if ($condition === self::CONDITION_BETWEEN) {
            if (!$this->hasPostValue('min') && !$this->hasPostValue('max')) {
                return null;
            }

            if (!$this->hasPostValue('min')) {
                $value['value'] = post('Filter[max]');
                $value['condition'] = self::CONDITION_LESSER;
            }
            elseif (!$this->hasPostValue('max')) {
                $value['value'] = post('Filter[min]');
                $value['condition'] = self::CONDITION_GREATER;
            }
        }
        else {
            if (!$this->hasPostValue('value')) {
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

        // Raw SQL query
        $sqlCondition = $scopeConditions[$activeCondition] ?? null;
        if (is_string($sqlCondition)) {
            $query->whereRaw(DbDongle::parse(strtr($sqlCondition, [
                ':filtered' => $this->parseNumber($scope->value),
                ':value' => $this->parseNumber($scope->value),
                ':min' => $this->parseNumber($scope->min),
                ':max' => $this->parseNumber($scope->max),
            ])));
            return;
        }

        // Default query
        if ($activeCondition === self::CONDITION_EQUALS) {
            $query->where($this->valueFrom, $scope->value);
            return;
        }

        if ($activeCondition === self::CONDITION_BETWEEN) {
            $query
                ->where($this->valueFrom, '>=', $scope->min)
                ->where($this->valueFrom, '<=', $scope->max);
            return;
        }

        if ($activeCondition === self::CONDITION_GREATER) {
            $query->where($this->valueFrom, '>=', $scope->value);
            return;
        }

        if ($activeCondition === self::CONDITION_LESSER) {
            $query->where($this->valueFrom, '<=', $scope->value);
            return;
        }
    }

    /**
     * parseNumber for SQL
     */
    public function parseNumber($value, array $options = [])
    {
        if (!is_numeric($value)) {
            return '';
        }

        // Arithmetic operator
        return +$value;
    }

    /**
     * getConditionLang
     */
    public function getConditionLang($condition)
    {
        switch ($condition) {
            case self::CONDITION_EQUALS:
                return __('is equal to');

            case self::CONDITION_BETWEEN:
                return __('is between');

            case self::CONDITION_GREATER:
                return __('is greater than');

            case self::CONDITION_LESSER:
                return __('is less than');
        }
    }
}
