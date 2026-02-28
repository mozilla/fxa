/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Firefox Process Manager for Marionette-based testing.
 *
 * Launches Firefox Nightly with --marionette, creates a temp profile
 * with FXA prefs, waits for the Marionette port, and manages cleanup.
 */

import { ChildProcess, execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as net from 'net';
import * as os from 'os';
import * as path from 'path';
import { MarionetteClient } from './marionette';
import { getFirefoxUserPrefs } from './targets/firefoxUserPrefs';
import { TargetName } from './targets';

export type FxaContext = 'fx_desktop_v3' | 'oauth_webchannel_v1';

export interface MarionetteFirefoxOptions {
  /** Path to the Firefox binary */
  firefoxBinary: string;
  /** Marionette TCP port (default: 2828) */
  marionettePort?: number;
  /** Channel server WebSocket URI (default: production wss://channelserver.services.mozilla.com) */
  channelServerUri?: string;
  /** FXA target environment (default: 'local') */
  target?: TargetName;
  /** FXA context — 'oauth_webchannel_v1' for OAuth-based Sync (default) */
  context?: FxaContext;
  /** Show browser window (default: false) */
  headless?: boolean;
}

export class MarionetteFirefox {
  readonly client: MarionetteClient;
  private process: ChildProcess | null = null;
  private profileDir: string | null = null;

  private constructor(client: MarionetteClient) {
    this.client = client;
  }

  /**
   * Launch Firefox with Marionette, create a temp profile, connect, and
   * return a ready-to-use MarionetteFirefox instance.
   */
  static async launch(
    options: MarionetteFirefoxOptions
  ): Promise<MarionetteFirefox> {
    const {
      firefoxBinary,
      marionettePort = 2828,
      channelServerUri = 'wss://channelserver.services.mozilla.com',
      target = 'local',
      context = 'oauth_webchannel_v1',
      headless = true,
    } = options;

    if (!fs.existsSync(firefoxBinary)) {
      throw new Error(`Firefox binary not found at ${firefoxBinary}`);
    }

    // Kill any stale process on the Marionette port (leftover from failed tests)
    killProcessOnPort(marionettePort);

    // Create temp profile with FXA + Marionette prefs
    const profileDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'fx-pairing-test-')
    );
    const prefs = buildPrefs(target, marionettePort, channelServerUri, context);
    writeUserJs(profileDir, prefs);

    // Launch Firefox
    const args = [
      '--marionette',
      '--remote-allow-system-access',
      '--profile',
      profileDir,
      '--no-remote',
    ];
    if (headless) {
      args.push('--headless');
    }

    const proc = spawn(firefoxBinary, args, {
      stdio: 'ignore',
      detached: false,
    });

    try {
      // Wait for Marionette port to become available
      await waitForPort(marionettePort, 30000);

      // Connect client (retry newSession — headed mode needs window to initialize)
      const client = new MarionetteClient('127.0.0.1', marionettePort);
      await client.connect(10, 2000);
      for (let attempt = 0; ; attempt++) {
        try {
          await client.newSession();
          break;
        } catch (e) {
          if (attempt >= 5) throw e;
          // Clean up partial session before retrying
          try { await client.deleteSession(); } catch { /* ignore */ }
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      const instance = new MarionetteFirefox(client);
      instance.process = proc;
      instance.profileDir = profileDir;
      return instance;
    } catch (e) {
      // Clean up spawned process and temp profile on launch failure
      proc.kill('SIGKILL');
      try {
        fs.rmSync(profileDir, { recursive: true, force: true });
      } catch {
        /* best effort */
      }
      throw e;
    }
  }

  /**
   * Clean up: delete session, terminate Firefox, remove temp profile.
   */
  async close(): Promise<void> {
    // Delete Marionette session
    try {
      await this.client.deleteSession();
    } catch {
      // Ignore errors during cleanup
    }
    this.client.close();

    // Terminate Firefox process
    if (this.process) {
      const proc = this.process;
      proc.kill('SIGTERM');

      const exited = new Promise<void>((resolve) =>
        proc.on('exit', () => resolve())
      );
      const timeout = new Promise<void>((resolve) =>
        setTimeout(() => {
          proc.kill('SIGKILL');
          resolve();
        }, 5000)
      );
      await Promise.race([exited, timeout]);
      this.process = null;
    }

    // Clean up temp profile
    if (this.profileDir) {
      try {
        fs.rmSync(this.profileDir, { recursive: true, force: true });
      } catch {
        // Best effort cleanup
      }
      this.profileDir = null;
    }
  }
}

/**
 * Build the full prefs object for a Marionette-enabled Firefox profile.
 * Starts from the standard FXA functional-test prefs and adds
 * Marionette + pairing-specific overrides.
 */
function buildPrefs(
  target: TargetName,
  marionettePort: number,
  channelServerUri: string,
  context: FxaContext
): Record<string, string | number | boolean> {
  // Start with the standard FXA prefs used by functional tests
  const basePrefs = getFirefoxUserPrefs(target, false, context);

  return {
    ...basePrefs,

    // Marionette
    'marionette.enabled': true,
    'marionette.port': marionettePort,

    // Auto-handle unexpected dialogs (dismiss by default)
    'marionette.prefs.recommended': true,

    // Pairing
    'identity.fxaccounts.pairing.enabled': true,
    'identity.fxaccounts.remote.pairing.uri': channelServerUri,

    // Browser chrome — suppress UI that interferes with automation
    'datareporting.policy.dataSubmissionEnabled': false,
    'toolkit.telemetry.reportingpolicy.firstRun': false,
    'browser.shell.checkDefaultBrowser': false,
    'browser.startup.homepage_override.mstone': 'ignore',
    'browser.aboutwelcome.enabled': false,
    'browser.newtabpage.enabled': false,
    'app.update.enabled': false,
    'app.update.auto': false,

    // Suppress password save prompts and other dialogs
    'signon.rememberSignons': false,
    'signon.autofillForms': false,
    'signon.management.page.breach-alerts.enabled': false,
    'dom.disable_beforeunload': true,
    'prompts.contentPromptSubDialog': false,
    'browser.contentblocking.introCount': 99,

    // Allow insecure WebSocket & mixed content for local dev
    'network.websocket.allowInsecureFromHTTPS': true,
    'security.mixed_content.block_active_content': false,
    'security.mixed_content.block_display_content': false,
    'security.mixed_content.upgrade_display_content': false,
  };
}

/**
 * Write a user.js file into the given profile directory.
 */
function writeUserJs(
  profileDir: string,
  prefs: Record<string, string | number | boolean>
): void {
  const lines = Object.entries(prefs).map(
    ([key, value]) => `user_pref("${key}", ${JSON.stringify(value)});`
  );
  fs.writeFileSync(path.join(profileDir, 'user.js'), lines.join('\n') + '\n');
}

/**
 * Wait for a TCP port to become connectable.
 */
async function waitForPort(port: number, timeoutMs: number): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const connected = await tryConnect(port);
    if (connected) return;
    await new Promise((r) => setTimeout(r, 500));
  }

  throw new Error(
    `Marionette port ${port} not available after ${timeoutMs}ms`
  );
}

/**
 * Attempt a single TCP connection to the given port.
 * Returns true on success, false on error or timeout.
 */
function tryConnect(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    sock.setTimeout(2000);
    sock.on('connect', () => { sock.destroy(); resolve(true); });
    sock.on('error', () => { sock.destroy(); resolve(false); });
    sock.on('timeout', () => { sock.destroy(); resolve(false); });
    sock.connect(port, '127.0.0.1');
  });
}

/**
 * Kill any process listening on the given port (stale leftovers from failed tests).
 */
function killProcessOnPort(port: number): void {
  if (!Number.isFinite(port) || port < 1 || port > 65535) return;

  try {
    const output = execSync(`lsof -ti :${port}`, { encoding: 'utf-8' }).trim();
    if (output) {
      for (const pid of output.split('\n')) {
        const parsedPid = parseInt(pid.trim(), 10);
        if (isNaN(parsedPid) || parsedPid <= 0) continue;
        try {
          process.kill(parsedPid, 'SIGKILL');
        } catch {
          // Process may have already exited
        }
      }
    }
  } catch {
    // No process on port — expected
  }
}
