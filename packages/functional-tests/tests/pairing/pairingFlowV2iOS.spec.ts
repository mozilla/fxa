/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * v2 pairing flow, iOS supplicant.
 *
 * The iOS counterpart of `pairingFlowV2Android.spec.ts`: the authority is a real Firefox
 * Nightly (Marionette) running the FxA-owned v2 authority flow, and the supplicant is Firefox
 * iOS on a Simulator.
 *
 *   Authority (Marionette, Nightly)          Supplicant (iOS Simulator)
 *   ------------------------------------     --------------------------------
 *   1. sign in, open /connect_another_device -> scan_qr (real channel + QR)
 *                                            2. simctl delivers the v2 QR URL over the app's
 *                                               custom scheme; it opens as a normal tab
 *   3. on pair:supp:request -> continue_on_mobile
 *                                            4. XCUITest taps "Connect"
 *   5. on pair:supp:authorize -> approve_signin
 *   6. tap "Yes, approve sign-in"
 *   7. pair_oauth_finish -> sync_success
 *                                            8. OAuth completes -> device registered
 *
 * Two things differ from the Android spec, both forced by the platform:
 *
 *   - The supplicant's taps and its in-webview assertions live in the XCUITest, because
 *     `simctl` cannot read the screen or tap the way adb's uiautomator can. On failure the
 *     xcodebuild log is attached, since that is where the supplicant-side failure shows up.
 *   - A Simulator has no camera, so the QR is never scanned. `simctl openurl` delivers
 *     `fennec://open-url` instead, taking the same
 *     `RouteBuilder` -> `FxAPairingURLParser` -> `.fxaPairing` path a scan would. The run
 *     happens twice, differing only in who built the link. See `DELIVERIES`.
 *
 * The authority takes the v2 route because both sides advertise it: the stack's
 * `pairing.version` and the browser's `identity.fxaccounts.pairing.version`, which
 * `marionette-firefox` sets. `startPairingFlowV2` also appends `v=2`, which
 * `ConnectAnotherDevice` honours as a deliberately temporary escape hatch -- it forces the v2
 * route even when the capability handshake fails, so it can hide that regression here.
 *
 * Local target only, gated behind IOS_PAIRING_V2_ENABLED, and skipped by default in every
 * case. Prerequisites: the FxA stack
 * started with PAIRING_VERSION=2 and PAIRING_IOS_HANDOFF=true, a booted Simulator, a
 * firefox-ios checkout built with `build-for-testing` for the SyncIntegrationTestPlan, and
 * Firefox Nightly for the authority (or FIREFOX_BINARY at a v2-capable build).
 */

import { writeFileSync } from 'fs';
import { findV2AuthorityBinary } from '../../lib/firefox-binary';
import { Browser, devices } from '@playwright/test';
import { test, expect } from '../../lib/fixtures/pairing';
import { IOSSupplicant } from '../../lib/ios-supplicant';
import { MarionetteClient } from '../../lib/marionette';
import { PAIR_V2_ROUTES } from '../../lib/pairing-constants';
import {
  signInAuthorityViaMarionette,
  startPairingFlowV2,
  extractChannelIdV2,
  waitForUrlContaining,
  waitForUrlContainingAny,
} from '../../lib/pairing-helpers';

const ELIGIBLE_ENTRYPOINT_QS =
  'context=oauth_webchannel_v1&entrypoint=fxa_app_menu';

/**
 * Match the paired iOS supplicant only.
 *
 * The authority is a signed-in Firefox on the same account, so a pattern that also matched a
 * desktop device name would let this succeed before iOS ever registers.
 */
function isMobileDevice(d: { type?: string; name?: string }): boolean {
  return d.type === 'mobile' || /iOS|iPhone|iPad|Fennec/i.test(d.name || '');
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

/**
 * Click a control by test id, polling for it first.
 *
 * The authority's URL changes before React has rendered the new screen, so a single
 * `findElement` right after the URL check races the render.
 */
async function clickByTestId(
  client: MarionetteClient,
  testId: string,
  timeoutMs = 30_000
) {
  const selector = `[data-testid="${testId}"]`;
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      const el = await client.findElement('css selector', selector);
      await client.clickElement(el);
      return;
    } catch (err) {
      if (Date.now() >= deadline) throw err;
      await new Promise((r) => setTimeout(r, 1_000));
    }
  }
}

