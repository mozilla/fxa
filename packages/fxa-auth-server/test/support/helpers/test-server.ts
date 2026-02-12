/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Test server helper that spawns the auth server as a child process.
 */

import { spawn, ChildProcess } from 'child_process';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import net from 'net';
import { createMailbox, Mailbox } from './mailbox';
import { createProfileHelper, ProfileHelper } from './profile-helper';

export interface TestServerConfig {
  printLogs?: boolean;
  configOverrides?: Record<string, unknown>;
}

export interface TestServerInstance {
  config: Record<string, unknown>;
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

function getAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    let port = startPort;
    const maxPort = startPort + 99;

    function tryPort() {
      if (port > maxPort) {
        reject(new Error(`No available port found in range ${startPort}-${maxPort}`));
        return;
      }
      const srv = net.createServer();
      srv.listen(port, '0.0.0.0', () => {
        const bound = (srv.address() as net.AddressInfo).port;
        srv.close(() => resolve(bound));
      });
      srv.on('error', () => {
        port++;
        tryPort();
      });
    }

    tryPort();
  });
}

async function allocatePorts(): Promise<AllocatedPorts> {
  // Use JEST_WORKER_ID to give each worker its own port range,
  // avoiding TOCTOU races when workers run in parallel.
  const workerId = parseInt(process.env.JEST_WORKER_ID || '1', 10);
  // Start at 9100 to avoid conflicts with standard infrastructure ports
  // (9000 = auth-server, 9001 = mail_helper, etc.)
  const basePort = 9100 + (workerId - 1) * 100;
  const authServerPort = await getAvailablePort(basePort);
  const profileServerPort = await getAvailablePort(authServerPort + 1);
  return { authServerPort, profileServerPort };
}

async function waitForServer(url: string, maxAttempts = 30, delayMs = 1000): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${url}/__heartbeat__`);
      if (response.ok) {
        // Allow async initialization to settle after heartbeat passes
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  throw new Error(`Server at ${url} did not become ready after ${maxAttempts} attempts`);
}

function createTempConfig(overrides: Record<string, unknown>, port: number): string {
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
    LOG_LEVEL: printLogs ? 'info' : 'error',
    AUTH_GLEAN_ENABLED: 'false',
    NODE_NO_WARNINGS: printLogs ? '' : '1',
  };

  const serverProcess = spawn(
    'node',
    ['-r', 'esbuild-register', path.join(AUTH_SERVER_ROOT, 'bin', 'key_server.js')],
    {
      cwd: AUTH_SERVER_ROOT,
      env,
      stdio: printLogs ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    }
  );

  // Consume piped streams to prevent backpressure from stalling the server.
  // stdout must be piped (not ignored) to avoid EPIPE → log error → shutdown
  // in key_server.js.
  if (!printLogs) {
    serverProcess.stdout?.resume();
    serverProcess.stderr?.resume();
  }

  return serverProcess;
}

export async function createTestServer(
  options: TestServerConfig = {}
): Promise<TestServerInstance> {
  const {
    printLogs = process.env.REMOTE_TEST_LOGS === 'true',
    configOverrides = {},
  } = options;

  const ports = await allocatePorts();
  const publicUrl = `http://localhost:${ports.authServerPort}`;

  const baseConfigPath = require.resolve('../../../config');
  delete require.cache[baseConfigPath];
  const baseConfig = require('../../../config').default.getProperties();

  let profileServer: ProfileHelper | null = null;
  const profileServerUrl = `http://localhost:${ports.profileServerPort}`;
  if (baseConfig.profileServer?.url) {
    profileServer = await createProfileHelper(ports.profileServerPort);
  }

  const fullOverrides = {
    ...configOverrides,
    customsUrl: 'none',
    log: {
      ...baseConfig.log,
      level: printLogs ? 'debug' : 'critical',
    },
    gleanMetrics: {
      ...baseConfig.gleanMetrics,
      enabled: false,
    },
    rateLimit: {
      ...baseConfig.rateLimit,
      rules: '',
      checkAllEndpoints: false,
      ignoreIPs: ['127.0.0.1', '::1', 'localhost'],
    },
    oauth: {
      ...baseConfig.oauth,
      url: publicUrl,
    },
    oauthServer: {
      audience: publicUrl,
      browserid: {
        issuer: `localhost:${ports.authServerPort}`,
      },
    },
    profileServer: {
      ...baseConfig.profileServer,
      url: profileServerUrl,
    },
  };
  const configPath = createTempConfig(fullOverrides, ports.authServerPort);

  const mailbox = createMailbox(
    baseConfig.smtp?.api?.host || 'localhost',
    baseConfig.smtp?.api?.port || 9001,
    printLogs
  );

  const serverProcess = spawnAuthServer(ports.authServerPort, configPath, printLogs);

  try {
    await waitForServer(publicUrl);
  } catch (err) {
    serverProcess.kill();
    if (profileServer) {
      await profileServer.close();
    }
    throw err;
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
      return `${crypto.randomBytes(10).toString('hex')}${domain}`;
    },
    uniqueUnicodeEmail: () => {
      return `${crypto.randomBytes(10).toString('hex')}${String.fromCharCode(1234)}@${String.fromCharCode(5678)}restmail.net`;
    },
    stop: async () => {
      if (serverProcess && !serverProcess.killed) {
        const exitPromise = new Promise<void>((resolve) => {
          serverProcess.on('exit', () => resolve());
        });
        serverProcess.kill('SIGTERM');
        const timeout = new Promise<void>((resolve) =>
          setTimeout(resolve, 5000)
        );
        await Promise.race([exitPromise, timeout]);
        if (!serverProcess.killed) {
          serverProcess.kill('SIGKILL');
        }
      }

      if (profileServer) {
        await profileServer.close();
      }

      try {
        fs.unlinkSync(configPath);
      } catch {
        // Ignore cleanup errors
      }
    },
  };

  return instance;
}
