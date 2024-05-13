/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

const AGE_21 = '21';

test.describe('severity-1 #smoke', () => {
  test.describe('Firefox Desktop Sync v3 sign up', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes === true,
        'these tests are specific to backbone, skip if seeing React version'
      );
      test.slow();
    });

    test('sync sign up', async ({
      target,
      syncBrowserPages: { page, login, connectAnotherDevice },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();
      const incorrectPassword = testAccountTracker.generatePassword();

      await page.goto(
        `${target.contentServerUrl}?context=fx_desktop_v3&service=sync&action=email`,
        { waitUntil: 'load' }
      );
      await login.setEmail(credentials.email);
      await login.clickSubmit();

      // Verify the email is correct
      expect(await login.getPrefilledEmail()).toMatch(credentials.email);

      // Passwords do not match should cause an error
      await login.setPassword(credentials.password);
      await login.confirmPassword(incorrectPassword);
      await login.setAge(AGE_21);
      await login.clickSubmit();

      // Verify the error message
      expect(await login.getTooltipError()).toContain('Passwords do not match');

      // Fix the error
      await login.confirmPassword(credentials.password);
      await login.submit();
      await login.fillOutSignUpCode(credentials.email);
      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();
    });

    test('coppa disabled', async ({
      target,
      syncBrowserPages: { page, login, connectAnotherDevice },
      testAccountTracker,
    }) => {
      const { email, password } =
        testAccountTracker.generateSyncAccountDetails();
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
      await expect(connectAnotherDevice.fxaConnectedHeading).toBeVisible();
    });

    test('email specified by relier, invalid', async ({
      target,
      syncBrowserPages: { page, login },
    }) => {
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

    test('email specified by relier, empty string', async ({
      target,
      syncBrowserPages: { page, login },
    }) => {
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

    test('email specified by relier, not registered', async ({
      target,
      syncBrowserPages: { page, login },
      testAccountTracker,
    }) => {
      const { email } = testAccountTracker.generateSyncAccountDetails();
      const query = { email };
      const queryParam = new URLSearchParams(query);
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`
      );

      // Verify user lands on the sign up password page
      await expect(login.signUpPasswordHeader).toBeVisible();

      // Verify the correct email is displayed
      expect(await login.getPrefilledEmail()).toMatch(email);
    });

    test('email specified by relier, registered', async ({
      target,
      syncBrowserPages: { page, login },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpSync();
      const query = { email: credentials.email };
      const queryParam = new URLSearchParams(query);
      await page.goto(
        `${
          target.contentServerUrl
        }?context=fx_desktop_v3&service=sync&action=email&${queryParam.toString()}`
      );

      // Verify user lands on the sign in password page
      await expect(await login.waitForPasswordHeader()).toBeVisible();

      // Verify the correct email is displayed
      expect(await login.getPrefilledEmail()).toContain(credentials.email);
    });
  });
});
