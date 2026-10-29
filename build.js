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
import * as esbuild from 'esbuild';
import { bundle, bundleVirtual, copy, nodeModules, vendorDir } from './build-util.js';
import { buildRichArea } from './packages/richarea/build.js';

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

// Pikaday (dependency-free date picker) - bundled as ESM for the vanilla
// controls/datepicker control to import via a relative path.
await bundle('pikaday', 'pikaday/pikaday.esm.js', {
    plugins: [stubMomentPlugin]
});

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

// Select2 with a private jQuery instance in a single ESM bundle. The
// custom-select control imports the returned jQuery; window.jQuery is never
// touched, so jQuery stays an implementation detail of this one control.
await bundleVirtual(
    [
        "import $ from 'jquery';",
        "import select2 from 'select2/dist/js/select2.full.js';",
        "select2(window, $);",
        "export default $;"
    ].join('\n'),
    'select2/select2.esm.js'
);

// RichArea (rich text editor on TipTap) - built from packages/richarea for the
// richeditor form widget, with its stylesheet and the website base styles.
await buildRichArea({ outdir: path.join(vendorDir, 'richarea') });
console.log('  ✓ richarea/richarea.js, richarea.css and base-styles.css (bundled)');

// Monaco (code editor) - Monaco's own editor.main.js limited to the languages
// the codeeditor form widget offers, with Emmet, bundled as ESM alongside its
// stylesheet, icon font and the language service workers it starts.
await bundleMonaco({
    languages: ['css', 'html', 'javascript', 'less', 'markdown', 'php', 'scss', 'twig', 'yaml'],
    services: ['css', 'html', 'json']
});
console.log('  ✓ monaco/monaco.js, monaco.css, codicon.ttf and workers (bundled)');

console.log('\n  Done.\n');

/**
 * bundleMonaco writes monaco.js with the basic languages and language services given, plus a
 * worker file for each service, where the editor finds its workers next to itself.
 */
async function bundleMonaco({ languages, services }) {
    const editorDir = path.join(nodeModules, 'monaco-editor/esm/vs/editor');
    const outdir = path.join(vendorDir, 'monaco');
    const toImportPath = (file) => file.split(path.sep).join('/');

    const lines = fs.readFileSync(path.join(editorDir, 'editor.main.js'), 'utf8').split('\n');
    const kept = lines.filter((line) => {
        if (line.includes('monaco-lsp-client') || line.includes('export { index as lsp }')) {
            return false;
        }

        const definition = /languages\/definitions\/([\w-]+)\/register\.js/.exec(line);
        if (definition) {
            return languages.includes(definition[1]);
        }

        const feature = /languages_features_(\w+)_register_ts/.exec(line);
        if (feature) {
            return services.includes(feature[1]);
        }

        return true;
    });

    // Each language service names its worker by language id, the rest use the editor worker
    const workerLabels = { css: 'css', scss: 'css', less: 'css', html: 'html', handlebars: 'html', razor: 'html', json: 'json' };

    const contents = kept.join('\n') + `
export { emmetHTML, emmetCSS } from '${toImportPath(path.join(nodeModules, 'emmet-monaco-es/dist/emmet-monaco.esm.js'))}';

const workerLabels = ${JSON.stringify(workerLabels)};

if (!self.MonacoEnvironment) {
    self.MonacoEnvironment = {
        getWorker(moduleId, label) {
            return new Worker(new URL('./' + (workerLabels[label] || 'editor') + '.worker.js', import.meta.url));
        }
    };
}
`;

    fs.rmSync(outdir, { recursive: true, force: true });

    await esbuild.build({
        stdin: { contents, resolveDir: editorDir, sourcefile: 'monaco.js' },
        bundle: true,
        format: 'esm',
        outfile: path.join(outdir, 'monaco.js'),
        loader: { '.ttf': 'file' },
        assetNames: '[name]',
        minify: true,
        logLevel: 'warning'
    });

    const workers = { editor: path.join(editorDir, 'editor.worker.js') };
    services.forEach((name) => {
        workers[name] = path.join(nodeModules, `monaco-editor/esm/vs/language/${name}/${name}.worker.js`);
    });

    await esbuild.build({
        entryPoints: Object.fromEntries(Object.entries(workers).map(([name, file]) => [name + '.worker', file])),
        bundle: true,
        format: 'iife',
        outdir,
        minify: true,
        logLevel: 'warning'
    });
}
