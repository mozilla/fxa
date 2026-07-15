/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * adb-driven Fenix (Firefox for Android) supplicant driver for pairing E2E tests.
 *
 * This is the Android analog of the iOS XCUITest supplicant in
 * `pairingFlowiOS.spec.ts`. Where iOS drives Firefox iOS via XCUITest, here we
 * drive the Fenix *debug* build via `adb`:
 *
 *   1. Point Fenix's FxA server override at the target content server (local,
 *      stage, or prod — whatever `contentServerUrl` is passed).
 *   2. Inject the pairing URL into the Sync Debug "Pairing (debug)" hook.
 *   3. Cold-start the app and navigate Settings -> Sync Debug -> Begin pairing.
 *   4. That invokes `beginPairingAuthentication`, which runs the supplicant
 *      OAuth/pairing flow in a custom tab and connects to the channel server.
 *
 * The Sync Debug pairing hook is a debug-only addition to Fenix
 * (`SyncDebugFragment.setupPairingPreferences`). See the pairing test docs
 * (`docs/pairing/README.md`) for setup and build instructions.
 *
 * Prerequisites:
 *   - An Android emulator/device visible to `adb` (ANDROID_SERIAL to target one).
 *   - The Fenix debug build with the pairing hook installed
 *     (org.mozilla.fenix.debug).
 *   - For the local target only: `adb reverse` (yarn adb-reverse) so the
 *     emulator's localhost reaches the host stack, plus the localhost
 *     fxawebchannel manifest match. Stage/prod are reached over the network and
 *     are already in the stock webchannel allowlist.
 *
 * Set ANDROID_PAIRING_DEBUG=1 for verbose logging.
 */

import { execFileSync } from 'child_process';
import { writeFileSync } from 'fs';

const DEBUG = !!process.env.ANDROID_PAIRING_DEBUG;
const debug = (msg: string) =>
  DEBUG && console.log(`[android-supplicant] ${msg}`);

/** Default Fenix debug application id. */
const DEFAULT_PACKAGE = 'org.mozilla.fenix.debug';
const HOME_ACTIVITY = 'org.mozilla.fenix.HomeActivity';
/**
 * Deep-link scheme for the debug build (BuildConfig.DEEP_LINK_SCHEME defaults to
 * "fenix-dev"). `fenix-dev://settings` jumps straight to Settings, which is far
 * more robust than navigating the home menu (the home screen has several
 * "More options" buttons that collide with text matching).
 */
const DEEP_LINK_SCHEME = process.env.ANDROID_DEEP_LINK_SCHEME || 'fenix-dev';

/**
 * SharedPreferences file that `Settings` reads (getSharedPreferences("fenix_preferences")).
 * The FxA server override (`pref_key_override_fxa_server`) lives here.
 */
const FENIX_PREFERENCES = 'fenix_preferences.xml';
/**
 * Default PreferenceManager file. SyncDebugFragment does NOT set
 * sharedPreferencesName, so its EditTextPreferences (including the pairing URL,
 * read via `pref.text`) persist here, NOT in fenix_preferences.xml.
 */
const DEFAULT_PREFERENCES = `${DEFAULT_PACKAGE}_preferences.xml`;

const KEY_OVERRIDE_FXA_SERVER = 'pref_key_override_fxa_server';
const KEY_PAIRING_URL = 'pref_key_sync_debug_pairing_url';

interface UiNode {
  text: string;
  desc: string;
  cx: number;
  cy: number;
}

interface AndroidSupplicantOptions {
  packageName?: string;
  serial?: string;
}

export class AndroidSupplicant {
  private readonly pkg: string;
  private readonly serial?: string;
  private cachedSize?: { width: number; height: number };

  constructor(opts: AndroidSupplicantOptions = {}) {
    this.pkg = opts.packageName || DEFAULT_PACKAGE;
    this.serial = opts.serial || process.env.ANDROID_SERIAL || undefined;
  }

  /** Prepend `-s <serial>` when a specific device is targeted. */
  private argv(args: string[]): string[] {
    return this.serial ? ['-s', this.serial, ...args] : args;
  }

  private adb(args: string[], input?: string): string {
    try {
      return execFileSync('adb', this.argv(args), {
        encoding: 'utf8',
        input,
        maxBuffer: 32 * 1024 * 1024,
      });
    } catch (e) {
      const err = e as { stderr?: string; message?: string };
      throw new Error(
        `adb ${args.join(' ')} failed: ${err.stderr || err.message || e}`
      );
    }
  }

