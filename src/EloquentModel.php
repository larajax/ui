<?php namespace October\Amber;

use Illuminate\Database\Eloquent\Relations\Relation;

/**
 * EloquentModel adds the October Rain relation metadata methods to a plain
 * Eloquent model, so Amber widgets (relation fields, relation columns) can
 * inspect relationships the same way on either model flavor.
 *
 * October Rain models declare relations in configuration arrays; a plain
 * Eloquent model declares them as methods, so this trait derives the same
 * metadata by inspecting the relation objects themselves.
 *
 * @package october\amber
 * @author Alexey Bobkov, Samuel Georges
 */
trait EloquentModel
{
    /**
     * hasRelation returns true if a relation with the supplied name exists.
     */
    public function hasRelation($name)
    {
        return method_exists($this, $name) &&
            $this->{$name}() instanceof Relation;
    }

    /**
     * getRelationType returns a relationship type based on a supplied name,
     * eg: `belongsTo`, matching the October Rain relation type names.
     */
    public function getRelationType($name)
    {
        if (!$this->hasRelation($name)) {
            return null;
        }

        return lcfirst(class_basename($this->{$name}()));
    }

    /**
     * isRelationTypeSingular returns true if the relation is expected to return
     * a single record versus a collection of records.
     */
    public function isRelationTypeSingular($name): bool
    {
        return in_array($this->getRelationType($name), [
            'hasOne',
            'belongsTo',
            'morphTo',
            'morphOne',
            'hasOneThrough'
        ]);
    }

    /**
     * getRelationSimpleValue returns a relation value directly from its attribute:
     * the related key for singular relations, an array of related keys for
     * multi relations. Mirrors October Rain's relation getSimpleValue methods.
     */
    public function getRelationSimpleValue($name)
    {
        $type = $this->getRelationType($name);

        if ($type === null) {
            return null;
        }

        // Foreign key is available locally without a query
        if ($type === 'belongsTo') {
            return $this->getAttribute($this->{$name}()->getForeignKeyName());
        }

        if ($this->isRelationTypeSingular($name)) {
            return $this->{$name}?->getKey();
        }

        if (in_array($type, ['belongsToMany', 'morphToMany', 'morphedByMany'])) {
            $relation = $this->{$name}();

            return $this->relationLoaded($name)
                ? $this->getRelation($name)->pluck($relation->getRelatedKeyName())->all()
                : $relation->allRelatedIds()->all();
        }

        return $this->{$name}->modelKeys();
    }

    /**
     * makeRelation returns a new, empty instance of the related model,
     * supporting nested relations with dot notation.
     */
    public function makeRelation($name)
    {
        if (str_contains($name, '.')) {
            $model = $this;
            $parts = explode('.', $name);
            while ($relationName = array_shift($parts)) {
                if (!$model = $model->makeRelation($relationName)) {
                    return null;
                }
            }
            return $model;
        }

        if (!$this->hasRelation($name)) {
            return null;
        }

        $relation = $this->{$name}();

        if ($this->getRelationType($name) === 'morphTo') {
            return null;
        }

        return $relation->getRelated()->newInstance();
    }
}
