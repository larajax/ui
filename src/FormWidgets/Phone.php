<?php namespace Larajax\Ui\FormWidgets;

use Larajax\Ui\Classes\FormWidgetBase;

/**
 * Phone renders a phone number field with a country picker, saving the number in the international E.164 format.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class Phone extends FormWidgetBase
{
    //
    // Configurable Properties
    //

    /**
     * @var string|null defaultCountry for numbers typed without a country code, as a two letter code such as AU.
     */
    public $defaultCountry;

    /**
     * @var array|null countries the picker offers as two letter codes, or every country when null.
     */
    public $countries;

    /**
     * @var array preferredCountries shown first in the picker, as two letter codes.
     */
    public $preferredCountries = [];

    /**
     * @var bool readOnly shows the number without letting it change.
     */
    public $readOnly = false;

    /**
     * @var bool disabled locks the number and leaves it out of the saved data.
     */
    public $disabled = false;

    //
    // Object Properties
    //

    /**
     * @inheritDoc
     */
    protected $defaultAlias = 'phone';

    /**
     * @inheritDoc
     */
    public function init()
    {
        $this->fillFromConfig([
            'defaultCountry',
            'countries',
            'preferredCountries',
            'readOnly',
            'disabled',
        ]);
    }

    /**
     * @inheritDoc
     */
    public function render()
    {
        $this->prepareVars();
        return $this->makePartial('phone');
    }

    /**
     * prepareVars for display
     */
    public function prepareVars()
    {
        $this->vars['name'] = $this->getFieldName();
        $this->vars['inputId'] = $this->formField->getId();
        $this->vars['value'] = (string) $this->getLoadValue();
        $this->vars['defaultCountry'] = $this->getDefaultCountry();
        $this->vars['countries'] = is_array($this->countries) ? $this->normalizeCountries($this->countries) : null;
        $this->vars['preferredCountries'] = $this->normalizeCountries((array) $this->preferredCountries);
        $this->vars['readOnly'] = $this->readOnly;
        $this->vars['disabled'] = $this->disabled;
    }

    /**
     * getDefaultCountry returns the configured country, or the region of the app locale such as AU for en_AU, or an empty string to leave it to the browser's region.
     */
    public function getDefaultCountry(): string
    {
        if ($this->defaultCountry) {
            return strtoupper((string) $this->defaultCountry);
        }

        if (preg_match('/[-_]([A-Za-z]{2})$/', (string) app()->getLocale(), $match)) {
            return strtoupper($match[1]);
        }

        return '';
    }

    /**
     * @inheritDoc
     */
    public function getSaveValue($value)
    {
        if (!is_string($value)) {
            return $value;
        }

        $value = trim($value);

        if ($value === '') {
            return null;
        }

        // An international number keeps only its plus and digits, dropping spaces and punctuation around them
        if (preg_match('/^\+[\d\s().\-]+$/', $value)) {
            return '+'.preg_replace('/\D+/', '', $value);
        }

        return $value;
    }

    /**
     * normalizeCountries returns two letter country codes in upper case, dropping anything else.
     *
     * @param  array<int, mixed>  $countries
     * @return array<int, string>
     */
    protected function normalizeCountries(array $countries): array
    {
        $codes = array_map(fn ($country) => strtoupper(trim((string) $country)), $countries);

        return array_values(array_unique(array_filter($codes, fn ($code) => preg_match('/^[A-Z]{2}$/', $code))));
    }
}
