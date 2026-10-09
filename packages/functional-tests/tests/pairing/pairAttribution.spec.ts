/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * FXA-14132 — the pairing-authority approval page must report a session
 * entrypoint.
 *
 * Firefox opens the approval page as a brand-new navigation carrying only
 * `client_id`, `scope`, `email`, `uid`, `channel_id` and `redirect_uri` (see
 * `buildAuthorityOAuthUrl`), so `/pair` stashes its attribution params and the
 * approval page restores them.
 *
 * Playwright only — no Marionette needed. `syncOAuthBrowserPages` is a real
 * Firefox, so it would act on `fxaccounts:pair_preferences` and start a
 * navigation of its own; the test drops that message before the Continue
 * click. The existing two-device flow lives in
 * `pairingFlow.spec.ts` and is deliberately left alone.
 */

import { GleanEventsHelper } from '../../lib/glean';
import { buildAuthorityOAuthUrl } from '../../lib/pairing-helpers';
import { gotoSyncSession } from '../../lib/sync-helpers';
import { test, expect } from '../../lib/fixtures/standard';

// Any 32-hex value: no live supplicant is needed to render the approval page.
const MOCK_CHANNEL_ID = 'a'.repeat(32);

// The first test signs up, runs the sync OAuth flow, waits on a confirmation
// email and then loads the approval page — the same budget the other pairing
// specs use.
test.setTimeout(120_000);

test.describe('severity-2 #smoke', () => {
  test.describe('Pair authority attribution', () => {
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
      // Click the label, not the input: the radio is visually hidden behind its
      // label, so clicking the input fails actionability (same as
      // `pairChoice.spec.ts`).
      await page.locator('label[for="has-mobile"]').click();
      await expect(page.getByTestId('pair-continue-btn')).toBeEnabled();
      // Firefox answers pair_preferences by loading about:preferences in this
      // tab, which races the goto below. Drop the message and record it instead.
      await page.evaluate(() => {
        const dispatch = window.dispatchEvent.bind(window);
        window.dispatchEvent = (event: Event) => {
          if (event.type === 'WebChannelMessageToChrome') {
            const detail = (event as CustomEvent).detail;
            const { message } =
              typeof detail === 'string' ? JSON.parse(detail) : detail;
            if (message?.command === 'fxaccounts:pair_preferences') {
              (window as any).pairPreferencesSent = true;
              return true;
            }
          }
          return dispatch(event);
        };
      });
      await page.getByTestId('pair-continue-btn').click();
      await page.waitForFunction(() => (window as any).pairPreferencesSent);

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
        page.getByRole('heading', { name: /Did you just sign in to/ })
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
        page.getByRole('heading', { name: /Did you just sign in to/ })
      ).toBeVisible();
      await expect(page).toHaveURL(/entrypoint=preferences/);
    });
  });
});
