<?php namespace Larajax\Ui\Classes;

use October\Rain\Element\ElementBase;

/**
 * ToolbarButton definition is a translation of the toolbar button configuration
 *
 * @method ToolbarButton name(string $name) name of this button, a unique key
 * @method ToolbarButton label(string $label) label for the button
 * @method ToolbarButton icon(string $icon) icon key or CSS classes for the button
 * @method ToolbarButton type(string $type) type of button styling: default, primary, secondary, danger
 * @method ToolbarButton url(string $url) url renders the button as a link
 * @method ToolbarButton handler(string $handler) handler renders the button as an AJAX button (data-request)
 * @method ToolbarButton popup(bool $popup) popup loads the handler response in a popup instead of running it directly
 * @method ToolbarButton confirm(string $confirm) confirm message displayed before the AJAX request runs
 * @method ToolbarButton checked(bool $checked) checked links the button state to the checked rows of the bound list widget
 * @method ToolbarButton visible(bool|string $visible) visible as a boolean or a host controller method name resolved at render
 * @method ToolbarButton permissions(array|string $permissions) permissions (gate abilities) needed to display the button
 * @method ToolbarButton hotkey(string|array $hotkey) hotkey binding for the button
 * @method ToolbarButton requestData(array $requestData) requestData included with the AJAX request
 * @method ToolbarButton attributes(array $attributes) attributes to add to the button element
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class ToolbarButton extends ElementBase
{
    /**
     * initDefaultValues for this button
     */
    protected function initDefaultValues()
    {
        parent::initDefaultValues();

        $this
            ->type('default')
            ->visible(true)
            ->popup(false)
            ->checked(false)
            ->requestData([])
            ->attributes([])
        ;
    }
}
