<?php namespace Larajax\Ui\Widgets;

use Illuminate\Support\Facades\Gate;
use Larajax\Ui\Classes\ToolbarButton;
use Larajax\Ui\Classes\WidgetBase;
use October\Rain\Exception\SystemException;

/**
 * Toolbar Widget
 * Used for building a toolbar, renders a toolbar.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Toolbar extends WidgetBase
{
    use \Larajax\Ui\Widgets\Common\HasListSearch;

    //
    // Configurable Properties
    //

    /**
     * @var array|string buttons as declarative definitions (array or YAML file path)
     * or a controller partial name.
     */
    public $buttons;

    /**
     * @var string setupHandler displays a list configuration icon in the toolbar.
     */
    public $setupHandler;

    /**
     * @var string|null context shows only the buttons that belong to it, as form fields do.
     */
    public $context;

    //
    // Object Properties
    //


    /**
     * @var array cssClasses to apply to the toolbar container element
     */
    public $cssClasses = [];

    /**
     * @var string listWidgetId
     */
    public $listWidgetId;

    /**
     * @var array|null buttonsConfig holds declarative button configuration.
     */
    protected $buttonsConfig;

    /**
     * @var ToolbarButton[]|null allButtons collection of all button definitions.
     */
    protected $allButtons;

    /**
     * make the toolbar widget from named arguments, other configuration keys pass
     * through the variadic tail.
     *
     * @param array|string|null $buttons button definitions (array or YAML file path) or a partial name
     * @param array|string|Search|null $search search configuration, partial name or widget instance
     * @param string|null $setupHandler
     * @param string|null $context shows only the buttons that belong to this context
     * @param string|null $alias
     */
    public static function make(
        $buttons = null,
        $search = null,
        $setupHandler = null,
        $context = null,
        $alias = null,
        ...$config
    ): static {
        return static::makeFromNamedArgs(get_defined_vars(), $config);
    }

    /**
     * bindToListWidget wires toolbar search and list linkage to a list widget.
     */
    public function bindToListWidget(Lists $list): void
    {
        $this->listWidgetId = $list->getId();

        $this->bindSearchToListWidget($list);
    }

    /**
     * init the widget, called by the constructor and free from its parameters.
     */
    public function init()
    {
        $this->fillFromConfig([
            'buttons',
            'search',
            'setupHandler',
            'context',
        ]);

        $this->initButtonsConfig();

        $this->initSearchWidget();
    }

    /**
     * Renders the widget.
     */
    public function render()
    {
        $this->prepareVars();
        return $this->makePartial('toolbar');
    }

    /**
     * prepareVars for display
     */
    public function prepareVars()
    {
        $this->vars['search'] = $this->searchWidget ? $this->searchWidget->render() : '';
        $this->vars['cssClasses'] = implode(' ', $this->cssClasses);
        $this->vars['controlPanel'] = $this->makeControlPanel();
        $this->vars['endPanel'] = $this->makeEndPanel();
        $this->vars['setupHandler'] = $this->setupHandler;
    }

    /**
     * makeControlPanel
     */
    public function makeControlPanel()
    {
        $this->vars['alias'] = $this->alias;

        if ($this->buttonsConfig !== null) {
            return $this->makePartial('buttons', ['buttons' => array_filter(
                $this->getButtons(),
                fn ($button) => $button->align !== 'end'
            )]);
        }

        if (!isset($this->buttons)) {
            return '<div data-control="toolbar"></div>';
        }

        return $this->controller->makePartial($this->buttons, $this->vars);
    }

    /**
     * makeEndPanel renders the buttons aligned to the end of the toolbar, outside the
     * scrolling row.
     */
    public function makeEndPanel(): string
    {
        if ($this->buttonsConfig === null) {
            return '';
        }

        $buttons = array_filter($this->getButtons(), fn ($button) => $button->align === 'end');

        if (!$buttons) {
            return '';
        }

        return $this->makePartial('buttons_end', ['buttons' => $buttons]);
    }

    /**
     * initButtonsConfig resolves the `buttons` config as declarative button definitions
     * when supplied as an array or a YAML file path, otherwise the string keeps its
     * original meaning of a controller partial name.
     */
    protected function initButtonsConfig(): void
    {
        if (is_array($this->buttons)) {
            $this->buttonsConfig = $this->buttons;
            $this->buttons = null;
        }
        elseif (is_string($this->buttons) && preg_match('/\.ya?ml$/i', $this->buttons)) {
            $loaded = (array) $this->makeConfig($this->buttons);
            $this->buttonsConfig = $loaded['buttons'] ?? [];
            $this->buttons = null;
        }
    }

    /**
     * defineToolbarButtons builds the button definitions from the configuration and
     * gives extensions the opportunity to modify them.
     */
    protected function defineToolbarButtons(): void
    {
        if ($this->allButtons !== null) {
            return;
        }

        $this->allButtons = [];

        $this->addButtons((array) $this->buttonsConfig);

        $this->eventExtendButtons();
    }

    /**
     * eventExtendButtons is called after the toolbar buttons are defined, giving
     * extensions the opportunity to add, modify or remove buttons. The host controller
     * may implement a `toolbarExtendButtons` method as an override, mirroring the
     * form and list controller conventions.
     */
    protected function eventExtendButtons(): void
    {
        if ($this->controller && method_exists($this->controller, 'toolbarExtendButtons')) {
            $this->controller->toolbarExtendButtons($this);
        }

        $this->fireEvent('toolbar.extendButtons', [$this]);
    }

    /**
     * addButtons programmatically, accepts button names as keys with configuration
     * arrays or ToolbarButton instances as values. They go before or after the named
     * button, or at the end, and a dotted name such as `bulk.delete` places them
     * among the items of a menu.
     */
    public function addButtons(array $buttons, ?string $before = null, ?string $after = null): void
    {
        $this->defineToolbarButtons();

        $anchor = $before ?? $after;

        if ($anchor !== null && str_contains($anchor, '.')) {
            $parentPath = substr($anchor, 0, strrpos($anchor, '.'));
            $itemName = substr($anchor, strrpos($anchor, '.') + 1);

            $this->getButton($parentPath)?->addItems(
                $buttons,
                $before !== null ? $itemName : null,
                $after !== null ? $itemName : null
            );

            return;
        }

        $built = [];

        foreach ($buttons as $name => $config) {
            $button = ToolbarButton::makeFrom($name, $config);
            $built[$button->name] = $button;
        }

        $this->allButtons = ToolbarButton::insertInto($this->allButtons, $built, $before, $after);
    }

    /**
     * removeButton programmatically by its name, or a dotted path such as `bulk.delete`
     * for an item of a menu.
     */
    public function removeButton(string $name): void
    {
        $this->defineToolbarButtons();

        if (str_contains($name, '.')) {
            $this->getButton(substr($name, 0, strrpos($name, '.')))
                ?->removeItem(substr($name, strrpos($name, '.') + 1));

            return;
        }

        unset($this->allButtons[$name]);
    }

    /**
     * getButton returns a defined button by its name, or an item of a menu by a dotted
     * path such as `bulk.delete`.
     */
    public function getButton(string $name): ?ToolbarButton
    {
        $this->defineToolbarButtons();

        $parts = explode('.', $name);
        $button = $this->allButtons[array_shift($parts)] ?? null;

        foreach ($parts as $part) {
            $button = $button?->getItems()[$part] ?? null;
        }

        return $button;
    }

    /**
     * getButtons returns the visible button definitions.
     * @return ToolbarButton[]
     */
    public function getButtons(): array
    {
        $this->defineToolbarButtons();

        return $this->filterVisible($this->allButtons);
    }

    /**
     * getVisibleItems returns the visible items of a dropdown, split button or group,
     * without stray dividers and headers.
     * @return ToolbarButton[]
     */
    public function getVisibleItems(ToolbarButton $button): array
    {
        return $this->filterVisible($button->getItems());
    }

    /**
     * filterVisible keeps the visible definitions of a set, then drops dividers and
     * headers left with nothing to separate or label.
     * @param ToolbarButton[] $buttons
     * @return ToolbarButton[]
     */
    protected function filterVisible(array $buttons): array
    {
        $visible = array_filter($buttons, [$this, 'isButtonVisible']);

        $result = [];
        $pending = [];

        foreach ($visible as $name => $button) {
            if ($button->isDivider()) {
                $pending = $result ? [$name => $button] : [];
                continue;
            }

            if ($button->isHeader()) {
                $pending = array_filter($pending, fn ($held) => $held->isDivider()) + [$name => $button];
                continue;
            }

            $result += $pending;
            $result[$name] = $button;
            $pending = [];
        }

        return $result;
    }

    /**
     * isButtonVisible checks the button's context and gate abilities, resolves a
     * `visible` config value given as a host controller method name, and hides a menu
     * or group with no visible items.
     */
    protected function isButtonVisible(ToolbarButton $button): bool
    {
        if (!$button->matchesContext($this->context)) {
            return false;
        }

        if ($button->permissions && !Gate::any((array) $button->permissions)) {
            return false;
        }

        if (!$this->resolveButtonState($button, 'visible')) {
            return false;
        }

        if ($button->hasItems() && !$button->hasAction()) {
            return (bool) array_filter(
                $this->getVisibleItems($button),
                fn ($item) => !$item->isDivider() && !$item->isHeader()
            );
        }

        return true;
    }

    /**
     * isButtonActive resolves the `active` config value, which marks a button pressed
     * or a menu item selected.
     */
    public function isButtonActive(ToolbarButton $button): bool
    {
        return $this->resolveButtonState($button, 'active');
    }

    /**
     * isButtonDisabled resolves the `disabled` config value.
     */
    public function isButtonDisabled(ToolbarButton $button): bool
    {
        return $this->resolveButtonState($button, 'disabled');
    }

    /**
     * resolveButtonState reads a boolean config value, calling the host controller
     * method of that name, with the button, when it is given as a string.
     */
    protected function resolveButtonState(ToolbarButton $button, string $key): bool
    {
        $value = $button->{$key};

        if (!is_string($value)) {
            return (bool) $value;
        }

        if (!$this->controller || !method_exists($this->controller, $value)) {
            throw new SystemException("The {$key} method [{$value}] for toolbar button [{$button->name}] is not found on the controller.");
        }

        return (bool) $this->controller->{$value}($button);
    }

    /**
     * getButtonUrl returns the address of a link button.
     */
    public function getButtonUrl(ToolbarButton $button): string
    {
        return $button->url ? app('larajax.ui')->url($button->url) : '';
    }

    /**
     * getButtonTheme returns the button's style as the theme flags the Ui buttons take.
     * @return array{primary: bool, secondary: bool, danger: bool, success: bool, warning: bool, info: bool, outline: bool}
     */
    public function getButtonTheme(ToolbarButton $button): array
    {
        return [
            'primary' => $button->type === 'primary',
            'secondary' => $button->type === 'secondary',
            'danger' => $button->type === 'danger',
            'success' => $button->type === 'success',
            'warning' => $button->type === 'warning',
            'info' => $button->type === 'info',
            'outline' => (bool) $button->outline,
        ];
    }

    /**
     * getButtonAttributes returns the HTML attributes of a button or menu item: its own
     * attributes, the confirmation and the link to the checked rows of the bound list.
     * Items inside a checked menu or group send the checked rows with their requests.
     * With `withState`, a disabled or active button gets the attributes that show it,
     * which menu items take as arguments instead.
     */
    public function getButtonAttributes(ToolbarButton $button, bool $inChecked = false, bool $withState = true): array
    {
        $attributes = (array) $button->attributes;
        $classes = array_filter([$attributes['class'] ?? null]);

        if ($button->confirm) {
            $attributes['data-request-confirm'] = __($button->confirm);
        }

        if ($button->checked) {
            $attributes['data-list-checked-trigger'] = $button->checked === 'single' ? 'single' : true;
        }

        if (($button->checked || $inChecked) && $button->handler) {
            $attributes['data-list-checked-request'] = true;
        }

        if ($withState && $this->isButtonDisabled($button)) {
            if ($button->url && !$button->handler) {
                $classes[] = 'disabled';
                $attributes['aria-disabled'] = 'true';
            }
            else {
                $attributes['disabled'] = true;
            }
        }

        if ($withState && $this->isButtonActive($button)) {
            $classes[] = 'active';
            $attributes['aria-pressed'] = 'true';
        }

        if ($classes) {
            $attributes['class'] = implode(' ', $classes);
        }

        return $attributes;
    }
}
