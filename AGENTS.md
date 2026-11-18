# Building with Larajax UI

This file is for AI coding agents working in a Laravel application that has `larajax/ui` installed. It
ships with the package, at `vendor/larajax/ui/AGENTS.md`. Read it before you build or change a screen.

Larajax UI builds forms, lists, filters and toolbars from YAML definitions. Each widget renders its own
markup and answers its own AJAX requests: sorting, paging, searching, filtering, validation messages
and uploads. The library is recent, so you are unlikely to know it from training. What you need to
start is below, and the full documentation is at https://ui.larajax.org.

## Use the widgets

Build the application's screens with the widgets, and do not write by hand what a widget already does.
A hand-written table or form looks unlike the rest of the application and has none of the behaviour.

- **A page that lists records** uses `Lists` with a `columns.yaml`. Do not write a `<table>`, sorting
  links, a search query or pagination.
- **A page that creates or edits a record** uses `Form` with a `fields.yaml`. Do not write `<input>`,
  `<select>` or `<textarea>` elements, or markup for validation messages.
- **Filtering a list** uses `Filter` with a `scopes.yaml`. Do not write filter inputs or read the query
  string yourself.
- **Buttons and a search box above a list** use `Toolbar`.
- **A tree, or a list reordered by dragging,** uses `ListStructure`.
- **Buttons, dropdown menus, popups, callouts, scoreboards and charts** in your own views come from the
  `Ui` facade, such as `Ui::ajaxButton()`.

