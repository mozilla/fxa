/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

const PASSWORD = 'passwordzxcv';
let email;

test.describe('severity-1 #smoke', () => {
  test.describe('Sign up with code', () => {
    test.beforeEach(async ({ pages: { login } }) => {
      test.slow();
      email = login.createEmail();
      await login.clearCache();
    });

    test('bounced email', async ({
      target,
      page,
      pages: { configPage, login },
    }) => {
      const config = await configPage.getConfig();
      test.fixme(
        config.showReactApp.signUpRoutes === true,
        'bounced email functionality does not currently work on react signup'
      );
      const client = await login.getFxaClient(target);
      await page.goto(target.contentServerUrl);
      await login.fillOutFirstSignUp(email, PASSWORD);

      await client.accountDestroy(email, PASSWORD);
      await login.waitForPasswordHeader();
    });

    test('valid code then click back', async ({
      target,
      page,
      pages: { login },
    }) => {
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutFirstSignUp(email, PASSWORD);
      await page.goBack();
      await page.waitForURL(target.contentServerUrl);
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('invalid code', async ({
      target,
      page,
      pages: { login, signinTokenCode },
    }) => {
      await page.goto(target.contentServerUrl, {
        waitUntil: 'load',
      });
      await login.fillOutFirstSignUp(email, PASSWORD, { verify: false });
      await login.setCode('1234');
      await signinTokenCode.clickSubmitButton();
      expect(await login.getTooltipError()).toContain(
        'Invalid or expired confirmation code'
      );
    });
  });
});
