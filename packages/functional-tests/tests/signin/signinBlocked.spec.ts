/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TestAccountTracker } from '../../lib/testAccountTracker';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { LoginPage } from '../../pages/login';
import { SettingsPage } from '../../pages/settings';
import { DeleteAccountPage } from '../../pages/settings/deleteAccount';

test.describe('severity-2 #smoke', () => {
  test.describe('signin blocked', () => {
    test('valid code entered', async ({
      target,
      page,
      pages: { login, settings, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await signInBlockedAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      //Unblock the email
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await login.unblock(code);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('incorrect code entered', async ({
      target,
      page,
      pages: { login, settings, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await signInBlockedAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await login.enterUnblockCode('incorrect');

      //Verify tooltip error
      await expect(login.getTooltipError()).toContainText(
        'Invalid authorization code'
      );

      //Unblock the email
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await login.unblock(code);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('resend', async ({
      target,
      page,
      pages: { login, settings, signinUnblock, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await signInBlockedAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      //Click resend code button
      await signinUnblock.resendCodeButton.click();

      //Verify success message
      await expect(signinUnblock.successMessage).toBeVisible();

      //Unblock the email
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await login.unblock(code);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('unverified', async ({
      target,
      page,
      pages: { login, settings, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked({
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
      const unblockCode = await target.emailClient.getUnblockCode(
        credentials.email
      );
      await login.unblock(unblockCode);

      //Verify confirm code header
      await expect(login.signUpCodeHeader).toBeVisible();

      const verifyCode = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await login.fillOutSignInCode(verifyCode);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('with primary email changed', async ({
      target,
      page,
      pages: { login, settings, secondaryEmail, deleteAccount },
      testAccountTracker,
    }) => {
      const blockedEmail = testAccountTracker.generateBlockedEmail();
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );

      await settings.goto();
      await settings.secondaryEmail.addButton.click();
      await secondaryEmail.fillOutEmail(blockedEmail);
      const verifyCode: string = await target.emailClient.getVerifySecondCode(
        blockedEmail
      );
      await secondaryEmail.fillOutVerificationCode(verifyCode);
      await settings.secondaryEmail.makePrimaryButton.click();
      credentials.email = blockedEmail;
      await settings.signOut();

      await page.goto(target.contentServerUrl);
      await login.fillOutEmailFirstSignIn(blockedEmail, credentials.password);

      //Verify sign in block header
      await expect(login.signInUnblockHeader()).toBeVisible();
      expect(await login.getUnblockEmail()).toContain(blockedEmail);

      //Unblock the email
      const unblockCode = await target.emailClient.getUnblockCode(blockedEmail);
      await login.unblock(unblockCode);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  login: LoginPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await login.fillOutEmailFirstSignIn(credentials.email, credentials.password);

  //Verify logged in on Settings page
  expect(await login.isUserLoggedIn()).toBe(true);

  return credentials;
}

async function signInBlockedAccount(
  target: BaseTarget,
  page: Page,
  login: LoginPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUpBlocked();
  await page.goto(target.contentServerUrl);
  await login.fillOutEmailFirstSignIn(credentials.email, credentials.password);

  //Verify sign in block header
  await expect(login.signInUnblockHeader()).toBeVisible();
  expect(await login.getUnblockEmail()).toContain(credentials.email);

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
