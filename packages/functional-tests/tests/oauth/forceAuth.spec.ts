/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
const AGE_21 = '21';

test.describe('severity-1 #smoke', () => {
  test.describe('OAuth force auth', () => {
    test('with a registered email', async ({
      pages: { configPage, login, relier },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes === true,
        'Scheduled for removal as part of React conversion (see FXA-9410).'
      );
      const credentials = await testAccountTracker.signUp();
      await relier.goto(`email=${credentials.email}`);
      await relier.clickForceAuth();

      // Email is prefilled
      expect(await login.getPrefilledEmail()).toContain(credentials.email);

      await login.setPassword(credentials.password);
      await login.submit();

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('with a unregistered email', async ({
      target,
      pages: { configPage, login, relier },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes === true,
        'Scheduled for removal as part of React conversion (see FXA-9410).'
      );
      const credentials = await testAccountTracker.signUp();
      const newEmail = testAccountTracker.generateEmail();

      await relier.goto(`email=${newEmail}`);
      await relier.clickForceAuth();
      credentials.email = newEmail;

      // Signup form is shown and email is prefilled
      expect(await login.getPrefilledEmail()).toContain(newEmail);

      await login.setAge(AGE_21);
      await login.setNewPassword(credentials.password);
      const code = await target.emailClient.getVerifyShortCode(newEmail);
      await login.fillOutSignUpCode(code);

      expect(await relier.isLoggedIn()).toBe(true);
    });
  });

  test.describe('OAuth force auth', () => {
    test('with blocked email', async ({
      target,
      page,
      pages: { configPage, login, relier, settings, deleteAccount },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes === true,
        'Scheduled for removal as part of React conversion (see FXA-9410).'
      );

      const credentials = await testAccountTracker.signUp();
      const blockedEmail = testAccountTracker.generateBlockedEmail();

      await relier.goto(`email=${blockedEmail}`);
      await relier.clickForceAuth();

      expect(await login.getPrefilledEmail()).toContain(blockedEmail);

      await login.setAge(AGE_21);
      await login.setNewPassword(credentials.password);
      const shortCode = await target.emailClient.getVerifyShortCode(
        blockedEmail
      );
      await login.fillOutSignUpCode(shortCode);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
      // Attempt to log in again which will show the blocked page
      await relier.goto(`email=${blockedEmail}`);
      await relier.clickForceAuth();
      await login.setPassword(credentials.password);
      await login.submit();
      const unblockCode = await target.emailClient.getUnblockCode(blockedEmail);
      await login.unblock(unblockCode);

      expect(await relier.isLoggedIn()).toBe(true);

      //Delete blocked account, the fixture teardown doesn't work in this case
      await settings.goto();
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(credentials.password);

      await expect(
        page.getByText('Account deleted successfully')
      ).toBeVisible();
    });
  });
});
