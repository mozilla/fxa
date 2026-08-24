/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * v2 pairing end to end: the happy path and the supplicant-cancel path
 * (FXA-12855 / FXA-13870 / FXA-13869).
 *
 *   Authority = real Firefox Nightly via Marionette, signed in, running the
 *     real chrome fxaccounts:pair_oauth_finish against the auth server.
 *   Supplicant = Playwright page running the real Pair2 supplicant containers,
 *     with pair_oauth_start / fxa_status / oauth_login web-channel commands
 *     backed by real PKCE + ECDH crypto in the harness (a Playwright page has no
 *     chrome to run them). The harness redeems the resulting code and decrypts
 *     keys_jwe, proving real Sync scoped keys reach the supplicant.
 *
 * Prerequisites: FXA stack, Firefox Nightly (or FIREFOX_BINARY at a v2-capable
 * build), and network to the channel server. config.pairing.version=2 is not
 * required: the authority uses the ?v=2 escape hatch. Skips without Nightly,
 * so it does not run in CI.
 *
 * Both cases share the same topology and setup, so they live together rather
 * than in a second spec that would launch its own authority Firefox.
 */

import path from 'path';
import { findV2AuthorityBinary } from '../../lib/firefox-binary';
import { test, expect } from '../../lib/fixtures/pairing';
import { MarionetteClient } from '../../lib/marionette';
import { PAIR_V2_ROUTES } from '../../lib/pairing-constants';
import {
  signInAuthorityViaMarionette,
  getSignedInUser,
  startPairingFlowV2,
  waitForUrlContaining,
  attachAuthorityDiagnostics,
  sleep,
} from '../../lib/pairing-helpers';
import {
  generateSupplicantCrypto,
  installSupplicantWebChannelStub,
  readCapturedOAuthLogin,
  redeemAndDecrypt,
} from '../../lib/pairing-supplicant-harness';

const ELIGIBLE_ENTRYPOINT_QS =
  'context=oauth_webchannel_v1&entrypoint=fxa_app_menu';
const OLDSYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';

// Set PAIRING_WATCH_MS (e.g. 4000) to pause on each page so the flow is
// watchable in headed mode. Default 0 keeps normal runs fast.
const WATCH_MS = parseInt(process.env.PAIRING_WATCH_MS || '0', 10);

// Set PAIRING_SHOTS_DIR to capture a screenshot of each supplicant page into
// that directory.
const SHOTS = process.env.PAIRING_SHOTS_DIR;

function isMobileDevice(d: { type?: string; name?: string }): boolean {
  return d.type === 'mobile' || /Android|Fenix|Firefox/i.test(d.name || '');
}

// Two real browsers + OAuth sign-in + a full channel handshake.
test.setTimeout(180_000);

async function clickByTestId(client: MarionetteClient, testId: string) {
  const el = await client.findElement(
    'css selector',
    `[data-testid="${testId}"]`
  );
  await client.clickElement(el);
}

