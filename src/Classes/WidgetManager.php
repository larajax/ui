<?php namespace Amber\Classes;

use App;

/**
 * WidgetManager
 */
class WidgetManager
{
    use \Amber\Classes\WidgetManager\HasFormWidgets;
    use \Amber\Classes\WidgetManager\HasFilterWidgets;

    /**
     * @var \Amber\Classes\WidgetManager|null parent manager that this
     * manager falls back to when a widget is not found in its own registry.
     */
    protected $parent;

    /**
     * instance creates a new instance of this singleton
     */
    public static function instance(): static
    {
        return App::make('system.widgets');
    }

    /**
     * setParent assigns a fallback manager used during widget resolution
     * and listing. Child registrations take precedence over the parent's.
     */
    public function setParent(?WidgetManager $parent): void
    {
        $this->parent = $parent;
    }

    /**
     * getParent returns the fallback manager, if any.
     */
    public function getParent(): ?WidgetManager
    {
        return $this->parent;
    }
}
