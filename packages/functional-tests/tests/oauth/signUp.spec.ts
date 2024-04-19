/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  test,
  expect,
  SIGNIN_EMAIL_PREFIX,
  BOUNCED_EMAIL_PREFIX,
  PASSWORD,
} from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.beforeEach(async ({ pages: { configPage } }) => {
    const config = await configPage.getConfig();
    test.skip(
      config.showReactApp.signUpRoutes === true,
      'this test is specific to backbone, skip if serving react'
    );
    test.slow();
  });

  test.describe('Oauth sign up', () => {
    test('sign up', async ({ emails, pages: { login, relier } }) => {
      const [email] = emails;
      await relier.goto();
      await relier.clickEmailFirst();
      await login.fillOutFirstSignUp(email, PASSWORD, { verify: false });

      //Verify sign up code header
      await expect(login.signUpCodeHeader).toBeVisible();

      await login.fillOutSignUpCode(email);

      //Verify logged in on relier page
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });

  test.describe('Oauth sign up', () => {
    test.use({
      emailOptions: [
        { prefix: SIGNIN_EMAIL_PREFIX, password: PASSWORD },
        { prefix: BOUNCED_EMAIL_PREFIX, password: PASSWORD },
      ],
    });
    test('signup, bounce email, allow user to restart flow but force a different email', async ({
      emails,
      target,
      pages: { login, relier, page },
    }) => {
      const [email, bouncedEmail] = emails;

      await relier.goto();
      await relier.clickEmailFirst();
      await login.fillOutFirstSignUp(bouncedEmail, PASSWORD, { verify: false });

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
          if (foundAccount.email === bouncedEmail) {
            account = foundAccount;
          }
        });
        await target.authClient.accountDestroy(
          bouncedEmail,
          PASSWORD,
          {},
          account.sessionToken
        );
      } catch (e) {
        // ignore
      }

      //Verify error message
      expect(await login.getTooltipError()).toContain(
        'Your confirmation email was just returned. Mistyped email?'
      );

      await login.setEmail('');
      await login.fillOutFirstSignUp(email, PASSWORD, { verify: false });

      //Verify sign up code header
      await expect(login.signUpCodeHeader).toBeVisible();
      await login.fillOutSignUpCode(email);

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
