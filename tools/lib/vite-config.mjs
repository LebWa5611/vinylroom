/**
 * Factory that produces the Vite config used by build.mjs and
 * watch.mjs. Callers pass in the entries discovered via
 * `asset-discovery.mjs` so this module stays pure and testable.
 *
 * Contract:
 *   - Every entry emits `dist/{js|css}/<rel>.min.{js,css}` — folder
 *     structure preserved.
 *   - JS entries are independent, no shared chunks. If Rollup ever
 *     tries to emit one we throw so the regression is caught early.
 *   - CSS is minified via cssnano through PostCSS (single pipeline),
 *     not Vite's built-in Lightning CSS.
 *   - Source maps are always external `.map` files.
 *   - After the bundle is written, the mirror reconciler removes
 *     tracked files whose sources are gone.
 */

import { posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toRollupInput } from './asset-discovery.mjs';
import { reconcileOutputs } from './output-mirror.mjs';
import { DIST, ROOT, SRC_CSS, SRC_CSS_BASE } from './paths.mjs';

const POSTCSS_CONFIG_URL = new URL('../postcss.config.mjs', import.meta.url);

function scssAdditionalData() {
  // `@use` with relative names + `loadPaths` keeps additionalData
  // portable across checkouts. Vite tracks the resolved paths as
  // Sass dependencies so partials trigger correct recompilation.
  return `@use "variables" as *;\n@use "mixins" as *;\n`;
}

function createNoChunkGuard() {
  return {
    name: 'assets-no-chunk-guard',
    generateBundle(_options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk') {
          continue;
        }
        if (chunk.isEntry) {
          continue;
        }
        // A non-entry JS chunk means Rollup created a shared runtime
        // slice. That contradicts the "each src/js/**/*.js is
        // self-contained" contract, so fail loudly.
        throw new Error(
          `[assets] Rollup produced a non-entry chunk "${fileName}". ` +
            `The pipeline expects every src/js/**/*.js to compile ` +
            `independently with no shared runtime; add it as its own ` +
            `entry or inline the shared code into the JS entries that ` +
            `use it.`
        );
      }
    },
  };
}

function createShimCleanupPlugin() {
  // Rolldown emits a synthetic `.shim.js` (+ `.shim.js.map`) for each
  // CSS-only entry. Nothing links to them, so we sweep them from the
  // bundle before write.
  return {
    name: 'assets-drop-css-shims',
    generateBundle(_options, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith('.shim.js') || fileName.endsWith('.shim.js.map')) {
          delete bundle[fileName];
        }
      }
    },
  };
}

function createMirrorPlugin(entries) {
  const expected = new Set();
  for (const entry of entries) {
    if (entry.kind === 'js') {
      expected.add(posix.join('js', entry.outputPath));
    } else {
      expected.add(posix.join('css', entry.outputPath));
    }
  }
  return {
    name: 'assets-output-mirror',
    async writeBundle(_options, bundle) {
      // Track source maps as well so `.map` files disappear when the
      // parent entry is removed.
      const effective = new Set(expected);
      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith('.map')) {
          effective.add(fileName);
        }
      }
      await reconcileOutputs(effective);
    },
  };
}

/**
 * Build a Vite config for the given entries. Watch mode reuses the
 * exact same config so watch output matches production shape 1:1.
 *
 * `sassLoadPaths` may be overridden for tests that seed a fixture
 * outside the real `src/css/` tree.
 */
export function createViteConfig(entries, {
  mode = 'production',
  root = ROOT,
  outDir,
  sassLoadPaths = [SRC_CSS, SRC_CSS_BASE],
  additionalData = scssAdditionalData(),
} = {}) {
  const input = toRollupInput(entries);

  return {
    root,
    base: './',
    mode,
    configFile: false,
    envFile: false,
    logLevel: 'silent',
    clearScreen: false,

    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          additionalData,
          loadPaths: sassLoadPaths,
          silenceDeprecations: ['legacy-js-api'],
        },
      },
      postcss: fileURLToPath(POSTCSS_CONFIG_URL),
    },

    resolve: {
      alias: {
        '@': ROOT,
      },
    },

    build: {
      outDir: outDir ?? DIST,
      emptyOutDir: false,
      copyPublicDir: false,
      cssCodeSplit: true,
      cssMinify: false,
      minify: 'oxc',
      sourcemap: true,
      reportCompressedSize: false,
      write: true,
      rollupOptions: {
        input,
        external: [],
        output: {
          // JS entries emit `.min.js`. CSS-only entries also get a JS
          // chunk from Rolldown (it wraps the SCSS import); we mark
          // those as `.shim.js` so the cleanup plugin can drop them.
          entryFileNames: (chunkInfo) => {
            const name = chunkInfo.name ?? '';
            if (name.startsWith('js/')) {
              return `${name}.min.js`;
            }
            if (name.startsWith('css/')) {
              return `${name}.shim.js`;
            }
            return `${name}.js`;
          },
          chunkFileNames: () => {
            throw new Error(
              '[assets] Non-entry chunks are not allowed. Every ' +
                'src/js/**/*.js must be self-contained.'
            );
          },
          assetFileNames: (assetInfo) => {
            const name =
              assetInfo.name ?? assetInfo.names?.[0] ?? '';
            if (name.endsWith('.css')) {
              const stripped = name
                .replace(/^css\//, '')
                .replace(/\.css$/, '');
              return `css/${stripped}.min.css`;
            }
            return `assets/${name}`;
          },
        },
      },
    },

    plugins: [
      createNoChunkGuard(),
      createShimCleanupPlugin(),
      createMirrorPlugin(entries),
    ],
  };
}

/** Absolute path to `postcss.config.mjs`. */
export const POSTCSS_CONFIG_PATH = fileURLToPath(POSTCSS_CONFIG_URL);