  /**
   * Run a command inside the app sandbox via run-as. `adb shell` re-tokenizes
   * argv on the device, so the whole device command is sent as ONE string with
   * device-side quoting to preserve arg boundaries and redirects. shellCmd must
   * not contain double quotes.
   */
  private runAs(shellCmd: string, input?: string): string {
    return this.adb(['shell', `run-as ${this.pkg} sh -c "${shellCmd}"`], input);
  }

  private tap(x: number, y: number): void {
    this.adb(['shell', 'input', 'tap', String(x), String(y)]);
  }

  private swipe(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    durationMs: number
  ): void {
    const coords = [x1, y1, x2, y2, durationMs].map((n) =>
      String(Math.round(n))
    );
    this.adb(['shell', 'input', 'swipe', ...coords]);
  }

  /** Effective screen size (Override if set, else Physical); cached. */
  private screenSize(): { width: number; height: number } {
    if (this.cachedSize) return this.cachedSize;
    // `wm size` prints "Physical size: WxH" and, when scaled, "Override size: WxH".
    const out = this.adb(['shell', 'wm', 'size']);
    const lines = out.split('\n');
    const line =
      lines.find((l) => l.includes('Override size:')) ??
      lines.find((l) => l.includes('Physical size:')) ??
      '';
    const m = line.match(/(\d+)x(\d+)/);
    this.cachedSize = m
      ? { width: Number(m[1]), height: Number(m[2]) }
      : { width: 1080, height: 2400 };
    return this.cachedSize;
  }

  /** Scroll the list up to reveal items lower on the screen. */
  private scrollToReveal(): void {
    const { width, height } = this.screenSize();
    this.swipe(width / 2, height * 0.75, width / 2, height * 0.25, 300);
  }

  /** A tiny scroll to nudge GeckoView into repopulating its a11y tree. */
  private nudgeAccessibility(): void {
    const { width, height } = this.screenSize();
    this.swipe(width / 2, height * 0.5, width / 2, height * 0.48, 100);
  }

  /**
   * Verify a device is attached and the Fenix debug build is installed. Grants
   * camera/notification permissions and points the FxA server override at the
   * given content server. Cold-starts once so the prefs files exist.
   */
  async ensureReady(contentServerUrl: string): Promise<void> {
    const devices = this.adb(['devices'])
      .split('\n')
      .slice(1)
      .filter((l) => /\tdevice$/.test(l));
    if (devices.length === 0) {
      throw new Error(
        'No adb device found. Boot an emulator and ensure `adb devices` lists it.'
      );
    }

    const installed = this.adb(['shell', 'pm', 'list', 'packages', this.pkg]);
    if (!installed.includes(this.pkg)) {
      throw new Error(
        `${this.pkg} is not installed. Build + install the Fenix debug build ` +
          `with the Sync Debug pairing hook (see docs/pairing/README.md).`
      );
    }

    // Best-effort permission grants (ignore failures for already-granted).
    for (const perm of [
      'android.permission.CAMERA',
      'android.permission.POST_NOTIFICATIONS',
    ]) {
      try {
        this.adb(['shell', 'pm', 'grant', this.pkg, perm]);
      } catch {
        /* already granted or not requestable */
      }
    }

    // Launch once so the prefs files are created, then stop before editing.
    this.launchHome();
    await this.waitForProcess(30_000);
    await sleep(3_000);
    this.forceStop();

    this.setPrefString(
      FENIX_PREFERENCES,
      KEY_OVERRIDE_FXA_SERVER,
      contentServerUrl
    );
    debug(`FxA server override set to ${contentServerUrl}`);
  }

  /**
   * Inject the pairing URL (the raw QR value: .../pair#channel_id=...&channel_key=...)
   * into the Sync Debug pairing hook. App must be stopped first so in-memory
   * prefs don't overwrite the file; caller cold-starts afterwards.
   */
  injectPairingUrl(pairingUrl: string): void {
    this.forceStop();
    this.setPrefString(DEFAULT_PREFERENCES, KEY_PAIRING_URL, pairingUrl);
    debug(`Injected pairing URL into ${DEFAULT_PREFERENCES}`);
  }

