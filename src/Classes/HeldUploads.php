<?php namespace Larajax\Ui\Classes;

use Illuminate\Database\Eloquent\Model;

/**
 * HeldUploads keeps, for one request, the file upload fields whose held files are committed when their record saves.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class HeldUploads
{
    /**
     * @var array<int, array{model: Model, commit: callable}> entries pairs each record with the callback that commits its held files.
     */
    protected array $entries = [];

    /**
     * add calls the commit callback with the record when it saves.
     */
    public function add(Model $model, callable $commit): void
    {
        $this->entries[] = ['model' => $model, 'commit' => $commit];
    }

    /**
     * commitFor commits the held files of every field bound to a saved record.
     */
    public function commitFor(Model $saved): void
    {
        foreach ($this->entries as $entry) {
            $model = $entry['model'];

            if ($saved === $model || ($model->exists && $saved->is($model))) {
                ($entry['commit'])($saved);
            }
        }
    }
}
