/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { getReactFeatureFlagUrl } from '../../lib/react-flag';

test.describe('force auth react', () => {
  test.beforeEach(async ({ pages: { configPage } }) => {
    // Ensure that the feature flag is enabled
    const config = await configPage.getConfig();
    test.skip(config.showReactApp.signInRoutes !== true);
  });

  test('displays signin with registered email', async ({
    page,
    target,
    pages: { signin },
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUp();

    const url = getReactFeatureFlagUrl(
      target,
      '/force_auth',
      `email=${encodeURIComponent(
        credentials.email
      )}&context=fx_desktop_v3&entrypoint=fxa_app_menu_reverify&action=email&service=sync`
    );
    await page.goto(url);

    await expect(signin.passwordFormHeading).toBeVisible();
    await expect(page.getByText(credentials.email)).toBeVisible();
    await expect(signin.signInButton).toBeVisible();
  });

  test('redirects to signup with unregistered email', async ({
    page,
    target,
    pages: { configPage, signup },
  }) => {
    const config = await configPage.getConfig();
    test.skip(config.showReactApp.signUpRoutes !== true);

    const unregisteredEmail = `rando${Math.random()}@example.com`;
    const url = getReactFeatureFlagUrl(
      target,
      '/force_auth',
      `email=${encodeURIComponent(
        unregisteredEmail
      )}&context=fx_desktop_v3&entrypoint=fxa_app_menu_reverify&action=email&service=sync`
    );
    await page.goto(url);

    await expect(signup.signupFormHeading).toBeVisible();
    await expect(page.getByText(unregisteredEmail)).toBeVisible();
    await expect(signup.createAccountButton).toBeVisible();
  });
});
