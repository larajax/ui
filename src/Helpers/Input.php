<?php namespace Larajax\Ui\Helpers;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Request;
use October\Rain\Html\Helper as HtmlHelper;

/**
 * Input helper reads request values by field name, including HTML array names such as `contact[name]`
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Input
{
    /**
     * get returns a value from the query string, request body or uploaded files, or all of them when no name is given.
     */
    public static function get($name = null, $default = null): mixed
    {
        if ($name === null) {
            return Request::all();
        }

        return Arr::get(Request::all(), HtmlHelper::nameToDot($name), $default);
    }

    /**
     * post returns a value from the body of a POST request, or all of them when no name is given.
     */
    public static function post($name = null, $default = null): mixed
    {
        if (Request::getRealMethod() !== 'POST') {
            return $default;
        }

        if ($name === null) {
            return Request::post();
        }

        return Arr::get(Request::post(), HtmlHelper::nameToDot($name), $default);
    }

    /**
     * file returns an uploaded file, or all of them when no name is given.
     */
    public static function file($name = null, $default = null): mixed
    {
        if ($name === null) {
            return Request::allFiles();
        }

        return Arr::get(Request::allFiles(), HtmlHelper::nameToDot($name), $default);
    }
}
