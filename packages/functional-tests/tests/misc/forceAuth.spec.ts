/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('severity-1 #smoke', () => {
  test.describe('force auth', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      // TODO: Remove forceAuth tests. React pages don't have this flow.
      test.skip(config.showReactApp.resetPasswordRoutes === true);
    });
    test('with a registered email, registered uid', async ({
      credentials,
      pages: { login, forceAuth },
    }) => {
      await forceAuth.open(credentials);
      await login.setPassword(credentials.password);
      await login.submit();
      expect(await login.isUserLoggedIn()).toBe(true);
    });

    test('forgot password flow via force_auth', async ({
      credentials,
      pages: { login, resetPassword, forceAuth },
    }) => {
      await forceAuth.open(credentials);
      await login.clickForgotPassword();

      // Verify reset password header
      await resetPassword.resetPasswordHeader();

      //Verify email is prefilled
      expect(await login.getPrefilledEmail()).toContain(credentials.email);

      //Click 'Remember password? Sign in', redirected to force auth page
      await resetPassword.clickRememberPassword();
      expect(await login.getPrefilledEmail()).toContain(credentials.email);

      //Click forgot password again
      await login.clickForgotPassword();
      await resetPassword.clickBeginReset();

      //Verify confirm reset password header
      await resetPassword.confirmResetPasswordHeader();

      //Click 'Remember password? Sign in', redirected to force auth page
      await resetPassword.clickRememberPassword();
      expect(await login.getPrefilledEmail()).toContain(credentials.email);
    });

    test('form prefill information is cleared after sign in->sign out', async ({
      credentials,
      pages: { login, forceAuth, settings },
    }) => {
      await forceAuth.open(credentials);
      await login.setPassword(credentials.password);
      await login.submit();
      expect(await login.isUserLoggedIn()).toBe(true);

      //Sign out
      await settings.signOut();

      //Verify user need to enter email
      await login.waitForEmailHeader();
      await login.setEmail(credentials.email);
      await login.submit();

      //Verify password is empty and user need to enter password
      await login.waitForPasswordHeader();
      expect(await login.getPasswordInput()).toContain('');
      await login.setPassword(credentials.password);
      await login.submit();
      expect(await login.isUserLoggedIn()).toBe(true);
    });
  });
});
