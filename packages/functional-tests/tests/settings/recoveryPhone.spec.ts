/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { TotpCredentials, TotpPage } from '../../pages/settings/totp';
import { SigninPage } from '../../pages/signin';
import { SigninRecoveryChoicePage } from '../../pages/signinRecoveryChoice';
import { SigninRecoveryPhonePage } from '../../pages/signinRecoveryPhone';
import { SigninTotpCodePage } from '../../pages/signinTotpCode';
import { RecoveryPhoneSetupPage } from '../../pages/settings/recoveryPhone';
import { FirefoxCommand } from '../../lib/channels';
import { syncDesktopOAuthQueryParams } from '../../lib/query-params';
import { getCode } from 'fxa-settings/src/lib/totp';

test.describe('severity-1 #smoke', () => {
  test.describe('recovery phone', () => {
    test.beforeEach(async ({ pages: { configPage } }, { project }) => {
      // Ensure that the feature flag is enabled
      const config = await configPage.getConfig();
      test.fixme(project.name !== 'local', 'FXA-11159');
      test.skip(config.featureFlags.enableAdding2FABackupPhone !== true);
      test.skip(config.featureFlags.enableUsing2FABackupPhone !== true);
    });

    test('setup fails with invalid number', async ({
      target,
      pages: { page, settings, signin, recoveryPhone, totp },
      testAccountTracker,
    }) => {
      await signInAccount(target, page, settings, signin, testAccountTracker);

      await settings.goto();
      await addTotp(settings, totp);
      await settings.totp.addRecoveryPhoneButton.click();
      await page.waitForURL(/recovery_phone\/setup/);

      await expect(recoveryPhone.addHeader()).toBeVisible();

      await recoveryPhone.enterPhoneNumber('1234567890');
      await recoveryPhone.clickSendCode();
      await recoveryPhone.expectAddErrorBanner('Invalid phone number');

      await settings.goto();
      await settings.disconnectTotp();
    });

    test('can setup, confirm and remove recovery phone', async ({
      target,
      pages: { page, settings, signin, recoveryPhone, totp },
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
      await addTotp(settings, totp);
      await settings.totp.addRecoveryPhoneButton.click();
      await page.waitForURL(/recovery_phone\/setup/);

      await expect(recoveryPhone.addHeader()).toBeVisible();

      await recoveryPhone.enterPhoneNumber('4159929960');
      await recoveryPhone.clickSendCode();

      await expect(recoveryPhone.confirmHeader).toBeVisible();

      const code = await target.smsClient.getCode(credentials.uid);

      // Invalid code
      await recoveryPhone.enterCode('123456');
      await recoveryPhone.confirmButton.click();
      await expect(recoveryPhone.confirmErrorBanner).toHaveText(
        'Invalid or expired confirmation code'
      );

      // Sends a new code
      await recoveryPhone.clickResendCode();
      const nextCode = await target.smsClient.getCode(credentials.uid);

      expect(code).not.toEqual(nextCode);

      await recoveryPhone.enterCode(nextCode);
      await recoveryPhone.clickConfirm();

      await page.waitForURL(/settings/);
      await expect(settings.alertBar).toHaveText('Recovery phone added');

      await settings.totp.removeRecoveryPhoneButton.click();
      await page.waitForURL(/recovery_phone\/remove/);
      await page.getByRole('button', { name: 'Remove phone number' }).click();

      await page.waitForURL(/settings/);
      await expect(settings.totp.addRecoveryPhoneButton).toBeVisible();

      await settings.disconnectTotp();
    });

    test('can sign-in to settings with recovery phone', async ({
      target,
      pages: {
        page,
        settings,
        signin,
        recoveryPhone,
        totp,
        signinTotpCode,
        signinRecoveryChoice,
        signinRecoveryPhone,
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

      await setupRecoveryPhone({
        settings,
        totp,
        recoveryPhone,
        page,
        credentials,
        target,
      });

      await settings.signOut();
      await page.waitForURL(/\//);

      await fillOutRecoveryPhoneFromEmailFirst({
        page,
        signin,
        signinTotpCode,
        signinRecoveryChoice,
        signinRecoveryPhone,
        credentials,
        target,
      });

      await page.waitForURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();

      // Remove totp so account can be deleted
      await settings.disconnectTotp();
    });

    test('can sign-in Sync (fx_desktop_v3) with recovery phone', async ({
      target,
      syncBrowserPages: {
        page,
        settings,
        signin,
        recoveryPhone,
        totp,
        signinTotpCode,
        signinRecoveryChoice,
        signinRecoveryPhone,
        connectAnotherDevice,
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

      await setupRecoveryPhone({
        settings,
        totp,
        recoveryPhone,
        page,
        credentials,
        target,
      });

      await settings.signOut();
      await page.waitForURL(/\//);
      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`,
        { waitUntil: 'load' }
      );

      await fillOutRecoveryPhoneFromEmailFirst({
        page,
        signin,
        signinTotpCode,
        signinRecoveryChoice,
        signinRecoveryPhone,
        credentials,
        target,
      });

      await page.waitForURL(/pair/);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      await signin.checkWebChannelMessage(FirefoxCommand.Login);

      await connectAnotherDevice.clickNotNowPair();
      await page.waitForURL(/settings/);

      // Remove totp so account can be deleted
      await settings.disconnectTotp();
    });

    test('can sign-in Sync (oauth_webchannel_v1) with recovery phone', async ({
      target,
      syncOAuthBrowserPages: {
        page,
        settings,
        signin,
        recoveryPhone,
        totp,
        signinTotpCode,
        signinRecoveryChoice,
        signinRecoveryPhone,
        connectAnotherDevice,
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

      await setupRecoveryPhone({
        settings,
        totp,
        recoveryPhone,
        page,
        credentials,
        target,
      });

      await settings.signOut();
      await page.waitForURL(/\//);

      await signin.goto('/authorization', syncDesktopOAuthQueryParams);

      await fillOutRecoveryPhoneFromEmailFirst({
        page,
        signin,
        signinTotpCode,
        signinRecoveryChoice,
        signinRecoveryPhone,
        credentials,
        target,
      });

      await page.waitForURL(/pair/);
      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
      await signin.checkWebChannelMessage(FirefoxCommand.Login);

      await connectAnotherDevice.clickNotNowPair();
      await page.waitForURL(/settings/);

      // Remove totp so account can be deleted
      await settings.disconnectTotp();
    });

    test('can sign-in with recovery phone after resend code', async ({
      target,
      pages: {
        page,
        settings,
        signin,
        recoveryPhone,
        totp,
        signinTotpCode,
        signinRecoveryChoice,
        signinRecoveryPhone,
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

      await setupRecoveryPhone({
        settings,
        totp,
        recoveryPhone,
        page,
        credentials,
        target,
      });

      await settings.signOut();
      await page.waitForURL(/\//);

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/signin_totp_code/);

      await signinTotpCode.clickTroubleEnteringCode();

      await page.waitForURL(/signin_recovery_choice/);

      await signinRecoveryChoice.clickChoosePhone();
      await signinRecoveryChoice.clickContinue();

      await page.waitForURL(/signin_recovery_phone/);

      // Invalid code
      await signinRecoveryPhone.enterCode('123456');
      await signinRecoveryPhone.clickConfirm();

      await expect(
        page.getByText('Invalid or expired confirmation code')
      ).toBeVisible();

      const originalCode = await target.smsClient.getCode(credentials.uid);

      // Sends a new code
      await signinRecoveryPhone.clickResendCode();
      await expect(page.getByText('Code sent')).toBeVisible();

      const nextCode = await target.smsClient.getCode(credentials.uid);

      expect(originalCode).not.toEqual(nextCode);

      // Enter the new code and login
      await signinRecoveryPhone.enterCode(nextCode);

      await signinRecoveryPhone.clickConfirm();

      await page.waitForURL(/settings/);

      // Remove totp so account can be deleted
      await settings.disconnectTotp();
    });

    test('can sign-in 123Done with recovery phone', async ({
      target,
      pages: {
        page,
        settings,
        signin,
        recoveryPhone,
        totp,
        signinTotpCode,
        signinRecoveryChoice,
        signinRecoveryPhone,
        relier,
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

      await setupRecoveryPhone({
        settings,
        totp,
        recoveryPhone,
        page,
        credentials,
        target,
      });

      await settings.signOut();

      await relier.goto();
      await relier.clickEmailFirst();

      await fillOutRecoveryPhoneFromEmailFirst({
        page,
        signin,
        signinTotpCode,
        signinRecoveryChoice,
        signinRecoveryPhone,
        credentials,
        target,
      });

      expect(await relier.isLoggedIn()).toBe(true);

      // Remove totp so account can be deleted
      await settings.goto();
      await settings.disconnectTotp();
    });

    test('can use recovery code with recovery phone setup', async ({
      target,
      pages: {
        page,
        settings,
        signin,
        recoveryPhone,
        totp,
        signinTotpCode,
        signinRecoveryChoice,
        signinRecoveryCode,
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

      const totpCredentials = await setupRecoveryPhone({
        settings,
        totp,
        recoveryPhone,
        page,
        credentials,
        target,
      });

      await settings.signOut();
      await page.waitForURL(/\//);

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/signin_totp_code/);

      await signinTotpCode.clickTroubleEnteringCode();

      await page.waitForURL(/signin_recovery_choice/);

      await signinRecoveryChoice.clickChooseCode();
      await signinRecoveryChoice.clickContinue();

      await page.waitForURL(/signin_recovery_code/);

      await signinRecoveryCode.fillOutCodeForm(
        totpCredentials.recoveryCodes[0]
      );

      await page.waitForURL(/settings/);

      // Remove totp so account can be deleted
      await settings.disconnectTotp();
    });

    test('can still use totp code with recovery phone setup', async ({
      target,
      pages: {
        page,
        settings,
        signin,
        recoveryPhone,
        totp,
        signinTotpCode,
        signinRecoveryChoice,
        signinRecoveryPhone,
        signinRecoveryCode,
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

      const totpCredentials = await setupRecoveryPhone({
        settings,
        totp,
        recoveryPhone,
        page,
        credentials,
        target,
      });

      await settings.signOut();
      await page.waitForURL(/\//);

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/signin_totp_code/);

      await signinTotpCode.clickTroubleEnteringCode();

      await page.waitForURL(/signin_recovery_choice/);

      await signinRecoveryChoice.clickChoosePhone();
      await signinRecoveryChoice.clickContinue();

      await page.waitForURL(/signin_recovery_phone/);

      await signinRecoveryPhone.clickBack();
      await page.waitForURL(/signin_recovery_choice/);

      await signinRecoveryChoice.clickBack();
      await page.waitForURL(/signin_totp_code/);

      const totpCode = await getCode(totpCredentials.secret);
      await signinTotpCode.fillOutCodeForm(totpCode);

      await page.waitForURL(/settings/);

      // Remove totp so account can be deleted
      await settings.disconnectTotp();
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

async function addTotp(
  settings: SettingsPage,
  totp: TotpPage
): Promise<TotpCredentials> {
  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.totp.status).toHaveText('Disabled');

  await settings.totp.addButton.click();
  const totpCredentials = await totp.fillOutTotpForms();

  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.alertBar).toHaveText(
    'Two-step authentication has been enabled'
  );
  await expect(settings.totp.status).toHaveText('Enabled');

  return totpCredentials;
}

async function setupRecoveryPhone({
  settings,
  totp,
  recoveryPhone,
  page,
  credentials,
  target,
}: {
  settings: SettingsPage;
  totp: TotpPage;
  recoveryPhone: RecoveryPhoneSetupPage;
  page: Page;
  credentials: Credentials;
  target: BaseTarget;
}) {
  await settings.goto();
  const totpCredentials = await addTotp(settings, totp);
  await settings.totp.addRecoveryPhoneButton.click();
  await page.waitForURL(/recovery_phone\/setup/);

  await expect(recoveryPhone.addHeader()).toBeVisible();

  await recoveryPhone.enterPhoneNumber('4159929960');
  await recoveryPhone.clickSendCode();

  await expect(recoveryPhone.confirmHeader).toBeVisible();

  const registerCode = await target.smsClient.getCode(credentials.uid);

  await recoveryPhone.enterCode(registerCode);
  await recoveryPhone.clickConfirm();

  await page.waitForURL(/settings/);
  await expect(settings.alertBar).toHaveText('Recovery phone added');

  return totpCredentials;
}

async function fillOutRecoveryPhoneFromEmailFirst({
  page,
  signin,
  signinTotpCode,
  signinRecoveryChoice,
  signinRecoveryPhone,
  credentials,
  target,
}: {
  page: Page;
  signin: SigninPage;
  signinTotpCode: SigninTotpCodePage;
  signinRecoveryChoice: SigninRecoveryChoicePage;
  signinRecoveryPhone: SigninRecoveryPhonePage;
  credentials: Credentials;
  target: BaseTarget;
}) {
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);

  await page.waitForURL(/signin_totp_code/);

  await signinTotpCode.clickTroubleEnteringCode();

  await page.waitForURL(/signin_recovery_choice/);

  await signinRecoveryChoice.clickChoosePhone();
  await signinRecoveryChoice.clickContinue();

  await page.waitForURL(/signin_recovery_phone/);

  // Invalid code
  await signinRecoveryPhone.enterCode('123456');
  await signinRecoveryPhone.clickConfirm();

  await expect(
    page.getByText('Invalid or expired confirmation code')
  ).toBeVisible();

  const originalCode = await target.smsClient.getCode(credentials.uid);

  // Sends a new code
  await signinRecoveryPhone.clickResendCode();
  await expect(page.getByText('Code sent')).toBeVisible();

  const nextCode = await target.smsClient.getCode(credentials.uid);

  expect(originalCode).not.toEqual(nextCode);

  // Enter the new code and login
  await signinRecoveryPhone.enterCode(nextCode);

  await signinRecoveryPhone.clickConfirm();
}
