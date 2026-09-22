/**
 * Larajax UI Build Utilities
 *
 * Mirrors October's system module build helpers, scoped to the assets this
 * library vendors. The asset root is resources/assets and vendored packages
 * land in resources/assets/vendor so they publish verbatim.
 */
import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeModules = path.join(__dirname, 'node_modules');
const assetsDir = path.join(__dirname, 'resources/assets');
const vendorDir = path.join(assetsDir, 'vendor');

/**
 * Copies a single file from node_modules into the vendor directory.
 */
export function copy(src, dest) {
    const srcPath = path.join(nodeModules, src);
    const destPath = path.join(vendorDir, dest);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    console.log(`  ✓ ${dest}`);
}

/**
 * Bundles an inline entry script into a browser-ready ESM file in the vendor
 * directory, resolving its imports against this package's node_modules.
 */
export async function bundleVirtual(contents, outfile, options = {}) {
    const destPath = path.join(vendorDir, outfile);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    await esbuild.build({
        stdin: {
            contents,
            resolveDir: __dirname,
            sourcefile: path.basename(outfile)
        },
        bundle: true,
        format: 'esm',
        outfile: destPath,
        minify: true,
        ...options
    });
    console.log(`  ✓ ${outfile} (bundled)`);
}

/**
 * Bundles an npm package into a browser-ready ESM file in the vendor directory.
 */
export async function bundle(entry, outfile, options = {}) {
    const destPath = path.join(vendorDir, outfile);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    await esbuild.build({
        entryPoints: [entry],
        bundle: true,
        format: 'esm',
        outfile: destPath,
        minify: true,
        ...options
    });
    console.log(`  ✓ ${outfile} (bundled)`);
}

export { nodeModules, assetsDir, vendorDir };
