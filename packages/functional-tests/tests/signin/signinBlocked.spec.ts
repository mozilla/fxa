/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
const password = 'passwordzxcv';
let blockedEmail;
let email;
let newEmail;
let unverifiedEmail;

test.describe('severity-2 #smoke', () => {
  test.describe('signin blocked', () => {
    test.beforeEach(async ({ target, pages: { login } }) => {
      test.slow(); //This test has steps for email rendering that runs slow on stage
      blockedEmail = login.createEmail('blocked{id}');
      await target.auth.signUp(blockedEmail, password, {
        lang: 'en',
        preVerified: 'true',
      });
      email = await login.createEmail();
      await target.auth.signUp(email, password, {
        lang: 'en',
        preVerified: 'true',
      });
      newEmail = login.createEmail('blocked{id}');
      unverifiedEmail = login.createEmail('blocked{id}');
      await target.auth.signUp(unverifiedEmail, password, {
        lang: 'en',
        preVerified: 'false',
      });
      await login.clearCache();
    });

    test.afterEach(async ({ target }) => {
      test.slow(); //The cleanup was timing out and exceeding 3000ms
      const emails = [blockedEmail, email, newEmail, unverifiedEmail];
      for (const email of emails) {
        if (email) {
          try {
            await target.auth.accountDestroy(email, password);
          } catch (e) {
            // Handle any errors if needed
          }
        }
      }
    });

    test('valid code entered', async ({ target, page, pages: { login } }) => {
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(blockedEmail, password);

      //Verify sign in block header
      expect(login.signInUnblockHeader()).toBeVisible();
      expect(await login.getUnblockEmail()).toContain(blockedEmail);

      //Unblock the email
      await login.unblock(blockedEmail);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('incorrect code entered', async ({
      target,
      page,
      pages: { login },
    }) => {
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(blockedEmail, password);

      //Verify sign in block header
      expect(login.signInUnblockHeader()).toBeVisible();
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
    });

    test('resend', async ({
      target,
      page,
      pages: { login, resetPassword },
    }) => {
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(blockedEmail, password);

      //Verify sign in block header
      expect(login.signInUnblockHeader()).toBeVisible();
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
    });

    test('with primary email changed', async ({
      target,
      page,
      pages: { login, settings, secondaryEmail },
    }) => {
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(email, password);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);

      await settings.goto();
      await settings.secondaryEmail.clickAdd();
      await secondaryEmail.addAndVerify(newEmail);
      await settings.secondaryEmail.clickMakePrimary();
      await settings.signOut();

      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(newEmail, password);

      //Verify sign in block header
      expect(login.signInUnblockHeader()).toBeVisible();
      expect(await login.getUnblockEmail()).toContain(newEmail);

      //Unblock the email
      await login.unblock(newEmail);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('unverified', async ({ target, page, pages: { login } }) => {
      test.fixme(true, 'FXA-9226');
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutEmailFirstSignIn(unverifiedEmail, password);

      //Verify sign in block header
      expect(login.signInUnblockHeader()).toBeVisible();
      expect(await login.getUnblockEmail()).toContain(unverifiedEmail);

      //Unblock the email
      await login.unblock(unverifiedEmail);

      //Verify confirm code header
      expect(login.signUpCodeHeader()).toBeVisible();

      await login.fillOutSignInCode(unverifiedEmail);

      //Verify logged in on Settings page
      expect(await login.isUserLoggedIn()).toBe(true);
    });
  });
});
