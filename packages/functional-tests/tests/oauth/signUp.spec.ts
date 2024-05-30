/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.beforeEach(async ({ pages: { configPage } }) => {
    const config = await configPage.getConfig();
    test.skip(
      config.showReactApp.signUpRoutes === true,
      'this test is specific to backbone, skip if serving react'
    );
  });

  test.describe('Oauth sign up', () => {
    test('sign up', async ({
      pages: { login, relier },
      testAccountTracker,
    }) => {
      const { email, password } = testAccountTracker.generateAccountDetails();
      await relier.goto();
      await relier.clickEmailFirst();
      await login.fillOutFirstSignUp(email, password, { verify: false });

      //Verify sign up code header
      await expect(login.signUpCodeHeader).toBeVisible();

      await login.fillOutSignUpCode(email);

      //Verify logged in on relier page
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('signup, bounce email, allow user to restart flow but force a different email', async ({
      target,
      pages: { login, relier, page },
      testAccountTracker,
    }) => {
      const account = testAccountTracker.generateAccountDetails();
      const bouncedAccount = testAccountTracker.generateBouncedAccountDetails();

      await relier.goto();
      await relier.clickEmailFirst();
      await login.fillOutFirstSignUp(
        bouncedAccount.email,
        bouncedAccount.password,
        { verify: false }
      );

      //Verify sign up code header
      await expect(login.signUpCodeHeader).toBeVisible();

      try {
        const accounts = await page.evaluate(() => {
          return JSON.parse(
            localStorage.getItem('__fxa_storage.accounts') || '{}'
          );
        });
        let account;
        Object.keys(accounts).forEach((uid) => {
          const foundAccount = accounts[uid];
          if (foundAccount.email === bouncedAccount.email) {
            account = foundAccount;
          }
        });
        await target.authClient.accountDestroy(
          bouncedAccount.email,
          bouncedAccount.password,
          {},
          account.sessionToken
        );
      } catch (e) {
        // ignore
      }

      //Verify error message
      await expect(login.getTooltipError()).toContainText(
        'Your confirmation email was just returned. Mistyped email?'
      );

      await login.setEmail('');
      await login.fillOutFirstSignUp(account.email, account.password, {
        verify: false,
      });

      //Verify sign up code header
      await expect(login.signUpCodeHeader).toBeVisible();
      await login.fillOutSignUpCode(account.email);

      //Verify logged in on relier page
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });

  test.describe('Oauth sign up success', () => {
    test('a success screen is available', async ({
      target,
      page,
      pages: { relier, login },
    }) => {
      await login.clearCache();
      await page.goto(
        `${target.contentServerUrl}/oauth/success/${target.relierClientID}`
      );

      //Verify oauth success header
      expect(await relier.isOauthSuccessHeader()).toBe(true);
    });
  });
});
