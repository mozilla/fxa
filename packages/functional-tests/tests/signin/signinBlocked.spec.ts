/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCode } from 'fxa-settings/src/lib/totp';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { DeleteAccountPage } from '../../pages/settings/deleteAccount';
import { SigninPage } from '../../pages/signin';
import { SigninUnblockPage } from '../../pages/signinUnblock';

test.describe('severity-2 #smoke', () => {
  test.describe('signin blocked', () => {
    test('valid code entered', async ({
      target,
      page,
      pages: { deleteAccount, settings, signin, signinUnblock },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked();
      await signInBlockedAccount(
        target,
        page,
        signin,
        signinUnblock,
        credentials
      );

      //Unblock the email
      const unblockCode = await target.emailClient.getUnblockCode(
        credentials.email
      );
      await signinUnblock.fillOutCodeForm(unblockCode);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('incorrect code entered', async ({
      target,
      page,
      pages: { signin, signinUnblock, settings, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked();
      await signInBlockedAccount(
        target,
        page,
        signin,
        signinUnblock,
        credentials
      );

      await signinUnblock.fillOutCodeForm('invalidd');

      //Verify tooltip error
      await expect(page.getByText('Invalid authorization code')).toBeVisible();

      //Unblock the email
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinUnblock.fillOutCodeForm(code);

      // for react test to pass:
      // await signin.fillOutPasswordForm(credentials.password);
      // await expect(page).toHaveURL(/signin_unblock/);
      // const newCode = await target.emailClient.getUnblockCode(credentials.email);
      // await signinUnblock.fillOutCodeForm(newCode);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('resend', async ({
      target,
      page,
      pages: { signin, settings, signinUnblock, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked();
      await signInBlockedAccount(
        target,
        page,
        signin,
        signinUnblock,
        credentials
      );

      //Click resend code button
      await signinUnblock.resendCodeButton.click();

      //Verify success message
      await expect(
        page.getByText(/A new code was sent to your email./)
      ).toBeVisible();

      //Unblock the email
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinUnblock.fillOutCodeForm(code);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('unverified', async ({
      target,
      page,
      pages: {
        signin,
        confirmSignupCode,
        settings,
        deleteAccount,
        signinUnblock,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked({
        lang: 'en',
        preVerified: 'false',
      });

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      //Verify sign in block header
      await expect(page).toHaveURL(/signin_unblock/);

      const unblockCode = await target.emailClient.getUnblockCode(
        credentials.email
      );
      await signinUnblock.fillOutCodeForm(unblockCode);

      //Verify confirm code header
      await expect(page).toHaveURL(/confirm_signup_code/);

      const confirmationCode = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await confirmSignupCode.fillOutCodeForm(confirmationCode);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('with primary email changed', async ({
      target,
      page,
      pages: { deleteAccount, secondaryEmail, settings, signin, signinUnblock },
      testAccountTracker,
    }) => {
      const blockedEmail = testAccountTracker.generateBlockedEmail();
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();
      await settings.secondaryEmail.addButton.click();
      await secondaryEmail.fillOutEmail(blockedEmail);
      const verifyCode: string =
        await target.emailClient.getVerifySecondaryCode(blockedEmail);
      await secondaryEmail.fillOutVerificationCode(verifyCode);
      await settings.secondaryEmail.makePrimaryButton.click();
      credentials.email = blockedEmail;
      await settings.signOut();

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(blockedEmail);
      await signin.fillOutPasswordForm(credentials.password);

      //Verify sign in block header
      await expect(page).toHaveURL(/signin_unblock/);
      await expect(page.getByText(credentials.email)).toBeVisible();

      //Unblock the email
      const unblockCode = await target.emailClient.getUnblockCode(blockedEmail);
      await signinUnblock.fillOutCodeForm(unblockCode);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      // Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('sync with 2fa', async ({
      target,
      page,
      pages: {
        deleteAccount,
        settings,
        signin,
        signinUnblock,
        signinTotpCode,
        totp,
        confirmSignupCode,
        configPage,
      },
      testAccountTracker,
    }) => {
      test.skip(true, 'TODO: FXA-12084');
      const config = await configPage.getConfig();
      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        preVerified: 'false',
      });

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      //Verify confirm code header
      await expect(page).toHaveURL(/confirm_signup_code/);

      const confirmationCode = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await confirmSignupCode.fillOutCodeForm(confirmationCode);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      await settings.totp.addButton.click();

      // TODO in FXA-11941 - remove condition
      const { secret } = config.featureFlags.updated2faSetupFlow
        ? await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice()
        : await totp.setUpTwoStepAuthWithQrCodeNoRecoveryChoice();

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication has been enabled'
      );

      await page.waitForURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');
      await settings.signOut();

      // Create blocked sign in
      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      do {
        await signin.fillOutPasswordForm(credentials.password + Date.now());
        await page.waitForTimeout(300);
      } while (page.url().indexOf('signin_unblock') === -1);

      //Verify sign in block header
      await expect(page).toHaveURL(/signin_unblock/);
      const unblockCode = await target.emailClient.getUnblockCode(
        credentials.email
      );
      await signinUnblock.fillOutCodeForm(unblockCode);

      // Enter the unblock code.
      await expect(page).toHaveURL(/signin/);
      await signin.fillOutPasswordForm(credentials.password);

      // Now should go to totp code
      await expect(page).toHaveURL(/signin_totp_code/);
      const code = await getCode(secret);
      await signinTotpCode.fillOutCodeForm(code);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      // Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  credentials: Credentials
): Promise<void> {
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await page.waitForURL(/settings/);
  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();
}

async function signInBlockedAccount(
  target: BaseTarget,
  page: Page,
  signin: SigninPage,
  signinUnblock: SigninUnblockPage,
  credentials: Credentials
): Promise<void> {
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);

  await page.waitForURL(/signin_unblock/);

  //Verify sign in block header
  await expect(page).toHaveURL(/signin_unblock/);
  await expect(signinUnblock.heading).toBeVisible();
  await expect(page.getByText(credentials.email)).toBeVisible();
}

async function removeAccount(
  settings: SettingsPage,
  deleteAccount: DeleteAccountPage,
  page: Page,
  password: string
) {
  await settings.deleteAccountButton.click();
  await deleteAccount.deleteAccount(password);

  await expect(page.getByText('Account deleted successfully')).toBeVisible();
}
