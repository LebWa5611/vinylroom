import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { acquireLock, ownerIsStopped } from '../lib/process-lock.mjs';
import { cleanup, makeTempDir } from './helpers.mjs';
import { hostname } from 'node:os';

test('lock is created and released atomically', async () => {
  const tmp = await makeTempDir();
  try {
    const lockFile = join(tmp, 'build.lock');
    const release = await acquireLock('build', { lockFile });
    assert.equal(existsSync(lockFile), true);
    const payload = JSON.parse(await readFile(lockFile, 'utf8'));
    assert.equal(payload.pid, process.pid);
    assert.equal(payload.kind, 'build');
    await release();
    assert.equal(existsSync(lockFile), false);
  } finally {
    await cleanup(tmp);
  }
});

test('second concurrent lock is rejected with a clear message', async () => {
  const tmp = await makeTempDir();
  try {
    const lockFile = join(tmp, 'build.lock');
    // Impersonate PID 1 (init/launchd). It is always alive from a
    // user process's point of view (kill(1, 0) returns EPERM, which
    // ownerIsAlive() treats as alive), so the lock holder appears
    // real to acquireLock().
    await writeFile(
      lockFile,
      JSON.stringify(
        {
          pid: 1,
          host: 'other-host',
          kind: 'watch',
          startedAt: Date.now(),
        },
        null,
        2
      )
    );
    await assert.rejects(
      () => acquireLock('build', { lockFile }),
      /already running/
    );
  } finally {
    await cleanup(tmp);
  }
});

test('stale lock (dead pid) is swept and re-acquired', async () => {
  const tmp = await makeTempDir();
  try {
    const lockFile = join(tmp, 'build.lock');
    // pid 0 is never a real user process on POSIX and treated as
    // "no such process" by our ownerIsAlive check.
    await writeFile(
      lockFile,
      JSON.stringify(
        { pid: 0, host: 'ghost', kind: 'build', startedAt: 0 },
        null,
        2
      )
    );
    const release = await acquireLock('build', { lockFile });
    const payload = JSON.parse(await readFile(lockFile, 'utf8'));
    assert.equal(payload.pid, process.pid);
    await release();
  } finally {
    await cleanup(tmp);
  }
});

test('conflict message includes kill hint', async () => {
  const tmp = await makeTempDir();
  try {
    const lockFile = join(tmp, 'build.lock');
    await writeFile(
      lockFile,
      JSON.stringify(
        {
          pid: 1,
          host: 'other-host',
          kind: 'watch',
          startedAt: Date.now(),
        },
        null,
        2
      )
    );
    await assert.rejects(
      () => acquireLock('build', { lockFile }),
      /kill 1/
    );
  } finally {
    await cleanup(tmp);
  }
});

test(
  'suspended lock holder is killed and reclaimed',
  { skip: process.platform === 'win32' },
  async () => {
    const tmp = await makeTempDir();
    const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
      stdio: 'ignore',
    });
    try {
      const lockFile = join(tmp, 'build.lock');
      await writeFile(
        lockFile,
        JSON.stringify(
          {
            pid: child.pid,
            host: hostname(),
            kind: 'watch',
            startedAt: Date.now(),
          },
          null,
          2
        )
      );
      process.kill(child.pid, 'SIGSTOP');
      assert.equal(ownerIsStopped(child.pid), true);

      const release = await acquireLock('build', { lockFile });
      const payload = JSON.parse(await readFile(lockFile, 'utf8'));
      assert.equal(payload.pid, process.pid);
      assert.equal(payload.kind, 'build');
      await release();
    } finally {
      try {
        process.kill(child.pid, 'SIGKILL');
      } catch {
        // Already reaped by reclaim path.
      }
      await cleanup(tmp);
    }
  }
);
