<?php namespace Larajax\Ui\Helpers;

use Illuminate\Contracts\Database\Query\Expression;
use Illuminate\Support\Facades\DB;

/**
 * Sql helper prepares the raw SQL in widget definitions, such as scope conditions and column selects, for the database connection
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Sql
{
    /**
     * parse fills the `:name` placeholders with quoted values and passes the result through the SQL resolver of larajax.ui, when one is set.
     */
    public static function parse(string $sql, ?array $params = null): string
    {
        if (is_array($params) && preg_match_all('/\:([\w]+)/', $sql, $matches)) {
            $sql = static::parseValues($sql, $params, $matches[1]);
        }

        return app('larajax.ui')->resolveSql($sql);
    }

    /**
     * raw returns a parsed SQL statement as a query expression.
     */
    public static function raw(string $sql, ?array $params = null): Expression
    {
        return DB::raw(static::parse($sql, $params));
    }

    /**
     * cast converts an expression to a type on PostgreSQL, which does not convert types for comparisons.
     */
    public static function cast(string $sql, string $asType = 'INTEGER'): string
    {
        $driver = DB::connection()->getDriverName();

        if ($driver !== 'pgsql' && $driver !== 'postgis') {
            return $sql;
        }

        return 'CAST(' . $sql . ' AS ' . $asType . ')';
    }

    /**
     * groupConcat joins an expression's values across grouped rows, in MySQL syntax when an SQL resolver is set to rewrite it, otherwise in the connection's syntax.
     */
    public static function groupConcat(string $sql, string $separator = ', '): string
    {
        $quoted = "'" . str_replace("'", "''", $separator) . "'";

        if (app('larajax.ui')->hasSqlResolver()) {
            return "group_concat({$sql} separator {$quoted})";
        }

        return match (DB::connection()->getDriverName()) {
            'pgsql', 'postgis' => "string_agg(cast({$sql} as text), {$quoted})",
            'sqlsrv' => "string_agg({$sql}, {$quoted})",
            'sqlite' => "group_concat({$sql}, {$quoted})",
            default => "group_concat({$sql} separator {$quoted})",
        };
    }

    /**
     * parseValues replaces placeholders with quoted values, where `%:name`, `:name%` and `%:name%` add wildcards for LIKE matches.
     */
    protected static function parseValues(string $sql, array $data, array $paramNames): string
    {
        $toReplace = [];

        foreach ($paramNames as $param) {
            $parsedValue = array_key_exists($param, $data) ? $data[$param] : null;

            if (is_string($parsedValue)) {
                $pdo = DB::connection()->getPdo();
                $toReplace['%:'.$param.'%'] = $pdo->quote('%'.$parsedValue.'%');
                $toReplace['%:'.$param] = $pdo->quote('%'.$parsedValue);
                $toReplace[':'.$param.'%'] = $pdo->quote($parsedValue.'%');
                $toReplace[':'.$param] = $pdo->quote($parsedValue);
            }
            else {
                if (is_null($parsedValue)) {
                    $parsedValue = 'NULL';
                }
                elseif (is_numeric($parsedValue)) {
                    $parsedValue = +$parsedValue;
                }
                else {
                    $parsedValue = "''";
                }

                $toReplace['%:'.$param.'%'] = $parsedValue;
                $toReplace['%:'.$param] = $parsedValue;
                $toReplace[':'.$param.'%'] = $parsedValue;
                $toReplace[':'.$param] = $parsedValue;
            }
        }

        return strtr($sql, $toReplace);
    }
}
