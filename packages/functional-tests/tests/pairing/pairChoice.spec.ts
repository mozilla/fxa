/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand } from '../../lib/channels';
import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('Pair entry flow', () => {
    test('direct /pair dispatches fxa_status and oauth_flow_begin and reveals the choice screen', async ({
      target,
      syncOAuthBrowserPages: { page, settings, signin, signinTokenCode },
      testAccountTracker,
    }) => {
      // /pair requires a signed-in browser to reveal the choice screen; a fresh
      // browser is redirected to sign-in first.
      const credentials = await testAccountTracker.signUpSync();
      await page.goto(`${target.contentServerUrl}/pair`);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await page.waitForURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      // testid avoids the Localized/label text-content quirk that confuses
      // getByLabel/getByRole here.
      await expect(page.getByTestId('has-mobile')).toBeVisible();
      await expect(page).toHaveURL(/\/pair(\?|$)/);

      await settings.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await settings.checkWebChannelMessage(FirefoxCommand.OAuthFlowBegin);
    });

    test('Continue advances to the download view when no mobile is selected', async ({
      target,
      syncOAuthBrowserPages: { page, signin, signinTokenCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();
      await page.goto(`${target.contentServerUrl}/pair`);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await page.waitForURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      // Click the label so React's onChange fires; the radio is hidden behind
      // it, and check() on the input itself fails actionability.
      await page.locator('label[for="needs-mobile"]').click();
      await expect(page.getByTestId('pair-continue-btn')).toBeEnabled();

      await page.getByTestId('pair-continue-btn').click();

      await expect(page.locator('#pair-header-mobile')).toBeVisible();
    });

    test('direct /connect_another_device dispatches fxa_status and oauth_flow_begin', async ({
      target,
      syncOAuthBrowserPages: { page, settings },
    }) => {
      await page.goto(`${target.contentServerUrl}/connect_another_device`);

      await settings.checkWebChannelMessage(FirefoxCommand.FxAStatus);
      await settings.checkWebChannelMessage(FirefoxCommand.OAuthFlowBegin);
    });

    // v2 removes the supplicant choice screen: a native-camera scan opens
    // /pair#...&v=2, which forwards straight into the single-QR v2 supplicant
    // flow instead of the has-mobile / needs-mobile choice (FXA-13865). No
    // sign-in is needed on the supplicant, so this is deterministic.
    test('v2 supplicant URL bypasses the choice screen', async ({
      target,
      syncOAuthBrowserPages: { page },
    }) => {
      await page.goto(
        `${target.contentServerUrl}/pair#channel_id=testchannelid&channel_key=testchannelkey&v=2`
      );

      await page.waitForURL(/\/pair\/supplicant\/approve_signin/);
      // The v1 choice screen must not appear in the v2 flow.
      await expect(page.getByTestId('has-mobile')).toBeHidden();
    });

    // Firefox mobile does not open /pair; app-services opens /pair/supp with the
    // OAuth params in the query and the channel + v=2 marker in the fragment.
    // That entry must also forward into the v2 supplicant flow, preserving both
    // the query and the fragment. (FXA-13865 — the on-device entry point.)
    test('v2 /pair/supp entry forwards to the v2 supplicant flow', async ({
      target,
      syncOAuthBrowserPages: { page },
    }) => {
      await page.goto(
        `${target.contentServerUrl}/pair/supp?client_id=a2270f727f45f648&scope=profile#channel_id=testchannelid&channel_key=testchannelkey&v=2`
      );

      await page.waitForURL(/\/pair\/supplicant\/approve_signin/);
      // The OAuth query and the channel fragment must survive the forward.
      expect(page.url()).toContain('client_id=a2270f727f45f648');
      expect(page.url()).toContain('channel_id=testchannelid');
      expect(page.url()).toContain('v=2');
    });
  });
});
