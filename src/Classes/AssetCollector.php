<?php namespace Larajax\Ui\Classes;

use Larajax\Classes\AjaxResponse;

/**
 * AssetCollector holds the assets that widgets add during a request, printed by `Ui::renderAssets()` and sent with AJAX responses.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class AssetCollector
{
    use \Larajax\Ui\Traits\AssetMaker;

    /**
     * addToAjaxResponse adds the collected assets to an AJAX response, which the browser loads when the page does not have them.
     */
    public function addToAjaxResponse(AjaxResponse $response): void
    {
        if ($this->hasAssetsDefined()) {
            foreach ($this->getAssetPathsWithAttributes() as $type => $paths) {
                $response->asset($type, $paths);
            }
        }
    }

    /**
     * getAssetCollector returns null since this object is the page collector.
     * @return null
     */
    protected function getAssetCollector()
    {
        return null;
    }
}
