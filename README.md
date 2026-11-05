# Larajax UI – Form and List widgets for Laravel

Larajax UI builds data-driven interfaces from configuration. Describe a form's fields or a list's columns in YAML, bind a model, and the widget renders working markup with AJAX behavior (sorting, pagination, searching, validation) wired up automatically.

It is for admin-quality forms and lists in a regular Laravel application, without hand-written markup, a frontend framework or a build step.

## About Larajax UI

Define the interface declaratively:

```yaml
# resources/ui/user/columns.yaml
columns:
    name:
        label: Name
        searchable: true
    email:
        label: Email Address
    created_at:
        label: Created
        type: datetime
```

Build the widget in a controller and render it in a view:

```php
use App\Models\User;
use Larajax\Ui\Widgets\Lists;

public function index()
{
    $widget = Lists::make(
        model: new User,
        columns: '~/resources/ui/user/columns.yaml',
        recordsPerPage: 10,
    );

    return view('users.index', ['widget' => $widget]);
}
```

Widgets render as safe HTML, so Blade's escaped output works directly:

```blade
{{ $widget }}
```

That renders a sortable, searchable, paginated table of users. Forms work the same way from a `fields.yaml`, and filters from a `scopes.yaml`.

Each widget is a [Larajax](https://larajax.org) view component, so its AJAX handlers need no extra wiring.

## Key ideas

- Configuration over hand-written markup, as YAML or PHP arrays
- Controller-based AJAX handlers, HTML over the wire
- Plain CSS and ES modules with no build step and no JavaScript framework
- Works with plain Eloquent models
- Styled on top of Bootstrap 6, with light and dark themes

## Included widgets

- **Form** - YAML or array-driven form builder with field widgets (text, dropdown, relation, file upload, repeater, etc.)
- **Lists** - sortable, paginated record lists with column types and row actions
- **ListStructure** - tree and reorderable list variants
- **Filter** - scope-based filtering for list views, including popover scopes (date, text, number, group)
- **Toolbar** - declarative action buttons and search bar
- **Ui facade** - buttons, inputs, dropdowns and callouts for your own views

## Requirements

- PHP 8.2 or higher
- Laravel 12 or later
- [Bootstrap 6](https://getbootstrap.com) (`6.0.0-alpha.1`)

## Installation

```bash
composer require larajax/ui
```

### Assets

Publish the CSS and JavaScript after installing, and again after upgrading:

```bash
php artisan vendor:publish --tag=larajax-ui-assets
```

Include them in your layout after Bootstrap and the Larajax framework bundle:

```blade
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="{{ asset('vendor/larajax/ui/ui.css') }}">
<script type="module" src="https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/js/bootstrap.bundle.min.js"></script>
<script src="{{ asset('vendor/larajax/framework-bundle.js') }}"></script>
<script type="module" src="{{ asset('vendor/larajax/ui/ui.js') }}"></script>
```

Use `framework-bundle.js`, not `framework.js`. Set `data-bs-theme="light"` or `"dark"` on `<html>` so the widgets and Bootstrap share a theme.

### Using Vite

Import the source from `vendor` and register the controls before starting the framework:

```js
// resources/js/app.js
import { jax } from "larajax";
import { registerUi } from "../../vendor/larajax/ui/resources/assets/index.js";
import "../../vendor/larajax/ui/resources/assets/ui.css";

registerUi(jax);
jax.start();
```

Keep the `larajax` npm package on the same version as `larajax/larajax`. Load Bootstrap 6's CSS before `ui.css`, and its JavaScript (`import "bootstrap"`) for menus.

Optional aliases for `vite.config.js`:

```js
import path from "node:path";

resolve: {
    alias: [
        { find: /^larajax-ui$/, replacement: path.resolve(import.meta.dirname, "vendor/larajax/ui/resources/assets/index.js") },
        { find: /^larajax-ui\/ui\.css$/, replacement: path.resolve(import.meta.dirname, "vendor/larajax/ui/resources/assets/ui.css") },
    ],
},
```

### Icon packs

To switch icon packs or override the library's icons, publish the config:

```bash
php artisan vendor:publish --tag=larajax-ui-config
```

Pick a pack (`october`, `phosphor` or `bootstrap`) in `config/larajax-icons.php` or with `LARAJAX_ICONS`, and override single icons under `overrides`:

```php
'default' => env('LARAJAX_ICONS', 'phosphor'),

'overrides' => [
    'tooltip.info' => 'my-icon my-info',
],
```

`Ui::extendIcons([...])` applies the same overrides at runtime.

### Translations

The rich editor, data table and markdown editor show their interface text in the application's locale. Translations for 45 languages ship with the published assets, as plain scripts in three folders:

| Folder | Strings |
|---|---|
| `languages/` | The library's widgets: data table messages, markdown editor buttons |
| `vendor/richarea/languages/` | The rich editor |
| `vendor/hotsheet/languages/` | The data grid |

Nothing needs including. A field looks up the translation for `app()->getLocale()` (`de-AT` finds `de`, `pt_BR` finds `pt-br`), renders it as `data-language`, and loads the file the first time a widget needs it. A locale without a translation stays in English.

To save that request, include the files in the page; a widget that finds its language already there loads nothing:

```blade
<script src="{{ asset('vendor/larajax/ui/vendor/richarea/languages/de.js') }}"></script>
```

`Larajax\Ui\Helpers\Language::paths('de')` lists the files serving a locale, for a build step that bundles them. With Vite, import the files you need, since the widgets can't load them out of a bundle:

```js
import "../../vendor/larajax/ui/resources/assets/vendor/richarea/languages/de.js";
```

A widget created in JavaScript without `data-language` follows the page's `<html lang>`, using a translation the page already has. The rich editor and data table also take a `lang` option (`data-lang`) whose strings override single translations.

## Background

Larajax UI was extracted from the widget engine used in [October CMS](https://github.com/octobercms), where it has rendered admin panel forms and lists in production for many years.

## Resources

- Documentation and examples: https://ui.larajax.org
- Source code: https://github.com/larajax/ui

## License

Larajax UI is open-sourced software licensed under the [MIT license](LICENSE.md).
