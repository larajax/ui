<?php namespace Larajax\Ui\Widgets\Filter;

use Larajax\Ui\Helpers\Input;

/**
 * HasSavedFilters keeps named sets of scope values in the user preferences, so the filter
 * menu can save the current scopes under a name and apply them again later.
 */
trait HasSavedFilters
{
    /**
     * onSaveFilters saves the current scope values under the posted name, replacing a set with the same name.
     */
    public function onSaveFilters()
    {
        $name = $this->getPostedSavedFilterName();
        if (!$this->savedFilters || $name === '') {
            return;
        }

        $sets = $this->getSavedFilterSets();
        $sets[$name] = $this->getSavedFilterValues();
        $this->putUserPreference('savedFilters', $sets);

        return $this->makeSavedFiltersMenuResponse();
    }

    /**
     * onApplySavedFilters puts each scope back to its value in the posted set, and the scopes it leaves out to their default.
     */
    public function onApplySavedFilters()
    {
        $sets = $this->getSavedFilterSets();
        $name = $this->getPostedSavedFilterName();
        if (!$this->savedFilters || !array_key_exists($name, $sets)) {
            return;
        }

        $this->defineFilterScopes();

        foreach ($this->getScopes() as $scope) {
            $this->putScopeValue($scope, $sets[$name][$scope->scopeName] ?? $scope->getDefaultScopeValue());
        }

        $this->prepareVars();

        $result = [
            '#' . $this->getId() => $this->makePartial('filter-container')
        ];

        return $this->eventUpdate($result, func_get_args());
    }

    /**
     * onDeleteSavedFilters removes the posted set.
     */
    public function onDeleteSavedFilters()
    {
        $sets = $this->getSavedFilterSets();
        $name = $this->getPostedSavedFilterName();
        if (!$this->savedFilters || !array_key_exists($name, $sets)) {
            return;
        }

        unset($sets[$name]);
        $this->putUserPreference('savedFilters', $sets);

        return $this->makeSavedFiltersMenuResponse();
    }

    /**
     * getSavedFilterSets returns the scope values of each saved set, keyed by its name.
     */
    public function getSavedFilterSets(): array
    {
        return (array) $this->getUserPreference('savedFilters', []);
    }

    /**
     * getSavedFilterMenu returns whether each saved set matches the current scope values, keyed by name in name order.
     */
    public function getSavedFilterMenu(): array
    {
        $menu = [];

        foreach ($this->getSavedFilterSets() as $name => $values) {
            $menu[(string) $name] = $this->savedFilterValuesMatch((array) $values);
        }

        uksort($menu, 'strnatcasecmp');

        return $menu;
    }

    /**
     * makeSavedFiltersMenuResponse renders the filter menu items and the saved set forms again, so they follow the saved sets and check marks.
     */
    protected function makeSavedFiltersMenuResponse(): array
    {
        $this->prepareVars();

        return [
            '#' . $this->getId('setupMenu') => $this->makePartial('filter_menu_items'),
            '#' . $this->getId('savedForms') => $this->makePartial('saved_filter_forms'),
        ];
    }

    /**
     * getSavedFilterValues returns the stored value of every scope, or its default when it has none, keyed by scope name.
     */
    protected function getSavedFilterValues(): array
    {
        $this->defineFilterScopes();

        $values = [];
        foreach ($this->getScopes() as $scope) {
            $values[$scope->scopeName] = $this->getScopeValue($scope);
        }

        return $values;
    }

    /**
     * savedFilterValuesMatch checks whether every scope holds the value a saved set gives it, or its default when the set leaves it out.
     */
    protected function savedFilterValuesMatch(array $values): bool
    {
        $this->defineFilterScopes();

        foreach ($this->getScopes() as $scope) {
            $saved = $values[$scope->scopeName] ?? $scope->getDefaultScopeValue();

            if ($this->normalizeSavedFilterValue($saved) != $this->normalizeSavedFilterValue($this->getScopeValue($scope))) {
                return false;
            }
        }

        return true;
    }

    /**
     * normalizeSavedFilterValue unwraps a plain value and treats every way of holding no filter as the same.
     */
    protected function normalizeSavedFilterValue($value)
    {
        if (is_array($value) && array_keys($value) === ['value']) {
            $value = $value['value'];
        }

        return in_array($value, [null, '', 0, '0', false, []], true) ? null : $value;
    }

    /**
     * getPostedSavedFilterName returns the posted set name, trimmed and limited to 100 characters.
     */
    protected function getPostedSavedFilterName(): string
    {
        return mb_substr(trim((string) Input::post('savedFilterName')), 0, 100);
    }
}
