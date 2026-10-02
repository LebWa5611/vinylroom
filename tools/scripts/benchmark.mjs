#!/usr/bin/env node
/**
 * Non-invasive benchmark.
 *
 * Creates a scratch workspace in `.cache/benchmark/`, populates it
 * with a fixture (JS + SCSS entries and a small PNG), and measures:
 *
 *   - Cold build (empty dist)
 *   - Warm rebuild (no source changes → cache-only image sync)
 *   - JS incremental change (touch one entry, rebuild)
 *   - SCSS incremental change
 *   - Single-image update
 *
 * Real `src/` and `dist/` are never touched. Targets are informational
 * budgets (cold ≤10s, incremental ≤300ms, single image ≤1s); missing a
 * target prints a note but does not fail the process.
 */

import { performance } from 'node:perf_hooks';
import { mkdir, rm, writeFile, utimes } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { build as viteBuild } from 'vite';
import { discoverEntries } from '../lib/asset-discovery.mjs';
import { createViteConfig } from '../lib/vite-config.mjs';
import { syncImages } from '../lib/image-pipeline.mjs';
import { formatDuration, info, ok, warn } from '../lib/log.mjs';
import { CACHE } from '../lib/paths.mjs';

const FIXTURE_ROOT = join(CACHE, 'benchmark');
const SRC = join(FIXTURE_ROOT, 'src');
const SRC_JS = join(SRC, 'js');
const SRC_CSS = join(SRC, 'css');
const SRC_IMAGES = join(SRC, 'Images');
const DIST = join(FIXTURE_ROOT, 'dist');
const DIST_IMAGES = join(DIST, 'images');
const IMAGE_CACHE = join(FIXTURE_ROOT, 'image-cache.json');

const TARGETS = {
  cold: 10_000,
  jsIncremental: 300,
  scssIncremental: 300,
  imageIncremental: 1_000,
};

async function seedFixture() {
  await rm(FIXTURE_ROOT, { recursive: true, force: true });
  await mkdir(SRC_JS, { recursive: true });
  await mkdir(SRC_CSS, { recursive: true });
  await mkdir(join(SRC_CSS, 'base'), { recursive: true });
  await mkdir(SRC_IMAGES, { recursive: true });

  // Two JS entries, no imports (mirrors the pipeline contract).
  await writeFile(
    join(SRC_JS, 'main.js'),
    'console.log("main entry", Date.now());\n'
  );
  await writeFile(
    join(SRC_JS, 'about.js'),
    'document.title = "About";\nconsole.log("about entry");\n'
  );

  await writeFile(
    join(SRC_CSS, 'base', '_variables.scss'),
    '$brand: #ff6600;\n$text: #222;\n'
  );
  await writeFile(
    join(SRC_CSS, 'base', '_mixins.scss'),
    '@mixin card { padding: 1rem; border-radius: 4px; }\n'
  );
  await writeFile(
    join(SRC_CSS, 'main.scss'),
    'body { color: $text; a { color: $brand; @include card; } }\n'
  );

  const png = await sharp({
    create: {
      width: 32,
      height: 32,
      channels: 4,
      background: { r: 255, g: 102, b: 0, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
  await writeFile(join(SRC_IMAGES, 'brand.png'), png);
}

async function runBuild() {
  const started = performance.now();
  const { all: entries } = await discoverEntries({
    jsRoot: SRC_JS,
    cssRoot: SRC_CSS,
  });
  const config = createViteConfig(entries, {
    mode: 'production',
    outDir: DIST,
    sassLoadPaths: [SRC_CSS, join(SRC_CSS, 'base')],
  });
  // Drop the mirror plugin: this scratch build must not touch the
  // real cache/manifest of the workspace.
  config.plugins = config.plugins.filter(
    (plugin) => plugin.name !== 'assets-output-mirror'
  );
  await viteBuild(config);

  await syncImages({
    srcRoot: SRC_IMAGES,
    distRoot: DIST_IMAGES,
    cacheFile: IMAGE_CACHE,
    quiet: true,
  });

  return performance.now() - started;
}

async function touch(path) {
  const now = new Date();
  await utimes(path, now, now);
}

async function report(label, elapsed, target) {
  const line = `${label}: ${formatDuration(elapsed)} (target ${formatDuration(target)})`;
  if (elapsed <= target) {
    ok('bench', line);
  } else {
    warn('bench', `${line} — over budget`);
  }
}

async function main() {
  info('bench', `scratch workspace: ${FIXTURE_ROOT}`);
  await seedFixture();

  info('bench', 'cold build');
  await rm(DIST, { recursive: true, force: true });
  await rm(IMAGE_CACHE, { force: true });
  const cold = await runBuild();
  await report('cold build', cold, TARGETS.cold);

  info('bench', 'warm rebuild');
  const warm = await runBuild();
  await report('warm rebuild', warm, TARGETS.cold / 2);

  info('bench', 'JS incremental');
  await touch(join(SRC_JS, 'main.js'));
  const jsInc = await runBuild();
  await report('js incremental', jsInc, TARGETS.jsIncremental);

  info('bench', 'SCSS incremental');
  await touch(join(SRC_CSS, 'main.scss'));
  const scssInc = await runBuild();
  await report('scss incremental', scssInc, TARGETS.scssIncremental);

  info('bench', 'image incremental');
  const png2 = await sharp({
    create: {
      width: 48,
      height: 48,
      channels: 4,
      background: { r: 0, g: 200, b: 100, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
  await writeFile(join(SRC_IMAGES, 'brand.png'), png2);
  const imgStart = performance.now();
  await syncImages({
    srcRoot: SRC_IMAGES,
    distRoot: DIST_IMAGES,
    cacheFile: IMAGE_CACHE,
    quiet: true,
  });
  const imgElapsed = performance.now() - imgStart;
  await report('image incremental', imgElapsed, TARGETS.imageIncremental);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack ?? err}\n`);
  process.exitCode = 1;
});
