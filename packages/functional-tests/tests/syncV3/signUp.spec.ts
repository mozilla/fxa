/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';

const password = 'passwordzxcv';
const incorrectPassword = 'password123';
let email, syncBrowserPages;

test.describe.configure({ mode: 'parallel' });

test.describe('severity-1 #smoke', () => {
  test.beforeEach(async ({ pages: { configPage } }) => {
    const config = await configPage.getConfig();
    test.skip(
      config.showReactApp.signUpRoutes === true,
      'these tests are specific to backbone, skip if seeing React version'
    );
  });

  test.describe('Firefox Desktop Sync v3 sign up', () => {
    test.beforeEach(async ({ target, pages: { login } }) => {
      test.slow();
      email = login.createEmail('sync{id}');
      syncBrowserPages = await newPagesForSync(target);
    });

    test.afterEach(async () => {
      await syncBrowserPages.browser?.close();
    });

    test('sync sign up', async ({ target }) => {
      const { page, login, connectAnotherDevice, signinTokenCode } =
        syncBrowserPages;

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`,
        { waitUntil: 'load' }
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
      expect(await login.getTooltipError()).toContain('Passwords do not match');

      // Fix the error
      await login.confirmPassword(password);
      await login.submit();
      await login.fillOutSignUpCode(email);
      expect(await connectAnotherDevice.fxaConnected.isVisible()).toBeTruthy();
    });

    test('coppa disabled', async ({ target }) => {
      const { page, login, connectAnotherDevice } = syncBrowserPages;
      const query = { coppa: 'false' };
      const queryParam = new URLSearchParams(query);
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`,
        { waitUntil: 'load' }
      );
      await login.setEmail(email);
      await login.submit();
      await login.setPassword(password);
      await login.confirmPassword(password);

      // Age textbox is not on the page and click submit
      await login.submit();
      await login.fillOutSignUpCode(email);
      expect(await connectAnotherDevice.fxaConnected.isEnabled()).toBeTruthy();
    });

    test('email specified by relier, invalid', async ({ target }) => {
      const { page, login } = syncBrowserPages;
      const invalidEmail = 'invalid@@';
      const query = { email: invalidEmail };
      const queryParam = new URLSearchParams(query);
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`
      );
      expect(await login.getTooltipError()).toContain('Valid email required');
    });

    test('email specified by relier, empty string', async ({ target }) => {
      const { page, login } = syncBrowserPages;
      const emptyEmail = '';
      const query = { email: emptyEmail };
      const queryParam = new URLSearchParams(query);
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`
      );
      expect(await login.getTooltipError()).toContain('Valid email required');
    });

    test('email specified by relier, not registered', async ({ target }) => {
      const { page, login } = syncBrowserPages;
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
      credentials,
      target,
    }) => {
      const { page, login } = syncBrowserPages;
      const query = { email: credentials.email };
      const queryParam = new URLSearchParams(query);
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`
      );

      // Verify user lands on the sign in password page
      await login.waitForPasswordHeader();

      // Verify the correct email is displayed
      expect(await login.getPrefilledEmail()).toContain(credentials.email);
    });
  });
});
