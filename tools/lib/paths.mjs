/**
 * Canonical absolute paths for the assets pipeline.
 *
 * Every module derives its filesystem locations from this single source
 * so `src`, `dist`, `.cache`, and the entry roots stay consistent even
 * if the assets directory is moved.
 */

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** Absolute path to `assets/`. */
export const ROOT = resolve(here, '../..');

/** Absolute path to `assets/src/`. */
export const SRC = resolve(ROOT, 'src');

/** Absolute path to `assets/dist/`. */
export const DIST = resolve(ROOT, 'dist');

/** Absolute path to `assets/.cache/`. */
export const CACHE = resolve(ROOT, '.cache');

/** JS entry root. */
export const SRC_JS = resolve(SRC, 'js');

/** SCSS entry root. */
export const SRC_CSS = resolve(SRC, 'css');

/** SCSS `base/` folder — mixins + variables + shared partials. */
export const SRC_CSS_BASE = resolve(SRC_CSS, 'base');

/** Image source root. Fixed contract: `src/Images/` on disk. */
export const SRC_IMAGES = resolve(SRC, 'Images');

/** `dist/js/` output root. */
export const DIST_JS = resolve(DIST, 'js');

/** `dist/css/` output root. */
export const DIST_CSS = resolve(DIST, 'css');

/** `dist/images/` output root. */
export const DIST_IMAGES = resolve(DIST, 'images');

/** Managed output manifest (JS + CSS). Removed by `clean`. */
export const OUTPUT_MANIFEST = resolve(CACHE, 'output-manifest.json');

/** Image optimizer cache. Removed by `clean`. */
export const IMAGE_CACHE = resolve(CACHE, 'image-cache.json');

/** Cross-process lock for concurrent build/watch/images/clean. */
export const LOCK_FILE = resolve(CACHE, 'build.lock');
