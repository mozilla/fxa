/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { getCode } from 'packages/fxa-settings/src/lib/totp';

test.describe('recovery key promo', () => {
  test.describe('inline', () => {
    test.beforeEach(async ({ pages: { configPage } }, { project }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags.recoveryCodeSetupOnSyncSignIn !== true,
        'inline recovery key setup is not enabled'
      );
    });

    test('not shown after signup', async ({
      target,
      syncBrowserPages: { page, signup, login, signupConfirmedSync },
      testAccountTracker,
    }) => {
      const credentials = testAccountTracker.generateSignupAccountDetails();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await page.waitForURL(/\//);
      await signup.fillOutEmailForm(credentials.email);
      await signup.fillOutSyncSignupForm(credentials.password);
      await signup.page.waitForURL(/confirm_signup_code/);

      const code = await target.emailClient.getVerifyShortCode(
        credentials.email
      );
      await login.setCode(code);
      await login.clickSubmit();

      await expect(page).toHaveURL(/signup_confirmed_sync/);
      await expect(signupConfirmedSync.bannerConfirmed).toBeVisible();
    });

    test('not shown if user already has a recovery key', async ({
      target,
      syncBrowserPages: {
        page,
        signin,
        connectAnotherDevice,
        settings,
        recoveryKey,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      // Sign-in without Sync, otw you will get prompted to create a recovery key
      await page.goto(target.contentServerUrl);
      await page.waitForURL(/\//);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await page.waitForURL(/settings/);
      await settings.recoveryKey.createButton.click();
      await recoveryKey.acknowledgeInfoForm();
      await recoveryKey.fillOutConfirmPasswordForm(credentials.password);
      await recoveryKey.clickDownload();
      await recoveryKey.finishButton.click();

      // Verify status as 'enabled'
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Enabled');

      await settings.signOut();

      // Not shown recovery key promo
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('can setup recovery key inline after sign-in', async ({
      target,
      syncBrowserPages: {
        page,
        inlineRecoveryKey,
        signin,
        connectAnotherDevice,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await inlineRecoveryKey.getInlineRecoveryHeader();
      await inlineRecoveryKey.clickCreateRecoveryKey();
      await inlineRecoveryKey.clickDownloadAndContinue();
      await inlineRecoveryKey.fillOutHint('hint');
      await inlineRecoveryKey.clickFinish();

      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
    });

    test('can setup recovery key inline after email code', async ({
      target,
      syncBrowserPages: {
        page,
        inlineRecoveryKey,
        signin,
        signinTokenCode,
        connectAnotherDevice,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/signin_token_code/);
      await expect(signinTokenCode.heading).toBeVisible();

      const code = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );

      await signinTokenCode.fillOutCodeForm(code);

      await inlineRecoveryKey.getInlineRecoveryHeader();
      await inlineRecoveryKey.clickCreateRecoveryKey();
      await inlineRecoveryKey.clickDownloadAndContinue();
      await inlineRecoveryKey.fillOutHint('hint');
      await inlineRecoveryKey.clickFinish();

      await page.waitForURL(/pair/);
      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();
    });

    test('can setup recovery key inline after 2FA', async ({
      target,
      syncBrowserPages: {
        page,
        inlineRecoveryKey,
        signin,
        settings,
        connectAnotherDevice,
        totp,
        signinTotpCode,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      // Sign-in without Sync, otw you will get prompted to create a recovery key
      await page.goto(target.contentServerUrl, { waitUntil: 'load' });

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();
      await settings.totp.addButton.click();
      const { secret } =
        await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice();
      await expect(settings.totp.status).toHaveText('Enabled');
      await settings.signOut();

      // Now attempt to sign-in with Sync, you will get prompted for 2FA and then enabling recovery key
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/signin_totp_code/);

      const totpCode = await getCode(secret);
      await signinTotpCode.fillOutCodeForm(totpCode);

      await inlineRecoveryKey.getInlineRecoveryHeader();
      await inlineRecoveryKey.clickCreateRecoveryKey();
      await inlineRecoveryKey.clickDownloadAndContinue();
      await inlineRecoveryKey.fillOutHint('hint');
      await inlineRecoveryKey.clickFinish();

      await page.waitForURL(/pair/);
      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();

      await settings.goto();
      await settings.disconnectTotp(); // Required before teardown
    });

    test('click do it later', async ({
      target,
      syncBrowserPages: {
        page,
        inlineRecoveryKey,
        signin,
        settings,
        connectAnotherDevice,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await inlineRecoveryKey.getInlineRecoveryHeader();

      await inlineRecoveryKey.clickDoItLater();

      // User taken to connect another device page
      await page.waitForURL(/pair/);
      await expect(connectAnotherDevice.fxaConnected).toBeEnabled();

      await connectAnotherDevice.clickNotNowPair();

      await page.waitForURL(/settings/);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      await settings.signOut();

      // Attempting to navigate back to the inline recovery key page,
      // it should redirect to the connect another device page since they user
      // clicked "do it later"
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`
      );
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });
  });
});
