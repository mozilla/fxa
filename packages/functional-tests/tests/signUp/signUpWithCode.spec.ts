/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('Sign up with code', () => {
    test.beforeEach(async ({ pages: { configPage, login } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes === true,
        'these tests are specific to backbone, skip if serving React version'
      );
    });

    test('bounced email', async ({
      target,
      page,
      pages: { login },
      testAccountTracker,
    }) => {
      //const credentials = await testAccountTracker.signUp();

      //await page.goto(target.contentServerUrl);
      //await login.fillOutFirstSignUp(credentials.email, credentials.password);

      //await target.authClient.accountDestroy(
      //credentials.email,
      //credentials.password,
      //{},
      //credentials.sessionToken
      //);
      await expect(await login.waitForPasswordHeader()).toBeVisible();
    });

    test('valid code then click back', async ({
      target,
      page,
      pages: { login, settings },
      testAccountTracker,
    }) => {
      const { email, password } = testAccountTracker.generateAccountDetails();

      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutFirstSignUp(email, password, {
        waitForNavOnSubmit: false,
      });
      await page.goBack({ waitUntil: 'load' });
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('invalid code', async ({
      target,
      page,
      pages: { confirmSignupCode, login },
      testAccountTracker,
    }) => {
      const { email, password } = testAccountTracker.generateAccountDetails();
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutFirstSignUp(email, password, { verify: false });
      await expect(page).toHaveURL(/confirm_signup_code/);
      await confirmSignupCode.fillOutCodeForm('1234');
      await expect(login.getTooltipError()).toContainText(
        'Invalid or expired confirmation code'
      );
    });
  });
});