  /**
   * Cold-start the app and drive Settings -> Sync Debug -> Begin pairing, then
   * wait until `beginPairingAuthentication` fires with our URL (proving the
   * supplicant reached app-services and started connecting to the channel).
   *
   * Returns the pairing URL as seen in logcat's BeginPairingFlow event.
   */
  async beginPairing(timeoutMs = 60_000): Promise<string> {
    this.adb(['logcat', '-c']);
    await this.openSyncDebug();
    await this.tapByText(/^Begin pairing$/, { scroll: true });

    const seen = await this.waitForLog(
      /BeginPairingFlow\(pairingUrl=\S/,
      timeoutMs
    );
    const match = seen.match(/BeginPairingFlow\(pairingUrl=([^,)]*)/);
    const url = match ? match[1] : '';
    debug(`Supplicant started pairing with URL: ${url}`);
    return url;
  }

  /**
   * Wait until the supplicant custom tab has loaded its pairing page and is
   * connecting to the channel. Distinguishes the real pairing flow (/pair/supp
   * or a pairing authorization URL) from the FXA-13611 email fallback that a
   * failed/dead channel would trigger.
   */
  async waitForSupplicantOnChannel(timeoutMs = 45_000): Promise<string> {
    // Wait until the supplicant opens its pairing web flow (custom tab / the
    // /pair/supp page), i.e. it is connecting to the channel server. Approving
    // too early races the channel handshake, so we then settle before the
    // authority approves.
    const line = await this.waitForLog(
      /url=[^,]*\/pair\/supp|AddCustomTabAction/,
      timeoutMs
    );
    debug(`Supplicant opened its pairing flow: ${line.slice(0, 120)}`);
    await sleep(12_000); // settle the channel websocket
    return line;
  }

  /**
   * Tap the supplicant's own "Confirm pairing" button on the /pair/supp/allow
   * screen inside the custom tab. Pairing needs BOTH sides to confirm: the
   * authority approves the new device, then the supplicant confirms here.
   * (uiautomator can read GeckoView web content.)
   */
  async confirmPairing(timeoutMs = 45_000): Promise<void> {
    // The confirm button lives in GeckoView web content, read via uiautomator's
    // accessibility tree — which GeckoView populates lazily, so a dump can miss
    // it transiently. Poll, and periodically nudge the page with a tiny scroll
    // to force the a11y tree to repopulate.
    const re = /^Confirm pairing$|^Confirm$/i;
    const deadline = Date.now() + timeoutMs;
    let attempt = 0;
    while (Date.now() < deadline) {
      const node = this.dumpUi().find(
        (n) => re.test(n.text) || re.test(n.desc)
      );
      if (node) {
        this.tap(node.cx, node.cy);
        debug('Supplicant confirmed pairing');
        return;
      }
      if (attempt % 3 === 2) {
        this.nudgeAccessibility();
      }
      attempt++;
      await sleep(1_500);
    }
    throw new Error('Supplicant Confirm pairing button not found');
  }

  /** Close the pairing custom tab (used by the cancel/negative case). */
  cancel(): void {
    // Back dismisses the custom tab; a second Back returns Home.
    this.adb(['shell', 'input', 'keyevent', '4']);
    this.adb(['shell', 'input', 'keyevent', '4']);
    debug('Closed pairing custom tab (cancel)');
  }

  /** Force-stop the app; safe to call between tests. */
  forceStop(): void {
    try {
      this.adb(['shell', 'am', 'force-stop', this.pkg]);
    } catch {
      /* ignore */
    }
  }

  /** Grab a screenshot to a local path for diagnostics. */
  screenshot(localPath: string): void {
    const png = execFileSync(
      'adb',
      this.argv(['exec-out', 'screencap', '-p']),
      {
        maxBuffer: 64 * 1024 * 1024,
      }
    );
    writeFileSync(localPath, png);
  }

  /** Recent logcat, for attaching to test output on failure. */
  dumpLogcat(): string {
    try {
      return this.adb(['logcat', '-d']);
    } catch {
      return '';
    }
  }

  private setPrefString(prefsFile: string, key: string, value: string): void {
    const remote = `shared_prefs/${prefsFile}`;
    let xml: string;
    try {
      xml = this.adb(['exec-out', 'run-as', this.pkg, 'cat', remote]);
    } catch {
      xml = '';
    }
    if (!xml.includes('<map')) {
      xml =
        "<?xml version='1.0' encoding='utf-8' standalone='yes' ?>\n<map>\n</map>\n";
    }
    // Fenix writes prefs lazily, so shared_prefs/ may not exist yet on a
    // freshly-launched app; the `>` redirect below needs the directory present.
    this.runAs('mkdir -p shared_prefs');
    // Remove any existing entry for this key, then insert before </map>.
    const keyRe = new RegExp(
      `\\s*<string name="${key}">[\\s\\S]*?</string>`,
      'g'
    );
    xml = xml.replace(keyRe, '');
    const entry = `    <string name="${key}">${xmlEscape(value)}</string>\n`;
    xml = xml.replace('</map>', `${entry}</map>`);

    // base64 over stdin avoids adb-shell CRLF translation corrupting the XML.
    const b64 = Buffer.from(xml, 'utf8').toString('base64');
    this.runAs(`base64 -d > ${remote}`, b64);
  }

  private launchHome(): void {
    this.adb(['shell', 'am', 'start', '-n', `${this.pkg}/${HOME_ACTIVITY}`]);
  }

  private async waitForProcess(timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      // `pidof` exits non-zero when no process matches; treat that as "not yet".
      let pid = '';
      try {
        pid = this.adb(['shell', 'pidof', this.pkg]).trim();
      } catch {
        pid = '';
      }
      if (pid) return;
      await sleep(1_000);
    }
    throw new Error(`${this.pkg} did not start within ${timeoutMs}ms`);
  }

