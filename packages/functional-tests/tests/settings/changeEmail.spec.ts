/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { ChangePasswordPage } from '../../pages/settings/changePassword';
import { SecondaryEmailPage } from '../../pages/settings/secondaryEmail';
import { SigninPage } from '../../pages/signin';

test.describe('severity-1 #smoke', () => {
  test.describe('change primary email tests', () => {
    test('change primary email and login', async ({
      target,
      pages: { page, secondaryEmail, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );
      const initialEmail = credentials.email;
      const newEmail = testAccountTracker.generateEmail();

      await settings.goto();

      await changePrimaryEmail(target, settings, secondaryEmail, newEmail);

      await settings.signOut();

      // Sign in with old primary email fails
      await signin.fillOutEmailFirstForm(initialEmail);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(
        page.getByText('Primary account email required for sign-in')
      ).toBeVisible();

      // Success signing in with New email
      await signin.useDifferentAccountLink.click();
      await signin.fillOutEmailFirstForm(newEmail);
      await signin.fillOutPasswordForm(credentials.password);

      await expect(settings.primaryEmail.status).toHaveText(newEmail);

      // Update which email to use for account cleanup
      credentials.email = newEmail;
    });

    test('change primary email, password and login', async ({
      target,
      pages: { page, changePassword, secondaryEmail, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );
      const initialPassword = credentials.password;
      const newEmail = testAccountTracker.generateEmail();
      const newPassword = testAccountTracker.generatePassword();

      await settings.goto();

      await changePrimaryEmail(target, settings, secondaryEmail, newEmail);

      await setNewPassword(
        settings,
        changePassword,
        initialPassword,
        newPassword
      );

      await settings.signOut();

      // Sign in with old password
      await expect(signin.emailFirstHeading).toBeVisible();
      await signin.fillOutEmailFirstForm(newEmail);
      await signin.fillOutPasswordForm(initialPassword);

      await expect(page.getByText('Incorrect password')).toBeVisible();

      // Sign in with new password
      await signin.fillOutPasswordForm(newPassword);

      await expect(settings.primaryEmail.status).toHaveText(newEmail);

      // Update credentials to use for account cleanup
      credentials.email = newEmail;
      credentials.password = newPassword;
    });

    test('change primary email, change password, login, change email and login', async ({
      target,
      pages: { page, changePassword, secondaryEmail, settings, signin },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );
      const initialEmail = credentials.email;
      const initialPassword = credentials.password;
      const secondEmail = testAccountTracker.generateEmail();
      const newPassword = testAccountTracker.generatePassword();

      await settings.goto();

      await changePrimaryEmail(target, settings, secondaryEmail, secondEmail);

      await setNewPassword(
        settings,
        changePassword,
        initialPassword,
        newPassword
      );

      await settings.signOut();

      // Sign in with new password
      await signin.fillOutEmailFirstForm(secondEmail);
      await signin.fillOutPasswordForm(newPassword);

      // Change back the primary email again
      await settings.secondaryEmail.makePrimaryButton.click();
      await settings.signOut();

      // Login with primary email and new password
      await signin.fillOutEmailFirstForm(initialEmail);
      await signin.fillOutPasswordForm(newPassword);

      await expect(settings.settingsHeading).toBeVisible();

      // Update which password to use the account cleanup
      credentials.password = newPassword;
    });

    test('can change primary email, delete account', async ({
      target,
      pages: {
        page,
        confirmSignupCode,
        deleteAccount,
        secondaryEmail,
        settings,
        signin,
        signup,
      },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signin,
        testAccountTracker
      );
      const newEmail = testAccountTracker.generateEmail();
      const newPassword = testAccountTracker.generatePassword();

      await settings.goto();

      await changePrimaryEmail(target, settings, secondaryEmail, newEmail);
      await expect(settings.primaryEmail.status).toHaveText(newEmail);

      // Click delete account
      await settings.deleteAccountButton.click();
      await deleteAccount.deleteAccount(credentials.password);

      // Try creating a new account with the same secondary email as previous account and new password
      await signup.fillOutEmailForm(newEmail);
      await signup.fillOutSignupForm(newPassword, '21');
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyShortCode(newEmail);
      await confirmSignupCode.fillOutCodeForm(code);

      await expect(settings.alertBar).toHaveText(
        'Account confirmed successfully'
      );
      await expect(settings.primaryEmail.status).toHaveText(newEmail);

      // Update credentials to use for account cleanup
      credentials.email = newEmail;
      credentials.password = newPassword;
    });

    test('removing secondary emails', async ({
      target,
      pages: { page, secondaryEmail, settings, signin },
      testAccountTracker,
    }) => {
      await signInAccount(target, page, settings, signin, testAccountTracker);
      const newEmail = testAccountTracker.generateEmail();

      await settings.goto();
      await settings.secondaryEmail.addButton.click();
      await secondaryEmail.fillOutEmail(newEmail);
      const code: string = await target.emailClient.getVerifySecondaryCode(
        newEmail
      );
      await secondaryEmail.fillOutVerificationCode(code);

      await expect(settings.alertBar).toHaveText(/successfully added/);

      await settings.alertBarDismissButton.click();
      await settings.secondaryEmail.deleteButton.click();

      await expect(settings.alertBar).toHaveText(/successfully deleted/);

      await settings.secondaryEmail.addButton.click();
      await secondaryEmail.emailTextbox.fill(newEmail);
      await secondaryEmail.submit();

      // skip verification
      await settings.goto();

      await expect(settings.secondaryEmail.unverifiedText).toHaveText(
        'unconfirmed'
      );

      await settings.secondaryEmail.deleteButton.click();

      await expect(settings.alertBar).toHaveText(/successfully deleted/);
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

async function setNewPassword(
  settings: SettingsPage,
  changePassword: ChangePasswordPage,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  await settings.password.changeButton.click();
  await changePassword.fillOutChangePassword(oldPassword, newPassword);

  await expect(settings.settingsHeading).toBeVisible();
  await expect(settings.alertBar).toHaveText('Password updated');
}
