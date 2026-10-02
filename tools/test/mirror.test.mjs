import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  readManifestSet,
  reconcileOutputs,
  removeOutput,
} from '../lib/output-mirror.mjs';
import { cleanup, makeTempDir } from './helpers.mjs';

async function setup() {
  const tmp = await makeTempDir();
  const distRoot = join(tmp, 'dist');
  const cssRoot = join(distRoot, 'css');
  const jsRoot = join(distRoot, 'js');
  const cacheDir = join(tmp, 'cache');
  const manifestPath = join(cacheDir, 'output-manifest.json');
  await mkdir(cssRoot, { recursive: true });
  await mkdir(jsRoot, { recursive: true });
  await mkdir(cacheDir, { recursive: true });
  const opts = {
    manifestPath,
    distRoot,
    managedRoots: [cssRoot, jsRoot],
  };
  return { tmp, opts, distRoot, cssRoot, jsRoot };
}

test('reconcileOutputs writes an atomic manifest', async () => {
  const { tmp, opts } = await setup();
  try {
    await reconcileOutputs(new Set(['css/main.min.css', 'js/app.min.js']), opts);
    const manifest = await readManifestSet(opts);
    assert.equal(manifest.size, 2);
    assert.ok(manifest.has('css/main.min.css'));
    assert.ok(manifest.has('js/app.min.js'));
    const raw = JSON.parse(await readFile(opts.manifestPath, 'utf8'));
    assert.equal(raw.version, 1);
    assert.deepEqual(raw.outputs, ['css/main.min.css', 'js/app.min.js']);
  } finally {
    await cleanup(tmp);
  }
});

test('removes stale outputs and keeps expected files', async () => {
  const { tmp, opts, cssRoot, jsRoot } = await setup();
  try {
    const legacyCss = join(cssRoot, 'legacy.min.css');
    const keepCss = join(cssRoot, 'main.min.css');
    const keepJs = join(jsRoot, 'app.min.js');
    await writeFile(legacyCss, 'body{}');
    await writeFile(keepCss, 'body{}');
    await writeFile(keepJs, 'console.log(1)');

    await reconcileOutputs(
      new Set(['css/legacy.min.css', 'css/main.min.css', 'js/app.min.js']),
      opts
    );
    await reconcileOutputs(
      new Set(['css/main.min.css', 'js/app.min.js']),
      opts
    );

    assert.equal(existsSync(legacyCss), false);
    assert.equal(existsSync(keepCss), true);
    assert.equal(existsSync(keepJs), true);
  } finally {
    await cleanup(tmp);
  }
});

test('never touches files outside managed roots', async () => {
  const { tmp, opts, distRoot } = await setup();
  try {
    const foreign = join(distRoot, 'fonts', 'font.woff');
    await mkdir(join(distRoot, 'fonts'), { recursive: true });
    await writeFile(foreign, 'binary');

    await reconcileOutputs(
      new Set(['css/main.min.css']),
      { ...opts, managedRoots: [join(distRoot, 'css'), join(distRoot, 'js')] }
    );
    // Simulate a rogue historical manifest that recorded a foreign path.
    await writeFile(
      opts.manifestPath,
      JSON.stringify(
        { version: 1, outputs: ['fonts/font.woff', 'css/main.min.css'] },
        null,
        2
      )
    );
    await reconcileOutputs(new Set(['css/main.min.css']), opts);
    assert.equal(existsSync(foreign), true);
  } finally {
    await cleanup(tmp);
  }
});

test('removeOutput deletes a tracked file and updates manifest', async () => {
  const { tmp, opts, cssRoot } = await setup();
  try {
    const target = join(cssRoot, 'delete-me.min.css');
    await writeFile(target, 'body{}');
    await reconcileOutputs(new Set(['css/delete-me.min.css']), opts);
    const removed = await removeOutput('css/delete-me.min.css', opts);
    assert.equal(removed, true);
    assert.equal(existsSync(target), false);
    const manifest = await readManifestSet(opts);
    assert.equal(manifest.has('css/delete-me.min.css'), false);
  } finally {
    await cleanup(tmp);
  }
});

test('recovers gracefully from a corrupt manifest', async () => {
  const { tmp, opts } = await setup();
  try {
    await writeFile(opts.manifestPath, 'not-json{{');
    await reconcileOutputs(new Set(['css/main.min.css']), opts);
    const manifest = await readManifestSet(opts);
    assert.equal(manifest.has('css/main.min.css'), true);
  } finally {
    await cleanup(tmp);
  }
});
