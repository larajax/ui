<?php namespace Larajax\Ui\Classes\Icons;

class PhosphorIconPack implements IconPack
{
    public function icons(): array
    {
        return [
            'action.delete' => 'ph ph-trash',

            'search.clear' => 'ph ph-x',

            'filter.menu' => 'ph ph-funnel-simple',
            'filter.clear' => 'ph ph-eraser',

            'checkboxlist.select_all' => 'ph ph-checks',
            'checkboxlist.clear' => 'ph ph-eraser',

            'tooltip.info' => 'ph ph-info',

            'fileupload.upload' => 'ph ph-upload-simple',
            'fileupload.remove' => 'ph ph-trash',
            'fileupload.reorder' => 'ph ph-dots-six-vertical',
            'fileupload.attachment' => 'ph ph-paperclip',
            'fileupload.error' => 'ph ph-warning',

            'list.reorder' => 'ph ph-dots-six-vertical',
            'list.switch.true' => 'ph ph-check',
            'list.switch.false' => 'ph ph-x',

            'pagination.first' => 'ph ph-caret-double-left',
            'pagination.previous' => 'ph ph-caret-left',
            'pagination.prev' => 'ph ph-caret-left',
            'pagination.next' => 'ph ph-caret-right',
            'pagination.last' => 'ph ph-caret-double-right',

            'file.type.default' => 'ph ph-file',
            'file.type.file' => 'ph ph-file',
            'file.type.zip' => 'ph ph-file-zip',
            'file.type.archive' => 'ph ph-file-archive',
            'file.type.pdf' => 'ph ph-file-pdf',
            'file.type.doc' => 'ph ph-file-doc',
            'file.type.text' => 'ph ph-file-text',
            'file.type.xls' => 'ph ph-file-xls',
            'file.type.csv' => 'ph ph-file-csv',
            'file.type.ppt' => 'ph ph-file-ppt',
            'file.type.jpg' => 'ph ph-file-jpg',
            'file.type.png' => 'ph ph-file-png',
            'file.type.image' => 'ph ph-file-image',
            'file.type.svg' => 'ph ph-file-svg',
            'file.type.audio' => 'ph ph-file-audio',
            'file.type.video' => 'ph ph-file-video',
            'file.type.html' => 'ph ph-file-html',
            'file.type.css' => 'ph ph-file-css',
            'file.type.js' => 'ph ph-file-js',
            'file.type.jsx' => 'ph ph-file-jsx',
            'file.type.ts' => 'ph ph-file-ts',
            'file.type.tsx' => 'ph ph-file-tsx',
            'file.type.vue' => 'ph ph-file-vue',
            'file.type.sql' => 'ph ph-file-sql',
            'file.type.rs' => 'ph ph-file-rs',
            'file.type.code' => 'ph ph-file-code',
        ];
    }
}