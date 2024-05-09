/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TestAccountTracker } from '../../lib/testAccountTracker';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { LoginPage } from '../../pages/login';
import { SettingsPage } from '../../pages/settings';
import { DeleteAccountPage } from '../../pages/settings/deleteAccount';
import { SigninReactPage } from '../../pages/signinReact';

test.describe('severity-2 #smoke', () => {
  test.describe('signin blocked', () => {
    test.beforeEach(() => {
      test.slow(); //This test has steps for email rendering that runs slow on stage
    });

    test('valid code entered', async ({
      target,
      page,
      pages: { signinReact, settings, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await signInBlockedAccount(
        target,
        page,
        signinReact,
        testAccountTracker
      );

      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinReact.fillOutSigninUnblockForm(code);

      // Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      // Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('incorrect code entered', async ({
      target,
      page,
      pages: { signinReact, settings, deleteAccount },
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'Invalid unblock code not being handled properly, need to fix in followup bug'
      );

      const credentials = await signInBlockedAccount(
        target,
        page,
        signinReact,
        testAccountTracker
      );

      await signinReact.fillOutSigninUnblockForm('12312312');

      //Verify tooltip error
      await expect(page.getByText('Invalid authorization code')).toBeVisible();

      // Unblock the email
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinReact.fillOutSigninUnblockForm(code);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('resend', async ({
      target,
      page,
      pages: { signinReact, resetPassword, settings, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await signInBlockedAccount(
        target,
        page,
        signinReact,
        testAccountTracker
      );

      // Click resend link
      await signinReact.signinUnblockResendCodeButton.click();

      // Verify success message
      await expect(
        signinReact.signinUnblockCodeResentSuccessMessage
      ).toBeVisible();

      // Unblock the email
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinReact.fillOutSigninUnblockForm(code);

      // Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      // Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('unverified', async ({
      target,
      page,
      pages: { login, settings, deleteAccount },
      testAccountTracker,
    }) => {
      test.fixme(true, 'FXA-9226');

      const credentials = await testAccountTracker.signUp({
        lang: 'en',
        preVerified: 'false',
      });

      await page.goto(target.contentServerUrl);
      await login.fillOutEmailFirstSignIn(
        credentials.email,
        credentials.password
      );

      //Verify sign in block header
      await expect(login.signInUnblockHeader()).toBeVisible();
      expect(await login.getUnblockEmail()).toContain(credentials.email);

      //Unblock the email
      await login.unblock(credentials.email);

      //Verify confirm code header
      await expect(login.signUpCodeHeader).toBeVisible();

      await login.fillOutSignInCode(credentials.email);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('with primary email changed', async ({
      target,
      page,
      pages: { signinReact, settings, secondaryEmail, deleteAccount },
      testAccountTracker,
    }) => {
      test.fixme(true, 'email case issue fxa-9697');
      const blockedEmail = testAccountTracker.generateBlockedEmail();
      const credentials = await signInAccount(
        target,
        page,
        signinReact,
        settings,
        testAccountTracker
      );

      await settings.goto();
      await settings.secondaryEmail.addButton.click();
      await secondaryEmail.addSecondaryEmail(blockedEmail);
      await settings.secondaryEmail.makePrimaryButton.click();
      credentials.email = blockedEmail;
      await settings.signOut();

      await page.goto(target.contentServerUrl);
      await signinReact.fillOutEmailFirstForm(blockedEmail);
      await signinReact.fillOutPasswordForm(credentials.password);

      //Verify sign in block header
      await expect(signinReact.signinUnblockFormHeading).toBeVisible();

      //Unblock the email
      const code = await target.emailClient.getUnblockCode(blockedEmail);
      await signinReact.fillOutSigninUnblockForm(code);

      // Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  signinReact: SigninReactPage,
  settings: SettingsPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await signinReact.fillOutEmailFirstForm(credentials.email);
  await signinReact.fillOutPasswordForm(credentials.password);
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}

async function signInBlockedAccount(
  target: BaseTarget,
  page: Page,
  signinReact: SigninReactPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUpBlocked();
  await page.goto(target.contentServerUrl);
  await signinReact.fillOutEmailFirstForm(credentials.email);
  await signinReact.fillOutPasswordForm(credentials.password);

  //Verify sign in block header
  await expect(signinReact.signinUnblockFormHeading).toBeVisible();
  // expect(await signinReact.getUnblockEmail()).toContain(credentials.email);

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
