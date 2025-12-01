/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test('cancel delete account step 1', async ({
    target,
    pages: { page, signin, settings, deleteAccount },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await signInAccount(target, page, settings, signin, credentials);

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
    const credentials = await testAccountTracker.signUp();
    await signInAccount(target, page, settings, signin, credentials);

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
    const credentials = await testAccountTracker.signUp();
    await signInAccount(target, page, settings, signin, credentials);

    await settings.goto();

    await settings.deleteAccountButton.click();
    await deleteAccount.deleteAccount(credentials.password);

    await expect(page.getByText('Account deleted successfully')).toBeVisible();
  });

  test('delete account incorrect password', async ({
    target,
    pages: { page, deleteAccount, settings, signin },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();
    await signInAccount(target, page, settings, signin, credentials);

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

  test('delete account A then sign in with account B, no apollo cache pollution', async ({
    target,
    pages: { page, deleteAccount, settings, signin },
    testAccountTracker,
  }) => {
    const credentialsA = await testAccountTracker.signUp();
    const credentialsB = await testAccountTracker.signUp();

    await signInAccount(target, page, settings, signin, credentialsA);
    await settings.deleteAccountButton.click();
    await deleteAccount.deleteAccount(credentialsA.password);

    await expect(page.getByText('Account deleted successfully')).toBeVisible();
    await signin.fillOutEmailFirstForm(credentialsB.email);
    await signin.fillOutPasswordForm(credentialsB.password);
    await expect(settings.settingsHeading).toBeVisible();
    await expect(settings.primaryEmail.status).toHaveText(credentialsB.email);
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signin: SigninPage,
  credentials: Credentials
): Promise<void> {
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);
  await page.waitForURL(/settings/);
  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();
}
