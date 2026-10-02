#!/usr/bin/env node
/**
 * Standalone image mirror command.
 *
 * Runs the same in-process pipeline used by `build`/`watch`. Errors
 * follow the best-effort image contract: optimizer failure → fallback
 * copy + warning (exit 0); optimizer AND copy failure → exit 1.
 *
 * There are intentionally no `--files`/`--delete` flags: the pipeline
 * always reconciles `src/Images` -> `dist/images` in full, and the
 * cache keeps repeat invocations cheap.
 */

import { performance } from 'node:perf_hooks';
import { syncImages } from '../lib/image-pipeline.mjs';
import { acquireLock } from '../lib/process-lock.mjs';
import { fail, formatDuration, info, ok, warn } from '../lib/log.mjs';

async function main() {
  const started = performance.now();
  let release;
  try {
    release = await acquireLock('images');
  } catch (err) {
    fail('images', err?.message ?? String(err));
    process.exit(1);
  }
  try {
    info('images', 'reconciling src/Images -> dist/images');
    const result = await syncImages();
    const elapsed = performance.now() - started;

    for (const { path, reason } of result.warnings) {
      warn('images', `${path}: fallback copy (${reason})`);
    }
    for (const { path, reason } of result.failures) {
      fail('images', `${path}: ${reason}`);
    }

    const bytesIn = (result.originalBytes / 1024).toFixed(1);
    const bytesOut = (result.optimizedBytes / 1024).toFixed(1);
    ok(
      'images',
      `processed=${result.processed}, cached=${result.skippedCache}, ` +
        `fallback=${result.copiedFallback}, removed=${result.removed}, ` +
        `${bytesIn}KB -> ${bytesOut}KB in ${formatDuration(elapsed)}`
    );

    if (result.failures.length > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    fail('images', err?.message ?? String(err));
    process.exitCode = 1;
  } finally {
    await release();
  }
}

main().catch((err) => {
  fail('images', err?.message ?? String(err));
  process.exit(1);
});
