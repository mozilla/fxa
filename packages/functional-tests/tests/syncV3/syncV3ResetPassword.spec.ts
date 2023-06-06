/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';

test.describe.configure({ mode: 'parallel' });

test.describe('Firefox Desktop Sync v3 reset password', () => {
  test.beforeEach(() => {
    test.slow();
  });

  test('reset pw, test pw validation, verify same browser', async ({
    credentials,
    target,
  }) => {
    const { browser, page, login, resetPassword } = await newPagesForSync(
      target
    );
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
    expect(await resetPassword.hasCompleteResetPasswordHeading()).toBe(true);

    // Update credentials file so that account can be deleted as part of test cleanup
    credentials.password = 'Newpassword@';

    await browser?.close();
  });
});
