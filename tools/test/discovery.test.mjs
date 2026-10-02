import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { platform } from 'node:os';
import { discoverEntries } from '../lib/asset-discovery.mjs';
import { cleanup, makeTempDir } from './helpers.mjs';

async function seed(tmp) {
  const jsRoot = join(tmp, 'js');
  const cssRoot = join(tmp, 'css');
  await mkdir(join(jsRoot, 'pages'), { recursive: true });
  await mkdir(join(cssRoot, 'components'), { recursive: true });

  await writeFile(join(jsRoot, 'main.js'), 'console.log(1)');
  await writeFile(join(jsRoot, 'pages', 'about.js'), 'console.log(2)');
  await writeFile(join(cssRoot, 'main.scss'), 'body{color:red}');
  await writeFile(join(cssRoot, 'components', 'button.scss'), '.btn{}');
  await writeFile(join(cssRoot, 'components', '_partial.scss'), '// partial');
  await writeFile(join(cssRoot, '_variables.scss'), '$brand: blue;');

  return { jsRoot, cssRoot };
}

test('discovers nested JS and SCSS entries and ignores partials', async () => {
  const tmp = await makeTempDir();
  try {
    const { jsRoot, cssRoot } = await seed(tmp);
    const { js, css } = await discoverEntries({ jsRoot, cssRoot });

    assert.deepEqual(
      js.map((e) => e.relativePath).sort(),
      ['main.js', 'pages/about.js']
    );
    assert.deepEqual(
      css.map((e) => e.relativePath).sort(),
      ['components/button.scss', 'main.scss']
    );

    assert.equal(js[0].outputPath, 'main.min.js');
    assert.equal(
      js.find((e) => e.relativePath === 'pages/about.js').outputPath,
      'pages/about.min.js'
    );
    assert.equal(
      css.find((e) => e.relativePath === 'components/button.scss').outputPath,
      'components/button.min.css'
    );
  } finally {
    await cleanup(tmp);
  }
});

test('missing roots yield empty lists without throwing', async () => {
  const tmp = await makeTempDir();
  try {
    const { js, css, all } = await discoverEntries({
      jsRoot: join(tmp, 'missing-js'),
      cssRoot: join(tmp, 'missing-css'),
    });
    assert.equal(js.length, 0);
    assert.equal(css.length, 0);
    assert.equal(all.length, 0);
  } finally {
    await cleanup(tmp);
  }
});

test('case-insensitive collisions are rejected', async (t) => {
  if (platform() === 'darwin' || platform() === 'win32') {
    t.skip('Requires case-sensitive filesystem to distinguish the two files');
    return;
  }
  const tmp = await makeTempDir();
  try {
    const jsRoot = join(tmp, 'js');
    await mkdir(jsRoot, { recursive: true });
    await writeFile(join(jsRoot, 'Main.js'), '');
    await writeFile(join(jsRoot, 'main.js'), '');
    await assert.rejects(
      () => discoverEntries({ jsRoot, cssRoot: join(tmp, 'css') }),
      /Case-insensitive collision/
    );
  } finally {
    await cleanup(tmp);
  }
});

test('stable ordering by canonical path', async () => {
  const tmp = await makeTempDir();
  try {
    const { jsRoot, cssRoot } = await seed(tmp);
    const first = await discoverEntries({ jsRoot, cssRoot });
    const second = await discoverEntries({ jsRoot, cssRoot });
    assert.deepEqual(
      first.all.map((e) => e.rollupName),
      second.all.map((e) => e.rollupName)
    );
  } finally {
    await cleanup(tmp);
  }
});
