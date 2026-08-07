<?php namespace October\Amber\Helpers;

/**
 * Model helper
 *
 * @package october\amber
 * @author Alexey Bobkov, Samuel Georges
 */
class Model
{
    /**
     * isInstanceOf checks a model against a class or interface, supporting both
     * October Rain models (isClassInstanceOf includes dynamic behaviors) and
     * plain Eloquent models (native instanceof).
     */
    public static function isInstanceOf($model, string $class): bool
    {
        if (method_exists($model, 'isClassInstanceOf')) {
            return $model->isClassInstanceOf($class);
        }

        return $model instanceof $class;
    }
}
