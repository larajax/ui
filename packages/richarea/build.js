/**
 * RichArea Build Script
 *
 * Bundles the editor and TipTap into one browser-ready ESM file with its stylesheet, plus the
 * standalone base styles for pages that display editor content, and copies the translations to
 * languages/, plain scripts that a page loads or bundles as it needs them.
 *
 * - node build.js                 builds minified files into dist/
 * - node build.js --watch         rebuilds unminified with inline sourcemaps on every change
 * - node build.js --outdir=<dir>  writes somewhere other than dist/
 */
import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * buildRichArea writes richarea.js, richarea.css, base-styles.css and languages/ to the output directory.
 */
export async function buildRichArea({ outdir = path.join(__dirname, 'dist'), watch = false } = {}) {
    copyLanguages(outdir);

    const shared = {
        bundle: true,
        minify: !watch,
        sourcemap: watch ? 'inline' : false,
        logLevel: watch ? 'info' : 'warning'
    };

    const builds = [
        {
            ...shared,
            entryPoints: { richarea: path.join(__dirname, 'src/index.js') },
            format: 'esm',
            outdir
        },
        {
            ...shared,
            // Base styles are included on websites, so nesting is flattened for older browsers
            entryPoints: { 'base-styles': path.join(__dirname, 'src/styles/base-styles.css') },
            supported: { nesting: false },
            outdir
        }
    ];

    if (watch) {
        for (const options of builds) {
            const context = await esbuild.context(options);
            await context.watch();
        }
        return;
    }

    await Promise.all(builds.map((options) => esbuild.build(options)));
}

/**
 * copyLanguages copies the translations as they are, since they are data a page may bundle.
 */
function copyLanguages(outdir) {
    const target = path.join(outdir, 'languages');

    fs.rmSync(target, { recursive: true, force: true });
    fs.cpSync(path.join(__dirname, 'src/languages'), target, { recursive: true });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const watch = process.argv.includes('--watch');
    const outdirArg = process.argv.find((arg) => arg.startsWith('--outdir='));
    const outdir = outdirArg ? path.resolve(outdirArg.slice('--outdir='.length)) : undefined;

    await buildRichArea({ outdir, watch });

    console.log(watch
        ? '\n  Watching packages/richarea for changes...\n'
        : '\n  ✓ richarea.js, richarea.css, base-styles.css and languages/\n');
}
