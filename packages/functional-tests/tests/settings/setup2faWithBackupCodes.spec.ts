/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getTotpCode } from '../../lib/totp';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { TotpCredentials, TotpPage } from '../../pages/settings/totp';
import { SigninPage } from '../../pages/signin';
import { SigninTotpCodePage } from '../../pages/signinTotpCode';

test.describe('severity-1 #smoke', () => {
  test.describe('set up 2fa with backup codes', () => {
    test('enable with QR code and sign in', async ({
      target,
      pages: { page, settings, signin, signinTotpCode, totp },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      const { secret } = await addTotpWithQrCodeAndBackupCodeChoice(
        credentials,
        settings,
        totp
      );

      await page.waitForURL(/settings/);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toContainText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.signOut();

      await signinWithTotp(
        credentials,
        secret,
        page,
        settings,
        signin,
        signinTotpCode
      );

      await expect(settings.totp.status).toHaveText('Enabled');
    });

    test('enable then disable and sign in', async ({
      target,
      pages: { page, settings, signin, totp },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();
      await addTotpWithQrCodeAndBackupCodeChoice(credentials, settings, totp);

      await page.waitForURL(/settings/);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toContainText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.disconnectTotp();

      // No 2FA prompt on signin
      await settings.signOut();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('with manual key', async ({
      target,
      pages: { page, settings, totp, signin },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();
      await addTotpWithManualCodeAndBackupCodeChoice(
        credentials,
        settings,
        totp
      );

      await page.waitForURL(/settings/);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toContainText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');
    });

    test('delete account with 2FA enabled', async ({
      target,
      pages: { page, deleteAccount, settings, signin, totp },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();
      await addTotpWithQrCodeAndBackupCodeChoice(credentials, settings, totp);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toContainText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

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
  credentials: Credentials
): Promise<void> {
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await page.waitForURL(/settings/);
  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();
}

async function addTotpWithManualCodeAndBackupCodeChoice(
  credentials: Credentials,
  settings: SettingsPage,
  totp: TotpPage
): Promise<TotpCredentials> {
  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.totp.status).toHaveText('Disabled');

  await settings.totp.addButton.click();
  await settings.confirmMfaGuard(credentials.email);
  const totpCredentials =
    await totp.setUpTwoStepAuthWithManualCodeAndBackupCodesChoice(credentials);

  return totpCredentials;
}

async function addTotpWithQrCodeAndBackupCodeChoice(
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

  return totpCredentials;
}

async function signinWithTotp(
  credentials: Credentials,
  secret: string,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  signinTotpCode: SigninTotpCodePage
): Promise<void> {
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await expect(page).toHaveURL(/signin_totp_code/);
  const code = await getTotpCode(secret);
  await signinTotpCode.fillOutCodeForm(code);
  await expect(settings.settingsHeading).toBeVisible();
}
