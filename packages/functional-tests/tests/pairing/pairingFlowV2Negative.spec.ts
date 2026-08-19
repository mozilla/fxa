/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * v2 pairing negative paths (FXA-13869), the counterpart of
 * `pairingFlowNegative.spec.ts` for the v2 flow.
 *
 * Same topology as `pairingFlowV2.spec.ts`: real custom Firefox authority
 * (Marionette) + Playwright supplicant with real crypto stubs. These cover the
 * abort routes: when the supplicant cancels, both sides land on
 * timeout_and_cancel and no device is registered on the account.
 *
 * Set PAIRING_V2_ENABLED=1 and FIREFOX_BINARY to run.
 */

import { test, expect } from '../../lib/fixtures/pairing';
import { MarionetteClient } from '../../lib/marionette';
import { PAIR_V2_ROUTES } from '../../lib/pairing-constants';
import {
  signInAuthorityViaMarionette,
  getSignedInUser,
  startPairingFlowV2,
  waitForUrlContaining,
  sleep,
} from '../../lib/pairing-helpers';
import {
  generateSupplicantCrypto,
  installSupplicantWebChannelStub,
} from '../../lib/pairing-supplicant-harness';

const ELIGIBLE_ENTRYPOINT_QS =
  'context=oauth_webchannel_v1&entrypoint=fxa_app_menu';

function isMobileDevice(d: { type?: string; name?: string }): boolean {
  return d.type === 'mobile' || /Android|Fenix|Firefox/i.test(d.name || '');
}

test.setTimeout(180_000);

test.describe('severity-2 #smoke', () => {
  test.describe.serial('v2 pairing negative paths', () => {
    test.beforeEach(() => {
      test.skip(
        !process.env.PAIRING_V2_ENABLED,
        'Set PAIRING_V2_ENABLED=1 to run the v2 pairing negative paths'
      );
      test.skip(
        !process.env.FIREFOX_BINARY,
        'FIREFOX_BINARY must point at a v2-capable Firefox build'
      );
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
