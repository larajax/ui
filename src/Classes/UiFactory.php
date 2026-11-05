<?php namespace Larajax\Ui\Classes;

use Larajax\Ui\Helpers\DateTime as DateTimeHelper;
use Larajax\Ui\Helpers\Markdown as MarkdownHelper;
use Larajax\Ui\Helpers\Path as PathHelper;
use Larajax\Ui\Helpers\Sql as SqlHelper;
use Larajax\Ui\Helpers\Url as UrlHelper;

/**
 * UiFactory creates view-based UI components.
 *
 * Usage:
 *
 *     <?= UiFactory::button(label: 'Save', primary: true) ?>
 *
 *     <?php UiFactory::card(title: 'Settings')->slot() ?>
 *         <p>Content</p>
 *     <?php UiFactory::end() ?>
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class UiFactory
{
    use \Larajax\Ui\Classes\UiFactory\HasInputs;
    use \Larajax\Ui\Classes\UiFactory\HasButtons;

    /**
     * iconClass resolves a semantic icon key to CSS classes.
     */
    public static function iconClass(string $icon, ?string $pack = null): string
    {
        return app(IconManager::class)->iconClass($icon, $pack);
    }

    /**
     * icon renders an icon element from a semantic icon key.
     */
    public static function icon(string $icon, array $attributes = [], ?string $pack = null): string
    {
        return app(IconManager::class)->icon($icon, $attributes, $pack);
    }

    /**
     * registerIconPack adds or replaces an icon pack at runtime.
     */
    public static function registerIconPack(string $name, mixed $pack): IconManager
    {
        return app(IconManager::class)->registerPack($name, $pack);
    }

    /**
     * extendIcons overlays additional icon definitions at runtime for every pack.
     */
    public static function extendIcons(mixed $extension): IconManager
    {
        return app(IconManager::class)->extend($extension);
    }

    /**
     * resolveTimezoneUsing sets the callback that returns the viewer's timezone, used to display dates stored in the app timezone.
     */
    public static function resolveTimezoneUsing(?callable $resolver): void
    {
        DateTimeHelper::resolveTimezoneUsing($resolver);
    }

    /**
     * timezone returns the viewer's timezone.
     */
    public static function timezone(): string
    {
        return DateTimeHelper::userTimezone();
    }

    /**
     * resolveUrlUsing sets the callback that turns widget paths, such as record and toolbar URLs, into addresses.
     */
    public static function resolveUrlUsing(?callable $resolver): void
    {
        UrlHelper::resolveUrlUsing($resolver);
    }

    /**
     * resolveLinkUsing sets the callback that turns links with an application scheme, such as `page://about`, into addresses.
     */
    public static function resolveLinkUsing(string $scheme, ?callable $resolver): void
    {
        UrlHelper::resolveLinkUsing($scheme, $resolver);
    }

    /**
     * url returns the address for a widget path, or for a link with a registered scheme.
     */
    public static function url(string $path): string
    {
        return UrlHelper::to($path);
    }

    /**
     * resolveSqlUsing sets the callback that rewrites the raw SQL in widget definitions, written in MySQL syntax, for the database connection.
     */
    public static function resolveSqlUsing(?callable $resolver): void
    {
        SqlHelper::resolveSqlUsing($resolver);
    }

    /**
     * resolveMarkdownUsing sets the callback that renders markdown in field comments and the markdown editor, given the text and whether to escape HTML in it.
     */
    public static function resolveMarkdownUsing(?callable $resolver): void
    {
        MarkdownHelper::resolveMarkdownUsing($resolver);
    }

    /**
     * registerPathSymbol adds a symbol that stands for a folder at the start of a config or view path, beside `~` for the base path, or removes it when the folder is null.
     */
    public static function registerPathSymbol(string $symbol, ?string $folder): void
    {
        PathHelper::registerSymbol($symbol, $folder);
    }

    /**
     * checkBaseDirUsing sets the callback that decides whether a config or view file may be loaded, by default when it is inside the base path or the library.
     */
    public static function checkBaseDirUsing(?callable $checker): void
    {
        PathHelper::checkBaseDirUsing($checker);
    }

    /**
     * renderAssets returns the `<link>` and `<script>` tags for the assets that widgets added during the request, stylesheets first.
     */
    public static function renderAssets(?string $type = null): \Illuminate\Support\HtmlString
    {
        return new \Illuminate\Support\HtmlString((string) app(AssetCollector::class)->makeAssets($type));
    }

    /**
     * slot switches to a named slot on the current component
     */
    public static function slot(string $name): void
    {
        ViewComponent::captureSlot($name);
    }

    /**
     * end closes the current component and renders it
     */
    public static function end(): void
    {
        ViewComponent::endComponent();
    }

    /**
     * callout creates a callout component, whose body is captured with slot() and whose action area is the "action" slot.
     *
     * Usage:
     *     <?php Ui::callout(label: 'Trial ending', warning: true)->slot() ?>
     *         <p>Add a payment method to keep your projects.</p>
     *     <?php Ui::slot('action') ?>
     *         <?= Ui::ajaxButton(label: 'Add a card', handler: 'onAddCard') ?>
     *     <?php Ui::end() ?>
     *
     * @param string $label Title in the header
     * @param string $comment Text under the title
     * @param bool $success Success styling
     * @param bool $warning Warning styling
     * @param bool $danger Danger styling
     * @param string|bool $icon Icon class, true for the type's icon from the icon pack, or false for none
     * @param bool $commentHtml Render the comment as HTML
     */
    public static function callout(
        string $label = '',
        string $comment = '',
        bool $success = false,
        bool $warning = false,
        bool $danger = false,
        string|bool $icon = true,
        bool $commentHtml = false,
        ...$attributes
    ): ViewComponent {
        return new ViewComponent('callout', compact(
            'label',
            'comment',
            'success',
            'warning',
            'danger',
            'icon',
            'commentHtml'
        ), $attributes);
    }
}
