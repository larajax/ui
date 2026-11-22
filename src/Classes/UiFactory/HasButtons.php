<?php namespace Larajax\Ui\Classes\UiFactory;

use Larajax\Ui\Classes\ViewComponent;

/**
 * HasButtons
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
trait HasButtons
{
    /**
     * button creates a button component
     * @param string $label Button label
     * @param string $href Link URL (optional)
     * @param string $icon Icon class
     * @param bool $primary Primary styling
     * @param bool $secondary Secondary styling
     * @param bool $danger Danger styling
     * @param bool $success Success styling
     * @param bool $warning Warning styling
     * @param bool $info Info styling
     * @param bool $outline Outline styling, in the secondary theme unless another is set
     */
    public static function button(
        string $label = '',
        string $href = '',
        string $icon = '',
        bool $primary = false,
        bool $secondary = false,
        bool $danger = false,
        bool $success = false,
        bool $warning = false,
        bool $info = false,
        bool $outline = false,
        string|array $hotkey = '',
        ...$attributes
    ): ViewComponent {
        return new ViewComponent('button', compact(
            'label',
            'href',
            'icon',
            'primary',
            'secondary',
            'danger',
            'success',
            'warning',
            'info',
            'outline',
            'hotkey'
        ), $attributes);
    }

    /**
     * popupButton creates a popup button component
     *
     * @param string $label Button label
     * @param string $handler AJAX handler for the popup contents
     * @param string $icon Icon class
     * @param bool $primary Primary styling
     * @param bool $secondary Secondary styling
     * @param bool $danger Danger styling
     * @param bool $success Success styling
     * @param bool $warning Warning styling
     * @param bool $info Info styling
     * @param bool $outline Outline styling, in the secondary theme unless another is set
     * @param array $requestData Request data to pass with the AJAX request
     */
    public static function popupButton(
        string $label = '',
        string $handler = '',
        string $icon = '',
        bool $primary = false,
        bool $secondary = false,
        bool $danger = false,
        bool $success = false,
        bool $warning = false,
        bool $info = false,
        bool $outline = false,
        string|array $hotkey = '',
        array $requestData = [],
        ...$attributes
    ): ViewComponent {
        return new ViewComponent('button.popup-button', compact(
            'label',
            'handler',
            'icon',
            'primary',
            'secondary',
            'danger',
            'success',
            'warning',
            'info',
            'outline',
            'hotkey',
            'requestData'
        ), $attributes);
    }

    /**
     * ajaxButton creates an AJAX button component
     *
     * @param string $label Button label
     * @param string $handler AJAX handler to associate to the button
     * @param string $icon Icon class
     * @param bool $primary Primary styling
     * @param bool $secondary Secondary styling
     * @param bool $danger Danger styling
     * @param bool $success Success styling
     * @param bool $warning Warning styling
     * @param bool $info Info styling
     * @param bool $outline Outline styling, in the secondary theme unless another is set
     * @param array $requestData Request data to pass with the AJAX request
     */
    public static function ajaxButton(
        string $label = '',
        string $handler = '',
        string $icon = '',
        bool $primary = false,
        bool $secondary = false,
        bool $danger = false,
        bool $success = false,
        bool $warning = false,
        bool $info = false,
        bool $outline = false,
        string|array $hotkey = '',
        array $requestData = [],
        ...$attributes
    ): ViewComponent {
        return new ViewComponent('button.ajax-button', compact(
            'label',
            'handler',
            'icon',
            'primary',
            'secondary',
            'danger',
            'success',
            'warning',
            'info',
            'outline',
            'hotkey',
            'requestData'
        ), $attributes);
    }

    /**
     * iconButton creates an icon-only button component
     *
     * @param string $label Accessible label (renders as title attribute)
     * @param string $icon Icon class (applied to the element, not as a child)
     * @param string $handler AJAX handler (optional)
     * @param bool $danger Danger hover styling
     */
    public static function iconButton(
        string $label = '',
        string $icon = '',
        string $handler = '',
        bool $danger = false,
        string|array $hotkey = '',
        ...$attributes
    ): ViewComponent {
        return new ViewComponent('button.icon-button', compact(
            'label',
            'icon',
            'handler',
            'danger',
            'hotkey'
        ), $attributes);
    }

    /**
     * dropdownButton creates a dropdown button component (slot-based)
     *
     * Usage:
     *     <?php Ui::dropdownButton(label: 'Actions', secondary: true)->slot() ?>
     *         <?= Ui::dropdownItem(label: 'Edit', handler: 'onEdit') ?>
     *     <?php Ui::end() ?>
     *
     * @param string $label Button label
     * @param string $icon Icon class
     * @param bool $primary Primary styling
     * @param bool $secondary Secondary styling
     * @param bool $danger Danger styling
     * @param bool $success Success styling
     * @param bool $warning Warning styling
     * @param bool $info Info styling
     * @param bool $outline Outline styling, in the secondary theme unless another is set
     * @param bool $caret Show dropdown caret arrow
     */
    public static function dropdownButton(
        string $label = '',
        string $icon = '',
        bool $primary = false,
        bool $secondary = false,
        bool $danger = false,
        bool $success = false,
        bool $warning = false,
        bool $info = false,
        bool $outline = false,
        bool $caret = true,
        ...$attributes
    ): ViewComponent {
        return new ViewComponent('button.dropdown-button', compact(
            'label',
            'icon',
            'primary',
            'secondary',
            'danger',
            'success',
            'warning',
            'info',
            'outline',
            'caret'
        ), $attributes);
    }

    /**
     * dropdownItem creates a dropdown menu item component, which opens a submenu of the
     * items printed in its slot
     *
     * Usage:
     *     <?php Ui::dropdownItem(label: 'Export')->slot() ?>
     *         <?= Ui::dropdownItem(label: 'CSV', handler: 'onExportCsv') ?>
     *     <?php Ui::end() ?>
     *
     * @param string $label Item label
     * @param string $handler AJAX handler (optional)
     * @param string $href Link URL (optional)
     * @param string $icon Icon class (optional)
     * @param bool $popup Opens the handler response in a popup
     * @param array $requestData Request data to pass with the AJAX request
     * @param string|array $hotkey Hotkey that clicks the item, shown at its end
     * @param bool $selected Marks the item as the current choice with a check
     * @param bool $disabled Greys the item out
     */
    public static function dropdownItem(
        string $label = '',
        string $handler = '',
        string $href = '',
        string $icon = '',
        bool $popup = false,
        array $requestData = [],
        string|array $hotkey = '',
        bool $selected = false,
        bool $disabled = false,
        ...$attributes
    ): ViewComponent {
        return new ViewComponent('button.dropdown-item', compact(
            'label',
            'handler',
            'href',
            'icon',
            'popup',
            'requestData',
            'hotkey',
            'selected',
            'disabled'
        ), $attributes);
    }

    /**
     * dropdownHeader creates a label for a section of a dropdown menu
     *
     * @param string $label Header text
     */
    public static function dropdownHeader(string $label = '', ...$attributes): ViewComponent
    {
        return new ViewComponent('button.dropdown-header', compact('label'), $attributes);
    }

    /**
     * dropdownDivider creates a dropdown menu separator
     */
    public static function dropdownDivider(): ViewComponent
    {
        return new ViewComponent('button.dropdown-divider');
    }

    /**
     * splitButton creates a button that runs its own action beside a caret that opens a
     * menu of the items printed in its slot (slot-based)
     *
     * Usage:
     *     <?php Ui::splitButton(label: 'Save', handler: 'onSave', primary: true)->slot() ?>
     *         <?= Ui::dropdownItem(label: 'Save and Close', handler: 'onSave', requestData: ['close' => 1]) ?>
     *     <?php Ui::end() ?>
     *
     * @param string $label Button label
     * @param string $handler AJAX handler for the button (optional)
     * @param string $href Link URL for the button (optional)
     * @param string $icon Icon class
     * @param bool $popup Opens the handler response in a popup
     * @param bool $primary Primary styling
     * @param bool $secondary Secondary styling
     * @param bool $danger Danger styling
     * @param bool $success Success styling
     * @param bool $warning Warning styling
     * @param bool $info Info styling
     * @param bool $outline Outline styling, in the secondary theme unless another is set
     * @param string|array $hotkey Hotkey that clicks the button
     * @param array $requestData Request data to pass with the AJAX request
     * @param array $toggleAttributes Attributes for the caret toggle
     */
    public static function splitButton(
        string $label = '',
        string $handler = '',
        string $href = '',
        string $icon = '',
        bool $popup = false,
        bool $primary = false,
        bool $secondary = false,
        bool $danger = false,
        bool $success = false,
        bool $warning = false,
        bool $info = false,
        bool $outline = false,
        string|array $hotkey = '',
        array $requestData = [],
        array $toggleAttributes = [],
        ...$attributes
    ): ViewComponent {
        return new ViewComponent('button.split-button', compact(
            'label',
            'handler',
            'href',
            'icon',
            'popup',
            'primary',
            'secondary',
            'danger',
            'success',
            'warning',
            'info',
            'outline',
            'hotkey',
            'requestData',
            'toggleAttributes'
        ), $attributes);
    }

    /**
     * buttonGroup joins the buttons printed in its slot into one group (slot-based)
     *
     * Usage:
     *     <?php Ui::buttonGroup()->slot() ?>
     *         <?= Ui::ajaxButton(label: 'Day', handler: 'onView') ?>
     *         <?= Ui::ajaxButton(label: 'Week', handler: 'onView') ?>
     *     <?php Ui::end() ?>
     */
    public static function buttonGroup(...$attributes): ViewComponent
    {
        return new ViewComponent('button.button-group', [], $attributes);
    }
}
