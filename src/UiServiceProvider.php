<?php

namespace Larajax\Ui;

use Illuminate\Support\ServiceProvider;
use Larajax\Ui\Classes\IconManager;

class UiServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->mergeIconConfig();

        $this->app->register(\October\Rain\Foundation\Providers\CoreServiceProvider::class);

        $this->app->register(\October\Rain\Html\HtmlServiceProvider::class);

        // Registers the `~` (app base) path symbol used in view and config paths
        $this->app->register(\October\Rain\Filesystem\FilesystemServiceProvider::class);

        $this->app->scoped('system.widgets', \Larajax\Ui\Classes\WidgetManager::class);

        // Collects the assets that widgets add during a request
        $this->app->scoped(\Larajax\Ui\Classes\AssetCollector::class);
        $this->app->alias(\Larajax\Ui\Classes\AssetCollector::class, 'larajax.ui.assets');

        $this->app->singleton('system.preset', \Larajax\Ui\Classes\PresetManager::class);

        $this->app->singleton(IconManager::class);
        $this->app->alias(IconManager::class, 'larajax.ui.icons');

        $this->app->singleton(\Larajax\Ui\Classes\ModelInspector::class);
        $this->app->alias(\Larajax\Ui\Classes\ModelInspector::class, 'model.inspector');

        // Supports the DbDongle facade used for raw SQL parsing in widgets
        $this->app->singleton('db.dongle', function ($app) {
            return new \October\Rain\Database\Dongle(
                $app['db']->connection()->getDriverName(),
                $app['db']
            );
        });

        // Gives plain Eloquent models the searchWhere methods used by the widgets
        \Larajax\Ui\Database\SearchWhereMacros::register();

        \Illuminate\Foundation\AliasLoader::getInstance()->alias('Str', \October\Rain\Support\Str::class);
        \Illuminate\Foundation\AliasLoader::getInstance()->alias('Ui', \Larajax\Ui\Facades\Ui::class);
    }

    /**
     * swapTranslator replaces Laravel's translator with Rain's, which the trans() helper in Rain's init functions expects
     */
    protected function swapTranslator(): void
    {
        if ($this->app['translator'] instanceof \October\Rain\Translation\Translator) {
            return;
        }

        $current = $this->app['translator'];

        $trans = new \October\Rain\Translation\Translator(
            $current->getLoader(),
            $current->getLocale()
        );

        $trans->setFallback($current->getFallback());

        $this->app->instance('translator', $trans);
    }

    /**
     * mergeIconConfig loads defaults while preserving nested application overrides.
     */
    protected function mergeIconConfig(): void
    {
        $configPath = __DIR__ . '/../config/larajax-icons.php';

        $this->mergeConfigFrom($configPath, 'larajax-icons');

        $defaults = require $configPath;
        $configured = $this->app['config']->get('larajax-icons', []);

        $this->app['config']->set(
            'larajax-icons',
            array_replace_recursive($defaults, $configured)
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->swapTranslator();

        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'ui');

        // Sends the widget assets added during an AJAX request with its response
        $this->app['events']->listen(\Illuminate\Routing\Events\PreparingResponse::class, function ($event) {
            if ($event->response instanceof \Larajax\Classes\AjaxResponse && $this->app->resolved(\Larajax\Ui\Classes\AssetCollector::class)) {
                $this->app->make(\Larajax\Ui\Classes\AssetCollector::class)->addToAjaxResponse($event->response);
            }
        });

        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../resources/assets' => public_path('vendor/larajax/ui'),
            ], 'larajax-ui-assets');

            $this->publishes([
                __DIR__ . '/../config/larajax-icons.php' => config_path('larajax-icons.php'),
            ], 'larajax-ui-config');
        }

        app('system.widgets')->registerFormWidgets(function ($manager) {
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\Relation::class, 'relation');
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\FileUpload::class, 'fileupload');
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\Repeater::class, 'repeater');
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\DatePicker::class, 'datepicker');
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\TagList::class, 'taglist');
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\RecordFinder::class, 'recordfinder');
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\NestedForm::class, 'nestedform');
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\Sensitive::class, 'sensitive');
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\ColorPicker::class, 'colorpicker');
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\RichEditor::class, 'richeditor');
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\CodeEditor::class, 'codeeditor');
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\MarkdownEditor::class, 'markdown');
        });

        app('system.widgets')->registerFilterWidgets(function ($manager) {
            $manager->registerFilterWidget(\Larajax\Ui\FilterWidgets\Group::class, 'group');
            $manager->registerFilterWidget(\Larajax\Ui\FilterWidgets\Date::class, 'date');
            $manager->registerFilterWidget(\Larajax\Ui\FilterWidgets\Text::class, 'text');
            $manager->registerFilterWidget(\Larajax\Ui\FilterWidgets\Number::class, 'number');
        });
    }
}