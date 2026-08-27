<?php namespace Amber\Classes;

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
    use \Amber\Traits\ElementRenderer;

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
}
