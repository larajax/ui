<?php namespace Larajax\Ui\Contracts;

use Larajax\Ui\Element\Lists\ColumnDefinition;

/**
 * ListElement
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
interface ListElement
{
    /**
     * defineColumn adds a column to the list element
     */
    public function defineColumn(string $columnName, ?string $label = null): ColumnDefinition;
}
