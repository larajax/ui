<?php namespace Amber\Classes\ModelInspector;

use Amber\Classes\ModelInspector;

/**
 * Inspection is a read-only metadata view over a model.
 */
class Inspection
{
    /**
     * @var object model being inspected
     */
    public $model;

    /**
     * @var string concrete model class name
     */
    public string $className;

    /**
     * @var string|null database table name
     */
    public ?string $table;

    /**
     * @var string|null primary key name
     */
    public ?string $primaryKey;

    /**
     * @var bool|null true if the model uses timestamps
     */
    public ?bool $timestamps;

    /**
     * @var array model casts
     */
    public array $casts;

    public function __construct(protected ModelInspector $inspector, $model)
    {
        $this->model = $model;
        $this->className = get_class($model);
        $this->table = method_exists($model, 'getTable') ? $model->getTable() : null;
        $this->primaryKey = method_exists($model, 'getKeyName') ? $model->getKeyName() : null;
        $this->timestamps = method_exists($model, 'usesTimestamps') ? $model->usesTimestamps() : null;
        $this->casts = method_exists($model, 'getCasts') ? $model->getCasts() : [];
    }

    public function isInstanceOf(string $class): bool
    {
        return $this->inspector->isInstanceOf($this->model, $class);
    }

    public function hasRelation($name): bool
    {
        return $this->inspector->hasRelation($this->model, $name);
    }

    public function getRelationObject($name)
    {
        return $this->inspector->getRelationObject($this->model, $name);
    }

    public function getRelationType($name): ?string
    {
        return $this->inspector->getRelationType($this->model, $name);
    }

    public function isRelationTypeSingular($name): bool
    {
        return $this->inspector->isRelationTypeSingular($this->model, $name);
    }

    public function getRelationSimpleValue($name)
    {
        return $this->inspector->getRelationSimpleValue($this->model, $name);
    }

    public function makeRelation($name)
    {
        return $this->inspector->makeRelation($this->model, $name);
    }
}
