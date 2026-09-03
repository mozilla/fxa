/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * v2 pairing flow, Android supplicant (FXA-12855 / FXA-13870).
 *
 * The real-device counterpart of `pairingFlowV2.spec.ts`: the authority is a
 * real Firefox Nightly (Marionette) running the FxA-owned v2 authority flow, and
 * the supplicant is a real Fenix on an Android emulator, driven over adb via
 * `AndroidSupplicant` (the same driver the v1 `pairingFlowAndroid.spec.ts` uses).
 *
 *   Authority (Marionette, Nightly)          Supplicant (Android / Fenix)
 *   ------------------------------------     ----------------------------
 *   1. sign in, open /connect_another_device?v=2 -> scan_qr (real channel + QR)
 *                                            2. adb injects the v2 QR URL into
 *                                               the Sync Debug hook, begins pairing
 *   3. on pair:supp:request -> continue_on_mobile
 *                                            4. tap "Connect" (connect_this_device)
 *   5. on pair:supp:authorize -> approve_signin
 *   6. tap "Yes, approve sign-in"
 *   7. pair_oauth_finish -> sync_success
 *                                            8. OAuth completes -> device registered
 *
 * Gated behind ANDROID_PAIRING_V2_ENABLED and skipped by default: it needs an
 * emulator running a Fenix build with the v2 web-channel commands. This is the
 * only run against a real browser supplicant; pairingFlowV2.spec.ts covers the
 * same authority side and additionally verifies the Sync scoped keys.
 *
 * Prerequisites: the FXA stack started with PAIRING_VERSION=2, a booted Android
 * emulator with a v2-capable Fenix debug build, `yarn adb-reverse`, and the
 * webchannel-localhost manifest patch (see docs/pairing/README.md). Set
 * ANDROID_PAIRING_V2_ENABLED=1 to run; the authority needs Firefox Nightly, or
 * FIREFOX_BINARY at a v2-capable build.
 */

import { writeFileSync } from 'fs';
import { findV2AuthorityBinary } from '../../lib/firefox-binary';
import { test, expect } from '../../lib/fixtures/pairing';
import { MarionetteClient } from '../../lib/marionette';
import { PAIR_V2_ROUTES } from '../../lib/pairing-constants';
import {
  signInAuthorityViaMarionette,
  startPairingFlowV2,
  extractChannelIdV2,
  waitForUrlContaining,
  redactChannelKey,
} from '../../lib/pairing-helpers';
import { AndroidSupplicant } from '../../lib/android-supplicant';

const ELIGIBLE_ENTRYPOINT_QS =
  'context=oauth_webchannel_v1&entrypoint=fxa_app_menu';

/**
 * Match the paired Android supplicant only.
 *
 * The authority is a signed-in Firefox on the same account, so a pattern that
 * also matched a desktop device name would let this succeed before Android ever
 * registers.
 */
function isMobileDevice(d: { type?: string; name?: string }): boolean {
  return d.type === 'mobile' || /Android|Fenix/i.test(d.name || '');
}

type PairedDevice = { id: string; name?: string; type?: string };

async function pollForMobileDevice(
  authClient: { deviceList: (token: string) => Promise<PairedDevice[]> },
  sessionToken: string,
  timeoutMs: number
): Promise<PairedDevice | undefined> {
  const deadline = Date.now() + timeoutMs;
  do {
    const devices = await authClient.deviceList(sessionToken);
    const found = devices.find(isMobileDevice);
    if (found) return found;
    await new Promise((r) => setTimeout(r, 3_000));
  } while (Date.now() < deadline);
  return undefined;
}

async function clickByTestId(client: MarionetteClient, testId: string) {
  const el = await client.findElement(
    'css selector',
    `[data-testid="${testId}"]`
  );
  await client.clickElement(el);
}

// Set PAIRING_WATCH_MS (e.g. 4000) to pause between steps so the flow is
// watchable in headed mode. Default 0 keeps normal runs fast.
const WATCH_MS = parseInt(process.env.PAIRING_WATCH_MS || '0', 10);
const watch = () =>
  WATCH_MS ? new Promise((r) => setTimeout(r, WATCH_MS)) : Promise.resolve();

// Emulator cold start + UI nav + channel handshake + OAuth round trip.
test.setTimeout(300_000);

// Local only: both halves run on this machine, against the stack under test.
test.skip(({ target }) => target.name !== 'local');

