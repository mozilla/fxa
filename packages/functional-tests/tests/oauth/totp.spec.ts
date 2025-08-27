/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCode } from '../../lib/totp';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';
import { getPhoneNumber } from '../../lib/targets';

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
      const code = await getCode(secret);
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
      await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice();
      await expect(settings.totp.status).toHaveText('Enabled');
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication has been enabled'
      );
      await settings.totp.disableButton.click();
      await settings.clickModalConfirm();

      await expect(settings.modalConfirmButton).toBeHidden();
      await expect(settings.totp.status).toHaveText('Disabled');
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication disabled'
      );

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.page.waitForURL(/signin/);
      await signin.signInButton.click();

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('can setup TOTP inline and login', async ({
      target,
      pages: {
        page,
        relier,
        settings,
        signin,
        totp,
        inlineTotpSetup,
        configPage,
      },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        !config.featureFlags?.updatedInlineTotpSetupFlow ||
          config.featureFlags?.updatedInlineRecoverySetupFlow,
        'The updated Inline TOTP setup flow is not enabled'
      );
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
      const code = await getCode(secret);
      await totp.step1AuthenticationCodeTextbox.fill(code);
      await totp.step1SubmitButton.click();

      await page.waitForURL(/inline_recovery_setup/);

      const codesRaw = await signin.page.getByTestId('datablock').innerText();
      const recoveryCodes = codesRaw.trim().split(/\s+/);

      await signin.page.getByRole('button', { name: 'Continue' }).click();

      await expect(
        signin.page.getByText('Confirm backup authentication code')
      ).toBeVisible();

      await signin.page
        .getByRole('textbox', { name: 'Backup authentication code' })
        .fill(recoveryCodes[0]);

      await signin.page.getByRole('button', { name: 'Confirm' }).click();

      expect(await relier.isLoggedIn()).toBe(true);

      await settings.goto();
      await settings.disconnectTotp();
    });

    test('can setup TOTP inline and login (old)', async ({
      target,
      pages: { page, relier, settings, signin, configPage },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags?.updatedInlineTotpSetupFlow ||
          config.featureFlags?.updatedInlineRecoverySetupFlow,
        'The updated Inline TOTP setup flow is enabled, skipping old tests'
      );
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickRequire2FA();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/inline_totp_setup/);

      await expect(
        signin.page.getByText('Enable two-step authentication')
      ).toBeVisible();

      await signin.page.getByRole('button', { name: 'Continue' }).click();

      await expect(
        signin.page.getByText('Scan authentication code')
      ).toBeVisible();

      await signin.page
        .getByRole('button', { name: 'Can’t scan code?' })
        .click();

      await expect(signin.page.getByText('Enter code manually')).toBeVisible();

      const secret = (
        await signin.page.getByTestId('manual-datablock').innerText()
      )?.replace(/\s/g, '');
      const code = await getCode(secret);

      await signin.page
        .getByRole('textbox', { name: 'Authentication code' })
        .fill(code);

      await signin.page.getByRole('button', { name: 'Ready' }).click();

      await page.waitForURL(/inline_recovery_setup/);

      const codesRaw = await signin.page.getByTestId('datablock').innerText();
      const recoveryCodes = codesRaw.trim().split(/\s+/);

      await signin.page.getByRole('button', { name: 'Continue' }).click();

      await expect(
        signin.page.getByText('Confirm backup authentication code')
      ).toBeVisible();

      await signin.page
        .getByRole('textbox', { name: 'Backup authentication code' })
        .fill(recoveryCodes[0]);

      await signin.page.getByRole('button', { name: 'Confirm' }).click();

      expect(await relier.isLoggedIn()).toBe(true);

      await settings.goto();
      await settings.disconnectTotp();
    });

    test('can setup TOTP inline with backup codes choice (old setup)', async ({
      target,
      pages: { page, relier, settings, signin, configPage, totp },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags?.updatedInlineTotpSetupFlow ||
          !config.featureFlags?.updatedInlineRecoverySetupFlow,
        'Skip unless old totp setup with new recovery flow'
      );
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickRequire2FA();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/inline_totp_setup/);

      await expect(
        signin.page.getByText('Enable two-step authentication')
      ).toBeVisible();

      await signin.page.getByRole('button', { name: 'Continue' }).click();

      await expect(
        signin.page.getByText('Scan authentication code')
      ).toBeVisible();

      await signin.page
        .getByRole('button', { name: 'Can’t scan code?' })
        .click();

      await expect(signin.page.getByText('Enter code manually')).toBeVisible();

      const secret = (
        await signin.page.getByTestId('manual-datablock').innerText()
      )?.replace(/\s/g, '');
      const code = await getCode(secret);

      await signin.page
        .getByRole('textbox', { name: 'Authentication code' })
        .fill(code);

      await signin.page.getByRole('button', { name: 'Ready' }).click();

      await page.waitForURL(/inline_recovery_setup/);

      await totp.chooseBackupCodesOption();
      const recoveryCodes = await totp.backupCodesDownloadStep();
      await totp.confirmBackupCodeStep(recoveryCodes[0]);
      await page.getByRole('button', { name: 'Continue' }).click();

      expect(await relier.isLoggedIn()).toBe(true);

      await settings.goto();
      await settings.disconnectTotp();
    });

    test('can setup TOTP inline with recovery phone choice (old setup)', async ({
      target,
      pages: {
        page,
        relier,
        settings,
        signin,
        configPage,
        totp,
        recoveryPhone,
      },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.featureFlags?.updatedInlineTotpSetupFlow ||
          !config.featureFlags?.updatedInlineRecoverySetupFlow,
        'Skip unless old totp setup with new recovery flow'
      );
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickRequire2FA();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/inline_totp_setup/);

      await expect(
        signin.page.getByText('Enable two-step authentication')
      ).toBeVisible();

      await signin.page.getByRole('button', { name: 'Continue' }).click();

      await expect(
        signin.page.getByText('Scan authentication code')
      ).toBeVisible();

      await signin.page
        .getByRole('button', { name: 'Can’t scan code?' })
        .click();

      await expect(signin.page.getByText('Enter code manually')).toBeVisible();

      const secret = (
        await signin.page.getByTestId('manual-datablock').innerText()
      )?.replace(/\s/g, '');
      const code = await getCode(secret);

      await signin.page
        .getByRole('textbox', { name: 'Authentication code' })
        .fill(code);

      await signin.page.getByRole('button', { name: 'Ready' }).click();

      await page.waitForURL(/inline_recovery_setup/);

      await totp.chooseRecoveryPhoneOption();
      await recoveryPhone.enterPhoneNumber(getPhoneNumber(target.name));
      await recoveryPhone.clickSendCode();

      await expect(recoveryPhone.confirmHeader).toBeVisible();

      const smsCode = await target.smsClient.getCode(
        getPhoneNumber(target.name),
        credentials.uid
      );

      await recoveryPhone.enterCode(smsCode);
      await recoveryPhone.clickConfirm();

      await page.getByRole('button', { name: 'Continue' }).click();

      expect(await relier.isLoggedIn()).toBe(true);

      await settings.goto();
      await settings.disconnectTotp();
    });

    test('can setup TOTP inline with backup codes choice (new setup)', async ({
      target,
      pages: {
        page,
        relier,
        settings,
        signin,
        configPage,
        totp,
        inlineTotpSetup,
      },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        !config.featureFlags?.updatedInlineTotpSetupFlow ||
          !config.featureFlags?.updatedInlineRecoverySetupFlow,
        'Skip unless new totp setup with new recovery flow'
      );
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
      const code = await getCode(secret);
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

    test('can setup TOTP inline with recovery phone choice (new setup)', async ({
      target,
      pages: {
        page,
        relier,
        settings,
        signin,
        configPage,
        totp,
        recoveryPhone,
        inlineTotpSetup,
      },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        !config.featureFlags?.updatedInlineTotpSetupFlow ||
          !config.featureFlags?.updatedInlineRecoverySetupFlow,
        'Skip unless new totp setup with new recovery flow'
      );
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
      const code = await getCode(secret);
      await totp.step1AuthenticationCodeTextbox.fill(code);
      await totp.step1SubmitButton.click();

      await page.waitForURL(/inline_recovery_setup/);

      await totp.chooseRecoveryPhoneOption();
      await recoveryPhone.enterPhoneNumber(getPhoneNumber(target.name));
      await recoveryPhone.clickSendCode();

      await expect(recoveryPhone.confirmHeader).toBeVisible();

      const smsCode = await target.smsClient.getCode(
        getPhoneNumber(target.name),
        credentials.uid
      );

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
