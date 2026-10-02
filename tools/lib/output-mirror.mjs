/**
 * Manifest-driven output mirror for CSS/JS.
 *
 * The build/watch pipeline is responsible for keeping `dist/js/` and
 * `dist/css/` in lockstep with `src/`. Vite does not delete stale
 * outputs on its own in watch mode, and even in production we only
 * emit for entries that still exist. The mirror maintains a manifest
 * of files this pipeline created and removes anything that is no
 * longer in the expected set.
 *
 * Files outside of `dist/js/` and `dist/css/` are never touched — the
 * image mirror in `image-pipeline.mjs` is authoritative for
 * `dist/images/`, and unknown outputs from other tools are left alone.
 */

import { readFile, writeFile, mkdir, rm, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { DIST, DIST_CSS, DIST_JS, OUTPUT_MANIFEST } from './paths.mjs';

async function readManifest(manifestPath) {
  if (!existsSync(manifestPath)) {
    return new Set();
  }
  try {
    const raw = await readFile(manifestPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.outputs)) {
      return new Set(parsed.outputs);
    }
  } catch {
    // Corrupt manifest — treat as empty. Next successful reconcile
    // will rebuild it from scratch.
  }
  return new Set();
}

async function writeManifest(manifestPath, outputs) {
  await mkdir(dirname(manifestPath), { recursive: true });
  const tmp = `${manifestPath}.tmp-${process.pid}`;
  const payload = JSON.stringify(
    { version: 1, outputs: [...outputs].sort() },
    null,
    2
  );
  await writeFile(tmp, payload);
  await rename(tmp, manifestPath);
}

function isManaged(absolute, roots) {
  return roots.some((root) => {
    const rel = relative(root, absolute);
    return rel !== '' && !rel.startsWith('..') && !rel.includes(`..${sep}`);
  });
}

/**
 * Reconcile the manifest against a fresh set of expected outputs.
 *
 * `expected` is a set of POSIX paths relative to `dist/` (e.g.
 * `css/components/button.min.css`). Anything in the previous manifest
 * that is not in `expected` is removed from disk, then the manifest is
 * atomically overwritten with the new set.
 *
 * Returns the list of removed relative paths for logging.
 */
export async function reconcileOutputs(expected, {
  manifestPath = OUTPUT_MANIFEST,
  distRoot = DIST,
  managedRoots = [DIST_CSS, DIST_JS],
} = {}) {
  const previous = await readManifest(manifestPath);
  const removed = [];

  for (const rel of previous) {
    if (expected.has(rel)) {
      continue;
    }
    const abs = join(distRoot, ...rel.split('/'));
    if (!isManaged(abs, managedRoots)) {
      continue;
    }
    try {
      await rm(abs, { force: true });
      removed.push(rel);
    } catch {
      // Best-effort: absence is fine, permissions issues are surfaced
      // by a subsequent rebuild that fails to write the file.
    }
  }

  await writeManifest(manifestPath, expected);
  return removed;
}

/**
 * Remove a single tracked output. Used when a source is unlinked in
 * watch mode before Vite has a chance to notice the change.
 */
export async function removeOutput(relativePath, {
  manifestPath = OUTPUT_MANIFEST,
  distRoot = DIST,
  managedRoots = [DIST_CSS, DIST_JS],
} = {}) {
  const manifest = await readManifest(manifestPath);
  if (!manifest.has(relativePath)) {
    return false;
  }
  const abs = join(distRoot, ...relativePath.split('/'));
  if (!isManaged(abs, managedRoots)) {
    return false;
  }
  try {
    await rm(abs, { force: true });
  } catch {
    return false;
  }
  manifest.delete(relativePath);
  await writeManifest(manifestPath, manifest);
  return true;
}

/**
 * Return the current manifest as a Set. Exposed for tests.
 */
export async function readManifestSet({ manifestPath = OUTPUT_MANIFEST } = {}) {
  return readManifest(manifestPath);
}
