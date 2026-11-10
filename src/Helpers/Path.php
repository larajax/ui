<?php namespace Larajax\Ui\Helpers;

use ReflectionClass;

/**
 * Path helper resolves path symbols, such as `~` for the application base path, and keeps file paths inside the base path
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Path
{
    /**
     * symbols returns every path symbol with its folder, where `~` is the application base path, from larajax.ui.
     */
    public static function symbols(): array
    {
        return app('larajax.ui')->pathSymbols();
    }

    /**
     * isSymbol returns the symbol a path starts with, or false when it has none.
     */
    public static function isSymbol($path): string|false
    {
        if (!is_string($path) || $path === '') {
            return false;
        }

        $firstChar = substr($path, 0, 1);

        return array_key_exists($firstChar, static::symbols()) ? $firstChar : false;
    }

    /**
     * symbolize replaces the symbol a path starts with by its folder, returning the path, or the default when one is given, if it has no symbol.
     */
    public static function symbolize($path, $default = false)
    {
        if (!$symbol = static::isSymbol($path)) {
            return $default === false ? $path : $default;
        }

        return static::symbols()[$symbol] . substr($path, 1);
    }

    /**
     * checkBaseDir returns true when a file path may be loaded, which by default is when it exists inside the application base path or the library's own folder.
     */
    public static function checkBaseDir($path): bool
    {
        return app('larajax.ui')->checkBaseDir($path);
    }

    /**
     * localToPublic returns a local path relative to the application base path with forward slashes, or null when it is outside it.
     */
    public static function localToPublic(string $path): ?string
    {
        $basePath = base_path();

        if (strpos($path, $basePath) === 0) {
            return str_replace('\\', '/', substr($path, strlen($basePath)));
        }

        return null;
    }

    /**
     * anyname returns a path without its file extension.
     */
    public static function anyname(string $path): string
    {
        return strpos(basename($path), '.') !== false ? substr($path, 0, strrpos($path, '.')) : $path;
    }

    /**
     * fromClass returns the path to the file that defines a class.
     */
    public static function fromClass($className): string|false
    {
        return (new ReflectionClass($className))->getFileName();
    }
}
