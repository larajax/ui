<?php

namespace October\Amber;

use Illuminate\Support\ServiceProvider;

class AmberServiceProvider extends ServiceProvider
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

        $this->app->scoped('system.widgets', \October\Amber\Classes\WidgetManager::class);

        $this->app->singleton('system.preset', \October\Amber\Classes\PresetManager::class);

        // Supports the DbDongle facade used for raw SQL parsing in widgets
        $this->app->singleton('db.dongle', function ($app) {
            return new \October\Rain\Database\Dongle(
                $app['db']->connection()->getDriverName(),
                $app['db']
            );
        });

        // Gives plain Eloquent models the searchWhere methods used by the widgets
        \October\Amber\Database\SearchWhereMacros::register();

        \Illuminate\Foundation\AliasLoader::getInstance()->alias('Str', \October\Rain\Support\Str::class);
        \Illuminate\Foundation\AliasLoader::getInstance()->alias('Ui', \October\Amber\Facades\Ui::class);

        // $this->app->singleton('string', function () { return new \October\Rain\Support\Str; });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'amber');

        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../resources' => public_path('vendor/amber'),
            ], 'amber-assets');
        }

        app('system.widgets')->registerFormWidgets(function ($manager) {
            $manager->registerFormWidget(\October\Amber\FormWidgets\Relation::class, 'relation');
            $manager->registerFormWidget(\October\Amber\FormWidgets\FileUpload::class, 'fileupload');
        });

        app('system.widgets')->registerFilterWidgets(function ($manager) {
            $manager->registerFilterWidget(\October\Amber\FilterWidgets\Group::class, 'group');
            $manager->registerFilterWidget(\October\Amber\FilterWidgets\Date::class, 'date');
            $manager->registerFilterWidget(\October\Amber\FilterWidgets\Text::class, 'text');
            $manager->registerFilterWidget(\October\Amber\FilterWidgets\Number::class, 'number');
        });
    }
}
