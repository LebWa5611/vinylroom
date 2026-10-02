/**
 * Structured single-line logger.
 *
 * Watch and build emit one status line per cycle to keep terminal
 * feedback dense and greppable. Anything longer (stack traces, image
 * warnings) is logged separately after the status line.
 *
 * Levels are colourised via `util.styleText` when the target stream
 * supports it (`NO_COLOR` / non-TTY pipes disable colour;
 * `FORCE_COLOR=1` keeps it).
 */

import { styleText } from 'node:util';

const TAGS = {
  build: 'build',
  watch: 'watch',
  images: 'images',
  clean: 'clean',
  info: 'info',
  error: 'error',
};

/** @type {Record<string, string | string[]>} */
const LEVEL_STYLES = {
  'OK   ': 'green',
  'INFO ': 'cyan',
  'WARN ': 'yellow',
  ERROR: 'red',
};

function timestamp() {
  return new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
}

function formatDuration(ms) {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  const seconds = Math.round(ms / 1000);
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return `${mm}m${String(ss).padStart(2, '0')}s`;
}

/**
 * @param {NodeJS.WritableStream} stream
 * @param {string | string[]} style
 * @param {string} text
 */
function paint(stream, style, text) {
  return styleText(style, text, { stream });
}

function emit(stream, level, tag, message) {
  const style = LEVEL_STYLES[level] ?? 'white';
  const ts = paint(stream, 'dim', `[${timestamp()}]`);
  const badge = paint(stream, ['bold', style], level);
  const label = paint(stream, style, `${tag}:`);
  stream.write(`${ts} ${badge} ${label} ${message}\n`);
}

export function ok(tag, message) {
  emit(process.stdout, 'OK   ', TAGS[tag] ?? tag, message);
}

export function warn(tag, message) {
  emit(process.stderr, 'WARN ', TAGS[tag] ?? tag, message);
}

export function fail(tag, message) {
  emit(process.stderr, 'ERROR', TAGS[tag] ?? tag, message);
}

export function info(tag, message) {
  emit(process.stdout, 'INFO ', TAGS[tag] ?? tag, message);
}

export { formatDuration };
