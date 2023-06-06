/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, newPagesForSync } from '../../lib/fixtures/standard';
import { EmailHeader, EmailType } from '../../lib/email';
import { getReactFeatureFlagUrl } from '../../lib/react-flag';

test.describe.configure({ mode: 'parallel' });

test.describe('Firefox Desktop Sync v3 reset password react', () => {
  test.beforeEach(async ({ pages: { login } }) => {
    test.slow();
    // Ensure that the feature flag is enabled
    const config = await login.getConfig();
    test.skip(config.showReactApp.resetPasswordRoutes !== true);
  });

  test('reset pw for sync user', async ({ credentials, target }) => {
    const { browser, page, resetPassword } = await newPagesForSync(target);
    await page.goto(
      getReactFeatureFlagUrl(
        target,
        '/reset_password',
        'context=fx_desktop_v3&service=sync'
      )
    );

    // Verify react page has been loaded
    await page.waitForSelector('#root');

    // Check that the sync relier is in the heading
    expect(await page.getByRole('heading')).toHaveText(
      'Reset password to continue to Firefox Sync'
    );

    await resetPassword.fillOutResetPassword(credentials.email);

    // We need to append `&showReactApp=true` to reset link in order to enroll in reset password experiment
    let link = await target.email.waitForEmail(
      credentials.email,
      EmailType.recovery,
      EmailHeader.link
    );
    link = `${link}&showReactApp=true`;

    await page.goto(link);

    const waitForNavigation = page.waitForURL(
      `${target.contentServerUrl}/reset_password_verified`,
      {
        waitUntil: 'networkidle',
      }
    );
    await resetPassword.submitNewPasswordReact('Newpassword@');
    await waitForNavigation;

    expect(await resetPassword.resetPasswordConfirmedReact()).toBe(true);

    // Update credentials file so that account can be deleted as part of test cleanup
    credentials.password = 'Newpassword@';

    await browser?.close();
  });
});
