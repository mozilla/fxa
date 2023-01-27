/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

const password = 'passwordzxcv';
const incorrectPassword = 'password123';
let email;

test.describe('Firefox Desktop Sync v3 sign up', () => {
  test.beforeEach(async ({ pages: { login } }) => {
    test.slow();
    email = login.createEmail('sync{id}');
    await login.clearCache();
  });

  test('sign up', async ({
    target,
    page,
    pages: { login, signinTokenCode, connectAnotherDevice },
  }) => {
    await page.goto(
      `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`,
      { waitUntil: 'networkidle' }
    );
    await login.setEmail(email);
    await signinTokenCode.clickSubmitButton();

    // Verify the email is correct
    expect(await login.getPrefilledEmail()).toMatch(email);

    // Passwords do not match should cause an error
    await login.setPassword(password);
    await login.confirmPassword(incorrectPassword);
    await login.setAge('21');
    await signinTokenCode.clickSubmitButton();

    // Verify the error message
    expect(await login.getTooltipError()).toMatch('Passwords do not match');

    // Fix the error
    await login.confirmPassword(password);
    await login.submit();
    await login.fillOutSignUpCode(email);
    expect(await connectAnotherDevice.fxaConnected.isVisible()).toBeTruthy();
  });

  test('coppa disabled', async ({
    target,
    page,
    pages: { login, connectAnotherDevice },
  }) => {
    const query = { coppa: 'false' };
    const queryParam = new URLSearchParams(query);
    await page.goto(
      `${
        target.contentServerUrl
      }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`,
      { waitUntil: 'networkidle' }
    );
    await login.setEmail(email);
    await login.submit();
    await login.setPassword(password);
    await login.confirmPassword(password);

    // Age textbox is not on the page and click submit
    await login.submit();
    await login.fillOutSignUpCode(email);
    expect(await connectAnotherDevice.fxaConnected.isVisible()).toBeTruthy();
  });

  test('email specified by relier, invalid', async ({
    target,
    page,
    pages: { login },
  }) => {
    const invalidEmail = 'invalid@@';
    const query = { email: invalidEmail };
    const queryParam = new URLSearchParams(query);
    await page.goto(
      `${
        target.contentServerUrl
      }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`
    );
    expect(await login.getTooltipError()).toMatch('Valid email required');
  });

  test('email specified by relier, empty string', async ({
    target,
    page,
    pages: { login },
  }) => {
    const emptyEmail = '';
    const query = { email: emptyEmail };
    const queryParam = new URLSearchParams(query);
    await page.goto(
      `${
        target.contentServerUrl
      }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`
    );
    expect(await login.getTooltipError()).toMatch('Valid email required');
  });

  test('email specified by relier, not registered', async ({
    target,
    page,
    pages: { login },
  }) => {
    const query = { email };
    const queryParam = new URLSearchParams(query);
    await page.goto(
      `${
        target.contentServerUrl
      }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`
    );

    // Verify user lands on the sign up password page
    expect(await login.signUpPasswordHeader()).toBe(true);

    // Verify the correct email is displayed
    expect(await login.getPrefilledEmail()).toMatch(email);
  });

  test('email specified by relier, registered', async ({
    target,
    page,
    pages: { login },
  }) => {
    await target.auth.signUp(email, password, {
      lang: 'en',
      preVerified: 'true',
    });
    const query = { email };
    const queryParam = new URLSearchParams(query);
    await page.goto(
      `${
        target.contentServerUrl
      }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`
    );

    // Verify user lands on the sign in password page
    expect(await login.isPasswordHeader()).toBe(true);

    // Verify the correct email is displayed
    expect(await login.getPrefilledEmail()).toMatch(email);
  });
});
