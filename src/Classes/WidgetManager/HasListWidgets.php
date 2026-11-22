<?php namespace Larajax\Ui\Classes\WidgetManager;

use Larajax\Ui\Helpers\Str;

/**
 * HasListWidgets concern
 */
trait HasListWidgets
{
    /**
     * @var array listWidgets
     */
    protected $listWidgets;

    /**
     * @var array listWidgetCallbacks cache
     */
    protected $listWidgetCallbacks = [];

    /**
     * @var array listWidgetHints keyed by their code.
     * Stored in the form of ['listwidgetcode' => 'ListWidgetClass'].
     */
    protected $listWidgetHints;

    /**
     * listListWidgets returns a list of registered list widgets.
     * @return array Array keys are class names.
     */
    public function listListWidgets()
    {
        if ($this->listWidgets === null) {
            $this->listWidgets = [];

            // Load externally registered widgets
            foreach ($this->listWidgetCallbacks as $callback) {
                $callback($this);
            }

            // Allow subclasses to discover widgets from additional sources
            $this->discoverListWidgets();
        }

        if ($this->parent) {
            return $this->listWidgets + $this->parent->listListWidgets();
        }

        return $this->listWidgets;
    }

    /**
     * getListWidgets returns the raw array of registered list widgets.
     * @return array Array keys are class names.
     */
    public function getListWidgets()
    {
        return $this->listWidgets;
    }

    /**
     * registerListWidget registers a single list widget. A code keeps the first widget
     * registered to it, so the library's own column types cannot be replaced.
     */
    public function registerListWidget($className, $widgetInfo)
    {
        if (!is_array($widgetInfo)) {
            $widgetInfo = ['code' => $widgetInfo];
        }

        $widgetCode = $widgetInfo['code'] ?? null;

        if (!$widgetCode) {
            $widgetCode = Str::getClassId($className);
        }

        $this->listWidgets[$className] = $widgetInfo;
        $this->listWidgetHints[$widgetCode] ??= $className;
    }

    /**
     * registerListWidgets manually registers list widget for consideration. Usage:
     *
     *     WidgetManager::registerListWidgets(function ($manager) {
     *         $manager->registerListWidget(\App\ListWidgets\Rating::class, 'rating');
     *     });
     *
     */
    public function registerListWidgets(callable $definitions)
    {
        $this->listWidgetCallbacks[] = $definitions;
    }

    /**
     * resolveListWidget returns a class name from a list widget code
     * Normalizes a class name or converts a code to its class name.
     * Returns the class name resolved, or the original name.
     * @param string $name
     * @return string
     */
    public function resolveListWidget($name)
    {
        if ($this->listWidgets === null) {
            $this->listListWidgets();
        }

        $hints = $this->listWidgetHints;

        if (isset($hints[$name])) {
            return $hints[$name];
        }

        $_name = Str::normalizeClassName($name);
        if (isset($this->listWidgets[$_name])) {
            return $_name;
        }

        if ($this->parent) {
            return $this->parent->resolveListWidget($name);
        }

        return $name;
    }

    /**
     * discoverListWidgets is an extension point for subclasses to register
     * widgets from additional sources (e.g. modules, plugins, app providers).
     */
    protected function discoverListWidgets()
    {
    }
}
