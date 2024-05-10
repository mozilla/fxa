/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninReactPage } from '../../pages/signinReact';

test.describe('severity-2 #smoke', () => {
  test.describe('signin here', () => {
    test('signin verified with incorrect password, click `forgot password?`', async ({
      target,
      page,
      pages: { resetPasswordReact, signinReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(target.contentServerUrl);
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm('incorrect password');

      // Verify the error
      await expect(page.getByText('Incorrect password')).toBeVisible();

      //Click forgot password link
      await signinReact.forgotPasswordLink.click();

      //Verify reset password header
      await expect(resetPasswordReact.resetPasswordHeading).toBeVisible();
    });

    test('signin with email with leading/trailing whitespace on the email', async ({
      target,
      page,
      pages: { settings, signinReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(target.contentServerUrl);
      await signinReact.fillOutEmailFirstForm(' ' + credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      // Verify the header after login
      await expect(settings.settingsHeading).toBeVisible();
      await settings.signOut();

      // Need to clear the cache to get the new email
      await signinReact.clearCache();

      await page.goto(target.contentServerUrl);
      await signinReact.fillOutEmailFirstForm(credentials.email + ' ');
      await signinReact.fillOutPasswordForm(credentials.password);

      // Verify the header after login
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('signin verified with password that incorrectly has leading whitespace', async ({
      target,
      page,
      pages: { signinReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(target.contentServerUrl);
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(' ' + credentials.password);

      // Verify the error
      await expect(page.getByText('Incorrect password')).toBeVisible();
    });

    test('login as an existing user', async ({
      target,
      page,
      pages: { signinReact, settings },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );

      // Sign out
      await settings.signOut();
      // Login as existing user
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      // Verify the header after login
      await expect(settings.settingsHeading).toBeVisible();
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
  settings: SettingsPage,
  signinReact: SigninReactPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await signinReact.fillOutEmailFirstForm(credentials.email);
  await signinReact.fillOutPasswordForm(credentials.password);

  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
