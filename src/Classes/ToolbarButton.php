<?php namespace Larajax\Ui\Classes;

use Larajax\Ui\Element\ElementBase;

/**
 * ToolbarButton definition is a translation of the toolbar button configuration
 *
 * @method ToolbarButton name(string $name) name of this button, a unique key
 * @method ToolbarButton label(string $label) label for the button
 * @method ToolbarButton icon(string $icon) icon key or CSS classes for the button
 * @method ToolbarButton type(string $type) type of button styling: default, primary, secondary, danger, success, warning, info
 * @method ToolbarButton outline(bool $outline) outline uses the outline variant of the button style
 * @method ToolbarButton url(string $url) url renders the button as a link
 * @method ToolbarButton handler(string $handler) handler renders the button as an AJAX button (data-request)
 * @method ToolbarButton popup(bool $popup) popup loads the handler response in a popup instead of running it directly
 * @method ToolbarButton confirm(string $confirm) confirm message displayed before the AJAX request runs
 * @method ToolbarButton checked(bool|string $checked) checked links the button state to the checked rows of the bound list, `single` for exactly one row
 * @method ToolbarButton visible(bool|string $visible) visible as a boolean or a host controller method name resolved at render
 * @method ToolbarButton permissions(array|string $permissions) permissions (gate abilities) needed to display the button
 * @method ToolbarButton context(array|string $context) context the button belongs to, matched against the toolbar context
 * @method ToolbarButton disabled(bool|string $disabled) disabled as a boolean or a host controller method name resolved at render
 * @method ToolbarButton active(bool|string $active) active marks the button as on, as a boolean or a host controller method name
 * @method ToolbarButton hotkey(string|array $hotkey) hotkey binding for the button
 * @method ToolbarButton requestData(array $requestData) requestData included with the AJAX request
 * @method ToolbarButton attributes(array $attributes) attributes to add to the button element
 * @method ToolbarButton items(array $items) items of a dropdown menu, a split button menu or a button group
 * @method ToolbarButton caret(bool $caret) caret shows the arrow on a dropdown button, true by default
 * @method ToolbarButton group(bool $group) group renders the items side by side as a button group
 * @method ToolbarButton divider(bool $divider) divider draws a separator line in place of a button
 * @method ToolbarButton header(string $header) header labels a section of a menu
 * @method ToolbarButton partial(string $partial) partial renders a host controller partial in place of the button
 * @method ToolbarButton align(string $align) align set to `end` places the button at the end of the toolbar
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
            ->outline(false)
            ->visible(true)
            ->popup(false)
            ->checked(false)
            ->disabled(false)
            ->active(false)
            ->requestData([])
            ->attributes([])
            ->items([])
        ;
    }

    /**
     * makeFrom builds a definition from its name and configuration, where the string
     * `divider` or `-` is shorthand for a divider.
     */
    public static function makeFrom(string|int $name, mixed $config): static
    {
        if ($config instanceof static) {
            if (is_string($name) && !$config->name) {
                $config->name($name);
            }

            return $config;
        }

        if ($config === 'divider' || $config === '-') {
            $config = ['divider' => true];
        }

        return new static(['name' => (string) $name] + (array) $config);
    }

    /**
     * getItems returns the nested definitions keyed by name, building any given as arrays.
     * @return ToolbarButton[]
     */
    public function getItems(): array
    {
        $items = [];

        foreach ((array) $this->items as $name => $config) {
            $item = static::makeFrom($name, $config);
            $items[$item->name] = $item;
        }

        return $this->config['items'] = $items;
    }

    /**
     * addItems adds nested definitions, placed before or after a named item or at the end.
     */
    public function addItems(array $items, ?string $before = null, ?string $after = null): static
    {
        $built = [];

        foreach ($items as $name => $config) {
            $item = static::makeFrom($name, $config);
            $built[$item->name] = $item;
        }

        $this->config['items'] = static::insertInto($this->getItems(), $built, $before, $after);

        return $this;
    }

    /**
     * removeItem removes a nested definition by its name.
     */
    public function removeItem(string $name): static
    {
        $items = $this->getItems();

        unset($items[$name]);

        $this->config['items'] = $items;

        return $this;
    }

    /**
     * hasItems returns true when the button holds nested definitions.
     */
    public function hasItems(): bool
    {
        return !empty($this->items);
    }

    /**
     * hasAction returns true when the button follows a link or runs a handler.
     */
    public function hasAction(): bool
    {
        return (bool) ($this->url || $this->handler);
    }

    /**
     * isDivider returns true when the definition is a separator line.
     */
    public function isDivider(): bool
    {
        return (bool) $this->divider;
    }

    /**
     * isHeader returns true when the definition labels a menu section.
     */
    public function isHeader(): bool
    {
        return $this->header !== null;
    }

    /**
     * isGroup returns true when the items render side by side as a button group.
     */
    public function isGroup(): bool
    {
        return $this->group && $this->hasItems();
    }

    /**
     * isSplit returns true when the button runs its own action beside a menu of items.
     */
    public function isSplit(): bool
    {
        return !$this->group && $this->hasItems() && $this->hasAction();
    }

    /**
     * isDropdown returns true when the button only opens a menu of items.
     */
    public function isDropdown(): bool
    {
        return !$this->group && $this->hasItems() && !$this->hasAction();
    }

    /**
     * matchesContext returns true when the button belongs to the given context.
     */
    public function matchesContext(?string $context): bool
    {
        if ($context === '*' || $this->context === null) {
            return true;
        }

        return in_array($context, (array) $this->context);
    }

    /**
     * insertInto places definitions in a keyed set, before or after a named entry or at
     * the end. Without a place, an entry of the same name is replaced where it stands.
     */
    public static function insertInto(array $existing, array $added, ?string $before = null, ?string $after = null): array
    {
        $anchor = $before ?? $after;

        if ($anchor === null) {
            return array_replace($existing, $added);
        }

        $existing = array_diff_key($existing, $added);

        if (!array_key_exists($anchor, $existing)) {
            return $existing + $added;
        }

        $offset = array_search($anchor, array_keys($existing), true) + ($after !== null ? 1 : 0);

        return array_slice($existing, 0, $offset, true) + $added + array_slice($existing, $offset, null, true);
    }
}
