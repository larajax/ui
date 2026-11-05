<?php namespace Larajax\Ui\Helpers;

/**
 * Language finds the client-side translations of the library, one plain script per language in the
 * assets' languages/ folder that holds the strings of the widgets, the rich editor and the grid, which
 * a page loads or bundles. Like the scripts, it serves a locale from the locale, a common alias of it,
 * then its base language: de-AT finds de, pt_BR finds pt-br.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Language
{
    /**
     * @var array ALIASES are language codes some applications use in place of the standard ones
     */
    const ALIASES = [
        'kr' => 'ko',
        'no' => 'nb',
        'pt' => 'pt-pt',
        'rs' => 'sr',
        'ua' => 'uk',
        'vn' => 'vi',
        'zh' => 'zh-cn',
    ];

    /**
     * find returns the language with a file serving a locale, the application locale by default, or
     * null when there is none and the widgets stay in English.
     */
    public static function find(?string $locale = null): ?string
    {
        $code = strtolower(str_replace('_', '-', trim($locale ?? app()->getLocale())));
        $base = explode('-', $code)[0];

        $candidates = array_unique(array_filter([$code, static::ALIASES[$code] ?? null, $base, static::ALIASES[$base] ?? null]));

        foreach ($candidates as $candidate) {
            if (preg_match('/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/', $candidate) && is_file(static::path($candidate))) {
                return $candidate;
            }
        }

        return null;
    }

    /**
     * path returns the file of a language.
     */
    public static function path(string $language): string
    {
        return dirname(__DIR__, 2).'/resources/assets/languages/'.$language.'.js';
    }
}
