<?php namespace Larajax\Ui\Helpers;

/**
 * Markdown helper renders markdown in field comments and the markdown editor preview
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Markdown
{
    /**
     * parse renders markdown as HTML, keeping any HTML in the text, through the markdown hook of larajax.ui.
     */
    public static function parse($text): string
    {
        return app('larajax.ui')->markdown((string) $text);
    }

    /**
     * parseSafe renders markdown as HTML, escaping any HTML in the text.
     */
    public static function parseSafe($text): string
    {
        return app('larajax.ui')->markdown((string) $text, true);
    }

    /**
     * parseClean renders markdown as HTML, then sanitizes the result.
     */
    public static function parseClean($text): string
    {
        return app('html')->clean(static::parse($text));
    }
}
