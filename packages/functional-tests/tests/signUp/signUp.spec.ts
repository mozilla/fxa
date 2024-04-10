/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  test,
  expect,
  SIGNIN_EMAIL_PREFIX,
  PASSWORD,
} from '../../lib/fixtures/standard';

const password = 'password12345678';

test.describe('severity-2 #smoke', () => {
  test.beforeEach(async ({ pages: { configPage } }) => {
    const config = await configPage.getConfig();
    test.skip(
      config.showReactApp.signUpRoutes === true,
      'these tests are specific to backbone, skip if serving React version'
    );
    test.slow();
  });
  test.describe('signup here', () => {
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

    test('signup with email with leading whitespace on the email', async ({
      target,
      page,
      pages: { login },
      emails,
    }) => {
      const [emailWithoutSpace] = emails;
      const emailWithSpace = '   ' + emailWithoutSpace;
      await page.goto(target.contentServerUrl);
      await login.fillOutFirstSignUp(emailWithSpace, password, {
        verify: false,
      });

      // Verify the confirm code header and the email
      await expect(login.signUpCodeHeader).toBeVisible();
      expect(await login.confirmEmail()).toContain(emailWithoutSpace);
    });

    test('signup with email with trailing whitespace on the email', async ({
      target,
      page,
      pages: { login },
      emails,
    }) => {
      const [emailWithoutSpace] = emails;
      const emailWithSpace = emailWithoutSpace + ' ';
      await page.goto(target.contentServerUrl);
      await login.fillOutFirstSignUp(emailWithSpace, password, {
        verify: false,
      });
      await expect(login.signUpCodeHeader).toBeVisible();
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
      emails,
    }) => {
      const [email] = emails;
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
      expect(await login.cannotCreateAccountHeader()).toBe(true);
    });

    test('sign up with non matching passwords', async ({
      target,
      page,
      pages: { login },
      emails,
    }) => {
      const [email] = emails;
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

    test('signup via relier page and redirect after confirm', async ({
      pages: { login, relier },
      emails,
    }) => {
      const [email] = emails;
      await relier.goto();
      await relier.clickEmailFirst();
      await login.fillOutFirstSignUp(email, password);
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });

  test.describe('signup here', () => {
    test.use({
      emailOptions: [
        { prefix: SIGNIN_EMAIL_PREFIX, password: PASSWORD },
        { prefix: SIGNIN_EMAIL_PREFIX, password: PASSWORD },
      ],
    });

    test('form prefill information is cleared after signup->sign out', async ({
      target,
      page,
      pages: { login, settings },
      emails,
    }) => {
      const [email, secondEmail] = emails;
      await page.goto(target.contentServerUrl);
      await login.fillOutFirstSignUp(email, password);

      // The original tab should transition to the settings page w/ success
      // message.
      expect(await login.isUserLoggedIn()).toBe(true);
      await settings.signOut();

      // check the email address was cleared
      await login.waitForEmailHeader();
      expect(await login.getEmailInput()).toContain('');

      await login.setEmail(secondEmail);
      await login.clickSubmit();

      // check the password was cleared
      expect(await login.getPasswordInput()).toContain('');
    });

    test('signup, verify and sign out of two accounts, all in the same tab, then sign in to the first account', async ({
      target,
      page,
      pages: { login, settings },
      emails,
    }) => {
      const [email, secondEmail] = emails;
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
