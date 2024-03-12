/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailHeader, EmailType } from '../../lib/email';
import { expect, test } from '../../lib/fixtures/standard';

test.describe.configure({ mode: 'parallel' });

test.describe('Firefox Desktop Sync v3 reset password', () => {
  test('reset pw, test pw validation, verify same browser', async ({
    pages: { configPage },
    credentials,
    target,
    syncBrowserPages: { page, login, resetPassword },
  }) => {
    const config = await configPage.getConfig();
    test.skip(
      config.showReactApp.resetPasswordRoutes === true,
      'Scheduled for removal as part of React conversion (see FXA-8267).'
    );
    test.slow();

    await page.goto(
      `${target.contentServerUrl}/reset_password?context=fx_desktop_v3&service=sync&forceExperiment=generalizedReactApp&forceExperimentGroup=control`
    );
    await resetPassword.fillOutResetPassword(credentials.email);

    const link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    await page.goto(link);

    // Enter a short password
    await resetPassword.resetNewPassword('pass');

    // Verify the error
    expect(await login.minLengthFailError()).toBe(true);
    expect(await login.notEmailUnmetError()).toBe(true);
    expect(await login.notCommonPasswordUnmetError()).toBe(true);

    // Enter a common password
    await resetPassword.resetNewPassword('password');

    // Verify the error
    expect(await login.minLengthSuccess()).toBe(true);
    expect(await login.notEmailSuccess()).toBe(true);
    expect(await login.notCommonPasswordFailError()).toBe(true);

    // Enter the email as password
    await resetPassword.resetNewPassword(credentials.email);

    // Verify the error
    expect(await login.minLengthSuccess()).toBe(true);
    expect(await login.notEmailFailError()).toBe(true);
    expect(await login.notCommonPasswordUnmetError()).toBe(true);

    await resetPassword.resetNewPassword('Newpassword@');
    await resetPassword.completeResetPasswordHeader();
  });
});
