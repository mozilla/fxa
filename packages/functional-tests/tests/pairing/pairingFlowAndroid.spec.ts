/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Android (Fenix) pairing flow E2E test.
 *
 * Coordinates Marionette (authority / desktop Firefox) with an Android emulator
 * (supplicant / Firefox for Android) to exercise the full cross-device pairing
 * flow. This is the Android counterpart of `pairingFlowiOS.spec.ts`; instead of
 * XCUITest, the supplicant is driven over `adb` (see `lib/android-supplicant.ts`).
 *
 *   Authority (Marionette)          Supplicant (Android emulator)
 *   ---------------------           -----------------------------
 *   1. Sign in to FxA via OAuth
 *   2. FxAccountsPairingFlow.start()
 *      -> generates QR URL
 *                                   3. adb injects PAIRING_URL into the
 *                                      Sync Debug "Pairing (debug)" hook
 *                                   4. adb navigates Settings -> Sync Debug
 *                                      -> Begin pairing
 *                                   5. beginPairingAuthentication runs the
 *                                      supplicant flow in a custom tab
 *   6. Navigate to approval page
 *   7. Click "Yes, approve device"
 *                                   8. OAuth completes -> device registered
 *
 * Prerequisites:
 *   - FXA stack running (auth :9000, content :3030) and `yarn adb-reverse` run
 *     so the emulator's localhost reaches the host stack.
 *   - Android emulator booted and visible to `adb` (ANDROID_SERIAL to target).
 *   - Fenix debug build with the Sync Debug pairing hook installed
 *     (org.mozilla.fenix.debug). See docs/pairing/README.md.
 *
 * Set ANDROID_PAIRING_ENABLED=1 to run. ANDROID_PAIRING_DEBUG=1 for verbose logs.
 */

import fs from 'fs';
import { test, expect } from '../../lib/fixtures/pairing';
import {
  signInAuthorityViaMarionette,
  getSignedInUser,
  startPairingFlow,
  buildAuthorityOAuthUrl,
  extractChannelId,
  findElementBySelectors,
  isPairRoutesReact,
  waitForUrlContaining,
  sleep,
} from '../../lib/pairing-helpers';
import { SELECTORS } from '../../lib/pairing-constants';
import { AndroidSupplicant } from '../../lib/android-supplicant';

const DEBUG = !!process.env.ANDROID_PAIRING_DEBUG;
const debug = (msg: string) => DEBUG && console.log(`[android-PAIRING] ${msg}`);

/** True for the Fenix supplicant device registered on the account. */
function isMobileDevice(d: any): boolean {
  return d.type === 'mobile' || /Android|Fenix|Firefox/i.test(d.name || '');
}

/** One-line device summary for the run log, showing connection flags. */
function formatDevice(d: any): string {
  const flags = [`type=${d.type}`];
  if (d.isCurrentDevice) flags.push('current');
  if (d.pushCallback) flags.push('push=connected');
  if (d.availableCommands) {
    flags.push(`commands=${Object.keys(d.availableCommands).length}`);
  }
  return `  • ${d.name} [${flags.join(', ')}]`;
}

/** Poll the account's device list until the Fenix supplicant appears. */
async function pollForMobileDevice(
  authClient: { deviceList: (token: string) => Promise<any[]> },
  sessionToken: string,
  timeoutMs: number
): Promise<{ name?: string; type?: string } | undefined> {
  const deadline = Date.now() + timeoutMs;
  do {
    const devices = await authClient.deviceList(sessionToken);
    const found = devices.find(isMobileDevice);
    if (found) return found;
    await new Promise((r) => setTimeout(r, 3_000));
  } while (Date.now() < deadline);
  return undefined;
}

// 5 min — includes emulator cold start (~30s), UI navigation, time for the
// supplicant to connect to the channel, and the OAuth round trip.
test.setTimeout(300_000);

