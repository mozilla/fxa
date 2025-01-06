/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCode } from 'fxa-settings/src/lib/totp';
import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('two step auth', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'React signInRoutes not enabled'
      );
    });

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
      const { secret } = await totp.fillOutTotpForms();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.signOut();
      await signin.goto();
      await signup.fillOutEmailForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      await page.waitForURL(/signin_totp_code/);
      const totpCode = await getCode(secret);
      await signinTotpCode.fillOutCodeForm(totpCode);

      await expect(page).toHaveURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.totp.status).toHaveText('Enabled');

      await settings.disconnectTotp(); // Required before teardown
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
      const { secret } = await totp.fillOutTotpForms();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
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
      const totpCode = await getCode(secret);
      await signinTotpCode.fillOutCodeForm(totpCode);

      await expect(page).toHaveURL(/pair/);

      await expect(connectAnotherDevice.fxaConnected).toBeVisible();

      await settings.goto();
      await settings.disconnectTotp(); // Required before teardown
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
      const { secret } = await totp.fillOutTotpForms();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
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

      // Required before teardown
      const code = await getCode(secret);
      await signinTotpCode.fillOutCodeForm(code);
      await settings.disconnectTotp();
    });
  });
});
