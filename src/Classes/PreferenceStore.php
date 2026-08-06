<?php namespace October\Amber\Classes;

use Illuminate\Support\Facades\Session;

/**
 * PreferenceStore is a session-backed store for widget user preferences.
 *
 * October CMS stores these in the backend user preferences database model
 * (Backend\Models\UserPreference). Amber runs standalone, so preferences are
 * kept in the session by default. Override `getPreferenceStorage` on the
 * consuming class to supply a durable per-user store.
 *
 * @package october\amber
 * @author Alexey Bobkov, Samuel Georges
 */
class PreferenceStore
{
    /**
     * @var string sessionKey base for stored preferences
     */
    protected string $sessionKey = 'amber.preferences';

    /**
     * get a preference value
     */
    public function get(string $key, $default = null)
    {
        return Session::get($this->sessionKey.'.'.$key, $default);
    }

    /**
     * set a preference value
     */
    public function set(string $key, $value): void
    {
        Session::put($this->sessionKey.'.'.$key, $value);
    }

    /**
     * reset removes a preference value
     */
    public function reset(string $key): void
    {
        Session::forget($this->sessionKey.'.'.$key);
    }
}
