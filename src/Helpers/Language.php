<?php namespace Larajax\Ui\Helpers;

/**
 * Language finds the client-side translations of the library, its rich editor and its grid, plain
 * scripts in languages/ folders that a page loads or bundles. Like the scripts, it serves a locale
 * from the locale, a common alias of it, then its base language: de-AT finds de, pt_BR finds pt-br.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Language
{
    /**
     * @var array SOURCES are the folders of translations, relative to the library assets
     */
    const SOURCES = [
        'ui' => 'languages',
        'richarea' => 'vendor/richarea/languages',
        'hotsheet' => 'vendor/hotsheet/languages',
    ];

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
     * find returns the translation of a source serving a locale, the application locale by default,
     * or null when the source has none and stays in English.
     */
    public static function find(string $source, ?string $locale = null): ?string
    {
        $code = strtolower(str_replace('_', '-', trim($locale ?? app()->getLocale())));
        $base = explode('-', $code)[0];

        $candidates = array_unique(array_filter([$code, static::ALIASES[$code] ?? null, $base, static::ALIASES[$base] ?? null]));

        foreach ($candidates as $candidate) {
            if (preg_match('/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/', $candidate) && is_file(static::path($source, $candidate))) {
                return $candidate;
            }
        }

        return null;
    }

    /**
     * path returns the file of a source's translation.
     */
    public static function path(string $source, string $language): string
    {
        return dirname(__DIR__, 2).'/resources/assets/'.static::SOURCES[$source].'/'.$language.'.js';
    }

    /**
     * paths returns the translation files serving a locale, one per source that has one.
     */
    public static function paths(?string $locale = null): array
    {
        $result = [];

        foreach (array_keys(static::SOURCES) as $source) {
            if ($language = static::find($source, $locale)) {
                $result[$source] = static::path($source, $language);
            }
        }

        return $result;
    }
}
