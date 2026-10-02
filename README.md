# Assets Build System

Auto-discovering, build-only `src → dist` pipeline for the WordPress theme.

The builder has one job: turn every file under `src/` into a matching
minified file under `dist/`. It never runs a dev server, never touches
PHP, and never invents entry points. Add a file → get an output.
Delete a file → the output disappears.

Runtime concerns (theme integration, script enqueueing, HTTP caching)
live in the parent theme, not here.

---

## Table of contents

- [What it produces](#what-it-produces)
- [Requirements](#requirements)
- [Install & run](#install--run)
- [Commands](#commands)
- [Source layout](#source-layout)
- [Auto-discovery](#auto-discovery)
- [Output mirror](#output-mirror)
- [Images](#images)
- [Watch feedback](#watch-feedback)
- [Process lock](#process-lock)
- [Configuration](#configuration)
- [Contract you can rely on](#contract-you-can-rely-on)
- [Non-goals](#non-goals)
- [Performance budgets](#performance-budgets)
- [External CI](#external-ci)
- [Troubleshooting](#troubleshooting)

---

## What it produces

For every file under `src/` you get one of:

| Source                              | Dist output                                 | Notes                                      |
| ----------------------------------- | ------------------------------------------- | ------------------------------------------ |
| `src/js/**/*.js`                    | `dist/js/<same-path>.min.js` (+ `.map`)     | Independent, no imports, no shared chunks. |
| `src/css/**/*.scss`                 | `dist/css/<same-path>.min.css`              | Minified via cssnano + Autoprefixer.       |
| `src/css/**/_*.scss`                | (partial — no output)                       | Loaded via `@use` from other SCSS files.   |
| `src/Images/**/*.{jpg,jpeg,png,webp}` | `dist/images/<same-path>`                 | Re-encoded by Sharp.                       |
| `src/Images/**/*.svg`               | `dist/images/<same-path>`                   | Optimized by SVGO.                         |
| `src/Images/**/*.gif`               | `dist/images/<same-path>`                   | Copied byte-for-byte.                      |

CSS and JS always ship minified. Source maps are always external
`.map` files. No CDN dependencies, no bundling, no code splitting.

---

## Requirements

- Node.js `>=22.12.0` (both **Node 22** and **Node 24** are supported;
  `.nvmrc` pins the current default LTS `24.19.0`).
- npm (bundled with Node).

Nothing else. Sharp and SVGO ship as precompiled npm packages, no
system-level `libvips`/`imagemagick` needed.

---

## Install & run

```bash
cd assets
npm install     # first time only
npm run build   # produce dist/
npm run watch   # incremental rebuilds on file change
```

Everything else (linters, tests, benchmark) is on the same npm scripts
list — see below.

---

## Commands

| Command             | What it does                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm run build`     | Production build. Wipes `dist/css` + `dist/js`, keeps `dist/images` (image cache stays warm), then rebuilds.  |
| `npm run watch`     | Long-running watcher. Rebuilds affected CSS/JS via Vite, syncs images in-process, mirrors deletes.            |
| `npm run dev`       | Alias for `npm run watch`.                                                                                    |
| `npm run images`    | One-shot image mirror. Same code path as build/watch, useful after bulk asset drops.                          |
| `npm run clean`     | Removes `dist/{css,js,images}` and `.cache/`. Foreign files in `dist/` (e.g. hand-authored fonts) are kept.   |
| `npm run build:all` | `clean` → `build`. Use when you want a truly cold slate.                                                      |
| `npm run lint`      | ESLint (JS + config files) + Stylelint (SCSS).                                                                |
| `npm run test`      | `node --test` runs the behavioural test suite under `tools/test/`.                                            |
| `npm run benchmark` | Non-invasive benchmark against a scratch workspace in `.cache/benchmark/`. Never touches real `src/`.         |
| `npm run ci`        | `lint` + `test` + `build`. This is what an external CI should call after `npm ci`.                            |

All commands honour the process lock (see below): running two
mutating commands against the same workspace fails fast with a clear
message.

---

## Source layout

```
assets/
├── src/                    # Sources (js / css / Images)
├── dist/                   # Generated. Never edit by hand.
├── node_modules/
├── build.config.mjs        # ONLY image-optimization tuning (public knobs)
├── package.json
├── README.md
├── .nvmrc
├── .cache/                 # Image cache + output manifest + process lock
└── tools/                  # Build tooling (kept out of the visual root)
    ├── lib/                # Pure modules (discovery, mirror, lock, images, vite)
    ├── scripts/            # Thin CLIs: build, watch, images, clean, benchmark
    ├── test/               # node:test behavioural tests
    ├── eslint.config.mjs
    ├── stylelint.config.mjs
    └── postcss.config.mjs
```

Source tree under `src/`:

```
src/
├── js/                     # → dist/js/ (each .js is an independent entry)
├── css/                    # → dist/css/ (each .scss is an entry, `_` = partial)
│   └── base/               # Global partials auto-injected as `@use "variables" as *`
│                           # and `@use "mixins" as *` into every entry.
└── Images/                 # → dist/images/ (mirrored 1:1)
```

`src/Images/` uses a capital I on purpose — that's the fixed contract.
Case-insensitive filesystems (macOS, Windows) still work; the mirror
just preserves whatever casing you use inside the tree.

---

## Auto-discovery

Every build and every watch cycle runs `tools/lib/asset-discovery.mjs`:

- `src/js/**/*.js` → entry, unless it's a hidden dotfile.
- `src/css/**/*.scss` → entry, unless basename starts with `_`.

Discovery is order-stable (sorted by canonical POSIX path) and rejects
case-insensitive collisions (`Main.js` vs `main.js`) with a loud
error, so nothing breaks silently when the repo travels between
macOS/Windows and Linux.

There is no manual entries list to keep in sync. Adding a file is the
API. Renaming or deleting one is also the API.

---

## Output mirror

`tools/lib/output-mirror.mjs` maintains a JSON manifest of every CSS/JS
file this pipeline created (`assets/.cache/output-manifest.json`).
After each successful Vite pass:

1. Files present in the new expected set stay put (Vite may have
   rewritten them with new content).
2. Files that used to be tracked but are no longer expected are
   removed from disk.
3. The manifest is rewritten atomically (`temp → rename`) so a crash
   mid-write can't leave a partial JSON blob.

The mirror is scoped to `dist/js/` and `dist/css/` only. Anything else
inside `dist/` (fonts, prebuilt vendor bundles, whatever) is
untouched.

Image mirror semantics live in `tools/lib/image-pipeline.mjs` and are
authoritative for `dist/images/`.

---

## Images

Every build and every affected watch cycle runs the same in-process
pipeline (no `execFileSync`, no re-spawning Node):

- Diff `src/Images/` against `.cache/image-cache.json` (mtime + size).
- Missed cache and modified files re-optimize; unchanged files
  short-circuit.
- Parallelism is bounded by `os.availableParallelism()` (or an
  explicit override).
- Sharp handles PNG/JPEG/WebP. SVGO handles SVG. GIF is copied.
- **Fallback policy.** If Sharp/SVGO throws, the pipeline falls back
  to an atomic byte-for-byte copy, records a `warning`, and continues.
  Only when *both* the optimizer *and* the copy fail does the pipeline
  record a `failure` and return a non-zero exit code.
- The cache signature includes Sharp/SVGO versions plus every quality
  knob — upgrading a dep automatically invalidates cache entries.

Deleted `src/Images/` files immediately delete their `dist/images/`
counterparts and their cache entries. Removing the entire
`src/Images/` folder tears down `dist/images/` as well.

There is no `--files=` / `--delete=` CLI. The pipeline always
reconciles the whole tree; the cache keeps repeat invocations cheap.

---

## Watch feedback

`npm run watch` emits **one status line per cycle**:

```
[HH:MM:SS.mmm] OK    watch: vite rebuild in 78ms
[HH:MM:SS.mmm] OK    watch: entries=7 in 10ms
[HH:MM:SS.mmm] OK    watch: images=3/0c/0r in 210ms
```

Legend: `entries=<N>` = new tracked entry set after a rediscover.
`images=<processed>/<cached>/<removed>`. Failures print an `ERROR`
line and only add the transient `stack` for genuinely unknown errors;
race-condition noise from Rolldown when a source disappears is
silenced.

Watch prints its full build for every JS/SCSS change, then bounces
back to the compact one-line format for subsequent cycles. Editing a
partial under `src/css/base/` invalidates every SCSS entry that
imports it (Vite tracks the Sass dependency graph natively).

---

## Process lock

`tools/lib/process-lock.mjs` writes an atomic `.cache/build.lock` (`open`
with the `wx` flag). Any concurrent `build`, `watch`, `images`, or
`clean` in the same workspace fails immediately with:

```
[HH:MM:SS.mmm] ERROR build: Another assets watch (pid 12345) is already
running for 12s. Stop it with Ctrl+C in that terminal, or run: kill 12345
(force: kill -9 12345) — then retry "build".
```

Stale locks (owner process no longer alive) are detected via
`process.kill(pid, 0)` and cleaned up automatically on the next
acquire. A holder stopped by job control (`Ctrl+Z` / SIGTSTP) is
also reclaimed automatically. On POSIX, `Ctrl+Z` itself is wired to
release the lock and exit — same outcome as `Ctrl+C` — so a suspended
watcher cannot leave the workspace stuck.

---

## Configuration

The **only** knobs live in `build.config.mjs`:

```mjs
export default {
  imageOptimization: {
    jpegQuality: 80,
    pngQuality: 80,
    webpQuality: 80,
    optimizeSvg: true,
  },
};
```

Everything else is fixed contract: entry paths, minification, source
maps, output naming, folder mirroring. Changing them by hacking Vite
or PostCSS config is out of scope — the builder is intentionally
opinionated so it can stay fast and small.

---

## Contract you can rely on

- **Auto-discovery.** Add a file, get an output. Delete a file, the
  output disappears (both build and watch enforce this).
- **Stable output paths.** `src/foo/bar.js` → `dist/js/foo/bar.min.js`.
  No hashes, no chunk splitting, no runtime imports.
- **Always minified.** Watch output shape is identical to production
  output shape.
- **External source maps.** JS `*.map` files always emit; the
  minified file references its map via `sourceMappingURL`.
- **Best-effort images.** A broken source never breaks the build,
  only its dist entry falls back to a copy with a warning.
- **Cross-platform.** Same behaviour on Linux, macOS, Windows —
  chokidar handles the FS watch differences, discovery normalises
  path separators, case collisions error out early.
- **Reproducible.** Two consecutive `npm run build` invocations
  produce byte-identical outputs.

---

## Non-goals

- No dev server, no HMR. The theme is served by WordPress; the
  pipeline only writes files to disk.
- No CDN dependency bundling. External libraries are enqueued from
  WordPress; JS entries here should be self-contained files.
- No PHP integration. `inc/enqueue.php` lives in the parent theme.
- No template/HTML generation.
- No custom build orchestration language — everything is stock
  `node`/`npm`.

---

## Performance budgets

Informational targets, verified by `npm run benchmark`:

| Scenario                       | Budget    |
| ------------------------------ | --------- |
| Cold build (empty dist)        | `≤10s`    |
| Warm rebuild (no source change)| `≤5s`     |
| JS incremental (touch entry)   | `≤300ms`  |
| SCSS incremental (touch entry) | `≤300ms`  |
| Single-image update            | `≤1s`     |

Benchmark runs in `.cache/benchmark/` and never touches `src/` or
`dist/`. It's a self-check, not a hard CI gate; hardware varies too
much for that.

---

## External CI

An external CI (GitHub Actions, GitLab, Jenkins, whatever) should
simply run:

```bash
cd assets
npm ci
npm run ci
```

This runs lint, tests, and a smoke production build. Nothing else is
required and no CI workflow is bundled with the repo — the pipeline
is host-agnostic.

For matrix jobs, cover Node **22** and **24** (both LTS). The build
targets the older baseline (Node 22.12+) but stays green on the
latest Node 24.x release too.

---

## Troubleshooting

**"Another assets X is already running"** — a build/watch/images/clean
is already active in this workspace. Stop it with `Ctrl+C` in that
terminal (or `Ctrl+Z` — both fully stop and release the lock), or
`kill` the pid from the error. If the process is already gone and the
message keeps appearing, the lock file was orphaned across a hard kill
on a system where PID checks failed; `npm run clean` resets the
workspace.

**Image warnings** — the optimizer threw on a specific source. The
build stays green because the file was copied byte-for-byte. Check
`WARN` lines to see which files fell back. Common causes: truncated
images, unsupported SVG features, animated GIFs (expected — GIFs
always copy).

**"Case-insensitive collision"** — two files (e.g. `Main.js` and
`main.js`) would produce the same output on macOS/Windows. Rename one.

**Manifest looks stale** — `npm run clean && npm run build` from
scratch always yields a clean, correct dist. Prefer this over
manually editing `.cache/`.

**Editor sees an old `dist` file** — Vite writes atomically per entry
but not per whole build. If a downstream watcher grabbed a
half-written state, save/touch the source again and it'll refresh.

---

### Directory shortcuts

- `tools/lib/paths.mjs` — every absolute path used by the pipeline.
- `tools/lib/asset-discovery.mjs` — how sources are found.
- `tools/lib/output-mirror.mjs` — how CSS/JS staleness is cleaned up.
- `tools/lib/image-pipeline.mjs` — image optimize + mirror.
- `tools/lib/process-lock.mjs` — cross-process serialisation.
- `tools/lib/vite-config.mjs` — Vite programmatic config factory.
- `tools/scripts/build.mjs` / `tools/scripts/watch.mjs` — orchestration.
- `tools/scripts/benchmark.mjs` — perf sanity check.
- `tools/test/*.test.mjs` — behavioural checks (`node --test`).
