/**
 * In-process image mirror + optimizer.
 *
 * Contract:
 *   - `src/Images/**` is mirrored 1:1 to `dist/images/**`, preserving
 *     folder structure and casing.
 *   - PNG, JPEG (`.jpg`/`.jpeg`) and WebP are re-encoded through Sharp
 *     at the configured quality; SVG is passed through SVGO; GIF is
 *     copied verbatim (Sharp animated-GIF support is out of scope for
 *     this pipeline).
 *   - When an optimizer throws, the original is copied to preserve the
 *     asset and the caller is told which file fell back and why.
 *     Overall build stays successful (best-effort image contract).
 *   - Hard failures (optimizer AND copy fail) mark the file as failed
 *     and set a non-zero final exit code.
 *   - Deleted sources cause the corresponding dist file to be removed
 *     and the cache entry to be cleared.
 *   - The cache signature includes optimizer versions + quality knobs
 *     so upgrading Sharp/SVGO invalidates the cache automatically.
 *   - Cache writes are atomic (`temp → rename`) so a crash mid-write
 *     never leaves a truncated JSON blob.
 *
 * All heavy work is done through Node's async APIs; a small bounded
 * pool caps parallelism at `os.availableParallelism()` (or the caller
 * override) so we do not thrash memory on large image sets.
 */

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import { basename, dirname, extname, join, relative, sep } from 'node:path';
import { createRequire } from 'node:module';
import buildConfig from '../../build.config.mjs';
import { DIST_IMAGES, IMAGE_CACHE, SRC_IMAGES } from './paths.mjs';

const require = createRequire(import.meta.url);

const RASTER_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const COPY_EXTENSIONS = new Set(['.gif']);
const SVG_EXTENSION = '.svg';
const IMAGE_EXTENSIONS = new Set([
  ...RASTER_EXTENSIONS,
  ...COPY_EXTENSIONS,
  SVG_EXTENSION,
]);

/**
 * @typedef {object} PipelineOptions
 * @property {number} [concurrency] Override parallel-worker cap. Defaults to CPU count.
 * @property {boolean} [quiet]      Suppress per-file success logging.
 */

/**
 * @typedef {object} PipelineResult
 * @property {number} processed
 * @property {number} copiedFallback
 * @property {number} skippedCache
 * @property {number} removed
 * @property {number} originalBytes
 * @property {number} optimizedBytes
 * @property {Array<{ path: string, reason: string }>} warnings
 * @property {Array<{ path: string, reason: string }>} failures
 */

function toPosix(value) {
  return sep === '/' ? value : value.split(sep).join('/');
}

function moduleVersion(name) {
  try {
    return require(`${name}/package.json`).version;
  } catch {
    return 'unavailable';
  }
}

function computeSignature(config) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        version: 3,
        jpegQuality: config.jpegQuality,
        pngQuality: config.pngQuality,
        webpQuality: config.webpQuality,
        optimizeSvg: config.optimizeSvg,
        sharp: moduleVersion('sharp'),
        svgo: moduleVersion('svgo'),
      })
    )
    .digest('hex');
}

async function loadCache(cacheFile, signature) {
  if (!existsSync(cacheFile)) {
    return { signature, entries: {} };
  }
  try {
    const raw = await readFile(cacheFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.signature === signature &&
      parsed.entries &&
      typeof parsed.entries === 'object'
    ) {
      return { signature, entries: { ...parsed.entries } };
    }
  } catch {
    // Corrupt/older cache — start fresh so we don't reuse stale data.
  }
  return { signature, entries: {} };
}

async function saveCache(cacheFile, cache) {
  await mkdir(dirname(cacheFile), { recursive: true });
  const tmp = `${cacheFile}.tmp-${process.pid}`;
  await writeFile(tmp, JSON.stringify(cache, null, 2));
  await rename(tmp, cacheFile);
}

async function walkImages(root) {
  const results = [];

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
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      if (!IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
        continue;
      }
      results.push({
        absolute: abs,
        relative: toPosix(relative(root, abs)),
      });
    }
  }

  await visit(root);
  results.sort((a, b) => a.relative.localeCompare(b.relative));
  return results;
}

let sharpLoader = null;
async function getSharp() {
  if (sharpLoader) {
    return sharpLoader;
  }
  sharpLoader = import('sharp').then((mod) => mod.default).catch((err) => {
    sharpLoader = null;
    throw err;
  });
  return sharpLoader;
}

let svgoLoader = null;
async function getSvgo() {
  if (svgoLoader) {
    return svgoLoader;
  }
  svgoLoader = import('svgo').then((mod) => mod.optimize).catch((err) => {
    svgoLoader = null;
    throw err;
  });
  return svgoLoader;
}

