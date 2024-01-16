/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

const password = 'password12345678';

test.describe('severity-2 #smoke', () => {
  test.describe('signup here', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes === true,
        'these tests are specific to backbone, skip if serving React version'
      );
      test.slow();
    });

    test('with an invalid email, empty email query query param', async ({
      target,
      page,
      pages: { login },
    }) => {
      await page.goto(`${target.contentServerUrl}?email=invalid`);
      expect(await login.getErrorMessage()).toContain(
        'Invalid parameter: email'
      );

      await page.goto(`${target.contentServerUrl}?email=`);
      expect(await login.getErrorMessage()).toContain(
        'Invalid parameter: email'
      );
    });

    test('signup with email with leading/trailing whitespace on the email', async ({
      target,
      page,
      pages: { login },
    }) => {
      let email = login.createEmail();
      let emailWithoutSpace = email;
      let emailWithSpace = '   ' + email;
      await page.goto(target.contentServerUrl);
      await login.fillOutFirstSignUp(emailWithSpace, password, {
        verify: false,
      });

      // Verify the confirm code header and the email
      await login.waitForSignUpCodeHeader();
      expect(await login.confirmEmail()).toContain(emailWithoutSpace);

      // Need to clear the cache to get the new email
      await login.clearCache();

      await page.goto(target.contentServerUrl);
      email = login.createEmail();
      emailWithoutSpace = email;
      emailWithSpace = email + ' ';
      await login.fillOutFirstSignUp(emailWithSpace, password, {
        verify: false,
      });
      await login.waitForSignUpCodeHeader();
      expect(await login.confirmEmail()).toContain(emailWithoutSpace);
    });

    test('signup with invalid email address', async ({
      target,
      page,
      pages: { login },
    }) => {
      await page.goto(target.contentServerUrl);
      await login.setEmail('invalidemail');
      await login.clickSubmit();

      // Verify the error
      expect(await login.getTooltipError()).toContain('Valid email required');
    });

    test('coppa is empty and too young', async ({
      target,
      page,
      pages: { login },
    }) => {
      const email = login.createEmail();
      await page.goto(target.contentServerUrl);
      await login.setEmail(email);
      await login.clickSubmit();
      await page.waitForURL(/signup/);
      await login.setPassword(password);
      await login.confirmPassword(password);
      await login.clickSubmit();

      // Verify the error
      expect(await login.getTooltipError()).toContain(
        'You must enter your age to sign up'
      );

      await login.setAge('12');
      await login.clickSubmit();

      // Verify navigated to the cannot create account page
      await page.waitForURL(/cannot_create_account/);
      // TODO: this is flaky
      // expect(await login.cannotCreateAccountHeader()).toBe(true);
    });

    test('sign up with non matching passwords', async ({
      target,
      page,
      pages: { login },
    }) => {
      const email = login.createEmail();
      await page.goto(target.contentServerUrl);
      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(password);
      await login.confirmPassword('wrongpassword');
      await login.setAge('24');
      await login.clickSubmit();

      // Verify the error
      expect(await login.getTooltipError()).toContain('Passwords do not match');
    });

    test('form prefill information is cleared after signup->sign out', async ({
      target,
      page,
      pages: { login, settings },
    }) => {
      const email = login.createEmail();
      await page.goto(target.contentServerUrl);
      await login.fillOutFirstSignUp(email, password);

      // The original tab should transition to the settings page w/ success
      // message.
      expect(await login.isUserLoggedIn()).toBe(true);
      await settings.signOut();

      // check the email address was cleared
      await login.waitForEmailHeader();
      expect(await login.getEmailInput()).toContain('');

      await login.setEmail(login.createEmail());
      await login.clickSubmit();

      // check the password was cleared
      expect(await login.getPasswordInput()).toContain('');
    });

    test('signup via relier page and redirect after confirm', async ({
      pages: { login, relier },
    }) => {
      const email = login.createEmail();
      await relier.goto();
      await relier.clickEmailFirst();
      await login.fillOutFirstSignUp(email, password);
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('signup, verify and sign out of two accounts, all in the same tab, then sign in to the first account', async ({
      target,
      page,
      pages: { login, settings },
    }) => {
      const email = login.createEmail();
      const secondEmail = login.createEmail();
      await page.goto(target.contentServerUrl);
      await login.fillOutFirstSignUp(email, password);

      // The original tab should transition to the settings page w/ success
      // message.
      expect(await login.isUserLoggedIn()).toBe(true);

      // Verify the account is in local storage and has a correct state
      const currentAccountUid = await page.evaluate(() => {
        return JSON.parse(
          localStorage.getItem('__fxa_storage.currentAccountUid') || ''
        );
      });
      const accounts = await page.evaluate(() => {
        return JSON.parse(
          localStorage.getItem('__fxa_storage.accounts') || '{}'
        );
      });
      const account = accounts[currentAccountUid];
      expect(currentAccountUid).toBeDefined();
      expect(accounts).toBeDefined();
      expect(accounts[currentAccountUid]).toBeDefined();
      expect(account.email).toBe(email);
      expect(account.lastLogin).toBeDefined();
      expect(account.metricsEnabled).toBe(true);
      expect(account.sessionToken).toBeDefined();
      expect(account.uid).toBeDefined();
      expect(account.verified).toBe(true);

      await settings.signOut();

      await login.fillOutFirstSignUp(secondEmail, password);

      // The original tab should transition to the settings page w/ success
      // message.
      expect(await login.isUserLoggedIn()).toBe(true);
      await settings.signOut();

      await login.setEmail(email);
      await login.clickSubmit();
      await login.setPassword(password);
      await login.submit();
      expect(await login.isUserLoggedIn()).toBe(true);
    });
  });
});
