/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import { syncDesktopOAuthQueryParams } from '../../lib/query-params';

const AGE_21 = '21';

test.describe('severity-1 #smoke', () => {
  test.describe('signup react', () => {
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
      await expect(signup.emailFormHeading).toBeVisible();
      const path = new URL(page.url()).pathname;
      const params = new URL(page.url()).searchParams;
      params.delete('redirect_uri');

      // reload email-first page without redirect_uri
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

    test('signup oauth webchannel with Sync desktop', async ({
      target,
      syncOAuthBrowserPages: { confirmSignupCode, page, signup },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSignupAccountDetails();

      await signup.goto('/authorization', syncDesktopOAuthQueryParams);

      await signup.fillOutEmailForm(email);

      await expect(signup.signupFormHeading).toBeVisible();

      await expect(signup.CWTSEngineHeader).toBeVisible();
      await expect(signup.CWTSEngineBookmarks).toBeVisible();
      await expect(signup.CWTSEngineHistory).toBeVisible();

      await signup.fillOutSignupForm(password, AGE_21);

      await expect(page).toHaveURL(/confirm_signup_code/);

      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);

      await expect(page).toHaveURL(/pair/);
      await signup.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    });
  });
});
