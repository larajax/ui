<?php

namespace Larajax\Ui;

use Illuminate\Support\ServiceProvider;

class UiServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->mergeIconConfig();

        $this->app->register(\October\Rain\Html\HtmlServiceProvider::class);

        // The hooks that fit the library into the application, set from a service provider's boot method
        $this->app->singleton('larajax.ui', \Larajax\Ui\Classes\UiManager::class);

        $this->app->singleton('larajax.ui.icons', \Larajax\Ui\Classes\IconManager::class);

        // Collects the assets that widgets add during a request
        $this->app->scoped('larajax.ui.assets', \Larajax\Ui\Classes\AssetCollector::class);

        // Collects the file upload fields whose held files commit when their record saves
        $this->app->scoped('larajax.ui.uploads', \Larajax\Ui\Classes\HeldUploads::class);

        // Stores widget preferences, which an application replaces by binding its own store to this code, before or after this provider
        $this->app->bindIf('larajax.ui.preferences', \Larajax\Ui\Classes\PreferenceStore::class);

        $this->app->scoped('system.widgets', \Larajax\Ui\Classes\WidgetManager::class);

        $this->app->singleton('system.preset', \Larajax\Ui\Classes\PresetManager::class);

        $this->app->singleton('model.inspector', \Larajax\Ui\Classes\ModelInspector::class);

        // Gives plain Eloquent models the searchWhere methods used by the widgets
        \Larajax\Ui\Database\SearchWhereMacros::register();

        \Illuminate\Foundation\AliasLoader::getInstance()->alias('Ui', \Larajax\Ui\Facades\Ui::class);
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
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'ui');

        // Sends the widget assets added during an AJAX request with its response
        $this->app['events']->listen(\Illuminate\Routing\Events\PreparingResponse::class, function ($event) {
            if ($event->response instanceof \Larajax\Classes\AjaxResponse && $this->app->resolved('larajax.ui.assets')) {
                $this->app->make('larajax.ui.assets')->addToAjaxResponse($event->response);
            }
        });

        // Commits the files a file upload field held until its record saved
        $this->app['events']->listen('eloquent.saved: *', function ($event, $payload) {
            if ($this->app->resolved('larajax.ui.uploads') && isset($payload[0])) {
                $this->app->make('larajax.ui.uploads')->commitFor($payload[0]);
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
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\MarkdownEditor::class, 'markdown');
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\DataTable::class, 'datatable');
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\Phone::class, 'phone');
        });

        app('system.widgets')->registerFilterWidgets(function ($manager) {
            $manager->registerFilterWidget(\Larajax\Ui\FilterWidgets\Group::class, 'group');
            $manager->registerFilterWidget(\Larajax\Ui\FilterWidgets\Date::class, 'date');
            $manager->registerFilterWidget(\Larajax\Ui\FilterWidgets\Text::class, 'text');
            $manager->registerFilterWidget(\Larajax\Ui\FilterWidgets\Number::class, 'number');
            $manager->registerFilterWidget(\Larajax\Ui\FilterWidgets\Trashed::class, 'trashed');
        });
    }
}