/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { TotpCredentials, TotpPage } from '../../pages/settings/totp';
import { SigninPage } from '../../pages/signin';
import { SigninRecoveryCodePage } from '../../pages/signinRecoveryCode';
import { SigninTotpCodePage } from '../../pages/signinTotpCode';

test.describe('severity-1 #smoke', () => {
  test.describe('two step auth', () => {
    test('totp valid recovery code', async ({
      target,
      pages: {
        page,
        settings,
        signin,
        signinRecoveryCode,
        signinTotpCode,
        totp,
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
      const { recoveryCodes } = await addTotp(settings, totp);
      await settings.signOut();
      await signinWithRecoveryCode(
        credentials,
        recoveryCodes[0],
        page,
        settings,
        signin,
        signinRecoveryCode,
        signinTotpCode
      );
      await expect(settings.settingsHeading).toBeVisible();
      await settings.disconnectTotp();
    });

    test('totp invalid recovery code', async ({
      target,
      pages: {
        page,
        settings,
        signin,
        signinRecoveryCode,
        signinTotpCode,
        totp,
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
      const { recoveryCodes } = await addTotp(settings, totp);
      await settings.signOut();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await expect(page).toHaveURL(/signin_totp_code/);
      await signinTotpCode.useRecoveryCodeLink.click();
      await expect(page).toHaveURL(/signin_recovery_code/);
      await signinRecoveryCode.fillOutCodeForm('invalid!!!');
      await expect(
        page.getByText('Invalid backup authentication code')
      ).toBeVisible();

      // Required before teardown
      await signinRecoveryCode.fillOutCodeForm(recoveryCodes[0]);
      await expect(settings.settingsHeading).toBeVisible();
      await settings.disconnectTotp();
    });

    test('can change backup authentication codes', async ({
      target,
      pages: {
        page,
        settings,
        signin,
        signinTotpCode,
        signinRecoveryCode,
        totp,
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
      const { recoveryCodes } = await addTotp(settings, totp);
      await settings.totp.changeButton.click();

      const newCodes = await totp.getRecoveryCodes();
      expect(newCodes.some((c) => recoveryCodes.includes(c))).toBe(false);

      await totp.step2ContinueButton.click();
      await totp.step3RecoveryCodeTextbox.fill(newCodes[0]);
      await totp.step3FinishButton.click();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Backup authentication codes updated'
      );

      await settings.signOut();
      await signinWithRecoveryCode(
        credentials,
        newCodes[0],
        page,
        settings,
        signin,
        signinRecoveryCode,
        signinTotpCode
      );

      await expect(settings.settingsHeading).toBeVisible();
      await settings.disconnectTotp(); // Required before teardown
    });

    test('can get new backup authentication codes via email', async ({
      target,
      pages: {
        page,
        settings,
        signin,
        signinTotpCode,
        signinRecoveryCode,
        totp,
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
      const { recoveryCodes } = await addTotp(settings, totp);
      await settings.signOut();

      for (let i = 0; i < recoveryCodes.length - 3; i++) {
        await signinWithRecoveryCode(
          credentials,
          recoveryCodes[i],
          page,
          settings,
          signin,
          signinRecoveryCode,
          signinTotpCode
        );
        await expect(settings.settingsHeading).toBeVisible();
        await settings.signOut();
      }

      await signinWithRecoveryCode(
        credentials,
        recoveryCodes[recoveryCodes.length - 1],
        page,
        settings,
        signin,
        signinRecoveryCode,
        signinTotpCode
      );

      await expect(settings.settingsHeading).toBeVisible();
      const link = await target.emailClient.getLowRecoveryLink(
        credentials.email
      );
      await page.goto(link);
      const newCodes = await totp.getRecoveryCodes();
      expect(newCodes.length).toEqual(recoveryCodes.length);

      // Disconnect totp, required before teardown
      await totp.step1CancelButton.click();
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
  await page.waitForURL(/settings/);
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

async function signinWithRecoveryCode(
  credentials: Credentials,
  recoveryCode: string,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  signinRecoveryCode: SigninRecoveryCodePage,
  signinTotpCode: SigninTotpCodePage
): Promise<void> {
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await expect(page).toHaveURL(/signin_totp_code/);
  await signinTotpCode.useRecoveryCodeLink.click();
  await expect(page).toHaveURL(/signin_recovery_code/);
  await signinRecoveryCode.fillOutCodeForm(recoveryCode);
}
