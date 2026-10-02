import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { build as viteBuild } from 'vite';
import { discoverEntries } from '../lib/asset-discovery.mjs';
import { createViteConfig } from '../lib/vite-config.mjs';
import { cleanup, makeTempDir } from './helpers.mjs';

async function seed(tmp) {
  const jsRoot = join(tmp, 'js');
  const cssRoot = join(tmp, 'css');
  const cssBase = join(cssRoot, 'base');
  await mkdir(join(jsRoot, 'pages'), { recursive: true });
  await mkdir(cssBase, { recursive: true });

  await writeFile(join(jsRoot, 'main.js'), 'console.log("main");');
  await writeFile(join(jsRoot, 'pages', 'about.js'), 'console.log("about");');
  await writeFile(join(cssBase, '_variables.scss'), '$brand: #f60;');
  await writeFile(join(cssBase, '_mixins.scss'), '@mixin card { padding: 1rem; }');
  await writeFile(
    join(cssRoot, 'main.scss'),
    'body { color: $brand; a { @include card; } }'
  );
  await writeFile(
    join(cssRoot, 'components.scss'),
    '.btn { display: inline-block; }'
  );

  return { jsRoot, cssRoot };
}

async function build(entries, distRoot, tmp) {
  const config = createViteConfig(entries, {
    mode: 'production',
    outDir: distRoot,
    sassLoadPaths: [join(tmp, 'css'), join(tmp, 'css', 'base')],
  });
  // Do not touch the real workspace manifest during smoke build.
  config.plugins = config.plugins.filter(
    (plugin) => plugin.name !== 'assets-output-mirror'
  );
  await viteBuild(config);
}

test('produces .min.js and .min.css with external source maps', async () => {
  const tmp = await makeTempDir();
  try {
    const { jsRoot, cssRoot } = await seed(tmp);
    const distRoot = join(tmp, 'dist');
    const { all } = await discoverEntries({ jsRoot, cssRoot });
    await build(all, distRoot, tmp);

    const jsMain = join(distRoot, 'js', 'main.min.js');
    const jsAbout = join(distRoot, 'js', 'pages', 'about.min.js');
    const cssMain = join(distRoot, 'css', 'main.min.css');
    const cssComponents = join(distRoot, 'css', 'components.min.css');

    for (const path of [jsMain, jsAbout, cssMain, cssComponents]) {
      assert.ok(existsSync(path), `expected ${path}`);
    }
    // JS entries always emit external source maps.
    assert.ok(existsSync(`${jsMain}.map`), 'expected sourcemap for main JS');
    assert.ok(existsSync(`${jsAbout}.map`), 'expected sourcemap for about JS');

    const mainJs = await readFile(jsMain, 'utf8');
    assert.match(mainJs, /sourceMappingURL=main\.min\.js\.map/);

    const mainCss = await readFile(cssMain, 'utf8');
    // cssnano collapses whitespace so the compiled output is a single
    // line without newlines between rules.
    assert.ok(mainCss.length < 200, `expected minified CSS: ${mainCss}`);

    // No hidden shared JS chunks or `.shim.js` leftovers.
    async function walkJs(dir) {
      const items = await readdir(dir, { withFileTypes: true });
      const names = [];
      for (const item of items) {
        if (item.isDirectory()) {
          names.push(
            ...(await walkJs(join(dir, item.name))).map(
              (n) => `${item.name}/${n}`
            )
          );
        } else {
          names.push(item.name);
        }
      }
      return names;
    }
    const jsFiles = await walkJs(join(distRoot, 'js'));
    for (const name of jsFiles) {
      if (name.endsWith('.js')) {
        assert.match(name, /\.min\.js$/, `unexpected non-min JS file: ${name}`);
      }
      assert.equal(name.endsWith('.shim.js'), false, `shim leaked: ${name}`);
    }
    // Assets folder must not appear (no non-CSS assets in fixture).
    assert.equal(
      existsSync(join(distRoot, 'assets')),
      false,
      'unexpected assets/ folder emitted'
    );
  } finally {
    await cleanup(tmp);
  }
});

test('two consecutive builds produce identical output', async () => {
  const tmp = await makeTempDir();
  try {
    const { jsRoot, cssRoot } = await seed(tmp);
    const distA = join(tmp, 'dist-a');
    const distB = join(tmp, 'dist-b');
    const { all } = await discoverEntries({ jsRoot, cssRoot });
    await build(all, distA, tmp);
    await build(all, distB, tmp);

    const files = [
      'js/main.min.js',
      'js/pages/about.min.js',
      'css/main.min.css',
      'css/components.min.css',
    ];
    for (const file of files) {
      const a = await readFile(join(distA, file));
      const b = await readFile(join(distB, file));
      assert.equal(a.equals(b), true, `mismatch for ${file}`);
    }
  } finally {
    await cleanup(tmp);
  }
});
