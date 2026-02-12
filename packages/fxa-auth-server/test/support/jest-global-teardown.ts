/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import path from 'path';
import { killAllTrackedAuthServers } from './helpers/test-process-registry';

const AUTH_SERVER_ROOT = path.resolve(__dirname, '../..');
const TMP_DIR = path.join(AUTH_SERVER_ROOT, 'test', 'support', '.tmp');
const MAIL_HELPER_PID_FILE = path.join(TMP_DIR, 'mail_helper.pid');
const SHARED_SERVER_PID_FILE = path.join(TMP_DIR, 'shared_server.pid');
const VERSION_JSON_PATH = path.join(AUTH_SERVER_ROOT, 'config', 'version.json');
const VERSION_JSON_MARKER = path.join(TMP_DIR, 'version_json_created');

interface NodeError extends Error {
  code?: string;
}

function killProcessByPidFile(pidFile: string, label: string): void {
  try {
    if (!fs.existsSync(pidFile)) {
      console.log(`[Jest Global Teardown] No ${label} PID file found`);
      return;
    }

    const pid = parseInt(fs.readFileSync(pidFile, 'utf-8'), 10);

    if (pid) {
      try {
        process.kill(pid, 'SIGTERM');
        console.log(`[Jest Global Teardown] ${label} stopped (PID:`, pid, ')');
      } catch (err: unknown) {
        const isProcessGone = (err as NodeError).code === 'ESRCH';
        if (!isProcessGone) {
          console.error(`[Jest Global Teardown] Error killing ${label}:`, err);
        }
      }
    }

    fs.unlinkSync(pidFile);
  } catch (err) {
    console.error(`[Jest Global Teardown] Error cleaning up ${label}:`, err);
  }

  // Clean up version.json if we created it
  if (fs.existsSync(VERSION_JSON_MARKER)) {
    try { fs.unlinkSync(VERSION_JSON_PATH); } catch { /* ignore */ }
    try { fs.unlinkSync(VERSION_JSON_MARKER); } catch { /* ignore */ }
  }
}

export default async function globalTeardown(): Promise<void> {
  // Kill any remaining auth server processes first
  console.log('[Jest Global Teardown] Cleaning up auth server processes...');
  killAllTrackedAuthServers();

  console.log('[Jest Global Teardown] Stopping shared auth server...');
  killProcessByPidFile(SHARED_SERVER_PID_FILE, 'shared_server');

  // Stop the shared profile helper (in-process Hapi server)
  const sharedProfileHelper = (global as any).__sharedProfileHelper;
  if (sharedProfileHelper) {
    console.log('[Jest Global Teardown] Stopping shared profile helper...');
    try {
      await sharedProfileHelper.close();
    } catch {
      // Ignore cleanup errors
    }
    delete (global as any).__sharedProfileHelper;
  }

  console.log('[Jest Global Teardown] Stopping mail_helper...');
  killProcessByPidFile(MAIL_HELPER_PID_FILE, 'mail_helper');
}
