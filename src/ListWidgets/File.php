<?php namespace Larajax\Ui\ListWidgets;

use Larajax\Ui\Classes\ListWidgetBase;

/**
 * File renders an icon for each file attached in a column, linked to the file when the
 * column is not clickable.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class File extends ListWidgetBase
{
    //
    // Configurable Properties
    //

    /**
     * @var int limit of files shown in a cell.
     */
    public $limit = 3;

    /**
     * init the widget
     */
    public function init()
    {
        $this->fillFromConfig([
            'limit',
        ]);
    }

    /**
     * renderValue renders the icons of a record's files.
     */
    public function renderValue($record, $value)
    {
        $files = [];

        // File model
        if (isset($record->attachMany[$this->columnName])) {
            $files = $value->count() ? $value->all() : [];
        }
        elseif (isset($record->attachOne[$this->columnName])) {
            $files = $value ? [$value] : [];
        }
        // File models of a plain Eloquent relation
        else {
            $files = $this->getAttachmentsFromValue($value);
        }

        if (!$files) {
            return '';
        }

        $totalFiles = count($files);
        $files = array_slice($files, 0, $this->limit);

        $fileItems = [];
        foreach ($files as $file) {
            $fileItems[] = [
                'url' => $file->getPath(),
                'name' => $file->file_name,
                'icon' => $this->getFileTypeIcon(method_exists($file, 'getExtension') ? $file->getExtension() : pathinfo($file->file_name, PATHINFO_EXTENSION)),
            ];
        }

        return $this->makePartial('file', [
            'totalFiles' => $totalFiles,
            'fileItems' => $fileItems,
            'column' => $this->column,
        ]);
    }

    /**
     * getFileTypeIcon returns the appropriate semantic icon for a file extension
     */
    protected function getFileTypeIcon(string $extension): string
    {
        $extension = strtolower($extension);

        $iconMap = [
            // Archives
            'zip' => 'file-zip',
            'rar' => 'file-archive',
            'tar' => 'file-archive',
            'gz' => 'file-archive',
            '7z' => 'file-archive',

            // Documents
            'pdf' => 'file-pdf',
            'doc' => 'file-doc',
            'docx' => 'file-doc',
            'txt' => 'file-text',
            'rtf' => 'file-text',

            // Spreadsheets
            'xls' => 'file-xls',
            'xlsx' => 'file-xls',
            'csv' => 'file-csv',

            // Presentations
            'ppt' => 'file-ppt',
            'pptx' => 'file-ppt',

            // Images
            'jpg' => 'file-jpg',
            'jpeg' => 'file-jpg',
            'png' => 'file-png',
            'gif' => 'file-image',
            'bmp' => 'file-image',
            'webp' => 'file-image',
            'svg' => 'file-svg',

            // Audio
            'mp3' => 'file-audio',
            'wav' => 'file-audio',
            'ogg' => 'file-audio',
            'flac' => 'file-audio',
            'aac' => 'file-audio',

            // Video
            'mp4' => 'file-video',
            'avi' => 'file-video',
            'mov' => 'file-video',
            'wmv' => 'file-video',
            'mkv' => 'file-video',
            'webm' => 'file-video',

            // Code
            'html' => 'file-html',
            'htm' => 'file-html',
            'css' => 'file-css',
            'js' => 'file-js',
            'jsx' => 'file-jsx',
            'ts' => 'file-ts',
            'tsx' => 'file-tsx',
            'vue' => 'file-vue',
            'sql' => 'file-sql',
            'rs' => 'file-rs',
            'php' => 'file-code',
            'py' => 'file-code',
            'rb' => 'file-code',
            'java' => 'file-code',
            'c' => 'file-code',
            'cpp' => 'file-code',
            'h' => 'file-code',
            'json' => 'file-code',
            'xml' => 'file-code',
            'yaml' => 'file-code',
            'yml' => 'file-code',
        ];

        $icon = $iconMap[$extension] ?? 'default';

        return 'file.type.' . (str_starts_with($icon, 'file-') ? substr($icon, 5) : $icon);
    }
}
