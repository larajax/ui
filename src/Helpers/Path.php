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
     * @var array<string, string> symbols registered by the application, keyed by symbol.
     */
    protected static $symbols = [];

    /**
     * @var callable|null baseDirChecker decides whether a file path may be loaded.
     */
    protected static $baseDirChecker;

    /**
     * checkBaseDirUsing sets the callback that decides whether a file path may be loaded, or null to allow paths inside the base path and the library.
     */
    public static function checkBaseDirUsing(?callable $checker): void
    {
        static::$baseDirChecker = $checker;
    }

    /**
     * registerSymbol adds a symbol that stands for a folder at the start of a path, or removes it when the folder is null.
     */
    public static function registerSymbol(string $symbol, ?string $folder): void
    {
        if ($folder === null) {
            unset(static::$symbols[$symbol]);
        }
        else {
            static::$symbols[$symbol] = $folder;
        }
    }

    /**
     * symbols returns every path symbol with its folder, where `~` is the application base path.
     */
    public static function symbols(): array
    {
        return ['~' => base_path()] + static::$symbols;
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
        if (static::$baseDirChecker) {
            return (bool) (static::$baseDirChecker)($path);
        }

        $realPath = realpath($path);
        if ($realPath === false) {
            return false;
        }

        foreach ([base_path(), dirname(__DIR__, 2)] as $root) {
            if ($realPath === $root || str_starts_with($realPath, rtrim($root, '/\\') . DIRECTORY_SEPARATOR)) {
                return true;
            }
        }

        return false;
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
