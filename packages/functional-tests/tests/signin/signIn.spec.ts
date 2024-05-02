/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { LoginPage } from '../../pages/login';

test.describe('severity-2 #smoke', () => {
  test.describe('signin here', () => {
    test('signin verified with incorrect password, click `forgot password?`', async ({
      target,
      page,
      pages: { configPage, login, resetPassword },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.fixme(
        config.featureFlags.resetPasswordWithCode === true,
        'see FXA-9612'
      );

      const credentials = await testAccountTracker.signUp();

      await page.goto(target.contentServerUrl);
      await login.setEmail(credentials.email);
      await login.clickSubmit();
      await login.setPassword('incorrect password');
      await login.clickSubmit();

      // Verify the error
      await expect(login.getTooltipError()).toContainText('Incorrect password');

      //Click forgot password link
      await login.clickForgotPassword();

      //Verify reset password header
      expect(await resetPassword.resetPasswordHeader()).toBe(true);
    });

    test('signin with email with leading/trailing whitespace on the email', async ({
      target,
      page,
      pages: { login },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      const emailWithleadingSpace = '   ' + credentials.email;
      await page.goto(target.contentServerUrl);
      await login.fillOutEmailFirstSignIn(
        emailWithleadingSpace,
        credentials.password
      );

      // Verify the header after login
      expect(await login.isUserLoggedIn()).toBe(true);

      // Need to clear the cache to get the new email
      await login.clearCache();

      await page.goto(target.contentServerUrl);
      const emailWithTrailingSpace = credentials.email + '  ';
      await login.fillOutEmailFirstSignIn(
        emailWithTrailingSpace,
        credentials.password
      );

      // Verify the header after login
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('signin verified with password that incorrectly has leading whitespace', async ({
      target,
      page,
      pages: { login },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(target.contentServerUrl);
      await login.setEmail(credentials.email);
      await login.clickSubmit();
      await login.setPassword(' ' + credentials.password);
      await login.clickSubmit();

      // Verify the error
      await expect(login.getTooltipError()).toContainText('Incorrect password');
    });

    test('login as an existing user', async ({
      target,
      page,
      pages: { login, settings },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      // Sign out
      await settings.signOut();
      // Login as existing user
      await login.setEmail(credentials.email);
      await login.clickSubmit();
      await login.setPassword(credentials.password);
      await login.clickSubmit();

      // Verify the header after login
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('with bounced email', async ({
      target,
      page,
      pages: { configPage, login },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes === true,
        'bounced email functionality does not currently work for react'
      );

      const credentials = await testAccountTracker.signUpSync();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&`
      );
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );

      // Verify the header after login
      await expect(login.signInCodeHeader).toBeVisible();
      await target.authClient.accountDestroy(
        credentials.email,
        credentials.password,
        {},
        credentials.sessionToken
      );
      await page.waitForURL(/signin_bounced/);

      //Verify sign in bounced header
      expect(await login.isSigninBouncedHeader()).toBe(true);

      await login.clickBouncedCreateAccount();

      //Verify user redirected to login page
      await login.waitForEmailHeader();
      expect(await login.getEmailInput()).toContain('');
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  login: LoginPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await login.fillOutEmailFirstSignIn(credentials.email, credentials.password);

  //Verify logged in on Settings page
  expect(await login.isUserLoggedIn()).toBe(true);

  return credentials;
}
