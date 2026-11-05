<?php namespace Larajax\Ui\Helpers;

use Illuminate\Support\Str as StrBase;

/**
 * Str helper adds class name methods to Laravel's string helper
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Str extends StrBase
{
    /**
     * normalizeClassName returns a class name, from a name or an object, without a leading backslash.
     */
    public static function normalizeClassName($name): string
    {
        if (is_object($name)) {
            $name = get_class($name);
        }

        return ltrim($name, '\\');
    }

    /**
     * getClassId returns a lowercase identifier for a class, from a name or an object, with underscores between its namespace parts.
     */
    public static function getClassId($name): string
    {
        return strtolower(str_replace('\\', '_', static::normalizeClassName($name)));
    }

    /**
     * getClassNamespace returns the namespace of a class, from a name or an object.
     */
    public static function getClassNamespace($name): string
    {
        $name = static::normalizeClassName($name);

        return substr($name, 0, strrpos($name, '\\'));
    }

    /**
     * getPrecedingSymbols returns the number of times a symbol repeats at the start of a string.
     */
    public static function getPrecedingSymbols(string $string, string $symbol): int
    {
        return strlen($string) - strlen(ltrim($string, $symbol));
    }
}
