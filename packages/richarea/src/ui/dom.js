/**
 * h creates an element with properties, attributes, listeners and children.
 */
export function h(tagName, props = {}, children = []) {
    const element = document.createElement(tagName);

    Object.keys(props).forEach((key) => {
        const value = props[key];

        if (value === null || value === undefined || value === false) {
            return;
        }

        if (key === 'className') {
            element.className = value;
        }
        else if (key === 'text') {
            element.textContent = value;
        }
        else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        }
        else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), value);
        }
        else {
            element.setAttribute(key, value === true ? '' : value);
        }
    });

    (Array.isArray(children) ? children : [children]).forEach((child) => {
        if (child === null || child === undefined || child === false) {
            return;
        }

        element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });

    return element;
}

/**
 * icon renders an icon element from a class name string or an { html } definition.
 */
export function icon(definition, className = 'rich-editor-icon') {
    if (definition && typeof definition === 'object' && definition.html) {
        const holder = h('span', { className, 'aria-hidden': 'true' });
        holder.innerHTML = definition.html;
        return holder;
    }

    return h('i', { className: (className + ' ' + (typeof definition === 'string' ? definition : '')).trim(), 'aria-hidden': 'true' });
}

/**
 * mountRoot returns the dialog enclosing an element, or the page body, since the page outside an open modal dialog is inert.
 */
export function mountRoot(element) {
    return (element && element.closest('dialog')) || document.body;
}

/**
 * applyTheme gives a panel placed on the page body the colour theme of the nearest themed ancestor of the editor.
 */
export function applyTheme(panel, element) {
    const scope = element.closest('[data-bs-theme]');

    // Panels on the body inherit the page theme, so only a nested theme scope is copied
    if (scope && scope !== document.documentElement && scope !== document.body) {
        panel.setAttribute('data-bs-theme', scope.getAttribute('data-bs-theme'));
    }
    else {
        panel.removeAttribute('data-bs-theme');
    }
}

/**
 * selectFiles opens the browser file picker and resolves with the chosen files, placing its input beside the given element.
 */
export function selectFiles({ accept, multiple = false, root = null } = {}) {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.style.display = 'none';
        input.multiple = multiple;

        if (accept) {
            input.accept = accept;
        }

        const finish = (files) => {
            input.remove();
            resolve(files);
        };

        input.addEventListener('change', () => finish(Array.from(input.files || [])), { once: true });
        input.addEventListener('cancel', () => finish([]), { once: true });

        mountRoot(root).appendChild(input);
        input.click();
    });
}
