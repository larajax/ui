<?php namespace Larajax\Ui\FormWidgets\FileUpload;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOneOrMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use October\Contracts\Database\AttachmentInterface;
use October\Contracts\Database\SortableInterface;
use October\Rain\Exception\SystemException;

/**
 * HasAttachmentStore contains logic for storing uploaded files on Rain attachment relations and plain Eloquent relations
 */
trait HasAttachmentStore
{
    /**
     * initAttachmentStore checks the file model and, for a plain Eloquent relation, commits the held files when the record saves.
     */
    protected function initAttachmentStore(): void
    {
        if (!app('model.inspector')->isInstanceOf($this->getRelationModel(), AttachmentInterface::class)) {
            throw new SystemException(__('The file model for the :name field must implement :interface.', [
                'name' => $this->formField->fieldName,
                'interface' => AttachmentInterface::class,
            ]));
        }

        if (!$this->isAttachmentRelation()) {
            $this->bindHeldFilesToSave();
        }
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
     * addUploadedFile stores an upload on the field's relation and returns its file model.
     */
    protected function addUploadedFile($uploadedFile)
    {
        $fileRelation = $this->getRelationObject();

        if (!$this->isAttachmentRelation()) {
            return $this->addUploadedFileToRelation($fileRelation, $uploadedFile);
        }

        $file = $this->getRelationModel();
        $file->data = $uploadedFile;
        $file->is_public = $fileRelation->isPublic();
        $file->save();

        // Determine the session key and if deferred binding should be used
        $parent = $fileRelation->getParent();
        $attachOnUpload = $this->deferredBinding === false && $parent && $parent->exists;
        $sessionKey = $attachOnUpload ? null : $this->getSessionKey();

        // Attach the file
        $fileRelation->add($file, $sessionKey);

        return $file;
    }

    /**
     * addUploadedFileToRelation saves an upload on a plain Eloquent relation, attached now when deferred binding is off and the record exists, otherwise held until the record saves.
     */
    protected function addUploadedFileToRelation($relation, $uploadedFile)
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
     * removeFile removes a file from the field's relation, when the record saves unless it is an upload that is still held.
     */
    protected function removeFile($file): void
    {
        if ($this->isAttachmentRelation()) {
            $this->getRelationObject()->remove($file, $this->getSessionKey());
            return;
        }

        if (in_array($file->getKey(), $this->getHeldFiles()['add'])) {
            $file->delete();
            $this->forgetHeldFile('add', $file->getKey());
        }
        else {
            $this->holdFile('remove', $file->getKey());
        }
    }

    /**
     * sortFiles orders the field's files, keeping only the ids that belong to it, when the file model is sortable.
     */
    protected function sortFiles(array $ids, array $orders): void
    {
        $fileModel = $this->getRelationModel();
        $relationIds = $this->getFileQuery()->pluck($fileModel->getQualifiedKeyName())->all();

        $ids = array_intersect($ids, $relationIds);

        if ($ids && app('model.inspector')->isInstanceOf($fileModel, SortableInterface::class)) {
            $fileModel->setSortableOrder($ids, $orders);
        }
    }

    /**
     * attachFile saves a file to the relation, replacing the current file when the relation holds one.
     */
    protected function attachFile($relation, $file): void
    {
        if (!$relation instanceof HasOneOrMany) {
            return;
        }

        if (!$relation instanceof HasMany && !$relation instanceof MorphMany) {
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

        if (!$model instanceof Model) {
            return;
        }

        app('larajax.ui.uploads')->add($model, function ($saved) use ($attribute) {
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
}
