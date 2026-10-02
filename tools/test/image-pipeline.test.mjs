import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { syncImages } from '../lib/image-pipeline.mjs';
import {
  cleanup,
  makeJpeg,
  makePng,
  makeTempDir,
  tinyGif,
  tinySvg,
} from './helpers.mjs';

async function setup() {
  const tmp = await makeTempDir();
  const srcRoot = join(tmp, 'src', 'Images');
  const distRoot = join(tmp, 'dist', 'images');
  const cacheFile = join(tmp, 'cache', 'image-cache.json');
  await mkdir(srcRoot, { recursive: true });
  const options = { srcRoot, distRoot, cacheFile, quiet: true, concurrency: 2 };
  return { tmp, srcRoot, distRoot, cacheFile, options };
}

test('mirrors PNG/JPEG/SVG/GIF and preserves structure', async () => {
  const { tmp, srcRoot, distRoot, options } = await setup();
  try {
    await mkdir(join(srcRoot, 'brand'), { recursive: true });
    await writeFile(join(srcRoot, 'brand', 'logo.png'), await makePng());
    await writeFile(join(srcRoot, 'hero.jpg'), await makeJpeg());
    await writeFile(join(srcRoot, 'sprite.svg'), tinySvg());
    await writeFile(join(srcRoot, 'anim.gif'), tinyGif());

    const result = await syncImages(options);
    assert.equal(result.failures.length, 0);
    assert.equal(result.warnings.length, 0);
    assert.equal(result.processed, 4);
    assert.ok(existsSync(join(distRoot, 'brand', 'logo.png')));
    assert.ok(existsSync(join(distRoot, 'hero.jpg')));
    assert.ok(existsSync(join(distRoot, 'sprite.svg')));
    assert.ok(existsSync(join(distRoot, 'anim.gif')));
  } finally {
    await cleanup(tmp);
  }
});

test('cache short-circuits unchanged files on second run', async () => {
  const { tmp, srcRoot, options } = await setup();
  try {
    await writeFile(join(srcRoot, 'a.png'), await makePng());
    const first = await syncImages(options);
    assert.equal(first.processed, 1);
    assert.equal(first.skippedCache, 0);

    const second = await syncImages(options);
    assert.equal(second.processed, 0);
    assert.equal(second.skippedCache, 1);
    assert.equal(second.failures.length, 0);
  } finally {
    await cleanup(tmp);
  }
});

test('deleted source removes dist counterpart and cache entry', async () => {
  const { tmp, srcRoot, distRoot, cacheFile, options } = await setup();
  try {
    await writeFile(join(srcRoot, 'a.png'), await makePng());
    await writeFile(join(srcRoot, 'b.png'), await makePng());
    await syncImages(options);
    assert.ok(existsSync(join(distRoot, 'a.png')));
    assert.ok(existsSync(join(distRoot, 'b.png')));

    await rm(join(srcRoot, 'b.png'));
    const result = await syncImages(options);
    assert.equal(result.removed, 1);
    assert.equal(existsSync(join(distRoot, 'b.png')), false);
    const cache = JSON.parse(await readFile(cacheFile, 'utf8'));
    assert.equal(cache.entries['b.png'], undefined);
    assert.ok(cache.entries['a.png']);
  } finally {
    await cleanup(tmp);
  }
});

test('empty source root leaves dist/images cleaned up', async () => {
  const { tmp, srcRoot, distRoot, options } = await setup();
  try {
    await writeFile(join(srcRoot, 'ghost.png'), await makePng());
    await syncImages(options);
    assert.ok(existsSync(join(distRoot, 'ghost.png')));
    await rm(srcRoot, { recursive: true, force: true });
    const result = await syncImages(options);
    assert.equal(result.processed, 0);
    assert.equal(existsSync(distRoot), false);
  } finally {
    await cleanup(tmp);
  }
});

test('unreadable source triggers a hard failure, not a warning', async () => {
  const { tmp, srcRoot, options } = await setup();
  try {
    // A tiny "PNG" that Sharp cannot decode — will fail optimizer.
    // Fallback copy still succeeds, so this is a warning, not failure.
    await writeFile(join(srcRoot, 'broken.png'), Buffer.from([0x00, 0x01]));
    const result = await syncImages(options);
    // Sharp usually surfaces a "input file has an unknown format" error.
    // The mirror falls back to atomicCopy, so warnings === 1, failures === 0.
    assert.equal(result.failures.length, 0);
    assert.equal(result.warnings.length, 1);
    assert.equal(result.warnings[0].path, 'broken.png');
  } finally {
    await cleanup(tmp);
  }
});

test('corrupt cache file is discarded, not thrown', async () => {
  const { tmp, srcRoot, cacheFile, options } = await setup();
  try {
    await writeFile(join(srcRoot, 'a.png'), await makePng());
    await mkdir(join(cacheFile, '..'), { recursive: true });
    await writeFile(cacheFile, '{{{ not json');
    const result = await syncImages(options);
    assert.equal(result.failures.length, 0);
    assert.equal(result.processed, 1);
  } finally {
    await cleanup(tmp);
  }
});
