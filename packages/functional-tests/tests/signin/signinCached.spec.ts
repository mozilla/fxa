/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TestAccountTracker } from '../../lib/testAccountTracker';
import { Page, expect, test } from '../../lib/fixtures/standard';
import { BaseTarget, Credentials } from '../../lib/targets/base';
import { SigninReactPage } from '../../pages/signinReact';
import { SettingsPage } from '../../pages/settings';
import {
  denormalizeStoredEmail,
  getAccountFromFromLocalStorage,
} from '../../lib/local-storage';

test.describe('severity-2 #smoke', () => {
  test.beforeEach(async () => {
    test.slow(); //This test has steps for email rendering that runs slow on stage
  });

  test.describe('signin cached', () => {
    test('sign in twice, on second attempt email will be cached', async ({
      target,
      syncBrowserPages: { page, settings, signinReact },
      testAccountTracker,
    }) => {
      const { email } = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );

      await page.goto(target.contentServerUrl);

      await expect(signinReact.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();

      await signinReact.signInButton.click();

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('sign in with incorrect email case before normalization fix, on second attempt canonical form is used', async ({
      target,
      syncBrowserPages: { page, settings, signinReact },
      testAccountTracker,
    }) => {
      const { email } = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );

      await page.goto(target.contentServerUrl);
      await denormalizeStoredEmail(email, page);
      await page.goto(target.contentServerUrl);

      await expect(signinReact.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();

      await signinReact.signInButton.click();

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();

      //Verify email is normalized
      await expect(settings.primaryEmail.status).toHaveText(email);
    });

    test('expired cached credentials', async ({
      target,
      syncBrowserPages: { page, settings, signinReact },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );
      test.fixme(true, 'FXA-9519 not finding the session expired banner');
      await page.goto(target.contentServerUrl);
      const account = await getAccountFromFromLocalStorage(
        credentials.email,
        page
      );
      await target.authClient.sessionDestroy(account?.sessionToken);

      //Check prefilled email
      await expect(signinReact.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      await signinReact.signInButton.click();

      await expect(page.getByText(/Session expired/)).toBeVisible();
      await expect(signinReact.passwordFormHeading).toBeVisible();

      await signinReact.fillOutPasswordForm(credentials.password);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('cached credentials that expire while on page', async ({
      target,
      syncBrowserPages: { page, settings, signinReact },
      testAccountTracker,
    }) => {
      const credentials = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );

      await page.goto(target.contentServerUrl);

      //Check prefilled email
      await expect(signinReact.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();

      const account = await getAccountFromFromLocalStorage(
        credentials.email,
        page
      );
      await target.authClient.sessionDestroy(account?.sessionToken);
      await signinReact.signInButton.click();

      await expect(signinReact.sessionExpiredError).toBeVisible();

      await signinReact.fillOutPasswordForm(credentials.password);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('unverified cached signin redirects to confirm email', async ({
      target,
      syncBrowserPages: { confirmSignupCode, page, settings, signinReact },
      testAccountTracker,
    }) => {
      const credentials = await testAccountTracker.signUp({
        lang: 'en',
        preVerified: 'false',
      });

      // email first sign in goes to confirm sign up code
      await page.goto(target.contentServerUrl);
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      await expect(confirmSignupCode.heading).toBeVisible();

      // cached email goes to confirm sign up code
      await page.goto(target.contentServerUrl);
      await expect(signinReact.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signinReact.signInButton.click();
      await expect(confirmSignupCode.heading).toBeVisible();
      const code = await target.emailClient.getSigninTokenCode(
        credentials.email
      );
      await confirmSignupCode.fillOutCodeForm(code);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
    });

    test('sign in once, use a different account', async ({
      target,
      syncBrowserPages: { page, settings, signinReact },
      testAccountTracker,
    }) => {
      const initialCredentials = await signInAccount(
        target,
        page,
        settings,
        signinReact,
        testAccountTracker
      );
      const secondCredentials = await testAccountTracker.signUp();

      await page.goto(target.contentServerUrl);

      //Check prefilled email
      await expect(signinReact.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(initialCredentials.email)).toBeVisible();

      await signinReact.useDifferentAccountLink.click();

      await signinReact.fillOutEmailFirstForm(secondCredentials.email);
      await signinReact.fillOutPasswordForm(secondCredentials.password);

      //Verify logged in on Settings page
      await expect(settings.settingsHeading).toBeVisible();
      await expect(settings.primaryEmail.status).toHaveText(
        secondCredentials.email
      );

      // testing to make sure cached signin comes back after a refresh
      await page.goto(target.contentServerUrl);

      //Check prefilled email
      await expect(signinReact.cachedSigninHeading).toBeVisible();
      await expect(page.getByText(secondCredentials.email)).toBeVisible();
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
