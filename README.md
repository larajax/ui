# Larajax UI – Form and List widgets for Laravel

Larajax UI builds data-driven interfaces from configuration. Describe a form's fields or a list's columns in YAML, bind a model, and the widget renders working markup with AJAX behavior — sorting, pagination, searching, validation — wired up automatically.

It is designed for developers who want admin-quality forms and lists in a regular Laravel application, without hand-writing markup, adopting a frontend framework, or running a build step.

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
    $widget = Lists::make([
        'model' => new User,
        'columns' => '~/resources/ui/user/columns.yaml',
        'recordsPerPage' => 10,
    ]);

    return view('users.index', ['widget' => $widget]);
}
```

```blade
{!! $widget->render() !!}
```

That renders a sortable, searchable, paginated table of users. Forms work the same way from a `fields.yaml`, and filters from a `scopes.yaml`.

Each widget is a [Larajax](https://larajax.org) view component, so its AJAX handlers (sorting, uploads, validation, partial updates) are wired in automatically and behave like any other Larajax component on the page.

## Key ideas

- Configuration over hand-written markup — YAML or PHP arrays
- Controller-based AJAX handlers, HTML over the wire
- Plain CSS and ES modules — no build step, no JavaScript framework
- Works with plain Eloquent models
- Styled on top of Bootstrap 5, with light and dark themes

## Included widgets

- **Form** - YAML or array-driven form builder with field widgets (text, dropdown, relation, file upload, etc.)
- **Lists** - sortable, paginated record lists with column types and row actions
- **ListStructure** - tree and reorderable list variants
- **Filter** - scope-based filtering for list views
- **Toolbar** - action buttons and search bar
- **Ui facade** - buttons, inputs, dropdowns and callouts for your own views

## Requirements

- PHP 8.2 or higher
- Laravel 12
- [larajax/larajax](https://larajax.org) (provides the view component interface and the `window.jax` browser API)
- [october/rain](https://github.com/octobercms/library) (database, validation and HTML helpers)
- [Bootstrap 5](https://getbootstrap.com) (styling foundation; the popup control wraps the Bootstrap Modal)

## Installation

```bash
composer require larajax/ui
```

The package registers a `UiServiceProvider` automatically via Laravel's package discovery.

### Publishing assets

The widgets ship a small CSS + JS bundle that the browser loads at runtime. Publish it once after installing (and again after upgrading):

```bash
php artisan vendor:publish --tag=larajax-ui-assets
```

Files are copied verbatim into `public/vendor/larajax/ui/`. There is no build step; the JS is plain ES modules and the CSS is plain CSS with `@import`.

Include them in your layout, after the larajax framework bundle:

```blade
<link rel="stylesheet" href="{{ asset('vendor/larajax/ui/ui.css') }}">
<script src="{{ asset('vendor/larajax/framework-bundle.js') }}"></script>
<script type="module" src="{{ asset('vendor/larajax/ui/ui.js') }}"></script>
```

Larajax exposes the `window.jax` API that the widgets register their controls against, so it must load first. Use the bundle build — the plain `framework.js` build does not include the control API (`jax.registerControl`) that Larajax UI requires.

Alternatively, applications using Vite can import the entries directly from the vendor directory instead of publishing - `resources/assets` is the browser-consumable root, so the source tree resolves the same way the published tree does:

```js
import '../../vendor/larajax/ui/resources/assets/ui.js';
```

## Background

Larajax UI was extracted from the widget engine used in [October CMS](https://github.com/octobercms), where it has rendered admin panel forms and lists in production for many years.

It is now packaged as a standalone Laravel library.

## Resources

- Documentation and examples: https://larajax.org
- Source code: https://github.com/larajax/ui


### Icon packs

Larajax UI resolves widget icons through `Ui::icon()` and `Ui::iconClass()`. Publish the icon config when you want to switch packs or override individual icons:

```bash
php artisan vendor:publish --tag=larajax-ui-config
```

Then select a default pack in `config/larajax-icons.php` or with `LARAJAX_ICONS`:

```php
'default' => env('LARAJAX_ICONS', 'phosphor'),
```

The package ships `october`, `phosphor`, and `bootstrap` packs. Unknown icon names fall back to the provided value as a raw CSS class, so existing code can still pass `icon-pencil`, `ph ph-pencil`, or a project-specific class. To customize icons, add flat global overrides. At runtime, `Ui::extendIcons([...])` can apply the same kind of overlay from a service provider:

```php
'overrides' => [
    'tooltip.info' => 'my-icon my-info',
    'pagination.next' => 'my-icon my-next',
],
```

## License

Larajax UI is open-sourced software licensed under the [MIT license](LICENSE.md).