type DeliveryContext = {
  ios: IOSSupplicant;
  pairUrl: string;
  browser: Browser;
};

/**
 * Where the deep link comes from. Both run the same XCUITest; the supplicant side is identical
 * once the app holds the URL.
 *
 * Reading the link off the rendered page covers what a constructed URL cannot: that the card
 * renders for a non-Firefox browser, and that it names the configured iOS scheme.
 *
 * Neither taps the CTA. A Simulator's Safari refuses to open a third-party scheme, answering
 * "the address is invalid" while `simctl` opens the same URL fine, so that is device-only.
 */
const DELIVERIES = [
  {
    title: 'the iOS supplicant completes pairing from a deep link',
    resolve: async ({ ios, pairUrl }: DeliveryContext) =>
      ios.deepLinkFor(pairUrl),
  },
  {
    title: "the page's own hand-off link completes pairing",
    resolve: async ({ ios, browser, pairUrl }: DeliveryContext) => {
      const deepLink = await readHandoffDeepLink(browser, pairUrl);
      // Exact match, not a substring: every flavour also registers `firefox://`, so a
      // page that ignored `PAIRING_IOS_URL_SCHEME` would still emit a link that works.
      expect(deepLink).toBe(ios.deepLinkFor(pairUrl));
      return deepLink;
    },
  },
];

/**
 * Render `/pair` as a non-Firefox phone would and return the hand-off link it offers.
 *
 * The iOS descriptor makes `detectDevice` report iOS. The card renders only once `fxa_status`
 * goes unanswered, which is a timeout rather than a reply, so it is absent on first paint —
 * and only where the stack serves `PAIRING_IOS_HANDOFF=true`.
 */
async function readHandoffDeepLink(
  browser: Browser,
  pairUrl: string
): Promise<string> {
  const context = await browser.newContext(devices['iPhone 13']);
  try {
    const page = await context.newPage();
    await page.goto(pairUrl);
    const cta = page
      .locator('a[href^="fennec://"], a[href^="firefox://"]')
      .first();
    await cta.waitFor({ state: 'attached', timeout: 30_000 });
    const href = await cta.getAttribute('href');
    if (!href) {
      throw new Error('Hand-off CTA rendered without an href');
    }
    return href;
  } finally {
    await context.close();
  }
}

// Simulator boot + xcodebuild launch + channel handshake + OAuth round trip.
test.setTimeout(420_000);

// Local only: both halves run on this machine, against the stack under test.
test.skip(({ target }) => target.name !== 'local');

