/**
 * Cross-process lock for the assets pipeline.
 *
 * Only one `build`, `watch`, `images`, or `clean` command may write
 * to `dist/` and `.cache/` at a time. The lock is a JSON file created
 * with `wx` so the second concurrent process fails immediately.
 *
 * Stale locks (owner process no longer running) are detected via
 * `process.kill(pid, 0)` and cleaned up automatically so a crash
 * doesn't jam the workspace forever.
 *
 * Suspended owners (Ctrl+Z / SIGTSTP, job-control stop) are treated
 * as reclaimable: students often suspend `npm run watch` by accident,
 * then cannot start `build`. We kill the stopped holder and take over.
 *
 * Signal handling: SIGINT, SIGTERM, and (on POSIX) SIGTSTP all release
 * the lock and exit. Installing a SIGTSTP listener also prevents the
 * default suspend behaviour, so Ctrl+Z fully stops instead of parking
 * a live lock holder.
 */

import { execFileSync } from 'node:child_process';
import { mkdir, open, readFile, unlink, writeFile } from 'node:fs/promises';
import { unlinkSync } from 'node:fs';
import { hostname } from 'node:os';
import { dirname } from 'node:path';
import { LOCK_FILE } from './paths.mjs';

/**
 * @typedef {object} LockPayload
 * @property {number} pid
 * @property {string} host
 * @property {string} kind    'build' | 'watch' | 'images' | 'clean' | string
 * @property {number} startedAt
 */

async function readLockPayload(lockFile) {
  try {
    const raw = await readFile(lockFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ownerIsAlive(pid) {
  if (typeof pid !== 'number' || Number.isNaN(pid) || pid <= 0) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    if (err.code === 'ESRCH') {
      return false;
    }
    if (err.code === 'EPERM') {
      // Process exists but we do not own it. Treat as alive.
      return true;
    }
    return false;
  }
}

/**
 * True when the process is stopped by job control (Ctrl+Z) or a
 * debugger. Windows has no SIGTSTP equivalent we can query this way.
 *
 * @param {number} pid
 * @returns {boolean}
 */
export function ownerIsStopped(pid) {
  if (process.platform === 'win32') {
    return false;
  }
  if (typeof pid !== 'number' || Number.isNaN(pid) || pid <= 0) {
    return false;
  }
  try {
    const state = execFileSync('ps', ['-o', 'state=', '-p', String(pid)], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    // T = stopped (job control), t = tracing stop (macOS/BSD).
    return /^[Tt]/.test(state);
  } catch {
    return false;
  }
}

/**
 * Best-effort kill of a stopped lock holder so we can reclaim.
 *
 * @param {number} pid
 */
function killStoppedOwner(pid) {
  try {
    process.kill(pid, 'SIGKILL');
  } catch {
    // Already gone or not ours — acquire will retry either way.
  }
}

async function tryCreateLock(lockFile, kind) {
  const payload = JSON.stringify(
    {
      pid: process.pid,
      host: hostname(),
      kind,
      startedAt: Date.now(),
    },
    null,
    2
  );
  const handle = await open(lockFile, 'wx');
  try {
    await handle.writeFile(payload);
  } finally {
    await handle.close();
  }
}

function conflictMessage(existing, kind) {
  const heldFor = existing.startedAt
    ? Math.round((Date.now() - existing.startedAt) / 1000)
    : null;
  const detail = heldFor === null ? '' : ` for ${heldFor}s`;
  const host =
    existing.host && existing.host !== hostname()
      ? ` on ${existing.host}`
      : '';
  return (
    `Another assets ${existing.kind ?? 'process'} (pid ${existing.pid}${host})` +
    ` is already running${detail}. Stop it with Ctrl+C in that terminal,` +
    ` or run: kill ${existing.pid}` +
    (existing.pid ? `  (force: kill -9 ${existing.pid})` : '') +
    ` — then retry "${kind}".`
  );
}

/**
 * Acquire the lock for `kind`. Throws if another live process holds
 * it. Returns a `release()` function that removes the lock file.
 */
export async function acquireLock(kind, { lockFile = LOCK_FILE } = {}) {
  await mkdir(dirname(lockFile), { recursive: true });

  try {
    await tryCreateLock(lockFile, kind);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }

    const existing = await readLockPayload(lockFile);
    if (existing && ownerIsAlive(existing.pid) && existing.pid !== process.pid) {
      // Ctrl+Z left a suspended holder — reclaim instead of failing.
      if (ownerIsStopped(existing.pid)) {
        killStoppedOwner(existing.pid);
        await unlink(lockFile).catch(() => {});
        await tryCreateLock(lockFile, kind);
      } else {
        throw new Error(conflictMessage(existing, kind), { cause: err });
      }
    } else {
      // Stale lock — sweep and retry once.
      await unlink(lockFile).catch(() => {});
      await tryCreateLock(lockFile, kind);
    }
  }

  let released = false;
  const release = async () => {
    if (released) {
      return;
    }
    released = true;
    await unlink(lockFile).catch(() => {});
  };

  const cleanup = () => {
    if (released) {
      return;
    }
    released = true;
    try {
      // Sync unlink so it runs before the process exits.
      unlinkSync(lockFile);
    } catch {
      // Ignore — best-effort cleanup on exit.
    }
  };

  process.once('exit', cleanup);
  process.once('SIGINT', () => {
    cleanup();
    process.exit(130);
  });
  process.once('SIGTERM', () => {
    cleanup();
    process.exit(143);
  });
  // Ctrl+Z: release the lock and exit instead of suspending. Without
  // this listener Node parks the process while the lock file remains,
  // and the next build/watch fails with a hard-to-recover error.
  if (process.platform !== 'win32') {
    process.once('SIGTSTP', () => {
      cleanup();
      process.exit(130);
    });
  }

  return release;
}

/**
 * Force-remove the lock file. Used by `clean` to unstick a workspace
 * whose watcher crashed hard and left a lock behind on a filesystem
 * where the pid check does not work (e.g. shared-user CI containers).
 */
export async function forceReleaseLock({ lockFile = LOCK_FILE } = {}) {
  await writeFile(lockFile, '', { flag: 'w' }).catch(() => {});
  await unlink(lockFile).catch(() => {});
}
