/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand, createCustomEventDetail } from '../../lib/channels';
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

      relier.goto();

      relier.clickEmailFirst();

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

      relier.goto();

      relier.clickEmailFirst();

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
      test.fixme(true, 'Fix required as of 2024/03/18 (see FXA-9306).');
      const { email, password } =
        testAccountTracker.generateSignupAccountDetails();
      const customEventDetail = createCustomEventDetail(
        FirefoxCommand.FxAStatus,
        {
          capabilities: {
            choose_what_to_sync: true,
            engines: ['bookmarks', 'history'],
          },
          signedInUser: null,
        }
      );

      await signup.goto('/authorization', syncMobileOAuthQueryParams);

      await signup.fillOutEmailForm(email);
      await page.waitForURL(/signup/, { waitUntil: 'load' });
      await signup.waitForRoot();

      await expect(signup.signupFormHeading).toBeVisible();

      await signup.sendWebChannelMessage(customEventDetail);

      // Only engines provided via web channel for Sync mobile are displayed
      await expect(login.CWTSEngineHeader).toBeVisible();
      await expect(login.CWTSEngineBookmarks).toBeVisible();
      await expect(login.CWTSEngineHistory).toBeVisible();
      await expect(login.CWTSEnginePasswords).toBeHidden();
      await expect(login.CWTSEngineAddons).toBeHidden();
      await expect(login.CWTSEngineOpenTabs).toBeHidden();
      await expect(login.CWTSEnginePreferences).toBeHidden();
      await expect(login.CWTSEngineCreditCards).toBeHidden();
      await expect(login.CWTSEngineAddresses).toBeHidden();

      await signup.fillOutSignupForm(password, AGE_21);
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);
      await page.waitForURL(/connect_another_device/);

      await signup.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    });
  });
});
