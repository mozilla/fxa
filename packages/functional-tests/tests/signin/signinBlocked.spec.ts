/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TestAccountTracker } from '../../lib/testAccountTracker';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { DeleteAccountPage } from '../../pages/settings/deleteAccount';
import { SigninReactPage } from '../../pages/signinReact';

test.describe('severity-2 #smoke', () => {
  test.describe('signin blocked', () => {
    test.beforeEach(() => {
      test.slow(); //This test has steps for email rendering that runs slow on stage
    });

    test('valid code entered', async ({
      target,
      page,
      pages: { signinReact, settings, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await signInBlockedAccount(
        target,
        page,
        signinReact,
        testAccountTracker
      );

      const code = await target.emailClient.getUnblockCode(credentials.email);

      await signinReact.fillOutSigninUnblockForm(code);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('incorrect code entered', async ({
      target,
      page,
      pages: { settings, signinReact, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await signInBlockedAccount(
        target,
        page,
        signinReact,
        testAccountTracker
      );

      await signinReact.fillOutSigninUnblockForm('incorrect');

      //Verify tooltip error
      await expect(page.getByText('Invalid authorization code')).toBeVisible();

      const code = await target.emailClient.getUnblockCode(credentials.email);

      //Unblock the email
      await signinReact.fillOutSigninUnblockForm(code);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('resend', async ({
      target,
      page,
      pages: { signinReact, settings, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await signInBlockedAccount(
        target,
        page,
        signinReact,
        testAccountTracker
      );
      await signinReact.signinUnblockResendCodeButton.click();
      await expect(
        signinReact.signinUnblockCodeResentSuccessMessage
      ).toHaveText(/Email re-?sent/);
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinReact.fillOutSigninUnblockForm(code);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('unverified', async ({
      target,
      page,
      pages: { confirmSignupCode, deleteAccount, settings, signinReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked({
        lang: 'en',
        preVerified: 'false',
      });

      await page.goto(target.contentServerUrl);
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      //Verify sign in block header
      await expect(signinReact.signinUnblockFormHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      const unblockCode = await target.emailClient.getUnblockCode(
        credentials.email
      );
      await signinReact.fillOutSigninUnblockForm(unblockCode);

      await expect(confirmSignupCode.heading).toBeVisible();

      const signupCode = await target.emailClient.getSigninTokenCode(
        credentials.email
      );
      await confirmSignupCode.fillOutCodeForm(signupCode);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('with primary email changed', async ({
      target,
      page,
      pages: { deleteAccount, secondaryEmail, settings, signinReact },
      testAccountTracker,
    }) => {
      test.fixme(
        true,
        'FXA-9519, incorrect email case error on submitting unblock code'
      );
      const blockedEmail = testAccountTracker.generateBlockedEmail();
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );

      await settings.secondaryEmail.addButton.click();
      await secondaryEmail.addSecondaryEmail(blockedEmail.toLowerCase());
      await settings.secondaryEmail.makePrimaryButton.click();
      await settings.signOut();

      await signinReact.fillOutEmailFirstForm(blockedEmail);
      await signinReact.fillOutPasswordForm(credentials.password);

      //Verify sign in block header
      await expect(signinReact.signinUnblockFormHeading).toBeVisible();
      await expect(page.getByText(blockedEmail)).toBeVisible();

      //Unblock the email
      const unblockCode = await target.emailClient.getUnblockCode(blockedEmail);
      await signinReact.fillOutSigninUnblockForm(unblockCode);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      credentials.email = blockedEmail;
      //Delete blocked account, the fixture teardown doesn't work in this case
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

async function signInBlockedAccount(
  target: BaseTarget,
  page: Page,
  signinReact: SigninReactPage,
  testAccountTracker: TestAccountTracker
): Promise<Credentials> {
  const credentials = await testAccountTracker.signUpBlocked();
  await page.goto(target.contentServerUrl);
  await signinReact.fillOutEmailFirstForm(credentials.email);
  await signinReact.fillOutPasswordForm(credentials.password);

  //Verify sign in unblock header
  await expect(signinReact.signinUnblockFormHeading).toBeVisible();
  await expect(page.getByText(credentials.email)).toBeVisible();

  return credentials;
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
