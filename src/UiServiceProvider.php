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
        $this->app->register(\October\Rain\Foundation\Providers\CoreServiceProvider::class);

        $this->app->register(\October\Rain\Html\HtmlServiceProvider::class);

        // Registers the `~` (app base) path symbol used in view and config paths
        $this->app->register(\October\Rain\Filesystem\FilesystemServiceProvider::class);

        $this->app->scoped('system.widgets', \Larajax\Ui\Classes\WidgetManager::class);

        $this->app->singleton('system.preset', \Larajax\Ui\Classes\PresetManager::class);

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
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'ui');

        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../resources/assets' => public_path('vendor/larajax/ui'),
            ], 'larajax-ui-assets');
        }

        app('system.widgets')->registerFormWidgets(function ($manager) {
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\Relation::class, 'relation');
            $manager->registerFormWidget(\Larajax\Ui\FormWidgets\FileUpload::class, 'fileupload');
        });

        app('system.widgets')->registerFilterWidgets(function ($manager) {
            $manager->registerFilterWidget(\Larajax\Ui\FilterWidgets\Group::class, 'group');
            $manager->registerFilterWidget(\Larajax\Ui\FilterWidgets\Date::class, 'date');
            $manager->registerFilterWidget(\Larajax\Ui\FilterWidgets\Text::class, 'text');
            $manager->registerFilterWidget(\Larajax\Ui\FilterWidgets\Number::class, 'number');
        });
    }
}