test.describe('severity-2 #smoke', () => {
  test.describe.serial('v2 pairing flow', () => {
    test.beforeEach(() => {
      test.skip(
        !findV2AuthorityBinary(),
        'Firefox Nightly not found — install it, or set FIREFOX_BINARY to a v2-capable build'
      );
    });

    // The authority runs under Marionette, so Playwright's own failure
    // artifacts capture nothing from it. Attach its URL, page and trace.
    test.afterEach(async ({ marionetteAuthority }, testInfo) => {
      await attachAuthorityDiagnostics(marionetteAuthority.client, testInfo);
    });

    test('happy path: authority + supplicant complete pairing with real keys', async ({
      target,
      syncOAuthBrowserPages: { page },
      testAccountTracker,
      marionetteAuthority,
    }) => {
      const authority = marionetteAuthority.client;
      const crypto = generateSupplicantCrypto();

      await test.step('Authority signs in', async () => {
        const creds = await testAccountTracker.signUp();
        await signInAuthorityViaMarionette(
          authority,
          target.contentServerUrl,
          creds.email,
          creds.password
        );
        expect((await getSignedInUser(authority)).signedIn).toBe(true);
        return creds;
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

      await test.step('Supplicant opens the QR (real crypto stubbed)', async () => {
        await installSupplicantWebChannelStub(page, crypto);
        await page.goto(pairUrl, { waitUntil: 'load' });
        // /pair#..v=2 forwards into the v2 supplicant flow.
        await page.waitForURL(
          new RegExp(PAIR_V2_ROUTES.SUPPLICANT_APPROVE_SIGNIN)
        );
        if (SHOTS)
          await page.screenshot({
            path: path.join(SHOTS, '2-supplicant-approve-signin.png'),
          });
        await sleep(WATCH_MS); // supplicant: approve sign-in
      });

      await test.step('Authority receives the request and approves', async () => {
        await waitForUrlContaining(
          authority,
          PAIR_V2_ROUTES.AUTHORITY_APPROVE_SIGNIN
        );
        await sleep(WATCH_MS); // authority: approve sign-in
        // Attaches the pair:supp:authorize listener before the supplicant sends it.
        await clickByTestId(authority, 'pair2-auth-approve-btn');
      });

      await test.step('Supplicant confirms', async () => {
        await page.waitForURL(
          new RegExp(PAIR_V2_ROUTES.SUPPLICANT_CONNECT_THIS_DEVICE)
        );
        if (SHOTS)
          await page.screenshot({
            path: path.join(SHOTS, '4-supplicant-connect-this-device.png'),
          });
        await sleep(WATCH_MS); // supplicant: connect this device
        await page.getByTestId('pair2-supp-connect-btn').click();
      });

      await test.step('Both sides reach sync success', async () => {
        await page.waitForURL(
          new RegExp(PAIR_V2_ROUTES.SUPPLICANT_SYNC_SUCCESS),
          { timeout: 60_000 }
        );
        await waitForUrlContaining(
          authority,
          PAIR_V2_ROUTES.AUTHORITY_SYNC_SUCCESS,
          60_000
        );
        if (SHOTS)
          await page.screenshot({
            path: path.join(SHOTS, '6-supplicant-sync-success.png'),
          });
        await sleep(WATCH_MS); // both: sync success
      });

      await test.step('Supplicant receives real Sync scoped keys', async () => {
        const login = await readCapturedOAuthLogin(page);
        expect(
          login,
          'supplicant should have emitted oauth_login'
        ).not.toBeNull();
        const { code, state } = login as { code: string; state: string };
        expect(code, 'oauth_login should carry a code').toBeTruthy();
        expect(state).toBe(crypto.state);

        const scopedKeys = await redeemAndDecrypt(
          target.authServerUrl,
          crypto,
          code,
          process.env.CI ? process.env.CI_WAF_TOKEN : undefined
        );
        const oldsync = scopedKeys[OLDSYNC_SCOPE];
        expect(oldsync?.k, 'oldsync scoped key material').toBeTruthy();
        expect(oldsync?.kty).toBe('oct');
      });
    });

    test('supplicant cancels: both sides end on timeout_and_cancel, no device', async ({
      target,
      syncOAuthBrowserPages: { page },
      testAccountTracker,
      marionetteAuthority,
    }) => {
      const authority: MarionetteClient = marionetteAuthority.client;
      const crypto = generateSupplicantCrypto();

      const credentials = await test.step('Authority signs in', async () => {
        const creds = await testAccountTracker.signUp();
        await signInAuthorityViaMarionette(
          authority,
          target.contentServerUrl,
          creds.email,
          creds.password
        );
        expect((await getSignedInUser(authority)).signedIn).toBe(true);
        return creds;
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
        await installSupplicantWebChannelStub(page, crypto);
        await page.goto(pairUrl, { waitUntil: 'load' });
        await page.waitForURL(
          new RegExp(PAIR_V2_ROUTES.SUPPLICANT_CONNECT_THIS_DEVICE)
        );
        // The authority received the request and is on its approval screen.
        await waitForUrlContaining(
          authority,
          PAIR_V2_ROUTES.AUTHORITY_APPROVE_SIGNIN
        );
      });

      await test.step('Supplicant cancels', async () => {
        await page.getByTestId('pair2-supp-cancel-btn').click();
        await page.waitForURL(
          new RegExp(PAIR_V2_ROUTES.SUPPLICANT_TIMEOUT_AND_CANCEL)
        );
      });

      await test.step('Authority is sent to timeout_and_cancel', async () => {
        const url = await waitForUrlContaining(
          authority,
          PAIR_V2_ROUTES.AUTHORITY_TIMEOUT_AND_CANCEL,
          30_000
        );
        expect(url).not.toContain('sync_success');
      });

      await test.step('No device registered on the account', async () => {
        await sleep(3_000);
        const devices = await target.authClient.deviceList(
          credentials.sessionToken as string
        );
        expect(devices.find(isMobileDevice)).toBeFalsy();
      });
    });
  });
});