test.describe.serial('v2 iOS pairing flow', () => {
  test.describe.configure({ retries: 0 });

  let supplicant: IOSSupplicant | undefined;

  test.beforeEach(async ({}, testInfo) => {
    if (!process.env.IOS_PAIRING_V2_ENABLED) {
      testInfo.skip(
        true,
        'Set IOS_PAIRING_V2_ENABLED=1 (needs a booted Simulator with a build-for-testing Firefox iOS)'
      );
    }
    if (!findV2AuthorityBinary()) {
      testInfo.skip(
        true,
        'Firefox Nightly not found — install it, or set FIREFOX_BINARY to a v2-capable build'
      );
    }
    supplicant = new IOSSupplicant();
    if (!supplicant.findXctestrun()) {
      testInfo.skip(
        true,
        'No SyncIntegrationTestPlan .xctestrun — run xcodebuild build-for-testing first'
      );
    }
  });

  test.afterEach(async ({}, testInfo) => {
    // `beforeEach` skips before assigning the supplicant when a prerequisite is missing, and
    // teardown still runs; touching it there would turn a clean skip into an error.
    if (!supplicant) return;
    if (testInfo.status !== testInfo.expectedStatus) {
      try {
        const shot = testInfo.outputPath('ios-v2-supplicant.png');
        supplicant.screenshot(shot);
        await testInfo.attach('ios-v2-supplicant.png', {
          path: shot,
          contentType: 'image/png',
        });
        await testInfo.attach('ios-v2-xcodebuild.log', {
          path: testInfo.outputPath('ios-v2-xcodebuild.log'),
          contentType: 'text/plain',
        });
      } catch {
        /* best-effort diagnostics */
      }
    }
    supplicant.stop();
    // Each test's guard must reflect that test, not the previous one's.
    supplicant = undefined;
  });

  for (const delivery of DELIVERIES) {
    test(`authority mints v2 QR and ${delivery.title}`, async ({
      target,
      testAccountTracker,
      marionetteAuthority,
      browser,
    }, testInfo) => {
      const authority = marionetteAuthority.client;
      // `supplicant` is optional so teardown can tell "never assigned" from "assigned"; the body
      // runs only after beforeEach set it.
      const ios = supplicant as IOSSupplicant;
      const xcodebuildLog = testInfo.outputPath('ios-v2-xcodebuild.log');

      const credentials = await test.step('Authority signs in', async () => {
        const creds = await testAccountTracker.signUp();
        await signInAuthorityViaMarionette(
          authority,
          target.contentServerUrl,
          creds.email,
          creds.password
        );
        return creds;
      });

      // Reset before minting the short-lived channel. A Simulator that still holds an account
      // from an earlier run takes a re-auth flow instead of pairing, so the authority would wait
      // for a `pair:supp:request` that never arrives.
      await test.step('Prepare iOS supplicant', async () => {
        ios.resetToColdState();
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

      // The XCUITest owns every supplicant-side tap and assertion, so it runs for the whole
      // flow while the authority side advances in parallel here.
      const xcuitest = ios.startXCUITest({
        testMethod: 'testPairingV2',
        pairingUrl: pairUrl,
        customFxAServer: target.contentServerUrl,
        logPath: xcodebuildLog,
      });
      // A rejection that lands while we are awaiting the authority would otherwise be an
      // unhandled rejection; the real assertion happens in the final step.
      const xcuitestSettled = xcuitest.catch((err: Error) => err);

      await test.step('iOS supplicant opens the QR URL', async () => {
        // Deliver only once the app has launched, or the open lands before the scene exists
        // and is dropped. Keyed off the launch xcodebuild logs rather than a fixed sleep: a
        // slow launch used to outlive the v2 channel, and a fast one paid the full delay.
        const [deepLink] = await Promise.all([
          delivery.resolve({ ios, pairUrl, browser }),
          ios.waitForAppLaunch(),
        ]);
        ios.openDeepLink(deepLink);
        expect(pairUrl).toContain(channelId);
      });

      await test.step('Authority waits on the supplicant', async () => {
        // The request arriving on the channel moves the authority off scan_qr. Accept
        // approve_signin too: continue_on_mobile is only shown until the supplicant approves,
        // and on a fast run that happens before the next poll, so requiring it is a race.
        await waitForUrlContainingAny(
          authority,
          [
            PAIR_V2_ROUTES.AUTHORITY_CONTINUE_ON_MOBILE,
            PAIR_V2_ROUTES.AUTHORITY_APPROVE_SIGNIN,
          ],
          90_000
        );
      });

      await test.step('Authority approves the request', async () => {
        // The XCUITest taps "Connect", which is what moves the authority on to approve_signin.
        await waitForUrlContaining(
          authority,
          PAIR_V2_ROUTES.AUTHORITY_APPROVE_SIGNIN,
          90_000
        );
        await clickByTestId(authority, 'pair2-auth-approve-btn');
      });

      await test.step('Authority reaches sync success', async () => {
        await waitForUrlContaining(
          authority,
          PAIR_V2_ROUTES.AUTHORITY_SYNC_SUCCESS,
          90_000
        );
      });

      const device =
        await test.step('iOS device is registered on the account', async () => {
          const found = await pollForMobileDevice(
            target.authClient,
            credentials.sessionToken as string,
            60_000
          );
          expect(found).toBeTruthy();
          return found;
        });

      await test.step('Connected Services lists the iOS device', async () => {
        // The API check above proves registration; this proves the authority's own Settings UI
        // surfaces the newly paired device to the user.
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
      });

      await test.step('iOS supplicant confirms its own success card', async () => {
        // The supplicant's taps and card assertions live in Swift, so a failure surfaces as a
        // rejected xcodebuild run. `afterEach` attaches the log.
        const result = await xcuitestSettled;
        expect(result, `${result}`).not.toBeInstanceOf(Error);
      });
    });
  }
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