When nothing built in fits, write a widget of your own, as [When nothing fits](#when-nothing-fits)
describes. Do not fall back to markup and script written into a view.

Before adding a screen, read a controller the application already has, with its views and its
definition files, and follow the same pattern.

## How a page is built

A page has four parts: a definition file, a controller action that builds the widget, a view that
prints it, and a route that answers both GET and POST.

### Definitions

Definitions are YAML files, by convention in one folder for each model under `resources/ui`. Use the
folder the application already uses.

```yaml
# resources/ui/group/columns.yaml
columns:
    name:
        label: Name
        searchable: true
        sortable: true

    users_count:
        label: Members
        type: number
        relation: users
        relationCount: true

    created_at:
        label: Created
        type: date
        sortable: true
```

```yaml
# resources/ui/group/fields.yaml
fields:
    name:
        label: Name
        span: left

    code:
        label: Code
        span: right
        comment: A unique machine-readable identifier.

    description:
        label: Description
        type: textarea
        size: small

    users:
        label: Members
        type: taglist
        nameFrom: name
```

Each key is a model attribute or relation name. A field or column with no `type` is `text`.

### The controller

Controllers that show widgets extend Larajax's controller and use the library's `ViewMaker` trait. An
application usually has a base class that does both, so extend that one.

```php
use Larajax\LarajaxController;
use Larajax\Ui\Traits\ViewMaker;

abstract class ControllerBase extends LarajaxController
{
    use ViewMaker;
}
```

Build each widget with `::make()` inside the action. A path starting with `~/` resolves from the
application root.

```php
use Larajax\Ui\Widgets\Filter;
use Larajax\Ui\Widgets\Lists;
use Larajax\Ui\Widgets\Toolbar;

public function index(): View
{
    $list = Lists::make(
        model: new Group,
        columns: '~/resources/ui/group/columns.yaml',
        recordUrl: 'groups/:id/edit',
        recordsPerPage: 20,
    );

    $filter = Filter::make(model: new Group, scopes: '~/resources/ui/group/scopes.yaml');
    $filter->bindToListWidget($list);

    $toolbar = Toolbar::make(
        buttons: '~/resources/ui/group/buttons.yaml',
        search: ['prompt' => 'Search groups...'],
    );
    $toolbar->bindToListWidget($list);

    return view('groups.index', compact('toolbar', 'filter', 'list'));
}
```

A form is built the same way, and saved by a handler. A handler is a public controller method whose
name starts with `on`. It builds the form again, the way the page did, and reads the posted values
with `getSaveData()`.

```php
use Larajax\Ui\Widgets\Form;

public function edit(Group $group): View
{
    return view('groups.edit', ['form' => $this->makeForm($group, 'update')]);
}

public function onUpdate(Group $group)
{
    $data = $this->makeForm($group, 'update')->getSaveData();

    Validator::make($data, ['name' => 'required'])->validate();

    $group->fill($data)->save();

    return ajax()->flash('success', 'Group saved.');
}

protected function makeForm(Group $group, string $context): Form
{
    return Form::make(
        model: $group,
        fields: '~/resources/ui/group/fields.yaml',
        context: $context,
    );
}
```

### The view and the route

Widgets are `Htmlable`, so Blade's `{{ }}` prints them. A form widget renders the fields only, so the
view wraps it in a `<form>` that names the handler.

```blade
{{ $toolbar }}
{{ $filter }}
{{ $list }}
```

```blade
<form data-request="onUpdate" data-request-flash>
    {{ $form }}

    {{ Ui::ajaxButton(label: 'Save', handler: 'onUpdate', primary: true) }}
</form>
```

The page and its AJAX requests share one address, so the route accepts both methods.

```php
Route::match(['get', 'post'], '/groups', [GroupsController::class, 'index']);
Route::match(['get', 'post'], '/groups/{group}/edit', [GroupsController::class, 'edit']);
```

### Rules that are easy to miss

- **Build widgets in the action on every request.** Larajax runs the page's action again before an AJAX
  handler, and a handler cannot reach a widget the action did not build.
- **Validate in the handler.** Fields validate nothing, and `required: true` only marks the label.
  Throw a `ValidationException` and the messages appear beside their fields.
- **Map relation fields before filling.** A relation field posts under its relation name. Set a
  `belongsTo` through its foreign key, and sync a `belongsToMany` after the record is saved.
- **Post the session key with uploads.** A form with a `fileupload` field needs
  `<input type="hidden" name="_session_key" value="{{ $form->getSessionKey() }}" />` inside its
  `<form>`, or the upload is not attached when the record saves.
- **Give two widgets of one kind an alias each.** A widget's handlers are addressed as
  `alias::onHandler`, and the aliases default to `list`, `form`, `filter` and `toolbar`. Pass
  `alias: 'recentList'` to tell a second one apart.
- **Refresh a list from a handler** with `return ajax()->update($list->onRefresh());`.

## What is built in

Check these before you write anything of your own. Each `make()` method in
`vendor/larajax/ui/src/Widgets` documents its options, and every type below has a section in the docs.

- **Field types:** `text`, `email`, `number`, `password`, `textarea`, `dropdown`, `radio`, `checkbox`,
  `switch`, `checkboxlist`, `selector`, `section`, `hint`, `ruler`, `partial`.
  See https://ui.larajax.org/forms/fields.
- **Form widgets**, used as a field's `type`: `relation`, `recordfinder`, `taglist`, `repeater`,
  `nestedform`, `datatable`, `fileupload`, `datepicker`, `colorpicker`, `richeditor`, `markdown`,
  `phone`, `sensitive`. Each has a page, such as https://ui.larajax.org/form-widgets/relation.
- **Column types:** `text`, `number`, `switch`, `date`, `datetime`, `time`, `timesince`, `timetense`,
  `selectable`, `summary`, `image`, `file`, `linkage`, `colorpicker`, `partial`.
  See https://ui.larajax.org/lists/columns.
- **Scope types:** `checkbox`, `switch`, `dropdown`, `group`, `date`, `text`, `number`, `trashed`.
  See https://ui.larajax.org/filters/scopes.
- **`Ui` facade:** `button`, `ajaxButton`, `popupButton`, `iconButton`, `dropdownButton`,
  `dropdownItem`, `dropdownDivider`, `callout`, `searchInput`, `scoreboard`, `scoreboardItem`,
  `scoreboardThumbnail`, `pieChart`, `barChart`, `lineChart`, `statusList`, `statusItem`, `icon`.
  See https://ui.larajax.org/ui/buttons and the pages beside it.

A `partial` field or column renders a view of your own inside the form or list, which is enough for a
one-off piece of markup.

## When nothing fits

Write a widget. A widget is a PHP class with its own partials and AJAX handlers, so it works on every
page that uses it. Both kinds are walked through, with running code, at
https://ui.larajax.org/extending/custom-widgets.

### A form widget, for a new kind of field

Extend `Larajax\Ui\Classes\FormWidgetBase`, register the class under a code, and name the code as a
field's `type`. Options set beside `type` in the YAML reach the widget through `fillFromConfig()`.

```php
// app/FormWidgets/Rating.php
namespace App\FormWidgets;

use Larajax\Ui\Classes\FormWidgetBase;

class Rating extends FormWidgetBase
{
    public $stars = 5;

    public function init(): void
    {
        $this->fillFromConfig(['stars']);
    }

    public function render(): string
    {
        $this->vars['name'] = $this->getFieldName();
        $this->vars['value'] = $this->getLoadValue();

        return $this->makePartial('rating');
    }

    public function getSaveValue($value): ?int
    {
        return strlen((string) $value) ? (int) $value : null;
    }
}
```

```php
// app/Providers/AppServiceProvider.php, in boot()
app('system.widgets')->registerFormWidgets(function ($manager) {
    $manager->registerFormWidget(\App\FormWidgets\Rating::class, 'rating');
});
```

The partial is a plain PHP file at `app/FormWidgets/Rating/partials/_rating.php`, where `$this` is the
widget and the entries of `$this->vars` are variables. It must contain an input named with `$name`, so
the form posts the value.

### A standalone widget, for a part of a page

Extend `Larajax\Ui\Classes\WidgetBase` and build it in the controller with `make()`. Its named
arguments become the widget's options. There is nothing to register.

```php
// app/Widgets/ActivityFeed.php
namespace App\Widgets;

use Larajax\Ui\Classes\WidgetBase;

class ActivityFeed extends WidgetBase
{
    public $record;

    public $pageSize = 10;

    public function init(): void
    {
        $this->fillFromConfig(['record', 'pageSize']);
    }

    public function render(): string
    {
        $this->prepareVars($this->pageSize);

        return $this->makePartial('activityfeed');
    }

    public function onLoadMore(): array
    {
        $this->prepareVars(request()->integer('shown') + $this->pageSize);

        return ['#'.$this->getId() => $this->makePartial('items')];
    }

    protected function prepareVars(int $shown): void
    {
        $this->vars['items'] = $this->record->activities()->latest()->take($shown)->get();
    }
}
```

```php
// In the controller action
$feed = ActivityFeed::make(record: $post, pageSize: 10);
```

- The outer partial, `app/Widgets/ActivityFeed/partials/_activityfeed.php`, holds an element with
  `id="<?= $this->getId() ?>"` and renders the inner partial, `_items.php`, inside it.
- The handler returns the inner partial keyed by `#` and that id, which replaces what is inside the
  element.
- A button calls the handler with
  `Ui::ajaxButton(label: 'Show more', handler: $this->getEventHandler('onLoadMore'), requestData: ['shown' => count($items)])`.
- Partials are plain PHP and escape nothing, so pass every value through `e()`.

### Assets

Either kind of widget adds its own files in `loadAssets()`, with `$this->addCss('css/widgets/rating.css')`
and `$this->addJs('js/widgets/rating.js')`. A relative path is under `public`. The layout prints them
with `{{ Ui::renderAssets() }}` in its `<head>`. Scripts register a control with
`jax.registerControl()`, which the markup starts with a `data-control` attribute.

## Where to look

- **Guides:** https://ui.larajax.org/guides/forms, https://ui.larajax.org/guides/lists and
  https://ui.larajax.org/guides/models, which covers relations, file attachments and trees.
- **Installation**, including the layout's assets and Bootstrap 6: https://ui.larajax.org/installation.
- **A complete application:** https://github.com/larajax/amber, the demo app. Its controllers are in
  `app/Controllers` and its definitions in `resources/ui`.
- **Larajax**, for handlers, the `ajax()` response and `data-request` attributes: https://larajax.org.
