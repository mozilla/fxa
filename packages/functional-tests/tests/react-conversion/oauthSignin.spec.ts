/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test, expect, PASSWORD } from '../../lib/fixtures/standard';

const AGE_21 = '21';

test.describe('severity-1 #smoke', () => {
  test.describe('react OAuth signin', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'React signInRoutes not enabled'
      );
      test.slow();
    });

    test('verified account, no email confirmation required', async ({
      credentials,
      pages: { page, relier, signinReact },
    }) => {
      await relier.goto();
      await relier.clickEmailFirst();
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('verified account with cached login, no email confirmation required', async ({
      credentials,
      pages: { page, relier, signinReact },
    }) => {
      await relier.goto();
      await relier.clickEmailFirst();
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();

      // Attempt to sign back in
      await relier.clickEmailFirst();

      // wait for navigation
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await expect(signinReact.cachedSigninHeading).toBeVisible();
      // Email is prefilled
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signinReact.signInButton.click();

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('verified using a cached expired login', async ({
      credentials,
      pages: { page, relier, signinReact },
    }) => {
      await relier.goto();
      await relier.clickEmailFirst();
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();

      // Attempt to sign back in with cached user
      await relier.clickEmailFirst();

      await expect(signinReact.cachedSigninHeading).toBeVisible();
      // Email is prefilled
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signinReact.signInButton.click();
      await relier.signOut();

      // Clear cache and try to login
      await signinReact.clearCache();
      await relier.goto();
      await relier.clickEmailFirst();
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      // User will have to re-enter login information
      await signinReact.fillOutEmailFirstForm(credentials.email);
      await signinReact.fillOutPasswordForm(credentials.password);
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('unverified account, requires signup confirmation code', async ({
      emails,
      pages: { configPage, page, relier, signinReact, signupReact },
      target,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes !== true,
        'this test requires both react signup and react signin to be enabled'
      );

      const [email] = emails;
      await target.authClient.signUp(email, PASSWORD, {
        preVerified: 'false',
      });

      await relier.goto();
      await relier.clickEmailFirst();
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await signinReact.fillOutEmailFirstForm(email);
      await signinReact.fillOutPasswordForm(PASSWORD);

      // User is shown confirm code page
      await expect(page).toHaveURL(/confirm_signup_code/);
      await signupReact.resendCodeButton.click();
      await signupReact.fillOutCodeForm(email);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('unverified account with a cached login, requires signup confirmation', async ({
      emails,
      pages: { configPage, page, relier, signinReact, signupReact },
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes !== true,
        'this test requires both react signup and react signin to be enabled'
      );

      // Create unverified account
      const [email] = emails;

      await signupReact.goto();
      await signupReact.fillOutEmailForm(email);
      await signupReact.fillOutSignupForm(PASSWORD, '21');
      // confirm reached confirm_signup_code page but do not confirm
      await expect(page).toHaveURL(/confirm_signup_code/);

      await relier.goto();
      await relier.clickEmailFirst();
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      // Cached user detected
      await expect(signinReact.cachedSigninHeading).toBeVisible();
      // Email is prefilled
      await expect(page.getByText(email)).toBeVisible();
      await signinReact.signInButton.click();

      // Verify email and ensure user is redirected to relier
      await expect(page).toHaveURL(/confirm_signup_code/);
      await signupReact.fillOutCodeForm(email);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('oauth endpoint chooses the right auth flows', async ({
      emails,
      page,
      pages: { configPage, relier, signinReact, signupReact },
    }, { project }) => {
      test.slow(project.name !== 'local', 'email delivery can be slow');
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes !== true,
        'this test requires both react signup and react signin to be enabled'
      );
      const [email] = emails;

      await relier.goto();
      await relier.clickChooseFlow();

      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await signupReact.fillOutEmailForm(email);
      await signupReact.fillOutSignupForm(PASSWORD, AGE_21);
      await signupReact.fillOutCodeForm(email);

      // go back to the OAuth app, the /oauth flow should
      // now suggest a cached login
      await relier.goto();
      await relier.clickChooseFlow();

      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`,
        { waitUntil: 'load' }
      );

      await expect(signinReact.cachedSigninHeading).toBeVisible();
    });
  });
});
