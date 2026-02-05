/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Jest global setup for integration tests.
 * - Generates auth and OAuth signing keys if they don't exist
 * - Spawns mail_helper as a child process before any tests run
 */

import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const AUTH_SERVER_ROOT = path.resolve(__dirname, '../..');
const MAIL_HELPER_PID_FILE = path.join(AUTH_SERVER_ROOT, 'test', 'support', '.tmp', 'mail_helper.pid');

/**
 * Generate auth and OAuth signing keys if they don't exist.
 * These keys are needed for JWT signing in tests.
 */
function generateKeysIfNeeded(): void {
  const genKeysScript = path.join(AUTH_SERVER_ROOT, 'scripts', 'gen_keys.js');
  const oauthGenKeysScript = path.join(AUTH_SERVER_ROOT, 'scripts', 'oauth_gen_keys.js');

  // Generate auth keys (public-key.json, secret-key.json)
  console.log('[Jest Global Setup] Checking/generating auth keys...');
  try {
    execSync(`node -r esbuild-register ${genKeysScript}`, {
      cwd: AUTH_SERVER_ROOT,
      env: { ...process.env, NODE_ENV: 'dev' },
      stdio: 'inherit',
    });
  } catch (e) {
    // Script exits with error if keys already exist, which is fine
  }

  // Generate OAuth keys (key.json, oldKey.json)
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
  } catch (e) {
    // Script exits with error if keys already exist, which is fine
  }
}

async function waitForMailHelper(): Promise<void> {
  // Simple delay to let mail_helper start
  // The server typically starts in ~2 seconds
  await new Promise(resolve => setTimeout(resolve, 3000));
}

export default async function globalSetup() {
  const printLogs = process.env.MAIL_HELPER_LOGS === 'true';

  // Generate signing keys if they don't exist
  generateKeysIfNeeded();

  console.log('[Jest Global Setup] Starting mail_helper...');

  // Ensure tmp directory exists
  const tmpDir = path.dirname(MAIL_HELPER_PID_FILE);
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  // Spawn mail_helper as child process
  const mailHelperProcess = spawn(
    'node',
    ['-r', 'esbuild-register', path.join(AUTH_SERVER_ROOT, 'test', 'mail_helper.js')],
    {
      cwd: AUTH_SERVER_ROOT,
      env: {
        ...process.env,
        NODE_ENV: 'dev',
        MAILER_HOST: '0.0.0.0',  // Bind to all interfaces for IPv4 compatibility
        MAIL_HELPER_LOGS: printLogs ? 'true' : '',
      },
      stdio: printLogs ? 'inherit' : 'ignore',
      detached: true,
    }
  );

  // Save PID for teardown
  fs.writeFileSync(MAIL_HELPER_PID_FILE, String(mailHelperProcess.pid));

  // Don't let this process keep Jest running
  mailHelperProcess.unref();

  // Wait for mail_helper to be ready
  try {
    await waitForMailHelper();
    console.log('[Jest Global Setup] mail_helper started (PID:', mailHelperProcess.pid, ')');
  } catch (error) {
    console.error('[Jest Global Setup] Failed to start mail_helper:', error);
    mailHelperProcess.kill();
    throw error;
  }
}
