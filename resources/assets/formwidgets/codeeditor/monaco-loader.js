/*
 * Monaco loader
 *
 * Loads the bundled Monaco editor and its stylesheet once per page for the editors built on it,
 * and keeps the editors that follow the page color mode in step with it.
 */
'use strict';

// Monaco is shared by every editor, loaded on first use with its stylesheet
let monacoPromise = null;

// Controls following the page color mode, each with an applyTheme() method
const pageThemeControls = new Set();

// Themes a field may name, any other value follows the page color mode
export const MONACO_THEMES = ['vs', 'vs-dark', 'hc-black', 'hc-light'];

/**
 * loadMonaco resolves with the Monaco module once it and its stylesheet have loaded.
 */
export function loadMonaco() {
    if (!monacoPromise) {
        monacoPromise = Promise.all([
            import('../../vendor/monaco/monaco.js'),
            loadStylesheet(new URL('../../vendor/monaco/monaco.css', import.meta.url).href)
        ]).then(([monaco]) => {
            monaco.emmetHTML(monaco, ['html', 'twig', 'php']);
            monaco.emmetCSS(monaco, ['css', 'less', 'scss']);

            new MutationObserver(() => pageThemeControls.forEach((control) => control.applyTheme()))
                .observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme'] });

            return monaco;
        });
    }

    return monacoPromise;
}

/**
 * resolveTheme returns the named Monaco theme, or the one matching the color mode around an element.
 */
export function resolveTheme(theme, element) {
    if (MONACO_THEMES.includes(theme)) {
        return theme;
    }

    const themeElement = element.closest('[data-bs-theme]');
    return themeElement && themeElement.getAttribute('data-bs-theme') === 'dark' ? 'vs-dark' : 'vs';
}

/**
 * followPageTheme calls the control's applyTheme() whenever the page color mode changes.
 */
export function followPageTheme(control) {
    pageThemeControls.add(control);
}

/**
 * unfollowPageTheme stops following the page color mode.
 */
export function unfollowPageTheme(control) {
    pageThemeControls.delete(control);
}

// Resolves once the stylesheet applies, so the editor measures its layout with the styles in place
function loadStylesheet(href) {
    return new Promise((resolve) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute('data-codeeditor-stylesheet', '');
        link.addEventListener('load', resolve, { once: true });
        link.addEventListener('error', resolve, { once: true });
        document.head.appendChild(link);
    });
}
