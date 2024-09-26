/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  FF_OAUTH_CLIENT_ID,
  FirefoxCommand,
  FxAStatusResponse,
} from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import { syncMobileOAuthQueryParams } from '../../lib/query-params';

const AGE_21 = '21';

test.describe('severity-1 #smoke', () => {
  test.describe('signup react', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      // Ensure that the feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes !== true,
        'Skip tests if not on React signUpRoutes'
      );
    });

    test('signup oauth', async ({
      page,
      target,
      pages: { confirmSignupCode, relier, signup },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSignupAccountDetails();

      await relier.goto();

      await relier.clickEmailFirst();

      // wait for navigation
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await signup.fillOutEmailForm(email);
      await signup.fillOutSignupForm(password, AGE_21);
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);

      // expect to be redirected to relier after confirming signup code
      await expect(page).toHaveURL(target.relierUrl);
      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
    });

    test('signup oauth with missing redirect_uri', async ({
      page,
      target,
      pages: { confirmSignupCode, relier, signup },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSignupAccountDetails();

      await relier.goto();

      await relier.clickEmailFirst();

      // wait for navigation, and get search params
      await page.waitForURL(/oauth\//);
      const path = new URL(page.url()).pathname;
      const params = new URL(page.url()).searchParams;
      params.delete('redirect_uri');
      params.append('forceExperiment', 'generalizedReactApp');
      params.append('forceExperimentGroup', 'react');

      // reload email-first page without redirect_uri, but with React experiment params
      await page.goto(`${target.contentServerUrl}${path}?${params.toString()}`);
      // expect the url to no longer contain a redirect uri
      await expect(page).toHaveURL(/^((?!redirect_uri).)*$/);

      await signup.fillOutEmailForm(email);
      await signup.fillOutSignupForm(password, AGE_21);
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);
      // redirectUri should have fallen back to the clientInfo config redirect URI
      // Expect to be redirected to relier
      await page.waitForURL(target.relierUrl);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
    });

    test('signup oauth webchannel - sync mobile or FF desktop 123+', async ({
      target,
      syncBrowserPages: { confirmSignupCode, page, login, signup },
      testAccountTracker,
    }) => {
      test.fixme(true, 'Fix required as of 2024/06/28 (see FXA-10003).');
      const { email, password } =
        testAccountTracker.generateSignupAccountDetails();
      const customEventDetail: FxAStatusResponse = {
        id: 'account_updates',
        message: {
          command: FirefoxCommand.FxAStatus,
          data: {
            signedInUser: null,
            clientId: FF_OAUTH_CLIENT_ID,
            capabilities: {
              pairing: false,
              multiService: false,
              choose_what_to_sync: true,
              engines: ['bookmarks', 'history'],
            },
          },
        },
      };

      await signup.goto('/authorization', syncMobileOAuthQueryParams);

      await signup.fillOutEmailForm(email);

      await expect(signup.signupFormHeading).toBeVisible();

      await signup.sendWebChannelMessage(customEventDetail);

      // Only engines provided via web channel for Sync mobile are displayed
      await expect(signup.CWTSEngineHeader).toBeVisible();
      await expect(signup.CWTSEngineBookmarks).toBeVisible();
      await expect(signup.CWTSEngineHistory).toBeVisible();
      await expect(signup.CWTSEnginePasswords).toBeHidden();
      await expect(signup.CWTSEngineAddons).toBeHidden();
      await expect(signup.CWTSEngineOpenTabs).toBeHidden();
      await expect(signup.CWTSEnginePreferences).toBeHidden();
      await expect(signup.CWTSEngineCreditCards).toBeHidden();
      await expect(signup.CWTSEngineAddresses).toBeHidden();

      await signup.fillOutSignupForm(password, AGE_21);

      await expect(page).toHaveURL(/confirm_signup_code/);

      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);

      await expect(page).toHaveURL(/pair/);
      await signup.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    });
  });
});
