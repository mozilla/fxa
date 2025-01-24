/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
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
      const credentials = await signInBlockedAccount(
        target,
        page,
        signin,
        signinUnblock,
        testAccountTracker
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
      test.fixme(
        true,
        'TODO in FXA-9882, fix fxa-settings or test, should not be prompted enter password and unblock code again after entering a valid unblock code'
      );
      const credentials = await signInBlockedAccount(
        target,
        page,
        signin,
        signinUnblock,
        testAccountTracker
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
      const credentials = await signInBlockedAccount(
        target,
        page,
        signin,
        signinUnblock,
        testAccountTracker
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
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );

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
  await page.waitForURL(/settings/);
  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}

async function signInBlockedAccount(
  target: BaseTarget,
  page: Page,
  signin: SigninPage,
  signinUnblock: SigninUnblockPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUpBlocked();
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);

  await page.waitForURL(/signin_unblock/);

  //Verify sign in block header
  await expect(page).toHaveURL(/signin_unblock/);
  await expect(signinUnblock.heading).toBeVisible();
  await expect(page.getByText(credentials.email)).toBeVisible();

  return credentials;
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
