/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

const password = 'password12345678';

test.describe('signup here', () => {
  test.beforeEach(async () => {
    test.slow();
  });

  test('with an invalid email', async ({ target, page, pages: { login } }) => {
    await page.goto(`${target.contentServerUrl}?email=invalid`, {
      waitUntil: 'networkidle',
    });
    expect(await login.getErrorMessage()).toMatch('Invalid parameter: email');
  });

  test('with an empty email', async ({ target, page, pages: { login } }) => {
    await page.goto(`${target.contentServerUrl}?email=`, {
      waitUntil: 'networkidle',
    });
    expect(await login.getErrorMessage()).toMatch('Invalid parameter: email');
  });

  test('signup with email with leading whitespace on the email', async ({
    target,
    page,
    pages: { login },
  }) => {
    const email = login.createEmail();
    const emailWithoutSpace = email;
    const emailWithSpace = '   ' + email;
    await page.goto(target.contentServerUrl);
    await login.fillOutFirstSignUp(emailWithSpace, password, false);

    // Verify the confirm code header and the email
    expect(await login.isSignUpCodeHeader()).toBe(true);
    expect(await login.confirmEmail()).toMatch(emailWithoutSpace);
    await login.clearCache();
    await page.goto(target.contentServerUrl);
    await login.fillOutEmailFirstSignIn(emailWithoutSpace, password);

    // Verify the confirm code header
    expect(await login.isSignUpCodeHeader()).toBe(true);
  });

  test('signup with email with trailing whitespace on the email', async ({
    target,
    page,
    pages: { login },
  }) => {
    const email = login.createEmail();
    const emailWithoutSpace = email;
    const emailWithSpace = email + ' ';
    await page.goto(target.contentServerUrl);
    await login.fillOutFirstSignUp(emailWithSpace, password, false);

    // Verify the confirm code header and the email
    expect(await login.isSignUpCodeHeader()).toBe(true);
    expect(await login.confirmEmail()).toMatch(emailWithoutSpace);
    await login.clearCache();
    await page.goto(target.contentServerUrl);
    await login.fillOutEmailFirstSignIn(emailWithoutSpace, password);

    // Verify the confirm code header
    expect(await login.isSignUpCodeHeader()).toBe(true);
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
    expect(await login.getTooltipError()).toMatch('Valid email required');
  });

  test('coppa is empty', async ({ target, page, pages: { login } }) => {
    const email = login.createEmail();
    await page.goto(target.contentServerUrl);
    await login.setEmail(email);
    await login.clickSubmit();
    await login.setPassword(password);
    await login.confirmPassword(password);
    await login.clickSubmit();

    // Verify the error
    expect(await login.getTooltipError()).toMatch(
      'You must enter your age to sign up'
    );
  });

  test('coppa too young', async ({ target, page, pages: { login } }) => {
    const email = login.createEmail();
    await page.goto(target.contentServerUrl);
    await login.setEmail(email);
    await login.clickSubmit();
    await login.setPassword(password);
    await login.confirmPassword(password);
    await login.setAge('12');
    await login.clickSubmit();

    // Verify the error
    expect(await login.cannotCreateAccountHeader()).toBe(true);
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
    expect(await login.getTooltipError()).toMatch('Passwords do not match');
  });

  test('form prefill information is cleared after signup->sign out', async ({
    target,
    page,
    pages: { login, settings },
  }) => {
    const email = login.createEmail();
    await page.goto(target.contentServerUrl);
    await login.fillOutFirstSignUp(email, password, true);

    // The original tab should transition to the settings page w/ success
    // message.
    expect(await login.loginHeader()).toBe(true);
    await settings.signOut();

    // check the email address was cleared
    expect(await login.isEmailHeader()).toBe(true);
    expect(await login.getEmailInput()).toMatch('');

    await login.setEmail(login.createEmail());
    await login.clickSubmit();

    // check the password was cleared
    expect(await login.getPasswordInput()).toMatch('');
  });

  test('signup via product page and redirect after confirm', async ({
    pages: { login, relier },
  }) => {
    const email = login.createEmail();
    await relier.goto();
    await relier.clickEmailFirst();
    await login.fillOutFirstSignUp(email, password, true);
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
    await login.fillOutFirstSignUp(email, password, true);

    // The original tab should transition to the settings page w/ success
    // message.
    expect(await login.loginHeader()).toBe(true);
    await settings.signOut();

    await login.fillOutFirstSignUp(secondEmail, password, true);

    // The original tab should transition to the settings page w/ success
    // message.
    expect(await login.loginHeader()).toBe(true);
    await settings.signOut();

    await login.setEmail(email);
    await login.clickSubmit();
    await login.setPassword(password);
    await login.submit();
    expect(await login.loginHeader()).toBe(true);
  });
});