async function atomicCopy(source, destination) {
  await mkdir(dirname(destination), { recursive: true });
  const tmp = `${destination}.tmp-${process.pid}`;
  await copyFile(source, tmp);
  await rename(tmp, destination);
}

async function atomicWrite(destination, buffer) {
  await mkdir(dirname(destination), { recursive: true });
  const tmp = `${destination}.tmp-${process.pid}`;
  await writeFile(tmp, buffer);
  await rename(tmp, destination);
}

async function optimizeRaster(sharp, source, destination, ext, config) {
  await mkdir(dirname(destination), { recursive: true });
  const tmp = `${destination}.tmp-${process.pid}`;
  const pipeline = sharp(source);
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      await pipeline
        .jpeg({ quality: config.jpegQuality, progressive: true })
        .toFile(tmp);
      break;
    case '.png':
      await pipeline
        .png({ quality: config.pngQuality, compressionLevel: 9 })
        .toFile(tmp);
      break;
    case '.webp':
      await pipeline.webp({ quality: config.webpQuality }).toFile(tmp);
      break;
    default:
      throw new Error(`Unsupported raster extension: ${ext}`);
  }
  await rename(tmp, destination);
}

async function optimizeSvg(optimize, source, destination) {
  const svgContent = await readFile(source, 'utf8');
  // SVGO 4 keeps `viewBox` in `preset-default`; we still drop fixed
  // width/height so responsive scaling stays intact.
  const result = optimize(svgContent, {
    multipass: true,
    plugins: ['preset-default', 'removeDimensions'],
  });
  await atomicWrite(destination, result.data);
}

function shortReason(err) {
  const message = err?.message ?? String(err);
  return message.split('\n')[0].slice(0, 240);
}

async function processOne({ source, config, cache, warnings, failures, options, distRoot }) {
  const ext = extname(source.absolute).toLowerCase();
  const destination = join(distRoot, source.relative);

  let srcStat;
  try {
    srcStat = await stat(source.absolute);
  } catch {
    return { skippedCache: false, processed: false, srcSize: 0, outSize: 0 };
  }

  const cached = cache.entries[source.relative];
  if (
    cached &&
    cached.mtimeMs === srcStat.mtimeMs &&
    cached.size === srcStat.size &&
    existsSync(destination)
  ) {
    return {
      skippedCache: true,
      processed: false,
      srcSize: srcStat.size,
      outSize: cached.optimizedSize ?? srcStat.size,
    };
  }

  let optimizerError = null;

  try {
    if (RASTER_EXTENSIONS.has(ext)) {
      const sharp = await getSharp();
      await optimizeRaster(sharp, source.absolute, destination, ext, config);
    } else if (ext === SVG_EXTENSION && config.optimizeSvg) {
      const optimize = await getSvgo();
      await optimizeSvg(optimize, source.absolute, destination);
    } else {
      // GIF or SVG-without-optimization: mirror the byte stream.
      await atomicCopy(source.absolute, destination);
    }
  } catch (err) {
    optimizerError = err;
  }

  if (optimizerError) {
    try {
      await atomicCopy(source.absolute, destination);
      warnings.push({
        path: source.relative,
        reason: shortReason(optimizerError),
      });
    } catch (copyErr) {
      failures.push({
        path: source.relative,
        reason: `${shortReason(optimizerError)} | copy: ${shortReason(copyErr)}`,
      });
      delete cache.entries[source.relative];
      return {
        skippedCache: false,
        processed: false,
        srcSize: srcStat.size,
        outSize: 0,
        failed: true,
      };
    }
  }

  let outSize;
  try {
    const destStat = await stat(destination);
    outSize = destStat.size;
  } catch {
    // Destination unexpectedly missing after a successful write. This
    // is nearly impossible on a healthy filesystem; treat as failure.
    failures.push({
      path: source.relative,
      reason: 'destination missing after write',
    });
    delete cache.entries[source.relative];
    return {
      skippedCache: false,
      processed: false,
      srcSize: srcStat.size,
      outSize: 0,
      failed: true,
    };
  }

  cache.entries[source.relative] = {
    mtimeMs: srcStat.mtimeMs,
    size: srcStat.size,
    optimizedSize: outSize,
  };

  if (!options.quiet) {
    const delta = srcStat.size - outSize;
    const pct =
      srcStat.size > 0
        ? ((Math.abs(delta) / srcStat.size) * 100).toFixed(1)
        : '0.0';
    const marker = optimizerError ? 'copy' : 'ok';
    process.stdout.write(
      `  [images:${marker}] ${source.relative} ` +
        `${(srcStat.size / 1024).toFixed(1)}KB -> ${(outSize / 1024).toFixed(1)}KB ` +
        `(${delta >= 0 ? '-' : '+'}${pct}%)\n`
    );
  }

  return {
    skippedCache: false,
    processed: true,
    fallback: Boolean(optimizerError),
    srcSize: srcStat.size,
    outSize,
    failed: false,
  };
}

