/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { EmailHeader, EmailType } from '../../lib/email';
import { test } from '../../lib/fixtures/standard';
import { getReactFeatureFlagUrl } from '../../lib/react-flag';

test.describe('severity-1 #smoke', () => {
  test.describe('Firefox Desktop Sync v3 reset password react', () => {
    test.beforeEach(async ({ target, pages: { configPage } }) => {
      test.slow();
      // Ensure that the feature flag is enabled
      const config = await configPage.getConfig();
      test.skip(config.showReactApp.resetPasswordRoutes !== true);
    });

    test('reset pw for sync user', async ({
      credentials,
      target,
      syncBrowserPages: { page, resetPasswordReact },
    }) => {
      await page.goto(
        getReactFeatureFlagUrl(
          target,
          '/reset_password',
          'context=fx_desktop_v3&service=sync'
        )
      );

      // Check that the sync relier is in the heading
      await expect(resetPasswordReact.resetPasswordHeading).toHaveText(
        /Firefox Sync/
      );

      await resetPasswordReact.fillOutEmailForm(credentials.email);

      const link = await target.email.waitForEmail(
        credentials.email,
        EmailType.recovery,
        EmailHeader.link
      );
      await page.goto(link);

      await resetPasswordReact.fillOutNewPasswordForm('Newpassword@');

      await expect(page).toHaveURL(/reset_password_verified/);
      await expect(
        resetPasswordReact.passwordResetConfirmationHeading
      ).toBeVisible();

      // Update credentials file so that account can be deleted as part of test cleanup
      credentials.password = 'Newpassword@';
    });
  });
});
