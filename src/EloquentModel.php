<?php namespace October\Amber;

use Illuminate\Database\Eloquent\Relations\Relation;

/**
 * EloquentModel
 *
 * @package october\amber
 * @author Alexey Bobkov, Samuel Georges
 */
trait EloquentModel
{
    public function hasRelation($name)
    {
        return method_exists($this, $name) &&
            $this->{$name}() instanceof Relation;
    }
}
