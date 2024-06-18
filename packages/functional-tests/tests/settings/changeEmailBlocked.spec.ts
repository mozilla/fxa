/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { SecondaryEmailPage } from '../../pages/settings/secondaryEmail';
import { SigninPage } from '../../pages/signin';
import { SigninUnblockPage } from '../../pages/signinUnblock';

test.describe('severity-1 #smoke', () => {
  test.describe('change primary - unblock', () => {
    test('change primary email, get blocked with invalid password, redirect enter password page', async ({
      target,
      pages: { page, secondaryEmail, settings, signin, signinUnblock },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );
      const blockedEmail = testAccountTracker.generateBlockedEmail();
      const invalidPassword = testAccountTracker.generatePassword();

      await settings.goto();
      await changePrimaryEmail(target, settings, secondaryEmail, blockedEmail);
      await settings.signOut();
      await signin.fillOutEmailFirstForm(blockedEmail);
      await signin.fillOutPasswordForm(invalidPassword);

      // Fill out unblock
      await expect(page).toHaveURL(/signin_unblock/);
      await unblockAccount(blockedEmail, target, signinUnblock);

      // Verify the incorrect password error
      await expect(page.getByText('Incorrect password')).toBeVisible();

      await signin.fillOutPasswordForm(credentials.password);
      await unblockAccount(blockedEmail, target, signinUnblock);
      await expect(settings.settingsHeading).toBeVisible();
      // reset primary email to non-blocked email for account cleanup
      await settings.secondaryEmail.makePrimaryButton.click();
      await expect(settings.alertBar).toHaveText(
        new RegExp(`${credentials.email}.*is now your primary email`)
      );
    });

    test('can change primary email, get blocked with valid password, redirect settings page', async ({
      target,
      pages: { page, secondaryEmail, settings, signin, signinUnblock },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );
      const blockedEmail = testAccountTracker.generateBlockedEmail();

      await settings.goto();
      await changePrimaryEmail(target, settings, secondaryEmail, blockedEmail);
      await settings.signOut();

      await signin.fillOutEmailFirstForm(blockedEmail);
      await signin.fillOutPasswordForm(credentials.password);
      // Fill out unblock
      await expect(page).toHaveURL(/signin_unblock/);
      await unblockAccount(blockedEmail, target, signinUnblock);

      // Verify settings url redirected
      await expect(settings.settingsHeading).toBeVisible();

      // reset primary email to non-blocked email for account cleanup
      await settings.secondaryEmail.makePrimaryButton.click();
      await expect(settings.alertBar).toHaveText(
        new RegExp(`${credentials.email}.*is now your primary email`)
      );
    });
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

  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

  return credentials;
}

async function changePrimaryEmail(
  target: BaseTarget,
  settings: SettingsPage,
  secondaryEmail: SecondaryEmailPage,
  email: string
): Promise<void> {
  await settings.secondaryEmail.addButton.click();
  await secondaryEmail.fillOutEmail(email);
  const code: string = await target.emailClient.getVerifySecondaryCode(email);
  await secondaryEmail.fillOutVerificationCode(code);
  await settings.secondaryEmail.makePrimaryButton.click();

  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.alertBar).toHaveText(
    new RegExp(`${email}.*is now your primary email`)
  );
}

async function unblockAccount(
  blockedEmail: string,
  target: BaseTarget,
  signinUnblock: SigninUnblockPage
) {
  const code = await target.emailClient.getUnblockCode(blockedEmail);
  await signinUnblock.fillOutCodeForm(code);
}
