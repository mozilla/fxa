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

const AUTH_SERVER_ROOT = path.resolve(__dirname, '../..');
const MAIL_HELPER_PID_FILE = path.join(AUTH_SERVER_ROOT, 'test', 'support', '.tmp', 'mail_helper.pid');

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

function killExistingMailHelper(): void {
  // Kill any leftover mail_helper from a previous run to avoid port conflicts
  if (fs.existsSync(MAIL_HELPER_PID_FILE)) {
    const oldPid = parseInt(fs.readFileSync(MAIL_HELPER_PID_FILE, 'utf-8'), 10);
    if (oldPid) {
      try {
        process.kill(oldPid, 'SIGTERM');
        console.log('[Jest Global Setup] Killed leftover mail_helper (PID:', oldPid, ')');
      } catch {
        // Process already dead
      }
    }
  }
}

export default async function globalSetup(): Promise<void> {
  const printLogs = process.env.MAIL_HELPER_LOGS === 'true';

  generateKeysIfNeeded();

  console.log('[Jest Global Setup] Starting mail_helper...');

  const tmpDir = path.dirname(MAIL_HELPER_PID_FILE);
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  killExistingMailHelper();

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
}
