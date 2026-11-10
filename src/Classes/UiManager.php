<?php namespace Larajax\Ui\Classes;

use Illuminate\Support\Str;
use Larajax\Ui\Helpers\DateTime as DateTimeHelper;
use DateTimeZone;
use Exception;

/**
 * UiManager holds the hooks that fit the library into an application, such as how widget paths
 * become addresses, which timezone dates show in and how markdown renders, and applies them.
 * It is bound in the container as `larajax.ui`, and an application sets its hooks from a service
 * provider's boot method.
 *
 * Usage:
 *
 *     app('larajax.ui')->resolveUrlUsing(fn ($path) => url('admin/'.$path));
 *     app('larajax.ui')->resolveTimezoneUsing(fn () => auth()->user()?->timezone);
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class UiManager
{
    /**
     * @var callable|null urlResolver turns a widget path, such as a record URL, into an address.
     */
    protected $urlResolver;

    /**
     * @var array<string, callable> linkResolvers turn links with an application scheme into addresses, keyed by scheme.
     */
    protected $linkResolvers = [];

    /**
     * @var callable|null timezoneResolver returns the timezone of the person viewing the page.
     */
    protected $timezoneResolver;

    /**
     * @var callable|null sqlResolver rewrites raw SQL written in MySQL syntax for the database connection.
     */
    protected $sqlResolver;

    /**
     * @var callable|null markdownResolver renders markdown, given the text and whether HTML in it is escaped.
     */
    protected $markdownResolver;

    /**
     * @var array<string, string> pathSymbols registered by the application, keyed by symbol.
     */
    protected $pathSymbols = [];

    /**
     * @var callable|null baseDirChecker decides whether a config or view file may be loaded.
     */
    protected $baseDirChecker;

    //
    // URLs
    //

    /**
     * resolveUrlUsing sets the callback that turns widget paths, such as record and toolbar URLs, into addresses, or null to use url().
     */
    public function resolveUrlUsing(?callable $resolver): void
    {
        $this->urlResolver = $resolver;
    }

    /**
     * resolveLinkUsing sets the callback that turns links with an application scheme, such as `page://about`, into addresses, or null to remove it.
     */
    public function resolveLinkUsing(string $scheme, ?callable $resolver): void
    {
        $scheme = strtolower($scheme);

        if ($resolver === null) {
            unset($this->linkResolvers[$scheme]);
        }
        else {
            $this->linkResolvers[$scheme] = $resolver;
        }
    }

    /**
     * url returns the address for a widget path, or for a link with a registered scheme, which is empty when the link points nowhere.
     */
    public function url(string $path): string
    {
        if ($this->isResolvableLink($path)) {
            return (string) $this->resolveLink($path);
        }

        if ($this->urlResolver) {
            return (string) ($this->urlResolver)($path);
        }

        return url($path);
    }

    /**
     * isResolvableLink checks if a link uses a scheme that has a resolver.
     */
    public function isResolvableLink(string $link): bool
    {
        if (!preg_match('/^([a-z][a-z0-9+.\-]*):\/\//i', $link, $matches)) {
            return false;
        }

        return isset($this->linkResolvers[strtolower($matches[1])]);
    }

    /**
     * resolveLink returns the address for a link with an application scheme, or null when it points nowhere.
     */
    public function resolveLink(string $link): ?string
    {
        if (!$this->isResolvableLink($link)) {
            return $link;
        }

        $scheme = strtolower(strstr($link, ':', true));
        $url = ($this->linkResolvers[$scheme])($link);

        return is_string($url) && $url !== '' ? $url : null;
    }

    //
    // Timezone
    //

    /**
     * resolveTimezoneUsing sets the callback that returns the viewer's timezone, used to display dates stored in the app timezone, or null to use the app timezone.
     */
    public function resolveTimezoneUsing(?callable $resolver): void
    {
        $this->timezoneResolver = $resolver;
    }

    /**
     * timezone returns the viewer's timezone, falling back to the app timezone when the resolver gives an invalid one.
     */
    public function timezone(): string
    {
        $timezone = $this->timezoneResolver ? ($this->timezoneResolver)() : null;

        if ($timezone instanceof DateTimeZone) {
            return $timezone->getName();
        }

        if (is_string($timezone) && $timezone !== '') {
            try {
                return (new DateTimeZone($timezone))->getName();
            }
            catch (Exception $ex) {
                // Fall back to the app timezone
            }
        }

        return DateTimeHelper::appTimezone();
    }

    //
    // SQL
    //

    /**
     * resolveSqlUsing sets the callback that rewrites the raw SQL in widget definitions, written in MySQL syntax, for the database connection, or null to run it as written.
     */
    public function resolveSqlUsing(?callable $resolver): void
    {
        $this->sqlResolver = $resolver;
    }

    /**
     * hasSqlResolver returns true when raw SQL is rewritten, so widgets write it in MySQL syntax.
     */
    public function hasSqlResolver(): bool
    {
        return $this->sqlResolver !== null;
    }

    /**
     * resolveSql passes raw SQL through the resolver, when one is set.
     */
    public function resolveSql(string $sql): string
    {
        return $this->sqlResolver ? (string) ($this->sqlResolver)($sql) : $sql;
    }

    //
    // Markdown
    //

    /**
     * resolveMarkdownUsing sets the callback that renders markdown in field comments and the markdown editor, given the text and whether to escape HTML in it, or null to use CommonMark.
     */
    public function resolveMarkdownUsing(?callable $resolver): void
    {
        $this->markdownResolver = $resolver;
    }

    /**
     * markdown renders markdown as HTML, escaping any HTML in the text when safe.
     */
    public function markdown(string $text, bool $safe = false): string
    {
        if ($this->markdownResolver) {
            return (string) ($this->markdownResolver)($text, $safe);
        }

        return $safe
            ? Str::markdown($text, ['html_input' => 'escape', 'allow_unsafe_links' => false])
            : Str::markdown($text);
    }

    //
    // Paths
    //

    /**
     * registerPathSymbol adds a symbol that stands for a folder at the start of a config or view path, beside `~` for the base path, or removes it when the folder is null.
     */
    public function registerPathSymbol(string $symbol, ?string $folder): void
    {
        if ($folder === null) {
            unset($this->pathSymbols[$symbol]);
        }
        else {
            $this->pathSymbols[$symbol] = $folder;
        }
    }

    /**
     * pathSymbols returns every path symbol with its folder, where `~` is the application base path.
     */
    public function pathSymbols(): array
    {
        return ['~' => base_path()] + $this->pathSymbols;
    }

    /**
     * checkBaseDirUsing sets the callback that decides whether a config or view file may be loaded, or null to allow files inside the base path or the library.
     */
    public function checkBaseDirUsing(?callable $checker): void
    {
        $this->baseDirChecker = $checker;
    }

    /**
     * checkBaseDir returns true when a file path may be loaded, which by default is when it exists inside the application base path or the library's own folder.
     */
    public function checkBaseDir($path): bool
    {
        if ($this->baseDirChecker) {
            return (bool) ($this->baseDirChecker)($path);
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
}
