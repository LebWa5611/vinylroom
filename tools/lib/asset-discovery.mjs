/**
 * Auto-discovery of JS and SCSS entries.
 *
 * Contract:
 *   - Every `src/js/**\/*.js` is an independent entry (no bundling,
 *     no shared chunks).
 *   - Every `src/css/**\/*.scss` is an entry unless its basename starts
 *     with `_` (Sass partial convention).
 *   - Output paths mirror the source tree with `.min.{js,css}` suffix,
 *     e.g. `js/pages/about.js -> dist/js/pages/about.min.js`.
 *   - Case-insensitive path collisions (Windows/macOS) are rejected up
 *     front so the same target is never claimed by two sources.
 *
 * Discovery is deterministic and independent of filesystem order:
 * results are sorted by canonical relative path.
 */

import { readdir } from 'node:fs/promises';
import { relative, join, extname, basename, sep, posix } from 'node:path';
import { SRC_JS, SRC_CSS } from './paths.mjs';

/**
 * @typedef {object} Entry
 * @property {'js'|'css'} kind          Output stream.
 * @property {string}     absolutePath  Absolute path to the source file.
 * @property {string}     relativePath  POSIX path relative to `src/{js|css}`.
 * @property {string}     rollupName    Rollup `input` key; identical to
 *                                      the relative path minus extension.
 * @property {string}     outputPath    POSIX path relative to `dist/{js|css}`.
 */

async function walk(root, filter) {
  const collected = [];

  async function visit(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (err) {
      if (err.code === 'ENOENT') {
        return;
      }
      throw err;
    }

    for (const entry of entries) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) {
        await visit(abs);
      } else if (entry.isFile() && filter(entry.name, abs)) {
        collected.push(abs);
      }
    }
  }

  await visit(root);
  return collected;
}

function toPosix(value) {
  return sep === '/' ? value : value.split(sep).join('/');
}

function relativePosix(root, absolute) {
  return toPosix(relative(root, absolute));
}

function assertNoCaseCollisions(entries) {
  const seen = new Map();
  for (const entry of entries) {
    const key = `${entry.kind}:${entry.outputPath.toLowerCase()}`;
    const existing = seen.get(key);
    if (existing && existing.outputPath !== entry.outputPath) {
      throw new Error(
        `[asset-discovery] Case-insensitive collision between ` +
          `"${existing.relativePath}" and "${entry.relativePath}". ` +
          `Rename one so the outputs cannot collide on case-insensitive filesystems.`
      );
    }
    seen.set(key, entry);
  }
}

async function discoverKind(root, kind, extension) {
  const files = await walk(root, (name) => {
    if (extname(name).toLowerCase() !== extension) {
      return false;
    }
    if (kind === 'css' && basename(name).startsWith('_')) {
      // SCSS partial.
      return false;
    }
    return true;
  });

  const entries = files.map((absolutePath) => {
    const relativePath = relativePosix(root, absolutePath);
    const withoutExt = relativePath.slice(0, -extension.length);
    return {
      kind,
      absolutePath,
      relativePath,
      rollupName: `${kind}/${withoutExt}`,
      outputPath: `${withoutExt}.min.${kind === 'js' ? 'js' : 'css'}`,
    };
  });

  entries.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return entries;
}

/**
 * Discover every entry file. Returns two arrays keyed by output kind
 * and a combined array in stable order.
 *
 * `jsRoot`/`cssRoot` overrides exist so tests can point the discovery
 * at a fixture tree without mocking the module.
 */
export async function discoverEntries({
  jsRoot = SRC_JS,
  cssRoot = SRC_CSS,
} = {}) {
  const [js, css] = await Promise.all([
    discoverKind(jsRoot, 'js', '.js'),
    discoverKind(cssRoot, 'css', '.scss'),
  ]);

  const all = [...js, ...css];
  assertNoCaseCollisions(all);
  return { js, css, all };
}

/**
 * Build the Rollup `input` map for Vite. Keys use POSIX separators so
 * emitted file names line up with `outputPath` regardless of host OS.
 */
export function toRollupInput(entries) {
  const input = {};
  for (const entry of entries) {
    input[entry.rollupName] = entry.absolutePath;
  }
  return input;
}

/**
 * Convert an emitted Rollup filename (e.g. `js/pages/about.js`) back to
 * the corresponding managed dist path (`js/pages/about.min.js`).
 */
export function chunkNameToOutput(chunkName, kind) {
  const stripped = chunkName.replace(/^(js|css)\//, '');
  const withoutExt = stripped.replace(/\.[^./]+$/, '');
  const extension = kind === 'js' ? 'min.js' : 'min.css';
  return posix.join(kind, `${withoutExt}.${extension}`);
}

/**
 * Return true if the given absolute path is a discoverable entry
 * source (unpartialised JS or SCSS under the recognised roots).
 */
export function isDiscoverableEntry(absolutePath) {
  const ext = extname(absolutePath).toLowerCase();
  if (ext !== '.js' && ext !== '.scss') {
    return false;
  }
  if (ext === '.scss' && basename(absolutePath).startsWith('_')) {
    return false;
  }
  const root = ext === '.js' ? SRC_JS : SRC_CSS;
  const rel = relative(root, absolutePath);
  return rel !== '' && !rel.startsWith('..') && !rel.startsWith(sep);
}
