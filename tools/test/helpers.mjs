/**
 * Shared test helpers: temp workspace management + tiny image fixtures.
 */

import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

export async function makeTempDir(prefix = 'agencycatalog-assets-') {
  return mkdtemp(join(tmpdir(), prefix));
}

export async function cleanup(dir) {
  await rm(dir, { recursive: true, force: true });
}

export async function writeFileEnsured(path, contents) {
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, contents);
}

export async function makePng(size = 8, color = { r: 10, g: 20, b: 30, alpha: 1 }) {
  return sharp({
    create: { width: size, height: size, channels: 4, background: color },
  })
    .png()
    .toBuffer();
}

export async function makeJpeg(size = 8, color = { r: 200, g: 100, b: 50 }) {
  return sharp({
    create: { width: size, height: size, channels: 3, background: color },
  })
    .jpeg({ quality: 80 })
    .toBuffer();
}

export function tinySvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><!-- test -->
  <rect width="16" height="16" fill="#0ff"/>
</svg>`;
}

/** Tiny GIF89a (1x1 transparent). */
export function tinyGif() {
  return Buffer.from(
    '47494638396101000100800000000000ffffff21f90401000001002c00000000010001000002024c01003b',
    'hex'
  );
}
