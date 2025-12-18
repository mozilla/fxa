/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { TotpCredentials, TotpPage } from '../../pages/settings/totp';
import { SigninPage } from '../../pages/signin';
import { SigninRecoveryChoicePage } from '../../pages/signinRecoveryChoice';
import { SigninRecoveryPhonePage } from '../../pages/signinRecoveryPhone';
import { SigninTotpCodePage } from '../../pages/signinTotpCode';
import { RecoveryPhoneSetupPage } from '../../pages/settings/recoveryPhone';
import { FirefoxCommand } from '../../lib/channels';
import { syncDesktopOAuthQueryParams } from '../../lib/query-params';
import { getTotpCode } from '../../lib/totp';

test.describe('severity-1 #smoke', () => {
  test.describe('recovery phone #phone', () => {
    // Run these tests sequentially. This must be done when using the Twilio API, because they rely on
    // the same test phone number, and we cannot determine the order in which the messages were received.
    test.describe.configure({ mode: 'serial' });

    let testNumber: string;

    test.beforeAll(async ({ target }) => {
      target.smsClient.guardTestPhoneNumber();
      testNumber = target.smsClient.getPhoneNumber();
    });

    test('setup fails with invalid number', async ({
      target,
      pages: { page, settings, signin, recoveryPhone, totp },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();
      await setup2faWithBackupCodeChoice(credentials, settings, totp);

      await expect(settings.totp.status).toHaveText('Enabled');
      await settings.totp.addRecoveryPhoneButton.click();

      await expect(recoveryPhone.addHeader()).toBeVisible();

      await recoveryPhone.enterPhoneNumber('1234567890');
      await recoveryPhone.clickSendCode();
      await expect(recoveryPhone.addErrorBanner).toHaveText(
        /invalid phone number/i
      );
    });

    test('can setup, confirm and remove recovery phone', async ({
      target,
      pages: { page, settings, signin, recoveryPhone, totp },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();
      await setup2faWithBackupCodeChoice(credentials, settings, totp);
      await expect(settings.totp.status).toHaveText('Enabled');
      await settings.totp.addRecoveryPhoneButton.click();

      await expect(recoveryPhone.addHeader()).toBeVisible();

      await recoveryPhone.enterPhoneNumber(testNumber);
      await recoveryPhone.clickSendCode();

      await expect(recoveryPhone.confirmHeader).toBeVisible();

      const code = await target.smsClient.getCode({ ...credentials });

      // Invalid code
      await recoveryPhone.enterCode('123456');
      await recoveryPhone.confirmButton.click();
      await expect(recoveryPhone.confirmErrorBanner).toHaveText(
        'Invalid or expired confirmation code'
      );

      // Sends a new code
      await recoveryPhone.clickResendCode();
      const nextCode = await target.smsClient.getCode({ ...credentials });

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
    });

    test('can change recovery phone', async ({
      target,
      pages: { page, settings, signin, recoveryPhone, totp },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();
      await setup2faWithBackupCodeChoice(credentials, settings, totp);
      await expect(settings.totp.status).toHaveText('Enabled');
      await addRecoveryPhone(
        settings,
        recoveryPhone,
        page,
        credentials,
        target
      );

      await settings.totp.changeRecoveryPhoneButton.click();
      await page.waitForURL(/recovery_phone\/setup/);

      await expect(page.getByText('Change recovery phone')).toBeVisible();

      await expect(recoveryPhone.addHeader()).toBeVisible();

      await recoveryPhone.enterPhoneNumber(testNumber);
      await recoveryPhone.clickSendCode();

      await expect(recoveryPhone.confirmHeader).toBeVisible();

      const code = await target.smsClient.getCode({ ...credentials });

      await recoveryPhone.enterCode(code);
      await recoveryPhone.clickConfirm();

      await page.waitForURL(/settings/);
      await expect(settings.alertBar).toHaveText('Recovery phone changed');
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
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);
      await setup2faWithBackupCodeChoice(credentials, settings, totp);
      await expect(settings.totp.status).toHaveText('Enabled');

      await addRecoveryPhone(
        settings,
        recoveryPhone,
        page,
        credentials,
        target
      );

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

      // assert that we're signed in
      await page.waitForURL(/settings/);
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
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await setup2faWithBackupCodeChoice(credentials, settings, totp);
      await expect(settings.totp.status).toHaveText('Enabled');

      await addRecoveryPhone(
        settings,
        recoveryPhone,
        page,
        credentials,
        target
      );

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
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await setup2faWithBackupCodeChoice(credentials, settings, totp);
      await expect(settings.totp.status).toHaveText('Enabled');

      await addRecoveryPhone(
        settings,
        recoveryPhone,
        page,
        credentials,
        target
      );

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
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await setup2faWithBackupCodeChoice(credentials, settings, totp);
      await expect(settings.totp.status).toHaveText('Enabled');

      await addRecoveryPhone(
        settings,
        recoveryPhone,
        page,
        credentials,
        target
      );

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
        page.getByText(/The code is invalid or expired./)
      ).toBeVisible();

      const originalCode = await target.smsClient.getCode({ ...credentials });

      // Sends a new code
      await signinRecoveryPhone.clickResendCode();
      await expect(page.getByText('Code sent')).toBeVisible();

      const nextCode = await target.smsClient.getCode({ ...credentials });

      expect(originalCode).not.toEqual(nextCode);

      // Enter the new code and login
      await signinRecoveryPhone.enterCode(nextCode);

      await signinRecoveryPhone.clickConfirm();

      await page.waitForURL(/settings/);
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
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await setup2faWithBackupCodeChoice(credentials, settings, totp);
      await expect(settings.totp.status).toHaveText('Enabled');

      await addRecoveryPhone(
        settings,
        recoveryPhone,
        page,
        credentials,
        target
      );

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
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      const totpCredentials = await setup2faWithBackupCodeChoice(
        credentials,
        settings,
        totp
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      await addRecoveryPhone(
        settings,
        recoveryPhone,
        page,
        credentials,
        target
      );

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

      await expect(settings.totp.status).toHaveText('Enabled');

      await expect(settings.settingsHeading).toBeVisible();
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
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      const totpCredentials = await setup2faWithBackupCodeChoice(
        credentials,
        settings,
        totp
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      await addRecoveryPhone(
        settings,
        recoveryPhone,
        page,
        credentials,
        target
      );

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

      const totpCode = await getTotpCode(totpCredentials.secret);
      await signinTotpCode.fillOutCodeForm(totpCode);

      await page.waitForURL(/settings/);
      await expect(await settings.totp.status).toHaveText('Enabled');
    });

    test('can set up recovery phone during initial 2FA setup', async ({
      target,
      pages: { page, settings, signin, recoveryPhone, totp },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();
      await setup2faWithRecoveryPhoneChoice(
        credentials,
        page,
        recoveryPhone,
        settings,
        target,
        totp
      );
      await expect(settings.totp.status).toHaveText('Enabled');
      await expect(recoveryPhone.status).toHaveText(
        `(•••) •••-${testNumber.slice(-4)}`
      );
    });

    test('sign in with only recovery phone available (no backup codes)', async ({
      target,
      pages: {
        page,
        settings,
        signin,
        recoveryPhone,
        signinRecoveryPhone,
        totp,
        signinTotpCode,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();

      await setup2faWithRecoveryPhoneChoice(
        credentials,
        page,
        recoveryPhone,
        settings,
        target,
        totp
      );
      await expect(settings.totp.status).toHaveText('Enabled');
      await expect(recoveryPhone.status).toHaveText(
        `(•••) •••-${testNumber.slice(-4)}`
      );

      await settings.signOut();
      await page.waitForURL(/\//);
      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/signin_totp_code/);

      await signinTotpCode.clickTroubleEnteringCode();

      await page.waitForURL(/signin_recovery_phone/);
      await expect(signinRecoveryPhone.codeInput).toBeVisible();

      const signInCode = await target.smsClient.getCode({ ...credentials });
      await signinRecoveryPhone.enterCode(signInCode);
      await signinRecoveryPhone.clickConfirm();
      await page.waitForURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  credentials: Credentials
): Promise<void> {
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await page.waitForURL(/settings/);
  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();
}

async function setup2faWithBackupCodeChoice(
  credentials: Credentials,
  settings: SettingsPage,
  totp: TotpPage
): Promise<TotpCredentials> {
  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.totp.status).toHaveText('Disabled');

  await settings.totp.addButton.click();
  await settings.confirmMfaGuard(credentials.email);
  const totpCredentials =
    await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice(credentials);

  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.alertBar).toContainText(
    'Two-step authentication has been enabled'
  );

  return totpCredentials;
}

async function setup2faWithRecoveryPhoneChoice(
  credentials: Credentials,
  page: Page,
  recoveryPhone: RecoveryPhoneSetupPage,
  settings: SettingsPage,
  target: BaseTarget,
  totp: TotpPage
): Promise<{ secret: string }> {
  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.totp.status).toHaveText('Disabled');
  await settings.totp.addButton.click();
  await settings.confirmMfaGuard(credentials.email);

  const secret =
    await totp.startTwoStepAuthWithQrCodeAndRecoveryPhoneChoice(credentials);

  await expect(recoveryPhone.addHeader()).toBeVisible();

  await recoveryPhone.enterPhoneNumber(target.smsClient.getPhoneNumber());
  await recoveryPhone.clickSendCode();

  await expect(recoveryPhone.confirmHeader).toBeVisible();

  const code = await target.smsClient.getCode({ ...credentials });

  await recoveryPhone.enterCode(code);
  await recoveryPhone.clickConfirm();

  await page.waitForURL(/settings/);

  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.alertBar).toContainText(
    'Two-step authentication has been enabled'
  );

  return secret;
}

async function addRecoveryPhone(
  settings: SettingsPage,
  recoveryPhone: RecoveryPhoneSetupPage,
  page: Page,
  credentials: Credentials,
  target: BaseTarget
) {
  await settings.goto();
  await settings.totp.addRecoveryPhoneButton.click();
  await page.waitForURL(/recovery_phone\/setup/);

  await expect(recoveryPhone.addHeader()).toBeVisible();

  await recoveryPhone.enterPhoneNumber(target.smsClient.getPhoneNumber());
  await recoveryPhone.clickSendCode();

  await expect(recoveryPhone.confirmHeader).toBeVisible();

  const code = await target.smsClient.getCode({ ...credentials });

  await recoveryPhone.enterCode(code);
  await recoveryPhone.clickConfirm();

  await page.waitForURL(/settings/);
  await expect(settings.alertBar).toHaveText('Recovery phone added');
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

  const code = await target.smsClient.getCode({ ...credentials });

  // Enter the new code and login
  await signinRecoveryPhone.enterCode(code);

  await signinRecoveryPhone.clickConfirm();
}
