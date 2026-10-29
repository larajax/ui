import { h } from './dom.js';

/**
 * createForm renders a small popover form, where onSubmit returns an error message to keep
 * the form open or anything else to accept the values.
 */
export function createForm({ title, fields, submitLabel, onSubmit, actions = [] }) {
    const controls = {};
    const form = h('form', { className: 'rich-editor-form', novalidate: true });

    if (title) {
        form.appendChild(h('div', { className: 'rich-editor-form-title', text: title }));
    }

    fields.forEach((field) => {
        const id = 'rich-editor-field-' + Math.random().toString(36).substring(2, 9);
        let control;

        if (field.type === 'checkbox') {
            control = h('input', { type: 'checkbox', id, name: field.name });
            control.checked = !!field.value;

            form.appendChild(h('div', { className: 'rich-editor-form-check' }, [
                control,
                h('label', { for: id, text: field.label })
            ]));
        }
        else {
            if (field.type === 'textarea') {
                control = h('textarea', { id, name: field.name, rows: field.rows || 4, placeholder: field.placeholder || null });
                control.value = field.value || '';
            }
            else if (field.type === 'select') {
                control = h('select', { id, name: field.name });
                Object.keys(field.options || {}).forEach((value) => {
                    const option = h('option', { value, text: field.options[value] });
                    option.selected = value === (field.value || '');
                    control.appendChild(option);
                });
            }
            else {
                control = h('input', {
                    type: field.type || 'text',
                    id,
                    name: field.name,
                    placeholder: field.placeholder || null,
                    autocomplete: 'off'
                });
                control.value = field.value || '';
            }

            form.appendChild(h('div', { className: 'rich-editor-form-field' }, [
                h('label', { for: id, text: field.label }),
                control
            ]));
        }

        controls[field.name] = control;
    });

    const error = h('div', { className: 'rich-editor-form-error', role: 'alert', hidden: true });
    form.appendChild(error);

    const getValues = () => {
        const values = {};
        Object.keys(controls).forEach((name) => {
            const control = controls[name];
            values[name] = control.type === 'checkbox' ? control.checked : control.value.trim();
        });
        return values;
    };

    const showError = (message) => {
        error.textContent = message;
        error.hidden = false;
    };

    const footer = h('div', { className: 'rich-editor-form-footer' });

    actions.forEach((action) => {
        footer.appendChild(h('button', {
            type: 'button',
            className: 'rich-editor-form-button ' + (action.className || ''),
            text: action.label,
            onClick: () => {
                const result = action.run(getValues());
                if (typeof result === 'string') {
                    showError(result);
                }
            }
        }));
    });

    footer.appendChild(h('span', { className: 'rich-editor-form-spacer' }));
    footer.appendChild(h('button', { type: 'submit', className: 'rich-editor-form-button is-primary', text: submitLabel }));
    form.appendChild(footer);

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const result = onSubmit(getValues());
        if (typeof result === 'string') {
            showError(result);
        }
    });

    return {
        element: form,
        controls,
        focus() {
            const first = fields.find((field) => field.autofocus) || fields[0];
            const control = first ? controls[first.name] : null;

            if (control) {
                control.focus();
                if (control.select && control.type !== 'checkbox') {
                    control.select();
                }
            }
        }
    };
}