test.describe.serial('v2 Android pairing flow', () => {
  test.describe.configure({ retries: 0 });

  let supplicant: AndroidSupplicant | undefined;

  test.beforeEach(async ({}, testInfo) => {
    if (!process.env.ANDROID_PAIRING_V2_ENABLED) {
      testInfo.skip(
        true,
        'Set ANDROID_PAIRING_V2_ENABLED=1 (needs a booted emulator running a Fenix debug build)'
      );
    }
    if (!findV2AuthorityBinary()) {
      testInfo.skip(
        true,
        'Firefox Nightly not found — install it, or set FIREFOX_BINARY to a v2-capable build'
      );
    }
    supplicant = new AndroidSupplicant();
  });

  test.afterEach(async ({}, testInfo) => {
    // `beforeEach` skips before assigning the supplicant when a prerequisite is
    // missing, and teardown still runs; touching it there would turn a clean
    // skip into an error.
    if (!supplicant) return;
    if (testInfo.status !== testInfo.expectedStatus) {
      try {
        const shot = testInfo.outputPath('android-v2-supplicant.png');
        supplicant.screenshot(shot);
        await testInfo.attach('android-v2-supplicant.png', {
          path: shot,
          contentType: 'image/png',
        });
        await testInfo.attach('android-v2-logcat.txt', {
          body: redactChannelKey(supplicant.dumpLogcat()),
          contentType: 'text/plain',
        });
      } catch {
        /* best-effort diagnostics */
      }
    }
    supplicant.forceStop();
    // Each test's guard must reflect that test, not the previous one's.
    supplicant = undefined;
  });

  test('authority mints v2 QR and Android supplicant completes pairing', async ({
    target,
    testAccountTracker,
    marionetteAuthority,
  }, testInfo) => {
    const authority = marionetteAuthority.client;
    // `supplicant` is optional so teardown can tell "never assigned" from
    // "assigned"; the body runs only after beforeEach set it.
    const fenix = supplicant as AndroidSupplicant;

    const credentials = await test.step('Authority signs in', async () => {
      const creds = await testAccountTracker.signUp();
      await signInAuthorityViaMarionette(
        authority,
        target.contentServerUrl,
        creds.email,
        creds.password
      );
      // signInAuthorityViaMarionette already blocks until Firefox reports the
      // signed-in state, so re-asserting it here only repeats that check.
      return creds;
    });

    // Prepare the supplicant before minting the (short-lived) channel. The
    // reset must come first: a Fenix that still has an account from an earlier
    // run takes a re-auth web flow instead of pairing, so the authority waits
    // for a `pair:supp:request` that never arrives.
    await test.step('Prepare Android supplicant', async () => {
      fenix.resetToColdState();
      await fenix.ensureReady(target.contentServerUrl);
    });

    const { pairUrl, channelId } =
      await test.step('Authority mints the v2 QR', async () => {
        const url = await startPairingFlowV2(
          authority,
          target.contentServerUrl,
          ELIGIBLE_ENTRYPOINT_QS
        );
        expect(url).toContain('v=2');
        return { pairUrl: url, channelId: extractChannelIdV2(url) };
      });

    await test.step('Android supplicant opens the QR URL', async () => {
      // A v2 device scans the QR with the native camera, so the URL arrives as
      // a plain VIEW intent and opens in a normal tab. The page then asks the
      // browser for the OAuth params over `fxaccounts:pair_oauth_start`.
      const seenUrl = await fenix.openPairingUrl(pairUrl);
      expect(seenUrl).toContain(channelId);
      await fenix.waitForSupplicantOnChannel(45_000);
    });

    await test.step('Authority waits on the supplicant', async () => {
      // The request arriving on the channel moves the authority off scan_qr.
      await waitForUrlContaining(
        authority,
        PAIR_V2_ROUTES.AUTHORITY_CONTINUE_ON_MOBILE,
        45_000
      );
    });

    await test.step('Android supplicant confirms', async () => {
      // The v2 connect_this_device card's CTA reads "Connect". It is enabled
      // only once the authority's metadata has populated the card.
      await fenix.confirmPairing(45_000, /^Connect$/i);
    });

    await test.step('Authority approves the request', async () => {
      await waitForUrlContaining(
        authority,
        PAIR_V2_ROUTES.AUTHORITY_APPROVE_SIGNIN,
        45_000
      );
      await clickByTestId(authority, 'pair2-auth-approve-btn');
    });

    await test.step('Both sides reach sync success', async () => {
      await waitForUrlContaining(
        authority,
        PAIR_V2_ROUTES.AUTHORITY_SYNC_SUCCESS,
        60_000
      );
      // Read the phone's own screen too: a supplicant that registered the
      // device and then landed on an error card would otherwise pass.
      expect(
        await fenix.waitForText(/Your device is connected/i, 60_000),
        'supplicant should show the sync success card'
      ).toBe(true);
    });

    const device =
      await test.step('Android device is registered on the account', async () => {
        const found = await pollForMobileDevice(
          target.authClient,
          credentials.sessionToken as string,
          45_000
        );
        expect(found).toBeTruthy();
        return found;
      });

    await test.step('Connected Services lists the Android device', async () => {
      // The API check above proves registration; this proves the authority's
      // own Settings UI surfaces the newly paired device to the user.
      await authority.navigate(`${target.contentServerUrl}/settings/clients`);
      await waitForUrlContaining(authority, '/settings/clients', 30_000);

      const deviceName = device?.name;
      expect(
        deviceName,
        'registered device should have a name to look for'
      ).toBeTruthy();
      const row = await pollUntilElement(
        authority,
        `//*[contains(text(), ${xpathLiteral(deviceName as string)})]`,
        30_000
      );
      expect(
        row,
        `"${deviceName}" not listed in Connected Services`
      ).toBeTruthy();

      const body = await authority.findElement('css selector', 'body');
      const shot = testInfo.outputPath('authority-connected-services.png');
      writeFileSync(
        shot,
        Buffer.from(await authority.screenshotElement(body), 'base64')
      );
      await testInfo.attach('authority-connected-services.png', {
        path: shot,
        contentType: 'image/png',
      });
      await watch();
    });
  });
});

/** Poll for an element so the Settings list has time to load its services. */
async function pollUntilElement(
  client: MarionetteClient,
  xpath: string,
  timeoutMs: number
): Promise<string | undefined> {
  const deadline = Date.now() + timeoutMs;
  do {
    try {
      return await client.findElement('xpath', xpath);
    } catch {
      await new Promise((r) => setTimeout(r, 2_000));
    }
  } while (Date.now() < deadline);
  return undefined;
}

/** Quote a value for use inside an XPath expression. */
function xpathLiteral(value: string): string {
  if (!value.includes("'")) return `'${value}'`;
  return `concat('${value.split("'").join(`', "'", '`)}')`;
}
