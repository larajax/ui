<?php namespace Larajax\Ui\ListWidgets;

use Larajax\Ui\Classes\ListWidgetBase;
use Larajax\Ui\Widgets\Toolbar;

/**
 * Actions renders a menu of actions on each row. Its `buttons` are toolbar button
 * definitions, an array or a YAML file path, where `:name` placeholders take the row's
 * attributes and state methods receive the row's record.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Actions extends ListWidgetBase
{
    //
    // Configurable Properties
    //

    /**
     * @var array|string buttons of the menu, as toolbar button definitions or a YAML file path.
     */
    public $buttons = [];

    /**
     * @var string icon of the button that opens the menu.
     */
    public $icon = 'list.actions';

    //
    // Object Properties
    //

    /**
     * @var Toolbar|null toolbar that holds the definitions and renders the items.
     */
    protected $toolbar;

    /**
     * columnDefaults leaves the column out of sorting and keeps the row link from
     * taking clicks meant for the menu.
     */
    public static function columnDefaults(): array
    {
        return [
            'sortable' => false,
            'clickable' => false,
        ];
    }

    /**
     * init the widget
     */
    public function init()
    {
        $this->fillFromConfig([
            'buttons',
            'icon',
        ]);
    }

    /**
     * renderValue renders the menu for a record, or nothing when none of its items
     * show for that record.
     */
    public function renderValue($record, $value)
    {
        $items = $this->getToolbar()->renderMenuItems($record);

        if (trim($items) === '') {
            return '';
        }

        return $this->makePartial('actions', [
            'items' => $items,
            'icon' => $this->icon,
            'label' => $this->column->label ? __($this->column->label) : __('Actions'),
        ]);
    }

    /**
     * getToolbar returns the toolbar that holds the menu's definitions. Its alias is this
     * widget's alias with `Toolbar` added, so `toolbarExtendButtons()` and the
     * `toolbar.extendButtons` event can tell it apart.
     */
    public function getToolbar(): Toolbar
    {
        return $this->toolbar ??= Toolbar::createIn($this->controller, [
            'alias' => $this->alias.'Toolbar',
            'buttons' => $this->buttons,
        ]);
    }
}
