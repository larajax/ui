/**
 * Hotsheet Build Script
 *
 * Bundles the grid into one browser-ready ESM file with its stylesheet.
 *
 * - node build.js                 builds minified files into dist/
 * - node build.js --watch         rebuilds unminified with inline sourcemaps on every change
 * - node build.js --outdir=<dir>  writes somewhere other than dist/
 */
import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * buildHotsheet writes hotsheet.js and hotsheet.css to the output directory.
 */
export async function buildHotsheet({ outdir = path.join(__dirname, 'dist'), watch = false } = {}) {
    const shared = {
        bundle: true,
        minify: !watch,
        sourcemap: watch ? 'inline' : false,
        logLevel: watch ? 'info' : 'warning',
        outdir
    };

    const builds = [
        {
            ...shared,
            entryPoints: { hotsheet: path.join(__dirname, 'src/index.js') },
            format: 'esm'
        },
        {
            ...shared,
            entryPoints: { hotsheet: path.join(__dirname, 'src/styles/hotsheet.css') }
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const watch = process.argv.includes('--watch');
    const outdirArg = process.argv.find((arg) => arg.startsWith('--outdir='));
    const outdir = outdirArg ? path.resolve(outdirArg.slice('--outdir='.length)) : undefined;

    await buildHotsheet({ outdir, watch });
}
