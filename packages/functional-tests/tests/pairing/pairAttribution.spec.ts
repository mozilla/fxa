/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The pairing-authority approval page must report a session entrypoint.
 *
 * Firefox opens the approval page as a brand-new navigation carrying only
 * `client_id`, `scope`, `email`, `uid`, `channel_id` and `redirect_uri` (see
 * `buildAuthorityOAuthUrl`), so `/pair` stashes its attribution params and the
 * approval page restores them.
 */

import { GleanEventsHelper } from '../../lib/glean';
import {
  buildAuthorityOAuthUrl,
  isPairRoutesReact,
} from '../../lib/pairing-helpers';
import { gotoSyncSession } from '../../lib/sync-helpers';
import { test, expect } from '../../lib/fixtures/standard';

// Any 32-hex value: no live supplicant is needed to render the approval page.
const MOCK_CHANNEL_ID = 'a'.repeat(32);

test.describe('severity-2 #smoke', () => {
  test.describe('Pair authority attribution', () => {
    let pairRoutesReact: boolean;
    test.beforeAll(async ({ browser, target }) => {
      pairRoutesReact = await isPairRoutesReact(browser, target);
    });

    test.beforeEach(() => {
      test.skip(
        !pairRoutesReact,
        'the attribution hand-off is implemented in fxa-settings (React) only'
      );
    });

    test('carries the /pair entrypoint into the approval URL and the cad_approve_device.view ping', async ({
      target,
      syncOAuthBrowserPages: { page, signin, signinTokenCode },
      testAccountTracker,
    }) => {
      // syncOAuthBrowserPages runs in a separate Firefox instance, so attach a
      // helper to this page before any navigation.
      const gleanEventsHelper = new GleanEventsHelper(page);
      await gleanEventsHelper.start();

      // /pair only reveals the choice screen to a signed-in browser. The page
      // bounces through the sync OAuth flow first, carrying the entrypoint.
      const credentials = await testAccountTracker.signUpSync();
      await gotoSyncSession(page, target, 'entrypoint=fxa_app_menu');
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await page.waitForURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      // Hand off to the browser — this is what stashes the attribution params.
      await page.getByTestId('has-mobile').click();
      await page.getByTestId('pair-continue-btn').click();

      // Stand in for the navigation real Firefox makes once the supplicant
      // connects.
      await page.goto(
        buildAuthorityOAuthUrl(target.contentServerUrl, {
          email: credentials.email,
          uid: credentials.uid,
          channelId: MOCK_CHANNEL_ID,
        })
      );

      await expect(
        page.getByRole('heading', { name: /Did you just sign in to Firefox/ })
      ).toBeVisible();
      await expect(page).toHaveURL(/entrypoint=fxa_app_menu/);

      const ping = await gleanEventsHelper.waitForEvent(
        'cad_approve_device_view'
      );
      expect(ping.payload.metrics.string['session.entrypoint']).toBe(
        'fxa_app_menu'
      );
    });

    test('falls back to the preferences entrypoint when /pair was never visited', async ({
      target,
      page,
      testAccountTracker,
    }) => {
      // No /pair visit, so nothing is stashed — this is the user who started
      // pairing straight from Firefox's about:preferences dialog.
      const credentials = await testAccountTracker.signUpSync();
      await page.goto(
        buildAuthorityOAuthUrl(target.contentServerUrl, {
          email: credentials.email,
          uid: credentials.uid,
          channelId: MOCK_CHANNEL_ID,
        })
      );

      await expect(
        page.getByRole('heading', { name: /Did you just sign in to Firefox/ })
      ).toBeVisible();
      await expect(page).toHaveURL(/entrypoint=preferences/);
    });
  });
});
