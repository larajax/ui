<?php namespace Larajax\Ui\Helpers;

/**
 * Url helper
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Url
{
    /**
     * to returns the address for a widget path, or for a link with a registered scheme, from the hooks in larajax.ui.
     */
    public static function to(string $path): string
    {
        return app('larajax.ui')->url($path);
    }

    /**
     * isResolvableLink checks if a link uses a scheme that has a resolver.
     */
    public static function isResolvableLink(string $link): bool
    {
        return app('larajax.ui')->isResolvableLink($link);
    }

    /**
     * resolveLink returns the address for a link with an application scheme, or null when it points nowhere.
     */
    public static function resolveLink(string $link): ?string
    {
        return app('larajax.ui')->resolveLink($link);
    }

    /**
     * makeRelative returns the path, query and fragment of an address.
     */
    public static function makeRelative(string $url): string
    {
        $fullUrl = url($url);

        return parse_url($fullUrl, PHP_URL_PATH)
            . (($query = parse_url($fullUrl, PHP_URL_QUERY)) ? '?' . $query : '')
            . (($fragment = parse_url($fullUrl, PHP_URL_FRAGMENT)) ? '#' . $fragment : '')
            ?: '/';
    }

    /**
     * replaceParameters fills `:name` parameters in a URL template with the matching values of a record, for example `users/:id` becomes `users/1`.
     */
    public static function replaceParameters($object, string $string): string
    {
        if (!preg_match_all('/\:([\w]+)/', $string, $matches)) {
            return $string;
        }

        if (is_array($object)) {
            $object = (object) $object;
        }

        foreach ($matches[1] as $column) {
            if (
                !isset($object->{$column}) ||
                is_array($object->{$column}) ||
                (is_object($object->{$column}) && !method_exists($object->{$column}, '__toString'))
            ) {
                continue;
            }

            $string = str_replace(':' . $column, urlencode((string) $object->{$column}), $string);
        }

        return $string;
    }
}
