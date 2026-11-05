<?php namespace Larajax\Ui\FormWidgets;

use Illuminate\Database\Eloquent\Relations\HasOneOrMany;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;
use Larajax\Ui\Classes\FormField;
use Larajax\Ui\Classes\FormWidgetBase;
use October\Contracts\Database\AttachmentInterface;
use October\Contracts\Database\SortableInterface;
use October\Rain\Filesystem\Definitions as FileDefinitions;
use October\Rain\Exception\ApplicationException;
use October\Rain\Exception\ValidationException;
use October\Rain\Exception\ForbiddenException;
use October\Rain\Exception\SystemException;
use Exception;
use Larajax\Ui\Helpers\Input;

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
        if (!app('model.inspector')->isInstanceOf($this->getRelationModel(), AttachmentInterface::class)) {
            throw new SystemException(__('The file model for the :name field must implement :interface.', [
                'name' => $this->formField->fieldName,
                'interface' => AttachmentInterface::class,
            ]));
        }

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

        if (!$this->isAttachmentRelation()) {
            $this->bindHeldFilesToSave();
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
        $this->vars['uploadMessages'] = [
            'maxFiles' => __('You can not upload any more files.'),
            'invalidFileType' => __("You can't upload files of this type."),
            'fileTooBig' => __('File is too big ({{filesize}}MB). Max filesize: {{maxFilesize}}MB.'),
            'responseError' => __('Server responded with {{statusCode}} code.'),
            'removeFile' => __('Remove file'),
        ];
    }

    /**
     * getFileRecord for this request, returns false if none available
     * @return \October\Contracts\Database\AttachmentInterface|bool
     */
    protected function getFileRecord()
    {
        $record = false;

        if ($fileId = Input::post('file_id')) {
            $record = $this->getFileQuery()->find($fileId) ?: false;
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
            $list = $this->getFileQuery()->orderBy($this->getFileSortColumn())->get();
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
        if (Input::post($this->getFieldName()) !== null) {
            return;
        }

        [$model, $attribute] = $this->resolveModelAttribute($this->valueFrom);
        if (!app('model.inspector')->hasRelation($model, $attribute)) {
            return;
        }

        // Files stored under another field, such as a translated locale, are listed from the query
        $relationObject = $model->{$attribute}();
        if (method_exists($relationObject, 'getAttachmentField') && $relationObject->getAttachmentField() !== $attribute) {
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

            $types = class_exists(FileDefinitions::class)
                ? implode(',', FileDefinitions::get($definitionCode))
                : implode(',', $this->getDefaultFileTypes($definitionCode));
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

        $fileId = Input::post('file_id');
        if (!$fileId) {
            return;
        }

        $file = $this->getFileQuery()->find($fileId);

        if (!$file) {
            return;
        }

        if ($this->isAttachmentRelation()) {
            $this->getRelationObject()->remove($file, $this->getSessionKey());
            return;
        }

        // A held upload is discarded now, an attached file is removed when the record saves
        if (in_array($file->getKey(), $this->getHeldFiles()['add'])) {
            $file->delete();
            $this->forgetHeldFile('add', $file->getKey());
        }
        else {
            $this->holdFile('remove', $file->getKey());
        }
    }

    /**
     * onSortAttachments sorts file attachments
     */
    public function onSortAttachments()
    {
        if ($this->previewMode) {
            throw new ForbiddenException;
        }

        if ($sortData = Input::post('sortOrder')) {
            asort($sortData);
            $ids = array_keys($sortData);
            $orders = array_values($sortData);

            // Validate IDs against existing ones
            $fileModel = $this->getRelationModel();
            $relationIds = $this->getFileQuery()->pluck($fileModel->getQualifiedKeyName())->all();

            $ids = array_intersect($ids, $relationIds);

            if ($ids && app('model.inspector')->isInstanceOf($fileModel, SortableInterface::class)) {
                $fileModel->setSortableOrder($ids, $orders);
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
            if (!request()->hasFile('file_data')) {
                throw new ApplicationException('File missing from request');
            }

            $fileModel = $this->getRelationModel();
            $uploadedFile = Input::file('file_data');

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
            if ($extension === 'svg' && Config::get('media.clean_vectors', true)) {
                // getRealPath() can be empty for some environments (IIS)
                $realPath = empty(trim($uploadedFile->getRealPath()))
                    ? $uploadedFile->getPath() . DIRECTORY_SEPARATOR . $uploadedFile->getFileName()
                    : $uploadedFile->getRealPath();

                File::put($realPath, app('html')->cleanVector(File::get($realPath)));
            }

            if ($this->isAttachmentRelation()) {
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
            }
            else {
                $file = $this->storeUpload($fileRelation, $uploadedFile);
            }

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
     * @return \October\Contracts\Database\AttachmentInterface
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

    /**
     * isAttachmentRelation returns true when the relation holds uploads until the record saves itself, as Rain's attachment relations do.
     */
    protected function isAttachmentRelation(): bool
    {
        return method_exists($this->getRelationObject(), 'withDeferred');
    }

    /**
     * getFileQuery returns a query for the field's files, with the uploads held until the record saves and without the removals held until then.
     */
    protected function getFileQuery()
    {
        $relation = $this->getRelationObject();

        if ($this->isAttachmentRelation()) {
            return $relation->withDeferred($this->getSessionKey());
        }

        $fileModel = $relation->getRelated();
        $keyName = $fileModel->getQualifiedKeyName();
        $held = $this->getHeldFiles();

        $ids = $relation->getParent()->exists
            ? $relation->getQuery()->pluck($keyName)->all()
            : [];

        $ids = array_diff(array_merge($ids, $held['add']), $held['remove']);

        return $fileModel->newQuery()->whereIn($keyName, $ids);
    }

    /**
     * getFileSortColumn returns the column that orders the files.
     */
    protected function getFileSortColumn(): string
    {
        $fileModel = $this->getRelationModel();

        if ($this->isAttachmentRelation()) {
            return 'sort_order';
        }

        if (app('model.inspector')->isInstanceOf($fileModel, SortableInterface::class) && method_exists($fileModel, 'getSortOrderColumn')) {
            return $fileModel->getSortOrderColumn();
        }

        return $fileModel->getKeyName();
    }

    /**
     * storeUpload saves an upload to a file model on a plain Eloquent relation, attached now when deferred binding is off and the record exists, otherwise held until the record saves.
     */
    protected function storeUpload($relation, $uploadedFile)
    {
        if (!$relation instanceof HasOneOrMany) {
            throw new SystemException(__('The :name field needs a has one, has many, morph one or morph many relation.', [
                'name' => $this->formField->fieldName,
            ]));
        }

        $file = $relation->make();
        $file->fromPost($uploadedFile);

        if ($this->deferredBinding === false && $relation->getParent()->exists) {
            $this->attachFile($relation, $file);
            return $file;
        }

        $file->setAttribute($relation->getForeignKeyName(), null);
        $file->save();
        $this->holdFile('add', $file->getKey());

        return $file;
    }

    /**
     * attachFile saves a file to the relation, replacing the current file when the relation holds one.
     */
    protected function attachFile($relation, $file): void
    {
        if (!$relation instanceof HasOneOrMany) {
            return;
        }

        if (!$relation instanceof \Illuminate\Database\Eloquent\Relations\HasMany && !$relation instanceof \Illuminate\Database\Eloquent\Relations\MorphMany) {
            foreach ($relation->getQuery()->get() as $current) {
                if ($current->getKey() != $file->getKey()) {
                    $current->delete();
                }
            }
        }

        $relation->save($file);
    }

    /**
     * bindHeldFilesToSave attaches the held uploads and deletes the held removals when the form's record saves.
     */
    protected function bindHeldFilesToSave(): void
    {
        [$model, $attribute] = $this->resolveModelAttribute($this->valueFrom);

        if (!$model instanceof \Illuminate\Database\Eloquent\Model) {
            return;
        }

        app(\Larajax\Ui\Classes\HeldUploads::class)->add($model, function ($saved) use ($attribute) {
            $this->commitHeldFiles($saved, $attribute);
        });
    }

    /**
     * commitHeldFiles attaches the held uploads to a saved record and deletes the held removals.
     */
    protected function commitHeldFiles($model, string $attribute): void
    {
        $held = $this->getHeldFiles();
        if (!$held['add'] && !$held['remove']) {
            return;
        }

        $relation = $model->{$attribute}();
        $fileModel = $relation->getRelated();

        foreach ($fileModel->newQuery()->whereIn($fileModel->getKeyName(), $held['remove'])->get() as $file) {
            $file->delete();
        }

        foreach ($fileModel->newQuery()->whereIn($fileModel->getKeyName(), $held['add'])->get() as $file) {
            $this->attachFile($relation, $file);
        }

        $this->putSession($this->getHeldFilesKey(), null);
    }

    /**
     * getHeldFiles returns the ids of the uploads and removals held until the record saves.
     *
     * @return array{add: array<int, mixed>, remove: array<int, mixed>}
     */
    protected function getHeldFiles(): array
    {
        return (array) $this->getSession($this->getHeldFilesKey(), []) + ['add' => [], 'remove' => []];
    }

    /**
     * holdFile holds an upload or a removal until the record saves.
     */
    protected function holdFile(string $type, $fileId): void
    {
        $held = $this->getHeldFiles();
        $held[$type][] = $fileId;
        $held[$type] = array_values(array_unique($held[$type]));

        $this->putSession($this->getHeldFilesKey(), $held);
    }

    /**
     * forgetHeldFile stops holding an upload or a removal.
     */
    protected function forgetHeldFile(string $type, $fileId): void
    {
        $held = $this->getHeldFiles();
        $held[$type] = array_values(array_diff($held[$type], [$fileId]));

        $this->putSession($this->getHeldFilesKey(), $held);
    }

    /**
     * getHeldFilesKey returns the session key for the files held by this form.
     */
    protected function getHeldFilesKey(): string
    {
        return 'held-files-' . $this->getSessionKey();
    }

    /**
     * getDefaultFileTypes returns the file types accepted when the field sets none, used when Rain's file definitions are not installed.
     */
    protected function getDefaultFileTypes(string $definitionCode): array
    {
        $imageTypes = ['jpg', 'jpeg', 'bmp', 'png', 'webp', 'avif', 'gif'];

        if ($definitionCode === 'image_extensions') {
            return $imageTypes;
        }

        return array_merge($imageTypes, [
            'svg', 'js', 'map', 'ico', 'css', 'less', 'scss', 'ics', 'odt', 'doc', 'docx', 'ppt', 'pptx', 'pdf',
            'swf', 'txt', 'ods', 'xls', 'xlsx', 'eot', 'woff', 'woff2', 'ttf', 'flv', 'wmv', 'mp3', 'ogg', 'wav',
            'avi', 'mov', 'mp4', 'mpeg', 'webm', 'mkv', 'rar', 'zip',
        ]);
    }
}
