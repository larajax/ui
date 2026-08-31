<?php namespace Larajax\Ui\Classes;

use Illuminate\View\ComponentAttributeBag;
use Larajax\Ui\Classes\Icons\IconPack;

/**
 * IconManager resolves semantic icon names to concrete CSS classes.
 */
class IconManager
{
    protected array $packs = [];

    protected array $extensions = [];

    protected array $resolved = [];

    /**
     * iconClass resolves an icon key to CSS classes.
     */
    public function iconClass(string $icon, ?string $pack = null): string
    {
        $icon = trim($icon);

        if ($icon === '') {
            return '';
        }

        $icons = $this->resolvePack($pack);

        if (array_key_exists($icon, $icons)) {
            return $this->normalizeIconClass($icons[$icon]);
        }

        return $this->usesFallback() ? $icon : '';
    }

    /**
     * icon renders an icon element with resolved CSS classes.
     */
    public function icon(string $icon, array $attributes = [], ?string $pack = null): string
    {
        $class = $this->iconClass($icon, $pack);

        if ($class === '') {
            return '';
        }

        $attributes['class'] = trim($class . ' ' . $this->normalizeAttributeClass($attributes['class'] ?? ''));
        $attributes['aria-hidden'] ??= 'true';

        return '<i ' . (new ComponentAttributeBag($attributes)) . '></i>';
    }

    /**
     * icons returns the full resolved icon map for a pack.
     */
    public function icons(?string $pack = null): array
    {
        return $this->resolvePack($pack);
    }

    /**
     * registerPack adds or replaces an icon pack at runtime.
     */
    public function registerPack(string $name, mixed $pack): static
    {
        $this->packs[$name] = $pack;
        $this->resolved = [];

        return $this;
    }

    /**
     * extend overlays additional icon definitions at runtime for every pack.
     */
    public function extend(mixed $extension): static
    {
        $this->extensions[] = $extension;
        $this->resolved = [];

        return $this;
    }

    protected function resolvePack(?string $pack = null): array
    {
        $pack = $pack ?: (string) config('larajax-icons.default', 'phosphor');
        $pack = $pack !== '' ? $pack : 'phosphor';

        if (isset($this->resolved[$pack])) {
            return $this->resolved[$pack];
        }

        $packs = array_merge((array) config('larajax-icons.packs', []), $this->packs);
        $icons = $this->resolvePackDefinition($packs[$pack] ?? []);
        $icons = $this->applyConfiguredOverrides($icons);
        $icons = $this->applyRuntimeExtensions($icons, $pack);

        return $this->resolved[$pack] = $icons;
    }

    protected function resolvePackDefinition(mixed $definition): array
    {
        if ($definition instanceof IconPack) {
            return $definition->icons();
        }

        if (is_array($definition)) {
            return $definition;
        }

        if (is_string($definition) && class_exists($definition)) {
            $definition = app($definition);

            if ($definition instanceof IconPack) {
                return $definition->icons();
            }

            if (is_object($definition) && method_exists($definition, 'icons')) {
                return (array) $definition->icons();
            }
        }

        if (is_callable($definition)) {
            return (array) $definition();
        }

        return [];
    }

    protected function applyConfiguredOverrides(array $icons): array
    {
        return array_replace($icons, (array) config('larajax-icons.overrides', []));
    }

    protected function applyRuntimeExtensions(array $icons, string $pack): array
    {
        foreach ($this->extensions as $extension) {
            if (is_array($extension)) {
                $icons = array_replace($icons, $extension);
            }
            elseif (is_callable($extension)) {
                $result = $extension($icons, $pack);
                $icons = is_array($result) ? $result : $icons;
            }
        }

        return $icons;
    }

    protected function normalizeIconClass(mixed $value): string
    {
        if (is_array($value)) {
            $value = end($value);
        }

        return trim((string) $value);
    }

    protected function normalizeAttributeClass(mixed $value): string
    {
        if (is_array($value)) {
            return trim(implode(' ', array_filter($value)));
        }

        return trim((string) $value);
    }

    protected function usesFallback(): bool
    {
        return (bool) config('larajax-icons.fallback', true);
    }
}