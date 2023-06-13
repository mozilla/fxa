/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

test.describe('oauth reset password', () => {
  test.beforeEach(async ({ target, pages: { login } }) => {
    test.slow();
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
    expect(await resetPassword.resetPasswordHeader()).toBe(true);

    await resetPassword.fillOutResetPassword(credentials.email);

    const link = await target.email.waitForEmail(
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
