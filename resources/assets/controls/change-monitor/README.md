# Change Monitor

Monitors form inputs for unsaved changes and warns the user before leaving the page. Adds the `oc-data-changed` class to the form element when changes are detected.

## Basic Usage

```html
<form data-change-monitor>
    <input type="text" name="title" />

    <button type="button" data-change-monitor-commit>
        Save
    </button>
</form>
```

A successful AJAX request from a `[data-change-monitor-commit]` element also marks the changes as saved.

## JavaScript API

```js
jax.fetchControl(element, 'change-monitor')
```

### Static Methods

- `jax.changeMonitor.disable()` - Globally disable all change monitors
- `jax.changeMonitor.enable()` - Re-enable all change monitors

### Data Attributes

| Attribute | Description |
|---|---|
| `data-change-monitor` | Enables the control on a form |
| `data-change-monitor-commit` | Marks changes as saved when clicked |

### Events (listened)

Dispatch these on the monitored form element.

| Event | Description |
|---|---|
| `change` | Marks form data as changed |
| `change-monitor:unchange` | Marks form data as unchanged |
| `change-monitor:pause` | Temporarily pauses monitoring |
| `change-monitor:resume` | Resumes monitoring |
| `change-monitor:pause-unload` | Pauses the beforeunload warning |
| `change-monitor:resume-unload` | Resumes the beforeunload warning |

```js
form.dispatchEvent(new CustomEvent('change-monitor:pause'));
```

### Events (triggered)

Dispatched on the monitored form element.

| Event | Description |
|---|---|
| `change-monitor:changed` | Fired when form data changes |
| `change-monitor:unchanged` | Fired when form data is marked as saved |
| `change-monitor:ready` | Fired when initialization completes |
