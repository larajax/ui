<?php namespace Larajax\Ui\Traits;

use Html;

/**
 * AssetMaker Trait
 * Adds asset based methods to a class
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
trait AssetMaker
{
    /**
     * @var array Collection of assets to display in the layout.
     */
    protected $assets = ['js' => [], 'css' => []];

    /**
     * @var string|null assetPath specifies the relative path to the asset directory, where null resolves relative names against the public root.
     */
    public $assetPath;

    /**
     * @var string assetDefaults is the default attributes for assets.
     */
    protected $assetDefaults = ['build' => 'core'];

    /**
     * flushAssets disables the use, and subsequent broadcast, of assets. This is useful
     * to call during an AJAX request to speed things up. This method works
     * by specifically targeting the hasAssetsDefined method.
     *
     * @return void
     */
    public function flushAssets()
    {
        $this->assets = ['js' => [], 'css' => []];
    }

    /**
     * makeAssets outputs `<link>` and `<script>` tags to load assets previously added with addJs and addCss method calls
     * @param string $type Return an asset collection of a given type (css, js) or null for all.
     * @return string
     */
    public function makeAssets($type = null)
    {
        if ($type != null) {
            $type = strtolower($type);
        }

        // Prevent duplicates
        $this->removeDuplicateAssets();

        $result = null;

        // StyleSheet
        if ($type == null || $type == 'css') {
            foreach ($this->assets['css'] as $asset) {
                if ($attributes = $this->renderAssetAttributes('css', $asset)) {
                    $result .= "<link {$attributes} />" . PHP_EOL;
                }
            }
        }

        // JavaScript
        if ($type == null || $type == 'js') {
            foreach ($this->assets['js'] as $asset) {
                if ($attributes = $this->renderAssetAttributes('js', $asset)) {
                    $result .= "<script {$attributes}></script>" . PHP_EOL;
                }
            }
        }

        return $result;
    }

    /**
     * addJs includes a JavaScript asset to the asset list
     */
    public function addJs($name, $attributes = [])
    {
        $jsPath = $this->getAssetPath($name);
        $attributes = $this->processAssetAttributes($attributes);

        if ($collector = $this->getAssetCollector()) {
            $collector->addJs($jsPath, $attributes);
        }

        $jsPath = $this->getAssetScheme($jsPath);

        $this->assets['js'][] = ['path' => $jsPath, 'attributes' => $attributes];
    }

    /**
     * addCss includes a StyleSheet asset to the asset list
     */
    public function addCss($name, $attributes = [])
    {
        $cssPath = $this->getAssetPath($name);
        $attributes = $this->processAssetAttributes($attributes);

        if ($collector = $this->getAssetCollector()) {
            $collector->addCss($cssPath, $attributes);
        }

        $cssPath = $this->getAssetScheme($cssPath);

        $this->assets['css'][] = ['path' => $cssPath, 'attributes' => $attributes];
    }

    /**
     * getAssetPaths returns an array of all registered asset paths.
     * @return array
     */
    public function getAssetPaths()
    {
        $this->removeDuplicateAssets();

        $assets = [];

        foreach ($this->assets as $type => $collection) {
            $assets[$type] = [];
            foreach ($collection as $asset) {
                $assets[$type][] = $this->getAssetEntryBuildPath($asset);
            }
        }

        return $assets;
    }

    /**
     * getAssetPathsWithAttributes returns an array of all registered asset paths
     * with their attributes, suitable for use with ajax()->asset().
     *
     * Returns format: ['js' => [path => attributes, ...], 'css' => [...], ...]
     *
     * @return array
     */
    public function getAssetPathsWithAttributes()
    {
        $this->removeDuplicateAssets();

        // Internal attributes to be excluded from output
        $reserved = ['build'];

        $assets = [];

        foreach ($this->assets as $type => $collection) {
            $assets[$type] = [];
            foreach ($collection as $asset) {
                $path = $this->getAssetEntryBuildPath($asset);
                $attributes = array_except(array_get($asset, 'attributes', []), $reserved);
                $assets[$type][$path] = $attributes;
            }
        }

        return $assets;
    }

    /**
     * getAssetPath locates a file based on it's definition. If the file starts with
     * a forward slash, it will be returned in context of the application public path,
     * otherwise it will be returned in context of the asset path.
     * @param string $fileName File to load.
     * @param string $assetPath Explicitly define an asset path.
     * @return string Relative path to the asset file.
     */
    public function getAssetPath($fileName, $assetPath = null)
    {
        if (
            str_starts_with($fileName, '//') ||
            str_starts_with($fileName, 'http://') ||
            str_starts_with($fileName, 'https://')
        ) {
            return $fileName;
        }

        if (!$assetPath) {
            $assetPath = $this->assetPath;
        }

        if ($assetPath === null || substr($fileName, 0, 1) == '/') {
            return $fileName;
        }

        return $assetPath . '/' . $fileName;
    }

    /**
     * hasAssetsDefined returns true if assets any have been added
     */
    public function hasAssetsDefined(): bool
    {
        return count($this->assets, COUNT_RECURSIVE) > 2;
    }

    /**
     * getAssetCollector returns the page asset collector that also receives the assets added to this object.
     * @return \Larajax\Ui\Classes\AssetCollector|null
     */
    protected function getAssetCollector()
    {
        return app(\Larajax\Ui\Classes\AssetCollector::class);
    }

    /**
     * processAssetAttributes
     */
    protected function processAssetAttributes($attributes)
    {
        // Attributes can be a scalar when used as a build reference
        if (is_scalar($attributes)) {
            $attributes = ['build' => $attributes];
        }

        // Type check
        if (!is_array($attributes)) {
            $attributes = [];
        }

        // Merge in defaults
        $attributes = array_merge((array) $this->assetDefaults, $attributes);

        return $attributes;
    }

    /**
     * getAssetEntryBuildPath is an internal marker that returns the asset path
     * @return string
     */
    protected function getAssetEntryBuildPath($asset)
    {
        return $asset['path'];
    }

    /**
     * getAssetScheme is an internal helper to get the asset scheme.
     */
    protected function getAssetScheme(string $asset): string
    {
        if (
            str_starts_with($asset, '//') ||
            str_starts_with($asset, 'http://') ||
            str_starts_with($asset, 'https://')
        ) {
            return $asset;
        }

        return asset($asset);
    }

    /**
     * removeDuplicateAssets removes duplicate and global assets from the entire collection
     */
    protected function removeDuplicateAssets()
    {
        $removeFunc = function($group, $removeGlobal) {
            foreach ($group as &$collection) {
                $pathCache = [];
                foreach ($collection as $key => $asset) {
                    if (!$path = array_get($asset, 'path')) {
                        continue;
                    }

                    // Asset is global
                    if ($removeGlobal && array_get($asset, 'attributes.build') === 'global') {
                        array_forget($collection, $key);
                        continue;
                    }

                    // Already seen asset
                    if (isset($pathCache[$path])) {
                        array_forget($collection, $key);
                        continue;
                    }

                    $pathCache[$path] = true;
                }
            }

            return $group;
        };

        $this->assets = $removeFunc($this->assets, request()->ajax());
    }

    /**
     * renderAssetAttributes takes an asset definition and returns the necessary HTML output
     */
    protected function renderAssetAttributes(string $type, array $asset): string
    {
        if (!$path = $this->getAssetEntryBuildPath($asset)) {
            return '';
        }

        // Internal attributes to be purged
        // - build: the unique build code for cache busting
        $reserved = ['build'];
        $userAttrs = array_except(array_get($asset, 'attributes', []), $reserved);

        // Determine final attributes
        $attrs = [];
        if ($type === 'css') {
            $attrs['rel'] = 'stylesheet';
            $attrs['href'] = $path;
        }
        elseif ($type === 'js') {
            $attrs['src'] = $path;
        }

        // Generate HTML attribute string
        return trim(Html::attributes(array_merge($attrs, $userAttrs)));
    }
}
