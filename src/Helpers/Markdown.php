<?php namespace Larajax\Ui\Helpers;

use Illuminate\Support\Str;

/**
 * Markdown helper renders markdown in field comments and the markdown editor preview
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Markdown
{
    /**
     * @var callable|null markdownResolver renders markdown, given the text and whether HTML in it is escaped.
     */
    protected static $markdownResolver;

    /**
     * resolveMarkdownUsing sets the callback that renders markdown, given the text and whether HTML in it is escaped, or null to use CommonMark.
     */
    public static function resolveMarkdownUsing(?callable $resolver): void
    {
        static::$markdownResolver = $resolver;
    }

    /**
     * parse renders markdown as HTML, keeping any HTML in the text.
     */
    public static function parse($text): string
    {
        if (static::$markdownResolver) {
            return (string) (static::$markdownResolver)((string) $text, false);
        }

        return Str::markdown((string) $text);
    }

    /**
     * parseSafe renders markdown as HTML, escaping any HTML in the text.
     */
    public static function parseSafe($text): string
    {
        if (static::$markdownResolver) {
            return (string) (static::$markdownResolver)((string) $text, true);
        }

        return Str::markdown((string) $text, [
            'html_input' => 'escape',
            'allow_unsafe_links' => false,
        ]);
    }

    /**
     * parseClean renders markdown as HTML, then sanitizes the result.
     */
    public static function parseClean($text): string
    {
        return app('html')->clean(static::parse($text));
    }
}
