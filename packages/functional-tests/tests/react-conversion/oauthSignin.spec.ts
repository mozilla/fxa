/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

const AGE_21 = '21';

test.describe('severity-1 #smoke', () => {
  test.describe('react OAuth signin', () => {
    test.beforeEach(async ({ pages: { configPage } }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signInRoutes !== true,
        'React signInRoutes not enabled'
      );
    });

    test('verified account, no email confirmation required', async ({
      pages: { page, relier, signin },
      testAccountTracker,
    }, { project }) => {
      test.fixme(
        project.name !== 'local',
        'Fix required as of 2024/04/26 (see FXA-9518).'
      );
      test.setTimeout(120000); // 2 minutes

      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('verified account with cached login, no email confirmation required', async ({
      pages: { page, relier, signin },
      testAccountTracker,
    }, { project }) => {
      test.fixme(
        project.name !== 'local',
        'Fix required as of 2024/04/26 (see FXA-9518).'
      );

      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
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

      await expect(signin.cachedSigninHeading).toBeVisible();
      // Email is prefilled
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signin.signInButton.click();

      await relier.isLoggedIn();
    });

    test('verified using a cached expired login', async ({
      pages: { page, relier, signin },
      testAccountTracker,
    }, { project }) => {
      test.fixme(
        project.name !== 'local',
        'Fix required as of 2024/04/26 (see FXA-9518).'
      );
      const credentials = await testAccountTracker.signUp();

      await relier.goto();
      await relier.clickEmailFirst();
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      expect(await relier.isLoggedIn()).toBe(true);

      await relier.signOut();

      // Attempt to sign back in with cached user
      await relier.clickEmailFirst();

      await expect(signin.cachedSigninHeading).toBeVisible();
      // Email is prefilled
      await expect(page.getByText(credentials.email)).toBeVisible();
      await signin.signInButton.click();
      await relier.signOut();

      // Clear cache and try to login
      await signin.clearCache();
      await relier.goto();
      await relier.clickEmailFirst();
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      // User will have to re-enter login information
      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);
      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('unverified account, requires signup confirmation code', async ({
      target,
      pages: { configPage, confirmSignupCode, page, relier, signin, signup },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes !== true,
        'this test requires both react signup and react signin to be enabled'
      );
      const credentials = await testAccountTracker.signUp({
        lang: 'en',
        preVerified: 'false',
      });

      await relier.goto();
      await relier.clickEmailFirst();
      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await signin.fillOutEmailFirstForm(credentials.email);
      await signin.fillOutPasswordForm(credentials.password);

      // User is shown confirm code page
      await expect(page).toHaveURL(/confirm_signup_code/);
      await confirmSignupCode.resendCodeButton.click();
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyShortCode(
        credentials.email
      );
      await confirmSignupCode.fillOutCodeForm(code);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('unverified account with a cached login, requires signup confirmation', async ({
      target,
      pages: { configPage, confirmSignupCode, page, relier, signin, signup },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes !== true,
        'this test requires both react signup and react signin to be enabled'
      );

      // Create unverified account
      const { email, password } = testAccountTracker.generateAccountDetails();

      await signup.goto();
      await signup.fillOutEmailForm(email);
      await signup.fillOutSignupForm(password, AGE_21);
      // confirm reached confirm_signup_code page but do not confirm
      await expect(page).toHaveURL(/confirm_signup_code/);

      await relier.goto();
      await relier.clickEmailFirst();
      await expect(page).toHaveURL(/oauth\/signin/);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      // Cached user detected
      await expect(page).toHaveURL(/oauth\/signin/);
      await expect(page.locator('#root')).toBeEnabled();
      await expect(signin.cachedSigninHeading).toBeVisible();
      // Email is prefilled
      await expect(page.getByText(email)).toBeVisible();
      await signin.signInButton.click();

      // Verify email and ensure user is redirected to relier
      await expect(page).toHaveURL(/confirm_signup_code/);
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);

      expect(await relier.isLoggedIn()).toBe(true);
    });

    test('oauth endpoint chooses the right auth flows', async ({
      target,
      page,
      pages: { configPage, confirmSignupCode, relier, signin, signup },
      testAccountTracker,
    }) => {
      const config = await configPage.getConfig();
      test.skip(
        config.showReactApp.signUpRoutes !== true,
        'this test requires both react signup and react signin to be enabled'
      );
      const { email, password } = testAccountTracker.generateAccountDetails();

      await relier.goto();
      await relier.clickChooseFlow();

      await expect(page).toHaveURL(/oauth\//);

      // reload page with React experiment params
      await page.goto(
        `${page.url()}&forceExperiment=generalizedReactApp&forceExperimentGroup=react`
      );

      await signup.fillOutEmailForm(email);
      await expect(signup.signupFormHeading).toBeVisible();
      await signup.fillOutSignupForm(password, AGE_21);
      await expect(page).toHaveURL(/confirm_signup_code/);
      const code = await target.emailClient.getVerifyShortCode(email);
      await confirmSignupCode.fillOutCodeForm(code);

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

      await expect(signin.cachedSigninHeading).toBeVisible();
    });
  });
});
