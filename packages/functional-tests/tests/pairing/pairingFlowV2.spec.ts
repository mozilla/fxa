/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * v2 pairing end to end, desktop to desktop: the happy path and the
 * supplicant-cancel path.
 *
 * Both halves are real Firefox Nightly instances driven over Marionette. The
 * authority runs the real chrome fxaccounts:pair_oauth_finish and the supplicant
 * the real fxaccounts:pair_oauth_start, so the PKCE material, the channel and
 * the granted code are all genuine.
 *
 * Two things are stood in for, both because desktop Firefox is a pairing
 * *authority* only and this spec borrows it as a supplicant. Nothing that the
 * FxA flow itself owns is faked.
 *
 * 1. The supplicant's User-Agent, set to Fenix. A scanned QR carries no query, so
 *    the supplicant derives its client id from the UA, and a desktop UA yields
 *    the Firefox Desktop id. That id is a native client but is not in the
 *    server's `pairing.clients` allowlist, so `validateSupplicantRequest`
 *    rejects the request on arrival — correctly: Firefox mints the code *for
 *    that client*, so the allowlist is what stops a code carrying the account's
 *    Sync keys reaching an unintended one. The UA is the stand-in rather than a
 *    `client_id` query param because `onConnect` navigates with a plain
 *    `navigate()`, which drops the query; losing `client_id` mid-flow rebuilds
 *    the integration and discards the live channel.
 *
 * 2. The supplicant's `oauth_login` handler, replaced with a recorder. Chrome's
 *    real handler completes the flow with the signed-in account's session token,
 *    which an account-less supplicant does not have, so it throws and the browser
 *    never signs in. Recording the message instead lets the test assert on the
 *    code the authority actually granted.
 *
 * What stays real: the channel, the supplicant's `pair_oauth_start` and its PKCE
 * and ECDH material, the authority's `pair_oauth_finish` and the code it mints,
 * every pairing-channel message, and all of the FxA routing on both sides. The
 * real mobile supplicant path is covered by `pairingFlowV2Android.spec.ts`.
 *
 * Prerequisites: FXA stack started with PAIRING_VERSION=2, Firefox Nightly (or
 * FIREFOX_BINARY at a v2-capable build), and network to the channel server. The
 * authority reaches scan_qr through the ?v=2 escape hatch on
 * /connect_another_device; the supplicant hand-off on /pair has no such hatch,
 * so the server config is what opens the supplicant half. Skips without
 * Nightly, so it does not run in CI.
 *
 * Both cases share the same topology and setup, so they live together rather
 * than in a second spec that would launch its own pair of browsers.
 */

import { findV2AuthorityBinary } from '../../lib/firefox-binary';
import { test, expect } from '../../lib/fixtures/pairing';
import { MarionetteClient } from '../../lib/marionette';
import { PAIR_V2_ROUTES, TIMEOUTS } from '../../lib/pairing-constants';
import {
  signInAuthorityViaMarionette,
  getSignedInUser,
  startPairingFlowV2,
  waitForUrlContaining,
  attachAuthorityDiagnostics,
  mockSupplicantOAuthLogin,
  readCapturedOAuthLogin,
  setSupplicantUserAgent,
  sleep,
} from '../../lib/pairing-helpers';

const ELIGIBLE_ENTRYPOINT_QS =
  'context=oauth_webchannel_v1&entrypoint=fxa_app_menu';

// Set PAIRING_WATCH_MS (e.g. 4000) to pause on each page so the flow is
// watchable in headed mode. Default 0 keeps normal runs fast.
const WATCH_MS = parseInt(process.env.PAIRING_WATCH_MS || '0', 10);

// Two real browsers, an OAuth sign-in and a full channel handshake.
test.setTimeout(240_000);

/**
 * Click once the button is present and enabled.
 *
 * The supplicant's buttons render `disabled` until the authority's metadata
 * arrives, and Marionette does not error when told to click a disabled button —
 * it silently does nothing, and the test then fails later at an unrelated wait.
 */
