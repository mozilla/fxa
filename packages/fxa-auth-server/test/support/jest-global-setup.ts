/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Jest global setup for integration tests.
 * Generates signing keys if needed and spawns mail_helper before tests run.
 */

import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { killAllTrackedAuthServers } from './helpers/test-process-registry';
import {
  SHARED_SERVER_PORT,
  SHARED_PROFILE_PORT,
  createTempConfig,
  spawnAuthServer,
  waitForServer,
} from './helpers/test-server';
import { createProfileHelper } from './helpers/profile-helper';

const AUTH_SERVER_ROOT = path.resolve(__dirname, '../..');
const TMP_DIR = path.join(AUTH_SERVER_ROOT, 'test', 'support', '.tmp');
const MAIL_HELPER_PID_FILE = path.join(TMP_DIR, 'mail_helper.pid');
const SHARED_SERVER_PID_FILE = path.join(TMP_DIR, 'shared_server.pid');

function generateKeysIfNeeded(): void {
  const genKeysScript = path.join(AUTH_SERVER_ROOT, 'scripts', 'gen_keys.js');
  const oauthGenKeysScript = path.join(AUTH_SERVER_ROOT, 'scripts', 'oauth_gen_keys.js');

  console.log('[Jest Global Setup] Checking/generating auth keys...');
  try {
    execSync(`node -r esbuild-register ${genKeysScript}`, {
      cwd: AUTH_SERVER_ROOT,
      env: { ...process.env, NODE_ENV: 'dev' },
      stdio: 'inherit',
    });
  } catch {
    // Script exits with error if keys already exist
  }

  console.log('[Jest Global Setup] Checking/generating OAuth keys...');
  try {
    execSync(`node -r esbuild-register ${oauthGenKeysScript}`, {
      cwd: AUTH_SERVER_ROOT,
      env: {
        ...process.env,
        NODE_ENV: 'dev',
        FXA_OPENID_UNSAFELY_ALLOW_MISSING_ACTIVE_KEY: 'true',
      },
      stdio: 'inherit',
    });
  } catch {
    // Script exits with error if keys already exist
  }
}

async function waitForMailHelper(port = 9001, maxAttempts = 30, delayMs = 500): Promise<void> {
  // Use DELETE endpoint — GET /mail/{email} blocks until an email arrives
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`http://localhost:${port}/mail/__healthcheck__`, { method: 'DELETE' });
      if (response.ok || response.status === 404) {
        return;
      }
    } catch {
      // Not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  throw new Error(`mail_helper did not become ready after ${maxAttempts} attempts`);
}

function killExistingProcess(pidFile: string, label: string): void {
  if (fs.existsSync(pidFile)) {
    const oldPid = parseInt(fs.readFileSync(pidFile, 'utf-8'), 10);
    if (oldPid) {
      try {
        process.kill(oldPid, 'SIGTERM');
        console.log(`[Jest Global Setup] Killed leftover ${label} (PID:`, oldPid, ')');
      } catch {
        // Process already dead
      }
    }
  }
}

