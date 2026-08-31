<?php namespace Larajax\Ui\Classes\Icons;

class BootstrapIconPack implements IconPack
{
    public function icons(): array
    {
        return [
            'action.delete' => 'bi bi-trash',

            'search.clear' => 'bi bi-x',

            'filter.menu' => 'bi bi-funnel',
            'filter.clear' => 'bi bi-eraser',

            'checkboxlist.select_all' => 'bi bi-check2-square',
            'checkboxlist.clear' => 'bi bi-eraser',

            'tooltip.info' => 'bi bi-info-circle',

            'fileupload.upload' => 'bi bi-upload',
            'fileupload.remove' => 'bi bi-trash',
            'fileupload.reorder' => 'bi bi-grip-vertical',
            'fileupload.attachment' => 'bi bi-paperclip',
            'fileupload.error' => 'bi bi-exclamation-triangle',

            'list.reorder' => 'bi bi-grip-vertical',
            'list.switch.true' => 'bi bi-check-lg',
            'list.switch.false' => 'bi bi-x-lg',

            'pagination.first' => 'bi bi-chevron-double-left',
            'pagination.previous' => 'bi bi-chevron-left',
            'pagination.prev' => 'bi bi-chevron-left',
            'pagination.next' => 'bi bi-chevron-right',
            'pagination.last' => 'bi bi-chevron-double-right',

            'file.type.default' => 'bi bi-file-earmark',
            'file.type.file' => 'bi bi-file-earmark',
            'file.type.zip' => 'bi bi-file-zip',
            'file.type.archive' => 'bi bi-file-zip',
            'file.type.pdf' => 'bi bi-filetype-pdf',
            'file.type.doc' => 'bi bi-filetype-doc',
            'file.type.text' => 'bi bi-filetype-txt',
            'file.type.xls' => 'bi bi-filetype-xls',
            'file.type.csv' => 'bi bi-filetype-csv',
            'file.type.ppt' => 'bi bi-filetype-ppt',
            'file.type.jpg' => 'bi bi-filetype-jpg',
            'file.type.png' => 'bi bi-filetype-png',
            'file.type.image' => 'bi bi-file-earmark-image',
            'file.type.svg' => 'bi bi-filetype-svg',
            'file.type.audio' => 'bi bi-file-earmark-music',
            'file.type.video' => 'bi bi-file-earmark-play',
            'file.type.html' => 'bi bi-filetype-html',
            'file.type.css' => 'bi bi-filetype-css',
            'file.type.js' => 'bi bi-filetype-js',
            'file.type.jsx' => 'bi bi-file-earmark-code',
            'file.type.ts' => 'bi bi-filetype-tsx',
            'file.type.tsx' => 'bi bi-filetype-tsx',
            'file.type.vue' => 'bi bi-file-earmark-code',
            'file.type.sql' => 'bi bi-file-earmark-code',
            'file.type.rs' => 'bi bi-file-earmark-code',
            'file.type.code' => 'bi bi-file-earmark-code',
        ];
    }
}