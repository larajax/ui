<?php namespace October\Amber\Classes;

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
 * @package october\amber
 * @author Alexey Bobkov, Samuel Georges
 */
class UiFactory
{
    use \October\Amber\Classes\UiFactory\HasInputs;
    use \October\Amber\Classes\UiFactory\HasButtons;

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
        return new \October\Amber\Classes\UiFactory\Migrate\Callout();
    }
}
