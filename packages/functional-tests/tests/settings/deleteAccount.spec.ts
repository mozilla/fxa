/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test('cancel delete account step 1', async ({
    target,
    pages: { page, signin, settings, deleteAccount },
    testAccountTracker,
  }) => {
    await signInAccount(target, page, settings, signin, testAccountTracker);

    await settings.goto();

    await settings.deleteAccountButton.click();

    await expect(deleteAccount.deleteAccountHeading).toBeVisible();
    await expect(deleteAccount.step1Heading).toBeVisible();

    await deleteAccount.cancelButton.click();

    await expect(settings.settingsHeading).toBeVisible();
  });

  test('cancel delete account step 2', async ({
    target,
    pages: { page, deleteAccount, settings, signin },
    testAccountTracker,
  }) => {
    await signInAccount(target, page, settings, signin, testAccountTracker);

    await settings.goto();

    await settings.deleteAccountButton.click();

    await expect(deleteAccount.deleteAccountHeading).toBeVisible();
    await expect(deleteAccount.step1Heading).toBeVisible();

    await deleteAccount.checkAllBoxes();
    await deleteAccount.continueButton.click();

    await expect(deleteAccount.step2Heading).toBeVisible();

    await deleteAccount.cancelButton.click();

    await expect(settings.settingsHeading).toBeVisible();
  });

  test('delete account', async ({
    target,
    pages: { page, deleteAccount, settings, signin },
    testAccountTracker,
  }) => {
    const { password } = await signInAccount(
      target,
      page,
      settings,
      signin,
      testAccountTracker
    );

    await settings.goto();

    await settings.deleteAccountButton.click();
    await deleteAccount.deleteAccount(password);

    await expect(page.getByText('Account deleted successfully')).toBeVisible();
  });

  test('delete account incorrect password', async ({
    target,
    pages: { page, deleteAccount, settings, signin },
    testAccountTracker,
  }) => {
    await signInAccount(target, page, settings, signin, testAccountTracker);

    await settings.goto();

    await settings.deleteAccountButton.click();

    await expect(deleteAccount.deleteAccountHeading).toBeVisible();
    await expect(deleteAccount.step1Heading).toBeVisible();

    await deleteAccount.checkAllBoxes();
    await deleteAccount.continueButton.click();

    await expect(deleteAccount.step2Heading).toBeVisible();

    await deleteAccount.passwordTextbox.fill('incorrect password');
    await deleteAccount.deleteButton.click();

    await expect(deleteAccount.tooltip).toHaveText('Incorrect password');
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await page.waitForURL(/settings/);
  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}
