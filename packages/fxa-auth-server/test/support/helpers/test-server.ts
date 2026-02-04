/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Test server helper that spawns the auth server as a child process.
 * This avoids Jest's module system issues with ESM dependencies.
 */

import { spawn, ChildProcess } from 'child_process';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import portfinder from 'portfinder';
import { createMailbox, Mailbox } from './mailbox';
import { createProfileHelper, ProfileHelper } from './profile-helper';

export interface TestServerConfig {
  printLogs?: boolean;
  configOverrides?: Record<string, any>;
}

export interface TestServerInstance {
  config: any;
  mailbox: Mailbox;
  profileServer: ProfileHelper | null;
  publicUrl: string;
  uniqueEmail: (domain?: string) => string;
  uniqueUnicodeEmail: () => string;
  stop: () => Promise<void>;
}

interface AllocatedPorts {
  authServerPort: number;
  profileServerPort: number;
}

const AUTH_SERVER_ROOT = path.resolve(__dirname, '../../..');

/**
 * Find available ports for this test suite.
 */
async function allocatePorts(): Promise<AllocatedPorts> {
  const authServerPort = await portfinder.getPortPromise({ port: 9000 });
  const profileServerPort = await portfinder.getPortPromise({ port: authServerPort + 1 });
  return { authServerPort, profileServerPort };
}

/**
 * Wait for server to be ready by polling the heartbeat endpoint.
 */
async function waitForServer(url: string, maxAttempts = 30, delayMs = 1000): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${url}/__heartbeat__`);
      if (response.ok) {
        return;
      }
    } catch (e) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  throw new Error(`Server at ${url} did not become ready after ${maxAttempts} attempts`);
}

/**
 * Create a temporary config file with overrides.
 */
function createTempConfig(baseConfig: any, overrides: Record<string, any>, port: number): string {
  const config = {
    ...overrides,
    listen: { host: '127.0.0.1', port },
    publicUrl: `http://localhost:${port}`,
  };

  const tempDir = path.join(AUTH_SERVER_ROOT, 'test', 'support', '.tmp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const configPath = path.join(tempDir, `config-${port}.json`);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return configPath;
}

/**
 * Spawn the auth server as a child process.
 */
function spawnAuthServer(
  port: number,
  configPath: string,
  printLogs: boolean
): ChildProcess {
  const env = {
    ...process.env,
    NODE_ENV: 'dev',
    CONFIG_FILES: configPath,
    PORT: String(port),
    IP_ADDRESS: '127.0.0.1',
    PUBLIC_URL: `http://localhost:${port}`,
  };

  const serverProcess = spawn(
    'node',
    ['-r', 'esbuild-register', path.join(AUTH_SERVER_ROOT, 'bin', 'key_server.js')],
    {
      cwd: AUTH_SERVER_ROOT,
      env,
      stdio: printLogs ? 'inherit' : 'pipe',
    }
  );

  // Always capture stderr for error reporting
  let stderrBuffer = '';
  if (serverProcess.stderr) {
    serverProcess.stderr.on('data', (data) => {
      const msg = data.toString();
      stderrBuffer += msg;
      if (printLogs) {
        process.stderr.write(msg);
      } else if (msg.includes('EADDRINUSE') || msg.includes('fatal') || msg.includes('Error') || msg.includes('error')) {
        console.error('[Server stderr]', msg);
      }
    });
  }

  // Capture stdout for debugging if not printing
  let stdoutBuffer = '';
  if (!printLogs && serverProcess.stdout) {
    serverProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      stdoutBuffer += msg;
      // Look for ERROR level logs
      if (msg.includes('[ERROR]') || msg.includes('ERROR')) {
        console.error('[Server ERROR]', msg);
      }
    });
  }

  return serverProcess;
}

/**
 * Create a test server instance for a test suite.
 * Each suite gets its own server on dynamically allocated ports.
 */
export async function createTestServer(
  options: TestServerConfig = {}
): Promise<TestServerInstance> {
  const {
    printLogs = process.env.REMOTE_TEST_LOGS === 'true',
    configOverrides = {},
  } = options;

  // Allocate unique ports for this suite
  const ports = await allocatePorts();
  const publicUrl = `http://localhost:${ports.authServerPort}`;

  // Load base config to get smtp settings
  const baseConfigPath = require.resolve('../../../config');
  delete require.cache[baseConfigPath];
  const baseConfig = require('../../../config').default.getProperties();

  // Start profile helper BEFORE auth server so we can pass its URL
  let profileServer: ProfileHelper | null = null;
  const profileServerUrl = `http://localhost:${ports.profileServerPort}`;
  if (baseConfig.profileServer?.url) {
    profileServer = await createProfileHelper(ports.profileServerPort);
  }

  // Create temp config file with overrides, including profile server URL
  // Also disable customs/rate limiting for tests
  const fullOverrides = {
    ...configOverrides,
    customsUrl: 'none',
    rateLimit: {
      ...baseConfig.rateLimit,
      checkAllEndpoints: false,
      // Ignore localhost IPs for rate limiting in tests
      ignoreIPs: ['127.0.0.1', '::1', 'localhost'],
    },
    profileServer: {
      ...baseConfig.profileServer,
      url: profileServerUrl,
    },
  };
  const configPath = createTempConfig(baseConfig, fullOverrides, ports.authServerPort);

  // Create mailbox helper (connects to shared mail_helper HTTP API)
  const mailbox = createMailbox(
    baseConfig.smtp?.api?.host || 'localhost',
    baseConfig.smtp?.api?.port || 9001,
    printLogs
  );

  // Spawn the auth server
  const serverProcess = spawnAuthServer(ports.authServerPort, configPath, printLogs);

  // Wait for server to be ready
  try {
    await waitForServer(publicUrl);
  } catch (e) {
    serverProcess.kill();
    if (profileServer) {
      await profileServer.close();
    }
    throw e;
  }

  const instance: TestServerInstance = {
    config: {
      ...baseConfig,
      ...configOverrides,
      publicUrl,
      listen: { host: '127.0.0.1', port: ports.authServerPort },
    },
    mailbox,
    profileServer,
    publicUrl,
    uniqueEmail: (domain = '@restmail.net') => {
      const base = crypto.randomBytes(10).toString('hex');
      return `${base}${domain}`;
    },
    uniqueUnicodeEmail: () => {
      return `${crypto.randomBytes(10).toString('hex')}${String.fromCharCode(1234)}@${String.fromCharCode(5678)}restmail.net`;
    },
    stop: async () => {
      // Kill server process
      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill('SIGTERM');
        // Wait a bit for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!serverProcess.killed) {
          serverProcess.kill('SIGKILL');
        }
      }

      // Stop profile server
      if (profileServer) {
        await profileServer.close();
      }

      // Clean up temp config
      try {
        fs.unlinkSync(configPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    },
  };

  return instance;
}