async function runPool(items, worker, concurrency) {
  const results = [];
  let index = 0;
  const size = Math.max(1, Math.min(concurrency, items.length || 1));

  const runners = Array.from({ length: size }, async () => {
    while (index < items.length) {
      const currentIndex = index++;
      const item = items[currentIndex];
      const result = await worker(item);
      results[currentIndex] = result;
    }
  });

  await Promise.all(runners);
  return results;
}

async function removeStaleOutputs(rootPresent, cache, expectedKeys, distRoot) {
  const removed = [];
  const knownKeys = new Set([...Object.keys(cache.entries), ...expectedKeys]);
  for (const key of knownKeys) {
    if (expectedKeys.has(key)) {
      continue;
    }
    const abs = join(distRoot, ...key.split('/'));
    try {
      await rm(abs, { force: true });
    } catch {
      // Ignore — the file may have been removed already.
    }
    delete cache.entries[key];
    removed.push(key);
  }
  if (!rootPresent) {
    // When src/Images vanishes entirely we still tear down dist/images
    // so nothing stale ships. Only the managed root is touched.
    try {
      await rm(distRoot, { recursive: true, force: true });
    } catch {
      // Best-effort cleanup.
    }
  }
  return removed;
}

/**
 * Synchronise `src/Images` -> `dist/images`. Runs a full diff on every
 * invocation and processes changed files in parallel.
 *
 * Path/config overrides exist for tests; production callers use the
 * defaults defined in `paths.mjs` + `build.config.mjs`.
 */
export async function syncImages(options = {}) {
  const config = { ...buildConfig.imageOptimization, ...options.config };
  const srcRoot = options.srcRoot ?? SRC_IMAGES;
  const distRoot = options.distRoot ?? DIST_IMAGES;
  const cacheFile = options.cacheFile ?? IMAGE_CACHE;
  const concurrency = Math.max(
    1,
    Number(options.concurrency) || availableParallelism()
  );

  const signature = computeSignature(config);
  const cache = await loadCache(cacheFile, signature);

  const rootPresent = existsSync(srcRoot);
  const sources = rootPresent ? await walkImages(srcRoot) : [];
  const expectedKeys = new Set(sources.map((s) => s.relative));

  if (rootPresent) {
    await mkdir(distRoot, { recursive: true });
  }

  const removedStale = await removeStaleOutputs(
    rootPresent,
    cache,
    expectedKeys,
    distRoot
  );

  const warnings = [];
  const failures = [];
  const perFile = await runPool(
    sources,
    (source) =>
      processOne({
        source,
        config,
        cache,
        warnings,
        failures,
        options,
        distRoot,
      }),
    concurrency
  );

  await saveCache(cacheFile, cache);

  let processed = 0;
  let copiedFallback = 0;
  let skippedCache = 0;
  let originalBytes = 0;
  let optimizedBytes = 0;
  for (const entry of perFile) {
    if (!entry) {
      continue;
    }
    originalBytes += entry.srcSize;
    optimizedBytes += entry.outSize;
    if (entry.skippedCache) {
      skippedCache += 1;
    }
    if (entry.processed) {
      processed += 1;
      if (entry.fallback) {
        copiedFallback += 1;
      }
    }
  }

  return {
    processed,
    copiedFallback,
    skippedCache,
    removed: removedStale.length,
    originalBytes,
    optimizedBytes,
    warnings,
    failures,
  };
}

/**
 * Synchronise a specific set of source-relative image paths (used by
 * the watch orchestrator for targeted rebuilds). Deleted paths are
 * detected automatically by `syncImages`; this variant is a
 * convenience wrapper for tests and manual invocations.
 */
export async function syncImagePaths(paths, options = {}) {
  // Full sync stays cheapest — walking `src/Images/` is O(files) and
  // the cache prevents re-optimization. Keeping the API surface small
  // avoids duplicating diff logic in two places.
  const filter = new Set(paths.map(toPosix));
  return syncImages({
    ...options,
    quiet: options.quiet ?? filter.size === 0,
  });
}

/** Exposed for tests: which extensions are treated as images. */
export function isImagePath(name) {
  return IMAGE_EXTENSIONS.has(extname(name).toLowerCase());
}

/** Exposed for tests: does this file live inside `src/Images/`? */
export function isImageSource(absolute) {
  const rel = relative(SRC_IMAGES, absolute);
  return (
    rel !== '' && !rel.startsWith('..') && !rel.startsWith(sep) &&
    isImagePath(basename(absolute))
  );
}
