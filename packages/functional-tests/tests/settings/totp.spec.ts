/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import { SettingsPage } from '../../pages/settings';
import { TotpCredentials, TotpPage } from '../../pages/settings/totp';

test.describe('severity-1 #smoke', () => {
  test.describe('two step auth', () => {
    test.beforeEach(async () => {
      // 2FA test can be slow because of time to generate recovery keys
      test.slow();
    });

    test('add and remove totp', async ({
      credentials,
      pages: { settings, totp, login },
    }) => {
      await settings.goto();
      const { secret } = await addTotp(settings, totp);
      credentials.secret = secret;
      await settings.totp.disableButton.click();
      await settings.modalConfirmButton.click();
      credentials.secret = '';

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication disabled'
      );
      await expect(settings.totp.status).toHaveText('Not Set');

      // Login to verify no prompt for code
      await settings.signOut();
      await login.login(credentials.email, credentials.password);
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('totp use QR code', async ({
      credentials,
      pages: { settings, totp },
    }) => {
      await settings.goto();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Not Set');

      await settings.totp.addButton.click();
      const secret = await totp.fillOutStep1FormQR();
      const recoveryCodes = await totp.fillOutStep2Form();
      await totp.fillOutStep3Form(recoveryCodes[0]);
      credentials.secret = secret;

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');
    });

    test('add TOTP and login', async ({
      credentials,
      pages: { login, settings, totp },
    }) => {
      await settings.goto();
      const { secret } = await addTotp(settings, totp);
      credentials.secret = secret;
      await settings.signOut();
      await login.login(credentials.email, credentials.password);
      await login.setTotp(credentials.secret);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Enabled');
    });

    test('totp invalid recovery code', async ({
      credentials,
      pages: { settings, totp, login },
    }) => {
      await settings.goto();
      const { secret } = await addTotp(settings, totp);
      credentials.secret = secret;
      await settings.signOut();
      await login.login(credentials.email, credentials.password);
      await login.clickUseRecoveryCode();
      await login.setCode('invalid!!!!');
      await login.submitButton.click();

      await expect(login.tooltip).toHaveText(
        'Invalid backup authentication code'
      );
    });

    test('can change backup authentication codes', async ({
      credentials,
      page,
      pages: { settings, totp, login },
    }) => {
      await settings.goto();
      const { secret, recoveryCodes } = await addTotp(settings, totp);
      credentials.secret = secret;
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
    });

    test('can get new backup authentication codes via email', async ({
      target,
      credentials,
      pages: { page, login, settings, totp },
    }) => {
      await settings.goto();
      const { secret, recoveryCodes } = await addTotp(settings, totp);
      credentials.secret = secret;
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
      const link = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.lowRecoveryCodes,
        EmailHeader.link
      );
      await page.goto(link);
      const newCodes = await totp.getRecoveryCodes();
      expect(newCodes.length).toEqual(recoveryCodes.length);
    });

    test('delete account with totp enabled', async ({
      credentials,
      page,
      pages: { settings, totp, login, deleteAccount },
    }) => {
      await settings.goto();
      const { secret } = await addTotp(settings, totp);
      credentials.secret = secret;
      await settings.signOut();
      await login.login(credentials.email, credentials.password);
      await login.setTotp(credentials.secret);

      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(credentials.password);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });
});

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
