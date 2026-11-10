<?php namespace Larajax\Ui\Classes\UiFactory;

use Larajax\Ui\Classes\ViewComponent;

/**
 * HasInputs
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
trait HasInputs
{
    /**
     * searchInput creates a search field, with class on the field, outerClass on the element around it, inputClass on the input, and other attributes on the input
     * @param string $name Input name
     * @param string $value Input value
     * @param string $placeholder Placeholder text
     * @param bool $handler AJAX handler
     */
    public static function searchInput(
        string $name = '',
        ?string $value = null,
        string $placeholder = '',
        string $handler = '',
        ...$attributes
    ): ViewComponent {
        return new ViewComponent('input.search-input', compact(
            'name',
            'value',
            'placeholder',
            'handler'
        ), $attributes);
    }
}
