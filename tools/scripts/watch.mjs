#!/usr/bin/env node
/**
 * Cross-platform watch orchestrator.
 *
 * Architecture:
 *   - One chokidar instance watches `src/js/**`, `src/css/**`,
 *     `src/Images/**` and `build.config.mjs`.
 *   - Vite runs programmatically in watch mode. Whenever the set of
 *     discoverable entries changes (add or remove), we close the Vite
 *     watcher and start a fresh one with the new inputs.
 *   - Vite's own dependency graph handles content changes to existing
 *     entries and their SCSS partials — no restart needed for that.
 *   - Image changes trigger the in-process image pipeline directly.
 *   - Every batch prints exactly one status line plus optional
 *     warnings/errors below it.
 *
 * The orchestrator honours the process lock so a second `watch` (or a
 * `build`/`images`/`clean`) fails fast with a clear message.
 */

import { performance } from 'node:perf_hooks';
import chokidar from 'chokidar';
import { build as viteBuild } from 'vite';
import { discoverEntries, isDiscoverableEntry } from '../lib/asset-discovery.mjs';
import { syncImages, isImageSource } from '../lib/image-pipeline.mjs';
import { acquireLock } from '../lib/process-lock.mjs';
import { createViteConfig } from '../lib/vite-config.mjs';
import { fail, formatDuration, info, ok, warn } from '../lib/log.mjs';
import { SRC, SRC_IMAGES, SRC_CSS, SRC_JS } from '../lib/paths.mjs';

const DEBOUNCE_MS = 60;

/**
 * @typedef {'add' | 'change' | 'unlink'} FsEvent
 */

let viteWatcher = null;
let currentEntrySignature = '';

/**
 * Start (or restart) the Vite watcher with the given entries. Closes
 * the previous watcher first. Returns once the initial build finishes
 * so callers can measure timing.
 */
async function startVite(entries) {
  if (viteWatcher) {
    try {
      await viteWatcher.close();
    } catch {
      // Ignore — best-effort teardown.
    }
    viteWatcher = null;
  }

  if (entries.length === 0) {
    return;
  }

  const config = createViteConfig(entries, { mode: 'development' });
  config.build.watch = {
    // `include` limits Rollup's watcher to our tree — keeps chokidar
    // and Vite from stepping on each other on Windows/macOS.
    include: [`${SRC}/**`],
    exclude: ['node_modules/**', 'dist/**', '.cache/**'],
  };

  const result = await viteBuild(config);
  // With `build.watch` set, `viteBuild()` resolves to a RollupWatcher.
  if (result && typeof result.close === 'function') {
    viteWatcher = result;
    let viteCycleStart = performance.now();
    viteWatcher.on('event', (event) => {
      if (event.code === 'BUNDLE_START') {
        viteCycleStart = performance.now();
      } else if (event.code === 'BUNDLE_END') {
        const dur = performance.now() - viteCycleStart;
        ok('watch', `vite rebuild in ${formatDuration(dur)}`);
      } else if (event.code === 'ERROR') {
        // `UNRESOLVED_ENTRY` races the chokidar unlink handler when a
        // discoverable entry is removed. The orchestrator restarts
        // Vite with the fresh input set immediately, so hiding this
        // transient error keeps the watch output honest.
        const message = event.error?.message ?? '';
        const code = event.error?.code ?? '';
        if (code === 'UNRESOLVED_ENTRY' || /UNRESOLVED_ENTRY/.test(message)) {
          return;
        }
        fail('watch', message || 'Vite reported an error');
        if (event.error?.stack) {
          process.stderr.write(`${event.error.stack}\n`);
        }
      }
    });
  }
}

function entrySignature(entries) {
  return entries
    .map((e) => `${e.kind}:${e.rollupName}`)
    .sort()
    .join('|');
}

/**
 * @typedef {object} Batch
 * @property {Set<string>} entryChanges  Absolute paths of touched entries.
 * @property {Set<string>} imageChanges  Absolute paths of image events.
 * @property {boolean} entrySetChanged  True on add/unlink to an entry.
 * @property {boolean} configChanged    True when build.config.mjs changes.
 */

function makeBatch() {
  return {
    entryChanges: new Set(),
    imageChanges: new Set(),
    entrySetChanged: false,
    configChanged: false,
  };
}

