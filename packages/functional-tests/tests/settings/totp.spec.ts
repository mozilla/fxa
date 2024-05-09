/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCode } from 'fxa-settings/src/lib/totp';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { TotpCredentials, TotpPage } from '../../pages/settings/totp';
import { SigninReactPage } from '../../pages/signinReact';

test.describe('severity-1 #smoke', () => {
  test.describe('two step auth', () => {
    test.beforeEach(async () => {
      // 2FA test can be slow because of time to generate recovery keys
      test.slow();
    });

    test('add and remove totp', async ({
      target,
      pages: { page, settings, signinReact, totp },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        page,
        settings,
        signinReact,
        target,
        testAccountTracker
      );

      await settings.goto();
      await addTotp(settings, totp);
      await settings.disconnectTotp();
      // Login to verify no prompt for code
      await settings.signOut();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('totp use QR code', async ({
      target,
      pages: { page, signinReact, settings, totp },
      testAccountTracker,
    }) => {
      await signInAccount(
        page,
        settings,
        signinReact,
        target,
        testAccountTracker
      );

      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Not Set');

      await settings.totp.addButton.click();
      await totp.fillOutStep1FormQR();
      const recoveryCodes = await totp.fillOutStep2Form();
      await totp.fillOutStep3Form(recoveryCodes[0]);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.disconnectTotp(); // Required before teardown
    });

    test('add TOTP and signinReact', async ({
      target,
      pages: { page, settings, totp, signinReact, signinTotpCode },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        page,
        settings,
        signinReact,
        target,
        testAccountTracker
      );

      const { secret } = await addTotp(settings, totp);
      await settings.signOut();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(page).toHaveURL(/signin_totp_code/);
      await expect(signinTotpCode.heading).toBeVisible();
      const totpCode = await getCode(secret);
      await signinTotpCode.fillOutCodeForm(totpCode);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.disconnectTotp(); // Required before teardown
    });

    test('totp invalid recovery code', async ({
      target,
      pages: {
        page,
        settings,
        signinReact,
        signinRecoveryCode,
        signinTotpCode,
        totp,
      },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        page,
        settings,
        signinReact,
        target,
        testAccountTracker
      );

      const { recoveryCodes } = await addTotp(settings, totp);
      await settings.signOut();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/signin_totp_code/);

      await signinTotpCode.useRecoveryCodeLink.click();
      await signinRecoveryCode.fillOutCodeForm('invalid!!');

      await expect(
        page.getByText('Invalid backup authentication code')
      ).toBeVisible();

      // Required before teardown
      await signinRecoveryCode.fillOutCodeForm(recoveryCodes[0]);
      await settings.disconnectTotp();
    });

    test('can change backup authentication codes', async ({
      target,
      pages: {
        page,
        settings,
        signinReact,
        signinRecoveryCode,
        signinTotpCode,
        totp,
      },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        page,
        settings,
        signinReact,
        target,
        testAccountTracker
      );

      const { recoveryCodes } = await addTotp(settings, totp);
      await settings.totp.changeButton.click();
      await settings.modalConfirmButton.click();

      const newCodes = await totp.getRecoveryCodes();
      expect(newCodes.some((c) => recoveryCodes.includes(c))).toBe(false);

      await totp.step2ContinueButton.click();
      await totp.step3RecoveryCodeTextbox.fill(newCodes[0]);
      await totp.step3FinishButton.click();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Account backup authentication codes updated'
      );

      await settings.signOut();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/signin_totp_code/);

      await signinTotpCode.useRecoveryCodeLink.click();

      await page.waitForURL(/signin_recovery_code/);

      await signinRecoveryCode.fillOutCodeForm(newCodes[0]);

      await expect(settings.settingsHeading).toBeVisible();

      await settings.disconnectTotp(); // Required before teardown
    });

    test('can get new backup authentication codes via email', async ({
      target,
      pages: {
        page,
        settings,
        signinReact,
        signinRecoveryCode,
        signinTotpCode,
        totp,
      },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        page,
        settings,
        signinReact,
        target,
        testAccountTracker
      );

      await settings.goto();
      const { recoveryCodes } = await addTotp(settings, totp);

      for (let i = 0; i < recoveryCodes.length - 2; i++) {
        await settings.signOut();
        await signinReact.fillOutEmailFirstForm(credentials.email);
        await signinReact.fillOutPasswordForm(credentials.password);
        await page.waitForURL(/signin_totp_code/);
        await signinTotpCode.useRecoveryCodeLink.click();
        await page.waitForURL(/signin_recovery_code/);
        await signinRecoveryCode.fillOutCodeForm(recoveryCodes[i]);
        await expect(settings.settingsHeading).toBeVisible();
      }

      const link = await target.emailClient.getLowRecoveryCodesLink(
        credentials.email
      );
      await page.goto(link);
      const newCodes = await totp.getRecoveryCodes();
      expect(newCodes.length).toEqual(recoveryCodes.length);

      // Disconnect totp, required before teardown
      await totp.step1CancelButton.click();
      await settings.disconnectTotp();
    });

    test('delete account with totp enabled', async ({
      target,
      pages: {
        deleteAccount,
        page,
        settings,
        totp,
        signinReact,
        signinTotpCode,
      },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        page,
        settings,
        signinReact,
        target,
        testAccountTracker
      );

      await settings.goto();
      const { secret } = await addTotp(settings, totp);
      await settings.signOut();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      await page.waitForURL(/signin_totp_code/);

      const totpCode = await getCode(secret);
      await signinTotpCode.fillOutCodeForm(totpCode);

      await expect(settings.settingsHeading).toBeVisible();

      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(credentials.password);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });
});

async function signInAccount(
  page: Page,
  settings: SettingsPage,
  signinReact: SigninReactPage,
  target: BaseTarget,
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

async function addTotp(
  settings: SettingsPage,
  totp: TotpPage
): Promise<TotpCredentials> {
  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.totp.status).toHaveText('Not Set');

  await settings.totp.addButton.click();
  const totpCredentials = await totp.fillOutTotpForms();

  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.alertBar).toHaveText('Two-step authentication enabled');
  await expect(settings.totp.status).toHaveText('Enabled');

  return totpCredentials;
}
