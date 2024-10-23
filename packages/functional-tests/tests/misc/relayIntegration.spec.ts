/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirefoxCommand } from '../../lib/channels';
import { expect, test } from '../../lib/fixtures/standard';
import { relayDesktopOAuthQueryParams } from '../../lib/query-params';
import { getCode } from 'packages/fxa-settings/src/lib/totp';

const AGE_21 = '21';

test.describe('relay integration', () => {
  test.beforeEach(async ({ pages: { configPage } }) => {
    // Ensure that the feature flag is enabled
    const config = await configPage.getConfig();
    test.skip(
      config.showReactApp.signUpRoutes !== true,
      'Skip tests if not on React signUpRoutes'
    );
  });

  test('signup with Relay desktop', async ({
    target,
    syncOAuthBrowserPages: { confirmSignupCode, page, signup },
    testAccountTracker,
  }) => {
    const { email, password } =
      testAccountTracker.generateSignupAccountDetails();

    await signup.goto('/authorization', relayDesktopOAuthQueryParams);

    await expect(signup.page.getByText('Create an email mask ')).toBeVisible();

    await signup.emailTextbox.fill(email);
    await signup.submitButton.click();

    await expect(
      signup.page.getByText(
        'A password is needed to securely manage your masked emails and access ⁨Mozilla⁩’s security tools.'
      )
    ).toBeVisible();

    await signup.passwordTextbox.fill(password);
    await signup.verifyPasswordTextbox.fill(password);
    await signup.ageTextbox.fill(AGE_21);
    await signup.createAccountButton.click();

    await page.waitForURL(/confirm_signup_code/);

    const code = await target.emailClient.getVerifyShortCode(email);
    await confirmSignupCode.fillOutCodeForm(code);

    await page.waitForURL(/settings/);

    await signup.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
  });

  test('signin with Relay desktop', async ({
    syncOAuthBrowserPages: { confirmSignupCode, page, signin },
    testAccountTracker,
  }) => {
    const { email, password } = await testAccountTracker.signUp();

    await signin.goto('/authorization', relayDesktopOAuthQueryParams);

    await expect(signin.page.getByText('Create an email mask ')).toBeVisible();

    await signin.fillOutEmailFirstForm(email);

    await signin.fillOutPasswordForm(password);

    await page.waitForURL(/settings/);

    await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
  });

  test('signin with Relay desktop - with confirm email', async ({
    target,
    syncOAuthBrowserPages: { signinTokenCode, page, signin },
    testAccountTracker,
  }) => {
    const { email, password } = await testAccountTracker.signUpSync();

    await signin.goto('/authorization', relayDesktopOAuthQueryParams);

    await expect(signin.page.getByText('Create an email mask ')).toBeVisible();

    await signin.fillOutEmailFirstForm(email);

    await signin.fillOutPasswordForm(password);

    await page.waitForURL(/signin_token_code/);
    const code = await target.emailClient.getVerifyLoginCode(email);
    await signinTokenCode.fillOutCodeForm(code);

    await page.waitForURL(/settings/);

    await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);
  });

  test('signin with Relay desktop - with 2FA', async ({
    target,
    syncOAuthBrowserPages: { signinTotpCode, totp, page, signin, settings },
    testAccountTracker,
  }) => {
    const { email, password } = await testAccountTracker.signUp();

    // Sign-in without Sync, otw you will get prompted to create a recovery key
    await page.goto(target.contentServerUrl, { waitUntil: 'load' });

    await signin.fillOutEmailFirstForm(email);
    await signin.fillOutPasswordForm(password);

    await expect(settings.settingsHeading).toBeVisible();
    await settings.totp.addButton.click();
    const { secret } = await totp.fillOutTotpForms();
    await expect(settings.totp.status).toHaveText('Enabled');
    await settings.signOut();

    await signin.goto('/authorization', relayDesktopOAuthQueryParams);

    await expect(signin.page.getByText('Create an email mask ')).toBeVisible();

    await signin.fillOutEmailFirstForm(email);

    await signin.fillOutPasswordForm(password);

    await page.waitForURL(/signin_totp_code/);

    const totpCode = await getCode(secret);
    await signinTotpCode.fillOutCodeForm(totpCode);

    await page.waitForURL(/settings/);

    await signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin);

    await settings.disconnectTotp(); // Required before teardown
  });
});
