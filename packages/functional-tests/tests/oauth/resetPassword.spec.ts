/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

test.describe('severity-1 #smoke', () => {
  test.describe('oauth reset password', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      test.slow();

      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.resetPasswordRoutes === true,
        'Scheduled for removal as part of React conversion (see FXA-8267).'
      );
      test.skip(config.showReactApp.oauthRoutes === true);
    });

    test('reset password happy path', async ({
      target,
      page,
      credentials,
      pages: { login, relier, resetPassword },
    }) => {
      await relier.goto();
      await relier.clickEmailFirst();
      await login.setEmail(credentials.email);
      await login.submit();
      await login.clickForgotPassword();

      // Verify reset password header
      await resetPassword.resetPasswordHeader();

      await resetPassword.fillOutResetPassword(credentials.email);

      const link = await target.emailClient.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );
      await page.goto(link);
      await resetPassword.resetNewPassword(credentials.password);

      // Verify logged in
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });
});
