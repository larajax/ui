<?php namespace Larajax\Ui\ListWidgets;

use Illuminate\Support\Facades\Lang;
use Larajax\Ui\Classes\ListWidgetBase;

/**
 * SwitchColumn renders a boolean value as an icon, with its label in a tooltip. It is
 * the `switch` column type, a name PHP keeps for itself.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class SwitchColumn extends ListWidgetBase
{
    //
    // Configurable Properties
    //

    /**
     * @var array options labels the false and true values, in that order.
     */
    public $options = ['No', 'Yes'];

    /**
     * init the widget
     */
    public function init()
    {
        $this->fillFromConfig([
            'options',
        ]);
    }

    /**
     * renderValue renders the icon for a record's value.
     */
    public function renderValue($record, $value)
    {
        return $this->makePartial('switch', [
            'column' => $this->column,
            'value' => $value,
            'trueValue' => Lang::get($this->options[1] ?? 'Yes'),
            'falseValue' => Lang::get($this->options[0] ?? 'No'),
        ]);
    }
}
