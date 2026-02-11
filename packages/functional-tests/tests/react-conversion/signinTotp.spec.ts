/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getTotpCode } from '../../lib/totp';
import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('two step auth', () => {
    test('add totp', async ({
      pages: { settings, totp, page, signin, signup, signinTotpCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await signin.goto();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Disabled');

      await settings.totp.addButton.click();
      await settings.confirmMfaGuard(credentials.email);
      const { secret } =
        await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice(credentials);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toContainText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.signOut();
      await signin.goto();
      await signup.fillOutEmailForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await page.waitForURL(/signin_totp_code/);
      const totpCode = await getTotpCode(secret);
      await signinTotpCode.fillOutCodeForm(totpCode);

      await expect(page).toHaveURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Enabled');
    });

    test('add totp, login with sync', async ({
      syncBrowserPages: {
        connectAnotherDevice,
        settings,
        totp,
        page,
        signin,
        signup,
        signinTotpCode,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await signin.goto();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Disabled');

      await settings.totp.addButton.click();
      await settings.confirmMfaGuard(credentials.email);
      const { secret } =
        await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice(credentials);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toContainText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.signOut();

      const syncParams = new URLSearchParams();
      syncParams.append('context', 'fx_desktop_v3');
      syncParams.append('service', 'sync');
      syncParams.append('action', 'email');
      await signin.goto('/', syncParams);

      await signup.fillOutEmailForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await page.waitForURL(/signin_totp_code/);
      const totpCode = await getTotpCode(secret);
      await signinTotpCode.fillOutCodeForm(totpCode);

      await page.waitForURL(/pair/);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();
    });

    test('error message when totp code is invalid', async ({
      pages: { page, settings, totp, signin, signup, signinTotpCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await signin.goto();
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Disabled');

      await settings.totp.addButton.click();
      await settings.confirmMfaGuard(credentials.email);
      const { secret } =
        await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice(credentials);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toContainText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.signOut();
      await signin.goto();
      await signup.fillOutEmailForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await page.waitForURL(/signin_totp_code/);
      await signinTotpCode.fillOutCodeForm('111111');

      await expect(signin.authenticationCodeTextboxTooltip).toHaveText(
        'Invalid two-step authentication code'
      );
    });
  });
});
