<?php namespace Larajax\Ui\Classes;

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
     * callout
     */
    public static function callout()
    {
        return new \Larajax\Ui\Classes\UiFactory\Migrate\Callout();
    }
}
