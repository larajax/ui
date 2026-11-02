<?php namespace Larajax\Ui\FilterWidgets;

use Db;
use DbDongle;
use Larajax\Ui\Classes\FilterWidgetBase;

/**
 * Text filter
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Text extends FilterWidgetBase
{
    const CONDITION_EQUALS = 'equals';
    const CONDITION_CONTAINS = 'contains';

    /**
     * init
     */
    public function init()
    {
        $scope = $this->filterScope;

        if (!$scope->conditions) {
            $scope->conditions = [
                self::CONDITION_EQUALS => true,
                self::CONDITION_CONTAINS => true,
                self::CONDITION_EMPTY => true,
                self::CONDITION_NOT_EMPTY => true,
            ];
        }
    }

    /**
     * @inheritDoc
     */
    public function render()
    {
        $this->prepareVars();
        return $this->makePartial('text');
    }

    /**
     * renderForm the form to use for filtering
     */
    public function renderForm()
    {
        $this->prepareVars();
        return $this->makePartial('text_form');
    }

    /**
     * prepareVars for display
     */
    public function prepareVars()
    {
        $this->vars['scope'] = $this->filterScope;
    }

    /**
     * getActiveValueLabel shows the typed text, or whether the value is empty.
     */
    public function getActiveValueLabel(): string
    {
        return match ($this->filterScope->condition) {
            self::CONDITION_EMPTY => __('Empty'),
            self::CONDITION_NOT_EMPTY => __('Not empty'),
            default => (string) $this->filterScope->value,
        };
    }

    /**
     * getActiveValue
     */
    public function getActiveValue()
    {
        if (post('clearScope')) {
            return null;
        }

        $condition = post('Filter[condition]');
        if ($this->isEmptyCondition($condition)) {
            return ['condition' => $condition];
        }

        if (!$this->hasPostValue('value')) {
            return null;
        }

        return post('Filter');
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
        $activeValue = $scope->value;

        // Raw SQL query
        $sqlCondition = $scopeConditions[$activeCondition] ?? null;
        if (is_string($sqlCondition)) {
            $query->whereRaw(DbDongle::parse($sqlCondition, [
                'value' => $activeValue,
            ]));
            return;
        }

        // Default query
        if ($activeCondition === self::CONDITION_EMPTY) {
            $query->where(function ($query) {
                $query->whereNull($this->valueFrom)->orWhere($this->valueFrom, '');
            });
            return;
        }

        if ($activeCondition === self::CONDITION_NOT_EMPTY) {
            $query->whereNotNull($this->valueFrom)->where($this->valueFrom, '!=', '');
            return;
        }

        if ($activeCondition === self::CONDITION_CONTAINS) {
            $query->where($this->valueFrom, 'LIKE', '%'.$activeValue.'%');
            return;
        }

        $query->where($this->valueFrom, $activeValue);
    }

    /**
     * getConditionLang
     */
    public function getConditionLang($condition)
    {
        switch ($condition) {
            case self::CONDITION_EQUALS:
                return __('is equal to');

            case self::CONDITION_CONTAINS:
                return __('contains');

            case self::CONDITION_EMPTY:
                return __('is empty');

            case self::CONDITION_NOT_EMPTY:
                return __('is not empty');
        }
    }
}
