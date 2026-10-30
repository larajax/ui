<?php namespace Larajax\Ui\Classes;

use Closure;
use October\Rain\Element\ElementBase;
use Illuminate\Contracts\Support\Htmlable;

/**
 * Implements Htmlable so Blade's escaped {{ }} output renders it as raw HTML.
 *
 * @deprecated
 */
class UiElement extends ElementBase implements Htmlable
{
    use \Larajax\Ui\Traits\ElementRenderer;

    /**
     * toHtml renders the element as raw HTML for Htmlable consumers (e.g. Blade {{ }})
     */
    public function toHtml(): string
    {
        return $this->renderAsString();
    }

    /**
     * __construct
     */
    public function __construct($body = null)
    {
        if (
            is_string($body) ||
            $body instanceof Closure ||
            $body instanceof UiElement
        ) {
            $this->body($body);
        }

        parent::__construct([]);
    }

    /**
     * slot captures the markup up to Ui::end() as the element body, where Ui::slot() switches to the property of that name, such as a callout action.
     */
    public function slot(string $name = 'default'): void
    {
        ViewComponent::using(function (array $slots): string {
            foreach ($slots as $slotName => $html) {
                if (($html = trim((string) $html)) !== '') {
                    $this->config[$slotName === 'default' ? 'body' : $slotName] = $html;
                }
            }

            return $this->renderAsString();
        })->slot($name);
    }
}
