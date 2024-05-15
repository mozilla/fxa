/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

test.describe('severity-2 #smoke', () => {
  test.describe('post verify - force password change', () => {
    test.beforeEach(async () => {
      test.slow();
    });

    test('navigate to page directly and can change password', async ({
      target,
      pages: { page, signinReact, postVerify, signinTokenCode, settings },
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'FXA-9519 steps complete in debug mode but fails on cleanup steps?'
      );
      const credentials = await testAccountTracker.signUpForced();
      const newPassword = testAccountTracker.generatePassword();

      await page.goto(target.contentServerUrl);
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      await expect(signinTokenCode.heading).toBeVisible();
      const code = await target.emailClient.getSigninTokenCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      //Verify force password change header
      await expect(postVerify.forcePasswordChangeHeading).toBeVisible();

      //Fill out change password
      await postVerify.fillOutChangePassword(credentials.password, newPassword);
      await postVerify.submit();
      credentials.password = newPassword;

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('force change password on login - oauth', async ({
      pages: { page, signinReact, postVerify, relier, signinTokenCode },
      target,
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'FXA-9519 seems to pass on debug, otherwise fails with inconsistent error inclusing invalid authentication code'
      );
      const credentials = await testAccountTracker.signUpForced();
      const newPassword = testAccountTracker.generatePassword();

      await relier.goto();
      await relier.clickEmailFirst();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(signinTokenCode.heading).toBeVisible();
      const code = await target.emailClient.getSigninTokenCode(
        credentials.email
      );
      await signinTokenCode.fillOutCodeForm(code);

      await expect(postVerify.forcePasswordChangeHeading).toBeVisible();

      //Fill out change password
      await postVerify.fillOutChangePassword(credentials.password, newPassword);
      await postVerify.submit();
      credentials.password = newPassword;

      //Verify logged in on relier page
      expect(await relier.isLoggedIn()).toBe(true);
    });
  });
});
