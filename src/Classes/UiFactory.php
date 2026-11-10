<?php namespace Larajax\Ui\Classes;

/**
 * UiFactory creates view-based UI components, behind the Ui facade. The hooks that fit the library
 * into an application are on the larajax.ui service, see UiManager.
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
    use \Larajax\Ui\Classes\UiFactory\HasScoreboards;
    use \Larajax\Ui\Classes\UiFactory\HasCharts;

    /**
     * iconClass resolves a semantic icon key to CSS classes.
     */
    public static function iconClass(string $icon, ?string $pack = null): string
    {
        return app('larajax.ui.icons')->iconClass($icon, $pack);
    }

    /**
     * icon renders an icon element from a semantic icon key.
     */
    public static function icon(string $icon, array $attributes = [], ?string $pack = null): string
    {
        return app('larajax.ui.icons')->icon($icon, $attributes, $pack);
    }

    /**
     * renderAssets returns the `<link>` and `<script>` tags for the assets that widgets added during the request, stylesheets first.
     */
    public static function renderAssets(?string $type = null): \Illuminate\Support\HtmlString
    {
        return new \Illuminate\Support\HtmlString((string) app('larajax.ui.assets')->makeAssets($type));
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
