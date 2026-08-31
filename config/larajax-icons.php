<?php

return [
    /*
     * The default icon pack used by Ui::icon() and Ui::iconClass().
     * Shipped packs: october, phosphor, bootstrap.
     */
    'default' => env('LARAJAX_ICONS', 'phosphor'),

    /*
     * When true, unknown icon names are returned as raw CSS classes.
     * This keeps existing usages like "icon-pencil" or "ph ph-pencil" working.
     */
    'fallback' => true,

    'packs' => [
        'phosphor' => Larajax\Ui\Classes\Icons\PhosphorIconPack::class,
        'bootstrap' => Larajax\Ui\Classes\Icons\BootstrapIconPack::class,
        'october' => Larajax\Ui\Classes\Icons\OctoberIconPack::class,
    ],

    /*
     * Override any icon key globally, regardless of the selected pack.
     *
     * 'overrides' => [
     *     'tooltip.info' => 'my-icon my-info',
     *     'pagination.next' => 'my-icon my-next',
     * ],
     */
    'overrides' => [],
];