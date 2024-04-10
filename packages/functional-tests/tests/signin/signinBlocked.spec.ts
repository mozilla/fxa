/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  test,
  expect,
  PASSWORD,
  SIGNIN_EMAIL_PREFIX,
  BLOCKED_EMAIL_PREFIX,
} from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.beforeEach(async () => {
    test.slow(); //This test has steps for email rendering that runs slow on stage
  });

  test.describe('signin blocked', () => {
    test.use({
      emailOptions: [{ prefix: BLOCKED_EMAIL_PREFIX, password: PASSWORD }],
    });

    test('valid code entered', async ({
      emails,
      target,
      page,
      pages: { login, settings, deleteAccount },
    }) => {
      const [blockedEmail] = emails;
      await target.auth.signUp(blockedEmail, PASSWORD, {
        lang: 'en',
        preVerified: 'true',
      });
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(blockedEmail, PASSWORD);

      //Verify sign in block header
      await expect(login.signInUnblockHeader()).toBeVisible();
      expect(await login.getUnblockEmail()).toContain(blockedEmail);

      //Unblock the email
      await login.unblock(blockedEmail);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Delete blocked account, the fixture teardown doesn't work in this case
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(PASSWORD);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });

    test('incorrect code entered', async ({
      emails,
      target,
      page,
      pages: { login, settings, deleteAccount },
    }) => {
      const [blockedEmail] = emails;
      await target.auth.signUp(blockedEmail, PASSWORD, {
        lang: 'en',
        preVerified: 'true',
      });
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(blockedEmail, PASSWORD);

      //Verify sign in block header
      await expect(login.signInUnblockHeader()).toBeVisible();
      expect(await login.getUnblockEmail()).toContain(blockedEmail);
      await login.enterUnblockCode('incorrect');

      //Verify tooltip error
      expect(await login.getTooltipError()).toContain(
        'Invalid authorization code'
      );

      //Unblock the email
      await login.unblock(blockedEmail);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Delete blocked account, the fixture teardown doesn't work in this case
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(PASSWORD);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });

    test('resend', async ({
      emails,
      target,
      page,
      pages: { login, resetPassword, settings, deleteAccount },
    }) => {
      const [blockedEmail] = emails;
      await target.auth.signUp(blockedEmail, PASSWORD, {
        lang: 'en',
        preVerified: 'true',
      });
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(blockedEmail, PASSWORD);

      //Verify sign in block header
      await expect(login.signInUnblockHeader()).toBeVisible();
      expect(await login.getUnblockEmail()).toContain(blockedEmail);

      //Click resend link
      await resetPassword.clickResend();

      //Verify success message
      expect(await resetPassword.resendSuccessMessage()).toContain(
        'Email resent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
      );

      //Unblock the email
      await login.unblock(blockedEmail);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Delete blocked account, the fixture teardown doesn't work in this case
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(PASSWORD);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });

    test('unverified', async ({
      emails,
      target,
      page,
      pages: { login, settings, deleteAccount },
    }) => {
      test.fixme(true, 'FXA-9226');
      const [unverifiedEmail] = emails;
      await target.auth.signUp(unverifiedEmail, PASSWORD, {
        lang: 'en',
        preVerified: 'false',
      });
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(unverifiedEmail, PASSWORD);

      //Verify sign in block header
      await expect(login.signInUnblockHeader()).toBeVisible();
      expect(await login.getUnblockEmail()).toContain(unverifiedEmail);

      //Unblock the email
      await login.unblock(unverifiedEmail);

      //Verify confirm code header
      await expect(login.signUpCodeHeader).toBeVisible();

      await login.fillOutSignInCode(unverifiedEmail);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Delete blocked account, the fixture teardown doesn't work in this case
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(PASSWORD);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });

  test.describe('signin blocked', () => {
    test.use({
      emailOptions: [
        { prefix: BLOCKED_EMAIL_PREFIX, password: PASSWORD },
        { prefix: SIGNIN_EMAIL_PREFIX, password: PASSWORD },
      ],
    });
    test('with primary email changed', async ({
      emails,
      target,
      page,
      pages: { login, settings, deleteAccount, secondaryEmail },
    }) => {
      const [blockedEmail, email] = emails;
      await target.auth.signUp(email, PASSWORD, {
        lang: 'en',
        preVerified: 'true',
      });
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(email, PASSWORD);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      await settings.goto();
      await settings.secondaryEmail.addButton.click();
      await secondaryEmail.addSecondaryEmail(blockedEmail);
      await settings.secondaryEmail.makePrimaryButton.click();
      await settings.signOut();

      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(blockedEmail, PASSWORD);

      //Verify sign in block header
      await expect(login.signInUnblockHeader()).toBeVisible();
      expect(await login.getUnblockEmail()).toContain(blockedEmail);

      //Unblock the email
      await login.unblock(blockedEmail);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      //Delete blocked account, the fixture teardown doesn't work in this case
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(PASSWORD);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });
});
