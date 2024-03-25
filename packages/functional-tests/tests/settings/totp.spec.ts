/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

test.describe('severity-1 #smoke', () => {
  test.describe('two step auth', () => {
    test.beforeEach(async () => {
      // 2FA test can be slow because of time to generate recovery keys
      test.slow();
    });

    // https://testrail.stage.mozaws.net/index.php?/cases/view/1293446
    // https://testrail.stage.mozaws.net/index.php?/cases/view/1293452
    test('add and remove totp', async ({
      credentials,
      pages: { settings, totp, login, page },
    }) => {
      await settings.goto();
      let status = await settings.totp.statusText();
      expect(status).toEqual('Not Set');
      await settings.totp.clickAdd();
      const { secret } = await totp.fillTwoStepAuthenticationForm();
      credentials.secret = secret;
      await settings.waitForAlertBar();
      status = await settings.totp.statusText();
      expect(status).toEqual('Enabled');
      await settings.totp.clickDisable();
      await settings.clickModalConfirm();
      // wait for alert bar message
      await page.getByText('Two-step authentication disabled').waitFor();
      status = await settings.totp.statusText();
      expect(status).toEqual('Not Set');
      credentials.secret = null;

      // Login to verify no prompt for code
      await settings.signOut();
      await login.login(credentials.email, credentials.password);
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    // https://testrail.stage.mozaws.net/index.php?/cases/view/1293445
    test('totp use QR code #1293445', async ({
      credentials,
      pages: { settings, totp },
    }) => {
      await settings.goto();
      let status = await settings.totp.statusText();
      expect(status).toEqual('Not Set');
      await settings.totp.clickAdd();
      const { secret } = await totp.fillTwoStepAuthenticationForm('qr');
      credentials.secret = secret;
      await settings.waitForAlertBar();
      status = await settings.totp.statusText();
      expect(status).toEqual('Enabled');
    });

    // https://testrail.stage.mozaws.net/index.php?/cases/view/1293459
    test('add TOTP and login', async ({
      credentials,
      pages: { login, settings, totp },
    }) => {
      await settings.goto();
      await settings.totp.clickAdd();
      const { secret } = await totp.fillTwoStepAuthenticationForm();
      credentials.secret = secret;
      await settings.signOut();
      await login.login(credentials.email, credentials.password);
      await login.setTotp(credentials.secret);
      const status = await settings.totp.statusText();
      expect(status).toEqual('Enabled');
    });

    // https://testrail.stage.mozaws.net/index.php?/cases/view/1293450
    test('can change backup authentication codes #1293450', async ({
      credentials,
      page,
      pages: { settings, totp, login },
    }) => {
      await settings.goto();
      await settings.totp.clickAdd();
      const { secret, recoveryCodes } =
        await totp.fillTwoStepAuthenticationForm();
      credentials.secret = secret;
      await settings.totp.clickChange();
      await settings.clickModalConfirm();
      const newCodes = await totp.getRecoveryCodes();
      for (const code of recoveryCodes) {
        expect(newCodes).not.toContain(code);
      }
      await settings.clickRecoveryCodeAck();
      await totp.step3RecoveryCodeTextbox.fill(newCodes[0]);
      await totp.step3FinishButton.click();
      await settings.waitForAlertBar();
      await settings.signOut();
      await login.login(credentials.email, credentials.password);

      // Make sure an invalid code doesn't work
      await login.clickUseRecoveryCode();
      await login.setCode('invalid!!!!');
      await login.submitButton.click();
      await expect(login.tooltip).toContainText('Invalid');

      // Apply the correct code
      await login.setCode(newCodes[0]);
      await login.submit();

      expect(page.url()).toContain(settings.url);
    });

    // https://testrail.stage.mozaws.net/index.php?/cases/view/1293460
    test('can get new backup authentication codes via email #1293460', async ({
      target,
      credentials,
      pages: { page, login, settings, totp },
    }, { project }) => {
      await settings.goto();
      await settings.totp.clickAdd();
      const { secret, recoveryCodes } =
        await totp.fillTwoStepAuthenticationForm();
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
      const link = await target.email.waitForEmail(
        credentials.email,
        EmailType.lowRecoveryCodes,
        EmailHeader.link
      );
      await page.goto(link);
      const newCodes = await totp.getRecoveryCodes();
      expect(newCodes.length).toEqual(recoveryCodes.length);
    });

    // https://testrail.stage.mozaws.net/index.php?/cases/view/1293461
    test('delete account with totp enabled #1293461', async ({
      credentials,
      page,
      pages: { settings, totp, login, deleteAccount },
    }) => {
      await settings.goto();
      await settings.totp.clickAdd();
      const { secret } = await totp.fillTwoStepAuthenticationForm();
      credentials.secret = secret;
      await settings.signOut();
      await login.login(credentials.email, credentials.password);
      await login.setTotp(credentials.secret);
      await settings.clickDeleteAccount();
      await deleteAccount.checkAllBoxes();
      await deleteAccount.clickContinue();
      await deleteAccount.setPassword(credentials.password);
      await deleteAccount.submit();
      const success = await page.waitForSelector('.success');
      // TODO: "Error: toBeVisible can be only used with Locator object"
      // eslint-disable-next-line playwright/prefer-web-first-assertions
      expect(await success.isVisible()).toBeTruthy();
    });
  });
});
