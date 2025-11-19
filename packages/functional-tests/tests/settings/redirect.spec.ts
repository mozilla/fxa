/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, Page, test } from '../../lib/fixtures/standard';
import { getTotpCode } from '../../lib/totp';
import { create as createPages } from '../../pages';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';
import { TotpPage } from '../../pages/settings/totp';

test.describe('severity-2 #smoke', () => {
  test.describe('Auth error redirects', () => {
    test('redirects to signin_totp_code when AAL is insufficient on action', async ({
      context,
      target,
      page,
      pages: { signin, settings, signinTotpCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, signin, settings, credentials);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const browser = context.browser()!;
      const secondContext = await browser.newContext();
      const secondPage = await secondContext.newPage();

      const secondPages = createPages(secondPage, target);

      await signInAccount(
        target,
        secondPage,
        secondPages.signin,
        secondPages.settings,
        credentials
      );
      const { secret } = await enableTwoFactorAuth(
        target,
        secondPages.settings,
        secondPages.totp,
        credentials
      );

      await page.bringToFront();
      await settings.secondaryEmail.addButton.click();

      await expect(page).toHaveURL(/signin_totp_code/);
      await expect(signinTotpCode.aalUpgradeBanner).toBeVisible();
      await expect(
        page.getByRole('heading', {
          name: 'Enter two-step authentication code',
        })
      ).toBeVisible();

      const code = await getTotpCode(secret);
      await signinTotpCode.fillOutCodeForm(code);

      await expect(page).toHaveURL(/settings/);
      await settings.disconnectTotp();
      await secondContext.close();
    });

    test('redirects to signin_totp_code when AAL is insufficient on refresh', async ({
      context,
      target,
      page,
      pages: { signin, settings, signinTotpCode },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, signin, settings, credentials);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const browser = context.browser()!;
      const secondContext = await browser.newContext();
      const secondPage = await secondContext.newPage();

      const secondPages = createPages(secondPage, target);

      await signInAccount(
        target,
        secondPage,
        secondPages.signin,
        secondPages.settings,
        credentials
      );
      const { secret } = await enableTwoFactorAuth(
        target,
        secondPages.settings,
        secondPages.totp,
        credentials
      );

      await page.bringToFront();
      await page.reload();

      await expect(page).toHaveURL(/signin_totp_code/);
      await expect(signinTotpCode.aalUpgradeBanner).toBeVisible();
      await expect(
        page.getByRole('heading', {
          name: 'Enter two-step authentication code',
        })
      ).toBeVisible();

      const code = await getTotpCode(secret);
      await signinTotpCode.fillOutCodeForm(code);

      await expect(page).toHaveURL(/settings/);
      await settings.disconnectTotp();
      await secondContext.close();
    });

    test('redirects to email first when session token is invalid', async ({
      target,
      page,
      pages: { signin, settings },
      testAccountTracker,
    }) => {
      console.log('!!! sanity check');
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, signin, settings, credentials);

      await expect(settings.settingsHeading).toBeVisible();
      await signin.destroySession(credentials.email);

      await settings.secondaryEmail.addButton.click();

      await expect(page).toHaveURL(/signin/);
    });
  });
});

/**
 * Helper function to sign in an account
 */
async function signInAccount(
  target: BaseTarget,
  page: Page,
  signin: SigninPage,
  settings: SettingsPage,
  credentials: Credentials
): Promise<void> {
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await expect(settings.settingsHeading).toBeVisible();
}

/**
 * Helper function to enable two-factor authentication
 */
async function enableTwoFactorAuth(
  target: BaseTarget,
  settings: SettingsPage,
  totp: TotpPage,
  credentials: Credentials
): Promise<{ secret: string }> {
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
  return { secret };
}
