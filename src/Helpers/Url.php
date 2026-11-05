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
     * @var callable|null urlResolver turns a widget path, such as a record URL, into an address.
     */
    protected static $urlResolver;

    /**
     * @var array<string, callable> linkResolvers turn links with an application scheme into addresses, keyed by scheme.
     */
    protected static $linkResolvers = [];

    /**
     * resolveUrlUsing sets the callback that turns a widget path into an address, or null to use url().
     */
    public static function resolveUrlUsing(?callable $resolver): void
    {
        static::$urlResolver = $resolver;
    }

    /**
     * resolveLinkUsing sets the callback that turns links with the given scheme into an address, or null to remove it.
     */
    public static function resolveLinkUsing(string $scheme, ?callable $resolver): void
    {
        $scheme = strtolower($scheme);

        if ($resolver === null) {
            unset(static::$linkResolvers[$scheme]);
        }
        else {
            static::$linkResolvers[$scheme] = $resolver;
        }
    }

    /**
     * to returns the address for a widget path, or for a link with a registered scheme, which is empty when the link points nowhere.
     */
    public static function to(string $path): string
    {
        if (static::isResolvableLink($path)) {
            return (string) static::resolveLink($path);
        }

        if (static::$urlResolver) {
            return (string) (static::$urlResolver)($path);
        }

        return url($path);
    }

    /**
     * isResolvableLink checks if a link uses a scheme that has a resolver.
     */
    public static function isResolvableLink(string $link): bool
    {
        if (!preg_match('/^([a-z][a-z0-9+.\-]*):\/\//i', $link, $matches)) {
            return false;
        }

        return isset(static::$linkResolvers[strtolower($matches[1])]);
    }

    /**
     * resolveLink returns the address for a link with an application scheme, or null when it points nowhere.
     */
    public static function resolveLink(string $link): ?string
    {
        if (!static::isResolvableLink($link)) {
            return $link;
        }

        $scheme = strtolower(strstr($link, ':', true));
        $url = (static::$linkResolvers[$scheme])($link);

        return is_string($url) && $url !== '' ? $url : null;
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
