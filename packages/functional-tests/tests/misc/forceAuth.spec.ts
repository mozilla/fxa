/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';

test.describe('force auth', () => {
  test('with a registered email, registered uid', async ({
    credentials,
    pages: { login, forceAuth },
  }) => {
    await forceAuth.open(credentials);
    await login.setPassword(credentials.password);
    await login.submit();
    expect(await login.loginHeader()).toBe(true);
  });

  test('forgot password flow via force_auth', async ({
    credentials,
    pages: { login, resetPassword, forceAuth },
  }) => {
    await forceAuth.open(credentials);
    await login.clickForgotPassword();

    // Verify reset password header
    expect(await resetPassword.resetPasswordHeader()).toBe(true);

    //Verify email is prefilled
    expect(await login.getPrefilledEmail()).toContain(credentials.email);

    //Click 'Remember password? Sign in', redirected to force auth page
    await resetPassword.clickRememberPassword();
    expect(await login.getPrefilledEmail()).toContain(credentials.email);

    //Click forgot password again
    await login.clickForgotPassword();
    await resetPassword.clickBeginReset();

    //Verify confirm reset password header
    expect(await resetPassword.confirmResetPasswordHeader()).toBe(true);

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
    expect(await login.loginHeader()).toBe(true);

    //Sign out
    await settings.signOut();

    //Verify user need to enter email
    expect(await login.isEmailHeader()).toBe(true);
    await login.setEmail(credentials.email);
    await login.submit();

    //Verify password is empty and user need to enter password
    expect(await login.isPasswordHeader()).toBe(true);
    expect(await login.getPasswordInput()).toContain('');
    await login.setPassword(credentials.password);
    await login.submit();
    expect(await login.loginHeader()).toBe(true);
  });
});
