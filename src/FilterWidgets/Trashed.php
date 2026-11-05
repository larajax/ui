<?php namespace Larajax\Ui\FilterWidgets;

use Illuminate\Support\Facades\Lang;
use Larajax\Ui\Classes\FilterWidgetBase;
use October\Rain\Exception\SystemException;
use Larajax\Ui\Helpers\Input;

/**
 * Trashed filter, showing the soft deleted records alongside the others or on their own
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Trashed extends FilterWidgetBase
{
    const VALUE_WITH = 'with';
    const VALUE_ONLY = 'only';

    /**
     * init offers the two ways to show deleted records, leaving them hidden until one is picked.
     */
    public function init()
    {
        $scope = $this->filterScope;

        $scope->options([
            self::VALUE_WITH => 'Shown',
            self::VALUE_ONLY => 'Only',
        ]);

        if (!$scope->emptyOption) {
            $scope->emptyOption = 'Hidden';
        }
    }

    /**
     * @inheritDoc
     */
    public function render()
    {
        return $this->getParentFilter()->makePartial('scope_dropdown', ['scope' => $this->filterScope]);
    }

    /**
     * renderForm is empty, since the scope picks from its menu without a popover.
     */
    public function renderForm()
    {
        return '';
    }

    /**
     * getActiveValue
     */
    public function getActiveValue()
    {
        if (Input::post('clearScope')) {
            return null;
        }

        $value = Input::post('value');

        return in_array($value, [self::VALUE_WITH, self::VALUE_ONLY], true) ? ['value' => $value] : null;
    }

    /**
     * applyScopeToQuery
     */
    public function applyScopeToQuery($query)
    {
        $scope = $this->filterScope;

        if ($scope->modelScope) {
            $scope->applyScopeMethodToQuery($query);
            return;
        }

        if (!method_exists($query, 'hasMacro') || !$query->hasMacro('withTrashed')) {
            throw new SystemException(Lang::get("The ':scope' scope shows deleted records, so its model must use soft deletes.", [
                'scope' => $this->scopeName,
            ]));
        }

        if ($scope->value === self::VALUE_ONLY) {
            $query->onlyTrashed();
        }
        else {
            $query->withTrashed();
        }
    }
}
