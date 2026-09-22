/**
 * Larajax UI Vendor Build Script
 *
 * Bundles the npm-managed vendor packages the controls layer depends on into
 * browser-ready ESM files under resources/assets/vendor, which then publish
 * verbatim alongside the rest of the assets. There is no runtime bundler; the
 * build only prepares vendored files ahead of publishing.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { bundle } from './build-util.js';

console.log('\n  Building vendor files...\n');

// Pikaday ships an optional moment integration guarded by a try/catch require;
// we do not ship moment, so resolve it to an empty module (hasMoment === false,
// pikaday falls back to its own date formatting). The shim lives outside the
// published asset tree.
const emptyShim = path.join(os.tmpdir(), 'larajax-ui-empty-moment.js');
fs.writeFileSync(emptyShim, 'export default undefined;\n');

const stubMomentPlugin = {
    name: 'stub-moment',
    setup(build) {
        build.onResolve({ filter: /^moment$/ }, () => ({ path: emptyShim }));
    }
};

// Pikaday (dependency-free date picker) — bundled as ESM for the vanilla
// controls/datepicker control to import via a relative path.
await bundle('pikaday', 'pikaday/pikaday.esm.js', {
    plugins: [stubMomentPlugin]
});

// Popper (popover/tooltip positioning engine) — bundled as ESM for the
// controls/popover control, matching October's vendored @popperjs/core.
await bundle('@popperjs/core', 'popperjs/popper.esm.js');

console.log('\n  Done.\n');