export default async function globalSetup(): Promise<void> {
  const printLogs = process.env.MAIL_HELPER_LOGS === 'true';

  generateKeysIfNeeded();

  // Kill stale auth servers from previous runs before starting new ones
  console.log('[Jest Global Setup] Cleaning up stale auth server processes...');
  killAllTrackedAuthServers();

  console.log('[Jest Global Setup] Starting mail_helper...');

  const tmpDir = path.dirname(MAIL_HELPER_PID_FILE);
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  killExistingProcess(MAIL_HELPER_PID_FILE, 'mail_helper');

  const mailHelperProcess = spawn(
    'node',
    ['-r', 'esbuild-register', path.join(AUTH_SERVER_ROOT, 'test', 'mail_helper.js')],
    {
      cwd: AUTH_SERVER_ROOT,
      env: {
        ...process.env,
        NODE_ENV: 'dev',
        MAILER_HOST: '0.0.0.0',
        MAIL_HELPER_LOGS: printLogs ? 'true' : '',
      },
      stdio: printLogs ? 'inherit' : 'ignore',
      detached: true,
    }
  );

  fs.writeFileSync(MAIL_HELPER_PID_FILE, String(mailHelperProcess.pid));
  mailHelperProcess.unref();

  try {
    await waitForMailHelper();
    console.log('[Jest Global Setup] mail_helper started (PID:', mailHelperProcess.pid, ')');
  } catch (err) {
    console.error('[Jest Global Setup] Failed to start mail_helper:', err);
    mailHelperProcess.kill();
    throw err;
  }

  // Start the shared profile helper for the shared auth server
  console.log('[Jest Global Setup] Starting shared profile helper on port', SHARED_PROFILE_PORT, '...');
  const sharedProfileHelper = await createProfileHelper(SHARED_PROFILE_PORT);
  (global as any).__sharedProfileHelper = sharedProfileHelper;
  console.log('[Jest Global Setup] Shared profile helper started on port', SHARED_PROFILE_PORT);

  // Start the shared auth server for test suites that don't need config overrides
  console.log('[Jest Global Setup] Starting shared auth server on port', SHARED_SERVER_PORT, '...');

  killExistingProcess(SHARED_SERVER_PID_FILE, 'shared_server');

  const sharedPublicUrl = `http://localhost:${SHARED_SERVER_PORT}`;
  const sharedProfileUrl = `http://localhost:${SHARED_PROFILE_PORT}`;
  const sharedPrintLogs = process.env.REMOTE_TEST_LOGS === 'true';
  // Only specify overrides — convict deep-merges these on top of defaults,
  // so we don't need to load the full base config here (which has deps
  // unavailable in the global setup process).
  const sharedOverrides = {
    customsUrl: 'none',
    log: { level: sharedPrintLogs ? 'debug' : 'critical' },
    gleanMetrics: { enabled: false },
    rateLimit: {
      rules: '',
      checkAllEndpoints: false,
      ignoreIPs: ['127.0.0.1', '::1', 'localhost'],
    },
    oauth: { url: sharedPublicUrl },
    oauthServer: {
      audience: sharedPublicUrl,
      browserid: {
        issuer: `localhost:${SHARED_SERVER_PORT}`,
      },
    },
    profileServer: { url: sharedProfileUrl },
  };
  const sharedConfigPath = createTempConfig(sharedOverrides, SHARED_SERVER_PORT);
  const sharedSpawned = spawnAuthServer(SHARED_SERVER_PORT, sharedConfigPath, sharedPrintLogs);

  if (sharedSpawned.process.pid) {
    fs.writeFileSync(SHARED_SERVER_PID_FILE, String(sharedSpawned.process.pid));
  }
  sharedSpawned.process.unref();

  try {
    await waitForServer(sharedPublicUrl);
    console.log('[Jest Global Setup] Shared auth server started (PID:', sharedSpawned.process.pid, ')');
  } catch (err) {
    const stderr = sharedSpawned.stderrChunks.join('');
    sharedSpawned.process.kill();
    if (stderr) {
      console.error(`[Jest Global Setup] Shared server stderr:\n${stderr.slice(-2000)}`);
    }
    throw err;
  }

  // Install signal handlers so Ctrl+C / SIGTERM cleans up all child processes
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  const cleanup = (signal: 'SIGINT' | 'SIGTERM') => {
    console.log(`[Jest Global Setup] ${signal} received, cleaning up...`);
    killAllTrackedAuthServers();
    try {
      mailHelperProcess.kill('SIGTERM');
    } catch {
      // Already dead
    }
    try {
      sharedSpawned.process.kill('SIGTERM');
    } catch {
      // Already dead
    }
    sharedProfileHelper.close().catch(() => {});
    // Re-raise so the process exits with the correct signal code
    process.removeListener(signal, cleanup);
    process.kill(process.pid, signal);
  };
  process.on('SIGINT', () => cleanup('SIGINT'));
  process.on('SIGTERM', () => cleanup('SIGTERM'));
}
