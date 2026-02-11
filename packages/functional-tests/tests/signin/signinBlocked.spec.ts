/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getTotpCode } from '../../lib/totp';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SettingsPage } from '../../pages/settings';
import { DeleteAccountPage } from '../../pages/settings/deleteAccount';
import { SigninPage } from '../../pages/signin';
import { SigninUnblockPage } from '../../pages/signinUnblock';

test.describe('severity-2 #smoke', () => {
  test.describe('signin blocked', () => {
    test('valid code entered', async ({
      target,
      page,
      pages: { deleteAccount, settings, signin, signinUnblock },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked();
      await signInBlockedAccount(
        target,
        page,
        signin,
        signinUnblock,
        credentials
      );

      //Unblock the email
      const unblockCode = await target.emailClient.getUnblockCode(
        credentials.email
      );
      await signinUnblock.fillOutCodeForm(unblockCode);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('email bounced', async ({
      target,
      page,
      pages: {
        deleteAccount,
        secondaryEmail,
        settings,
        signin,
        signup,
        signinUnblock,
      },
      testAccountTracker,
    }) => {
      // We might have to wait a bit for the bounce to get picked up. So
      // we will flag this as a slow test. If on local, we manually create
      // a hard bounce record. On local, this will insert a new bounce
      // record. On stage prod, this will silently fail, and we will rely
      // on the email to actually bounce.
      if (target.name === 'local') {
        await target.emailClient.createBounce('bounced@mozilla.com');
      } else {
        test.slow();
      }

      // Here, we check that an email alias ie `bounced+123` will trip a bounce
      // check when the bounce record is based on the non-aliased email form.
      const credentials =
        testAccountTracker.generateBouncedAliasAccountDetails('mozilla.com');

      // Start the sign up process
      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signup.fillOutSignupForm(credentials.password);

      // The service that polls for bounces does so on approximately a 5 second interval.
      // Add a little timeout to make sure that catches the bounce, and the polling
      // mechanism can have a chance to redirect.
      if (target.name === 'local') {
        await page.waitForTimeout(1000);
      } else {
        await page.waitForTimeout(9000);
      }

      // This indicates the email bounced. The front end starts polling for bounces,
      // it should etecte one, and then kick the user back to the sign in page.
      await expect(signin.emailReturnedWarning).toBeVisible();
    });

    test('incorrect code entered', async ({
      target,
      page,
      pages: { signin, signinUnblock, settings, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked();
      await signInBlockedAccount(
        target,
        page,
        signin,
        signinUnblock,
        credentials
      );

      await signinUnblock.fillOutCodeForm('invalidd');

      //Verify tooltip error
      await expect(page.getByText('Invalid authorization code')).toBeVisible();

      //Unblock the email
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinUnblock.fillOutCodeForm(code);

      // for react test to pass:
      // await signin.fillOutPasswordForm(credentials.password);
      // await expect(page).toHaveURL(/signin_unblock/);
      // const newCode = await target.emailClient.getUnblockCode(credentials.email);
      // await signinUnblock.fillOutCodeForm(newCode);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('resend', async ({
      target,
      page,
      pages: { signin, settings, signinUnblock, deleteAccount },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked();
      await signInBlockedAccount(
        target,
        page,
        signin,
        signinUnblock,
        credentials
      );

      //Click resend code button
      await signinUnblock.resendCodeButton.click();

      //Verify success message
      await expect(
        page.getByText(/A new code was sent to your email./)
      ).toBeVisible();

      //Unblock the email
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinUnblock.fillOutCodeForm(code);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('unverified', async ({
      target,
      page,
      pages: {
        signin,
        confirmSignupCode,
        settings,
        deleteAccount,
        signinUnblock,
      },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked({
        lang: 'en',
        preVerified: 'false',
      });

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      //Verify sign in block header
      await expect(page).toHaveURL(/signin_unblock/);

      const unblockCode = await target.emailClient.getUnblockCode(
        credentials.email
      );
      await signinUnblock.fillOutCodeForm(unblockCode);

      //Verify confirm code header
      await expect(page).toHaveURL(/confirm_signup_code/);

      const confirmationCode = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await confirmSignupCode.fillOutCodeForm(confirmationCode);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('with primary email changed', async ({
      target,
      page,
      pages: { deleteAccount, secondaryEmail, settings, signin, signinUnblock },
      testAccountTracker,
    }) => {
      const blockedEmail = testAccountTracker.generateBlockedEmail();
      const credentials = await testAccountTracker.signUp();
      await signInAccount(target, page, settings, signin, credentials);

      await settings.goto();
      await settings.secondaryEmail.addButton.click();
      await settings.confirmMfaGuard(credentials.email);
      await secondaryEmail.fillOutEmail(blockedEmail);
      const verifyCode: string =
        await target.emailClient.getVerifySecondaryCode(blockedEmail);
      await secondaryEmail.fillOutVerificationCode(verifyCode);
      await settings.secondaryEmail.makePrimaryButton.click();
      credentials.email = blockedEmail;
      await settings.signOut();

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(blockedEmail);
      await signin.fillOutPasswordForm(credentials.password);

      //Verify sign in block header
      await expect(page).toHaveURL(/signin_unblock/);
      await expect(page.getByText(credentials.email)).toBeVisible();

      //Unblock the email
      const unblockCode = await target.emailClient.getUnblockCode(blockedEmail);
      await signinUnblock.fillOutCodeForm(unblockCode);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      // Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('sync with 2fa', async ({
      target,
      page,
      pages: {
        deleteAccount,
        settings,
        signin,
        signinUnblock,
        signinTotpCode,
        totp,
        confirmSignupCode,
      },
      testAccountTracker,
    }) => {
      test.skip(true, 'TODO: FXA-12084');

      const credentials = await testAccountTracker.signUpSync({
        lang: 'en',
        preVerified: 'false',
      });

      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      //Verify confirm code header
      await expect(page).toHaveURL(/confirm_signup_code/);

      const confirmationCode = await target.emailClient.getVerifyLoginCode(
        credentials.email
      );
      await confirmSignupCode.fillOutCodeForm(confirmationCode);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      await settings.totp.addButton.click();
      await settings.confirmMfaGuard(credentials.email);

      const { secret } =
        await totp.setUpTwoStepAuthWithQrAndBackupCodesChoice(credentials);

      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication has been enabled'
      );

      await page.waitForURL(/settings/);
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.alertBar).toHaveText(
        'Two-step authentication has been enabled'
      );
      await expect(settings.totp.status).toHaveText('Enabled');
      await settings.signOut();

      // Create blocked sign in
      await page.goto(target.contentServerUrl);
      await signin.fillOutEmailFirstForm(credentials.email);

      await signin.passwordTextbox.fill(credentials.password + 1);
      await signin.signInButton.click();

      await signin.passwordTextbox.fill(credentials.password + 2);
      await signin.signInButton.click();

      await signin.passwordTextbox.fill(credentials.password + 3);
      await signin.signInButton.click();

      await signin.passwordTextbox.fill(credentials.password + 4);
      await signin.signInButton.click();

      await signin.passwordTextbox.fill(credentials.password + 5);
      await signin.signInButton.click();

      //Verify sign in block header
      await expect(page).toHaveURL(/signin_unblock/);
      const unblockCode = await target.emailClient.getUnblockCode(
        credentials.email
      );
      await signinUnblock.fillOutCodeForm(unblockCode);

      // Enter the correct password
      await expect(page).toHaveURL(/signin/);
      await signin.fillOutPasswordForm(credentials.password);

      // Now should go to totp code
      await expect(page).toHaveURL(/signin_totp_code/);
      const code = await getTotpCode(secret);
      await signinTotpCode.fillOutCodeForm(code);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      // Delete blocked account, the fixture teardown doesn't work in this case
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });
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

async function signInBlockedAccount(
  target: BaseTarget,
  page: Page,
  signin: SigninPage,
  signinUnblock: SigninUnblockPage,
  credentials: Credentials
): Promise<void> {
  await page.goto(target.contentServerUrl);
  await signin.fillOutEmailFirstForm(credentials.email);
  await signin.fillOutPasswordForm(credentials.password);

  await page.waitForURL(/signin_unblock/);

  //Verify sign in block header
  await expect(page).toHaveURL(/signin_unblock/);
  await expect(signinUnblock.heading).toBeVisible();
  await expect(page.getByText(credentials.email)).toBeVisible();
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
