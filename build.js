/**
 * Larajax UI Vendor Build Script
 *
 * Bundles the npm-managed vendor packages the controls layer depends on into
 * browser-ready ESM files under resources/assets/vendor, which then publish
 * verbatim alongside the rest of the assets. There is no runtime bundler; the
 * build only prepares vendored files ahead of publishing.
 */
import path from 'path';
import { bundle, bundleVirtual, combineLanguages, copy, vendorDir } from './build-util.js';
import { buildRichArea } from './packages/richarea/build.js';
import { buildHotsheet } from './packages/hotsheet/build.js';

console.log('\n  Building vendor files...\n');

// Vanilla Calendar Pro (the calendar inside Bootstrap 6's Datepicker, same version) with
// its time and week number extensions, bundled as ESM for the datepicker control.
await bundleVirtual(
    "export { Calendar, time, weeks } from 'vanilla-calendar-pro';",
    'vanilla-calendar-pro/vanilla-calendar-pro.esm.js'
);

// Popper (popover/tooltip positioning engine) - bundled as ESM for the
// controls/popover control, matching October's vendored @popperjs/core.
await bundle('@popperjs/core', 'popperjs/popper.esm.js');

// Coloris (dependency-free color picker) - bundled as ESM for the colorpicker
// form widget, with its stylesheet copied alongside.
await bundle('@melloware/coloris', 'coloris/coloris.esm.js');
copy('@melloware/coloris/dist/coloris.css', 'coloris/coloris.css');

// EasyMDE (Markdown editor on CodeMirror 5, with marked inside) and DOMPurify for
// its preview, bundled as one ESM file for the markdown form widget, with the
// EasyMDE stylesheet copied alongside.
await bundleVirtual(
    [
        "import EasyMDE from 'easymde';",
        "import DOMPurify from 'dompurify';",
        "export { EasyMDE, DOMPurify };"
    ].join('\n'),
    'easymde/easymde.esm.js'
);
copy('easymde/dist/easymde.min.css', 'easymde/easymde.css');

// Dropzone (file uploads) - bundled as ESM for the fileupload form widget.
await bundle('dropzone', 'dropzone/dropzone.esm.js');

// SortableJS (drag reordering) with its MultiDrag plugin mounted, bundled as ESM for the fileupload,
// repeater, list and list structure widgets. Mounting here means one module serves every control and
// a host that exposes it, such as October's window.Sortable, since a plugin can only mount once.
await bundleVirtual(
    [
        "import Sortable, { MultiDrag, Swap } from 'sortablejs';",
        "Sortable.mount(new MultiDrag());",
        "export { Sortable, MultiDrag, Swap };",
        "export default Sortable;"
    ].join('\n'),
    'sortablejs/sortable.esm.js'
);

// libphonenumber-js (Google's libphonenumber rules with the compact metadata, which checks a number's
// length for its country) - bundled as ESM for the phone form widget, which loads it on first use.
await bundleVirtual(
    "export { AsYouType, parsePhoneNumberFromString, getCountries, getCountryCallingCode } from 'libphonenumber-js/min';",
    'libphonenumber/libphonenumber.esm.js'
);

// Tom Select (searchable select and tag input, no jQuery) with every plugin registered, bundled as
// ESM for the custom-select control, which turns the plugins on from the select's classes and data.
await bundle('tom-select', 'tom-select/tom-select.esm.js', {
    banner: { js: '/*! Tom Select v2.7.0 | (c) contributors | Apache License 2.0 | https://github.com/orchidjs/tom-select */' }
});

// Chart.js with every chart type, scale and plugin registered, and its date adapter hook, bundled as ESM
// for the chart controls, which load it on first use and expose the instance for an app's own options.
await bundleVirtual(
    [
        "import Chart from 'chart.js/auto';",
        "export { _adapters, Tooltip } from 'chart.js';",
        "export { Chart };",
        "export default Chart;"
    ].join('\n'),
    'chartjs/chart.esm.js',
    { banner: { js: '/*! Chart.js v4.5.1 | (c) Chart.js Contributors | MIT License | https://www.chartjs.org */' } }
);

// RichArea (rich text editor on TipTap) - built from packages/richarea for the
// richeditor form widget, with its stylesheet and the website base styles.
await buildRichArea({ outdir: path.join(vendorDir, 'richarea') });
console.log('  ✓ richarea/richarea.js, richarea.css, base-styles.css (bundled) and languages/');

// Hotsheet (data grid) - built from packages/hotsheet for the datatable form widget,
// with its stylesheet.
await buildHotsheet({ outdir: path.join(vendorDir, 'hotsheet') });
console.log('  ✓ hotsheet/hotsheet.js, hotsheet.css (bundled) and languages/');

// Translations, one script per language with the library's widget strings and the rich editor's and
// grid's, which the packages keep in their own languages/ for use on their own.
combineLanguages(['resources/languages', 'packages/richarea/src/languages', 'packages/hotsheet/src/languages']);

console.log('\n  Done.\n');
