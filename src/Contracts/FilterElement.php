<?php namespace Larajax\Ui\Contracts;

use Larajax\Ui\Element\Filter\ScopeDefinition;

/**
 * FilterElement
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
interface FilterElement
{
    /**
     * defineScope adds a scope to the filter element
     */
    public function defineScope(string $scopeName, ?string $label = null): ScopeDefinition;
}
