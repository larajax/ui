<?php namespace October\Amber\Database;

use DbDongle;
use Illuminate\Database\Eloquent\Builder;

/**
 * SearchWhereMacros registers the October Rain search builder methods as
 * Eloquent builder macros, so plain Illuminate models support the search
 * behavior used by the list and search widgets.
 *
 * October Rain models inherit these methods from October\Rain\Database\Builder;
 * real methods take precedence over macros, so registering both is harmless.
 *
 * @see \October\Rain\Database\Builder
 * @package october\amber
 * @author Alexey Bobkov, Samuel Georges
 */
class SearchWhereMacros
{
    /**
     * register the macros
     */
    public static function register(): void
    {
        Builder::macro('searchWhere', function ($term, $columns = [], $mode = 'all') {
            return SearchWhereMacros::apply($this, $term, $columns, $mode, 'and');
        });

        Builder::macro('orSearchWhere', function ($term, $columns = [], $mode = 'all') {
            return SearchWhereMacros::apply($this, $term, $columns, $mode, 'or');
        });

        Builder::macro('searchWhereRelation', function ($term, $relation, $columns = [], $mode = 'all') {
            return $this->whereHas($relation, function ($query) use ($term, $columns, $mode) {
                $query->searchWhere($term, $columns, $mode);
            });
        });

        Builder::macro('orSearchWhereRelation', function ($term, $relation, $columns = [], $mode = 'all') {
            return $this->orWhereHas($relation, function ($query) use ($term, $columns, $mode) {
                $query->searchWhere($term, $columns, $mode);
            });
        });
    }

    /**
     * apply a search constraint to the query.
     * Mode can be any of these options:
     * - all: result must contain all words
     * - any: result can contain any word
     * - exact: result must contain the exact phrase
     */
    public static function apply($builder, $term, $columns, $mode, $boolean)
    {
        if (!is_array($columns)) {
            $columns = [$columns];
        }

        if (!$mode) {
            $mode = 'all';
        }

        $query = $builder->getQuery();
        $grammar = $query->getGrammar();

        if ($mode === 'exact') {
            $builder->where(function ($inner) use ($columns, $term, $grammar, $query) {
                foreach ($columns as $field) {
                    if (!strlen($term)) {
                        continue;
                    }
                    $rawField = DbDongle::cast($grammar->wrap($field), 'TEXT');
                    $fieldSql = $query->raw(sprintf("lower(%s)", $rawField));
                    $termSql = '%'.trim(mb_strtolower($term)).'%';
                    $inner->orWhere($fieldSql, 'LIKE', $termSql);
                }
            }, null, null, $boolean);
        }
        else {
            $words = explode(' ', $term);
            $wordBoolean = $mode === 'any' ? 'or' : 'and';

            $builder->where(function ($inner) use ($columns, $words, $wordBoolean, $grammar, $query) {
                foreach ($columns as $field) {
                    $inner->orWhere(function ($subQuery) use ($field, $words, $wordBoolean, $grammar, $query) {
                        foreach ($words as $word) {
                            if (!strlen($word)) {
                                continue;
                            }
                            $rawField = DbDongle::cast($grammar->wrap($field), 'TEXT');
                            $fieldSql = $query->raw(sprintf("lower(%s)", $rawField));
                            $wordSql = '%'.trim(mb_strtolower($word)).'%';
                            $subQuery->where($fieldSql, 'LIKE', $wordSql, $wordBoolean);
                        }
                    });
                }
            }, null, null, $boolean);
        }

        return $builder;
    }
}
