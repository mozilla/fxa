/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCode } from 'fxa-settings/src/lib/totp';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { EmailHeader, EmailType } from '../../lib/email';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SigninReactPage } from '../../pages/signinReact';
import { SettingsPage } from '../../pages/settings';

test.describe('severity-2 #smoke', () => {
  test.beforeEach(async () => {
    test.slow();
  });

  test.describe('Firefox Desktop Sync v3 sign in', () => {
    test('verified email, does not need to confirm', async ({
      target,
      syncBrowserPages: { page, signinReact, connectAnotherDevice },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();
    });

    test('verified email with signin verification, can ask to resend code', async ({
      target,
      syncBrowserPages: {
        page,
        signinReact,
        connectAnotherDevice,
        signinTokenCode,
      },
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'FXA-9519 error on resend code, authentication token not found'
      );
      // Simulate a new sign up that requires a signin verification code.
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        service: 'sync',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(signinTokenCode.resendButton).toBeVisible();
      await signinTokenCode.resendButton.click();
      await expect(signinTokenCode.successMessage).toBeVisible();
      await expect(signinTokenCode.successMessage).toContainText(
        /Email re-?sent/
      );
      const code = await target.emailClient.getSigninTokenCode(
        credentials.email
      );
      await signinTokenCode.input.fill(code);
      await signinTokenCode.submit.click();

      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();
    });

    test('verified email with signin verification, accepts valid sign in code', async ({
      target,
      syncBrowserPages: {
        page,
        signinReact,
        connectAnotherDevice,
        signinTokenCode,
      },
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'FXA-9519 error on code submission, authentication token not found'
      );
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        service: 'sync',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      const code = await target.emailClient.getSigninTokenCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();
    });

    test('verified email with signin verification, rejects invalid signin code', async ({
      target,
      syncBrowserPages: {
        page,
        signinReact,
        connectAnotherDevice,
        signinTokenCode,
      },
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'FXA-9519 error on code submission, authentication token not found'
      );
      // Simulate a new sign up that requires a signin verification code.
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        service: 'sync',
        preVerified: 'true',
      });

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      // Input invalid code and verify the tooltip error
      await signinTokenCode.fillOutCodeForm('000000');

      await expect(page.getByText('Invalid or expired')).toBeVisible();

      const code = await target.emailClient.getSigninTokenCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();
    });

    test('unverified email', async ({
      target,
      syncBrowserPages: {
        page,
        signinReact,
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
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(confirmSignupCode.heading).toBeVisible();
      // in React, signin verification code is sent and used for confirmation
      const code = await target.emailClient.getSigninTokenCode(
        credentials.email
      );
      await confirmSignupCode.fillOutCodeForm(code);

      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();
    });

    test('add TOTP and confirm sync signin', async ({
      target,
      syncBrowserPages: {
        page,
        signinReact,
        connectAnotherDevice,
        settings,
        totp,
        signinTotpCode,
      },
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'FXA-9519 session not verified after totp, stuck in a loop of requesting password + totp'
      );
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );

      await settings.goto();
      await settings.totp.addButton.click();
      const { secret } = await totp.fillOutTotpForms();
      await settings.signOut();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync`,
        { waitUntil: 'load' }
      );

      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/signin_totp_code/);
      await expect(signinTotpCode.heading).toBeVisible();
      const code = await getCode(secret);
      await signinTotpCode.fillOutCodeForm(code);

      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();
      await connectAnotherDevice.notNowButton.click();

      // Required before teardown
      await expect(settings.settingsHeading).toBeVisible();
      await settings.disconnectTotp();
    });

    test('verified email, in blocked state', async ({
      target,
      syncBrowserPages: {
        page,
        signinReact,
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
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinUnblock.fillOutCodeForm(code);

      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();

      //Delete blocked account, required before teardown
      await connectAnotherDevice.notNowButton.click();
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(credentials.password);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });

  test.describe('severity-1 #smoke', () => {
    test.describe('OAuth and Fx Desktop handshake', () => {
      test('user signed into browser and OAuth login', async ({
        target,
        syncBrowserPages: { connectAnotherDevice, page, signinReact, relier },
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUp();

        await page.goto(
          target.contentServerUrl +
            '?context=fx_desktop_v3&entrypoint=fxa%3Aenter_email&service=sync&action=email'
        );
        await signinReact.fillOutEmailFirstForm(credentials.email);
        await signinReact.fillOutPasswordForm(credentials.password);
        await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();

        await relier.goto();
        await relier.clickEmailFirst();

        // User can sign in with cached credentials, no password needed.
        await expect(signinReact.cachedSigninHeading).toBeVisible();
        await expect(page.getByText(credentials.email)).toBeVisible();
        await signinReact.signInButton.click();

        expect(await relier.isLoggedIn()).toBe(true);

        await relier.signOut();

        // Attempt to sign back in
        await relier.clickEmailFirst();

        await expect(signinReact.cachedSigninHeading).toBeVisible();
        await expect(page.getByText(credentials.email)).toBeVisible();
        await signinReact.signInButton.click();

        expect(await relier.isLoggedIn()).toBe(true);
      });
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
