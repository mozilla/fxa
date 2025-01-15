/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('recovery key promo', () => {
  test.describe('settings banner', () => {
    test('can setup recovery key from settings promo banner', async ({
      target,
      syncBrowserPages: {
        page,
        inlineRecoveryKey,
        signin,
        settings,
        recoveryKey,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      await inlineRecoveryKey.getBannerCreateLink().click();

      await recoveryKey.acknowledgeInfoForm();
      await recoveryKey.fillOutConfirmPasswordForm(credentials.password);

      await expect(recoveryKey.recoveryKeyCreatedHeading).toBeVisible();

      // Notification banner is no longer visible
      await expect(inlineRecoveryKey.getBannerCreateLink()).not.toBeVisible();
    });

    test('can dismiss', async ({
      target,
      syncBrowserPages: {
        page,
        inlineRecoveryKey,
        signin,
        settings,
        recoveryKey,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();
      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.recoveryKey.status).toHaveText('Not Set');

      await inlineRecoveryKey.getBannerCreateLink().click();

      await recoveryKey.acknowledgeInfoForm();
      await recoveryKey.fillOutConfirmPasswordForm(credentials.password);

      await expect(recoveryKey.recoveryKeyCreatedHeading).toBeVisible();

      // Notification banner is no longer visible
      await expect(inlineRecoveryKey.getBannerCreateLink()).not.toBeVisible();
    });
  });
});
