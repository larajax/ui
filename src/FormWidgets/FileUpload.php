<?php namespace Larajax\Ui\FormWidgets;

use Input;
use Response;
use Validator;
use Larajax\Ui\Classes\FormField;
use Larajax\Ui\Classes\FormWidgetBase;
use October\Rain\Filesystem\Definitions as FileDefinitions;
use ApplicationException;
use ValidationException;
use ForbiddenException;
use Exception;

/**
 * FileUpload renders a form file uploader field.
 *
 * Supported options:
 *
  *    file:
 *        label: Some file
 *        type: fileupload
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class FileUpload extends FormWidgetBase
{
    use \Larajax\Ui\Traits\FormModelSaver;
    use \Larajax\Ui\Traits\FormModelWidget;

    //
    // Configurable Properties
    //

    /**
     * @var int imageWidth for preview
     */
    public $imageWidth = 190;

    /**
     * @var int imageHeight for preview
     */
    public $imageHeight = 190;

    /**
     * @var mixed fileTypes accepted
     */
    public $fileTypes = false;

    /**
     * @var mixed mimeTypes accepted
     */
    public $mimeTypes = false;

    /**
     * @var mixed maxFilesize allowed (MB)
     */
    public $maxFilesize;

    /**
     * @var mixed maxFiles allowed
     */
    public $maxFiles;

    /**
     * @var string externalToolbarBus defines a mount point for the editor toolbar.
     * Only works in Vue applications and form document layouts.
     */
    public $externalToolbarBus = null;

    /**
     * @var array thumbOptions used for generating thumbnails
     */
    public $thumbOptions = [
        'mode' => 'auto',
        'extension' => 'auto'
    ];

    /**
     * @var bool deferredBinding defers the upload action using a session key
     */
    public $deferredBinding = true;

    /**
     * @inheritDoc
     */
    public function init()
    {
        $this->maxFilesize = $this->getUploadMaxFilesize();

        $this->fillFromConfig([
            'imageWidth',
            'imageHeight',
            'fileTypes',
            'maxFilesize',
            'maxFiles',
            'mimeTypes',
            'thumbOptions',
            'deferredBinding',
            'externalToolbarBus'
        ]);

        // @deprecated API
        if ($this->getConfig('attachOnUpload') === true) {
            $this->deferredBinding = false;
        }

        if ($this->formField->disabled) {
            $this->previewMode = true;
        }
    }

    /**
     * @inheritDoc
     */
    public function render()
    {
        $this->prepareVars();
        return $this->makePartial('fileupload');
    }

    /**
     * prepareVars for the view data
     */
    protected function prepareVars()
    {
        if ($this->formField->disabled) {
            $this->previewMode = true;
        }

        $maxPhpSetting = $this->getUploadMaxFilesize();
        if ($maxPhpSetting && $this->maxFilesize > $maxPhpSetting) {
            throw new ApplicationException('Maximum allowed size for uploaded files: ' . $maxPhpSetting);
        }

        $this->vars['name'] = $this->getFieldName();
        $this->vars['fileList'] = $fileList = $this->getFileList();
        $this->vars['singleFile'] = $fileList->first();
        $this->vars['size'] = $this->formField->size;
        $this->vars['displayMode'] = $this->getDisplayMode();
        $this->vars['emptyIcon'] = \Larajax\Ui\Facades\Ui::iconClass($this->getConfig('emptyIcon', 'fileupload.upload'));
        $this->vars['imageHeight'] = $this->imageHeight;
        $this->vars['imageWidth'] = $this->imageWidth;
        $this->vars['acceptedFileTypes'] = $this->getAcceptedFileTypes(true);
        $this->vars['maxFilesize'] = $this->maxFilesize;
        $this->vars['maxFiles'] = $this->maxFiles;
        $this->vars['cssDimensions'] = $this->getCssDimensions();
        $this->vars['externalToolbarBus'] = $this->externalToolbarBus;
    }

    /**
     * getFileRecord for this request, returns false if none available
     * @return \October\Rain\Database\Attach\File|bool
     */
    protected function getFileRecord()
    {
        $record = false;

        if ($fileId = post('file_id')) {
            $record = $this->getRelationObject()
                ->withDeferred($this->getSessionKey())
                ->find($fileId) ?: false;
        }

        return $record;
    }

    /**
     * getFileList returns a list of associated files
     */
    protected function getFileList()
    {
        if ($eagerList = $this->getFileListFromRelation()) {
            $list = $eagerList;
        }
        else {
            $list = $this
                ->getRelationObject()
                ->withDeferred($this->getSessionKey())
                ->orderBy('sort_order')
                ->get()
            ;
        }

        // Decorate each file with thumb and custom download path
        $list->each(function ($file) {
            $this->decorateFileAttributes($file);
        });

        return $list;
    }

    /**
     * getFileListFromRelation loads the file list from the model relation in memory
     * only if the request is not in a postback state
     */
    protected function getFileListFromRelation()
    {
        // Field name for this widget detected in postback
        if (post($this->getFieldName()) !== null) {
            return;
        }

        [$model, $attribute] = $this->resolveModelAttribute($this->valueFrom);
        if (!app('model.inspector')->hasRelation($model, $attribute)) {
            return;
        }

        $value = $model->{$attribute};
        if (!$value) {
            return $model->newCollection();
        }

        if (app('model.inspector')->isRelationTypeSingular($model, $attribute)) {
            return $model->newCollection([$value]);
        }

        return $value;
    }

    /**
     * getDisplayMode for the file upload. Eg: file-multi, image-single, etc
     * @return string
     */
    protected function getDisplayMode()
    {
        $mode = $this->getConfig('mode', 'image');

        if (str_contains($mode, '-')) {
            return $mode;
        }

        $mode .= $this->isRelationTypeSingular() ? '-single' : '-multi';

        return $mode;
    }

    /**
     * getCssDimensions returns the CSS dimensions for the uploaded image,
     * uses auto where no dimension is provided.
     */
    protected function getCssDimensions(): string
    {
        if (!$this->imageWidth && !$this->imageHeight) {
            return '';
        }

        $cssDimensions = '';

        if ($this->imageWidth && !$this->imageHeight) {
            $cssDimensions .= 'width: '.$this->imageWidth.'px;';
        }

        if ($this->imageHeight && !$this->imageWidth) {
            $cssDimensions .= 'height: '.$this->imageHeight.'px;';
        }

        return $cssDimensions;
    }

    /**
     * getAcceptedFileTypes returns the specified accepted file types, or the
     * default based on the mode. Image mode will return:
     * - jpg,jpeg,bmp,png,gif,svg
     * @return string
     */
    public function getAcceptedFileTypes($includeDot = false)
    {
        $types = $this->fileTypes;

        if ($types === false) {
            $definitionCode = str_starts_with($this->getDisplayMode(), 'image')
                ? 'image_extensions'
                : 'default_extensions';

            $types = implode(',', FileDefinitions::get($definitionCode));
        }

        if (!$types || $types === '*') {
            return null;
        }

        if (!is_array($types)) {
            $types = explode(',', $types);
        }

        $types = array_map(function ($value) use ($includeDot) {
            $value = trim($value);

            if (substr($value, 0, 1) == '.') {
                $value = substr($value, 1);
            }

            if ($includeDot) {
                $value = '.'.$value;
            }

            return $value;
        }, $types);

        return implode(',', $types);
    }

    /**
     * onRemoveAttachment removes a file attachment
     */
    public function onRemoveAttachment()
    {
        if ($this->previewMode) {
            throw new ForbiddenException;
        }

        $fileId = post('file_id');
        if (!$fileId) {
            return;
        }

        $file = $this->getRelationObject()
            ->withDeferred($this->getSessionKey())
            ->find($fileId)
        ;

        if (!$file) {
            return;
        }

        $this->getRelationObject()->remove($file, $this->getSessionKey());
    }

    /**
     * onSortAttachments sorts file attachments
     */
    public function onSortAttachments()
    {
        if ($this->previewMode) {
            throw new ForbiddenException;
        }

        if ($sortData = post('sortOrder')) {
            asort($sortData);
            $ids = array_keys($sortData);
            $orders = array_values($sortData);

            // Validate IDs against existing ones
            $relationIds = $this->getRelationObject()
                ->withDeferred($this->getSessionKey())
                ->pluck('id')
                ->all()
            ;

            $ids = array_intersect($ids, $relationIds);

            if ($ids) {
                $this->getRelationModel()->setSortableOrder($ids, $orders);
            }
        }
    }

    /**
     * @inheritDoc
     */
    public function getSaveValue($value)
    {
        return FormField::NO_SAVE_DATA;
    }

    /**
     * onUpload handler for the server-side processing of uploaded files
     */
    public function onUpload()
    {
        if ($this->previewMode) {
            throw new ForbiddenException;
        }

        try {
            if (!Input::hasFile('file_data')) {
                throw new ApplicationException('File missing from request');
            }

            $fileModel = $this->getRelationModel();
            $uploadedFile = files('file_data');

            $validationRules = ['max:'.($this->maxFilesize * 1024)];
            if ($fileTypes = $this->getAcceptedFileTypes()) {
                $validationRules[] = 'extensions:'.$fileTypes;
            }

            if ($this->mimeTypes) {
                $validationRules[] = 'mimes:'.$this->mimeTypes;
            }

            $validation = Validator::make(
                ['file_data' => $uploadedFile],
                ['file_data' => $validationRules]
            );

            if ($validation->fails()) {
                throw new ValidationException($validation);
            }

            if (!$uploadedFile->isValid()) {
                throw new ApplicationException('File is not valid');
            }

            $fileRelation = $this->getRelationObject();

            // Check and clean vector files
            // @deprecated v4 this should be moved to a post processing method on the file model
            $extension = strtolower($uploadedFile->getClientOriginalExtension());
            if ($extension === 'svg' && \Config::get('media.clean_vectors', true)) {
                // getRealPath() can be empty for some environments (IIS)
                $realPath = empty(trim($uploadedFile->getRealPath()))
                    ? $uploadedFile->getPath() . DIRECTORY_SEPARATOR . $uploadedFile->getFileName()
                    : $uploadedFile->getRealPath();

                \File::put($realPath, \Html::cleanVector(\File::get($realPath)));
            }

            $file = $fileModel;
            $file->data = $uploadedFile;
            $file->is_public = $fileRelation->isPublic();
            $file->save();

            // Determine the session key and if deferred binding should be used
            $parent = $fileRelation->getParent();
            $attachOnUpload = $this->deferredBinding === false && $parent && $parent->exists;
            $sessionKey = $attachOnUpload ? null : $this->getSessionKey();

            // Attach the file
            $fileRelation->add($file, $sessionKey);

            $file = $this->decorateFileAttributes($file);

            $result = [
                'id' => $file->id,
                'thumb' => $file->thumbUrl,
                'path' => $file->pathUrl
            ];

            $response = Response::make($result, 200);
        }
        catch (Exception $ex) {
            $response = Response::make($ex->getMessage(), 400);
        }

        return $response;
    }

    /**
     * decorateFileAttributes adds the bespoke attributes used
     * internally by this widget. Added attributes are:
     * - thumbUrl
     * - pathUrl
     * @return \October\Rain\Database\Attach\File
     */
    protected function decorateFileAttributes($file)
    {
        $path = $thumb = $file->getPath();

        if ($this->shouldGenerateThumb()) {
            $thumb = $file->getThumb($this->imageWidth, $this->imageHeight, $this->thumbOptions);
        }

        $file->pathUrl = $path;
        $file->thumbUrl = $thumb;

        return $file;
    }

    /**
     * shouldGenerateThumb determines if the resizer should be used
     */
    protected function shouldGenerateThumb()
    {
        if ($this->thumbOptions === false) {
            return false;
        }

        return $this->imageWidth || $this->imageHeight;
    }

    /**
     * getUploadMaxFilesize returns max upload filesize in MB
     */
    protected function getUploadMaxFilesize(): float
    {
        return $this->getRelationModel()::getMaxFilesize() / 1024;
    }
}
