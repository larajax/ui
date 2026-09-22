/*
 * Dropdown menus.
 *
 * This script customizes Bootstrap drop-downs using the native events
 * dispatched by Bootstrap 5.
 */
'use strict';

document.addEventListener('shown.bs.dropdown', function(ev) {
    const container = ev.target.closest('.dropdown');
    if (!container) {
        return;
    }

    document.body.classList.add('dropdown-open');

    // The dropdown menu should be a sibling of the triggering element (above)
    // otherwise, look for any dropdown menu within this context.
    let dropdown = ev.relatedTarget && ev.relatedTarget.parentElement
        ? ev.relatedTarget.parentElement.querySelector(':scope > .dropdown-menu')
        : null;

    if (!dropdown) {
        dropdown = container.querySelector('.dropdown-menu');
    }

    if (!dropdown) {
        return;
    }

    if (!dropdown.classList.contains('control-dropdown')) {
        dropdown.querySelectorAll('li > a').forEach((el) => el.classList.add('dropdown-item'));
        dropdown.querySelectorAll('li:first-child').forEach((el) => el.classList.add('first-item'));
        dropdown.querySelectorAll('li:last-child').forEach((el) => el.classList.add('last-item'));

        dropdown.classList.add('control-dropdown');
    }

    if (container.dataset.dropdownContainer === 'body') {
        container.ocDropdownMenu = dropdown;
        document.body.appendChild(dropdown);

        dropdown.style.visibility = 'hidden';
        dropdown.style.left = 0;
        dropdown.style.top = 0;
        dropdown.style.display = 'block';

        const targetRect = container.getBoundingClientRect(),
            position = {
                x: targetRect.left + scrollX,
                y: targetRect.bottom + scrollY
            },
            leftOffset = targetRect.width < 30 ? -16 : 0,
            documentHeight = document.documentElement.scrollHeight,
            dropdownHeight = dropdown.offsetHeight;

        if ((dropdownHeight + position.y) > documentHeight) {
            position.y = targetRect.top + scrollY - dropdownHeight - 12;
            dropdown.classList.add('top');
        }
        else {
            dropdown.classList.remove('top');
        }

        dropdown.style.left = (position.x + leftOffset) + 'px';
        dropdown.style.top = position.y + 'px';
        dropdown.style.visibility = 'visible';
    }

    if (!document.body.querySelector(':scope > .dropdown-overlay')) {
        const overlay = document.createElement('div');
        overlay.classList.add('dropdown-overlay');
        document.body.prepend(overlay);
    }
});

document.addEventListener('hidden.bs.dropdown', function(ev) {
    const container = ev.target.closest('.dropdown');
    if (!container) {
        return;
    }

    const dropdown = container.ocDropdownMenu;
    if (dropdown) {
        dropdown.style.display = 'none';
        container.appendChild(dropdown);
    }

    document.body.classList.remove('dropdown-open');
});

/*
 * Fixed positioned dropdowns
 * - Useful for dropdowns inside hidden overflow containers
 */

let fixedDropdown, fixedContainer, fixedTarget;

function fixDropdownPosition() {
    const rect = fixedContainer.getBoundingClientRect(),
        top = rect.top + fixedTarget.offsetHeight + 1,
        left = rect.left + scrollX;

    fixedDropdown.style.position = 'fixed';
    fixedDropdown.style.inset = '0px auto auto 0px';
    fixedDropdown.style.transform = 'translate(' + left + 'px, ' + top + 'px)';
}

document.addEventListener('shown.bs.dropdown', function(ev) {
    const container = ev.target.closest('.dropdown.dropdown-fixed');
    if (!container) {
        return;
    }

    fixedContainer = container;
    fixedDropdown = container.querySelector('.dropdown-menu');
    fixedTarget = ev.relatedTarget || container;
    fixedDropdown.classList.add('is-fixed');
    addEventListener('scroll', fixDropdownPosition);
    addEventListener('resize', fixDropdownPosition);
    setTimeout(fixDropdownPosition, 0);
    fixDropdownPosition();
});

document.addEventListener('hidden.bs.dropdown', function(ev) {
    if (!ev.target.closest('.dropdown.dropdown-fixed')) {
        return;
    }

    removeEventListener('scroll', fixDropdownPosition);
    removeEventListener('resize', fixDropdownPosition);
});
