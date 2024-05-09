/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, expect, test } from '../../lib/fixtures/standard';
import { SettingsPage } from '../../pages/settings';
import { DeleteAccountPage } from '../../pages/settings/deleteAccount';

test.describe('severity-1 #smoke', () => {
  test.beforeEach(({}, { project }) => {
    test.slow(project.name !== 'local', 'email delivery can be slow');
  });

  test.describe('OAuth signin', () => {
    test('verified', async ({
      pages: { signinReact, relier },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('verified using a cached login', async ({
      pages: { page, relier, signinReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
      // Attempt to sign back in
      await relier.clickEmailFirst();

      // Email is prefilled
      await expect(signinReact.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signinReact.signInButton.click();

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('verified using a cached expired login', async ({
      pages: { page, signinReact, relier },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();
      // Attempt to sign back in with cached user
      await relier.clickEmailFirst();

      await expect(signinReact.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signinReact.signInButton.click();
      await relier.signOut();

      // Clear cache and try to login
      await signinReact.clearCache();
      await relier.goto();
      await relier.clickEmailFirst();

      // User will have to re-enter login information
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('unverified, acts like signup', async ({
      pages: { confirmSignupCode, signinReact, relier },
      target,
      testAccountTracker,
    }) => {
      // Create unverified account via backend
      const credentials = await testAccountTracker.signUp({
        lang: 'en',
        preVerified: 'false',
      });

      await relier.goto();
      await relier.clickEmailFirst();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      // User is shown confirm email page
      await expect(confirmSignupCode.heading).toBeVisible();
      const code = await target.emailClient.getSigninTokenCode(
        credentials.email
      );
      await confirmSignupCode.fillOutCodeForm(code);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('unverified with a cached login', async ({
      page,
      pages: { confirmSignupCode, signinReact, signupReact, relier },
      target,
      testAccountTracker,
    }) => {
      // Create unverified account
      const { email, password } = testAccountTracker.generateAccountDetails();

      await relier.goto();
      await relier.clickEmailFirst();
      // Dont register account and attempt to login via relier
      await signupReact.fillOutEmailForm(email);
      await signupReact.fillOutSignupForm(password);
      // confirm siognup code is shown but skip it
      await expect(confirmSignupCode.heading).toBeVisible();

      await relier.goto();
      await relier.clickEmailFirst();

      // Cached user detected
      await expect(signinReact.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();

      await signinReact.signInButton.click();
      // Verify email and ensure user is redirected to relier
      await expect(confirmSignupCode.heading).toBeVisible();
      const code = await target.emailClient.getConfirmSignupCode(email);
      await confirmSignupCode.fillOutCodeForm(code);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('oauth endpoint chooses the right auth flows', async ({
      pages: { confirmSignupCode, signinReact, signupReact, relier },
      testAccountTracker,
    }) => {
      // Create unverified account
      const { email, password } = testAccountTracker.generateAccountDetails();

      await relier.goto();
      await relier.clickChooseFlow();
      // Dont register account and attempt to login via relier
      await signupReact.fillOutEmailForm(email);
      await signupReact.fillOutSignupForm(password);
      // confirm siognup code is shown but skip it
      await expect(confirmSignupCode.heading).toBeVisible();

      // go back to the OAuth app, the /oauth flow should
      // now suggest a cached login
      await relier.goto();
      await relier.clickChooseFlow();

      // User shown cached login page
      await expect(signinReact.cachedSigninHeading).toBeVisible();
    });

    test('verified, blocked', async ({
      page,
      pages: { signinReact, relier, settings, deleteAccount },
      target,
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUpBlocked();

      await relier.goto();
      await relier.clickEmailFirst();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(signinReact.signinUnblockFormHeading).toBeVisible();
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinReact.fillOutSigninUnblockForm(code);

      expect(await relier.isLoggedIn()).toBe(true);

      // Delete blocked account, required before teardown
      await settings.goto();
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });

    test('verified, blocked, incorrect password', async ({
      page,
      pages: { signinReact, relier, settings, deleteAccount },
      target,
      testAccountTracker,
    }) => {
      test.fixme(true, 'fxa-9697');
      const credentials = await testAccountTracker.signUpBlocked();

      await relier.goto();
      await relier.clickEmailFirst();
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm('wrong password');

      await expect(signinReact.signinUnblockFormHeading).toBeVisible();
      const code = await target.emailClient.getUnblockCode(credentials.email);
      await signinReact.fillOutSigninUnblockForm(code);

      // After filling in the unblock code, the user is prompted again to enter password
      await expect(page.getByText('Incorrect password')).toBeVisible();

      // Delete blocked account, required before teardown
      await signinReact.fillOutPasswordForm(credentials.password);

      await expect(signinReact.signinUnblockFormHeading).toBeVisible();
      const newCode = await target.emailClient.getUnblockCode(
        credentials.email
      );
      await signinReact.fillOutSigninUnblockForm(newCode);

      await relier.isLoggedIn();
      await settings.goto();
      await removeAccount(settings, deleteAccount, page, credentials.password);
    });
  });
});

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
