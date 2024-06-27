/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

test.describe('severity-2 #smoke', () => {
  test.describe('signin', () => {
    test('signin verified with incorrect password, click `forgot password?`', async ({
      target,
      page,
      pages: { resetPassword, signin },
      testAccountTracker,
    }) => {
      //onst credentials = await testAccountTracker.signUp();

      //await page.goto(target.contentServerUrl);
      //await signin.fillOutEmailFirstForm(credentials.email);
      //await signin.fillOutPasswordForm('incorrect password');

      // Verify the error
      //await expect(page.getByText('Incorrect password')).toBeVisible();

      //Click forgot password link
      await signin.forgotPasswordLink.click();

      //Verify reset password header
      await expect(resetPassword.resetPasswordHeading).toBeVisible();
    });

    test('signin with email with leading/trailing whitespace on the email', async ({
      target,
      page,
      pages: { settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      const emailWithleadingSpace = '   ' + credentials.email;
      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(emailWithleadingSpace);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();

      // Need to clear the cache to get the new email
      await signin.clearCache();

      await page.goto(target.contentServerUrl);
      const emailWithTrailingSpace = credentials.email + '  ';
      await signin.fillOutEmailFirstForm(emailWithTrailingSpace);
      await signin.fillOutPasswordForm(credentials.password);

      // Verify the header after login
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('signin verified with password that incorrectly has leading whitespace', async ({
      target,
      page,
      pages: { signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(' ' + credentials.password);

      // Verify the error
      await expect(page.getByText('Incorrect password')).toBeVisible();
    });

    test('login as an existing user', async ({
      target,
      page,
      pages: { settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

      // Sign out
      await settings.signOut();
      // Login as existing user
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      // Verify the header after login
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('with bounced email', async ({
      target,
      syncBrowserPages: { page, signin },
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'TODO in FXA-9880, will need email bounce mocking for React signin testing'
      );
      const credentials = await testAccountTracker.signUpSync();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email&`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      // Verify the header after login
      await expect(page).toHaveURL(/signin_token_code/);
      await target.authClient.accountDestroy(
        credentials.email,
        credentials.password,
        {},
        credentials.sessionToken
      );
      // in react, there is no polling on the page to check for bounces
      // redirects to /signin_bounced only when an error is returned
      // bounce error requires a bounce response from the server
      await page.waitForURL(/signin_bounced/);

      // Verify sign in bounced header
      await expect(signin.signinBouncedHeading).toBeVisible();

      await signin.signinBouncedCreateAccountButton.click();

      // Verify user redirected to login page
      // in backbone, user currently redirected to /signup
      await expect(signin.emailFirstHeading).toBeVisible();
      await expect(signin.emailTextbox).toHaveValue('');
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);

  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
