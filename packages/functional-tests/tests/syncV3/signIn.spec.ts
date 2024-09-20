/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCode } from 'fxa-settings/src/lib/totp';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

test.describe('severity-2 #smoke', () => {
  test.describe('Firefox Desktop Sync v3 sign in', () => {
    test('verified email, does not need to confirm', async ({
      target,
      syncBrowserPages: { page, signin, connectAnotherDevice },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
    });

    test('verified email with signin verification, can ask to resend code', async ({
      target,
      syncBrowserPages: { page, signin, connectAnotherDevice, signinTokenCode },
      testAccountTracker,
    }) => {
      // Simulate a new sign up that requires a signin verification code.
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        service: 'sync',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      // Click resend link
      await expect(page).toHaveURL(/signin_token_code/);
      await signinTokenCode.resendCodeButton.click();
      await expect(page.getByText(/Email re-?sent/)).toBeVisible();
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('verified email with signin verification, accepts valid sign in code', async ({
      target,
      syncBrowserPages: { page, signin, connectAnotherDevice, signinTokenCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        service: 'sync',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/signin_token_code/);
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('verified email with signin verification, rejects invalid signin code', async ({
      target,
      syncBrowserPages: { page, signin, connectAnotherDevice, signinTokenCode },
      testAccountTracker,
    }) => {
      // Simulate a new sign up that requires a signin verification code.
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        service: 'sync',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      // Input invalid code and verify the tooltip error
      await expect(page).toHaveURL(/signin_token_code/);
      await signinTokenCode.fillOutCodeForm('000000');

      await expect(page.getByText('Invalid or expired')).toBeVisible();

      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('unverified email', async ({
      target,
      syncBrowserPages: {
        page,
        signin,
        connectAnotherDevice,
        confirmSignupCode,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        service: 'sync',
        preVerified: 'false',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/confirm_signup_code/);
      // Since the account is not verified yet, we'd expect to see the signup code confirmation
      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await confirmSignupCode.fillOutCodeForm(code);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('add TOTP and confirm sync signin', async ({
      target,
      syncBrowserPages: {
        page,
        signin,
        connectAnotherDevice,
        settings,
        totp,
        signinTotpCode,
      },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

      await settings.goto();
      await settings.totp.addButton.click();
      const { secret } = await totp.fillOutTotpForms();
      await expect(settings.totp.status).toHaveText('Enabled');
      await settings.signOut();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`,
        { waitUntil: 'load' }
      );

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/signin_totp_code/);
      const code = await getCode(secret);
      await signinTotpCode.fillOutCodeForm(code);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      // Required before teardown
      await settings.goto();
      await settings.disconnectTotp();
    });

    test('verified email, in blocked state', async ({
      target,
      syncBrowserPages: {
        page,
        signin,
        signinUnblock,
        connectAnotherDevice,
        settings,
        deleteAccount,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked({
        lang: 'en',
        service: 'sync',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/signin_unblock/);
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinUnblock.fillOutCodeForm(code);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      // Delete blocked account, required before teardown
      await connectAnotherDevice.clickNotNowPair();
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(credentials.password);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
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