  /**
   * Cold-start into the Sync Debug preference screen via a deep link. The Sync
   * Debug entry is always visible on debug builds (isDebugMenuPersistentlyRevealed
   * defaults to Config.channel.isDebug).
   */
  private async openSyncDebug(): Promise<void> {
    this.adb([
      'shell',
      'am',
      'start',
      '-a',
      'android.intent.action.VIEW',
      '-d',
      `${DEEP_LINK_SCHEME}://settings`,
      this.pkg,
    ]);
    await this.waitForProcess(30_000);
    await sleep(6_000); // Settings screen + first-run init
    this.dismissBlockingDialogs();
    await this.tapByText(/^Sync Debug$/, { scroll: true });
    await sleep(1_500);
  }

  /** Dismiss known startup dialogs that can steal taps (may be stacked). */
  private dismissBlockingDialogs(): void {
    const dismissers = [
      /^Cancel$/, // "Set as default browser" dialog
      /^Don.t allow$/, // notification permission (straight or curly apostrophe)
      /^CLOSE$/, // crash report dialog
      /^Not now$/,
    ];
    for (let pass = 0; pass < 3; pass++) {
      const nodes = this.dumpUi();
      const hit = nodes.find((n) => dismissers.some((re) => re.test(n.text)));
      if (!hit) return;
      this.tap(hit.cx, hit.cy);
      debug(`Dismissed dialog button: ${hit.text}`);
    }
  }

  /** Poll the UI (re-dumping) until an element matches, then tap it. */
  private async waitAndTap(re: RegExp, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const node = this.dumpUi().find(
        (n) => re.test(n.text) || re.test(n.desc)
      );
      if (node) {
        this.tap(node.cx, node.cy);
        return;
      }
      await sleep(1_500);
    }
    throw new Error(`Timed out waiting for UI element matching ${re}`);
  }

  private async tapByText(
    re: RegExp,
    opts: { scroll?: boolean; byDesc?: boolean } = {}
  ): Promise<void> {
    const maxScrolls = opts.scroll ? 6 : 0;
    for (let attempt = 0; attempt <= maxScrolls; attempt++) {
      const nodes = this.dumpUi();
      const node = nodes.find((n) => re.test(opts.byDesc ? n.desc : n.text));
      if (node) {
        this.tap(node.cx, node.cy);
        return;
      }
      if (attempt < maxScrolls) {
        this.scrollToReveal();
        await sleep(700);
      }
    }
    throw new Error(`Could not find UI element matching ${re}`);
  }

  private dumpUi(): UiNode[] {
    this.adb(['shell', 'uiautomator', 'dump', '/sdcard/ui.xml']);
    const xml = this.adb(['exec-out', 'cat', '/sdcard/ui.xml']);
    const nodes: UiNode[] = [];
    const nodeRe = /<node[^>]*\/?>/g;
    let m: RegExpExecArray | null;
    while ((m = nodeRe.exec(xml)) !== null) {
      const tag = m[0];
      const text = attr(tag, 'text');
      const desc = attr(tag, 'content-desc');
      const bounds = attr(tag, 'bounds');
      const b = bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
      if (!b) continue;
      const cx = Math.floor((Number(b[1]) + Number(b[3])) / 2);
      const cy = Math.floor((Number(b[2]) + Number(b[4])) / 2);
      nodes.push({ text, desc, cx, cy });
    }
    return nodes;
  }

  private async waitForLog(re: RegExp, timeoutMs: number): Promise<string> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const log = this.adb(['logcat', '-d']);
      const line = log.split('\n').find((l) => re.test(l));
      if (line) return line;
      await sleep(2_000);
    }
    throw new Error(`Timed out waiting for logcat line matching ${re}`);
  }
}

function attr(tag: string, name: string): string {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m ? decodeXml(m[1]) : '';
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
