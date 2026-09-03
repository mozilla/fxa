/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Simulator-driven Firefox iOS supplicant for the v2 pairing E2E test.
 *
 * This is deliberately thinner than `AndroidSupplicant`. adb ships uiautomator, so the Android
 * driver can read the screen and tap from outside the app; `simctl` has no equivalent, so the
 * taps and the in-webview assertions live in the XCUITest (`XCUITests/PairingTests`) instead.
 * What stays here is everything that can be driven from outside: the build check, the app
 * lifecycle, delivering the pairing URL, and collecting diagnostics.
 *
 * Delivering the URL uses the app's own custom scheme rather than a QR scan or a universal
 * link. A simulator has no camera, and firefox-ios claims no `applinks` entitlement, so an
 * https pairing URL opens Safari. `firefox://open-url?url=...` reaches the real
 * `RouteBuilder` -> `FxAPairingURLParser` -> `.fxaPairing` path that a scanned v2 QR takes.
 *
 * Set PAIRING_DEBUG=1 for verbose logging.
 */

import { execFileSync, spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

const DEBUG = !!process.env.PAIRING_DEBUG;
const debug = (msg: string) => DEBUG && console.log(`[ios-supplicant] ${msg}`);

/** Fennec is the debug/dev build of Firefox iOS, and the one the test plan builds. */
const DEFAULT_BUNDLE_ID = 'org.mozilla.ios.Fennec';
/** `MOZ_INTERNAL_URL_SCHEME` for the Fennec configuration. */
const DEFAULT_URL_SCHEME = 'fennec';

export interface IOSSupplicantOptions {
  /** Simulator to target. Defaults to whichever device is currently booted. */
  udid?: string;
  projectDir?: string;
  destination?: string;
  bundleId?: string;
  urlScheme?: string;
}

/** Resolves `booted` to a concrete Simulator udid so the destination cannot drift. */
function resolveBootedUdid(udid: string): string {
  if (udid !== 'booted') return udid;
  const out = execFileSync(
    'xcrun',
    ['simctl', 'list', 'devices', 'booted', '-j'],
    {
      encoding: 'utf8',
    }
  );
  const devices = JSON.parse(out).devices as Record<
    string,
    Array<{ udid: string }>
  >;
  const first = Object.values(devices).flat()[0];
  if (!first) throw new Error('No booted iOS Simulator found');
  return first.udid;
}

export class IOSSupplicant {
  private readonly udid: string;
  private readonly projectDir: string;
  private readonly destination: string;
  private readonly bundleId: string;
  private readonly urlScheme: string;
  private xcuitest: ChildProcess | undefined;
  private buildProductsDir: string | undefined;
  private testStarted = false;
  private onTestStart: (() => void) | undefined;

  constructor(options: IOSSupplicantOptions = {}) {
    this.udid = options.udid || process.env.IOS_SIMULATOR_UDID || 'booted';
    this.projectDir =
      options.projectDir ||
      process.env.FIREFOX_IOS_PROJECT_DIR ||
      path.resolve(__dirname, '../../../../firefox-ios');
    // Target the booted Simulator by id. A hardcoded device name silently resolves to
    // "no matching device" whenever a different model is booted, and xcodebuild then
    // reports zero tests run rather than a failure.
    this.destination =
      options.destination ||
      process.env.IOS_DESTINATION ||
      `platform=iOS Simulator,id=${resolveBootedUdid(this.udid)}`;
    this.bundleId =
      options.bundleId || process.env.IOS_BUNDLE_ID || DEFAULT_BUNDLE_ID;
    this.urlScheme = options.urlScheme || DEFAULT_URL_SCHEME;
  }

  /**
   * Path to the prebuilt xctestrun, or undefined when the tests were never built.
   *
   * Scoped to the build directory Xcode derives for `projectDir`. A bare glob over every
   * `Client-*` directory silently picks another checkout's build, so a stale one can pass
   * while the change under test is never exercised. Set IOS_XCTESTRUN to override.
   */
  findXctestrun(): string | undefined {
    if (process.env.IOS_XCTESTRUN) {
      return fs.existsSync(process.env.IOS_XCTESTRUN)
        ? process.env.IOS_XCTESTRUN
        : undefined;
    }
    const buildDir = this.derivedDataProductsDir();
    if (!buildDir) return undefined;
    try {
      const found = fs
        .readdirSync(buildDir)
        .filter(
          (f) => f.includes('SyncIntegration') && f.endsWith('.xctestrun')
        )
        .sort();
      return found.length ? path.join(buildDir, found[0]) : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * The `Build/Products` directory Xcode uses for this project.
   *
   * `-showBuildSettings` is the only way to map a project path to its DerivedData hash, and
   * it is slow, so the answer is cached for the run.
   */
  private derivedDataProductsDir(): string | undefined {
    if (this.buildProductsDir !== undefined)
      return this.buildProductsDir || undefined;
    try {
      const out = execFileSync(
        'xcodebuild',
        [
          '-project',
          path.join(this.projectDir, 'firefox-ios', 'Client.xcodeproj'),
          '-scheme',
          'Fennec',
          '-showBuildSettings',
          '-json',
        ],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      );
      const settings = JSON.parse(out)?.[0]?.buildSettings ?? {};
      const symroot = settings.SYMROOT as string | undefined;
      this.buildProductsDir = symroot ?? '';
      return symroot;
    } catch {
      // Cache the failure so a broken project path does not re-run this for every call.
      this.buildProductsDir = '';
      return undefined;
    }
  }

  /**
   * Reset the app to a signed-out state.
   *
   * A simulator that still holds an account from an earlier run takes a re-auth flow instead
   * of pairing, so the authority waits on a request that never arrives. `PairingTests` also
   * passes `ClearProfile`, but the runner reuses the installed app between runs.
   */
  resetToColdState(): void {
    this.simctl(['terminate', this.udid, this.bundleId], {
      allowFailure: true,
    });
    this.simctl(
      ['privacy', this.udid, 'grant', 'notifications', this.bundleId],
      {
        allowFailure: true,
      }
    );
    debug('reset simulator app state');
  }

  /**
   * The deep link this build answers for a pairing URL. Encoded because the channel
   * credentials live in a fragment, and a raw `#` truncates everything after it.
   */
  deepLinkFor(pairUrl: string): string {
    return `${this.urlScheme}://open-url?url=${encodeURIComponent(pairUrl)}`;
  }

  /** Hand a deep link to the app. */
  openDeepLink(deepLink: string): void {
    this.simctl(['openurl', this.udid, deepLink]);
    debug(`opened ${deepLink.slice(0, 60)}...`);
  }

  /**
   * Start the XCUITest that taps through the supplicant cards.
   *
   * Environment reaches the sandboxed runner only through the xctestrun plist, so it is
   * patched in rather than passed to `xcodebuild`.
   */
  startXCUITest(options: {
    testMethod: string;
    pairingUrl: string;
    customFxAServer: string;
    logPath?: string;
  }): Promise<void> {
    const xctestrun = this.findXctestrun();
    if (!xctestrun) {
      throw new Error(
        'No SyncIntegrationTestPlan .xctestrun found. Build the iOS tests first:\n' +
          `  cd ${this.projectDir}\n` +
          '  xcodebuild build-for-testing -project firefox-ios/Client.xcodeproj -scheme Fennec ' +
          `-testPlan SyncIntegrationTestPlan -destination '${this.destination}'`
      );
    }

    this.patchXctestrun(xctestrun, {
      PAIRING_URL: options.pairingUrl,
      CUSTOM_FXA_SERVER: options.customFxAServer,
    });

    const args = [
      'test-without-building',
      '-xctestrun',
      xctestrun,
      '-destination',
      this.destination,
      `-only-testing:XCUITests/PairingTests/${options.testMethod}`,
    ];

    if (options.logPath) {
      fs.mkdirSync(path.dirname(options.logPath), { recursive: true });
      fs.writeFileSync(
        options.logPath,
        `xcodebuild ${args.join(' ')}\n\n`,
        'utf8'
      );
    }

    this.testStarted = false;
    const proc = spawn('xcodebuild', args, {
      cwd: this.projectDir,
      stdio: 'pipe',
    });
    this.xcuitest = proc;

    let output = '';
    const capture = (chunk: Buffer) => {
      const text = chunk.toString();
      output += text;
      // Neither `Test Case ... started` nor `Launch` means the app can take a URL: the
      // first prints before setUp, and the second when the launch begins. XCUITest logs
      // "Wait for <bundle> to idle" once the scene has settled, which is the real signal;
      // an open delivered before it is dropped.
      if (
        !this.testStarted &&
        output.includes(`Wait for ${this.bundleId} to idle`)
      ) {
        this.testStarted = true;
        this.onTestStart?.();
      }
      if (options.logPath) fs.appendFileSync(options.logPath, text);
      if (DEBUG) process.stdout.write(text);
    };
    proc.stdout?.on('data', capture);
    proc.stderr?.on('data', capture);

    return new Promise<void>((resolve, reject) => {
      proc.on('close', (code) => {
        this.xcuitest = undefined;
        // "Test Suite 'Selected tests' passed" is printed even when the selection matched
        // nothing, so a skipped or misnamed test would otherwise look like a pass. Require
        // that a test actually ran.
        const executed = [...output.matchAll(/Executed (\d+) tests?/g)].some(
          (m) => Number(m[1]) > 0
        );
        if (!executed) {
          reject(
            new Error(
              'XCUITest executed 0 tests. The selection matched nothing: check that ' +
                `${options.testMethod} exists and is not in the test plan's skippedTests.`
            )
          );
          return;
        }
        // xcodebuild reports 65 for infrastructure noise even when every test passed, so the
        // summary line is the authority rather than the exit code.
        const passed = output.includes("Test Suite 'Selected tests' passed");
        if (code === 0 || passed) {
          resolve();
        } else {
          reject(
            new Error(
              `xcodebuild exited with ${code}. Last 800 chars:\n${output.slice(-800)}`
            )
          );
        }
      });
      proc.on('error', (err) =>
        reject(new Error(`Failed to launch xcodebuild: ${err.message}`))
      );
    });
  }

  /**
   * Resolve once the app has settled under XCUITest and can receive a URL.
   *
   * `settleMs` is a short cushion after the idle marker, not a guess at launch time.
   * Falls back to the timeout so a missed marker degrades rather than hanging.
   */
  waitForAppLaunch(timeoutMs = 120_000, settleMs = 3_000): Promise<void> {
    const settle = () => new Promise<void>((r) => setTimeout(r, settleMs));
    if (this.testStarted) return settle();
    return new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        debug('idle marker not seen; delivering anyway');
        this.onTestStart = undefined;
        resolve();
      }, timeoutMs);
      this.onTestStart = () => {
        clearTimeout(timer);
        this.onTestStart = undefined;
        debug(`app idle; settling ${settleMs}ms before delivery`);
        settle().then(resolve);
      };
    });
  }

  /** Capture the simulator screen. Best-effort: diagnostics must never fail a test. */
  screenshot(destPath: string): void {
    try {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      this.simctl(['io', this.udid, 'screenshot', destPath]);
    } catch {
      debug('screenshot failed');
    }
  }

  /** Kill any XCUITest still running, then stop the app. */
  stop(): void {
    if (this.xcuitest && !this.xcuitest.killed) {
      this.xcuitest.kill('SIGTERM');
    }
    this.xcuitest = undefined;
    this.simctl(['terminate', this.udid, this.bundleId], {
      allowFailure: true,
    });
  }

  private patchXctestrun(
    xctestrunPath: string,
    env: Record<string, string>
  ): void {
    const target = 'TestConfigurations:0:TestTargets:0:EnvironmentVariables';
    for (const [key, value] of Object.entries(env)) {
      // Add first, then Set: PlistBuddy has no upsert, and the key may survive a prior run.
      const add = `Add :${target}:${key} string ${JSON.stringify(value)}`;
      const set = `Set :${target}:${key} ${JSON.stringify(value)}`;
      try {
        execFileSync('/usr/libexec/PlistBuddy', ['-c', add, xctestrunPath], {
          stdio: 'pipe',
        });
      } catch {
        execFileSync('/usr/libexec/PlistBuddy', ['-c', set, xctestrunPath], {
          stdio: 'pipe',
        });
      }
    }
    debug(`patched xctestrun with ${Object.keys(env).join(', ')}`);
  }

  private simctl(
    args: string[],
    options: { allowFailure?: boolean } = {}
  ): string {
    try {
      return execFileSync('xcrun', ['simctl', ...args], {
        encoding: 'utf8',
        stdio: 'pipe',
      });
    } catch (err) {
      if (options.allowFailure) return '';
      throw err;
    }
  }
}