async function clickByTestId(client: MarionetteClient, testId: string) {
  const selector = `[data-testid="${testId}"]`;
  const deadline = Date.now() + TIMEOUTS.ELEMENT_FIND;
  let lastError = '';

  do {
    try {
      const el = await client.findElement('css selector', selector);
      if ((await client.getElementAttribute(el, 'disabled')) === null) {
        await client.clickElement(el);
        return;
      }
      lastError = 'still disabled';
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    await sleep(500);
  } while (Date.now() < deadline);

  throw new Error(`Could not click ${selector}: ${lastError}`);
}

test.describe('severity-2 #smoke', () => {
  test.describe.serial('v2 pairing flow', () => {
    test.beforeEach(() => {
      test.skip(
        !findV2AuthorityBinary(),
        'Firefox Nightly not found — install it, or set FIREFOX_BINARY to a v2-capable build'
      );
    });

    // Both cases need the supplicant to report the mobile client it stands for,
    // before it opens anything.
    test.beforeEach(async ({ marionetteSupplicant }) => {
      await setSupplicantUserAgent(marionetteSupplicant.client);
    });

    // Both browsers run under Marionette, so Playwright's own failure artifacts
    // capture nothing from either. Attach each one's URL and page.
    //
    // Taking the browsers from the test body rather than as hook parameters is
    // deliberate: a hook that destructures a fixture forces Playwright to build
    // it, which on the skip path above would launch two browsers for a test
    // that never runs.
    let clients: { authority: MarionetteClient; supplicant: MarionetteClient };

    test.afterEach(async ({}, testInfo) => {
      if (!clients) return;
      await attachAuthorityDiagnostics(clients.authority, testInfo, 'authority');
      await attachAuthorityDiagnostics(
        clients.supplicant,
        testInfo,
        'supplicant'
      );
      clients = undefined as never;
    });

    test('happy path: both sides complete the handshake and the supplicant is granted a code', async ({
      target,
      testAccountTracker,
      marionetteAuthority,
      marionetteSupplicant,
    }) => {
      const authority = marionetteAuthority.client;
      const supplicant = marionetteSupplicant.client;
      clients = { authority, supplicant };

      await test.step('Authority signs in', async () => {
        const creds = await testAccountTracker.signUp();
        await signInAuthorityViaMarionette(
          authority,
          target.contentServerUrl,
          creds.email,
          creds.password
        );
        expect((await getSignedInUser(authority)).signedIn).toBe(true);
      });

      const pairUrl = await test.step('Authority mints the v2 QR', async () => {
        const url = await startPairingFlowV2(
          authority,
          target.contentServerUrl,
          ELIGIBLE_ENTRYPOINT_QS
        );
        expect(url).toContain('channel_id=');
        expect(url).toContain('v=2');
        await sleep(WATCH_MS); // authority: QR on screen
        return url;
      });

      await test.step('Supplicant opens the scanned QR', async () => {
        await mockSupplicantOAuthLogin(supplicant);
        // Exactly the URL the QR encodes — a scan hands the browser no more
        // than this, so the flow has to work from the fragment alone.
        await supplicant.setContext('content');
        await supplicant.navigate(pairUrl);
        // /pair#..v=2 forwards straight to the confirmation card, which opens
        // the channel and then waits there for the authority's metadata.
        await waitForUrlContaining(
          supplicant,
          PAIR_V2_ROUTES.SUPPLICANT_CONNECT_THIS_DEVICE,
          TIMEOUTS.PAIR_V2_HANDSHAKE
        );
        await sleep(WATCH_MS); // supplicant: connect this device
      });

      await test.step('Authority waits on the supplicant', async () => {
        // The request arriving on the channel moves the authority off scan_qr.
        await waitForUrlContaining(
          authority,
          PAIR_V2_ROUTES.AUTHORITY_CONTINUE_ON_MOBILE,
          TIMEOUTS.PAIR_V2_HANDSHAKE
        );
        await sleep(WATCH_MS); // authority: continue on mobile
      });

      await test.step('Supplicant confirms', async () => {
        // Enabled only once the authority's metadata has populated the card, so
        // clicking it also proves the metadata arrived.
        await clickByTestId(supplicant, 'pair2-supp-connect-btn');
        await waitForUrlContaining(
          supplicant,
          PAIR_V2_ROUTES.SUPPLICANT_APPROVE_SIGNIN,
          TIMEOUTS.PAIR_V2_HANDSHAKE
        );
        await sleep(WATCH_MS); // supplicant: approve sign-in
      });

      await test.step('Authority approves', async () => {
        await waitForUrlContaining(
          authority,
          PAIR_V2_ROUTES.AUTHORITY_APPROVE_SIGNIN,
          TIMEOUTS.PAIR_V2_HANDSHAKE
        );
        await sleep(WATCH_MS); // authority: approve sign-in
        await clickByTestId(authority, 'pair2-auth-approve-btn');
      });

      await test.step('Both sides reach sync success', async () => {
        await waitForUrlContaining(
          supplicant,
          PAIR_V2_ROUTES.SUPPLICANT_SYNC_SUCCESS,
          60_000
        );
        await waitForUrlContaining(
          authority,
          PAIR_V2_ROUTES.AUTHORITY_SYNC_SUCCESS,
          60_000
        );
        await sleep(WATCH_MS); // both: sync success
      });

      await test.step('Supplicant chrome receives the granted OAuth code', async () => {
        // The page reaching sync_success only proves it sent oauth_login, which
        // it does without waiting for a reply. This proves what it sent: the
        // code the authority actually granted over the channel.
        const login = await readCapturedOAuthLogin(supplicant);
        expect(login, 'supplicant should have sent oauth_login').toBeTruthy();
        expect(login?.action).toBe('pairing');
        // Same shape the supplicant integration validates before accepting it.
        expect(login?.code).toMatch(/^[a-fA-F0-9]{64}$/);
        expect(login?.state).toBeTruthy();
      });
    });

    test('supplicant cancels: both sides end on timeout_and_cancel, no code granted', async ({
      target,
      testAccountTracker,
      marionetteAuthority,
      marionetteSupplicant,
    }) => {
      const authority = marionetteAuthority.client;
      const supplicant = marionetteSupplicant.client;
      clients = { authority, supplicant };

      await test.step('Authority signs in', async () => {
        const creds = await testAccountTracker.signUp();
        await signInAuthorityViaMarionette(
          authority,
          target.contentServerUrl,
          creds.email,
          creds.password
        );
        expect((await getSignedInUser(authority)).signedIn).toBe(true);
      });

      const pairUrl = await test.step('Authority mints the v2 QR', async () => {
        const url = await startPairingFlowV2(
          authority,
          target.contentServerUrl,
          ELIGIBLE_ENTRYPOINT_QS
        );
        expect(url).toContain('v=2');
        return url;
      });

      await test.step('Supplicant reaches connect_this_device', async () => {
        // Records any oauth_login, so the final step can prove none arrived.
        await mockSupplicantOAuthLogin(supplicant);
        await supplicant.setContext('content');
        await supplicant.navigate(pairUrl);
        await waitForUrlContaining(
          supplicant,
          PAIR_V2_ROUTES.SUPPLICANT_CONNECT_THIS_DEVICE,
          TIMEOUTS.PAIR_V2_HANDSHAKE
        );
        // The authority received the request and is waiting on the supplicant.
        await waitForUrlContaining(
          authority,
          PAIR_V2_ROUTES.AUTHORITY_CONTINUE_ON_MOBILE,
          TIMEOUTS.PAIR_V2_HANDSHAKE
        );
      });

      await test.step('Supplicant cancels', async () => {
        await clickByTestId(supplicant, 'pair2-supp-cancel-btn');
        await waitForUrlContaining(
          supplicant,
          PAIR_V2_ROUTES.SUPPLICANT_TIMEOUT_AND_CANCEL,
          TIMEOUTS.PAIR_V2_HANDSHAKE
        );
      });

      await test.step('Authority is sent to timeout_and_cancel', async () => {
        await waitForUrlContaining(
          authority,
          PAIR_V2_ROUTES.AUTHORITY_TIMEOUT_AND_CANCEL,
          TIMEOUTS.PAIR_V2_HANDSHAKE
        );
      });

      await test.step('Supplicant is never granted an OAuth code', async () => {
        // The device list cannot tell us anything here: this desktop supplicant
        // never completes oauth_login either way, so no device is registered
        // whether the user cancels or not. What cancelling must prevent is the
        // authority granting a code at all, and the recorder can see that.
        const login = await readCapturedOAuthLogin(supplicant, 5_000);
        expect(login, 'a cancelled pairing must not grant a code').toBeUndefined();
      });
    });
  });
});