async function processBatch(batch) {
  const started = performance.now();
  let didSomething = false;
  let hadFailure = false;
  const notes = [];

  if (batch.configChanged) {
    // build.config.mjs is imported by every worker module. ESM caches
    // never invalidate for the running process, so we simply announce
    // and encourage the developer to restart. Restarting `watch` is
    // cheap because there's no persistent HTTP server.
    warn(
      'watch',
      'build.config.mjs changed — restart `npm run watch` to pick up new settings'
    );
  }

  if (batch.entryChanges.size > 0 || batch.entrySetChanged) {
    const { all: entries } = await discoverEntries();
    const nextSignature = entrySignature(entries);
    if (nextSignature !== currentEntrySignature) {
      try {
        await startVite(entries);
        currentEntrySignature = nextSignature;
        didSomething = true;
        notes.push(`entries=${entries.length}`);
      } catch (err) {
        hadFailure = true;
        fail('watch', `Vite failed: ${err?.message ?? err}`);
        if (err?.stack) {
          process.stderr.write(`${err.stack}\n`);
        }
      }
    }
  }

  if (batch.imageChanges.size > 0) {
    try {
      const result = await syncImages({ quiet: true });
      didSomething = true;
      notes.push(
        `images=${result.processed}/${result.skippedCache}c/${result.removed}r`
      );
      for (const { path, reason } of result.warnings) {
        warn('watch', `image ${path}: fallback copy (${reason})`);
      }
      for (const { path, reason } of result.failures) {
        fail('watch', `image ${path}: ${reason}`);
        hadFailure = true;
      }
    } catch (err) {
      hadFailure = true;
      fail('watch', `image pipeline failed: ${err?.message ?? err}`);
    }
  }

  const elapsed = performance.now() - started;
  if (didSomething) {
    const summary = notes.length > 0 ? notes.join(', ') : 'no-op';
    const line = `${summary} in ${formatDuration(elapsed)}`;
    if (hadFailure) {
      warn('watch', line);
    } else {
      ok('watch', line);
    }
  }
}

function scheduleBatch(state) {
  if (state.processing) {
    state.pending = true;
    return;
  }
  clearTimeout(state.timer);
  state.timer = setTimeout(async () => {
    state.processing = true;
    const batch = state.batch;
    state.batch = makeBatch();
    try {
      await processBatch(batch);
    } catch (err) {
      fail('watch', err?.message ?? String(err));
    } finally {
      state.processing = false;
      if (state.pending) {
        state.pending = false;
        scheduleBatch(state);
      }
    }
  }, DEBOUNCE_MS);
}

async function main() {
  let release;
  try {
    release = await acquireLock('watch');
  } catch (err) {
    fail('watch', err?.message ?? String(err));
    process.exit(1);
  }

  const state = {
    processing: false,
    pending: false,
    timer: null,
    batch: makeBatch(),
  };

  const cleanup = async () => {
    try {
      await watcher.close();
    } catch {
      // Ignore.
    }
    if (viteWatcher) {
      try {
        await viteWatcher.close();
      } catch {
        // Ignore.
      }
    }
    await release();
  };

  const stop = async (code) => {
    await cleanup();
    process.exit(code);
  };

  process.on('SIGINT', () => {
    void stop(130);
  });
  process.on('SIGTERM', () => {
    void stop(143);
  });
  // Same as Ctrl+C: fully stop (process-lock also releases on SIGTSTP).
  if (process.platform !== 'win32') {
    process.on('SIGTSTP', () => {
      void stop(130);
    });
  }

  info('watch', `starting watcher on ${SRC}`);

  // Initial build so the terminal reflects reality before any change.
  try {
    const { all: entries } = await discoverEntries();
    await startVite(entries);
    currentEntrySignature = entrySignature(entries);
    const imagesResult = await syncImages({ quiet: true });
    ok(
      'watch',
      `ready: entries=${entries.length}, images=${imagesResult.processed + imagesResult.skippedCache}`
    );
  } catch (err) {
    fail('watch', `initial build failed: ${err?.message ?? err}`);
  }

  const watcher = chokidar.watch(
    [SRC_JS, SRC_CSS, SRC_IMAGES, `${SRC}/../build.config.mjs`],
    {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 40,
        pollInterval: 30,
      },
      ignorePermissionErrors: true,
    }
  );

  watcher.on('all', async (event, path) => {
    if (path.endsWith('build.config.mjs')) {
      state.batch.configChanged = true;
      scheduleBatch(state);
      return;
    }

    if (isImageSource(path)) {
      state.batch.imageChanges.add(path);
      scheduleBatch(state);
      return;
    }

    if (isDiscoverableEntry(path)) {
      // When an entry disappears we shut Vite's watcher down eagerly
      // so its own file-watch loop cannot fire an UNRESOLVED_ENTRY
      // error before the batched restart picks up the new input set.
      if (event === 'unlink' && viteWatcher) {
        const stale = viteWatcher;
        viteWatcher = null;
        currentEntrySignature = '';
        try {
          await stale.close();
        } catch {
          // Ignore — best-effort teardown.
        }
      }

      state.batch.entryChanges.add(path);
      if (event === 'add' || event === 'unlink') {
        state.batch.entrySetChanged = true;
      }
      scheduleBatch(state);
    }
    // Everything else (SCSS partials, arbitrary files) is picked up
    // by Vite's own dependency graph; ignoring keeps our output quiet.
  });

  watcher.on('error', (err) => {
    warn('watch', `chokidar: ${err?.message ?? err}`);
  });
}

main().catch((err) => {
  fail('watch', err?.message ?? String(err));
  process.exit(1);
});
