<?php namespace Larajax\Ui\ListWidgets;

use Larajax\Ui\Classes\ListWidgetBase;
use Larajax\Ui\Helpers\Url as UrlHelper;

/**
 * Linkage renders a column value as a link, to the value itself or to a `linkUrl` with
 * the record's attributes filled in, leaving unsafe addresses as plain text.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Linkage extends ListWidgetBase
{
    /**
     * renderValue renders the link for a record.
     */
    public function renderValue($record, $value)
    {
        $column = $this->column;

        // Handle array value from custom link function: [$url, $text]
        if (is_array($value) && count($value) === 2) {
            $linkUrl = $value[0];
            $linkText = $value[1];
        }
        else {
            // Build link URL - always process linkUrl config with parameter replacement
            if ($column->linkUrl) {
                $linkUrl = UrlHelper::replaceParameters($record, $column->linkUrl);
                if (
                    !str_starts_with($linkUrl, '//') &&
                    !str_starts_with($linkUrl, 'http://') &&
                    !str_starts_with($linkUrl, 'https://') &&
                    !UrlHelper::isResolvableLink($linkUrl)
                ) {
                    $linkUrl = UrlHelper::to($linkUrl);
                }
            }
            else {
                $linkUrl = $value;
            }

            // Determine link text - prefer config, fall back to value
            $linkText = $column->linkText ?: $value;

            // When no value exists, use URL for both value and text
            if (!$value && $column->linkUrl) {
                $value = $linkUrl;
                if (!$column->linkText) {
                    $linkText = $linkUrl;
                }
            }
        }

        // Links with an application scheme, such as a page reference, resolve to their address
        if (UrlHelper::isResolvableLink((string) $linkUrl)) {
            $isDefault = $linkUrl === $linkText;
            $linkUrl = UrlHelper::resolveLink($linkUrl);
            if (!$linkUrl) {
                $value = null;
            }
            elseif ($isDefault) {
                $linkText = UrlHelper::makeRelative($linkUrl);
            }
        }

        if (!$this->isSafeLinkageUrl((string) $linkUrl)) {
            return $column->getDisplayValue($linkText);
        }

        return $this->makePartial('linkage', [
            'attributes' => (array) $column->attributes,
            'linkText' => $linkText,
            'linkUrl' => $linkUrl,
            'column' => $column,
            'value' => $value
        ]);
    }

    /**
     * isSafeLinkageUrl allows relative URLs and a short list of schemes, since browsers ignore control characters inside a scheme.
     */
    protected function isSafeLinkageUrl(string $url): bool
    {
        $url = preg_replace('/[\x00-\x20\x7f]+/', '', $url);

        if (!preg_match('/^([a-z][a-z0-9+.\-]*):/i', $url, $matches)) {
            return true;
        }

        return in_array(strtolower($matches[1]), ['http', 'https', 'ftp', 'ftps', 'mailto', 'tel', 'sms'], true);
    }
}
