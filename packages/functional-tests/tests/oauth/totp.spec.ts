/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getTotpCode } from '../../lib/totp';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test.describe('OAuth totp', () => {
    test('can add TOTP to account and confirm oauth signin', async ({
      target,
      pages: { page, signin, relier, settings, totp, signinTotpCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();
      await settings.totp.addButton.click();
      await settings.confirmMfaGuard(credentials.email);
      const { secret } =
        await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice();
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');
      await settings.signOut();
      await relier.goto();
      await relier.clickEmailFirst();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_totp_code/);
      const code = await getTotpCode(secret);
      await signinTotpCode.fillOutCodeForm(code);

      expect(await relier.isLoggedIn()).toBe(true);

      await settings.goto();
      await settings.page.waitForURL(/settings/);
      await settings.disconnectTotp();
    });

    test('can remove TOTP from account and skip confirmation', async ({
      target,
      pages: { page, relier, settings, signin, totp },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);
      await settings.goto();
      await settings.totp.addButton.click();
      await settings.confirmMfaGuard(credentials.email);
      await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice();
      await expect(settings.totp.status).toHaveText('Enabled');
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication has been enabled'
      );
      await settings.disconnectTotp();

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.page.waitForURL(/signin/);
      await signin.signInButton.click();

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('can setup TOTP inline with backup codes choice', async ({
      pages: { page, relier, settings, signin, totp, inlineTotpSetup },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickRequire2FA();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/inline_totp_setup/);

      await expect(inlineTotpSetup.introHeading).toBeVisible();
      await inlineTotpSetup.continueButton.click();
      await expect(totp.setup2faAppHeading).toBeVisible();
      await totp.step1CantScanCodeLink.click();
      const secret = (await totp.step1ManualCode.innerText())?.replace(
        /\s/g,
        ''
      );
      const code = await getTotpCode(secret);
      await totp.step1AuthenticationCodeTextbox.fill(code);
      await totp.step1SubmitButton.click();

      await page.waitForURL(/inline_recovery_setup/);

      await totp.chooseBackupCodesOption();
      const recoveryCodes = await totp.backupCodesDownloadStep();
      await totp.confirmBackupCodeStep(recoveryCodes[0]);
      await page.getByRole('button', { name: /Continue/ }).click();

      expect(await relier.isLoggedIn()).toBe(true);

      await settings.goto();
      await settings.disconnectTotp();
    });

    test('can setup TOTP inline with recovery phone choice', async ({
      target,
      pages: {
        page,
        relier,
        settings,
        signin,
        totp,
        recoveryPhone,
        inlineTotpSetup,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickRequire2FA();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/inline_totp_setup/);

      await expect(inlineTotpSetup.introHeading).toBeVisible();
      await inlineTotpSetup.continueButton.click();
      await expect(totp.setup2faAppHeading).toBeVisible();
      await totp.step1CantScanCodeLink.click();
      const secret = (await totp.step1ManualCode.innerText())?.replace(
        /\s/g,
        ''
      );
      const code = await getTotpCode(secret);
      await totp.step1AuthenticationCodeTextbox.fill(code);
      await totp.step1SubmitButton.click();

      await page.waitForURL(/inline_recovery_setup/);

      await totp.chooseRecoveryPhoneOption();
      await recoveryPhone.enterPhoneNumber(target.smsClient.getPhoneNumber());
      await recoveryPhone.clickSendCode();

      await expect(recoveryPhone.confirmHeader).toBeVisible();

      const smsCode = await target.smsClient.getCode({ ...credentials });

      await recoveryPhone.enterCode(smsCode);
      await recoveryPhone.clickConfirm();

      await page.getByRole('button', { name: 'Continue' }).click();

      expect(await relier.isLoggedIn()).toBe(true);

      await settings.goto();
      await settings.disconnectTotp();
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
  await page.waitForURL(/\//);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await page.waitForURL(/settings/);
  // Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();
}
