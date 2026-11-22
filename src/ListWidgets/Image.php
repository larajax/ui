<?php namespace Larajax\Ui\ListWidgets;

use Larajax\Ui\Classes\ListWidgetBase;

/**
 * Image renders thumbnails of the images in a column, from file models or from stored
 * paths and URLs.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Image extends ListWidgetBase
{
    //
    // Configurable Properties
    //

    /**
     * @var int width of each thumbnail.
     */
    public $width = 68;

    /**
     * @var int height of each thumbnail.
     */
    public $height = 68;

    /**
     * @var int limit of thumbnails shown in a cell.
     */
    public $limit = 3;

    /**
     * @var array options passed to the file model when it makes a thumbnail.
     */
    public $options = [];

    /**
     * init the widget
     */
    public function init()
    {
        $this->fillFromConfig([
            'width',
            'height',
            'limit',
            'options',
        ]);
    }

    /**
     * renderValue renders the thumbnails of a record's images.
     */
    public function renderValue($record, $value)
    {
        $images = [];

        // File model
        if (isset($record->attachMany[$this->columnName])) {
            $images = $value->count() ? $value->all() : [];
        }
        elseif (isset($record->attachOne[$this->columnName])) {
            $images = $value ? [$value] : [];
        }
        // File models of a plain Eloquent relation
        elseif ($this->isAttachmentValue($value) || $value instanceof \Illuminate\Support\Collection) {
            $images = $this->getAttachmentsFromValue($value);
        }
        // Path or URL value
        else {
            foreach ((array) $value as $val) {
                if (is_array($val)) {
                    return '';
                }
                if (strlen($val)) {
                    $images[] = $val;
                }
            }
        }

        if (!$images) {
            return '';
        }

        $totalImages = count($images);
        $images = array_slice($images, 0, $this->limit);

        $imageUrls = [];
        foreach ($images as $image) {
            $imageUrls[] = $this->getImageThumbUrl($image);
        }

        return $this->makePartial('image', [
            'totalImages' => $totalImages,
            'imageUrls' => $imageUrls,
            'isDefaultSize' => $this->getConfig('width') === null && $this->getConfig('height') === null,
            'width' => $this->width,
            'height' => $this->height
        ]);
    }

    /**
     * getImageThumbUrl returns the thumbnail URL for an image, a file model or a stored
     * path or URL, which is used as it is.
     * @return string
     */
    protected function getImageThumbUrl($image)
    {
        return is_object($image) && method_exists($image, 'getThumb')
            ? $image->getThumb($this->width, $this->height, $this->options)
            : $image;
    }
}
