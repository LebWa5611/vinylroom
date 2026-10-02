#!/usr/bin/env node
/**
 * Production build.
 *
 * Sequence:
 *   1. Acquire process lock (blocks concurrent build/watch/images).
 *   2. Wipe managed dist roots (`dist/css`, `dist/js`, `dist/images`).
 *   3. Auto-discover entries, run one Vite build, reconcile mirror.
 *   4. Run image pipeline (full parallel pass).
 *   5. Print single summary line.
 *
 * Exit code is non-zero if:
 *   - Any managed CSS/JS entry fails to produce output.
 *   - The image pipeline reports a hard failure (optimize AND copy
 *     failed for at least one file).
 */

import { performance } from 'node:perf_hooks';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { build as viteBuild } from 'vite';
import { discoverEntries } from '../lib/asset-discovery.mjs';
import { syncImages } from '../lib/image-pipeline.mjs';
import { acquireLock } from '../lib/process-lock.mjs';
import { createViteConfig } from '../lib/vite-config.mjs';
import { fail, formatDuration, info, ok, warn } from '../lib/log.mjs';
import { DIST_CSS, DIST_JS } from '../lib/paths.mjs';

async function resetManagedCssJs() {
  // CSS/JS bundles are cheap to rebuild, so we start each production
  // build from an empty tree. This is the belt-and-braces companion
  // to the mirror plugin: if the manifest ever gets out of sync, a
  // fresh build recovers automatically.
  //
  // dist/images/ is intentionally left in place so the image cache
  // (mtime + size + optimizer signature) can short-circuit
  // unchanged files. `npm run build:all` clears everything.
  await Promise.all([
    rm(DIST_CSS, { recursive: true, force: true }),
    rm(DIST_JS, { recursive: true, force: true }),
  ]);
}

async function main() {
  const started = performance.now();
  let release;
  try {
    release = await acquireLock('build');
  } catch (err) {
    fail('build', err?.message ?? String(err));
    process.exit(1);
  }

  try {
    info('build', 'starting production build');
    await resetManagedCssJs();

    const { all: entries, js, css } = await discoverEntries();
    if (entries.length === 0) {
      info('build', 'no JS/SCSS entries discovered');
    } else {
      info(
        'build',
        `discovered ${js.length} JS + ${css.length} SCSS entries`
      );
    }

    if (entries.length > 0) {
      await viteBuild(createViteConfig(entries, { mode: 'production' }));

      // Verify each entry actually produced an output on disk.
      const missing = [];
      for (const entry of entries) {
        const kindRoot = entry.kind === 'js' ? DIST_JS : DIST_CSS;
        const absolute = join(kindRoot, ...entry.outputPath.split('/'));
        if (!existsSync(absolute)) {
          missing.push(entry.relativePath);
        }
      }
      if (missing.length > 0) {
        fail(
          'build',
          `missing dist output for ${missing.length} entries: ${missing.join(', ')}`
        );
        throw new Error('One or more managed outputs missing after build');
      }
    }

    const imageResult = await syncImages();
    const hasHardFailure = imageResult.failures.length > 0;

    const elapsed = performance.now() - started;

    if (imageResult.warnings.length > 0) {
      for (const { path, reason } of imageResult.warnings) {
        warn('images', `${path}: fallback copy (${reason})`);
      }
    }
    if (hasHardFailure) {
      for (const { path, reason } of imageResult.failures) {
        fail('images', `${path}: ${reason}`);
      }
    }

    const cssJsCount = entries.length;
    const imgCount = imageResult.processed + imageResult.skippedCache;
    ok(
      'build',
      `${cssJsCount} entries + ${imgCount} images in ${formatDuration(
        elapsed
      )} (fallback=${imageResult.copiedFallback}, removed=${imageResult.removed})`
    );

    if (hasHardFailure) {
      process.exitCode = 1;
    }
  } catch (err) {
    fail('build', err?.message ?? String(err));
    if (err?.stack) {
      process.stderr.write(`${err.stack}\n`);
    }
    process.exitCode = 1;
  } finally {
    await release();
  }
}

main().catch((err) => {
  fail('build', err?.message ?? String(err));
  process.exit(1);
});
