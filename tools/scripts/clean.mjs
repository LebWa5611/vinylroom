#!/usr/bin/env node
/**
 * Clean managed build artifacts.
 *
 * Removes:
 *   - `dist/css`, `dist/js`, `dist/images` (managed roots)
 *   - `.cache/` (image cache, output manifest, and stale locks)
 *   - `dist/` itself if it ends up empty
 *
 * Foreign files sitting inside `dist/` (e.g. hand-authored fonts you
 * dropped in there) are left untouched: only the managed roots are
 * removed, then an empty `dist/` is pruned.
 */

import { existsSync } from 'node:fs';
import { readdir, rm } from 'node:fs/promises';
import { acquireLock } from '../lib/process-lock.mjs';
import { CACHE, DIST, DIST_CSS, DIST_IMAGES, DIST_JS } from '../lib/paths.mjs';
import { info, ok } from '../lib/log.mjs';

async function main() {
  let release;
  try {
    release = await acquireLock('clean');
  } catch (err) {
    process.stderr.write(`clean: ${err?.message ?? err}\n`);
    process.exit(1);
  }
  try {
    for (const [label, target] of [
      ['dist/css', DIST_CSS],
      ['dist/js', DIST_JS],
      ['dist/images', DIST_IMAGES],
      ['.cache', CACHE],
    ]) {
      if (existsSync(target)) {
        await rm(target, { recursive: true, force: true });
        info('clean', `removed ${label}`);
      }
    }

    if (existsSync(DIST)) {
      try {
        const remaining = await readdir(DIST);
        if (remaining.length === 0) {
          await rm(DIST, { recursive: true, force: true });
          info('clean', 'removed empty dist');
        }
      } catch {
        // Directory disappeared between checks — fine.
      }
    }

    ok('clean', 'workspace is ready for a fresh build');
  } finally {
    await release();
  }
}

main().catch((err) => {
  process.stderr.write(`${err?.stack ?? err}\n`);
  process.exitCode = 1;
});
