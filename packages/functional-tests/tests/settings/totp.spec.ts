/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { LoginPage } from '../../pages/login';
import { SettingsPage } from '../../pages/settings';
import { TotpCredentials, TotpPage } from '../../pages/settings/totp';

test.describe('severity-1 #smoke', () => {
  test.describe('two step auth', () => {
    test('add and remove totp', async ({
      target,
      pages: { page, settings, totp, login },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await settings.goto();
      await addTotp(settings, totp);
      await settings.disconnectTotp();
      // Login to verify no prompt for code
      await settings.signOut();
      await login.login(credentials.email, credentials.password);
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('totp use QR code', async ({
      target,
      pages: { page, login, settings, totp },
      testAccountTracker,
    }) => {
      await signInAccount(target, page, login, testAccountTracker);

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

    test('add TOTP and login', async ({
      target,
      pages: { page, settings, totp, login },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await settings.goto();
      const { secret } = await addTotp(settings, totp);
      await settings.signOut();
      await login.login(credentials.email, credentials.password);
      await login.setTotp(secret);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.disconnectTotp(); // Required before teardown
    });

    test('totp invalid recovery code', async ({
      target,
      pages: { page, settings, totp, login },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await settings.goto();
      const { recoveryCodes } = await addTotp(settings, totp);
      await settings.signOut();
      await login.login(credentials.email, credentials.password);
      await login.clickUseRecoveryCode();
      await login.setCode('invalid!!!!');
      await login.submitButton.click();

      await expect(login.tooltip).toHaveText(
        'Invalid backup authentication code'
      );

      // Required before teardown
      await login.setCode(recoveryCodes[0]);
      await login.submitButton.click();
      await settings.disconnectTotp();
    });

    test('can change backup authentication codes', async ({
      target,
      pages: { page, settings, totp, login },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await settings.goto();
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
      await login.login(credentials.email, credentials.password);
      await login.clickUseRecoveryCode();
      await login.setCode(newCodes[0]);
      await login.submit();

      expect(page.url()).toContain(settings.url);

      await settings.disconnectTotp(); // Required before teardown
    });

    test('can get new backup authentication codes via email', async ({
      target,
      pages: { page, settings, totp, login },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await settings.goto();
      const { recoveryCodes } = await addTotp(settings, totp);
      await settings.signOut();

      for (let i = 0; i < recoveryCodes.length - 3; i++) {
        await login.login(
          credentials.email,
          credentials.password,
          recoveryCodes[i]
        );
        await login.page.waitForURL(/settings/);
        await settings.signOut();
      }
      await login.login(
        credentials.email,
        credentials.password,
        recoveryCodes[recoveryCodes.length - 1]
      );
      await login.page.waitForURL(/settings/);
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

    test('delete account with totp enabled', async ({
      target,
      pages: { page, settings, totp, login, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await settings.goto();
      const { secret } = await addTotp(settings, totp);
      await settings.signOut();
      await login.login(credentials.email, credentials.password);
      await login.setTotp(secret);

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
  login: LoginPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await login.fillOutEmailFirstSignIn(credentials.email, credentials.password);

  //Verify logged in on Settings page
  expect(await login.isUserLoggedIn()).toBe(true);

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
