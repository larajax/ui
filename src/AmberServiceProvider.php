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

        $this->app->scoped('system.widgets', \October\Amber\Classes\WidgetManager::class);

        \Illuminate\Foundation\AliasLoader::getInstance()->alias('Str', \October\Rain\Support\Str::class);

        // $this->app->singleton('string', function () { return new \October\Rain\Support\Str; });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../resources' => public_path('vendor/amber'),
            ], 'amber-assets');
        }

        app('system.widgets')->registerFormWidgets(function ($manager) {
            $manager->registerFormWidget(\October\Amber\FormWidgets\Relation::class, 'relation');
            $manager->registerFormWidget(\October\Amber\FormWidgets\FileUpload::class, 'fileupload');
        });
    }
}
