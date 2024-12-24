/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCode } from 'fxa-settings/src/lib/totp';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test.describe('OAuth totp', () => {
    test('can add TOTP to account and confirm oauth signin', async ({
      target,
      pages: { page, signin, relier, settings, totp, signinTotpCode },
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
      await settings.totp.addButton.click();
      const { secret } = await totp.fillOutTotpForms();
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
      await settings.disconnectTotp();
    });

    test('can remove TOTP from account and skip confirmation', async ({
      target,
      pages: { page, relier, settings, signin, totp },
      testAccountTracker,
    }) => {
      await signInAccount(target, page, settings, signin, testAccountTracker);
      await settings.goto();
      await settings.totp.addButton.click();
      await totp.fillOutTotpForms();
      await expect(settings.totp.status).toHaveText('Enabled');
      await settings.totp.disableButton.click();
      await settings.clickModalConfirm();

      // wait for alert bar message
      await expect(
        page.getByText('Two-step authentication disabled')
      ).toBeVisible();
      await expect(settings.totp.status).toHaveText('Disabled');

      await relier.goto();
      await relier.clickEmailFirst();
      await signin.signInButton.click();

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('can setup TOTP inline and login', async ({
      target,
      pages: { page, relier, settings, signin, totp },
      testAccountTracker,
    }) => {
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
        await signin.page.getByTestId('manual-code').innerText()
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

  // Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