test.describe.serial('Android pairing flow', () => {
  // The supplicant web flow has inherent cross-device timing variance (channel
  // handshake vs authority approval); retry to absorb transient divergence.
  test.describe.configure({ retries: 2 });

  let useReactPairRoutes = false;
  let supplicant: AndroidSupplicant;

  test.beforeAll(async ({ browser, target }) => {
    if (!process.env.ANDROID_PAIRING_ENABLED) return;
    useReactPairRoutes = await isPairRoutesReact(browser, target);
  });

  test.beforeEach(async ({}, testInfo) => {
    if (!process.env.ANDROID_PAIRING_ENABLED) {
      testInfo.skip(
        true,
        'Set ANDROID_PAIRING_ENABLED=1 to run Android pairing tests'
      );
    }
    supplicant = new AndroidSupplicant();
  });

  test.afterEach(async ({}, testInfo) => {
    if (!process.env.ANDROID_PAIRING_ENABLED) return;
    if (process.env.ANDROID_PAIRING_DEBUG) {
      try {
        fs.writeFileSync(
          testInfo.outputPath('android-logcat-debug.txt'),
          supplicant.dumpLogcat()
        );
      } catch {
        /* best-effort */
      }
    }
    if (testInfo.status !== testInfo.expectedStatus) {
      try {
        const shot = testInfo.outputPath('android-supplicant.png');
        supplicant.screenshot(shot);
        await testInfo.attach('android-supplicant.png', {
          path: shot,
          contentType: 'image/png',
        });
        await testInfo.attach('android-logcat.txt', {
          body: supplicant.dumpLogcat(),
          contentType: 'text/plain',
        });
      } catch {
        /* best-effort diagnostics */
      }
    }
    supplicant.forceStop();
  });

  test('authority generates QR URL and Android supplicant connects', async ({
    target,
    testAccountTracker,
    marionetteAuthority,
  }) => {
    const client = marionetteAuthority.client;
    const useReact = useReactPairRoutes;

    const credentials = await test.step('Create test account', async () => {
      const creds = await testAccountTracker.signUp();
      debug(`Account created: ${creds.email}`);
      return creds;
    });

    const signedInUser =
      await test.step('Sign in authority via Marionette', async () => {
        await signInAuthorityViaMarionette(
          client,
          target.contentServerUrl,
          credentials.email,
          credentials.password,
          undefined,
          useReact
        );
        const user = await getSignedInUser(client);
        expect(user.signedIn).toBe(true);
        expect(user.email).toBe(credentials.email);
        return user;
      });

    // Prepare the supplicant BEFORE creating the channel: pairing channels
    // are short-lived, so the supplicant must connect soon after the authority
    // mints the URL. ensureReady (install check, override, first launch) is
    // the slow part and must not run inside the channel's lifetime.
    await test.step('Prepare Android supplicant', async () => {
      await supplicant.ensureReady(target.contentServerUrl);
    });

    const { pairUrl, channelId } =
      await test.step('Start pairing flow on authority', async () => {
        const url = await startPairingFlow(client);
        debug(`Pair URL: ${url}`);
        expect(url).toContain('/pair#');
        expect(url).toContain('channel_id=');
        const id = extractChannelId(url);
        expect(id).toBeTruthy();
        return { pairUrl: url, channelId: id };
      });

    await test.step('Android supplicant begins pairing', async () => {
      supplicant.injectPairingUrl(pairUrl);
      const seenUrl = await supplicant.beginPairing();
      // The supplicant must have started the flow with OUR pairing URL,
      // carrying the channel_id — not the empty back-out value.
      expect(seenUrl).toContain(channelId);
    });

    await test.step('Authority approves pairing', async () => {
      expect(signedInUser.uid).toBeTruthy();
      const authorityOAuthUrl = buildAuthorityOAuthUrl(
        target.contentServerUrl,
        {
          email: credentials.email,
          uid: signedInUser.uid as string,
          channelId,
        },
        useReact
      );

      // Give the supplicant time to load its /pair/supp page and connect to
      // the channel before the authority lands on the approval page. The
      // supplicant custom tab + channel handshake takes ~15-30s.
      await supplicant.waitForSupplicantOnChannel(45_000);

      await client.setContext('content');
      debug(`Navigating authority to: ${authorityOAuthUrl}`);
      await client.navigate(authorityOAuthUrl);

      const approveBtn = await findElementBySelectors(
        client,
        SELECTORS.AUTHORITY_APPROVE,
        30_000
      );
      await client.clickElement(approveBtn);
      debug('Authority approved pairing');
    });

    await test.step('Android supplicant confirms pairing', async () => {
      // After the authority approves, it waits on /pair/auth/wait_for_supp;
      // the supplicant must confirm on its own /pair/supp/allow screen to
      // complete the handshake.
      await supplicant.confirmPairing();
    });

    // The authority reaching /pair/auth/complete (and not /pair/failure) is
    // the authoritative signal that the two devices completed the pairing
    // handshake — both connected to the channel and both confirmed.
    await test.step('Verify pairing handshake completed', async () => {
      const finalUrl = await waitForUrlContaining(
        client,
        'pair/auth/complete',
        45_000
      );
      expect(finalUrl).not.toContain('pair/failure');
    });

    // The supplicant registers its device asynchronously after finishing the
    // OAuth webchannel login. This requires the fxawebchannel extension to
    // inject on the local stack — the extension manifest must include
    // http://localhost/* in its content_scripts matches (see docs/pairing/README.md,
    // "webchannel localhost").
    await test.step('Verify Android device is registered', async () => {
      const androidDevice = await pollForMobileDevice(
        target.authClient,
        credentials.sessionToken as string,
        45_000
      );
      expect(androidDevice).toBeTruthy();

      // Print the account's full device list so the connected Android device
      // is visible in the run output.
      const devices = await target.authClient.deviceList(
        credentials.sessionToken as string
      );
      console.log(
        '[android-PAIRING] account devices:\n' +
          devices.map(formatDevice).join('\n')
      );
    });
  });

  test('Android supplicant cancels and is not signed in', async ({
    target,
    testAccountTracker,
    marionetteAuthority,
  }) => {
    const client = marionetteAuthority.client;
    const useReact = useReactPairRoutes;

    const credentials = await test.step('Create test account', async () => {
      return testAccountTracker.signUp();
    });

    await test.step('Sign in authority via Marionette', async () => {
      await signInAuthorityViaMarionette(
        client,
        target.contentServerUrl,
        credentials.email,
        credentials.password,
        undefined,
        useReact
      );
      const user = await getSignedInUser(client);
      expect(user.signedIn).toBe(true);
    });

    const { pairUrl, channelId } =
      await test.step('Start pairing flow on authority', async () => {
        const url = await startPairingFlow(client);
        expect(url).toContain('/pair#');
        return { pairUrl: url, channelId: extractChannelId(url) };
      });

    await test.step('Android supplicant begins then cancels', async () => {
      await supplicant.ensureReady(target.contentServerUrl);
      supplicant.injectPairingUrl(pairUrl);
      const seenUrl = await supplicant.beginPairing();
      expect(seenUrl).toContain(channelId);
      // Close the pairing custom tab before the authority approves.
      supplicant.cancel();
    });

    await test.step('Verify no Android device registered', async () => {
      // Give any in-flight registration a chance to (not) happen.
      await sleep(5_000);
      const devices = await target.authClient.deviceList(
        credentials.sessionToken as string
      );
      const androidDevice = devices.find(isMobileDevice);
      expect(androidDevice).toBeFalsy();
    });
  });
});
