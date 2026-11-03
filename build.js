/**
 * Larajax UI Vendor Build Script
 *
 * Bundles the npm-managed vendor packages the controls layer depends on into
 * browser-ready ESM files under resources/assets/vendor, which then publish
 * verbatim alongside the rest of the assets. There is no runtime bundler; the
 * build only prepares vendored files ahead of publishing.
 */
import path from 'path';
import { bundle, bundleVirtual, copy, vendorDir } from './build-util.js';
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

// Dropzone (file uploads) and SortableJS (drag reordering) - bundled as ESM for the fileupload form widget.
await bundle('dropzone', 'dropzone/dropzone.esm.js');
await bundle('sortablejs', 'sortablejs/sortable.esm.js');

// libphonenumber-js (Google's libphonenumber rules with the compact metadata, which checks a number's
// length for its country) - bundled as ESM for the phone form widget, which loads it on first use.
await bundleVirtual(
    "export { AsYouType, parsePhoneNumberFromString, getCountries, getCountryCallingCode } from 'libphonenumber-js/min';",
    'libphonenumber/libphonenumber.esm.js'
);

// Select2 with a private jQuery instance in a single ESM bundle. The
// custom-select control imports the returned jQuery; window.jQuery is never
// touched, so jQuery stays an implementation detail of this one control.
// The UMD wrappers inside would register with a page's AMD loader, such as
// Monaco's, instead of returning their exports, so define reads as undefined.
await bundleVirtual(
    [
        "import $ from 'jquery';",
        "import select2 from 'select2/dist/js/select2.full.js';",
        "select2(window, $);",
        "export default $;"
    ].join('\n'),
    'select2/select2.esm.js',
    { define: { define: 'undefined' } }
);

// RichArea (rich text editor on TipTap) - built from packages/richarea for the
// richeditor form widget, with its stylesheet and the website base styles.
await buildRichArea({ outdir: path.join(vendorDir, 'richarea') });
console.log('  ✓ richarea/richarea.js, richarea.css and base-styles.css (bundled)');

// Hotsheet (data grid) - built from packages/hotsheet for the datatable form widget,
// with its stylesheet.
await buildHotsheet({ outdir: path.join(vendorDir, 'hotsheet') });
console.log('  ✓ hotsheet/hotsheet.js and hotsheet.css (bundled)');

console.log('\n  Done.\n');
