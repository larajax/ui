<?php namespace Larajax\Ui\Helpers;

/**
 * NumberFormat helper, showing plain numbers with locale separators and fixed decimals by working on the digits, so long values keep their precision
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class NumberFormat
{
    /**
     * format returns a plain number with the separators and decimals of a format, or the value unchanged when it is not a plain number or the locale's separators are unknown.
     *
     * @param  array{locale: string, decimals: int|null, grouping: bool}  $format
     */
    public static function format(string $value, array $format): string
    {
        if (!preg_match('/^(-?)(\d*)(?:\.(\d*))?$/', $value, $match) || ($match[2] === '' && ($match[3] ?? '') === '')) {
            return $value;
        }

        $symbols = static::symbols($format['locale']);
        if ($symbols === null) {
            return $value;
        }

        $sign = $match[1];
        $integer = $match[2];
        $fraction = $match[3] ?? '';

        if ($format['decimals'] !== null) {
            [$integer, $fraction] = static::round($integer, $fraction, $format['decimals']);
        }

        $integer = ltrim($integer, '0') ?: '0';

        if (trim($integer.$fraction, '0') === '') {
            $sign = '';
        }

        if ($format['grouping']) {
            $integer = static::group($integer, $symbols['group'], $symbols['groupSize'], $symbols['secondaryGroupSize']);
        }

        return $sign.$integer.($fraction !== '' ? $symbols['decimal'].$fraction : '');
    }

    /**
     * symbols returns the decimal and group separators of a locale and its group sizes, or null when they are unknown.
     *
     * @return array{decimal: string, group: string, groupSize: int, secondaryGroupSize: int}|null
     */
    public static function symbols(string $locale): ?array
    {
        if (class_exists(\NumberFormatter::class)) {
            $formatter = new \NumberFormatter($locale, \NumberFormatter::DECIMAL);

            return [
                'decimal' => $formatter->getSymbol(\NumberFormatter::DECIMAL_SEPARATOR_SYMBOL),
                'group' => $formatter->getSymbol(\NumberFormatter::GROUPING_SEPARATOR_SYMBOL),
                'groupSize' => (int) $formatter->getAttribute(\NumberFormatter::GROUPING_SIZE),
                'secondaryGroupSize' => (int) $formatter->getAttribute(\NumberFormatter::SECONDARY_GROUPING_SIZE),
            ];
        }

        // Without the intl extension only English separators are known, and the browser formats other locales
        if (preg_match('/^en([-_]|$)/i', $locale)) {
            return ['decimal' => '.', 'group' => ',', 'groupSize' => 3, 'secondaryGroupSize' => 3];
        }

        return null;
    }

    /**
     * toPlainString returns a stored number as plain digits, since a float casts to exponent notation from 1e15.
     */
    public static function toPlainString(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        if (!is_float($value)) {
            return trim((string) $value);
        }

        $string = (string) json_encode($value);

        if (stripos($string, 'e') !== false) {
            $string = rtrim(rtrim(sprintf('%.20F', $value), '0'), '.');
        }

        return preg_replace('/\.0$/', '', $string);
    }

    /**
     * round pads or rounds the fraction to a number of decimals, carrying into the integer digits.
     *
     * @return array{0: string, 1: string}
     */
    protected static function round(string $integer, string $fraction, int $decimals): array
    {
        if (strlen($fraction) <= $decimals) {
            return [$integer, str_pad($fraction, $decimals, '0')];
        }

        $roundsUp = $fraction[$decimals] >= '5';
        $digits = ($integer === '' ? '0' : $integer).substr($fraction, 0, $decimals);

        if ($roundsUp) {
            $digits = static::increment($digits);
        }

        return $decimals === 0
            ? [$digits, '']
            : [substr($digits, 0, -$decimals), substr($digits, -$decimals)];
    }

    /**
     * increment adds one to a string of digits.
     */
    protected static function increment(string $digits): string
    {
        for ($i = strlen($digits) - 1; $i >= 0; $i--) {
            if ($digits[$i] !== '9') {
                $digits[$i] = (string) ((int) $digits[$i] + 1);

                return $digits;
            }

            $digits[$i] = '0';
        }

        return '1'.$digits;
    }

    /**
     * group places the group separator between the integer digits, using the secondary size past the first group.
     */
    protected static function group(string $integer, string $separator, int $size, int $secondarySize): string
    {
        if ($size < 1 || strlen($integer) <= $size) {
            return $integer;
        }

        $secondarySize = $secondarySize > 0 ? $secondarySize : $size;
        $groups = [substr($integer, -$size)];
        $head = substr($integer, 0, -$size);

        while (strlen($head) > $secondarySize) {
            array_unshift($groups, substr($head, -$secondarySize));
            $head = substr($head, 0, -$secondarySize);
        }

        array_unshift($groups, $head);

        return implode($separator, $groups);
    }
}
