/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * PID file registry for auth server child processes.
 *
 * Each spawned auth server writes a .pid file keyed by its port. This lets
 * global teardown, signal handlers, and next-run startup reliably clean up
 * orphaned processes that survive --forceExit.
 */

import fs from 'fs';
import path from 'path';

const TMP_DIR = path.resolve(__dirname, '..', '.tmp');

function ensureTmpDir(): void {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }
}

function pidFilePath(port: number): string {
  return path.join(TMP_DIR, `auth_server-${port}.pid`);
}

/** Write a PID file for an auth server on the given port. */
export function registerAuthServerPid(port: number, pid: number): void {
  ensureTmpDir();
  fs.writeFileSync(pidFilePath(port), String(pid));
}

/** Remove the PID file for an auth server on the given port. */
export function unregisterAuthServerPid(port: number): void {
  try {
    fs.unlinkSync(pidFilePath(port));
  } catch {
    // File already removed or never created
  }
}

/** Kill all auth servers tracked by PID files and remove the files. */
export function killAllTrackedAuthServers(): void {
  ensureTmpDir();

  let files: string[];
  try {
    files = fs.readdirSync(TMP_DIR).filter((f) => f.startsWith('auth_server-') && f.endsWith('.pid'));
  } catch {
    return;
  }

  for (const file of files) {
    const filePath = path.join(TMP_DIR, file);
    try {
      const pid = parseInt(fs.readFileSync(filePath, 'utf-8'), 10);
      if (pid) {
        process.kill(pid, 'SIGTERM');
        console.log(`[Process Registry] Killed tracked auth server (PID: ${pid})`);
      }
    } catch {
      // Process already dead or file unreadable
    }
    try {
      fs.unlinkSync(filePath);
    } catch {
      // Already removed
    }
  }
}

