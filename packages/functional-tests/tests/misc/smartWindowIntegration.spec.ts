/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import { smartWindowDesktopOAuthQueryParams } from '../../lib/query-params';
import { getTotpCode } from '../../lib/totp';

test.describe('smart window integration', () => {
  test('signup with SmartWindow desktop', async ({
    target,
    syncOAuthBrowserPages: { confirmSignupCode, page, signup },
    testAccountTracker,
  }) => {
    const { email, password } =
      testAccountTracker.generateSignupAccountDetails();

    await signup.goto('/authorization', smartWindowDesktopOAuthQueryParams);

    await expect(
      signup.page.getByText('Firefox Smart Window', { exact: false })
    ).toBeVisible();

    await signup.emailTextbox.fill(email);
    await signup.submitButton.click();

    await page.waitForURL(/signup/);

    await signup.passwordTextbox.fill(password);
    await signup.createAccountButton.click();

    await page.waitForURL(/confirm_signup_code/);

    const code = await target.emailClient.getVerifyShortCode(email);
    await confirmSignupCode.fillOutCodeForm(code);

    await page.waitForURL(/settings/);

    await signup.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    await signup.checkWebChannelMessageServices(FirefoxCommand.Login, {
      smartwindow: {},
    });
  });

  test('signin with SmartWindow desktop', async ({
    syncOAuthBrowserPages: { page, signin },
    testAccountTracker,
  }) => {
    const { email, password } = await testAccountTracker.signUp();

    await signin.goto('/authorization', smartWindowDesktopOAuthQueryParams);

    await expect(
      signin.page.getByText('Firefox Smart Window', { exact: false })
    ).toBeVisible();

    await signin.fillOutEmailFirstForm(email);

    await signin.fillOutPasswordForm(password);

    await page.waitForURL(/settings/);

    await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    await signin.checkWebChannelMessageServices(FirefoxCommand.Login, {
      smartwindow: {},
    });
  });

  test('signin with SmartWindow desktop - with confirm email', async ({
    target,
    syncOAuthBrowserPages: { signinTokenCode, page, signin },
    testAccountTracker,
  }) => {
    const { email, password } = await testAccountTracker.signUpSync();

    await signin.goto('/authorization', smartWindowDesktopOAuthQueryParams);

    await expect(
      signin.page.getByText('Firefox Smart Window', { exact: false })
    ).toBeVisible();

    await signin.fillOutEmailFirstForm(email);

    await signin.fillOutPasswordForm(password);

    await page.waitForURL(/signin_token_code/);
    const code = await target.emailClient.getVerifyLoginCode(email);
    await signinTokenCode.fillOutCodeForm(code);

    await page.waitForURL(/settings/);

    await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    await signin.checkWebChannelMessageServices(FirefoxCommand.Login, {
      smartwindow: {},
    });
  });

  test('signin with SmartWindow desktop - with 2FA', async ({
    target,
    syncOAuthBrowserPages: { signinTotpCode, totp, page, signin, settings },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    const { email, password } = credentials;

    // Sign-in without Sync, otw you will get prompted to create a recovery key
    await page.goto(target.contentServerUrl, { waitUntil: 'load' });

    await signin.fillOutEmailFirstForm(email);
    await signin.fillOutPasswordForm(password);

    await expect(settings.settingsHeading).toBeVisible();
    await settings.totp.addButton.click();
    await settings.confirmMfaGuard(email);
    const { secret } =
      await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice(credentials);
    await expect(settings.totp.status).toHaveText('Enabled');
    await settings.signOut();

    await signin.goto('/authorization', smartWindowDesktopOAuthQueryParams);

    await expect(
      signin.page.getByText('Firefox Smart Window', { exact: false })
    ).toBeVisible();

    await signin.fillOutEmailFirstForm(email);

    await signin.fillOutPasswordForm(password);

    await page.waitForURL(/signin_totp_code/);

    const totpCode = await getTotpCode(secret);
    await signinTotpCode.fillOutCodeForm(totpCode);

    await page.waitForURL(/settings/);

    await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
    await signin.checkWebChannelMessageServices(FirefoxCommand.Login, {
      smartwindow: {},
    });
  });
});
