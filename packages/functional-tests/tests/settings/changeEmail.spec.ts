/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { TestAccountTracker } from '../../lib/testAccountTracker';
import { SettingsPage } from '../../pages/settings';
import { ChangePasswordPage } from '../../pages/settings/changePassword';
import { DeleteAccountPage } from '../../pages/settings/deleteAccount';
import { SecondaryEmailPage } from '../../pages/settings/secondaryEmail';
import { SigninReactPage } from '../../pages/signinReact';

test.describe('severity-1 #smoke', () => {
  test.describe('change primary email tests', () => {
    test.beforeEach(async () => {
      test.slow();
    });

    test('change primary email and sign in', async ({
      target,
      pages: { page, signinReact, settings, secondaryEmail },
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'FXA-9519, incorrect email case error after changing primary email'
      );
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );
      const newEmail = testAccountTracker.generateEmail();

      await settings.goto();

      await changePrimaryEmail(settings, secondaryEmail, newEmail);
      const oldEmail = credentials.email;
      credentials.email = newEmail;

      await settings.signOut();

      // Sign in with old primary email fails
      await signinReact.fillOutEmailFirstForm(oldEmail);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(
        page.getByText('Primary account email required for sign-in')
      ).toBeVisible();

      // Success signing in with New email
      await signinReact.useDifferentAccountLink.click();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.primaryEmail.status).toHaveText(credentials.email);
    });

    test('change primary email, password and sign in', async ({
      target,
      pages: { page, settings, changePassword, signinReact, secondaryEmail },
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'FXA-9519, incorrect email case error after changing primary email'
      );
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );
      const newEmail = testAccountTracker.generateEmail();
      const newPassword = testAccountTracker.generatePassword();

      await settings.goto();

      await changePrimaryEmail(settings, secondaryEmail, newEmail);
      credentials.email = newEmail;

      await setNewPassword(
        settings,
        changePassword,
        credentials.password,
        newPassword
      );
      const oldPassword = credentials.password;
      credentials.password = newPassword;

      await settings.signOut();

      // Sign in with old password
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(oldPassword);

      await expect(page.getByText('Incorrect password')).toBeVisible();

      // Sign in with new password
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(settings.primaryEmail.status).toHaveText(credentials.email);
    });

    test('change primary email, change password, sign in, change email and sign in', async ({
      target,
      pages: { page, settings, changePassword, signinReact, secondaryEmail },
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'FXA-9519, incorrect email case error after changing primary email'
      );
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );
      const newEmail = testAccountTracker.generateEmail();
      const newPassword = testAccountTracker.generatePassword();

      await settings.goto();

      await changePrimaryEmail(settings, secondaryEmail, newEmail);
      const oldEmail = credentials.email;
      credentials.email = newEmail;

      await setNewPassword(
        settings,
        changePassword,
        credentials.password,
        newPassword
      );
      credentials.password = newPassword;

      await settings.signOut();

      // Sign in with new password
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(settings.settingsHeading).toBeVisible();
      // Change back the primary email again
      await settings.secondaryEmail.makePrimaryButton.click();
      credentials.email = oldEmail;
      await settings.signOut();

      // Login with primary email and new password
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(settings.primaryEmail.status).toHaveText(credentials.email);
    });

    test('can change primary email, delete account', async ({
      target,
      pages: {
        page,
        deleteAccount,
        secondaryEmail,
        settings,
        signinReact,
        signupReact,
      },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );
      const newEmail = testAccountTracker.generateEmail();

      await settings.goto();

      await changePrimaryEmail(settings, secondaryEmail, newEmail);
      credentials.email = newEmail;

      // Click delete account
      await settings.deleteAccountButton.click();
      await deleteAccount.checkAllBoxes();
      await deleteAccount.continueButton.click();

      // Enter the correct password
      await deleteAccount.passwordTextbox.fill(credentials.password);
      await deleteAccount.deleteButton.click();

      // Try creating a new account with the same secondary email as previous account and new password
      await signupReact.fillOutEmailForm(credentials.email);
      await signupReact.fillOutSignupForm(credentials.password);
      await signupReact.fillOutCodeForm(credentials.email);

      await expect(settings.alertBar).toHaveText(
        'Account confirmed successfully'
      );
      await expect(settings.primaryEmail.status).toHaveText(credentials.email);
    });

    test('removing secondary emails', async ({
      target,
      pages: { page, signinReact, settings, secondaryEmail },
      testAccountTracker,
    }) => {
      await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );
      const newEmail = testAccountTracker.generateEmail();

      await settings.goto();
      await settings.secondaryEmail.addButton.click();
      await secondaryEmail.addSecondaryEmail(newEmail);

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

  test.describe('change primary - unblock', () => {
    test.beforeEach(async () => {
      test.fixme(
        true,
        'FXA-9519, incorrect email case error after changing primary email'
      );
      test.slow();
    });

    test('change primary email, get blocked with invalid password, redirect enter password page', async ({
      target,
      pages: { page, settings, signinReact, secondaryEmail, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );
      const blockedEmail = testAccountTracker.generateBlockedEmail();
      const invalidPassword = testAccountTracker.generatePassword();

      await settings.goto();
      await changePrimaryEmail(settings, secondaryEmail, blockedEmail);
      credentials.email = blockedEmail;
      await settings.signOut();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(invalidPassword);

      //Verify sign in block header
      await expect(signinReact.signinUnblockFormHeading).toBeVisible();
      await expect(page.getByText(blockedEmail)).toBeVisible();

      //Unblock the email
      let unblockCode = await target.emailClient.getUnblockCode(blockedEmail);
      await signinReact.fillOutSigninUnblockForm(unblockCode);

      // Verify the incorrect password error
      await expect(page.getByText('Incorrect password')).toBeVisible();

      // Delete blocked account, required before teardown
      await signinReact.fillOutPasswordForm(credentials.password);
      unblockCode = await target.emailClient.getUnblockCode(blockedEmail);
      await signinReact.fillOutSigninUnblockForm(unblockCode);
      await settings.goto();
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('can change primary email, get blocked with valid password, redirect settings page', async ({
      target,
      pages: { page, settings, signinReact, secondaryEmail, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );
      const blockedEmail = testAccountTracker.generateBlockedEmail();

      await settings.goto();
      await changePrimaryEmail(settings, secondaryEmail, blockedEmail);
      credentials.email = blockedEmail;
      await settings.signOut();

      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      //Verify sign in block header
      await expect(signinReact.signinUnblockFormHeading).toBeVisible();
      await expect(page.getByText(blockedEmail)).toBeVisible();

      //Unblock the email
      const unblockCode = await target.emailClient.getUnblockCode(blockedEmail);
      await signinReact.fillOutSigninUnblockForm(unblockCode);

      await expect(settings.settingsHeading).toBeVisible();

      // Delete blocked account, required before teardown
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });
  });
});

async function signInAccount(
  target: BaseTarget,
  page: Page,
  settings: SettingsPage,
  signinReact: SigninReactPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUp();
  await page.goto(target.contentServerUrl);
  await signinReact.fillOutEmailFirstForm(credentials.email);
  await signinReact.fillOutPasswordForm(credentials.password);

  //Verify logged in on Settings page
  await expect(settings.settingsHeading).toBeVisible();

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
