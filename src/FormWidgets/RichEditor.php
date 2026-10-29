<?php namespace Larajax\Ui\FormWidgets;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Larajax\Ui\Classes\FormWidgetBase;
use Larajax\Ui\Facades\Ui;
use ApplicationException;
use ForbiddenException;

/**
 * RichEditor renders a rich content editor field.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class RichEditor extends FormWidgetBase
{
    //
    // Configurable Properties
    //

    /**
     * @var string|array|null toolbarButtons to display, used verbatim.
     */
    public $toolbarButtons;

    /**
     * @var string|null toolbar references a named toolbar definition by its code.
     */
    public $toolbar;

    /**
     * @var bool If true, the editor is set to read-only mode
     */
    public $readOnly = false;

    /**
     * @var bool safeMode sanitizes the value with Html::clean when it is rendered as HTML in preview mode.
     */
    public $safeMode = true;

    /**
     * @var bool useLineBreaks uses line breaks instead of paragraph wrappers for each new line.
     */
    public $useLineBreaks = false;

    /**
     * @var array|null editorOptions passed to the editor. For example:
     *
     * - imageDefaultAlign: Sets the default image alignment when it is inserted in the rich text editor. Possible values are `left`, `center` and `right`.
     * - imageResize: Allows images to be resized by dragging their handles.
     * - paragraphStyles: Sets the paragraph styles, as a map of class names to labels.
     */
    public $editorOptions = null;

    /**
     * @var string|null uploadDisk enables uploads from the editor, stored on this filesystem disk, when no page hook handles them.
     */
    public $uploadDisk = null;

    /**
     * @var string uploadPath is the folder on the upload disk that receives the uploaded files.
     */
    public $uploadPath = 'uploads/richeditor';

    /**
     * @var int|float uploadMaxSize is the largest accepted upload in megabytes.
     */
    public $uploadMaxSize = 10;

    //
    // Object Properties
    //

    /**
     * @inheritDoc
     */
    protected $defaultAlias = 'richeditor';

    /**
     * @var array uploadImageTypes are the file extensions accepted for inserted images.
     */
    protected $uploadImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    /**
     * @var array uploadFileTypes are the file extensions accepted for file links, in addition to the image types.
     */
    protected $uploadFileTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip'];

    /**
     * @inheritDoc
     */
    public function init()
    {
        $this->fillFromConfig([
            'readOnly',
            'safeMode',
            'toolbarButtons',
            'toolbar',
            'useLineBreaks',
            'editorOptions',
            'uploadDisk',
            'uploadPath',
            'uploadMaxSize',
        ]);

        // The field config always carries readOnly, so a disabled field applies after it
        if ($this->formField->disabled) {
            $this->readOnly = true;
        }
    }

    /**
     * @inheritDoc
     */
    public function render()
    {
        $this->prepareVars();
        return $this->makePartial('richeditor');
    }

    /**
     * prepareVars for display
     */
    public function prepareVars()
    {
        $this->vars['field'] = $this->formField;
        $this->vars['editorOptions'] = $this->getValidEditorOptions();
        $this->vars['useLineBreaks'] = $this->useLineBreaks;
        $this->vars['stretch'] = $this->formField->stretch;
        $this->vars['size'] = $this->formField->size;
        $this->vars['readOnly'] = $this->readOnly;
        $this->vars['safeMode'] = $this->safeMode;
        $this->vars['name'] = $this->getFieldName();
        $this->vars['value'] = $this->getLoadValue();
        $this->vars['toolbarButtons'] = $this->evalToolbarButtons();
        $this->vars['icons'] = $this->getEditorIcons();
        $this->vars['lang'] = $this->getEditorLang();
        $this->vars['uploadHandler'] = $this->canUpload() ? $this->getEventHandler('onUploadFile') : null;
    }

    /**
     * onUploadFile stores a file uploaded from the editor on the upload disk and returns its public address.
     */
    public function onUploadFile()
    {
        if (!$this->canUpload()) {
            throw new ForbiddenException;
        }

        $uploadedFile = files('file_data');
        if (!$uploadedFile instanceof UploadedFile) {
            throw new ApplicationException(__('File missing from request'));
        }

        $fileTypes = implode(',', $this->getUploadFileTypes(post('file_type') === 'image'));

        $validation = Validator::make(
            ['file_data' => $uploadedFile],
            ['file_data' => ['file', 'max:'.(int) ($this->uploadMaxSize * 1024), 'extensions:'.$fileTypes, 'mimes:'.$fileTypes]],
            [],
            ['file_data' => __('file')]
        );

        if ($validation->fails()) {
            throw new ApplicationException($validation->errors()->first('file_data'));
        }

        // getRealPath() can be empty for some environments (IIS, php-cgi)
        $filePath = trim((string) $uploadedFile->getRealPath())
            ?: $uploadedFile->getPath().DIRECTORY_SEPARATOR.$uploadedFile->getFilename();

        $disk = Storage::disk($this->uploadDisk);
        $path = $disk->putFileAs(trim($this->uploadPath, '/'), $filePath, $uploadedFile->hashName());

        if (!$path) {
            throw new ApplicationException(__('The file could not be uploaded'));
        }

        return ['url' => $disk->url($path)];
    }

    /**
     * canUpload checks the built-in upload is configured and the field is editable.
     */
    protected function canUpload(): bool
    {
        return $this->uploadDisk && !$this->readOnly && !$this->previewMode;
    }

    /**
     * getUploadFileTypes returns the accepted file extensions, the image types alone for inserted images.
     */
    protected function getUploadFileTypes(bool $isImage): array
    {
        return $isImage
            ? $this->uploadImageTypes
            : array_merge($this->uploadImageTypes, $this->uploadFileTypes);
    }

    /**
     * evalToolbarButtons resolves the button list from field config, where a
     * named toolbar definition applies when no verbatim buttons are given
     */
    protected function evalToolbarButtons(): ?array
    {
        $buttons = $this->toolbarButtons;

        if (is_string($buttons)) {
            return array_map(function ($button) {
                return strlen($button) ? $button : '|';
            }, explode('|', $buttons));
        }

        if (!$buttons && $this->toolbar) {
            $definition = $this->getToolbarDefinition($this->toolbar);
            return $definition !== null ? explode(',', $definition) : null;
        }

        return $buttons ?: null;
    }

    /**
     * getToolbarDefinition returns the comma separated buttons of a named toolbar definition, or null when it is not defined.
     */
    protected function getToolbarDefinition(string $code): ?string
    {
        return null;
    }

    /**
     * getValidEditorOptions returns custom editor options passed directly to the JS control
     */
    protected function getValidEditorOptions(): array
    {
        $config = [];

        if (is_array($this->editorOptions)) {
            $config += $this->editorOptions;
        }

        return $config;
    }

    /**
     * getEditorIcons returns the icon classes of the editor buttons, menus and placeholders from the richeditor icon pack keys.
     */
    protected function getEditorIcons(): array
    {
        $names = [
            'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript',
            'inlineStyle', 'fontFamily', 'fontSize', 'color', 'emoticons', 'clearFormatting',
            'paragraphStyle', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'formatOL',
            'formatUL', 'outdent', 'indent', 'quote', 'insertHR', 'insertLink',
            'insertPageLink', 'linkOpen', 'linkEdit', 'linkStyle', 'unlink', 'insertImage',
            'insertVideo', 'insertAudio', 'insertFile', 'insertTable', 'insertSnippet', 'imageReplace',
            'imageAlignNone', 'imageAlignLeft', 'imageAlignCenter', 'imageAlignRight', 'imageStyle', 'imageAlt',
            'imageSize', 'imageLink', 'snippetProperties', 'nodeRemove', 'tableHeader', 'tableRows',
            'tableColumns', 'tableCells', 'tableStyle', 'tableCellStyle', 'tableRemove', 'undo',
            'redo', 'selectAll', 'html', 'fullscreen', 'fullscreenExit', 'caret',
            'check', 'removeColor', 'embeddingCode', 'uploadFromComputer', 'browse', 'byUrl',
            'customButton', 'snippet',
        ];

        $icons = [];

        foreach ($names as $name) {
            $key = 'richeditor.'.$name;
            $class = Ui::iconClass($key);

            if ($class !== '' && $class !== $key) {
                $icons[$name] = $class;
            }
        }

        return $icons;
    }

    /**
     * getEditorLang returns the translated editor strings, keyed like the editor's English defaults.
     */
    protected function getEditorLang(): array
    {
        $strings = [
            // Toolbar buttons
            'toolbar' => 'Editor toolbar',
            'fullscreen' => 'Fullscreen',
            'bold' => 'Bold',
            'italic' => 'Italic',
            'underline' => 'Underline',
            'strikeThrough' => 'Strikethrough',
            'subscript' => 'Subscript',
            'superscript' => 'Superscript',
            'fontFamily' => 'Font Family',
            'fontSize' => 'Font Size',
            'color' => 'Colors',
            'emoticons' => 'Emoticons',
            'inlineStyle' => 'Inline Style',
            'paragraphStyle' => 'Paragraph Style',
            'paragraphFormat' => 'Paragraph Format',
            'align' => 'Align',
            'formatOL' => 'Ordered List',
            'formatUL' => 'Unordered List',
            'outdent' => 'Decrease Indent',
            'indent' => 'Increase Indent',
            'quote' => 'Quote',
            'insertHR' => 'Insert Horizontal Line',
            'insertLink' => 'Insert Link',
            'insertPageLink' => 'Insert Link',
            'insertImage' => 'Insert Image',
            'insertVideo' => 'Insert Video',
            'insertAudio' => 'Insert Audio',
            'insertFile' => 'Insert File',
            'insertTable' => 'Insert Table',
            'insertSnippet' => 'Insert Snippet',
            'undo' => 'Undo',
            'redo' => 'Redo',
            'clearFormatting' => 'Clear Formatting',
            'selectAll' => 'Select All',
            'html' => 'Code View',

            // Shortcut keys
            'keyCtrl' => 'Ctrl',
            'keyAlt' => 'Alt',
            'keyShift' => 'Shift',

            // Paragraph formats
            'formatNormal' => 'Normal',
            'formatHeading1' => 'Heading 1',
            'formatHeading2' => 'Heading 2',
            'formatHeading3' => 'Heading 3',
            'formatHeading4' => 'Heading 4',
            'formatHeading5' => 'Heading 5',
            'formatHeading6' => 'Heading 6',
            'formatCode' => 'Code',

            // Alignment
            'alignLeft' => 'Align Left',
            'alignCenter' => 'Align Center',
            'alignRight' => 'Align Right',
            'alignJustify' => 'Align Justify',

            // Colors
            'textColor' => 'Text',
            'backgroundColor' => 'Background',
            'removeColor' => 'Remove Color',
            'defaultFont' => 'Default',

            // Insert menus
            'uploadFromComputer' => 'Upload from Computer',
            'browse' => 'Browse',
            'byUrl' => 'By URL',
            'embeddingCode' => 'Embedding Code',
            'rows' => 'rows',
            'columns' => 'columns',

            // Popover forms
            'url' => 'URL',
            'text' => 'Text',
            'openInNewTab' => 'Open in new tab',
            'linkStyle' => 'Style',
            'none' => 'None',
            'insert' => 'Insert',
            'update' => 'Update',
            'cancel' => 'Cancel',
            'remove' => 'Remove',
            'browsePages' => 'Browse Pages',
            'alternativeText' => 'Alternative Text',
            'width' => 'Width',
            'widthPlaceholder' => '300 or 50%',
            'widthInvalid' => 'Enter a width in pixels or a percentage',
            'urlRequired' => 'Please enter a URL',
            'urlInvalid' => 'Please enter a valid URL',
            'embeddingCodeRequired' => 'Please enter the embedding code',
            'embeddingCodeInvalid' => 'The embedding code must contain an iframe',

            // Contextual toolbars
            'openLink' => 'Open Link',
            'editLink' => 'Edit Link',
            'unlink' => 'Unlink',
            'imageAlign' => 'Align',
            'imageAlignNone' => 'Inline',
            'imageAlignLeft' => 'Float Left',
            'imageAlignCenter' => 'Center',
            'imageAlignRight' => 'Float Right',
            'imageStyle' => 'Image Style',
            'imageAlt' => 'Alternative Text',
            'imageSize' => 'Change Size',
            'imageReplace' => 'Replace',
            'imageRemove' => 'Remove Image',
            'imageLink' => 'Insert Link',
            'tableHeader' => 'Table Header',
            'tableRows' => 'Row',
            'tableRowAbove' => 'Insert row above',
            'tableRowBelow' => 'Insert row below',
            'tableRowDelete' => 'Delete row',
            'tableColumns' => 'Column',
            'tableColumnBefore' => 'Insert column before',
            'tableColumnAfter' => 'Insert column after',
            'tableColumnDelete' => 'Delete column',
            'tableCells' => 'Cell',
            'tableCellsMerge' => 'Merge cells',
            'tableCellsSplit' => 'Split cell',
            'tableStyle' => 'Table Style',
            'tableCellStyle' => 'Cell Style',
            'tableRemove' => 'Remove Table',
            'snippet' => 'Snippet',
            'snippetProperties' => 'Properties',
            'snippetRemove' => 'Remove Snippet',
            'mediaRemove' => 'Remove',

            // Messages
            'uploadFailed' => 'The file could not be uploaded',
            'invalidFileEmptyInsert' => 'Please select a file to insert.',
            'invalidFileSingleInsert' => 'Please select a single file.',
            'invalidImageEmptyInsert' => 'Please select an image to insert.',
            'invalidImageInvalidInsert' => 'The selected file is not an image.',
            'invalidVideoInvalidInsert' => 'The selected file is not a video.',
            'invalidAudioInvalidInsert' => 'The selected file is not an audio file.',
        ];

        return array_map(function ($text) {
            $translated = __($text);
            return is_string($translated) ? $translated : $text;
        }, $strings);
    }
}
