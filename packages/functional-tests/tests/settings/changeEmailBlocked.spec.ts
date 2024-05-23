/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { LoginPage } from '../../pages/login';
import { SettingsPage } from '../../pages/settings';
import { DeleteAccountPage } from '../../pages/settings/deleteAccount';
import { SecondaryEmailPage } from '../../pages/settings/secondaryEmail';

test.describe('severity-1 #smoke', () => {
  test.describe('change primary - unblock', () => {
    test.beforeEach(async () => {
      test.slow();
    });

    test('change primary email, get blocked with invalid password, redirect enter password page', async ({
      target,
      pages: { page, settings, login, secondaryEmail, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );
      const blockedEmail = testAccountTracker.generateBlockedEmail();
      const invalidPassword = testAccountTracker.generatePassword();

      await settings.goto();
      await changePrimaryEmail(settings, secondaryEmail, blockedEmail);
      credentials.email = blockedEmail;
      await settings.signOut();
      await login.login(credentials.email, invalidPassword);

      // Fill out unblock
      await login.unblock(credentials.email);

      // Verify the incorrect password error
      await expect(page.getByText('Incorrect password')).toBeVisible();

      // Delete blocked account, required before teardown
      await login.setPassword(credentials.password);
      await login.submit();
      await login.unblock(credentials.email);
      await settings.goto();
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('can change primary email, get blocked with valid password, redirect settings page', async ({
      target,
      pages: { page, settings, login, secondaryEmail, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        login,
        testAccountTracker
      );
      const blockedEmail = testAccountTracker.generateBlockedEmail();

      await settings.goto();
      await changePrimaryEmail(settings, secondaryEmail, blockedEmail);
      credentials.email = blockedEmail;
      await settings.signOut();

      await login.login(credentials.email, credentials.password);
      // Fill out unblock
      await login.unblock(credentials.email);

      // Verify settings url redirected
      await expect(page).toHaveURL(settings.url);

      // Delete blocked account, required before teardown
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  login: LoginPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await login.fillOutEmailFirstSignIn(credentials.email, credentials.password);

  //Verify logged in on Settings page
  expect(await login.isUserLoggedIn()).toBe(true);

  return credentials;
}

async function changePrimaryEmail(
  settings: SettingsPage,
  secondaryEmail: SecondaryEmailPage,
  email: string
): Promise<void> {
  await settings.secondaryEmail.addButton.click();
  await secondaryEmail.addSecondaryEmail(email);
  await settings.secondaryEmail.makePrimaryButton.click();

  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.alertBar).toHaveText(
    new RegExp(`${email}.*is now your primary email`)
  );
}

async function removeAccount(
  settings: SettingsPage,
  deleteAccount: DeleteAccountPage,
  page: Page,
  password: string
) {
  await settings.deleteAccountButton.click();
  await deleteAccount.deleteAccount(password);

  await expect(page.getByText('Account deleted successfully')).toBeVisible();
}
