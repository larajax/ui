<?php namespace October\Amber\Widgets\Lists;

/**
 * HasListEvents declares the list's extension points as overridable methods.
 *
 * Amber consumers extend the list by subclassing and overriding these methods.
 * October's backend list subclass overrides them to additionally fire global
 * events (e.g. `backend.list.extendColumns`) for plugin-based extensibility.
 */
trait HasListEvents
{
    /**
     * eventExtendColumns is called after the list columns are defined, giving
     * subclasses an opportunity to add, modify or remove columns.
     */
    protected function eventExtendColumns(): void
    {
    }

    /**
     * eventExtendQueryBefore is called before the list widget applies its scopes
     * to the record query.
     */
    protected function eventExtendQueryBefore($query): void
    {
    }

    /**
     * eventExtendSearchQuery is called inside the search constraint grouping,
     * allowing extra search conditions.
     */
    protected function eventExtendSearchQuery($query): void
    {
    }

    /**
     * eventExtendSortColumn is called after sorting is applied to the query.
     */
    protected function eventExtendSortColumn($query, string $sortColumn, string $sortDirection): void
    {
    }

    /**
     * eventExtendQuery is called after the list widget has applied its scopes.
     * Subclasses may return a replacement query object.
     */
    protected function eventExtendQuery($query)
    {
        return null;
    }

    /**
     * eventExtendRecords is called before the widget uses the records collection.
     * Subclasses may return a replacement collection.
     */
    protected function eventExtendRecords($records)
    {
        return null;
    }

    /**
     * eventRefresh is called after the list is refreshed. Subclasses may
     * return an augmented result array to add or replace AJAX partial output.
     */
    protected function eventRefresh(array $result): array
    {
        return $result;
    }

    /**
     * eventOverrideRecordAction may return a replacement record action. Return a
     * string to replace the URL, or an array with `url`, `onclick` or `clickable`
     * keys to override each aspect.
     */
    protected function eventOverrideRecordAction($record, $url, $onClick)
    {
        return null;
    }

    /**
     * eventOverrideHeaderValue may return a replacement column header value.
     */
    protected function eventOverrideHeaderValue($column, $value)
    {
        return null;
    }

    /**
     * eventOverrideColumnValueRaw may return a replacement raw column value.
     */
    protected function eventOverrideColumnValueRaw($record, $column, $value)
    {
        return null;
    }

    /**
     * eventOverrideColumnValue may return a replacement column value.
     */
    protected function eventOverrideColumnValue($record, $column, $value)
    {
        return null;
    }

    /**
     * eventInjectRowClass may return a custom CSS class string for a record row.
     */
    protected function eventInjectRowClass($record, $value)
    {
        return null;
    }
}
